"use server";

import { SpecimenCard } from "@/components/specimen-card";
import { getJobStatus, retrieveHumanSpecimenAction } from "../actions/actions";
import { humanSpecimenSchema } from "@/app/types";

export default async function Page({ params }) {
  const paramaters = await params;

  const response = await retrieveHumanSpecimenAction({
    handle: paramaters.handle,
  });

  if (!response?.data?.success) {
    return <>User not found</>;
  }

  const humanSpecimen = humanSpecimenSchema.parse(response.data.humanSpecimen);
  const jobId = humanSpecimen?.videoUrls?.[0];
  const jobStatus = jobId ? await getJobStatus(jobId) : undefined;
  const { videoUrl, avatarImageUrl } = jobStatus || {};

  return (
    <SpecimenCard humanSpecimen={{ ...humanSpecimen, videoUrl, avatarImageUrl }} />
  );
}
