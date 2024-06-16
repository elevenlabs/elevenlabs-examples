import {
  VideoToSFXRequestBody,
  VideoToSFXResponseBody,
} from "@/app/api/interface";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

// get the first frame of the video
// convert it to a base64 string
// send it to the api
// get the response
// play the response

const getFramesFromVideo = async (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  time: number
) => {
  return new Promise(resolve => {
    video.currentTime = time;
    console.log("time", time);
    const canPlayThrough = () => {
      setTimeout(() => {
        console.log("canplay");
        const ctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        if (!ctx) {
          throw new Error("canvas context is null");
        }
        ctx.drawImage(video, 0, 0);

        const imageDataUrl = canvas.toDataURL("image/png");
        video.removeEventListener("canplay", canPlayThrough);
        resolve(imageDataUrl);
      }, 50);
    };
    video.addEventListener("canplay", canPlayThrough);
  });
};

export const useVideoToSFX = (previewUrl: string | null) => {
  const [sfx, setSfx] = useState<VideoToSFXResponseBody | null>(null);

  const mutations = {
    convertImagesToSfx: useMutation({
      mutationFn: async (frames: string[]) => {
        const response = await fetch("/api", {
          method: "POST",
          body: JSON.stringify({ frames } as VideoToSFXRequestBody),
        });
        return (await response.json()) as VideoToSFXResponseBody;
      },
    }),
  };

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

        for (let i = 0; i < 4; i++) {
          video.currentTime = i;
          const frame = await getFramesFromVideo(video, canvas, i);
          frames.push(frame as string);
          setFrames(frames);
        }

        mutations.convertImagesToSfx.mutate(frames);
      };
      video.addEventListener("loadeddata", onLoad);
      return () => video.removeEventListener("loadeddata", onLoad);
    };
    getFrames();
  }, [previewUrl]);

  return { frames, mutations };
};
