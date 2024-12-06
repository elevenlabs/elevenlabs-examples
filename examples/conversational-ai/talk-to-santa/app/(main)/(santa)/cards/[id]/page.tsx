"use server";

import { UserCard } from "@/components/user-card";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { Metadata } from "next";

import { getConversationData } from "@/app/(main)/(santa)/actions/actions";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;

  const videoUrl = `https://iifpdwenjojkwnidrlxl.supabase.co/storage/v1/object/public/media/media/${id}.mp4`;
  const videoExists = (await fetch(videoUrl)).ok;

  const conversationData = (await getConversationData({ conversationId: id }))
    ?.data;

  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center mt-8">
          <Loader2 className="p-4 rounded-full text-white h-20 w-20 animate-spin" />
          <span className="mt-2 text-white font-bold">Loading card...</span>
        </div>
      }
    >
      <UserCard
        video={videoExists ? videoUrl : null}
        conversationData={conversationData}
        id={id}
      />
    </Suspense>
  );
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const id = (await params).id;

  const videoUrl = `https://iifpdwenjojkwnidrlxl.supabase.co/storage/v1/object/public/media/media/${id}.mp4`;
  const conversationData = (await getConversationData({ conversationId: id }))
    ?.data;

  const name = conversationData?.name || "My";
  const possessiveForm =
    name === "My" ? "My" : name.endsWith("s") ? `${name}'` : `${name}'s`;

  const title = `${
    name.length > 0 ? `${possessiveForm} Letter to Santa` : "My Letter to Santa"
  } | Talk to Santa| By Elevenlabs`;

  const description = "Call Santa, powered by ElevenLabs Conversational AI.";

  const metadata: Metadata = {
    title,
    openGraph: {
      title,
      description,
      images: [
        {
          url: "/assets/og-image.jpg",
          width: 1200,
          height: 630,
        },
      ],
      videos: [
        {
          url: videoUrl,
          width: 512,
          height: 512,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "player",
      title,
      description,
      site: "@elebenlabs.io",
      creator: "@elevenlabsio",
      images: [
        {
          url: "/assets/og-image.jpg",
          width: 1200,
          height: 630,
        },
      ],
      players: {
        playerUrl: `https://talktosanta.io/embed/${id}`,
        streamUrl: videoUrl,
        width: 512,
        height: 512,
      },
    },
  };

  return {
    title,
    ...metadata,
  };
}
