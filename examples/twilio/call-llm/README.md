# Call GPT: Generative AI Phone Calling

Wouldn't it be neat if you could build an app that allowed you to chat with ChatGPT on the phone?

Twilio gives you a superpower called [Media Streams](https://twilio.com/media-streams). Media Streams provides a Websocket connection to both sides of a phone call. You can get audio streamed to you, process it, and send audio back.

This app serves as a demo exploring three services:
- [Deepgram](https://deepgram.com/) for Speech to Text
- [elevenlabs](https://elevenlabs.io) for Text to Speech
- [OpenAI](https://openai.com) for GPT prompt completion

These service combine to create a voice application that is remarkably better at transcribing, understanding, and speaking than traditional IVR systems.

Features:
- 🏁 Returns responses with low latency, typically 1 second by utilizing streaming.
- ❗️ Allows the user to interrupt the GPT assistant and ask a different question.
- 📔 Maintains chat history with GPT.
- 🛠️ Allows the GPT to call external tools.

## Setting up for Development

### Prerequisites
Sign up for the following services and get an API key for each:
- [Deepgram](https://console.deepgram.com/signup)
- [OpenAI](https://platform.openai.com/signup)
- [ElevenLabs](https://elevenlabs.io/sign-up)

With ElevenLabs, you'll have the option of using an existing voice or creating a new one. The app is configured to use the "Rachel" voice by default, but you can find a list of all available voice IDs [here](https://api.elevenlabs.io/v1/voices).

If you're hosting the app locally, we also recommend using a tunneling service like [ngrok](https://ngrok.com) so that Twilio can forward audio to your app.


### 1. Start Ngrok
Start an [ngrok](https://ngrok.com) tunnel for port `3000`:

```bash
ngrok http 3000
```
Ngrok will give you a unique URL, like `abc123.ngrok.io`. Copy the URL without http:// or https://. You'll need this URL in the next step.

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure the following environment variables:

```bash
# Your ngrok or server URL
# E.g. 123.ngrok.io or myserver.fly.dev
SERVER="yourserverdomain.com"

# Service API Keys
OPENAI_API_KEY="sk-XXXXXX"
DEEPGRAM_API_KEY="YOUR-DEEPGRAM-API-KEY"
XI_API_KEY="YOUR-ELEVEN-LABS-API-KEY"
# Available models at a signed GET request to /v1/models
XI_MODEL_ID="eleven_turbo_v2"

# Uses "Rachel" voice by default
# See https://api.elevenlabs.io/v1/voices
# or visit https://elevenlabs.io/voice-library
# for a list of all available voices
VOICE_ID="21m00Tcm4TlvDq8ikWAM"

# Configure your Twilio credentials if you want
# to make test calls using '$ npm test'.
TWILIO_ACCOUNT_SID="YOUR-ACCOUNT-SID"
TWILIO_AUTH_TOKEN="YOUR-AUTH-TOKEN"
FROM_NUMBER='+12223334444'
TO_NUMBER='+13334445555'
```

### 3. Install Dependencies with NPM
Install the necessary packages:

```bash
npm install
```

### 4. Start Your Server in Development Mode
Run the following command:
```bash
npm run dev
```
This will start your app using `nodemon` so that any changes to your code automatically refreshes and restarts the server.

### 5. Configure an Incoming Phone Number

Connect a phone number using the [Twilio Console](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming).

You can also use the Twilio CLI:

```bash
twilio phone-numbers:update +1[your-twilio-number] --voice-url=https://your-server.ngrok.io/incoming
```
This configuration tells Twilio to send incoming call audio to your app when someone calls your number. The app responds to the incoming call webhook with a [Stream](https://www.twilio.com/docs/voice/twiml/stream) TwiML verb that will connect an audio media stream to your websocket server.

## Application Workflow
CallGPT coordinates the data flow between multiple different services including Deepgram, OpenAI, ElevenLabs, and Twilio Media Streams:
![Call GPT Flow](https://github.com/twilio-labs/call-gpt/assets/1418949/0b7fcc0b-d5e5-4527-bc4c-2ffb8931139c)


## Modifying the ChatGPT Context & Prompt
Within `gpt-service.js` you'll find the settings for the GPT's initial context and prompt. For example:

```javascript
this.userContext = [
  { "role": "system", "content": "You are an outbound sales representative selling Apple Airpods. You have a youthful and cheery personality. Keep your responses as brief as possible but make every attempt to keep the caller on the phone without being rude. Don't ask more than 1 question at a time. Don't make assumptions about what values to plug into functions. Ask for clarification if a user request is ambiguous. Speak out all prices to include the currency. Please help them decide between the airpods, airpods pro and airpods max by asking questions like 'Do you prefer headphones that go in your ear or over the ear?'. If they are trying to choose between the airpods and airpods pro try asking them if they need noise canceling. Once you know which model they would like ask them how many they would like to purchase and try to get them to place an order. Add a '•' symbol every 5 to 10 words at natural pauses where your response can be split for text to speech." },
  { "role": "assistant", "content": "Hello! I understand you're looking for a pair of AirPods, is that correct?" },
],
```
### About the `system` Attribute
The `system` attribute is background information for the GPT. As you build your use-case, play around with modifying the context. A good starting point would be to imagine training a new employee on their first day and giving them the basics of how to help a customer.

There are some context prompts that will likely be helpful to include by default. For example:

- You have a [cheerful, wise, empathetic, etc.] personality.
- Keep your responses as brief as possible but make every attempt to keep the caller on the phone without being rude.
- Don't ask more than 1 question at a time.
- Don't make assumptions about what values to plug into functions.
- Ask for clarification if a user request is ambiguous.
- Add a '•' symbol every 5 to 10 words at natural pauses where your response can be split for text to speech.

These context items help shape a GPT so that it will act more naturally in a phone conversation.

The `•` symbol context in particular is helpful for the app to be able to break sentences into natural chunks. This speeds up text-to-speech processing so that users hear audio faster.

### About the `content` Attribute
This attribute is your default conversations starter for the GPT. However, you could consider making it more complex and customized based on personalized user data.

In this case, our bot will start off by saying, "Hello! I understand you're looking for a pair of AirPods, is that correct?"

## Using Function Calls with GPT
You can use function calls to interact with external APIs and data sources. For example, your GPT could check live inventory, check an item's price, or place an order.

### How Function Calling Works
Function calling is handled within the `gpt-service.js` file in the following sequence:

1. `gpt-service` loads `function-manifest.js` and requires (imports) all functions defined there from the `functions` directory. Our app will call these functions later when GPT gives us a function name and parameters.
```javascript
tools.forEach((tool) => {
  const functionName = tool.function.name;
  availableFunctions[functionName] = require(`../functions/${functionName}`);
});
```

2. When we call GPT for completions, we also pass in the same `function-manifest` JSON as the tools parameter. This allows the GPT to "know" what functions are available:

```javascript
const stream = await this.openai.chat.completions.create({
  model: 'gpt-4',
  messages: this.userContext,
  tools, // <-- function-manifest definition
  stream: true,
});
```
3. When the GPT responds, it will send us a stream of chunks for the text completion. The GPT will tell us whether each text chunk is something to say to the user, or if it's a tool call that our app needs to execute.  This is indicated by the `deltas.tool_calls` key:
```javascript
if (deltas.tool_calls) {
  // handle function calling
}
```
4. Once we have gathered all of the stream chunks about the tool call, our application can run the actual function code that we imported during the first step. The function name and parameters are provided by GPT:
```javascript
const functionToCall = availableFunctions[functionName];
const functionResponse = functionToCall(functionArgs);
```
5. As the final step, we add the function response data into the conversation context like this:

```javascript
this.userContext.push({
  role: 'function',
  name: functionName,
  content: functionResponse,
});
```
We then ask the GPT to generate another completion including what it knows from the function call. This allows the GPT to respond to the user with details gathered from the external data source.

### Adding Custom Function Calls
You can have your GPT call external data sources by adding functions to the `/functions` directory. Follow these steps:

1. Create a function (e.g. `checkInventory.js` in `/functions`)
1. Within `checkInventory.js`, write a function called `checkInventory`.
1. Add information about your function to the `function-manifest.js` file. This information provides context to GPT about what arguments the function takes.

**Important:** Your function's name must be the same as the file name that contains the function (excluding the .js extension). For example, our function is called `checkInventory` so we have named the the file `checkInventory.js`, and set the `name` attribute in `function-manifest.js` to be `checkInventory`.

Example function manifest entry:

```javascript
{
  type: "function",
  function: {
    name: "checkInventory",
    say: "Let me check our inventory right now.",
    description: "Check the inventory of airpods, airpods pro or airpods max.",
    parameters: {
      type: "object",
      properties: {
        model: {
          type: "string",
          "enum": ["airpods", "airpods pro", "airpods max"],
          description: "The model of airpods, either the airpods, airpods pro or airpods max",
        },
      },
      required: ["model"],
    },
    returns: {
      type: "object",
      properties: {
        stock: {
          type: "integer",
          description: "An integer containing how many of the model are in currently in stock."
        }
      }
    }
  },
}
```
#### Using `say` in the Function Manifest
The `say` key in the function manifest allows you to define a sentence for the app to speak to the user before calling a function. For example, if a function will take a long time to call you might say "Give me a few moments to look that up for you..."

### Receiving Function Arguments
When ChatGPT calls a function, it will provide an object with multiple attributes as a single argument. The parameters included in the object are based on the definition in your `function-manifest.js` file.

In the `checkInventory` example above, `model` is a required argument, so the data passed to the function will be a single object like this:

```javascript
{
  model: "airpods pro"
}
```
For our `placeOrder` function, the arguments passed will look like this:

```javascript
{
  model: "airpods pro",
  quantity: 10
}
```
### Returning Arguments to GPT
Your function should always return a value: GPT will get confused when the function returns nothing, and may continue trying to call the function expecting an answer. If your function doesn't have any data to return to the GPT, you should still return a response with an instruction like "Tell the user that their request was processed successfully." This prevents the GPT from calling the function repeatedly and wasting tokens. 

Any data that you return to the GPT should match the expected format listed in the `returns` key of `function-manifest.js`.

## Utility Scripts for Placing Calls
The `scripts` directory contains two files that allow you to place test calls:
- `npm run inbound` will place an automated call from a Twilio number to your app and speak a script. You can adjust this to your use-case, e.g. as an automated test.
- `npm run outbound` will place an outbound call that connects to your app. This can be useful if you want the app to call your phone so that you can manually test it.

## Testing with Jest
Repeatedly calling the app can be a time consuming way to test your tool function calls. This project contains example unit tests that can help you test your functions without relying on the GPT to call them.

Simple example tests are available in the `/test` directory. To run them, simply run `npm run test`.

## Deploy via Fly.io
Fly.io is a hosting service similar to Heroku that simplifies the deployment process. Given Twilio Media Streams are sent and received from us-east-1, it's recommended to choose Fly's Ashburn, VA (IAD) region.

> Deploying to Fly.io is not required to try the app, but can be helpful if your home internet speed is variable.

Modify the app name `fly.toml` to be a unique value (this must be globally unique).

Deploy the app using the Fly.io CLI:
```bash
fly launch

fly deploy
```

Import your secrets from your .env file to your deployed app:
```bash
fly secrets import < .env
```
