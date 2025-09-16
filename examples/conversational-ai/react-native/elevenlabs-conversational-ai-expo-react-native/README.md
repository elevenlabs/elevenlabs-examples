# ElevenLabs React Native Example

A minimal React Native Expo app demonstrating the ElevenLabs React Native SDK for voice conversations.

## Prerequisites

- Node.js 20+
- iOS and Android simulators

## Setup

```bash
# Create a .env file in the root of the project
cp .env.example .env
```

Follow the ElevenLabs Conversational AI [quickstart guide](https://elevenlabs.io/docs/conversational-ai/quickstart) to create an agent and set your agent ID in the `.env` file.

### Security consideration

This example uses a public agent ID for demonstration purposes. In a production app, you should generate a short lived signed URL in a secure server-side environment, see our [docs](https://elevenlabs.io/docs/conversational-ai/customization/authentication).

## Installation

Install dependencies:

`npx expo install @elevenlabs/react-native @livekit/react-native @livekit/react-native-webrtc @config-plugins/react-native-webrtc @livekit/react-native-expo-plugin @livekit/react-native-expo-plugin livekit-client`

Note: If you're running into an issue with peer dependencies, please add a `.npmrc` file in the root of the project with the following content: `legacy-peer-deps=true`.

```bash
npm install
```

## Development Build

Prebuild, required for native dependencies:

```bash
npx expo prebuild
```

## Running the App

**Important**: This app requires a development build and cannot run in Expo Go due to WebRTC native dependencies.

### Start the Expo server in tunnel mode

```bash
npx expo start --tunnel
```

### iOS

```bash
## Build your native iOS project (this will install CocoaPods)
npx expo run:ios --device
```

### Android

```bash
## Build your native Android project
npx expo run:android
```

## Simulators

When running on a simulator, make sure to adjust the audio settings so the agent can correctly hear you.

## iOS

In the I/O menu, make sure you've set the correct audio input and output devices. Also increase the volume as it defaults to 0.

![iOS Settings](assets/ios-settings.png)

## Android

In the Extended Controls panel, enable "Virtual microphone uses host audio input".

![Android Settings](assets/android-settings.png)

## Web

Note that React Native Web is currently not supported. For web implementations please use the [ElevenLabs React SDK](https://elevenlabs.io/docs/conversational-ai/libraries/react).

## Troubleshooting

- Make sure you're using development builds, not Expo Go
- Ensure all dependencies are installed with `npm install`
- For iOS, run `cd ios && pod install` if needed
- Check that your development environment is set up correctly for React Native
- Use a physical device rather than simulators
