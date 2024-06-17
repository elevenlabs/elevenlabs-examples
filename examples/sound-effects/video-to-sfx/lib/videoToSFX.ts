import { maxDuration } from "./../app/api/route";
import { posthog } from "posthog-js";
import {
  VideoToSFXRequestBody,
  VideoToSFXResponseBody,
} from "@/app/api/interface";

const apiVideoToSFX = async (frames: string[], maxDuration: number) => {
  posthog?.capture("video_to_sfx_started");
  const response = await fetch("/api", {
    method: "POST",
    body: JSON.stringify({ frames, maxDuration } as VideoToSFXRequestBody),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed: ${errorText}`);
  }
  return (await response.json()) as VideoToSFXResponseBody;
};

const getFramesFromVideo = async (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  time: number
) => {
  return new Promise(resolve => {
    video.currentTime = time;
    setTimeout(() => {
      const ctx = canvas.getContext("2d");
      canvas.width = 150;
      canvas.height = 100;
      if (!ctx) {
        throw new Error("canvas context is null");
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageDataUrl = canvas.toDataURL("image/png");
      resolve(imageDataUrl);
    }, 100);
  });
};

export const convertVideoToSFX = async (
  previewUrl: string
): Promise<VideoToSFXResponseBody> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.muted = true;
    video.autoplay = true;
    const onLoad = async () => {
      try {
        const canvas = document.createElement("canvas");

        const frames: string[] = [];
        for (let i = 0; i < 4; i++) {
          video.currentTime = i;
          const frame = await getFramesFromVideo(video, canvas, i);
          frames.push(frame as string);
        }
        const sfx = await apiVideoToSFX(frames, video.duration);
        resolve({
          soundEffects: sfx.soundEffects,
          caption: sfx.caption,
        });
        video.removeEventListener("loadeddata", onLoad);
      } catch (e) {
        reject(e);
        video.removeEventListener("loadeddata", onLoad);
      }
    };
    video.addEventListener("loadeddata", onLoad);
    video.src = previewUrl;
  });
};
