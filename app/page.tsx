"use client";

import { api } from "@/convex/_generated/api";

import { useOrganization, useUser } from "@clerk/nextjs";

import { useQuery } from "convex/react";

import UploadButton from "./uploadButton";

export default function Home() {
  const organizationState = useOrganization();
  const authState = useUser();

  let orgId: string | undefined = undefined;

  if (organizationState.isLoaded && authState.isLoaded) {
    orgId = organizationState.organization?.id || authState.user?.id;
  }

  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");

  return (
    <main className="container mx-auto p-12">
      <UploadButton />
      {files?.map((file) => <div key={file._id}>{file.name}</div>)}
    </main>
  );
}
