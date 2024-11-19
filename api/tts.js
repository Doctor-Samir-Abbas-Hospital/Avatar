import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { PassThrough } from "stream";

export async function GET(req) {
  // Configure speech synthesis
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    process.env["SPEECH_KEY"],
    process.env["SPEECH_REGION"]
  );

  // Set specific voice name
  speechConfig.speechSynthesisVoiceName = "your-specific-voice-name";

  // Create speech synthesizer
  const speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig);

  // Collect viseme data
  const visemes = [];
  speechSynthesizer.visemeReceived = function (s, e) {
    visemes.push([e.audioOffset / 10000, e.visemeId]);
  };

  // Generate audio stream
  const audioStream = await new Promise((resolve, reject) => {
    speechSynthesizer.speakTextAsync(
      req.nextUrl.searchParams.get("text") || "I'm excited to try text to speech",
      (result) => {
        const { audioData } = result;
        speechSynthesizer.close();
        
        // Convert arrayBuffer to stream
        const bufferStream = new PassThrough();
        bufferStream.end(Buffer.from(audioData));
        resolve(bufferStream);
      },
      (error) => {
        console.log(error);
        speechSynthesizer.close();
        reject(error);
      }
    );
  });

  // Create response with audio and viseme data
  const response = new Response(audioStream, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Disposition": `inline; filename=tts.mp3`,
      "Visemes": JSON.stringify(visemes),
    },
  });

  return response;
}