## Cross-platform Conversational AI agent with ElevenLabs and Expo React Native DOM Components

This example uses [ElevenLabs Conversational AI](https://elevenlabs.io/conversational-ai), running the [React SDK](https://elevenlabs.io/docs/conversational-ai/libraries/react) within [Expo DOM Components](https://docs.expo.dev/guides/dom-components/) to make the agent work across web, iOS, and Android.

- Read the detailed cookbook [here](https://elevenlabs.io/docs/cookbooks/conversational-ai/expo-react-native).

## ElevenLabs Agent Configuration

Head over to the [ElevenLabs App](https://elevenlabs.io/app/conversational-ai/agents) and create a new blank agent. Set up the following configuration in your newly created agent:

### First message

```
Hi there, woah, so cool that I'm running on {{platform}}. What can I help you with?
```

### System prompt

```
You are a helpful assistant running on {{platform}}. You have access to certain tools that allow you to check the user device battery level and change the display brightness. Use these tools if the user asks about them. Otherwise, just answer the question.
```

### Client Tools

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

## Install dependencies

```bash
npm install
```

## Run the app

1. `npx expo prebuild --clean`
2. `npx expo start --tunnel`
3. `npx expo run:ios --device`
