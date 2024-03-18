import 'dotenv/config';
import { createAudioFileFromText } from './text-to-text';

(async () => {
  await createAudioFileFromText('This is a test.', 'output.mp3');
})();
