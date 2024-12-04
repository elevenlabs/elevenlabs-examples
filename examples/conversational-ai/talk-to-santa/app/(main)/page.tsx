"use client";

import { getAgentSignedUrl } from "@/app/(main)/actions/actions";
import { CallButton } from "@/components/call-button";
import { Orb } from "@/components/orb";
import { SantaCard } from "@/components/santa-card";
import { Button } from "@/components/ui/button";
import { useConversation } from "@11labs/react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function Page() {
  const conversation = useConversation();

  const [isCardOpen, setIsCardOpen] = useState(false);

  // session state
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<
    Array<{ key: string; name: string }>
  >([]);

  // video state
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isPreviewVideoLoading, setIsPreviewVideoLoading] = useState(true);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);

  // refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const getMedia = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };
    getMedia();
  }, []);

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const setupVideoStream = async () => {
      if (isVideoEnabled) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          currentStream = stream;
          setVideoStream(stream);
        } catch (err) {
          console.error("Error accessing camera:", err);
          alert("Unable to access camera");
          setIsVideoEnabled(false);
        }
      }
    };
    setupVideoStream();
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => {
          track.stop();
        });
      }
    };
  }, [isVideoEnabled]);

  useEffect(() => {
    if (videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream;
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [videoStream]);

  const startCall = async () => {
    const req = await getAgentSignedUrl({});
    const signedUrl = req?.data?.signedUrl;
    if (!signedUrl) {
      throw new Error("Failed to get signed URL");
    }
    conversation.startSession({
      signedUrl,
      onConnect: ({ conversationId }) => {
        setConversationId(conversationId);
        if (isVideoEnabled) {
          startRecordingVideo();
        }
      },
      clientTools: tools,
    });
  };

  const endCall = async () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsVideoEnabled(false);
    await conversation.endSession();
    videoStream?.getTracks().forEach(track => track.stop());
    setVideoStream(null);

    // save the conversation
    console.log("saving conversation");
    console.log(conversationId)
    console.log(recordedVideo)
  };

  const startRecordingVideo = () => {
    if (!videoStream) {
      alert("unable to record video");
      return;
    }
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(videoStream);
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.ondataavailable = event => {
      chunksRef.current.push(event.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {
        type: "video/webm",
      });
      const videoUrl = URL.createObjectURL(blob);
      setRecordedVideo(videoUrl);
    };
    mediaRecorder.start();
  };

  const tools = {
    triggerName: async (parameters: { name: string }) => {
      setName(parameters.name);
      setIsCardOpen(true);
    },
    triggerAddItemToWishlist: async (parameters: {
      itemName: string;
      itemKey: string;
    }) => {
      setWishlist(prevWishlist => [
        ...prevWishlist,
        { name: parameters.itemName, key: parameters.itemKey },
      ]);
    },
    triggerRemoveItemFromWishlist: async (parameters: { itemKey: string }) => {
      setWishlist(prevWishlist =>
        prevWishlist.filter(item => item.key !== parameters.itemKey)
      );
    },
  };

  return (
    <div>
      {/* Call Santa Button */}
      <div className="flex flex-col items-center justify-center min-h-screen">
        {conversation.status !== "connected" && (
          <CallButton
            status={conversation.status}
            startCall={startCall}
            isVideoEnabled={isVideoEnabled}
            setIsVideoEnabled={setIsVideoEnabled}
          />
        )}

        {/* In-Conversation View */}
        {conversation.status === "connected" && (
          <motion.div
            key="connected"
            className="relative flex items-center justify-center w-64 h-64" // Added fixed dimensions
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full max-w-[250px] max-h-[250px]">
                <Orb
                  colors={["#ff0000", "#008000"]}
                  getInputVolume={conversation.getInputVolume}
                  getOutputVolume={conversation.getOutputVolume}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div className="mt-4 flex space-x-4">
          {conversation.status === "connected" && (
            <motion.div
              className="w-32 h-32 rounded-full overflow-hidden border-4 border-red-500 border-opacity-50 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <img
                src="/assets/santa.jpg"
                alt="Santa"
                className="w-full h-full object-cover opacity-90"
              />
            </motion.div>
          )}

          {isVideoEnabled && videoStream && (
            <motion.div
              className="w-32 h-32 rounded-full overflow-hidden border-4 border-red-500 border-opacity-50 shadow-lg relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {isPreviewVideoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                </div>
              )}
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover opacity-90"
                onLoadedMetadata={e => {
                  console.log("Video metadata loaded");
                  const videoElement = e.target as HTMLVideoElement;
                  videoElement.play().catch(err => {
                    console.warn("Video play error:", err);
                  });
                }}
                onLoadedData={() => setIsPreviewVideoLoading(false)}
                onError={() => setIsPreviewVideoLoading(false)}
              />
            </motion.div>
          )}
        </div>

        {conversation.status === "connected" && (
          <Button
            variant="default"
            className="mt-4 px-4 py-2 rounded-full border-red-500 border-2 hover:bg-red-900/90 bg-white/5 backdrop-blur-[16px] shadow-2xl"
            onClick={endCall}
          >
            Save & End the Call
          </Button>
        )}

        {conversation.status === "connected" && (
          <SantaCard
            isOpen={isCardOpen}
            setIsOpen={setIsCardOpen}
            name={name}
            wishlist={wishlist}
          />
        )}
      </div>
    </div>
  );
}
