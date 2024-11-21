import React, { useState, useCallback, useRef } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import "./ChatInputWidget.css";

const ChatInputWidget = ({ onSendMessage }) => {
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const textAreaRef = useRef(null);

  const { startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({ audio: true });

  const sendAudioBlobAsBytes = useCallback(
    async (audioBlob) => {
      try {
        const buffer = await audioBlob.arrayBuffer();
        const audioArray = Array.from(new Uint8Array(buffer));
        onSendMessage({ audioFile: audioArray }); // Pass audio data to parent
      } catch (error) {
        console.error("Error sending audio blob:", error);
      }
    },
    [onSendMessage]
  );

  const handleRecordingStop = useCallback(async () => {
    if (mediaBlobUrl) {
      try {
        const response = await fetch(mediaBlobUrl);
        const audioBlob = await response.blob();
        await sendAudioBlobAsBytes(audioBlob);
      } catch (error) {
        console.error("Error handling audio recording:", error);
      } finally {
        setIsRecording(false);
      }
    }
  }, [mediaBlobUrl, sendAudioBlobAsBytes]);

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
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (inputText.trim().length > 0) {
        onSendMessage({ text: inputText }); // Send text message to parent
        setInputText("");
        adjustTextAreaHeight(true);
      }
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
        handleRecordingStop(); // Process audio recording once stopped
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
