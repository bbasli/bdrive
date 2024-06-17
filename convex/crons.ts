import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "Remove any files that are marked for deletion every hour",
  { hours: 1 },
  internal.files.removeDeletableFiles
);

export default crons;
