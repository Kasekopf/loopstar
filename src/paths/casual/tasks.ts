import { mallPrice } from "kolmafia";
import { args } from "../../args";
import { NamedDeltaTask } from "../../engine/task";
import { $item } from "libram";

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
];
