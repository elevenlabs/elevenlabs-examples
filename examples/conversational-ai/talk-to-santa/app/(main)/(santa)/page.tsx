"use client";

import {
  getAgentSignedUrl,
  getSupabaseUploadSignedUrl,
  saveConversationData,
} from "@/app/(main)/(santa)/actions/actions";
import { CallButton } from "@/components/call-button";
import { Orb } from "@/components/orb";
import { SantaCard } from "@/components/santa-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useConversation } from "@11labs/react";
import { motion } from "framer-motion";
import { VideoIcon, VideoOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

export default function Page() {
  const conversation = useConversation();
  const router = useRouter();

  // permission state
  const [hasMediaAccess, setHasMediaAccess] = useState(false);

  // session state
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<
    Array<{ key: string; name: string }>
  >([]);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isEndingCall, setIsEndingCall] = useState(false);
  const [isPreviewVideoLoading, setIsPreviewVideoLoading] = useState(true);

  // refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // video stream handling
  const requestMediaPermissions = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;
      setHasMediaAccess(true);
      return stream;
    } catch (err) {
      console.error(err);
      toast.error(
        "Please grant video/audio media permissions in site settings to continue"
      );
      setHasMediaAccess(false);
      return null;
    }
  };
  useEffect(() => {
    let mounted = true;
    const setupVideoStream = async () => {
      const stream = await requestMediaPermissions();
      if (stream && videoRef.current && mounted) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsPreviewVideoLoading(false);
      } else {
        setIsPreviewVideoLoading(false);
      }
    };
    setupVideoStream();
    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      }
    };
  }, []);

  // call handling
  const startCall = async () => {
    try {
      const req = await getAgentSignedUrl({});
      const signedUrl = req?.data?.signedUrl;
      if (!signedUrl) {
        throw new Error("Failed to get signed URL");
      }
      conversation.startSession({
        signedUrl,
        onConnect: ({ conversationId }) => {
          setConversationId(conversationId);
          startRecordingVideo();
        },
        clientTools: {
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
          triggerRemoveItemFromWishlist: async (parameters: {
            itemKey: string;
          }) => {
            setWishlist(prevWishlist =>
              prevWishlist.filter(item => item.key !== parameters.itemKey)
            );
          },
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to start conversation.");
    }
  };
  const endCall = async (withVideo: boolean = true) => {
    if (!conversationId) {
      toast.error("Conversation not found");
      return;
    }
    setIsEndingCall(true);

    try {
      if (withVideo) {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state !== "inactive"
        ) {
          mediaRecorderRef.current.stop();
          await new Promise(resolve =>
            mediaRecorderRef.current?.addEventListener("stop", resolve, {
              once: true,
            })
          );
        }

        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        if (blob.size < 1) {
          throw new Error("No video recorded to upload!");
        }

        const response = await getSupabaseUploadSignedUrl({
          conversationId,
        });

        if (!response?.data) {
          throw new Error("Failed to retrieve a signed upload URL.");
        }
        const { signedUrl, token } = response.data;

        const uploadResponse = await fetch(signedUrl, {
          method: "PUT",
          headers: {
            "Content-Type": blob.type,
            Authorization: `Bearer ${token}`,
          },
          body: blob,
        });

        if (!uploadResponse.ok) {
          throw new Error("File upload failed.");
        }
        // success
        toast.success("Video uploaded successfully!");
      }

      await saveConversationData({ conversationId, name, wishlist });
      await conversation.endSession();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // redirect to the card page
      router.push(`/cards/${conversationId}`, { scroll: false });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save conversation.");
      setIsEndingCall(false); // Only reset loading state if there's an error
    }
  };

  const startRecordingVideo = () => {
    if (!streamRef.current) {
      toast.error("Unable to record video");
      return;
    }
    chunksRef.current = [];
    const options = {
      mimeType: 'video/webm; codecs=vp8,opus',
      videoBitsPerSecond: 1000000, // 1 Mbps
    };
    const mediaRecorder = new MediaRecorder(streamRef.current, options);
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.ondataavailable = event => {
      chunksRef.current.push(event.data);
    };
    mediaRecorder.start();
  };

  return (
    <div className="overflow-hidden">
      {/* Call Santa Button */}
      <div className="flex flex-col items-center justify-center min-h-screen md:min-h-screen pt-0 md:pt-16">
        {conversation.status !== "connected" && !isEndingCall && (
          <CallButton
            status={conversation.status}
            startCall={startCall}
            hasMediaAccess={hasMediaAccess}
            requestMediaPermissions={requestMediaPermissions}
          />
        )}

        {/* In-Conversation View */}
        {conversation.status === "connected" && (
          <motion.div
            key="connected"
            className="relative flex items-center justify-center w-28 h-28 md:h-64 md:w-64 -mt-16 md:mt-0"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full max-w-[250px] max-h-[250px]">
                <Orb
                  colors={["#000000", "#FF0000"]}
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
              <Image
                src="/assets/santa.webp"
                alt="Santa"
                width={128}
                height={128}
                className="object-cover opacity-90"
                sizes="128px"
              />
            </motion.div>
          )}

          <motion.div
            className={cn(
              "w-32 h-32 rounded-full overflow-hidden border-4 border-red-500 border-opacity-50 shadow-lg relative",
              !hasMediaAccess || (isEndingCall && "hidden")
            )}
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
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover opacity-90"
              onLoadedData={() => {
                setIsPreviewVideoLoading(false);
              }}
              onError={e => {
                console.error(e);
                setIsPreviewVideoLoading(false);
              }}
            />
          </motion.div>
        </div>

        {isEndingCall && (
          <div className="flex flex-col gap-3 mt-4">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
              <span className="text-white">Finishing up...</span>
            </div>
          </div>
        )}

        {conversation.status === "connected" && !isEndingCall && (
          <div
            className={cn(
              "flex flex-col gap-3 mt-4",
              isCardOpen ? "invisible" : "visible"
            )}
          >
            <Button
              variant="default"
              className="px-4 py-2 rounded-full border-emerald-500 border-2 hover:bg-emerald-900/90 bg-white/5 backdrop-blur-[16px] shadow-2xl"
              onClick={() => endCall()}
            >
              Save Card with Video
              <VideoIcon className="w-4 h-4" />
            </Button>

            <Button
              variant="default"
              className="px-4 py-2 rounded-full border-blue-500 border-2 hover:bg-blue-900/90 bg-white/5 backdrop-blur-[16px] shadow-2xl"
              onClick={() => endCall(false)}
            >
              Save Card without Video
              <VideoOffIcon className="w-4 h-4" />
            </Button>

            <Button
              variant="default"
              className="px-4 py-2 rounded-full border-gray-500 border-2 hover:bg-gray-900/90 bg-white/5 backdrop-blur-[16px] shadow-2xl"
              onClick={async () => {
                await conversation.endSession();
                window.location.reload();
              }}
            >
              Restart
            </Button>
          </div>
        )}
        {conversation.status === "connected" && (
          <SantaCard
            conversation={conversation}
            endCall={endCall}
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
