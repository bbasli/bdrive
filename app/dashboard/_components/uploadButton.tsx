"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { api } from "@/convex/_generated/api";

import { useOrganization, useUser } from "@clerk/nextjs";

import { useMutation } from "convex/react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { z } from "zod";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";

const formSchema = z.object({
  title: z.string().min(2).max(200),
  file: z
    .custom<FileList>((val) => val instanceof FileList, "Required")
    .refine((val) => val.length > 0, "Required"),
});

export default function UploadButton() {
  const { toast } = useToast();
  const organization = useOrganization();
  const authState = useUser();

  let orgId: string | undefined = undefined;

  if (organization.isLoaded && authState.isLoaded) {
    orgId = organization.organization?.id || authState.user?.id;
  }

  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

  const uploadFile = useMutation(api.files.uploadFile);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: undefined,
    },
  });

  const fileRef = form.register("file");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!orgId) return;

    try {
      const postUrl = await generateUploadUrl();

      const selectedFile = values.file[0];

      const fileTypesMap = {
        "image/jpeg": "image",
        "image/png": "image",
        "image/gif": "image",
        "image/svg+xml": "image",
        "application/pdf": "pdf",
        "text/csv": "csv",
      } as Record<string, Doc<"files">["type"]>;

      const fileType = fileTypesMap[selectedFile.type];

      if (!fileType) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Only images, pdfs and csv files are allowed.",
        });
        return;
      }

      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      const { storageId } = await result.json();

      await uploadFile({
        orgId,
        type: fileType,
        fileId: storageId,
        name: values.title,
      });

      form.reset();

      setIsFileDialogOpen(false);
      toast({
        variant: "success",
        title: "File uploaded successfully",
        description: "Now you can see your file in the list.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to upload file",
        description:
          error.data || "Something went wrong. Please try again later.",
      });
    }
  }

  return (
    <Dialog
      open={isFileDialogOpen}
      onOpenChange={(isOpen) => {
        setIsFileDialogOpen(isOpen);
        form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button onClick={() => setIsFileDialogOpen(true)}>Upload File</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="mb-8">Upload Your File</DialogTitle>
          <DialogDescription>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="shadcn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="file"
                  render={() => (
                    <FormItem>
                      <FormLabel>File</FormLabel>
                      <FormControl>
                        <Input type="file" {...fileRef} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <div className="flex gap-2 items-center">
                      Uploding ...
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    "Upload"
                  )}
                </Button>
              </form>
            </Form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
