"use client";

import { api } from "@/convex/_generated/api";

import { useOrganization, useUser } from "@clerk/nextjs";

import { useQuery } from "convex/react";

import { Loader2 } from "lucide-react";

import FileCardList from "./fileCardList";
import EmptyFileList from "./emptyFileList";

export default function Home() {
  const organizationState = useOrganization();
  const authState = useUser();

  let orgId: string | undefined = undefined;

  if (organizationState.isLoaded && authState.isLoaded) {
    orgId = organizationState.organization?.id || authState.user?.id;
  }

  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");

  let list = (
    <div className="flex items-center justify-center flex-col gap-8 mt-24">
      <Loader2 className="animate-spin h-32 w-32 text-gray-500" />
      <span className="text-2xl">Loading your images...</span>
    </div>
  );

  if (files && files?.length === 0) {
    list = <EmptyFileList />;
  } else if (files && files.length > 0) {
    list = <FileCardList files={files} />;
  }

  return <main className="container mx-auto p-12">{list}</main>;
}
