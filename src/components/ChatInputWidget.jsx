// ChatInputWidget.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import './ChatInputWidget.css';

const ChatInputWidget = ({ onSendMessage }) => {
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const textAreaRef = useRef(null);

  const { startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({ audio: true });

  const sendAudioBlobAsBytes = useCallback((audioBlob) => {
    audioBlob.arrayBuffer().then(buffer => {
      const audioArray = Array.from(new Uint8Array(buffer));
      onSendMessage({ audioFile: audioArray }); // Pass audio data to parent
    });
  }, [onSendMessage]);

  const fetchAudioAndSend = useCallback(async () => {
    if (mediaBlobUrl) {
      const response = await fetch(mediaBlobUrl);
      const audioBlob = await response.blob();
      sendAudioBlobAsBytes(audioBlob);
      setIsRecording(false);
    }
  }, [mediaBlobUrl, sendAudioBlobAsBytes]);

  useEffect(() => {
    if (mediaBlobUrl) {
      fetchAudioAndSend();
    }
  }, [mediaBlobUrl, fetchAudioAndSend]);

  const adjustTextAreaHeight = (reset = false) => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      if (!reset) {
        textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
      }
    }
  };

  const handleInputChange = (event) => {
    setInputText(event.target.value);
    adjustTextAreaHeight();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSendMessage({ text: inputText }); // Send text message to parent
      setInputText("");
      adjustTextAreaHeight(true);
    }
  };

  const handleIconClick = () => {
    if (inputText.trim().length > 0) {
      onSendMessage({ text: inputText }); // Send text message to parent
      setInputText("");
      adjustTextAreaHeight(true);
    } else {
      if (isRecording) {
        stopRecording();
        setIsRecording(false);
      } else {
        startRecording();
        setIsRecording(true);
      }
    }
  };

  return (
    <div className="chat-container">
      <textarea
        ref={textAreaRef}
        className="chat-input"
        placeholder="Type a message..."
        value={inputText}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        rows={1}
      />
      <button className="icon-btn" onClick={handleIconClick}>
        {inputText.trim().length > 0 ? (
          <SendIcon />
        ) : isRecording ? (
          <StopIcon />
        ) : (
          <MicIcon />
        )}
      </button>
    </div>
  );
};

export default ChatInputWidget;
