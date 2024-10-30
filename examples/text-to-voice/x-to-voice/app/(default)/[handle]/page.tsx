"use server";

import { SpecimenCard } from "@/components/specimen-card";
import { getJobStatus, retrieveHumanSpecimenAction } from "../actions/actions";
import { humanSpecimenSchema } from "@/app/types";
import { Metadata } from "next";
import { env } from "@/env.mjs";
import { notFound } from "next/navigation";
import { FooterNav } from "@/components/footer-nav";

export async function getData(handle: string) {
  const response = await retrieveHumanSpecimenAction({
    handle,
  });

  if (!response?.data?.success) {
    return undefined;
  }

  const humanSpecimen = humanSpecimenSchema.parse(response.data.humanSpecimen);
  return humanSpecimen;
}

export default async function Page({ params }) {
  const { handle } = await params;
  const humanSpecimen = await getData(handle);

  if (!humanSpecimen) {
    return notFound();
  }

  return (
    <>
      <SpecimenCard humanSpecimen={humanSpecimen} />
      <footer>
        <FooterNav className={"mt-10"}></FooterNav>
      </footer>
    </>
  );
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const { handle } = await params;
  const humanSpecimen = await getData(handle);

  const title = `${handle} | X to Voice | Elevenlabs`;
  if (!humanSpecimen) {
    return {
      title,
    };
  }

  const description = "What would your X profile sound like?";

  const jobId = humanSpecimen.videoJobs?.[0];
  const jobStatus = jobId ? await getJobStatus(jobId) : undefined;
  const { videoUrl, avatarImageUrl } = jobStatus || {};

  const metadata: Metadata = {
    openGraph: {
      title: title,
      description,
      images: avatarImageUrl ? [
        {
          url: avatarImageUrl,
          width: 512,
          height: 512,
        },
      ] : undefined,
      videos: videoUrl ? [
        {
          url: videoUrl,
          width: 512,
          height: 512,
        },
      ] : undefined,
      locale: "en_US",
      type: "website",
    },
    twitter: videoUrl && avatarImageUrl ? {
      card: "player",
      title,
      description,
      site: "@elebenlabs.io",
      creator: "@elevenlabsio",
      images: [avatarImageUrl],
      players: {
        playerUrl: `${env.NEXT_PUBLIC_BASE_URL}/embed/${handle}`,
        streamUrl: videoUrl,
        width: 512,
        height: 512,
      },
    } : undefined,
  };

  return {
    title,
    ...metadata,
  };
}
