"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  useOrganization,
  useUser,
} from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";

export default function Home() {
  const { organization } = useOrganization();;
  const authState = useUser();

  const orgId = organization?.id || authState?.user?.id || "skip";

  const files = useQuery(api.files.getFiles, { orgId });
  const uploadFile = useMutation(api.files.uploadFile);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* <SignedIn>
        <SignOutButton>
          <Button>Sign Out</Button>
        </SignOutButton>
      </SignedIn> */}


      {files?.map((file) => <div key={file._id}>{file.name}</div>)}

      <Button
        onClick={() =>
          uploadFile({
            orgId,
            name: "example",
          })
        }
      >
        Create File
      </Button>
    </main>
  );
}
