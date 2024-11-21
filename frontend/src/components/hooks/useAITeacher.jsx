const { create } = require("zustand");

export const useAITeacher = create((set, get) => ({
  // State to manage chat messages
  messages: [],

  // State for the currently active message
  currentMessage: null,

  // Loading state for asynchronous operations
  loading: false,

  // Function to send a question to the AI and process the response
  askAI: async (input) => {
    if (!input) {
      return; // Exit if the input is empty
    }

    // Create a new message object
    const message = {
      question: input, // User's input
      id: get().messages.length, // Unique ID based on the current message count
    };

    // Set loading state to true while waiting for AI response
    set(() => ({
      loading: true,
    }));

    try {
      // Fetch AI response from the Flask backend
      const res = await fetch(`http://127.0.0.1:5000/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }), // Send user input
      });

      const data = await res.json();

      // Attach AI response and TTS data to the message
      message.answer = data.response;
      message.audio = data.audio; // Base64-encoded audio
      message.visemes = data.visemes;

      // Update current message state
      set(() => ({
        currentMessage: message,
      }));

      // Append the new message to the messages list and turn off loading state
      set((state) => ({
        messages: [...state.messages, message],
        loading: false,
      }));

      // Play the AI's response audio
      get().playMessage(message);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      set(() => ({ loading: false }));
    }
  },

  // Function to play a message with text-to-speech (TTS) audio
  playMessage: (message) => {
    if (!message.audio) {
      console.error("No audio data found for the message.");
      return;
    }

    // Set the current message
    set(() => ({
      currentMessage: message,
    }));

    // Decode Base64 audio and create an audio player instance
    const audioBlob = new Blob([Uint8Array.from(atob(message.audio), (c) => c.charCodeAt(0))], {
      type: "audio/mpeg",
    });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audioPlayer = new Audio(audioUrl);

    // Attach audio player to the message
    message.audioPlayer = audioPlayer;

    // Reset current message state when audio ends
    audioPlayer.onended = () => {
      set(() => ({
        currentMessage: null,
      }));
    };

    // Start playing the audio from the beginning
    audioPlayer.currentTime = 0;
    audioPlayer.play();
  },

  // Function to stop playing a message
  stopMessage: (message) => {
    if (message.audioPlayer) {
      message.audioPlayer.pause(); // Pause the audio
      set(() => ({
        currentMessage: null, // Clear the current message
      }));
    }
  },
}));