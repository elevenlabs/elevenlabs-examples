## Setup

1. `npx create-expo-app@latest --template blank-typescript`

2. Add the following to `app.json`:

```json app.json
{
  "expo": {
    "scheme": "elevenlabs",
    // ...
    "ios": {
      "infoPlist": {
        "NSMicrophoneUsageDescription": "This app uses the microphone to record audio."
      },
      "supportsTablet": true,
      "bundleIdentifier": "com.anonymous.elevenlabs-conversational-ai-expo-react-native"
    }
    // ...
  }
}
```

## Install dependencies

```bash
npx expo install @11labs/react
npx expo install expo-dev-client # tunnel support
npx expo install react-native-webview # DOM components support
npx expo install react-dom react-native-web @expo/metro-runtime # RN web support
```

## Run the app

4. `npx expo prebuild --clean`

5. `npx expo start --tunnel`

6. `npx expo run:ios --device`
