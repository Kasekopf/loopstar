import {
  buyUsingStorage,
  cliExecute,
  isUnrestricted,
  Item,
  itemAmount,
  myMeat,
  myTurncount,
  storageAmount,
  toInt,
  visitUrl,
} from "kolmafia";
import { $familiar, $item, $items, $skill, AprilingBandHelmet, get, have, set } from "libram";
import { args, toTempPref } from "../args";
import { Priorities } from "../engine/priority";
import { Quest, Resources, Task } from "../engine/task";
import { step } from "grimoire-kolmafia";
import { Keys, keyStrategy } from "./keys";
import { trainSetAvailable } from "./misc";
import { underStandard } from "../lib";

/**
 * optional: If true, only pull this if there is one in storage (i.e., no mall buy).
 * useful: True if we need it, false if we don't, undefined if not sure yet.
 * duplicate: True if we should pull it even if we have it.
 * pull: The item to pull, or a list of options to pull.
 * name: If a list of options is given, what to use for the task (& sim) name.
 * benefit: The number of turns this pull would save or generate.
 * description: Extra text to include in the sim message.
 * disabled: If true, disabled by a flag (for "im reporting).
 */
export type PullSpec = {
  optional?: boolean;
  useful?: () => boolean | undefined;
  duplicate?: boolean;
  post?: () => void;
  price?: number;
  benefit: number;
  description?: string;
  disabled?: () => boolean;
} & ({ pull: Item } | { pull: Item[] | (() => Item | Item[] | undefined); name: string });

