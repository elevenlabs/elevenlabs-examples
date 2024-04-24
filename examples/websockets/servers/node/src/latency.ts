import 'dotenv/config';
import WebSocket from 'ws';

const voiceId = '21m00Tcm4TlvDq8ikWAM';
const modelId = 'eleven_multilingual_v1';

function textChunker(textArray: any[]) {
  const splitters = [
    '.',
    ',',
    '?',
    '!',
    ';',
    ':',
    '—',
    '-',
    '(',
    ')',
    '[',
    ']',
    '}',
    ' ',
  ];
  let buffer = '';

  return (async function* () {
    for (let text of textArray) {
      if (splitters.includes(buffer.slice(-1))) {
        yield buffer + ' ';
        buffer = text;
      } else if (splitters.includes(text[0])) {
        yield buffer + text[0] + ' ';
        buffer = text.substring(1);
      } else {
        buffer += text;
      }
    }
    if (buffer) {
      yield buffer + ' ';
    }
  })();
}

async function textToSpeechInputStreaming(textIterator: any) {
  const startTime = new Date().getTime();

  const uri = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${modelId}`;
  const websocket = new WebSocket(uri, {
    headers: { Authorization: `Bearer ${process.env.ELEVENLABS_API_KEY}` },
  });

  websocket.on('open', async () => {
    await websocket.send(
      JSON.stringify({
        text: ' ',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          use_speaker_boost: false,
        },
        generation_config: {
          chunk_length_schedule: [120, 160, 250, 290],
        },
      }),
    );

    for await (let text of textIterator) {
      await websocket.send(JSON.stringify({ text: text }));
    }

    await websocket.send(JSON.stringify({ text: '', flush: true }));
  });

  websocket.on('message', function incoming(data) {
    const endTime = new Date().getTime();
    const elapsedMilliseconds = endTime - startTime;
    console.log(`Data: ${elapsedMilliseconds} ms`);
  });

  websocket.on('close', () => {
    const endTime = new Date().getTime();
    const elapsedMilliseconds = endTime - startTime;

    console.log(`End: ${elapsedMilliseconds} ms`);
  });

  websocket.on('error', (error) => {
    console.log('WebSocket error:', error);
  });
}

async function chatCompletion(query: string) {
  const response = query.split(' ');
  const textIterator = textChunker(response);

  await textToSpeechInputStreaming(textIterator);
}

(async () => {
  const text = `This is a test to see how the latency performs.`;

  await chatCompletion(text);
})();
