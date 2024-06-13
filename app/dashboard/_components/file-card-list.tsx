import { Doc } from "@/convex/_generated/dataModel";
import FileCard from "./file-card";

export default function FileCardList({ files }: { files: Doc<"files">[] }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {files?.map((file) => <FileCard key={file._id} file={file} />)}
    </div>
  );
}
