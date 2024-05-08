import { Layout } from "@/components/layout";
import { getProject } from "@/services/dubbing";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import VideoPlayer from "@/components/video-player";
export const Stream = () => {
  const params = useParams<{ id: string; lang_code: string }>();
  const [shouldRefetch, setShouldRefetch] = useState<boolean>(true);

  const { data } = useQuery({
    queryKey: ["projects", params.id],
    queryFn: () => getProject(params.id!),
    refetchInterval: shouldRefetch ? 15000 : false, // refetch every 15 seconds
  });

  useEffect(() => {
    if (data && data.status !== "dubbing") {
      setShouldRefetch(false);
    }
  }, [data]);

  const sourceLang = data?.source_lang;
  const targetLang = params.lang_code;

  return (
    <Layout pageTitle="Stream Project">
      {data && data.status === "dubbing" && (
        <div>
          <p className="text-center">Video still processed. Please wait</p>
        </div>
      )}
      {data && data.status === "dubbed" && sourceLang && targetLang && (
        <VideoPlayer
          id={data.id}
          targetLang={targetLang}
          sourceLang={sourceLang}
        />
      )}
    </Layout>
  );
};
