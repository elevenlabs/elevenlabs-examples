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

function getFirstFrameFromVideo(
  videoRef: HTMLVideoElement,
  canvasRef: HTMLCanvasElement | null
) {
  if (!canvasRef) {
    throw new Error("canvasRef is null");
  }
  const video = videoRef;
  const canvas = canvasRef;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageDataUrl = canvas.toDataURL("image/png");
  return imageDataUrl;
}

export const useVideoToSFX = (previewUrl: string | null) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(
    typeof window !== "undefined" ? document.createElement("canvas") : null
  );
  // TODO: can remove frame, just used for debugging
  const [frame, setFrame] = useState<string | null>(null);
  useEffect(() => {
    const captureFrame = async () => {
      // TODO: find better way than the timeout
      setTimeout(async () => {
        if (videoRef.current) {
          const imageDataUrl = getFirstFrameFromVideo(
            videoRef.current,
            canvasRef?.current
          );
          setFrame(imageDataUrl);
          const response = await apiVideoToSFX(imageDataUrl);
          console.log(response);
        }
      }, 100);
    };

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.addEventListener("loadeddata", captureFrame);
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("loadeddata", captureFrame);
      }
    };
  }, [previewUrl, canvasRef, videoRef]);

  return { videoRef };
};
