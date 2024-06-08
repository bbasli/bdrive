import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const uploadFile = mutation({
  args: {
    name: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("You must be signed in to upload a file.");
    }

    await ctx.db.insert("files", {
      name: args.name,
    });
  },
});

export const getFiles = query({
  args: {},
  async handler(ctx, args) {
    return await ctx.db.query("files").collect();
  },
});
