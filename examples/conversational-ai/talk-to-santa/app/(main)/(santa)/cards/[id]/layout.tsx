"use server";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center mt-8">
          <Loader2 className="text-white p-4 rounded-full h-20 w-20" />
          <span className="mt-2 text-white font-bold">Loading card...</span>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
