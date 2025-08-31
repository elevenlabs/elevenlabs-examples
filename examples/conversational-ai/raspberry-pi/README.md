# Raspberry Pi Voice Assistant with ElevenLabs Conversational AI

## Requirements

- A Raspberry Pi 5 or similar device.
- A microphone and speaker.
- Python 3.9 or higher installed on your machine.
- An ElevenLabs account with an [API key](/app/settings/api-keys).

## Setup

### Install dependencies

On Debian-based systems you can install the dependencies with:

```bash
sudo apt-get update
sudo apt-get install libportaudio2 libportaudiocpp0 portaudio19-dev libasound-dev libsndfile1-dev -y
```

### Create the project

On your Raspberry Pi, open the terminal and create a new directory for your project.

```bash
mkdir eleven-voice-assistant
cd eleven-voice-assistant
```

Create a new virtual environment and install the dependencies:

```bash
python -m venv .venv # Only required the first time you set up the project
source .venv/bin/activate
```

Install the dependencies:

```bash
pip install tflite-runtime
pip install librosa
pip install EfficientWord-Net
pip install elevenlabs
pip install "elevenlabs[pyaudio]"
```

## Agent configuration

<Steps>
  <Step title="Sign in to ElevenLabs">
    Go to [elevenlabs.io](https://elevenlabs.io/sign-up) and sign in to your account.
  </Step>
  <Step title="Create a new agent">
    Navigate to [Conversational AI > Agents](https://elevenlabs.io/app/conversational-ai/agents) and
    create a new agent from the blank template.
  </Step>
  <Step title="Set the first message">
    Set the first message and specify the dynamic variable for the platform.

    ```txt
    {{greeting}} {{user_name}}, Eleven here, what's up?
    ```

  </Step>
  <Step title="Set the system prompt">
    Set the system prompt. You can find our best practises docs [here](/docs/conversational-ai/best-practices/prompting-guide).

    ```txt
    You are a helpful conversational AI assistant with access to a weather tool. When users ask about
    weather conditions, use the get_weather tool to fetch accurate, real-time data. The tool requires
    a latitude and longitude - use your geographic knowledge to convert location names to coordinates
    accurately.

    Never ask users for coordinates - you must determine these yourself. Always report weather
    information conversationally, referring to locations by name only. For weather requests:

    1. Extract the location from the user's message
    2. Convert the location to coordinates and call get_weather
    3. Present the information naturally and helpfully

    For non-weather queries, provide friendly assistance within your knowledge boundaries. Always be
    concise, accurate, and helpful.
    ```

  </Step>
  <Step title="Set up a server tool">
    We'll set up a simple server tool that will fetch the weather data for us. Follow the setup steps [here](/docs/conversational-ai/customization/tools/server-tools#configure-the-weather-tool) to set up the tool.
  </Step>
</Steps>

## Run the app

To run the app, first set the required environment variables:

```bash
export ELEVENLABS_API_KEY=YOUR_API_KEY
export ELEVENLABS_AGENT_ID=YOUR_AGENT_ID
```

Then simply run the following command:

```bash
python hotword.py
```

Now say "Hey Eleven" to start the conversation. Happy chattin'!

## [Optional] Train your custom hotword

### Generate training audio

To generate the hotword embeddings, you can use ElevenLabs to generate four training samples. Simply navigate to [Text To Speech](https://elevenlabs.io/app/speech-synthesis/text-to-speech) within your ElevenLabs app, and type in your hotword, e.g. "Hey Eleven". Select a voice and click on the "Generate" button.

After the audio has been generated, download the audio file and save them into a folder called `hotword_training_audio` at the root of your project. Repeat this process three more times with different voices.

### Train the hotword

In your terminal, with your virtual environment activated, run the following command to train the hotword:

```bash
python -m eff_word_net.generate_reference --input-dir hotword_training_audio --output-dir hotword_refs --wakeword hey_eleven --model-type resnet_50_arc
```

This will generate the `hey_eleven_ref.json` file in the `hotword_refs` folder. Now you simply need to update the `reference_file` parameter in the `HotwordDetector` class in `hotword.py` to point to the new reference file and you're good to go!
