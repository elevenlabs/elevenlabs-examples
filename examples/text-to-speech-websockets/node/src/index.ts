import 'dotenv/config';
import { WebSocket } from 'ws';

const voiceId = '21m00Tcm4TlvDq8ikWAM';
const modelId = 'eleven_multilingual_v1';
const outputFormat = 'pcm_44100';
const url = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${modelId}&output_format=${outputFormat}`;
const elevenlabsSocket = new WebSocket(url);

elevenlabsSocket.onopen = () => {
  const initialMessage = {
    xi_api_key: process.env.ELEVENLABS_API_KEY,
    text: ' ',
  };

  elevenlabsSocket.send(JSON.stringify(initialMessage));

  const textMessage = {
    text: `This is a test. `,
    try_trigger_generation: true,
  };

  elevenlabsSocket.send(JSON.stringify(textMessage));

  const endMessage = {
    text: '',
  };

  elevenlabsSocket.send(JSON.stringify(endMessage));
};

elevenlabsSocket.onmessage = (event: any) => {
  const response = JSON.parse(event.data);

  if (response.audio) {
    // Do something with the audio
  }
};
