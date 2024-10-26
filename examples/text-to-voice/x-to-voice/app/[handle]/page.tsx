"use server";

import { SpecimenCard } from "@/components/specimen-card";
import { retrieveHumanSpecimenAction } from "../actions/actions";

export default async function Page({ params }) {
  const paramaters = await params;

  const response = await retrieveHumanSpecimenAction({
    handle: paramaters.handle,
  });

  if (!response?.data?.success) {
    return <>User not found</>;
  }

  return <SpecimenCard humanSpecimen={response.data.humanSpecimen} />;
}
