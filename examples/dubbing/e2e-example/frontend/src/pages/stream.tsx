import { Layout } from "@/components/layout";
import { getAllProjects, getProject } from "@/services/dubbing";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { Link, useParams } from "react-router-dom";
import VideoPlayer from "@/components/video-player";
import { AlertCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Stream = () => {
  const params = useParams<{ id: string }>();
  const [shouldRefetch, setShouldRefetch] = useState<boolean>(true);

  const { data } = useQuery({
    queryKey: ["projects", params.id],
    queryFn: () => getProject(params.id!),
    refetchInterval: shouldRefetch ? 2000 : false, // refetch every 2 seconds
  });

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getAllProjects(),
  });

  const prevProject = useMemo(() => {
    if (!projects || !data) return null;
    const currentIdx = projects.findIndex(p => p.id === data.id);

    if (currentIdx === 0) return null;

    return projects[currentIdx - 1];
  }, [projects, data]);

  const nextProject = useMemo(() => {
    if (!projects || !data) return null;
    const currentIdx = projects.findIndex(p => p.id === data.id);

    if (currentIdx === projects.length - 1) return null;

    return projects[currentIdx + 1];
  }, [projects, data]);

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
        <div className="w-full flex justify-between">
          <div>
            {prevProject && (
              <Button variant={"link"} className="p-0">
                <div className="flex items-top gap-x-1">
                  <ChevronLeft />
                  <Link to={`/stream/${prevProject.id}`}>
                    {prevProject.name}
                  </Link>
                </div>
              </Button>
            )}
          </div>
          <div>
            {nextProject && (
              <Button variant={"link"} className="p-0">
                <div className="flex items-top gap-x-1">
                  <Link to={`/stream/${nextProject.id}`}>
                    {nextProject.name}
                  </Link>
                  <ChevronRight />
                </div>
              </Button>
            )}
          </div>
        </div>
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
