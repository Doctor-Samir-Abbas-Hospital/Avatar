"use strict";
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const fs = require("fs");
require("dotenv").config(); // For loading environment variables

const app = express();
const port = 3001;

// Middleware for CORS
app.use(cors());
app.use(express.json());

// Microsoft Speech SDK Configuration
const speechConfig = sdk.SpeechConfig.fromSubscription(
  process.env.SPEECH_KEY,
  process.env.SPEECH_REGION
);
speechConfig.speechSynthesisVoiceName = "en-US-AvaMultilingualNeural";

// Endpoint to perform TTS and return audio + viseme data
app.post("/tts", async (req, res) => {
  try {
    // Fetch text from Flask `/generate` endpoint
    const generateEndpoint = "http://localhost:5000/generate";
    const generateResponse = await axios.get(generateEndpoint);
    const text = generateResponse.data.text;

    if (!text) {
      return res.status(400).json({ error: "No text received from Flask." });
    }

    // Prepare audio output
    const audioFile = "output.wav";
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFile);

    // Create Speech Synthesizer
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    // Store viseme data
    const visemeData = [];

    // Subscribe to visemeReceived event
    synthesizer.visemeReceived = function (s, e) {
      const audioOffsetMs = e.audioOffset / 10000; // Convert to milliseconds
      visemeData.push({ visemeId: e.visemeId, audioOffset: audioOffsetMs });
    };

    // Synthesize speech
    synthesizer.speakTextAsync(
      text,
      function (result) {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          console.log("Synthesis completed.");

          // Read audio file and return audio + viseme data
          fs.readFile(audioFile, (err, audioBuffer) => {
            if (err) {
              return res.status(500).json({ error: "Error reading audio file." });
            }

            res.json({
              text,
              visemeData,
              audio: audioBuffer.toString("base64"), // Send audio as Base64 string
            });
          });
        } else {
          console.error(
            "Speech synthesis canceled: " + result.errorDetails
          );
          res.status(500).json({
            error: "Speech synthesis canceled: " + result.errorDetails,
          });
        }
        synthesizer.close();
      },
      function (err) {
        console.trace("Error during synthesis: " + err);
        res.status(500).json({ error: "Error during synthesis: " + err });
        synthesizer.close();
      }
    );
  } catch (error) {
    console.error("Error fetching text or during synthesis:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
});

// Start the Node.js server
app.listen(port, () => {
  console.log(`TTS server listening at http://localhost:${port}`);
});
