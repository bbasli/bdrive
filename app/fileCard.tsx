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
  EllipsisVertical,
  FileTextIcon,
  GanttChartIcon,
  ImageIcon,
  Trash2,
} from "lucide-react";

import { ReactNode, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";

const fileTypesIconMap = {
  image: <ImageIcon />,
  pdf: <FileTextIcon />,
  csv: <GanttChartIcon />,
} as Record<Doc<"files">["type"], ReactNode>;

function FileCardActions({ fileId }: { fileId: Doc<"files">["_id"] }) {
  const { toast } = useToast();

  const deleteFile = useMutation(api.files.deleteFile);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (!fileId) {
      return;
    }

    try {
      await deleteFile({ fileId });

      toast({
        variant: "success",
        title: "File deleted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete file",
        description:
          "Something went wrong while deleting the file. Please try again later.",
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
          <DropdownMenuItem
            className="flex gap-2 items-center text-red-600 cursor-pointer"
            onClick={() => setIsDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </DropdownMenuItem>
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

export default function FileCard({ file }: { file: Doc<"files"> }) {
  return (
    <Card className="flex flex-col gap-2">
      <CardHeader className="relative">
        <CardTitle className="flex gap-4">
          {fileTypesIconMap[file.type]}
          {file.name}
        </CardTitle>
        <div className="absolute top-2 right-2">
          <FileCardActions fileId={file._id} />
        </div>
      </CardHeader>
      <CardContent className="h-[200px] flex justify-center items-center">
        <FilePreview file={file} />
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button>Download</Button>
      </CardFooter>
    </Card>
  );
}
