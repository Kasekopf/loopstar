import { storageAmount } from "kolmafia";
import { $item } from "libram";
import { getPullTask, PullSpec } from "../../tasks/pulls";
import { Quest } from "../../engine/task";

export const ih8uPulls: PullSpec[] = [
  {
    pull: $item`Buddy Bjorn`,
    optional: true,
    benefit: 100,
    description: "Adv; generate mini kiwis",
  },
  {
    pull: $item`mini kiwi invisible dirigible`,
    optional: true,
    benefit: 100,
    description: "Free runs, generate kiwis and more",
  },
  {
    pull: $item`mini kiwi digitized cookies`,
    optional: true,
    price: 10_000,
    benefit: 100,
    description: "Adv",
  },
  {
    pull: $item`incredible mini-pizza`,
    optional: true,
    price: 10_000,
    benefit: 100,
    description: "Adv",
  },
  {
    pull: $item`mini kiwi intoxicating spirits`,
    optional: true,
    price: 10_000,
    benefit: 100,
    description: "Adv",
  },
  {
    pull: $item`tuxedo shirt`,
    useful: () => {
      return storageAmount($item`tuxedo shirt`) >= 1;
    },
    price: 1,
    benefit: 100,
    description: "Adv; improve kiwitinis",
  },
];

export const IH8UPullQuest: Quest = {
  name: "IH8UPulls",
  tasks: ih8uPulls.map((p) => getPullTask(p)),
};
