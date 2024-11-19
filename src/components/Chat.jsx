import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ChatInputWidget from "./ChatInputWidget";
import "./Chat.css";

const Chat = () => {
  const [chats, setChats] = useState([
    { msg: "Hi there! How can I assist you today?", who: "bot" },
  ]);
  const [loading, setLoading] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(true);

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
      // Add user's message to the chat
      setChats((prevChats) => [...prevChats, { msg: data.text, who: "me" }]);
      setLoading(true);

      try {
        // Send user input to backend API
        const response = await axios.post("http://localhost:5000/api/chat", {
          userInput: data.text,
        });

        // Add bot's response to the chat
        setChats((prevChats) => [
          ...prevChats,
          { msg: response.data.response, who: "bot" },
        ]);
      } catch (error) {
        console.error("Error fetching response from API:", error);
        setChats((prevChats) => [
          ...prevChats,
          { msg: "Sorry, I couldn't process your request. Please try again.", who: "bot" },
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
          <div
            key={index}
            className={`chat-message ${chat.who}`}
          >
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
            <span>🫧...typing</span>
          </div>
        )}
      </div>
      <div className="chat-footer">
        <ChatInputWidget onSendMessage={handleNewMessage} />
        <button className="toggle-button" onClick={toggleChatVisibility}>
          {isChatVisible ? "˅" : "^"}
        </button>
      </div>
    </div>
  );
};

export default Chat;








