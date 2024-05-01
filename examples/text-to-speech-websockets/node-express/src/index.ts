import 'dotenv/config';
import express from 'express';
import ExpressWs from 'express-ws';
import cors from 'cors';
import helmet from 'helmet';
import { WebSocket } from 'ws';

const app = ExpressWs(express()).app;
const PORT: number = parseInt(process.env.PORT || '3008');

if (!process.env.ELEVENLABS_API_KEY) {
  throw new Error('ELEVENLABS_API_KEY is required');
}

app.use(cors());
app.use(helmet());

// TODO: handle timeout between server and elevenlabs
// TODO: handle timeout between client and server
// TODO: get it working for the normal output format (mp3_44100)
// TODO: handle saying that it's the last input

app.ws('/realtime-audio', (ws: WebSocket) => {
  console.log('ws connected');
  const voiceId = '21m00Tcm4TlvDq8ikWAM';
  const modelId = 'eleven_turbo_v2';
  const outputFormat = 'pcm_44100';
  const url = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${modelId}&output_format=${outputFormat}`;
  const elevenlabsSocket = new WebSocket(url);

  elevenlabsSocket.onopen = () => {
    const initialMessage = {
      xi_api_key: process.env.ELEVENLABS_API_KEY,
      text: ' ',
    };

    elevenlabsSocket.send(JSON.stringify(initialMessage));
  };

  elevenlabsSocket.onmessage = (event: any) => {
    const response = JSON.parse(event.data);
    if (response.error) {
      console.error(response);
    }

    if (response.audio) {
      console.log('audio', response.audio);
      ws.send(response.audio);
    }

    if (response.isFinal) {
      console.log('isFinal');
    }
  };

  elevenlabsSocket.onerror = (error) => {
    console.error(error);
  };

  elevenlabsSocket.onclose = () => {
    ws.close();
  };

  ws.on('message', (text: string) => {
    const textMessage = {
      text: `${text} `,
      try_trigger_generation: true,
    };
    console.log('sending message', textMessage);

    elevenlabsSocket.send(JSON.stringify(textMessage));
  });

  ws.on('error', console.error);
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);

  app.get('/', (req, res) => {
    res.send('Hello World');
  });
});
