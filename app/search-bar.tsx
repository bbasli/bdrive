"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleX, CircleXIcon, Loader2, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Dispatch, SetStateAction } from "react";

const formSchema = z.object({
  query: z.string().min(0).max(200),
});

export default function SearchBar({
  query,
  setQuery,
}: {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setQuery(values.query);
  }

  function clearSearch() {
    form.reset();
    setQuery("");
  }

  return (
    <div className="flex-1 flex gap-2">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex items-center gap-2 flex-1"
        >
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input placeholder="search your file" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <div className="flex gap-2 items-center">
                Searching ...
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <SearchIcon />
                Search
              </div>
            )}
          </Button>
        </form>
      </Form>
      <Button onClick={clearSearch} className="flex items-center gap-2">
        <CircleXIcon />
        Clear
      </Button>
    </div>
  );
}
