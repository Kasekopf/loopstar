import { $item, get, have } from "libram";
import { getPullTask, PullSpec } from "../../../tasks/pulls";
import { Quest } from "../../../engine/task";
import { itemAmount } from "kolmafia";

export const seaPulls: PullSpec[] = [
  {
    pull: $item`pro skateboard`,
    benefit: 2,
  },
  {
    pull: $item`shark jumper`,
    benefit: 2,
  },
  {
    pull: $item`Flash Liquidizer Ultra Dousing Accessory`,
    benefit: 2,
  },
  {
    pull: $item`Spooky VHS Tape`,
    benefit: 2,
  },
  {
    pull: $item`sea lasso`,
    benefit: 2,
  },
  {
    pull: $item`sea cowbell`,
    benefit: 2,
  },
  {
    pull: $item`lodestone`,
    benefit: 2,
  },
  {
    pull: $item`Mer-kin pinkslip`,
    benefit: 2,
  },
  {
    pull: $item`stuffed yam stinkbomb`,
    benefit: 2,
  },
  {
    pull: $item`handful of split pea soup`,
    benefit: 2,
  },
  {
    pull: $item`Platinum Yendorian Express Card`,
    benefit: 2,
    optional: true,
  },
  {
    pull: $item`ink bladder`,
    benefit: 0.8,
  },
  {
    pull: $item`Mer-kin sneakmask`,
    benefit: 0.8,
  },
  {
    pull: $item`fishy pipe`,
    benefit: 1,
  },
  {
    pull: $item`minin' dynamite`,
    benefit: 1,
  },
  {
    pull: $item`scale-mail underwear`,
    benefit: 1,
  },
  {
    pull: $item`Mer-kin cheatsheet`,
    benefit: 1,
  },
  {
    pull: $item`Mer-kin healscroll`,
    useful: () => {
      if (get("dreadScroll2") !== 0) return false;
      if (!have($item`Mer-kin dreadscroll`)) return undefined;
      if (!have($item`Mer-kin healscroll`)) return true;
      return undefined;
    },
    benefit: 0.8,
  },
  {
    pull: $item`Mer-kin killscroll`,
    useful: () => {
      if (get("dreadScroll5") !== 0) return false;
      if (!have($item`Mer-kin dreadscroll`)) return undefined;
      if (!have($item`Mer-kin killscroll`)) return true;
      return undefined;
    },
    benefit: 0.8,
  },
  {
    pull: $item`Mer-kin worktea`,
    useful: () => {
      if (get("dreadScroll7") !== 0) return false;
      if (!have($item`Mer-kin dreadscroll`)) return undefined;
      if (!have($item`Mer-kin worktea`)) return true;
      return undefined;
    },
    benefit: 1,
  },
  {
    pull: $item`Mer-kin knucklebone`,
    useful: () => {
      if (get("dreadScroll4") !== 0) return false;
      if (!have($item`Mer-kin dreadscroll`)) return undefined;
      if (!have($item`Mer-kin knucklebone`)) return true;
      return undefined;
    },
    benefit: 1,
  },
  {
    pull: $item`rusty rivet`,
    useful: () => {
      if (
        have($item`aerated diving helmet`) ||
        have($item`rusty rivet`, 8) ||
        have($item`crappy Mer-kin mask`) ||
        have($item`Mer-kin scholar mask`) ||
        have($item`Mer-kin gladiator mask`)
      )
        return false;
      if (itemAmount($item`rusty rivet`) === 7) return true;
      return undefined;
    },
    benefit: 1,
  },
];

export const SeaPullsQuest: Quest = {
  name: "Sea Pulls",
  tasks: seaPulls.map(getPullTask),
};
