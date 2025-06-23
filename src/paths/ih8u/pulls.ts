import { storageAmount } from "kolmafia";
import { $item } from "libram";
import { getPullTask, PullSpec } from "../../tasks/pulls";
import { Quest } from "../../engine/task";

export const ih8uPulls: PullSpec[] = [
  // Food
  {
    pull: $item`Crown of Thrones`,
    useful: () => {
      return storageAmount($item`Crown of Thrones`) >= 1;
    },
    price: 1,
    benefit: 100,
    description: "Adv; generate mini kiwis",
  },
];

export const IH8UPullQuest: Quest = {
  name: "IH8UPulls",
  tasks: ih8uPulls.map((p) => getPullTask(p)),
};
