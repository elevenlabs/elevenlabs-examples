import * as fs from 'fs';
import ytdl from 'ytdl-core';
import { createDubFromFile } from './createADubFromFile';
import * as dotenv from 'dotenv';

dotenv.config();

async function downloadYoutubeVideo(videoUrl: string, downloadPath: string): Promise<string> {
  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath, { recursive: true });
  }
  
  const videoId = ytdl.getURLVideoID(videoUrl);
  const videoInfo = await ytdl.getInfo(videoId);
  const format = ytdl.chooseFormat(videoInfo.formats, { quality: 'highest' });
  if (!format.url) {
    throw new Error("No URL found for the given video quality.");
  }
  
  const videoOutput = `${downloadPath}/${videoId}.mp4`;
  await new Promise<void>((resolve, reject) => {
    ytdl.downloadFromInfo(videoInfo, {
      format: format,
    })
      .pipe(fs.createWriteStream(videoOutput))
      .on('finish', () => resolve())
      .on('error', (error) => reject(error));
  });
  
  return videoOutput;
}

export async function createDubFromUrl(
  sourceUrl: string,
  outputFilePath: string,
  fileFormat: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string | null> {
  try {
    const downloadPath = 'downloads';
    const inputFilePath = await downloadYoutubeVideo(sourceUrl, downloadPath);
  
    const dubbedFilePath = await createDubFromFile(
      inputFilePath,
      outputFilePath,
      fileFormat,
      sourceLanguage,
      targetLanguage
    );
  
    // Optionally, cleanup the downloaded video
    fs.unlinkSync(inputFilePath);
  
    return dubbedFilePath;
  } catch (error) {
    console.error('An error occurred:', error);
    return null;
  }
}