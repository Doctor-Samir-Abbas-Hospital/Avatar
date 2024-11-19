import React, { useState, useEffect, useRef } from "react";
import ChatInputWidget from "./ChatInputWidget";
import "./Chat.css";

const Chat = () => {
  const [chats, setChats] = useState([
    { msg: "Hi there! How can I assist you today?", who: "bot", exct: "0" },
  ]);
  const [loading, setLoading] = useState(false);

  const chatContentRef = useRef(null); // Reference for the chat content

  const scrollToBottom = () => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTo({
        top: chatContentRef.current.scrollHeight,
        behavior: "smooth", // Enables smooth scrolling
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats, loading]);

  const handleNewMessage = (data) => {
    if (data.text) {
      setChats((prevChats) => [...prevChats, { msg: data.text, who: "me" }]);

      // Simulate bot response
      setLoading(true);
      setTimeout(() => {
        const botMsg = `Here's the response to: "${data.text}"`;
        const responseTime = (Math.random() * 2 + 1).toFixed(2);
        setChats((prevChats) => [
          ...prevChats,
          { msg: botMsg, who: "bot", exct: responseTime },
        ]);
        setLoading(false);
      }, 2000);
    }
  };

  return (
    <div className="chat">
      <div className="chat-content" ref={chatContentRef}>
        {chats.map((chat, index) => (
          <div
            key={index}
            className={`chat-message ${chat.who} ${
              index === chats.length - 1 ? "new" : ""
            }`}
          >
            {chat.who === "bot" && (
              <figure className="avatar">
                <img
                  src="https://i.ibb.co/NSVPqpZ/avatar.png"
                  alt="avatar"
                />
              </figure>
            )}
            <div className="message-text">{chat.msg}</div>
    
          </div>
        ))}

        {loading && (
          <div className="chat-message loading new">
            <figure className="avatar">
              <img
                src="https://i.ibb.co/NSVPqpZ/avatar.png"
                alt="avatar"
              />
            </figure>
            <span>🫧...typing</span>
          </div>
        )}
      </div>
      <ChatInputWidget onSendMessage={handleNewMessage} />
    </div>
  );
};

export default Chat;





