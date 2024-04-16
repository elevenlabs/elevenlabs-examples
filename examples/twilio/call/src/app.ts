import express, { Response } from 'express';
import ExpressWs from 'express-ws';
import { WebSocket } from 'ws';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';
import { Stream } from './stream';
import { TextToSpeech } from './text-to-speech';

const app = ExpressWs(express()).app;
const PORT: number = parseInt(process.env.PORT || '5000');

export const startApp = () => {
  app.post('/call/incoming', (_, res: Response) => {
    const twiml = new VoiceResponse();

    twiml.connect().stream({
      url: `wss://${process.env.SERVER_DOMAIN}/call/connection`,
    });

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  });

  app.ws('/call/connection', (ws: WebSocket) => {
    console.log('Twilio -> Connection opened'.underline.green);

    ws.on('error', console.error);

    const stream = new Stream(ws);
    const textToSpeech = new TextToSpeech();

    let streamSid: string;

    ws.on('message', (data: string) => {
      const message: {
        event: string;
        start?: { streamSid: string; callSid: string };
        media?: { payload: string };
        mark?: { name: string };
        sequenceNumber?: number;
      } = JSON.parse(data);

      if (message.event === 'start' && message.start) {
        streamSid = message.start.streamSid;
        stream.setStreamSid(streamSid);
        console.log(
          `Twilio -> Starting Media Stream for ${streamSid}`.underline.red,
        );

        textToSpeech.generate({
          partialResponseIndex: null,
          partialResponse:
            'This is a test using the ElevenLabs voice. You can now hang up. Thank you.',
        });
      } else if (message.event === 'stop') {
        console.log(`Twilio -> Media stream ${streamSid} ended.`.underline.red);
      }
    });

    textToSpeech.on(
      'speech',
      (responseIndex: number, audio: string, label: string) => {
        console.log(`TTS -> TWILIO: ${label}`.blue);

        stream.buffer(responseIndex, audio);
      },
    );
  });

  app.listen(PORT, () => {
    console.log(`Local: http://localhost:${PORT}`);
    console.log(`Remote: https://${process.env.SERVER_DOMAIN}`);
  });
};
