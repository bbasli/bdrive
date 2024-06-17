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
  EllipsisVertical,
  FileTextIcon,
  GanttChartIcon,
  ImageIcon,
  StarIcon,
  Trash2,
} from "lucide-react";

import { ReactNode, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { Protect } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import moment from "moment";

const fileTypesIconMap = {
  image: <ImageIcon />,
  pdf: <FileTextIcon />,
  csv: <GanttChartIcon />,
} as Record<Doc<"files">["type"], ReactNode>;

type FileWithIsFavorite = Doc<"files"> & { isFavorite: boolean };

function FileCardActions({
  fileId,
  isFavorite,
}: {
  fileId: Doc<"files">["_id"];
  isFavorite: boolean;
}) {
  const { toast } = useToast();

  const pathname = usePathname();

  const deleteFile = useMutation(api.files.deleteFile);
  const restoreFile = useMutation(api.files.restoreFile);

  const toggleFavorite = useMutation(api.files.toggleFavorite);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (!fileId) {
      return;
    }

    try {
      await deleteFile({ fileId });

      toast({
        variant: "success",
        title: "File moved to trash",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete file",
        description:
          error.data ||
          "Something went wrong while deleting the file. Please try again later.",
      });
    }
  };

  const handleToggleFavorite = async () => {
    if (!fileId) {
      return;
    }

    try {
      await toggleFavorite({ fileId });

      toast({
        variant: "success",
        title: isFavorite
          ? "File removed from favorites"
          : "File added to favorites",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to favorite file",
        description:
          error.data ||
          "Something went wrong while favoriting the file. Please try again later.",
      });
    }
  };

  const handleRestore = async () => {
    try {
      await restoreFile({ fileId });

      toast({
        variant: "success",
        title: "File restored successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to restore file",
        description:
          error.data ||
          "Something went wrong while restoring the file. Please try again later.",
      });
    }
  };
  return (
    <>
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this file?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete file
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <EllipsisVertical className="cursor-pointer" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {/* FAVORITE ACTION */}
          {pathname.includes("/dashboard/trash") ? null : (
            <DropdownMenuItem
              className="flex gap-2 items-center cursor-pointer"
              onClick={handleToggleFavorite}
            >
              {isFavorite ? (
                <>
                  <StarIcon className="h-4 w-4" /> Unfavorite
                </>
              ) : (
                <div className="text-yellow-600 flex gap-2 items-center">
                  <StarIcon className="h-4 w-4" /> Favorite
                </div>
              )}
            </DropdownMenuItem>
          )}

          {/* DELETE & RESTORE ACTION */}
          <Protect role="org:admin">
            {/* DELETE ACTION */}
            {!pathname.includes("/dashboard/trash") && (
              <DropdownMenuSeparator />
            )}
            <DropdownMenuItem
              className="flex gap-2 items-center text-red-600 cursor-pointer"
              onClick={() => setIsDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />{" "}
              {pathname.includes("/dashboard/trash") ? "Delete now" : "Delete"}
            </DropdownMenuItem>

            {/* RESTORE ACTION */}
            {pathname.includes("/dashboard/trash") && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex gap-2 items-center cursor-pointer"
                  onClick={handleRestore}
                >
                  <AmbulanceIcon className="h-4 w-4" /> Restore
                </DropdownMenuItem>
              </>
            )}
          </Protect>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

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

  return (
    <Card className="flex flex-col gap-2">
      <CardHeader className="relative">
        <CardTitle className="flex gap-4">
          {fileTypesIconMap[file.type]}
          {file.name}
        </CardTitle>
        <div className="absolute top-2 right-2">
          <FileCardActions fileId={file._id} isFavorite={file.isFavorite} />
        </div>
      </CardHeader>
      <CardContent className="h-[200px] flex justify-center items-center">
        <FilePreview file={file} />
      </CardContent>
      <CardFooter className="flex justify-center">
        {pathname.includes("/dashboard/trash") ? (
          <div className="flex flex-col items-center text-center">
            <span>Will be deleted permanently on</span>
            <span className="text-red-600">
              {moment(file.deleteAt).format("MMM DD, YYYY")}
            </span>
          </div>
        ) : (
          <Button
            onClick={() => {
              window.open(file.url, "_blank");
            }}
          >
            Download
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
