import { createAudioFileFromText } from './text-to-speech/text-to-speech-file.ts';

await createAudioFileFromText('This is a test.', 'output.mp3');
