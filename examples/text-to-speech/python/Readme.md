# Text-to-Speech Script

This script uses the ElevenLabs API to generate audio from text and save it to a file.

## Installation

1. Clone this repository:

2. Install the required dependencies using pip:


```
pip install -r requirements.txt
```

3. Usage

# Create .env file
Create a .env file with the below configuration inside the _python directory_.

```
API_KEY=""

```

# Adding Pronunciation Dictionary

Navigate to the text-to-speech directory.

Run the following command to add a pronunciation dictionary:

```
python add_pronunciation.py
```

# Generating Audio

Get the pronunciation_dictionary_id and version_id from the response of add_pronunciation.py.

Add these IDs to the text-to-speech.py script for using your custom pronunciation.

Run the following command to generate voice from the text:

```
python text-to-speech.py
```