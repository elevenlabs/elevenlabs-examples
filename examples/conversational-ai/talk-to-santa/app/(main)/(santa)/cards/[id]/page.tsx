"use client";

import {
  getAgentConversation,
  getAgentConversationAudio,
  getConversationData,
} from "@/app/(main)/(santa)/actions/actions";
import { christmasFont } from "@/components/custom-fonts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const params = useParams();
  const id = params.id as string;

  const [conversationMetadata, setConversationMetadata] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [audio, setAudio] = useState<string | null>(null);

  const video = `https://iifpdwenjojkwnidrlxl.supabase.co/storage/v1/object/public/media/media/${id}.mp4`;

  useEffect(() => {
    const checkVideoExists = async () => {
      try {
        const response = await fetch(video);
        if (response.ok) {
          setVideoUrl(video);
        } else {
          setVideoUrl(null);
        }
      } catch (err) {
        console.error(err);
        setVideoUrl(null);
      }
    };
    checkVideoExists();
  }, [video]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getConversationData({ conversationId: id });
      setConversationMetadata(response?.data);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchConversation = async () => {
      try {
        const result = await getAgentConversation({ conversationId: id });
        if (result?.data?.conversation) {
          const isProcessing = result.data.conversation.status === "processing";
          if (!isProcessing) {
            setIsLoading(false);
            const audio = await getAgentConversationAudio({
              conversationId: id,
            });
            if (audio?.data?.audio) {
              setAudio(audio.data.audio);
            }
            return true;
          }
          return false;
        }
        return false;
      } catch (err) {
        console.log(err);
        toast.error("Unable to fetch conversation. Please try again later.");
        return false;
      }
    };

    const pollConversation = async () => {
      const shouldStop = await fetchConversation();
      if (!shouldStop) {
        timeoutId = setTimeout(pollConversation, 5000);
      }
    };

    pollConversation();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center mt-8">
        <Loader2 className="p-4 rounded-full text-white h-20 w-20 animate-spin" />
        <span className="mt-2 text-white font-bold">Loading card...</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-auto max-w-4xl",
        "relative rounded-lg",
        "p-[10px]",
        "bg-[repeating-linear-gradient(45deg,#ff0000_0px,#ff0000_10px,#ffffff_10px,#ffffff_20px)]",
        christmasFont.className
      )}
    >
      <Card className="bg-white backdrop-blur-sm rounded-lg">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-red-600 text-center">
            My Letter to Santa {isLoading ? "..." : ""}
          </CardTitle>
          <CardDescription className="text-xl text-gray-600 mb-2 text-center">
            From my heart to the North Pole
          </CardDescription>
          <hr className="border-t-2 border-gray-300 my-4" />
        </CardHeader>

        <CardContent className="max-w-2xl mx-auto px-8 py-5">
          <div className="space-y-1">
            <div className="text-4xl font-medium text-gray-800 mb-6">
              Dear Santa,
              {conversationMetadata?.name &&
                conversationMetadata?.name.length > 0 && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 1,
                      ease: "easeOut",
                      delay: 0.3,
                    }}
                  >
                    {" "}
                    my name is{" "}
                    <span className="text-red-600 font-semibold">
                      {conversationMetadata?.name}
                    </span>
                  </motion.span>
                )}
            </div>
            <div className="space-y-2">
              <p className="text-xl text-gray-700">
                These are the presents I&apos;m wishing for:
              </p>
              <ol className="space-y-4 ml-8">
                {conversationMetadata?.wishlist.map(
                  ({
                    name: presentName,
                    key,
                    index,
                  }: {
                    name: string;
                    key: string;
                    index: number;
                  }) => (
                    <motion.li
                      key={key}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: 1,
                        ease: "easeOut",
                        delay: 0.3 + index * 0.2,
                      }}
                      className="flex items-center gap-4 text-xl text-gray-800"
                    >
                      <span className="text-1xl">🎄</span>
                      <span className="text-red-600 font-bold">
                        {presentName}
                      </span>
                    </motion.li>
                  )
                )}
              </ol>
              <p className="text-xl text-gray-800 pt-4">Thank you Santa!</p>
            </div>
          </div>
        </CardContent>

        <div className="flex flex-col items-center border-t pt-6 p-4">
          {audio && videoUrl ? (
            <video
              className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-sm h-auto rounded-lg"
              controls
              autoPlay
              muted
              playsInline
              loop
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            audio && (
              <div className="w-full max-w-md mb-4">
                <audio
                  controls
                  className="w-full"
                  src={`data:audio/mpeg;base64,${audio}`}
                />
              </div>
            )
          )}

          <span className="text-gray-500 pt-4">
            Made with{" "}
            <span role="img" aria-label="heart">
              ❤️
            </span>{" "}
            in the North Pole by{" "}
            <strong>
              <a href="https://elevenlabs.io" target="_blank">
                ElevenLabs
              </a>
            </strong>
          </span>
        </div>
      </Card>
    </div>
  );
}
