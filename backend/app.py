from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from langchain_core.messages import AIMessage, HumanMessage
from langchain_community.vectorstores.qdrant import Qdrant
import qdrant_client
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
import os
from openai import OpenAI
from langchain.chains.combine_documents import create_stuff_documents_chain
from Template.promptAI import AI_prompt
import tempfile
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)

# Allow CORS for development purposes
CORS(app, origins=["*"])  # Change "*" to specific origins for production

collection_name = os.getenv("QDRANT_COLLECTION_NAME")

# Initialize variables
chat_history = []
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint to verify server is running."""
    return jsonify({"status": "OK"})


def get_vector_store():
    client = qdrant_client.QdrantClient(
        url=os.getenv("QDRANT_HOST"),
        api_key=os.getenv("QDRANT_API_KEY"),
    )
    embeddings = OpenAIEmbeddings()
    vector_store = Qdrant(
        client=client,
        collection_name=collection_name,
        embeddings=embeddings,
    )
    return vector_store


vector_store = get_vector_store()


def get_context_retriever_chain(vector_store=vector_store):
    llm = ChatOpenAI()
    retriever = vector_store.as_retriever()
    prompt = ChatPromptTemplate.from_messages([
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}"),
        ("user", "Generate a search query based on the conversation."),
    ])
    retriever_chain = create_history_aware_retriever(llm, retriever, prompt)
    return retriever_chain


def get_conversational_rag_chain(retriever_chain):
    llm = ChatOpenAI()
    prompt = ChatPromptTemplate.from_messages([
        ("system", AI_prompt),
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}"),
    ])
    stuff_documents_chain = create_stuff_documents_chain(llm, prompt)
    return create_retrieval_chain(retriever_chain, stuff_documents_chain)


def speech_to_text(audio_data_path):
    """Transcribe audio file to text using OpenAI Whisper."""
    try:
        with open(audio_data_path, "rb") as audio_file:
            transcript = openai_client.audio.transcriptions.create(
                model="whisper-1", file=audio_file
            )
        logging.debug(f"Transcription response: {transcript}")

        # Check response structure
        if hasattr(transcript, 'text'):
            return {"text": transcript.text}
        elif isinstance(transcript, dict) and "text" in transcript:
            return {"text": transcript["text"]}
        else:
            raise ValueError("Unexpected response structure")
    except Exception as e:
        logging.error(f"Error during transcription: {e}")
        raise ValueError(f"Failed to transcribe audio: {e}")


@app.route("/transcribe", methods=["POST"])
def transcribe():
    """Endpoint to transcribe audio files."""
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]
    supported_formats = ['flac', 'm4a', 'mp3', 'mp4', 'mpeg', 'mpga', 'oga', 'ogg', 'wav', 'webm']
    file_extension = audio_file.filename.split('.')[-1].lower()

    if file_extension not in supported_formats:
        return jsonify({"error": f"Unsupported file format: {file_extension}. Supported formats: {supported_formats}"}), 400

    # Save the file temporarily
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_extension}") as temp_audio:
            audio_file.save(temp_audio.name)
            temp_audio_path = temp_audio.name

        # Transcribe the audio
        transcript_result = speech_to_text(temp_audio_path)

    except Exception as e:
        logging.error(f"Error processing audio file: {e}")
        return jsonify({"error": f"Failed to process audio file: {e}"}), 500

    finally:
        # Ensure temporary file is removed
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)

    return jsonify({"transcript": transcript_result.get("text", "")})


@app.route('/generate', methods=['POST'])
def generate():
    """Endpoint to generate chatbot response."""
    user_input = request.json.get('input')
    if not user_input:
        return jsonify({"error": "No input provided"}), 400

    chat_history.append(HumanMessage(content=user_input))

    retriever_chain = get_context_retriever_chain(vector_store)
    conversation_rag_chain = get_conversational_rag_chain(retriever_chain)

    try:
        response_content = conversation_rag_chain.invoke({
            "chat_history": chat_history, "input": user_input
        }).get("answer", "")
        chat_history.append(AIMessage(content=response_content))
    except Exception as e:
        logging.error(f"Error generating response: {e}")
        return jsonify({"error": "Failed to generate response"}), 500

    return jsonify({"response": response_content})


if __name__ == '__main__':
    app.run(debug=False)