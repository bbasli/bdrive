import moment from "moment";

import { ConvexError, v } from "convex/values";
import {
  internalMutation,
  mutation,
  MutationCtx,
  query,
  QueryCtx,
} from "./_generated/server";
import { filesTypes } from "./schema";
import { Id } from "./_generated/dataModel";

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError("you must be logged in to upload files");
  }

  return await ctx.storage.generateUploadUrl();
});

export async function hasAccessToOrg(
  ctx: QueryCtx | MutationCtx,
  orgId: string
) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .first();

  if (!user) {
    throw new ConvexError(
      `expected user to be defined ${identity.tokenIdentifier}`
    );
  }

  const hasAccess =
    user.orgIds.some((item) => item.orgId === orgId) ||
    user.tokenIdentifier.includes(orgId);

  if (!hasAccess) {
    return null;
  }

  return { user };
}

async function hasAccessToFile(
  ctx: QueryCtx | MutationCtx,
  fileId: Id<"files">
) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError("you must be logged in to favorite files");
  }

  const file = await ctx.db.get(fileId);

  if (!file) {
    throw new ConvexError("file not found");
  }

  const hasAccess = await hasAccessToOrg(ctx, file.orgId);

  if (!hasAccess) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .first();

  if (!user) {
    return null;
  }

  return { user, file };
}

export const uploadFile = mutation({
  args: {
    name: v.string(),
    type: filesTypes,
    orgId: v.string(),
    fileId: v.id("_storage"),
  },
  async handler(ctx, args) {
    const hasAccess = await hasAccessToOrg(ctx, args.orgId);

    if (!hasAccess) {
      throw new ConvexError("you do not have access to this org");
    }

    const url = await ctx.storage.getUrl(args.fileId);

    if (!url) {
      throw new ConvexError("file not found");
    }

    await ctx.db.insert("files", {
      name: args.name,
      type: args.type,
      orgId: args.orgId,
      fileId: args.fileId,
      userId: hasAccess.user._id,
      url,
    });
  },
});

export const getFiles = query({
  args: {
    type: v.optional(v.string()),
    orgId: v.string(),
    query: v.optional(v.string()),
    favoritesOnly: v.optional(v.boolean()),
    deletedOnly: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();

    if (!user) {
      throw new ConvexError("user not found");
    }

    let files;

    if (!args.query) {
      files = await ctx.db
        .query("files")
        .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
        .collect();
    } else {
      const query = args.query;

      files = await ctx.db
        .query("files")
        .withSearchIndex("by_name", (q) =>
          q.search("name", query).eq("orgId", args.orgId)
        )
        .collect();
    }

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q.eq("userId", user._id).eq("orgId", args.orgId)
      )
      .collect();

    if (args.favoritesOnly) {
      files = files.filter((file) =>
        favorites.some((favorite) => favorite.fileId === file._id)
      );
    }

    files = files.filter((file) =>
      args.deletedOnly ? file.deleteAt : !file.deleteAt
    );

    if (args?.type !== "all") {
      files = files.filter((file) => file.type === args.type);
    }

    return files.map((file) => ({
      ...file,
      isFavorite: favorites.some((favorite) => favorite.fileId === file._id),
    }));
  },
});

export const deleteFile = mutation({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    const hasAccess = await hasAccessToFile(ctx, args.fileId);

    if (!hasAccess) {
      throw new ConvexError("you do not have access to favorite this file");
    }

    const { user, file } = hasAccess;

    const canDelete =
      file.userId === user._id ||
      user.orgIds.find(({ orgId }) => orgId === file.orgId)?.role === "admin";

    if (!canDelete) {
      throw new ConvexError("you do not have access to delete this file");
    }

    // delete the file after 30 days
    const deleteAt = moment().add(30, "days").valueOf();

    await ctx.db.patch(file._id, { deleteAt });

    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q.eq("userId", user._id).eq("orgId", file.orgId).eq("fileId", file._id)
      )
      .first();

    if (favorite) {
      await ctx.db.delete(favorite._id);
    }
  },
});

export const restoreFile = mutation({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    const hasAccess = await hasAccessToFile(ctx, args.fileId);

    if (!hasAccess) {
      throw new ConvexError("you do not have access to favorite this file");
    }

    const { user, file } = hasAccess;

    const isAdmin =
      user.orgIds.find(({ orgId }) => orgId === file.orgId)?.role === "admin";

    if (!isAdmin) {
      throw new ConvexError("you do not have access to restore this file");
    }

    await ctx.db.patch(file._id, { deleteAt: undefined });
  },
});

export const toggleFavorite = mutation({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    const hasAccess = await hasAccessToFile(ctx, args.fileId);

    if (!hasAccess) {
      throw new ConvexError("you do not have access to favorite this file");
    }

    const { user, file } = hasAccess;

    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q.eq("userId", user._id).eq("orgId", file.orgId).eq("fileId", file._id)
      )
      .first();

    if (!favorite) {
      await ctx.db.insert("favorites", {
        fileId: file._id,
        userId: user._id,
        orgId: file.orgId,
      });

      return;
    }

    await ctx.db.delete(favorite._id);
  },
});

export const removeDeletableFiles = internalMutation({
  async handler(ctx) {
    const today = moment().valueOf();

    const deletableFiles = await ctx.db
      .query("files")
      .withIndex("by_deleteAt", (q) => q.lt("deleteAt", today))
      .collect();

    await Promise.all(
      deletableFiles.map(async (file) => {
        if (!file.deleteAt) {
          return;
        }

        await ctx.storage.delete(file.fileId);
        return await ctx.db.delete(file._id);
      })
    );
  },
});
