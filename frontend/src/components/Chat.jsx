import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ChatInputWidget from "./ChatInputWidget";
import useCameraStore from "./store/useCameraStore";
import useAvatarStore from "./store/useAvatarStore"; // Zustand store for avatar
import "./Chat.css";

const Chat = () => {
  const [chats, setChats] = useState([
    { msg: "Hi there! How can I assist you today?", who: "bot" },
  ]);
  const [loading, setLoading] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);

  const chatContentRef = useRef(null);
  const setChatActivity = useCameraStore((state) => state.setChatActivity);
  const setAudioVisemes = useAvatarStore((state) => state.setAudioVisemes); // Update avatar state

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
    setIsChatVisible(true);
    setChatActivity(true);

    if (data.text) {
      setChats((prevChats) => [...prevChats, { msg: data.text, who: "me" }]);
      setLoading(true);

      try {
        const response = await axios.post("http://127.0.0.1:5000/generate", {
          input: data.text,
        });
        const { audio, visemes } = response.data;

        setChats((prevChats) => [
          ...prevChats,
          { msg: response.data.response, who: "bot" },
        ]);

        // Update avatar state
        setAudioVisemes(audio, visemes);
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
      setLoading(true);

      try {
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
        setChats((prevChats) => [...prevChats, { msg: transcript, who: "me" }]);

        const generateResponse = await axios.post(
          "http://127.0.0.1:5000/generate",
          {
            input: transcript,
          }
        );

        const { audio, visemes } = generateResponse.data;

        setChats((prevChats) => [
          ...prevChats,
          { msg: generateResponse.data.response, who: "bot" },
        ]);

        // Update avatar state
        setAudioVisemes(audio, visemes);
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

  const handleUserActivity = () => {
    setChatActivity(true);
    setIsChatVisible(true);
  };

  const toggleChatVisibility = () => {
    setChatActivity(!isChatVisible);
    setIsChatVisible(!isChatVisible);
  };

  return (
    <>
      {isChatVisible && (
        <div className="chat-content" ref={chatContentRef}>
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
      )}
      <div className="chat-footer">
        <ChatInputWidget
          onSendMessage={handleNewMessage}
          onUserActivity={handleUserActivity}
        />
        <button className="toggle-button" onClick={toggleChatVisibility}>
          {isChatVisible ? "-" : "+"}
        </button>
      </div>
    </>
  );
};

export default Chat;