export const pulls: PullSpec[] = [
  {
    pull: $item`crepe paper parachute cape`,
    optional: true,
    benefit: 10,
    description: "Monster targetting",
  },
  // Hero keys
  {
    pull: $item`daily dungeon malware`,
    useful: () => keyStrategy.useful(Keys.Malware),
    benefit: 1000,
  },
  {
    name: "Key Zappable",
    pull: () => keyStrategy.getZapChoice(0),
    useful: () => keyStrategy.useful(Keys.Zap),
    duplicate: true,
    benefit: 1000,
  },
  {
    name: "Key Zappable 2",
    pull: () => keyStrategy.getZapChoice(1),
    useful: () => keyStrategy.useful(Keys.Zap2),
    duplicate: true,
    benefit: 1000,
  },
  // Other adventure pulls
  {
    pull: $item`mafia thumb ring`,
    optional: true,
    benefit: 12,
    description: "Adv",
  },
  {
    pull: $item`carnivorous potted plant`,
    optional: true,
    benefit: 2,
    description: "Free kills",
  },
  // General pulls
  {
    pull: $item`lucky gold ring`,
    useful: () => args.minor.lgr,
    optional: true,
    description: 'Farming currency; see the argument "lgr"',
    benefit: 90,
  },
  {
    name: "Ore",
    pull: () => {
      const ore = get("trapperOre");
      if (!ore) return undefined;
      return ore;
    },
    useful: () => {
      if (trainSetAvailable()) return false;
      if (
        itemAmount($item`asbestos ore`) >= 3 &&
        itemAmount($item`linoleum ore`) >= 3 &&
        itemAmount($item`chrome ore`) >= 3
      )
        return false;
      if (have($item`Deck of Every Card`)) return false;
      if (step("questL08Trapper") >= 2) return false;
      const ore = get("trapperOre");
      if (!ore) return undefined;
      return itemAmount(ore) < 3;
    },
    duplicate: true,
    benefit: 80,
  },
  {
    pull: $item`1,970 carat gold`,
    useful: () => {
      if (underStandard()) return false;
      if (myMeat() < 500 && step("questM05Toot") > 0 && !have($item`letter from King Ralph XI`))
        return true;
      if (
        myMeat() < 4000 &&
        step("questL11Black") === 2 &&
        !have($item`forged identification documents`)
      )
        return true;
      if (step("questL11Black") > 2) return false;
      return undefined;
    },
    benefit: 70,
  },
  {
    pull: $item`1952 Mickey Mantle card`,
    useful: () => {
      if (have($item`forged identification documents`) || step("questL11Black") >= 4) return false;
      if (step("questL11Black") >= 2 && myTurncount() >= 200) return true;
      return undefined;
    },
    benefit: 70,
  },
  {
    pull: $items`Greatest American Pants, navel ring of navel gazing, peppermint parasol`,
    optional: true,
    name: "Runaway IoTM",
    benefit: 10,
    description: "Free runs",
  },
  {
    pull: $items`aquaviolet jub-jub bird, charpuce jub-jub bird, crimsilion jub-jub bird, stomp box`,
    optional: true,
    name: "Runaway Comma IoTM",
    useful: () =>
      have($familiar`Comma Chameleon`) &&
      !have($familiar`Frumious Bandersnatch`) &&
      !have($familiar`Pair of Stomping Boots`),
    post: () => {
      const bestCommaPull =
        $items`aquaviolet jub-jub bird, charpuce jub-jub bird, crimsilion jub-jub bird, stomp box`.find(
          (f) => have(f)
        );
      if (bestCommaPull !== undefined) {
        visitUrl(`inv_equip.php?which=2&action=equip&whichitem=${toInt(bestCommaPull)}&pwd`);
        visitUrl("charpane.php");
        cliExecute("set _commaRunDone = true");
      }
    },
    benefit: 10,
  },
  {
    pull: $item`ring of conflict`, // Last chance for -5% combat frequency
    useful: () =>
      !have($item`unbreakable umbrella`) &&
      !have($item`Space Trip safety headphones`) &&
      storageAmount($item`Space Trip safety headphones`) === 0 &&
      !have($item`protonic accelerator pack`),
    benefit: 5,
  },
  { pull: $item`antique machete`, benefit: 12 },
  {
    pull: $item`book of matches`,
    useful: () =>
      !(
        (have($item`cosmic bowling ball`) || get("cosmicBowlingBallReturnCombats", -1) >= 0) &&
        have($skill`Map the Monsters`) &&
        have($familiar`Melodramedary`)
      ),
    benefit: 10,
  },
  { pull: $item`blackberry galoshes`, useful: () => step("questL11Black") < 2, benefit: 9.01 },
  // {
  //   pull: $item`Buddy Bjorn`,
  //   useful: () => yellowSubmarinePossible(true),
  //   optional: true,
  //   benefit: 9,
  // },
  {
    pull: $item`killing jar`,
    useful: () => {
      if (step("questM20Necklace") < 4) return undefined;
      return (
        !have($familiar`Melodramedary`) &&
        (get("gnasirProgress") & 4) === 0 &&
        get("desertExploration") < 100
      );
    },
    benefit: 8,
  },
  {
    pull: $item`deck of lewd playing cards`,
    optional: true,
    benefit: 5,
    description: "Protestors",
  },
  { pull: $item`gravy boat`, useful: () => !underStandard(), benefit: 5 },
  {
    pull: $item`Mohawk wig`,
    useful: () => {
      if (have($item`S.O.C.K.`)) return true; // If one didn't drop naturally
      return undefined;
    },
    benefit: 5,
  },
  {
    pull: $item`11-leaf clover`,
    duplicate: true,
    useful: () =>
      get("zeppelinProtestors") < 80 &&
      !have($item`Apriling band saxophone`) &&
      !(
        AprilingBandHelmet.canJoinSection() &&
        get("_aprilBandInstruments") + args.resources.saveapriling <=
        1 + itemAmount($item`Apriling band tuba`)
      ),
    benefit: 5,
  },
  {
    pull: $item`wet stew`,
    useful: () =>
      step("questL11Palindome") < 5 &&
      !have($item`wet stunt nut stew`) &&
      !have($item`wet stew`) &&
      (!have($item`lion oil`) || !have($item`bird rib`)),
    benefit: 5,
  },
  {
    pull: $item`Flash Liquidizer Ultra Dousing Accessory`,
    benefit: 4,
  },
  {
    pull: $item`Shore Inc. Ship Trip Scrip`,
    useful: () => {
      let scripNeeded = 4;
      scripNeeded -= itemAmount($item`Shore Inc. Ship Trip Scrip`);
      if (
        have($item`dinghy plans`) ||
        have($item`dingy dinghy`) ||
        have($item`junk junk`) ||
        have($item`skeletal skiff`) ||
        have($item`yellow submarine`)
      )
        scripNeeded -= 3;
      if (have($item`UV-resistant compass`)) scripNeeded -= 1;
      return scripNeeded > 0;
    },
    optional: true,
    benefit: 3,
    description: "Shore trips",
  },
];

