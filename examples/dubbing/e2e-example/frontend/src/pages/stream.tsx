import { Layout } from "@/components/layout";
import { getProject } from "@/services/dubbing";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import VideoPlayer from "@/components/video-player";

export const Stream = () => {
  const params = useParams<{ id: string }>();
  const [shouldRefetch, setShouldRefetch] = useState<boolean>(true);

  const { data } = useQuery({
    queryKey: ["projects", params.id],
    queryFn: () => getProject(params.id!),
    refetchInterval: shouldRefetch ? 2000 : false, // refetch every 15 seconds
  });

  useEffect(() => {
    if (data && data.status !== "dubbing") {
      setShouldRefetch(false);
    }
  }, [data]);

  return (
    <Layout>
      {data && data.status === "dubbing" && (
        <div>
          <p className="text-center">Video still processed. Please wait</p>
        </div>
      )}
      {data && data.status === "failed" && (
        <div>
          <p className="text-center">Video dubbing failed</p>
        </div>
      )}
      {data && data.status === "dubbed" && <VideoPlayer data={data} />}
    </Layout>
  );
};
