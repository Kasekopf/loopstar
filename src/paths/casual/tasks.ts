import { mallPrice } from "kolmafia";
import { args } from "../../args";
import { NamedDeltaTask } from "../../engine/task";
import { $item } from "libram";
import { PullQuest } from "../../tasks/pulls";

export const casualDeltas: NamedDeltaTask[] = [
  {
    name: "Macguffin/Milestone",
    combine: {
      ready: () => {
        if (args.casual.milestoneprice === 0) return false;
        return mallPrice($item`milestone`) < args.casual.milestoneprice;
      },
    },
    replace: {
      limit: { tries: 20 },
    },
  },
  ...PullQuest.tasks.map(
    (t) =>
      <NamedDeltaTask>{
        name: `${PullQuest.name}/${t.name}`,
        delete: true,
      }
  ),
];
