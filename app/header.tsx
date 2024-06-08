import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import React from "react";

export default function Header() {
  return (
    <div className="border-b py-4 bg-gray-50">
      <div className="container mx-auto flex items-center justify-between">
        <div>B-Drive</div>
        <div>
          <OrganizationSwitcher />
          <UserButton />
        </div>
      </div>
    </div>
  );
}
