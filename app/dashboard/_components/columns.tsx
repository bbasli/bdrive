"use client";

import { ColumnDef } from "@tanstack/react-table";

import moment, { MomentInput } from "moment";

import { Doc, Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FileCardActions from "./file-actions";

const UserProfile = ({ userId }: { userId: Id<"users"> }) => {
  const userProfile = useQuery(api.users.getUserProfile, { userId });

  return (
    <div className="flex gap-2 w-40 items-center">
      <Avatar className="w-6 h-6">
        <AvatarImage src={userProfile?.image} />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      {userProfile?.name}
    </div>
  );
};

type FileWithIsFavorite = Doc<"files"> & { isFavorite: boolean };

export const columns: ColumnDef<FileWithIsFavorite>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    header: "Uploaded By",
    cell: ({ row }) => {
      const userId = row.original.userId;
      return <UserProfile userId={userId} />;
    },
  },
  {
    header: "Uploaded On",
    cell: ({ row }) => {
      const createdAt = row.original._creationTime as MomentInput;
      return moment(createdAt).format("MMM D, YYYY");
    },
  },
  {
    header: "Actions",
    cell: ({ row }) => {
      return (
        <FileCardActions
          userId={row.original.userId}
          fileId={row.original._id}
          isFavorite={row.original.isFavorite}
          url={row.original.url}
        />
      );
    },
  },
];