export function getPullItem(spec: PullSpec): Item[] | undefined {
  if (spec.pull instanceof Item) {
    return [spec.pull];
  } else if (typeof spec.pull === "function") {
    const result = spec.pull();
    if (!result) return undefined;
    if (result instanceof Item) return [result];
    return result;
  } else {
    return spec.pull;
  }
}

class Pull {
  readonly items: () => (Item | undefined)[];
  readonly name: string;
  readonly optional: boolean;
  readonly duplicate: boolean;
  readonly useful: () => boolean | undefined;
  readonly post: () => void;
  readonly description?: string;
  readonly price?: number;
  readonly priority: number;
  state: PullState;

  constructor(spec: PullSpec) {
    if ("name" in spec) {
      this.name = spec.name;
      this.description = spec.description ?? spec.name;
    } else {
      this.name = spec.pull.name;
      this.description = spec.description;
    }

    const pull = spec.pull;
    if (pull instanceof Item) {
      this.items = () => [pull];
    } else if (typeof pull === "function") {
      this.items = () => {
        const result = pull();
        if (result === undefined || result instanceof Item) return [result];
        return result;
      };
    } else {
      this.items = () => pull;
    }
    this.duplicate = spec.duplicate ?? false;
    this.optional = spec.optional ?? false;
    this.useful = spec.useful ?? (() => true);
    this.price = spec.price;
    this.post =
      spec.post ??
      (() => { });
    this.priority = spec.benefit;
    this.state = PullState.MAYBE_UNSURE;
  }

  public wasPulled(pulled: Set<Item>) {
    for (const item of this.items()) {
      if (item === undefined) continue;
      if (!this.duplicate && have(item)) return true;
      if (pulled.has(item)) return true;
    }
    return false;
  }

  public shouldPull(): boolean | undefined {
    const needed = this.useful();
    if (needed === false) return false;

    for (const item of this.items()) {
      if (item === undefined) return undefined; // We don't even know which item yet
      if (!isUnrestricted(item) && underStandard()) continue;
      if (storageAmount(item) > 0) return needed;
    }
    if (this.optional) return false; // We don't have any, so we don't need one.
    return needed;
  }

  public pull(): void {
    for (const item of this.items()) {
      if (item === undefined) throw `Unable to pull ${this.name}; the desired item is undefined`;
      if (!isUnrestricted(item) && underStandard()) continue;
      if (storageAmount(item) > 0 || buyUsingStorage(1, item, this.price ?? 100000)) {
        cliExecute(`pull ${item.name}`);
        set(toTempPref("pullsUsed"), get(toTempPref("pullsUsed"), 0) + 1);
        return;
      }
    }
  }
}

enum PullState {
  PULLED,
  READY,
  MAYBE_UNSURE, // Not sure if the item is needed.
  MAYBE_IFROOM, // Not sure if there is room in the plan.
  UNNEEDED,
}

export function getPullTask(spec: PullSpec): Task {
  const pull = new Pull(spec);
  return {
    name: pull.name,
    priority: () => Priorities.Pull,
    after: [],
    ready: () => !!pull.shouldPull(),
    completed: () =>
      pull.shouldPull() === false ||
      pull.wasPulled(
        new Set<Item>(
          get("_roninStoragePulls")
            .split(",")
            .map((id) => parseInt(id))
            .filter((id) => id > 0)
            .map((id) => Item.get(id))
        )
      ),
    do: () => pull.pull(),
    post: () => pull.post(),
    limit: { tries: 1 },
    freeaction: true,
    resources: {
      which: Resources.Pull,
      benefit: pull.priority,
      required: true,
    },
  };
}

export const PullQuest: Quest = {
  name: "Pull",
  tasks: pulls.map((p) => getPullTask(p)),
};
