import requests
import json

from pathlib import Path
from elevenlabs.client import ElevenLabs
from elevenlabs import play, save, PronunciationDictionaryVersionLocator, VoiceSettings


class PronunciationFinder:
    def __init__(self, api_key, dictionary_file="dict.PLS", voice_id="21m00Tcm4TlvDq8ikWAM", 
                 optimize_streaming_latency="0", output_format="mp3_22050_32", name="dictionary"):
        self.client = ElevenLabs(api_key=api_key)
        self.api_key = api_key
        self.dictionary_path = Path(__file__).resolve().parent
        self.base_url = 'https://api.elevenlabs.io/v1/'
        self.optimize_streaming_latency = optimize_streaming_latency
        self.voice_id = voice_id
        self.output_format = output_format
        self.name = name 
        self.dictionary_file = dictionary_file
        self.dictionary_id = None 
        self.dictionary_version_id = None 
        self.model_id = "eleven_turbo_v2"
        self.track_words = 'track_words.json'
        
        

    def load_dictionary(self):
        """This function help to load the dictionary to elevenlabs models for pronunciation training"""
        
        response = requests.post(
            f"{self.base_url}/pronunciation-dictionaries/add-from-file",
            headers={
                "xi-api-key":self.api_key
            },
            data={
                'name': json.dumps("dictionary"),
            },
            files={
                'file': (f"{self.dictionary_path}/{self.dictionary_file}", open(f"{self.dictionary_path}/{self.dictionary_file}", 'rb')),
            },
        )
        
        data = response.json()
        self.dictionary_id = data.get('id')
        self.dictionary_version_id = data.get('version_id')
        
        
    def add_phonetic_word_to_dictionary(self):
        """"This function help to add user input into the prnunciation library along with the phonetic sound.
        
        Also, it help to keep track if the word is in the pronunciation dictionary, if it is, it will not ask 
        for phonetic sound, if the word is not in the pronuncing dictionary, it will ask user to input the 
        phonetic sound. 
        
        Return: return user input (name)
        """
        
        name = input("Enter words you want to add to pronunciation dictionary: ").strip().capitalize()
        is_word_exist_in_dict = self.check_word_exists(name)
        
        if not is_word_exist_in_dict: 
            phonetic_sound = input(f"Input the phonetic sound of {name}: ").strip()
            with open(f"{self.dictionary_path}/{self.dictionary_file}", mode="+a") as f:
                f.write(f'\n<phoneme alphabet="ipa" ph="{phonetic_sound}">{name}</phoneme>\n')
            self.track_word(name)
            
        return name 
        
    def call_elevenlabs_text_to_speech(self, word, user_voice_settings=None, use_pronunciation_dictionary=None):
        """This function help to call elevenlabs text-to-speech to function and returned a generator which contain the sound
        
        Keyword arguments:
        argument -- description
        word -- str
        user_voice_settings -- Use to determine whether to user voice settings or not 
        use_pronunciation_dictionary -- Use to determine whether to use pronunciation dictionary or not 
        Return: generator object response 
        """
        
        voice_settings = VoiceSettings( 
                        stability=0.5,
                        similarity_boost=0.5,
                        style=0.5,
                        use_speaker_boost=True,
                    )
        pronunciation_dictionary = []
        if self.dictionary_id and self.dictionary_version_id:
            pronunciation_dictionary = [
                            PronunciationDictionaryVersionLocator(
                                pronunciation_dictionary_id=self.dictionary_id ,
                                version_id=self.dictionary_version_id,
                            )
                        ]
        
        response = self.client.text_to_speech.convert(
                    voice_id=self.voice_id, 
                    text=word, 
                    optimize_streaming_latency=self.optimize_streaming_latency , 
                    output_format=self.output_format, 
                    voice_settings=voice_settings if user_voice_settings else None,
                    pronunciation_dictionary_locators= pronunciation_dictionary if use_pronunciation_dictionary else None,
                    model_id=self.model_id
                )
        return response
        
    def pronounce_word(self, user_voice_settings=False, use_pronunciation_dictionary=False):
        """This function pronuoce user input with no phonetic sound
        
        Keyword arguments:
        argument -- description
        user_voice_settings -- Use to determine whether to user voice settings or not 
        use_pronunciation_dictionary -- Use to determine whether to use pronunciation dictionary or not
        Return: None
        """
        
        word = input('Enter word you want to convert to speech: ')
        response = self.call_elevenlabs_text_to_speech(word, user_voice_settings, use_pronunciation_dictionary)
        play(response)
        
    def pronounce_word_using_pronunciation_dictionary(self):
        """This function pronounce user input using the pronunciation dictionary"""
        
        word = self.add_phonetic_word_to_dictionary()
        response = self.call_elevenlabs_text_to_speech(word, user_voice_settings=True, use_pronunciation_dictionary=True)
        play(response)
        
    def load_words(self):
        """This function helps to load existing words that have been load into the pronunciation dictionary"""
        
        try:
            with open(f"{self.dictionary_path}/{self.track_words}", mode="r") as file:
                print(file)
                data = json.load(file)
                print(data)
                return data['words']
        except (FileNotFoundError, json.JSONDecodeError) as err:
            print(err)
            return []
        
    def track_word(self, new_word):
        """This help to track every word that will be add to the pronunciation dictionary."""
        
        words = self.load_words()
        if new_word not in words:
            words.append(new_word.capitalize())
            with open(f"{self.dictionary_path}/{self.track_words}", 'w') as file:
                json.dump({"words": words}, file, indent=4)
            print(f"Word '{new_word}' added.")
        else:
            print(f"Word '{new_word}' already in dictionary.")
            
            
    def check_word_exists(self, word):
        """This function help to check for a word in track_words.json file to verify the existance of such word in it. 
        
        Keyword arguments:
        argument -- description
        word --  word to check for the existance in the track file
        Return: return True if found, otherwise False
        """
        words = self.load_words()
        return word in words


if __name__ == "__main__":
    api_key = input('Enter your elevenlabs API key').strip()
    finder = PronunciationFinder(api_key)
    message = """
    Will you like to convert text-to-speech with or without pronunciation dictionary?
    If without pronunciation dictionary, input 0, else input 1 : 
    """
    speech_condition = input(message)
    if speech_condition not in ['0', '1']:
        print('You can only choose between 0 and 1')
        exit()
    if speech_condition == '0':
        finder.pronounce_word()
    else:
        finder.pronounce_word_using_pronunciation_dictionary()

