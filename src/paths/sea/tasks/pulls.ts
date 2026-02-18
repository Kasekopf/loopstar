import { $item, get, have } from "libram";
import { getPullTask, PullSpec } from "../../../tasks/pulls";
import { Quest } from "../../../engine/task";
import { itemAmount } from "kolmafia";
import { AcquireSpec, getAcquireTask, Prices } from "../../casual/acquire";
import { args } from "../../../args";

const seaPulls: PullSpec[] = [
  {
    pull: $item`jam band bootleg`,
    benefit: 10,
  },
  {
    pull: $item`dark porquoise ring`,
    benefit: 10,
  },
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
    benefit: 5,
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

export const SeaPullQuest: Quest = {
  name: "Sea Pull",
  tasks: seaPulls.map(getPullTask),
};

const seaAcquires: AcquireSpec[] = [
  {
    what: $item`shark jumper`,
    needed: () => 1,
    price: Prices.Permanent,
  },
  {
    what: $item`Mer-kin sneakmask`,
    needed: () => 1,
    price: Prices.Permanent,
  },
  {
    what: $item`rusty diving helmet`,
    needed: () => {
      if (!needMask()) return 0;
      return 1;
    },
    price: Prices.Permanent,
  },
  {
    what: $item`sea chaps`,
    needed: () => {
      if (get("lassoTrainingCount") < 20) return 1;
      if (!needTailpiece()) return 0;
      return 1;
    },
    price: Prices.Permanent,
  },
  {
    what: $item`teflon swim fins`,
    needed: () => {
      if (!needTailpiece()) return 0;
      return 1;
    },
    price: Prices.Permanent,
  },
  {
    what: $item`pristine fish scale`,
    needed: () => {
      if (!needTailpiece()) return 0;
      return 3;
    },
    price: Prices.Permanent,
  },
  {
    what: $item`sea lasso`,
    needed: () => {
      if (get("lassoTrainingCount") >= 20) return 0;
      return 1;
    },
    limit: 5,
    price: Prices.Used,
  },
  {
    what: $item`sea cowbell`,
    needed: () => {
      if (get("seahorseName") !== "") return 0;
      return 3;
    },
    price: Prices.Used,
  },
  {
    what: $item`Mer-kin hallpass`,
    needed: () => {
      if (args.aftercore.goal !== "hatred") return 0;
      if (get("merkinElementaryTeacherUnlock")) return 0;
      let needed = 2;
      if (have($item`Mer-kin scholar mask`) || have($item`Mer-kin facecowl`)) needed--;
      if (have($item`Mer-kin scholar tailpiece`) || have($item`Mer-kin waistrope`)) needed--;
      return needed;
    },
    price: Prices.Used,
  },
  {
    what: $item`Mer-kin wordquiz`,
    needed: () => {
      if (args.aftercore.goal !== "hatred") return 0;
      if (!have($item`Mer-kin scholar mask`) || !have($item`Mer-kin scholar tailpiece`)) return 0; // wait
      return (100 - get("merkinVocabularyMastery")) / 10;
    },
    price: Prices.Used,
  },
  {
    what: $item`Mer-kin cheatsheet`,
    needed: () => {
      if (args.aftercore.goal !== "hatred") return 0;
      if (!have($item`Mer-kin scholar mask`) || !have($item`Mer-kin scholar tailpiece`)) return 0; // wait
      return (100 - get("merkinVocabularyMastery")) / 10;
    },
    price: Prices.Used,
  },
  {
    what: $item`Mer-kin knucklebone`,
    needed: () => {
      if (args.aftercore.goal !== "hatred") return 0;
      if (get("dreadScroll4") !== 0) return 0;
      if (!have($item`Mer-kin dreadscroll`)) return 0; // wait
      return 1;
    },
    price: Prices.Used,
  },
  {
    what: $item`Mer-kin worktea`,
    needed: () => {
      if (args.aftercore.goal !== "hatred") return 0;
      if (get("dreadScroll7") !== 0) return 0;
      if (!have($item`Mer-kin dreadscroll`)) return 0; // wait
      return 1;
    },
    price: Prices.Used,
  },
  {
    what: $item`Mer-kin killscroll`,
    needed: () => {
      if (args.aftercore.goal !== "hatred") return 0;
      if (get("dreadScroll5") !== 0) return 0;
      return 5;
    },
    limit: 5,
    price: Prices.Used,
  },
  {
    what: $item`Mer-kin healscroll`,
    needed: () => {
      if (args.aftercore.goal !== "hatred") return 0;
      if (get("dreadScroll2") !== 0) return 1; // for the boss
      return 5;
    },
    limit: 5,
    price: Prices.Used,
  },
  {
    what: $item`soggy used band-aid`,
    needed: () => {
      if (args.aftercore.goal !== "hatred") return 0;
      return 1;
    },
    price: Prices.Used,
  },
  {
    what: $item`Mer-kin prayerbeads`,
    needed: () => {
      if (args.aftercore.goal !== "hatred") return 0;
      return 3;
    },
    price: Prices.Permanent,
  },
  {
    what: $item`jam band bootleg`,
    needed: () => {
      if (args.aftercore.goal !== "violence") return 0;
      return 1;
    },
    price: Prices.Used,
  },
  {
    what: $item`dark porquoise ring`,
    needed: () => {
      if (args.aftercore.goal !== "violence") return 0;
      return 1;
    },
    price: Prices.Used,
  },
];

export const SeaAcquireQuest: Quest = {
  name: "Sea Acquire",
  tasks: seaAcquires.map(getAcquireTask),
};

/**
 * Return true if we will need a new crappy Mer-kin mask as an aftercore goal.
 *
 * We do not consider deconstructing the opposite kind of mask, since anyone
 * doing the sea multiple times will eventually need both.
 */
function needMask(): boolean {
  if (have($item`crappy Mer-kin mask`)) return false;
  if (args.aftercore.goal === "hatred") return have($item`Mer-kin scholar mask`);
  if (args.aftercore.goal === "violence") return have($item`Mer-kin gladiator mask`);
  return false;
}

/**
 * Return true if we will need a new crappy Mer-kin tailpiece as an aftercore goal.
 *
 * We do not consider deconstructing the opposite kind of tailpiece, since anyone
 * doing the sea multiple times will eventually need both.
 */
function needTailpiece(): boolean {
  if (have($item`crappy Mer-kin tailpiece`)) return false;
  if (args.aftercore.goal === "hatred") return have($item`Mer-kin scholar tailpiece`);
  if (args.aftercore.goal === "violence") return have($item`Mer-kin gladiator tailpiece`);
  return false;
}
