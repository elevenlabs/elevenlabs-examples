import {
  VideoToSFXRequestBody,
  VideoToSFXResponseBody,
} from "@/app/api/interface";
import { useEffect, useRef, useState } from "react";

// get the first frame of the video
// convert it to a base64 string
// send it to the api
// get the response
// play the response

const apiVideoToSFX = async (previewUrl: string | null) => {
  const response = await fetch("/api", {
    method: "POST",
    body: JSON.stringify({ frames: [previewUrl] } as VideoToSFXRequestBody),
  });
  return (await response.json()) as VideoToSFXResponseBody;
};

const getFramesFromVideo = async (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  time: number
) => {
  return new Promise(resolve => {
    video.currentTime = time;
    console.log("time", time);
    const canPlayThrough = () => {
      console.log("canplaythrough");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("canvas context is null");
      }
      ctx.drawImage(video, 0, 0);

      const imageDataUrl = canvas.toDataURL("image/png");
      resolve(imageDataUrl);
    };
    video.addEventListener("canplaythrough", canPlayThrough);
    return () => video.removeEventListener("canplaythrough", canPlayThrough);
  });
};

export const useVideoToSFX = (previewUrl: string | null) => {
  const [sfx, setSfx] = useState<VideoToSFXResponseBody | null>(null);

  // TODO: can remove frame, just used for debugging
  const [frames, setFrames] = useState<string[]>([]);

  useEffect(() => {
    const getFrames = async () => {
      if (!previewUrl) {
        return;
      }
      const video = document.createElement("video");
      video.src = previewUrl;
      const onLoad = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const frames: string[] = [];

        for (let i = 1; i < 5; i++) {
          video.currentTime = i + 0.1;
          const frame = await getFramesFromVideo(video, canvas, i);
          frames.push(frame as string);
        }

        setFrames(frames);
      };
      video.addEventListener("loadeddata", onLoad);
      return () => video.removeEventListener("loadeddata", onLoad);
    };
    getFrames();
  }, [previewUrl]);

  return { frames, sfx };
};
