require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // Import the cors package
const OpenAI = require("openai");

const app = express();
const port = 5000;

// Use CORS middleware
app.use(cors());

// Middleware for parsing JSON
app.use(bodyParser.json());

// OpenAI API initialization
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chat API endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { userInput } = req.body;

    if (!userInput) {
      return res.status(400).json({ error: "User input is required." });
    }

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: userInput }],
    });

    const response = chatCompletion.choices[0].message.content;

    return res.status(200).json({ response });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    return res.status(500).json({ error: "Failed to generate ChatGPT response." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

