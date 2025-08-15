import * as dotenv from "dotenv";
// @ts-ignore
import WebSocket from 'ws';
import * as fs from "node:fs";

dotenv.config({ path: '.env.example' });
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

const voiceId = 'Xb7hH8MSUJpSbSDYk0k2'
const model = 'eleven_turbo_v2'
const uri = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${model}&optimize_streaming_latency=3`;
const websocket = new WebSocket(uri, {
  headers: { 'xi-api-key': ` ${ELEVENLABS_API_KEY}` },
});


const outputDir = './output'
try {
  fs.accessSync(outputDir, fs.constants.R_OK | fs.constants.W_OK);
} catch (err) {
  fs.mkdirSync(outputDir)
}
const writeStream = fs.createWriteStream(outputDir + '/test.mp3', { flags: 'w' });

const text = "The twilight sun cast its warm golden hues upon the vast rolling fields, saturating the landscape with an ethereal glow. "

websocket.on('open', async () => {
    websocket.send(
      JSON.stringify({
        text: ' ',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          use_speaker_boost: false,
        },
        generation_config: { chunk_length_schedule: [120, 160, 250, 290] }
      }),
  );

    websocket.send(JSON.stringify({ text: text }));

    // Send empty string to indicate the end of the text sequence which will close the websocket connection
    websocket.send(JSON.stringify({ text: '' }));
});

// Helper function to write the audio encoded in base64 string into local file
function writeToLocal(base64str: any, writeStream: fs.WriteStream) {
  const audioBuffer: Buffer = Buffer.from(base64str, 'base64')
  writeStream.write(audioBuffer, (err) => {
      if (err) {
          console.error('Error writing to file:', err);
      }
  });
}

// Listen to the incoming message from the websocket connection
websocket.on('message', function incoming(event) {
  // Generate audio from received data
  const data = JSON.parse(event.toString())
  if (data["audio"]) {
    writeToLocal(data["audio"], writeStream)
  }

  if (data["error"]) {
    console.error('Error:', data["error"]);
  }
});

// Close the writeStream when the WebSocket connection closes.
websocket.on('close', (event) => {
  writeStream.end();
});
