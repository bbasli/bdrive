import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const roles = v.union(v.literal("admin"), v.literal("member"));

export const filesTypes = v.union(
  v.literal("image"),
  v.literal("csv"),
  v.literal("pdf")
);

export default defineSchema({
  files: defineTable({
    name: v.string(),
    type: filesTypes,
    orgId: v.string(),
    fileId: v.id("_storage"),
    url: v.string(),
    deleteAt: v.optional(v.number()),
  })
    .index("by_orgId", ["orgId"])
    .searchIndex("by_name", {
      searchField: "name",
      filterFields: ["orgId"],
    })
    .index("by_deleteAt", ["deleteAt"]),

  favorites: defineTable({
    fileId: v.id("files"),
    orgId: v.string(),
    userId: v.id("users"),
  }).index("by_userId_orgId_fileId", ["userId", "orgId", "fileId"]),

  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(),
    image: v.optional(v.string()),
    orgIds: v.array(
      v.object({
        orgId: v.string(),
        role: roles,
      })
    ),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),
});
