import {
  VideoToSFXRequestBody,
  VideoToSFXResponseBody,
} from "@/app/api/interface";

const apiVideoToSFX = async (frames: string[]) => {
  const response = await fetch("/api", {
    method: "POST",
    body: JSON.stringify({ frames } as VideoToSFXRequestBody),
  });
  if (!response.ok) {
    throw new Error(
      `Unable to convert video to sound effects: ${response.statusText}`
    );
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
    const canPlayThrough = () => {
      setTimeout(() => {
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
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = previewUrl;
    const onLoad = async () => {
      try {
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
      } catch (e) {
        debugger;
        video.removeEventListener("loadeddata", onLoad);
        console.error(e);
        reject(e);
      }
    };
    video.addEventListener("loadeddata", onLoad);
  });
};
