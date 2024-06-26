"use client";

import { useState } from "react";

import Image from "next/image";

import { useQuery } from "convex/react";

import { GridIcon, Loader2, Rows2Icon } from "lucide-react";

import { useOrganization, useUser } from "@clerk/nextjs";

import { api } from "@/convex/_generated/api";

import UploadButton from "../_components/uploadButton";
import EmptyFileList from "../_components/empty-file-list";
import FileCardList from "../_components/file-card-list";
import SearchBar from "../_components/search-bar";
import { DataTable } from "./file-table";
import { columns } from "./columns";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FileBrowser({
  title,
  favoritesOnly,
  deletedOnly,
}: {
  title: string;
  favoritesOnly?: boolean;
  deletedOnly?: boolean;
}) {
  const organizationState = useOrganization();
  const authState = useUser();

  const [query, setQuery] = useState("");

  let orgId: string | undefined = undefined;

  if (organizationState.isLoaded && authState.isLoaded) {
    orgId = organizationState.organization?.id || authState.user?.id;
  }

  const files = useQuery(
    api.files.getFiles,
    orgId ? { orgId, query, favoritesOnly, deletedOnly } : "skip"
  );

  const isLoading = files === undefined;

  return (
    <div>
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
            <h1 className="text-4xl font-bold">{title}</h1>
            <SearchBar query={query} setQuery={setQuery} />
            <UploadButton />
          </div>
          <div>
            <Select>
              <SelectTrigger className="w-[180px]" defaultValue={"all"}>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="csv">Csv</SelectItem>
                  <SelectItem value="pdf">Pdf</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Tabs defaultValue="grid">
            <TabsList className="mb-4">
              <TabsTrigger value="grid" className="gap-2">
                <GridIcon />
                Grid
              </TabsTrigger>
              <TabsTrigger value="table" className="gap-2">
                <Rows2Icon />
                Table
              </TabsTrigger>
            </TabsList>
            <TabsContent value="grid">
              <FileCardList files={files} />
            </TabsContent>
            <TabsContent value="table">
              <DataTable columns={columns} data={files || []} />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {!isLoading && files.length === 0 && query && (
        <div>
          <div className="flex justify-between items-center mb-8 gap-8">
            <h1 className="text-4xl font-bold">{title}</h1>
            <SearchBar query={query} setQuery={setQuery} />
            <UploadButton />
          </div>
          <div className="flex flex-col items-center justify-center mt-12 gap-2">
            <Image src="/empty.svg" width={400} height={400} alt="Empty" />
            <p className="text-center my-4 text-gray-500">No files found.</p>
          </div>
        </div>
      )}
    </div>
  );
}
