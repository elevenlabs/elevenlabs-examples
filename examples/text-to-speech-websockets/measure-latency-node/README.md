# ElevenLabs - Websockets Server - Node

Package to measure the latency of a websocket connection to ElevenLabs' text-to-speech API - specifically the time to first byte

Hosted on npm at [https://www.npmjs.com/package/elevenlabs-latency](https://www.npmjs.com/package/elevenlabs-latency)

## Usage

### Using NPX

The easiest way to run this example is to use npx by running the following command:

```bash
npx elevenlabs-latency ELEVENLABS_API_KEY
```

Optionally you can specify the model to use by adding the `-m` flag:

```bash
npx elevenlabs-latency ELEVENLABS_API_KEY -m eleven_turbo_v2
```

In addition, you can optionally specify the voice id to use by adding the `-v` flag:

```bash
npx elevenlabs-latency ELEVENLABS_API_KEY -v Xb7hH8MSUJpSbSDYk0k2
```

### From source

1. Clone the repository and cd into this folder
2. Run `npm install` to install the dependencies
3. Run `npm run start -- ELEVENLABS_API_KEY` to run the test; Optionally specify the model to use by adding the `-m` flag or the voice id to use by adding the `-v` flag
