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
from langchain.chains.combine_documents import create_stuff_documents_chain
from Template.promptAI import AI_prompt
import azure.cognitiveservices.speech as speechsdk
import base64
import requests

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])  # Allow CORS for specific origin

# Azure Speech SDK Configuration
speech_key = os.getenv("SPEECH_KEY")
service_region = os.getenv("SPEECH_REGION")

# Initialize variables
collection_name = os.getenv("QDRANT_COLLECTION_NAME")
chat_history = []

# Function to initialize vector store
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

# Function to get context retriever chain
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

# Function to get conversational RAG chain
def get_conversational_rag_chain(retriever_chain):
    llm = ChatOpenAI()
    prompt = ChatPromptTemplate.from_messages([
        ("system", AI_prompt),
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}"),
    ])
    stuff_documents_chain = create_stuff_documents_chain(llm, prompt)
    return create_retrieval_chain(retriever_chain, stuff_documents_chain)

# RAG endpoint
@app.route('/generate', methods=['POST'])
def generate():
    user_input = request.json.get('input')  # Ensure key matches React component
    chat_history.append(HumanMessage(content=user_input))

    retriever_chain = get_context_retriever_chain(vector_store)
    conversation_rag_chain = get_conversational_rag_chain(retriever_chain)
    
    # Use invoke instead of stream
    response_content = conversation_rag_chain.invoke({
        "chat_history": chat_history, "input": user_input
    }).get("answer", "")

    chat_history.append(AIMessage(content=response_content))
    return jsonify({"response": response_content})

# TTS endpoint
@app.route('/synthesize', methods=['POST'])
def synthesize():
    # Retrieve input data from JSON payload
    generate_response = requests.post(
        'http://localhost:5000/generate', 
        json={"input": request.json.get("input")}
    )
    
    if generate_response.status_code != 200:
        return jsonify({"error": "Failed to generate text"}), 500

    text = generate_response.json().get("response", "I'm excited to try text-to-speech.")

    # Configure the Speech SDK
    speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=service_region)
    speech_config.speech_synthesis_voice_name = "en-US-AriaNeural"  # Set a default neural voice

    # Create a synthesizer
    synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=None)

    # Store viseme data
    visemes = []

    def viseme_callback(evt):
        visemes.append([evt.audio_offset / 10000, evt.viseme_id])

    # Attach viseme callback
    synthesizer.viseme_received.connect(viseme_callback)

    # Synthesize text to speech
    result = synthesizer.speak_text_async(text).get()

    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        # Get audio data and encode it in base64
        audio_data = base64.b64encode(result.audio_data).decode("utf-8")
        return jsonify({
            "audio": audio_data,  # Base64-encoded audio data
            "visemes": visemes    # List of viseme data
        }), 200
    else:
        return jsonify({"error": "Synthesis failed"}), 500

if __name__ == '__main__':
    app.run(debug=True)
