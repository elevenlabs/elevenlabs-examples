import { ElevenLabsClient } from "elevenlabs";
import fs from "node:fs";
import * as dotenv from "dotenv";
import { Stream } from "node:stream";

async function main() {
  dotenv.config();

  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

  if (!ELEVENLABS_API_KEY) {
    console.log("Missing ELEVENLABS_API_KEY");
    return;
  }

  const client = new ElevenLabsClient({
    apiKey: ELEVENLABS_API_KEY,
  });

  const stream = fs.createReadStream("dictionary.pls", { encoding: "utf-8" });

  const pronunciationDictionary =
    await client.pronunciationDictionary.addFromFile(stream, {
      name: "example",
    });

  const createdRules =
    await client.pronunciationDictionary.getPlsFileWithAPronunciationDictionaryVersionRules(
      pronunciationDictionary.id,
      pronunciationDictionary.version_id
    );

  console.log("-- initial rules --");
  console.log(`Rules: ${createdRules}`);

  const audio1 = await client.generate({
    text: "Without the dictionary: tomato",
    voice: "Rachel",
    model_id: "eleven_turbo_v2",
  });

  const audio2 = await client.generate({
    text: "Without the dictionary: tomato",
    voice: "Rachel",
    model_id: "eleven_turbo_v2",
    pronunciation_dictionary_locators: [
      {
        pronunciation_dictionary_id: pronunciationDictionary.id,
        version_id: pronunciationDictionary.version_id,
      },
    ],
  });

  const pronunciationDictionaryRulesRemoved =
    await client.pronunciationDictionary.removeRulesFromThePronunciationDictionary(
      pronunciationDictionary.id,
      {
        rule_strings: ["tomato", "Tomato"],
      }
    );

  const removedRules =
    await client.pronunciationDictionary.getPlsFileWithAPronunciationDictionaryVersionRules(
      pronunciationDictionary.id,
      pronunciationDictionary.version_id
    );

  console.log("\n\n-- removed rule --\n\n");
  console.log(`Rules: ${removedRules}`);

  const audio3 = await client.generate({
    text: "With the rule removed: tomato",
    voice: "Rachel",
    model_id: "eleven_turbo_v2",
    pronunciation_dictionary_locators: [
      {
        pronunciation_dictionary_id: pronunciationDictionaryRulesRemoved.id,
        version_id: pronunciationDictionaryRulesRemoved.version_id,
      },
    ],
  });

  const pronunciationDictionaryRulesAdded =
    await client.pronunciationDictionary.addRulesToThePronunciationDictionary(
      pronunciationDictionaryRulesRemoved.id,
      {
        rules: [
          {
            type: "phoneme",
            alphabet: "ipa",
            string_to_replace: "tomato",
            phoneme: "/tə'meɪtoʊ/",
          },
          {
            type: "phoneme",
            alphabet: "ipa",
            string_to_replace: "Tomato",
            phoneme: "/tə'meɪtoʊ/",
          },
        ],
      }
    );

  const addedRules =
    await client.pronunciationDictionary.getPlsFileWithAPronunciationDictionaryVersionRules(
      pronunciationDictionaryRulesAdded.id,
      pronunciationDictionaryRulesAdded.version_id
    );

  console.log("-- added rules --");
  console.log(`Rules: ${addedRules}`);

  const audio4 = await client.generate({
    text: "With the rule added again: tomato",
    voice: "Rachel",
    model_id: "eleven_turbo_v2",
    pronunciation_dictionary_locators: [
      {
        pronunciation_dictionary_id: pronunciationDictionaryRulesAdded.id,
        version_id: pronunciationDictionaryRulesAdded.version_id,
      },
    ],
  });

  for (const [i, audio] of [audio1, audio2, audio3, audio4].entries()) {
    await saveAudioFile(i, audio);
  }
}

const saveAudioFile = async (
  audioNumber: number,
  stream: Stream
): Promise<string> => {
  return new Promise<string>(async (resolve, reject) => {
    try {
      const filename = `audio_${audioNumber}.mp3`;
      const fileStream = fs.createWriteStream(filename);
      stream.pipe(fileStream);
      fileStream.on("finish", () => resolve(filename)); // Resolve with the fileName
      fileStream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
};

main();
