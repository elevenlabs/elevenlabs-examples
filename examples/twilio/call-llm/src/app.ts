import express, { Response } from 'express';
import ExpressWs from 'express-ws';
import { WebSocket } from 'ws';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';
import { Llm } from './llm';
import { Stream } from './stream';
import { TextToSpeech } from './text-to-speech';
import { ElevenLabsAlpha } from 'elevenlabs-alpha';

const app = ExpressWs(express()).app;
const PORT: number = parseInt(process.env.PORT || '5000');

const elevenlabs = new ElevenLabsAlpha();

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

    const llm = new Llm();
    const stream = new Stream(ws);
    const textToSpeech = new TextToSpeech();

    let streamSid: string;
    let callSid: string;
    let marks: string[] = [];

    elevenlabs.speechToText.connect({
      onTranscription: (data: string) => {
        console.log(`Transcription – STT -> LLM: ${data}`.yellow);
        llm.completion(data);
      },
      onUtterance: (data: string) => {
        if (marks.length > 0 && data?.length > 5) {
          console.log('Interruption, Clearing stream'.red);

          ws.send(
            JSON.stringify({
              streamSid,
              event: 'clear',
            }),
          );
        }
      },
    });

    // Incoming from MediaStream
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
        callSid = message.start.callSid;
        stream.setStreamSid(streamSid);
        llm.setCallSid(callSid);
        console.log(
          `Twilio -> Starting Media Stream for ${streamSid}`.underline.red,
        );
        textToSpeech.generate({
          partialResponseIndex: null,
          partialResponse: 'Hi, my name is Eleven. How can I help you?',
        });
      } else if (message.event === 'media' && message.media) {
        if (elevenlabs.speechToText.isOpen) {
          elevenlabs.speechToText.send({
            event: 'audio',
            data: message.media.payload,
          });
        }
      } else if (message.event === 'mark' && message.mark) {
        const label: string = message.mark.name;

        console.log(
          `Twilio -> Audio completed mark (${message.sequenceNumber}): ${label}`
            .red,
        );

        marks = marks.filter((m: string) => m !== message.mark?.name);
      } else if (message.event === 'stop') {
        console.log(`Twilio -> Media stream ${streamSid} ended.`.underline.red);
      }
    });

    llm.on('llmreply', async (llmReply: { partialResponse: string }) => {
      console.log(`LLM -> TTS: ${llmReply.partialResponse}`.green);
      textToSpeech.generate(llmReply);
    });

    textToSpeech.on(
      'speech',
      (responseIndex: number, audio: string, label: string) => {
        console.log(`TTS -> TWILIO: ${label}`.blue);

        stream.buffer(responseIndex, audio);
      },
    );

    stream.on('audiosent', (markLabel: string) => {
      marks.push(markLabel);
    });
  });

  app.listen(PORT, () => {
    console.log(`Local: http://localhost:${PORT}`);
    console.log(`Remote: https://${process.env.SERVER_DOMAIN}`);
  });
};
