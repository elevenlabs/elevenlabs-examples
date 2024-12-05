"use server";

import { UserCard } from "@/components/user-card";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

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
