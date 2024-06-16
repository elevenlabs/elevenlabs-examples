import {
  VideoToSFXRequestBody,
  VideoToSFXResponseBody,
} from "@/app/api/interface";
import { useEffect, useRef } from "react";

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

export const useVideoToSFX = (previewUrl: string | null) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement("canvas"));
  useEffect(() => {
    const captureFrame = async () => {
      if (videoRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL("image/png");
        console.log(imageDataUrl); // Use this data URL as needed
        const response = await apiVideoToSFX(imageDataUrl);
        console.log(response);
      }
    };

    if (videoRef.current) {
      videoRef.current.addEventListener("loadeddata", captureFrame);
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("loadeddata", captureFrame);
      }
    };
  }, [previewUrl]);

  return { videoRef };
};
