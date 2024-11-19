import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { PassThrough } from "stream";

export async function GET(req) {
  // WARNING: Do not expose your keys
  // WARNING: If you host publicly your project, add an authentication layer to limit the consumption of Azure resources

  const speechConfig = sdk.SpeechConfig.fromSubscription(
    process.env["SPEECH_KEY"],
    process.env["SPEECH_REGION"]
  );

  // Set the voice for text-to-speech synthesis
  const teacher = req.nextUrl.searchParams.get("teacher") || "Nanami";
  speechConfig.speechSynthesisVoiceName = `ja-JP-${teacher}Neural`;

  const speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig);

  // Collect viseme data
  const visemes = [];
  speechSynthesizer.visemeReceived = (s, e) => {
    visemes.push([e.audioOffset / 10000, e.visemeId]);
  };

  try {
    // Perform text-to-speech synthesis
    const audioStream = await new Promise((resolve, reject) => {
      speechSynthesizer.speakTextAsync(
        req.nextUrl.searchParams.get("text") || "This is a sample text-to-speech synthesis.",
        (result) => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            const { audioData } = result;

            // Convert audio data buffer to a readable stream using PassThrough
            const bufferStream = new PassThrough();
            bufferStream.end(Buffer.from(audioData));
            resolve(bufferStream);
          } else {
            reject(new Error("Speech synthesis failed."));
          }

          speechSynthesizer.close();
        },
        (error) => {
          console.error("Error during speech synthesis:", error);
          speechSynthesizer.close();
          reject(error);
        }
      );
    });

    // Return the response with audio stream and viseme data
    return new Response(audioStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `inline; filename=tts.mp3`,
        Visemes: JSON.stringify(visemes),
      },
    });
  } catch (error) {
    console.error("Error in GET handler:", error);
    return new Response("Error during text-to-speech synthesis", { status: 500 });
  }
}
