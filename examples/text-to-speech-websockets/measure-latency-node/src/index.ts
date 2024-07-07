#!/usr/bin/env node
import WebSocket from 'ws';
import yargs from 'yargs';

type Config = {
  apiKey: string;
  model: string;
  voiceId: string;
};

type Result = {
  firstByteTime: number;
  elapsedTime: number;
};

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
async function textToSpeechInputStreaming(textIterator: any, config: Config): Promise<Result> {
  return new Promise((resolve, reject) => {
    let firstByteTime: number | undefined;
    const startTime = new Date().getTime();
    let firstByte = true;
    const uri = `wss://api.elevenlabs.io/v1/text-to-speech/${config.voiceId}/stream-input?model_id=${config.model}`;
    const websocket = new WebSocket(uri, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
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
        firstByteTime = elapsedMilliseconds;
        console.log(`First byte: ${elapsedMilliseconds} ms`);
        firstByte = false;
      }
    });

    // Log when the WebSocket connection closes and the total time elapsed.
    websocket.on('close', () => {
      const endTime = new Date().getTime();
      const elapsedMilliseconds = endTime - startTime;
      if (typeof firstByteTime === 'undefined') {
        throw new Error('First byte time is not set');
      }
      resolve({
        firstByteTime,
        elapsedTime: elapsedMilliseconds,
      } satisfies Result);
    });

    // Handle and log any errors that occur in the WebSocket connection.
    websocket.on('error', (error) => {
      console.log('WebSocket error:', error);
      reject(error);
    });
  });
}

async function chatCompletion(text: string, config: Config): Promise<Result> {
  const textIterator = textChunker(text.split(' '));

  const result = await textToSpeechInputStreaming(textIterator, config);
  return result;
}

export async function measureLatencies(config: Config) {
  const text = `This is a test to see how the latency performs.`;
  const results: Result[] = [];
  for (let i = 0; i < 10; i++) {
    const result = await chatCompletion(text, config);
    results.push(result);
  }
  const averageFirstByteTime =
    results.reduce((acc, curr) => acc + curr.firstByteTime, 0) / results.length;
  const averageElapsedTime =
    results.reduce((acc, curr) => acc + curr.elapsedTime, 0) / results.length;
  console.log(`\nAverage first byte time: ${averageFirstByteTime} ms`);

  return results;
}

async function main() {
  const argv = yargs(process.argv.slice(2))
  .usage('Usage: $0 <api_key> [options]')
  .command('$0 <api_key>', 'Run the latency measurement', (yargs) => {
    yargs.positional('api_key', {
      describe: 'API key',
      type: 'string',
    });
  })
  .options({
    api_key: {
      alias: 'key',
      type: 'string',
      description: 'ElevenLabs API key',
      demandOption: true,
    },
    model: {
      alias: 'm',
      type: 'string',
      description: 'Model to use - defaults to eleven_turbo_v2',
      demandOption: false, // This makes the model optional
    },
  })
  .demandCommand(1, 'You need to provide the API key')
  .parseSync();
  const config = {
    apiKey: argv.api_key || "",
    model: argv.model || 'eleven_turbo_v2',
    voiceId: '21m00Tcm4TlvDq8ikWAM',
  } satisfies Config;

  console.log('Measuring latency with 10 requests...\n');

  await measureLatencies(config);
}

if (require.main === module) {
  main();
}