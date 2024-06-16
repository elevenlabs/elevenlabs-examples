import {
  VideoToSFXRequestBody,
  VideoToSFXResponseBody,
} from "@/app/api/interface";

const apiVideoToSFX = async (frames: string[]) => {
  const response = await fetch("/api", {
    method: "POST",
    body: JSON.stringify({ frames } as VideoToSFXRequestBody),
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

export const convertVideoToSFX = async (
  previewUrl: string
): Promise<VideoToSFXResponseBody> => {
  return new Promise(resolve => {
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
      }

      const sfx = await apiVideoToSFX(frames);
      video.removeEventListener("loadeddata", onLoad);
      resolve({
        soundEffects: sfx.soundEffects,
        caption: sfx.caption,
      });
    };
    video.addEventListener("loadeddata", onLoad);
  });
};
