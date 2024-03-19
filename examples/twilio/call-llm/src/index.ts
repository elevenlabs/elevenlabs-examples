import 'dotenv/config';
import 'colors';
import express, { Request, Response } from 'express';
import ExpressWs from 'express-ws';
import { WebSocket } from 'ws';
import { Llm } from '~/llm';
import { Stream } from '~/stream';
import { Transcription } from '~/transcription';
import { TextToSpeech } from '~/tts';

const app = ExpressWs(express()).app;
const PORT: number = parseInt(process.env.PORT || '5000');

app.post('/incoming', (req: Request, res: Response) => {
  res.status(200);
  res.type('text/xml');
  res.end(`
    <Response>
      <Connect>
        <Stream url="wss://${process.env.SERVER_DOMAIN}/connection" />
      </Connect>
    </Response>
  `);
});

app.ws('/connection', (ws: WebSocket) => {
  console.log('Twilio -> Connection opened'.underline.green);

  ws.on('error', console.error);
  // Filled in from start message
  let streamSid: string;
  let callSid: string;

  const llm = new Llm();
  const stream = new Stream(ws);
  const transcription = new Transcription();
  const textToSpeech = new TextToSpeech();

  let marks: string[] = [];
  let interactionCount: number = 0;

  // Incoming from MediaStream
  ws.on('message', function message(data: string) {
    const msg: {
      event: string;
      start?: { streamSid: string; callSid: string };
      media?: { payload: string };
      mark?: { name: string };
      sequenceNumber?: number;
    } = JSON.parse(data);

    if (msg.event === 'start' && msg.start) {
      streamSid = msg.start.streamSid;
      callSid = msg.start.callSid;
      stream.setStreamSid(streamSid);
      llm.setCallSid(callSid);
      console.log(
        `Twilio -> Starting Media Stream for ${streamSid}`.underline.red,
      );
      textToSpeech.generate(
        {
          partialResponseIndex: null,
          partialResponse: 'Hi, my name is Eleven. How can I help you?',
        },
        1,
      );
    } else if (msg.event === 'media' && msg.media) {
      transcription.send(msg.media.payload);
    } else if (msg.event === 'mark' && msg.mark) {
      const label: string = msg.mark.name;

      console.log(
        `Twilio -> Audio completed mark (${msg.sequenceNumber}): ${label}`.red,
      );

      marks = marks.filter((m: string) => m !== msg.mark?.name);
    } else if (msg.event === 'stop') {
      console.log(`Twilio -> Media stream ${streamSid} ended.`.underline.red);
    }
  });

  transcription.on('utterance', async (text: string) => {
    // This is a bit of a hack to filter out empty utterances
    if (marks.length > 0 && text?.length > 5) {
      console.log('Twilio -> Interruption, Clearing stream'.red);
      ws.send(
        JSON.stringify({
          streamSid,
          event: 'clear',
        }),
      );
    }
  });

  transcription.on('transcription', async (text: string) => {
    if (!text) {
      return;
    }
    console.log(`Interaction ${interactionCount} – STT -> GPT: ${text}`.yellow);
    llm.completion(text, interactionCount);
    interactionCount += 1;
  });

  llm.on(
    'gptreply',
    async (gptReply: { partialResponse: string }, icount: number) => {
      console.log(
        `Interaction ${icount}: GPT -> TTS: ${gptReply.partialResponse}`.green,
      );
      textToSpeech.generate(gptReply, icount);
    },
  );

  textToSpeech.on(
    'speech',
    (responseIndex: number, audio: string, label: string, icount: number) => {
      console.log(`Interaction ${icount}: TTS -> TWILIO: ${label}`.blue);

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
