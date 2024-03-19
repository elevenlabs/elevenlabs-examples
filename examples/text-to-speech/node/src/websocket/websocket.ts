import { writeFileSync } from 'fs';
import WebSocket from 'ws';

let audioChunks: Buffer[] = [];

export const websocket = () => {
  const voiceId = 'Rn9Yq7uum9irZ6RwppDN';
  const model = 'eleven_monolingual_v1';
  const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${model}&output_format=pcm_44100`;
  const socket = new WebSocket(wsUrl);

  // 2. Initialize the connection by sending the BOS message
  socket.onopen = function (event) {
    const bosMessage = {
      text: ' ',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
      },
      xi_api_key: process.env.ELEVENLABS_API_KEY,
    };

    socket.send(JSON.stringify(bosMessage));

    // 3. Send the input text message ("Hello World")
    const textMessage = {
      text: 'Hello World ',
      try_trigger_generation: true,
    };

    socket.send(JSON.stringify(textMessage));

    // 4. Send the EOS message with an empty string
    const eosMessage = {
      text: '',
    };

    socket.send(JSON.stringify(eosMessage));
  };

  // 5. Handle server responses
  socket.onmessage = function (event: any) {
    const response = JSON.parse(event.data);

    // console.log('Server response:', response);

    if (response.audio) {
      // decode and handle the audio data (e.g., play it)
      // const audioChunk = atob(response.audio); // decode base64
      const audioChunk = Buffer.from(response.audio, 'base64');

      audioChunks.push(audioChunk);
      console.log('Received audio chunk');
    } else {
      console.log('No audio data in the response');
    }

    if (response.isFinal) {
      // the generation is complete
      saveAudioToFile('output.mp3');
    }

    if (response.normalizedAlignment) {
      // use the alignment info if needed
    }
  };

  // Handle errors
  socket.onerror = function (error) {
    console.error(`WebSocket Error: ${error}`);
  };

  // Handle socket closing
  socket.onclose = function (event) {
    if (event.wasClean) {
      console.info(
        `Connection closed cleanly, code=${event.code}, reason=${event.reason}`,
      );
    } else {
      console.warn('Connection died');
    }
  };
};

function saveAudioToFile(filename: string) {
  // Concatenate all audio chunks into a single Buffer
  const completeAudio = Buffer.concat(audioChunks);

  // Write the Buffer to an MP3 file
  writeFileSync(filename, completeAudio);

  // Reset audioChunks for the next use
  audioChunks = [];
}
