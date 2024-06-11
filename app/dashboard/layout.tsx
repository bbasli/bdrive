import Link from "next/link";

import { FileIcon, StarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="w-full pt-12">
      <div className="flex h-full">
        <div className="w-[256px] flex justify-start flex-col bg-purple-200 gap-4 p-4">
          <Link href="/dashboard/files">
            <Button variant={"link"} className="flex gap-2">
              <FileIcon size={24} />
              View Files
            </Button>
          </Link>

          <Link href="/dashboard/favorites">
            <Button variant={"link"} className="flex gap-2">
              <StarIcon size={24} />
              Favorites
            </Button>
          </Link>
        </div>

        <div className="w-full mx-8">{children}</div>
      </div>
    </main>
  );
}
