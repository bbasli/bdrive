"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Doc } from "@/convex/_generated/dataModel";
import {
  AmbulanceIcon,
  DownloadIcon,
  EllipsisVertical,
  FileTextIcon,
  GanttChartIcon,
  ImageIcon,
  StarIcon,
  Trash2,
} from "lucide-react";

import { ReactNode, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { Protect } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import moment from "moment";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FileCardActions from "./file-actions";

const fileTypesIconMap = {
  image: <ImageIcon />,
  pdf: <FileTextIcon />,
  csv: <GanttChartIcon />,
} as Record<Doc<"files">["type"], ReactNode>;

type FileWithIsFavorite = Doc<"files"> & { isFavorite: boolean };

const FilePreview = ({ file }: { file: Doc<"files"> }) => {
  const { name, type, url } = file;

  if (type === "image") {
    return <Image src={url} width={128} height={64} alt={name} />;
  } else if (type === "pdf") {
    return <FileTextIcon className="h-20 w-20" />;
  } else if (type === "csv") {
    return <GanttChartIcon className="h-20 w-20" />;
  }

  return null;
};

export default function FileCard({ file }: { file: FileWithIsFavorite }) {
  const pathname = usePathname();

  const userProfile = useQuery(api.users.getUserProfile, {
    userId: file.userId,
  });

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-4 text-base font-normal">
          {fileTypesIconMap[file.type]}
          {file.name}
        </CardTitle>
        <div className="absolute top-2 right-2">
          <FileCardActions
            fileId={file._id}
            isFavorite={file.isFavorite}
            url={file.url}
          />
        </div>
      </CardHeader>
      <CardContent className="h-[200px] flex justify-center items-center">
        <FilePreview file={file} />
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-gray-700 gap-2">
        <div className="flex gap-2 w-40 items-center">
          <Avatar className="w-6 h-6">
            <AvatarImage src={userProfile?.image} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          {userProfile?.name}
        </div>
        <div>
          Uploaded on {moment(file._creationTime).format("MMMM DD, YYYY")}
        </div>

        {pathname.includes("/dashboard/trash") && (
          <div className="flex flex-col items-center text-center">
            <span>Will be deleted permanently on</span>
            <span className="text-red-600">
              {moment(file.deleteAt).format("MMM DD, YYYY")}
            </span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
