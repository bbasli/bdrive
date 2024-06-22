"use client";

import { ColumnDef } from "@tanstack/react-table";

import moment, { MomentInput } from "moment";

import { Doc, Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

export const columns: ColumnDef<Doc<"files">>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "userId",
    header: "Uploaded By",
    cell: ({ row }) => {
      const userId = row.getValue("userId") as Id<"users">;
      return <UserProfile userId={userId} />;
    },
  },
  {
    accessorKey: "_creationTime",
    header: "Uploaded On",
    cell: ({ row }) => {
      const createdAt = row.getValue("_creationTime") as MomentInput;
      return moment(createdAt).format("MMM D, YYYY");
    },
  },
];
