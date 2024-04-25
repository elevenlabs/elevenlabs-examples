import 'dotenv/config';
import express from 'express';
import ExpressWs from 'express-ws';
import cors from 'cors';
import helmet from 'helmet';
import { WebSocket } from 'ws';

const app = ExpressWs(express()).app;
const PORT: number = parseInt(process.env.PORT || '5000');

app.use(cors());
app.use(helmet());

app.ws('/realtime-audio', (ws: WebSocket) => {
  const voiceId = '21m00Tcm4TlvDq8ikWAM';
  const modelId = 'eleven_multilingual_v1';
  const outputFormat = 'pcm_44100';
  const url = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${modelId}&output_format=${outputFormat}`;
  const elevenlabsSocket = new WebSocket(url);

  elevenlabsSocket.onopen = () => {
    const initialMessage = {
      xi_api_key: process.env.ELEVENLABS_API_KEY,
      generation_config: {
        // start processing audio after 120 characters, then 160, 250, 290
        chunk_length_schedule: [120, 160, 250, 290],
      },
      text: ' ',
    };

    elevenlabsSocket.send(JSON.stringify(initialMessage));
  };

  elevenlabsSocket.onmessage = (event: any) => {
    const response = JSON.parse(event.data);

    if (response.audio) {
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
      flush: text.length < 120,
    };

    elevenlabsSocket.send(JSON.stringify(textMessage));
  });

  ws.on('error', console.error);
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
