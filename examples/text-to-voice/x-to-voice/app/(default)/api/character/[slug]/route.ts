import { getJobStatus } from "@/app/(default)/actions/actions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const jobId = (await params).slug
  const jobStatus = jobId ? await getJobStatus(jobId) : undefined;
  const { videoUrl, avatarImageUrl } = jobStatus || {};

  return Response.json({ videoUrl, avatarImageUrl })
}
