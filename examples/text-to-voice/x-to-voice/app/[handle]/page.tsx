"use server";
import { SpecimenCard } from "@/components/specimen-card";
import { retrieveHumanSpecimenAction } from "../actions/actions";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { handle: string } }) {
  const paramaters = await params;

  const response = await retrieveHumanSpecimenAction({
    handle: paramaters.handle,
  });

  if (!response?.data?.success) {
    return <>User not found</>;
  }

  return <SpecimenCard human={response.data.human} />;
}
