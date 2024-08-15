import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'socket.io';
import WebSocket from 'ws';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
  },
});

const PORT: number = parseInt(process.env.PORT || '5000');

if (!process.env.ELEVENLABS_API_KEY) {
  throw new Error('ELEVENLABS_API_KEY is required');
}

app.use(cors());
app.use(helmet());

io.on('connection', (socket) => {
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

  socket.on('message', (data) => {
    const message = JSON.parse(data) as { text: string; isFinal?: boolean };
    const textMessage = {
      text: `${message.text} `,
      try_trigger_generation: true,
      flush: message.isFinal,
    };

    elevenlabsSocket.send(JSON.stringify(textMessage));
  });

  elevenlabsSocket.onmessage = (event: any) => {
    const response = JSON.parse(event.data);

    if (response.error) {
      socket.emit('error', response);
    }

    if (response.audio) {
      socket.emit('audio', response.audio);
    }
  };
});

server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
