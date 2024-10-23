import { SpecimenCard } from "@/components/specimen-card";

export default function Page({ params }: { params: { slug: string } }) {
  return <SpecimenCard />;
}
