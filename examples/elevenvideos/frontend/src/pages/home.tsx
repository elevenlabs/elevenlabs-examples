import { Layout } from "@/components/layout";
import { ProjectDataRow } from "@/components/project-data-row";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllProjects } from "@/services/dubbing";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";

export const Home = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getAllProjects(),
    refetchInterval: 15000, // refetch every 15 seconds
  });

  return (
    <Layout pageTitle="Projects">
      <div className="flex justify-end">
        <Button>
          <Link to={"/create"}>Add Project</Link>
        </Button>
      </div>
      <Table>
        <TableCaption>
          {isLoading
            ? "Loading ..."
            : !data || data.length === 0
              ? "No dubbing projects added"
              : "A list of your dubbing projects."}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source Language</TableHead>
            <TableHead>Available Languages (Click to Stream) </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data &&
            data.map((project) => {
              return <ProjectDataRow key={project.id} data={project} />;
            })}
        </TableBody>
      </Table>
    </Layout>
  );
};
