import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ChatInputWidget from "./ChatInputWidget";
import "./Chat.css";

const Chat = () => {
  const [chats, setChats] = useState([
    { msg: "Hi there! How can I assist you today?", who: "bot" },
  ]);
  const [loading, setLoading] = useState(false); // For both transcription and response
  const [isChatVisible, setIsChatVisible] = useState(false);

  const chatContentRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTo({
        top: chatContentRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats, loading]);

  const handleNewMessage = async (data) => {
    if (data.text) {
      // Handle text input directly
      setChats((prevChats) => [...prevChats, { msg: data.text, who: "me" }]);
      setLoading(true);

      try {
        const response = await axios.post("http://127.0.0.1:5000/generate", {
          input: data.text,
        });
        setChats((prevChats) => [
          ...prevChats,
          { msg: response.data.response, who: "bot" },
        ]);
      } catch (error) {
        console.error("Error fetching response from /generate:", error);
        setChats((prevChats) => [
          ...prevChats,
          {
            msg: "Sorry, I couldn't process your request. Please try again.",
            who: "bot",
          },
        ]);
      } finally {
        setLoading(false);
      }
    } else if (data.audioFile) {
      // Handle audio input
      setLoading(true); // Display Lottie animation while transcribing

      try {
        // Send audio to /transcribe endpoint
        const formData = new FormData();
        const audioBlob = new Blob([new Uint8Array(data.audioFile)], {
          type: "audio/wav",
        });
        formData.append("audio", audioBlob, "recording.wav");

        const transcriptionResponse = await axios.post(
          "http://127.0.0.1:5000/transcribe",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        const transcript = transcriptionResponse.data.transcript;

        // Display transcript as user's message
        setChats((prevChats) => [...prevChats, { msg: transcript, who: "me" }]);

        // Send transcript to /generate endpoint
        const generateResponse = await axios.post(
          "http://127.0.0.1:5000/generate",
          {
            input: transcript,
          }
        );

        setChats((prevChats) => [
          ...prevChats,
          { msg: generateResponse.data.response, who: "bot" },
        ]);
      } catch (error) {
        console.error("Error processing audio input:", error);
        setChats((prevChats) => [
          ...prevChats,
          {
            msg: "Sorry, I couldn't process your audio input. Please try again.",
            who: "bot",
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleChatVisibility = () => {
    setIsChatVisible(!isChatVisible);
  };

  return (
    <div className="chat">
      <div
        className={`chat-content ${isChatVisible ? "visible" : "hidden"}`}
        ref={chatContentRef}
      >
        {chats.map((chat, index) => (
          <div key={index} className={`chat-message ${chat.who}`}>
            {chat.who === "bot" && (
              <figure className="avatar">
                <img src="https://i.ibb.co/NSVPqpZ/avatar.png" alt="avatar" />
              </figure>
            )}
            <div className="message-text">{chat.msg}</div>
          </div>
        ))}

        {loading && (
          <div className="chat-message loading">
            <figure className="avatar">
              <img src="https://i.ibb.co/NSVPqpZ/avatar.png" alt="avatar" />
            </figure>
            <div
              style={{ padding: "5px", display: "flex", alignItems: "center" }}
            >
              <lottie-player
                src="https://lottie.host/d354a5c5-9a8b-456f-a7ed-e88fd09ce683/vYJTHMVdFJ.json"
                style={{ width: "60px", height: "60px" }}
                loop
                autoplay
                speed="1"
                direction="1"
                mode="normal"
              ></lottie-player>
            </div>
          </div>
        )}
      </div>
      <div className="chat-footer">
        <ChatInputWidget onSendMessage={handleNewMessage} />
      </div>
      <button className="toggle-button" onClick={toggleChatVisibility}>
        {isChatVisible ? "˅" : "^"}
      </button>
    </div>
  );
};

export default Chat;








