"use server";

import { SpecimenCard } from "@/components/specimen-card";
import { getJobStatus, retrieveHumanSpecimenAction } from "../actions/actions";
import { humanSpecimenSchema } from "@/app/types";
import { Metadata } from "next";


async function getData(handle: string) {
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
    return <>User not found</>;
  }

  return (
    <SpecimenCard humanSpecimen={humanSpecimen} />
  );
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const { handle } = await params;
  const humanSpecimen = await getData(handle);

  const title = `${handle} | X to Voice | Elevenlabs`;
  const description = "What would your X profile sound like?";

  const jobId = humanSpecimen.videoJobs?.[0];
  const jobStatus = jobId ? await getJobStatus(jobId) : undefined;

  const { videoUrl, avatarImageUrl } = jobStatus || {};

  const metadata: Metadata = {
    openGraph: {
      title: title,
      description,
      images: [
        {
          url: avatarImageUrl,
          width: 512,
          height: 512,
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
      card: "summary_large_image",
      title,
      description,
      creator: "@elevenlabsio",
      images: [avatarImageUrl],
    },
  };

  return {
    title,
    ...metadata,
  };
}
