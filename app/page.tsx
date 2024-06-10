"use client";

import { api } from "@/convex/_generated/api";

import { useOrganization, useUser } from "@clerk/nextjs";

import { useQuery } from "convex/react";

import UploadButton from "./uploadButton";
import FileCard from "./fileCard";
import Image from "next/image";

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
      {!files || files?.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-12 gap-2">
          <Image src="/empty.svg" width={400} height={400} alt="Empty" />
          <p className="text-center my-4 text-gray-500">
            No files found. Upload a file to get started.
          </p>
          <UploadButton />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Your Files</h1>
            <UploadButton />
          </div>

          <div className="grid grid-cols-4 gap-4">
            {files?.map((file) => <FileCard key={file._id} file={file} />)}
          </div>
        </>
      )}
    </main>
  );
}
