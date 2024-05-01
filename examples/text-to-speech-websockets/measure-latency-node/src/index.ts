// Import environment variables from .env file and WebSocket package.
import 'dotenv/config';
import WebSocket from 'ws';

// IDs for the voice and model used in the text-to-speech API.
const voiceId = '21m00Tcm4TlvDq8ikWAM';
const modelId = 'eleven_turbo_v2';

// A function to split input text into manageable chunks based on punctuation and whitespace.
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

// This function initiates a WebSocket connection to stream text-to-speech requests.
async function textToSpeechInputStreaming(textIterator: any) {
  const startTime = new Date().getTime();
  let firstByte = true;
  const uri = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${modelId}`;
  const websocket = new WebSocket(uri, {
    headers: { Authorization: `Bearer ${process.env.ELEVENLABS_API_KEY}` },
  });

  // When connection is open, send the initial and subsequent text chunks.
  websocket.on('open', async () => {
    await websocket.send(
      JSON.stringify({
        text: ' ',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          use_speaker_boost: false,
        },
        generation_config: { chunk_length_schedule: [120, 160, 250, 290] },
      }),
    );

    for await (let text of textIterator) {
      await websocket.send(JSON.stringify({ text: text }));
    }

    await websocket.send(JSON.stringify({ text: '', flush: true }));
  });

  // Log received data and the time elapsed since the connection started.
  websocket.on('message', function incoming(data) {
    const endTime = new Date().getTime();
    const elapsedMilliseconds = endTime - startTime;

    if (firstByte) {
      console.log(`First byte: ${elapsedMilliseconds} ms`);
      firstByte = false;
    } else {
      console.log(`Data: ${elapsedMilliseconds} ms`);
    }
  });

  // Log when the WebSocket connection closes and the total time elapsed.
  websocket.on('close', () => {
    const endTime = new Date().getTime();
    const elapsedMilliseconds = endTime - startTime;
    console.log(`End: ${elapsedMilliseconds} ms`);
  });

  // Handle and log any errors that occur in the WebSocket connection.
  websocket.on('error', (error) => {
    console.log('WebSocket error:', error);
  });
}

// A function to start the text-to-speech process for a given query.
async function chatCompletion(query: string) {
  const response = query.split(' ');
  const textIterator = textChunker(response);

  await textToSpeechInputStreaming(textIterator);
}

// The main function that triggers the entire process with a test text.
(async () => {
  const text = `This is a test to see how the latency performs.`;

  await chatCompletion(text);
})();
