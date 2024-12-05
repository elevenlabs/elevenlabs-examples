import { notFound } from "next/navigation";
import { Metadata } from "next";

export default async function Page({ params }: any) {
  const { id } = await params;

  const videoUrl = `https://iifpdwenjojkwnidrlxl.supabase.co/storage/v1/object/public/media/media/${id}.mp4`;
  const videoExists = (await fetch(videoUrl)).ok;

  if (!videoExists) {
    return notFound();
  }

  return (
    <video controls className={"w-full h-full"} height={512} width={512}>
      <source src={videoUrl}></source>
      Your browser does not support the video tag.
    </video>
  );
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const id = (await params).id;
  return {
    title: `Embed | ${id}`,
  };
}
