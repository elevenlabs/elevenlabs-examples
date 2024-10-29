"use server";

import { SpecimenCard } from "@/components/specimen-card";
import { retrieveHumanSpecimenAction } from "../actions/actions";
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

  return (
    <SpecimenCard humanSpecimen={humanSpecimen} />
  );
}
