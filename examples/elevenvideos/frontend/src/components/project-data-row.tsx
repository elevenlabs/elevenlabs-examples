import { ProjectData } from "@/services/dubbing";
import { TableCell, TableRow } from "./ui/table";
import { languages } from "./languages";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export const ProjectDataRow = ({ data }: { data: ProjectData }) => {
  const language = languages.find((l) => l.code === data.source_lang);
  return (
    <TableRow key={data.id}>
      <TableCell>{data.name}</TableCell>
      <TableCell>{data.status}</TableCell>
      <TableCell>
        {data.source_lang === "detect" || !language ? (
          "Auto Detect"
        ) : (
          <>
            {language.countryLogo} {language.name}
          </>
        )}
      </TableCell>
      <TableCell>
        {data.target_languages.map((target) => {
          const targetLang = languages.find((l) => l.code === target);
          return (
            targetLang && (
              <Button variant={"outline"}>
                <Link to={`/stream/${data.id}/${target}`}>
                  {targetLang.countryLogo} {targetLang.name}
                </Link>
              </Button>
            )
          );
        })}
      </TableCell>
    </TableRow>
  );
};
