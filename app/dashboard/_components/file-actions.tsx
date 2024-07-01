"use client";

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
  StarIcon,
  Trash2,
} from "lucide-react";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import { Protect } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export default function FileCardActions({
  url,
  userId,
  fileId,
  isFavorite,
}: {
  url: string;
  userId: Doc<"users">["_id"];
  fileId: Doc<"files">["_id"];
  isFavorite: boolean;
}) {
  const { toast } = useToast();

  const pathname = usePathname();

  const deleteFile = useMutation(api.files.deleteFile);
  const restoreFile = useMutation(api.files.restoreFile);

  const toggleFavorite = useMutation(api.files.toggleFavorite);

  const me = useQuery(api.users.getMe);

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
              The file will be moved to trash and can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Trash
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
          <Protect
            condition={(check) =>
              check({ role: "org:admin" }) || userId === me?._id
            }
          >
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
          <DropdownMenuSeparator />

          {/* DOWNLOAD ACTION */}
          <DropdownMenuItem
            className="flex gap-2 items-center cursor-pointer"
            onClick={() => {
              window.open(url, "_blank");
            }}
          >
            <DownloadIcon className="h-4 w-4" /> Download
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
