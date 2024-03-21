import 'dotenv/config';
import express from 'express';
import ExpressWs from 'express-ws';
import cors from 'cors';
import helmet from 'helmet';
import { WebSocket } from 'ws';
import { ElevenLabsAlpha } from 'elevenlabs-alpha';

const app = ExpressWs(express()).app;
const PORT: number = parseInt(process.env.PORT || '5000');

const elevenlabs = new ElevenLabsAlpha();

app.use(cors());
app.use(helmet());

// realtime audio
app.ws('/text-to-speech/realtime', (ws: WebSocket) => {
  ws.on('error', console.error);

  ws.on('message', (text: string) => {
    elevenlabs.textToSpeech.realtime({
      text,
      onAudioReceived: (audio) => {
        ws.send(audio);
      },
    });
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
