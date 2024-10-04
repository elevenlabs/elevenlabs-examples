#!/usr/bin/env node
import WebSocket from 'ws';
import yargs, { demandOption } from 'yargs';
import * as fs from "node:fs";

type Config = {
  apiKey: string;
  model: string;
  voiceId: string;
  numOfTrials: number;
  baseUrl: string;
};

type Result = {
  firstByteTime: number;
  elapsedTime: number;
};

// Write the audio encoded in base64 string into local file
function writeToLocal(base64str: any, writeStream: fs.WriteStream) {
  const audioBuffer: Buffer = Buffer.from(base64str, 'base64')
  writeStream.write(audioBuffer, (err) => {
      if (err) {
          console.error('Error writing to file:', err);
      }
  });
}

// This function initiates a WebSocket connection to stream text-to-speech requests.
async function textToSpeechInputStreaming(text: string, config: Config): Promise<Result> {
  return new Promise((resolve, reject) => {
    let firstByteTime: number | undefined;
    let startTime: number | undefined;
    let firstByte = true;

    const uri = `wss://${config.baseUrl}/v1/text-to-speech/${config.voiceId}/stream-input?model_id=${config.model}`;
    const websocket = new WebSocket(uri, {
      headers: { 'xi-api-key': ` ${config.apiKey}` },
    });

    // Create output folder for saving the audio into mp3
    const outputDir = './output'
    try {
      fs.accessSync(outputDir, fs.constants.R_OK | fs.constants.W_OK);
    } catch (err) {
      fs.mkdirSync(outputDir)
    }
    const writeStream = fs.createWriteStream(outputDir + '/test.mp3', { flags: 'w' });

    // When connection is open, send the initial and subsequent text chunks.
    websocket.on('open', async () => {
        websocket.send(
          JSON.stringify({
            text: ' ',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
              use_speaker_boost: false,
            },
            generation_config: { chunk_length_schedule: [120, 160, 250, 290] }
          }),
        );

        startTime = new Date().getTime()

        websocket.send(JSON.stringify({ text: text }));

        websocket.send(JSON.stringify({ text: '' }));
    });

    // Log received data and the time elapsed since the connection started.
    websocket.on('message', function incoming(event) {
      if (typeof startTime === 'undefined') {
        throw new Error('Start time is not recorded, please check whether websocket is open.');
      }
      const endTime = new Date().getTime();
      const elapsedMilliseconds = endTime - startTime;
      if (firstByte) {
        firstByteTime = elapsedMilliseconds;
        console.log(`Time to first byte: ${elapsedMilliseconds} ms`);
        firstByte = false;
      }

      // Generate audio from received data
      const data = JSON.parse(event.toString())
      if (data["audio"]) {
        writeToLocal(data["audio"], writeStream)
      }
    });

    // Log when the WebSocket connection closes and the total time elapsed.
    websocket.on('close', () => {
      writeStream.end();

      const endTime = new Date().getTime();
      if (typeof startTime === 'undefined') {
        throw new Error('Start time is not recorded, please check whether websocket is open.');
      }
      const elapsedMilliseconds = endTime - startTime;
      if (typeof firstByteTime === 'undefined') {
        throw new Error('Unable to measure latencies, please check your network connection and API key');
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


export async function measureLatencies(config: Config) {
  const text = "The twilight sun cast its warm golden hues upon the vast rolling fields, saturating the landscape with an ethereal glow. "

  const results: Result[] = [];
  for (let i = 0; i <config.numOfTrials; i++) {
    const result = await textToSpeechInputStreaming(text, config);
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
  .command('$0 <api_key>', 'Run the latency measurement', (yargs) => {})
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
    voiceId: {
      alias: 'v',
      type: 'string',
      description: 'Voice to use - defaults to id of Alice',
      demandOption: false
    },
    baseUrl: {
      alias: 'u',
      type: 'string',
      description: 'Base URL for the API - defaults to api.elevenlabs.io',
      demandOption: false
    }
  })
  .demandCommand(1, 'You need to provide the API key')
  .parseSync();

  const config = {
    apiKey: argv.api_key || "",
    model: argv.model || 'eleven_turbo_v2',
    voiceId: argv.voiceId || 'Xb7hH8MSUJpSbSDYk0k2',
    baseUrl: argv.baseUrl || 'api.elevenlabs.io',
    numOfTrials: 5
  } satisfies Config;

  console.log('Using model:', config.model);
  console.log('Using voice id:', config.voiceId);
  console.log('Using base URL:', config.baseUrl);
  console.log(`Measuring latency with ${config.numOfTrials} requests...\n`);

  await measureLatencies(config);
}

if (require.main === module) {
  main();
}