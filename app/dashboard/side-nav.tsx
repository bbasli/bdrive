"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import { FileIcon, StarIcon, Trash2Icon } from "lucide-react";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function SideNavigation() {
  const pathname = usePathname();

  return (
    <div className="w-[256px] flex justify-start flex-col bg-purple-200 gap-4 p-4">
      <Link href="/dashboard/files">
        <Button
          variant={"link"}
          className={clsx("flex gap-2", {
            "text-orange-500": pathname.includes("/dashboard/files"),
          })}
        >
          <FileIcon size={24} />
          View Files
        </Button>
      </Link>

      <Link href="/dashboard/favorites">
        <Button
          variant={"link"}
          className={clsx("flex gap-2", {
            "text-orange-500": pathname.includes("/dashboard/favorites"),
          })}
        >
          <StarIcon size={24} />
          Favorites
        </Button>
      </Link>

      <Link href="/dashboard/trash">
        <Button
          variant={"link"}
          className={clsx("flex gap-2", {
            "text-orange-500": pathname.includes("/dashboard/trash"),
          })}
        >
          <Trash2Icon size={24} />
          Trash
        </Button>
      </Link>
    </div>
  );
}
