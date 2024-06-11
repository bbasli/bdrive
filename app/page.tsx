"use client";
import { useState } from "react";

import Image from "next/image";

import { api } from "@/convex/_generated/api";

import { useOrganization, useUser } from "@clerk/nextjs";

import { useQuery } from "convex/react";

import { FileIcon, Loader2, StarIcon } from "lucide-react";

import FileCardList from "./fileCardList";
import EmptyFileList from "./emptyFileList";
import SearchBar from "./search-bar";
import UploadButton from "./uploadButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const organizationState = useOrganization();
  const authState = useUser();

  const [query, setQuery] = useState("");

  let orgId: string | undefined = undefined;

  if (organizationState.isLoaded && authState.isLoaded) {
    orgId = organizationState.organization?.id || authState.user?.id;
  }

  const files = useQuery(api.files.getFiles, orgId ? { orgId, query } : "skip");
  const isLoading = files === undefined;

  return (
    <main className="w-full pt-12">
      <div className="flex h-full">
        <div className="w-[256px] flex justify-start flex-col bg-purple-200 gap-4 p-4">
          <Link href="/">
            <Button variant={"link"} className="flex gap-2">
              <FileIcon size={24} />
              View Files
            </Button>
          </Link>

          <Link href="/favorites">
            <Button variant={"link"} className="flex gap-2">
              <StarIcon size={24} />
              Favorites
            </Button>
          </Link>
        </div>

        <div className="w-full mx-8">
          {isLoading && (
            <div className="flex items-center justify-center flex-col gap-8 mt-24">
              <Loader2 className="animate-spin h-32 w-32 text-gray-500" />
              <span className="text-2xl">Loading your images...</span>
            </div>
          )}

          {!isLoading && files.length === 0 && !query && <EmptyFileList />}

          {!isLoading && files.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-8 gap-8">
                <h1 className="text-4xl font-bold">Your Files</h1>
                <SearchBar query={query} setQuery={setQuery} />
                <UploadButton />
              </div>
              <FileCardList files={files} />
            </div>
          )}

          {!isLoading && files.length === 0 && query && (
            <div>
              <div className="flex justify-between items-center mb-8 gap-8">
                <h1 className="text-4xl font-bold">Your Files</h1>
                <SearchBar query={query} setQuery={setQuery} />
                <UploadButton />
              </div>
              <div className="flex flex-col items-center justify-center mt-12 gap-2">
                <Image src="/empty.svg" width={400} height={400} alt="Empty" />
                <p className="text-center my-4 text-gray-500">
                  No files found.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
