"use client";

import { LiveSantaCardDrawer } from "@/components/live-santa-card-drawer";
import { Orb } from "@/components/orb";
import { cn } from "@/lib/utils";
import { useConversation } from "@11labs/react";
import { AnimatePresence, motion } from "framer-motion";
import { Phone } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Snowfall from "react-snowfall";
import { ChristmasCountdown } from "@/components/christmas-countdown";
import { Logo } from "@/components/logo/animated-logo";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SaveSantaCardDrawer } from "@/components/save-santa-card-drawer";
import { MusicPlayer } from "@/components/music-player";

export default function Home() {
  const [isLiveSantaCardDrawerOpen, setIsLiveSantaCardDrawerOpen] =
    useState(false);
  const [isConversationDrawerOpen, setIsConversationComplete] = useState(false);

  const [isPhoneRinging, setIsPhoneRinging] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<
    Array<{ key: string; name: string }>
  >([]);

  // Video state
  const [enableVideo, setEnableVideo] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPreviewVideoLoading, setIsPreviewVideoLoading] = useState(true);

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
    if (name || wishlist.length > 0) {
      setIsLiveSantaCardDrawerOpen(true);
    }
  }, [name, wishlist]);

  const [ringingPhoneAudio] = useState(() => {
    if (typeof Audio !== "undefined") {
      const audioInstance = new Audio("/assets/ringing-phone.mp3");
      audioInstance.loop = true;
      return audioInstance;
    }
    return null;
  });
  const conversation = useConversation();

  const handleCallClick = async () => {
    if (conversation.status === "disconnected") {
      setIsPhoneRinging(true);
      ringingPhoneAudio?.play();
      const signedUrl = await getSignedUrl();
      setTimeout(() => {
        setIsPhoneRinging(false);
        ringingPhoneAudio?.pause();
        // Get signed URL before starting the session
        conversation.startSession({
          signedUrl,
          onConnect: ({ conversationId }) => {
            setConversationId(conversationId);
            // Start recording if video is enabled
            if (enableVideo && videoStream) {
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
            }
          },
          clientTools: {
            triggerName: async (parameters: { name: string }) => {
              setName(parameters.name);
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
            triggerRemoveItemFromWishlist: async (parameters: {
              itemKey: string;
            }) => {
              setWishlist(prevWishlist =>
                prevWishlist.filter(item => item.key !== parameters.itemKey)
              );
            },
          },
        });
      }, 6000);
    }
  };

  const handleEndCallClick = async () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    setEnableVideo(false);
    await conversation.endSession();
    videoStream?.getTracks().forEach(track => track.stop());
    setVideoStream(null);
    setIsConversationComplete(true);
  };

  // First effect to handle stream setup
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const setupVideoStream = async () => {
      console.log("Setting up video stream, enableVideo:", enableVideo);

      if (enableVideo) {
        try {
          console.log("Requesting user media...");
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });

          console.log("Stream obtained:", stream.active);
          currentStream = stream;
          setVideoStream(stream);
          setCameraError(null);
        } catch (err) {
          console.error("Error accessing camera:", err);
          setCameraError("Unable to access camera");
          setEnableVideo(false);
        }
      }
    };

    setupVideoStream();

    return () => {
      console.log("Cleanup running, currentStream:", !!currentStream);
      if (currentStream) {
        currentStream.getTracks().forEach(track => {
          console.log("Stopping track:", track.kind, track.enabled);
          track.stop();
        });
      }
    };
  }, [enableVideo]);

  // New effect to handle video element
  useEffect(() => {
    if (videoStream && videoRef.current) {
      console.log("Setting video stream to video element");
      videoRef.current.srcObject = videoStream;
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [videoStream]);

  return (
    <div className="relative min-h-screen overflow-hidden font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex justify-between p-4 z-10">
        <Logo />
        <ChristmasCountdown />
      </div>

      <main>
        {/* Call Santa Button */}
        <div className="flex flex-col items-center justify-center min-h-screen">
          <motion.button
            className={cn(
              "relative flex items-center justify-center text-white rounded-full shadow-lg opacity-90",
              conversation.status === "connected" ? "w-72 h-72" : "w-64 h-16",
              conversation.status === "disconnected"
                ? "bg-red-700 hover:bg-red-600"
                : conversation.status === "connecting"
                ? "bg-red-500"
                : "bg-red-500 bg-opacity-20"
            )}
            onClick={handleCallClick}
            initial="disconnected"
            animate={conversation.status}
            variants={{
              disconnected: {
                width: 256,
                height: 64,
                borderRadius: "32px",
                backgroundColor: "rgb(185 28 28)",
              },
              connecting: { width: 300, height: 64, borderRadius: "32px" },
              connected: {
                width: 250,
                height: 250,
                borderRadius: "50%",
                backgroundColor: "rgba(239, 68, 68, 0.2)",
              },
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <AnimatePresence mode="wait">
              {conversation.status === "disconnected" && !isPhoneRinging && (
                <motion.div
                  key="disconnected"
                  className="relative flex items-center w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <img
                      src="/assets/santa.jpg"
                      alt="Santa"
                      className="w-12 h-12 rounded-full"
                    />
                    <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  </div>

                  <span className="text-lg ml-10 font-semibold flex-1 text-center">
                    Call Santa
                  </span>
                </motion.div>
              )}
              {conversation.status === "connecting" ||
                (isPhoneRinging && (
                  <motion.div
                    key="connecting"
                    className="flex items-center space-x-2"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  >
                    <span className="text-lg font-semibold">Ringing...</span>
                  </motion.div>
                ))}

              {conversation.status === "connected" && (
                <motion.div
                  key="connected"
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 flex fade-in-animation items-center justify-center">
                      <Orb
                        colors={["#ff0000", "#008000"]}
                        getInputVolume={conversation.getInputVolume}
                        getOutputVolume={conversation.getOutputVolume}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {conversation.status === "disconnected" && (
            <>
              <div className="mt-4 flex items-center space-x-2">
                <Switch
                  id="video-mode"
                  checked={enableVideo}
                  onCheckedChange={setEnableVideo}
                />
                <Label htmlFor="video-mode" className="text-white font-bold">
                  Record Video
                </Label>
                {cameraError && (
                  <span className="text-red-400 text-sm ml-2">
                    {cameraError}
                  </span>
                )}
              </div>
            </>
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

            {enableVideo && videoStream && (
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

          {/* Open Card Drawer Button */}
          {(name || wishlist.length > 0) && (
            <LiveSantaCardDrawer
              isOpen={isLiveSantaCardDrawerOpen}
              setIsOpen={setIsLiveSantaCardDrawerOpen}
              name={name}
              wishlist={wishlist}
            />
          )}

          {isConversationDrawerOpen && (
            <SaveSantaCardDrawer
              isOpen={true}
              name={name}
              wishlist={wishlist}
              conversationId={"H4ZIASOGYfPT9IPSGtF7"}
              recordedVideo={recordedVideo}
            />
          )}

          {conversation.status === "connected" && (
            <motion.button
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-full shadow-lg"
              onClick={handleEndCallClick}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              End Call
            </motion.button>
          )}
        </div>
      </main>

      {/* Background */}
      <div
        className="absolute inset-0 z-[-2]"
        style={{
          background: `radial-gradient(circle, rgb(168 0 0 / 50%) 20%, rgba(0,0,0,0.7) 100%), url('/assets/background.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "color-burn",
        }}
      />
      <div className="absolute inset-0 z-[-1]">
        <Snowfall
          snowflakeCount={200}
          speed={[0.1, 0.5]}
          opacity={[0.3, 0.8]}
          radius={[0.5, 2.5]}
          wind={[-0.5, 1]}
        />
      </div>
      <MusicPlayer />
    </div>
  );
}

async function getSignedUrl(): Promise<string> {
  const response = await fetch("/api/signed-url");
  if (!response.ok) {
    throw Error("Failed to get signed url");
  }
  const data = await response.json();
  return data.signedUrl;
}
