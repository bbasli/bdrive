import { Doc } from "@/convex/_generated/dataModel";
import FileCard from "./fileCard";
import UploadButton from "./uploadButton";

export default function FileCardList({ files }: { files: Doc<"files">[] }) {
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Your Files</h1>
        <UploadButton />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {files?.map((file) => <FileCard key={file._id} file={file} />)}
      </div>
    </>
  );
}
