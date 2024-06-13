import Image from "next/image";

import UploadButton from "./uploadButton";

export default function EmptyFileList() {
  return (
    <div className="flex flex-col items-center justify-center mt-12 gap-2">
      <Image src="/empty.svg" width={400} height={400} alt="Empty" />
      <p className="text-center my-4 text-gray-500">
        No files found. Upload a file to get started.
      </p>
      <UploadButton />
    </div>
  );
}
