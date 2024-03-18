import { createAudioFileFromText } from './text-to-speech';

await createAudioFileFromText('This is a test.', 'output.mp3');
