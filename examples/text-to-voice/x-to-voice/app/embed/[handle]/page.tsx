import { getJobStatus } from "@/app/(default)/actions/actions";
import { notFound } from "next/navigation";
import { getData } from "@/app/(default)/[handle]/page";
import { Metadata } from "next";

export default async function Page({ params }) {
  const { handle } = await params;
  const humanSpecimen = await getData(handle);

  if (!humanSpecimen) {
    return notFound();
  }

  const jobId = humanSpecimen.videoJobs?.[0];
  const jobStatus = jobId ? await getJobStatus(jobId) : undefined;
  const { videoUrl } = jobStatus || {};

  return (
    <video controls className={"w-full h-full"} height={512} width={512}>
      <source src={videoUrl}></source>
      Your browser does not support the video tag.
    </video>
  );
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const { handle } = await params;
  return {
    title: `Embed | ${handle}`
  }
}