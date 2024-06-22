"use client";

import { ColumnDef } from "@tanstack/react-table";

import moment, { MomentInput } from "moment";

import { Doc } from "@/convex/_generated/dataModel";

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
    accessorKey: "_creationTime",
    header: "Creation Time",
    cell: ({ row }) => {
      const createdAt = row.getValue("_creationTime") as MomentInput;
      return moment(createdAt).format("MMM D, YYYY");
    },
  },
];