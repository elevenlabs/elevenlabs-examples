## Cross-platform Conversational AI agent with ElevenLabs and Expo React Native DOM Components

This example uses [ElevenLabs Conversational AI](https://elevenlabs.io/conversational-ai), running the [React SDK](https://elevenlabs.io/docs/conversational-ai/libraries/react) within [Expo DOM Components](https://docs.expo.dev/guides/dom-components/) to make the agent work across web, iOS, and Android.

### First message

```
Hi there, woah, so cool that I'm running on {{platform}}. What can I help you with?
```

### System prompt

```
You are a helpful assistant running on {{platform}}. You have access to certain tools that allow you to check the user device battery level and change the display brightness. Use these tools if the user asks about them. Otherwise, just answer the question.
```

### Tools

- Client
  - Name: get_battery_level
    - Description: Gets the device battery level as decimal point percentage.
    - Wait for response: true
    - Response timeout (seconds): 3
  - Name: change_brightness
    - Description: Changes the brightness of the device screen.
    - Wait for response: true
    - Response timeout (seconds): 3
    - Parameters:
      - Data Type: number
      - Identifier: brightness
      - Required: true
      - Value Type: LLM Prompt
      - Description: A number between 0 and 1, inclusive, representing the desired screen brightness.
  - Name: flash_screen
    - Description: Quickly flashes the screen on and off.
    - Wait for response: true
    - Response timeout (seconds): 3

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
# Cool client tools
npx expo install expo-battery
npx expo install expo-brightness
```

## Run the app

1. `npx expo prebuild --clean`
2. `npx expo start --tunnel`
3. `npx expo run:ios --device`
