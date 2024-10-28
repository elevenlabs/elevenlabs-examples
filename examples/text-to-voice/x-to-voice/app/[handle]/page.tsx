"use server";

import { SpecimenCard } from "@/components/specimen-card";
import { getJobStatus, retrieveHumanSpecimenAction } from "../actions/actions";

export default async function Page({ params }) {
  const paramaters = await params;

  const response = await retrieveHumanSpecimenAction({
    handle: paramaters.handle,
  });
  const jobId = response.data.humanSpecimen?.videoUrls?.[0].jobId
  const jobStatus = jobId ? await getJobStatus(jobId): undefined
  const {videoUrl, avatarImageUrl} = jobStatus || {}
  if (!response?.data?.success) {
    return <>User not found</>;
  }

  return <SpecimenCard humanSpecimen={{...response.data.humanSpecimen, videoUrl, avatarImageUrl}} />;
}
