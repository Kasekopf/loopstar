import { $item } from "libram";
import { Quest } from "../../engine/task";
import { getPullTask, PullSpec } from "../../tasks/pulls";


export const seaPulls: PullSpec[] = [
  {
    pull: $item`Mer-kin scholar mask`,
    optional: false,
    benefit: 100,
    description: "Complete the route",
  },
  {
    pull: $item`Mer-kin scholar tailpiece`,
    optional: false,
    benefit: 100,
    description: "Complete the route",
  },
  {
    pull: $item`Mer-kin gladiator mask`,
    optional: false,
    benefit: 100,
    description: "Complete the route",
  },
  {
    pull: $item`Mer-kin gladiator tailpiece`,
    optional: false,
    benefit: 100,
    description: "Complete the route",
  },
  {
    pull: $item`comb jelly`,
    optional: false,
    benefit: 100,
    description: "Complete the route",
  },
  {
    pull: $item`Mer-kin worktea`,
    optional: false,
    benefit: 100,
    description: "Complete the route",
  },
  {
    pull: $item`Mer-kin knucklebone`,
    optional: false,
    benefit: 100,
    description: "Complete the route",
  },
  {
    pull: $item`sea cowboy hat`,
    optional: false,
    benefit: 100,
    description: "Complete the route",
  },
  {
    pull: $item`sea chaps`,
    optional: false,
    benefit: 100,
    description: "Complete the route",
  },
  {
    pull: $item`sea lasso`,
    optional: false,
    benefit: 100,
    description: "Complete the route",
  },
  {
    pull: $item`sea cowbell`,
    optional: false,
    benefit: 100,
    description: "Complete the route",
  },
  {
    pull: $item`Mer-kin prayerbeads`,
    optional: false,
    benefit: 100,
    description: "Complete the route",
  },
  {
    pull: $item`displaced fish`,
    optional: false,
    benefit: 100,
    description: "Complete the route",
  },
  {
    pull: $item`Mer-kin killscroll`,
    optional: false,
    benefit: 100,
    description: "Complete the route",
  },
  {
    pull: $item`Mer-kin healscroll`,
    optional: false,
    benefit: 100,
    description: "Complete the route",
  },
  {
    pull: $item`Mer-kin cheatsheet`,
    optional: false,
    benefit: 100,
    description: "Complete the route",
  },
  {
    pull: $item`Mer-kin wordquiz`,
    optional: false,
    benefit: 100,
    description: "Complete the route",
  },
  {
    pull: $item`Mer-kin sneakmask`,
    optional: false,
    benefit: 100,
    description: "Complete the route",
  },
];

export const SeaPullsQuest: Quest = {
  name: "SeaPulls",
  tasks: seaPulls.map((p) => getPullTask(p)),
};
