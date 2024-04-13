from pathlib import Path
from elevenlabs.client import ElevenLabs
from elevenlabs import play

class PronunciationFinder:
    def __init__(self, api_key, dictionary_file="dictionary.txt"):
        self.client = ElevenLabs(api_key=api_key)
        self.dictionary_path = Path(__file__).resolve().parent
        self.mapped_words = {}
        self.load_dictionary(dictionary_file)

    def load_dictionary(self, dictionary_file):
        with open(f"{self.dictionary_path}/{dictionary_file}", mode="r") as f:
            dictionary_words = f.readlines()
            for word in dictionary_words:
                word, pronunciation = word.split('  ', maxsplit=2)
                self.mapped_words[f"{word.strip()}"] = {"name": word.strip(), "pronunciation": pronunciation.strip()}

    def search_word(self, word_to_search):
        word_to_search = word_to_search.strip().upper()
        result = self.mapped_words.get(word_to_search, None)
        if result:
            word = result.get('name')
            pronunciation = result.get('pronunciation')
            print(f"{word}: {pronunciation}")
            voice = self.client.voices.get_all()
            response = self.client.generate(text=word, voice=voice.voices[0])
            print(response)
            play(response)
        else:
            print("Word not found in dictionary.")

if __name__ == "__main__":
    api_key = input('Input your API key from elevenlabs')
    finder = PronunciationFinder(api_key)
    word_to_search = input("Enter the word you want to search: ")
    finder.search_word(word_to_search)
