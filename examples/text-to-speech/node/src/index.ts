import 'dotenv/config';
import { createAudioFileFromText } from './text-to-speech';

(async () => {
  await createAudioFileFromText(
    'Today, the sky is exceptionally clear, and the sun shines brightly.',
    'output.mp3',
  );
})();
