import { Layout } from "@/components/layout";
import { getProject } from "@/services/dubbing";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import VideoPlayer from "@/components/video-player";
import { AlertCircle, AlertTriangle, Loader2 } from "lucide-react";

export const Stream = () => {
  const params = useParams<{ id: string }>();
  const [shouldRefetch, setShouldRefetch] = useState<boolean>(true);

  const { data } = useQuery({
    queryKey: ["projects", params.id],
    queryFn: () => getProject(params.id!),
    refetchInterval: shouldRefetch ? 2000 : false, // refetch every 2 seconds
  });

  useEffect(() => {
    if (data && data.status !== "dubbing") {
      setShouldRefetch(false);
    }
  }, [data]);

  return (
    <Layout>
      <div className="mx-auto max-w-screen-md w-full">
        <h1 className="font-bold text-xl mb-4">
          Stream Dubbing Project - {data?.name}
        </h1>
        {!data && (
          <div className="mt-[100px]">
            <Loader2 className="animate-spin mx-auto w-8 h-8" />
            <p className="text-center mt-2">Loading ...</p>
          </div>
        )}
        {data && data.status === "dubbing" && (
          <div className="mt-[100px]">
            <Loader2 className="animate-spin mx-auto w-8 h-8" />
            <p className="text-center mt-2">
              Video still processed. Please wait ...
            </p>
          </div>
        )}

        {data && data.status === "failed" && (
          <div className="mt-[100px]">
            <AlertCircle className="text-destructive mx-auto h-16 w-16" />
            <p className="text-center mt-2 text-destructive">
              Dubbing process has failed!
            </p>
          </div>
        )}
        {data && data.status === "dubbed" && <VideoPlayer data={data} />}
      </div>
    </Layout>
  );
};
