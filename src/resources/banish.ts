import { Item, Monster, myClass, myFury, myMaxmp, myMp, myTurncount, Skill } from "kolmafia";
import { BanishState } from "../engine/state";
import {
  $class,
  $effect,
  $item,
  $items,
  $skill,
  AsdonMartin,
  Delayed,
  get,
  have,
  Macro,
} from "libram";
import { args } from "../args";
import { killMacro } from "../engine/combat";
import { customRestoreMp } from "../engine/moods";
import { asdonFualable } from "../lib";
import { refillLatte } from "./runaway";
import { CombatResource } from "./lib";
import { Task } from "../engine/task";

type BanishSimpleDo = CombatResource & {
  do: Item | Skill;
  free: boolean;
  blocked?: string[];
  capacity?: number;
  nokill?: Macro;
};
type BanishMacroDo = CombatResource & {
  do: Macro | Delayed<Macro>;
  tracker: Item | Skill;
  free: boolean;
  blocked?: string[];
  capacity?: number;
  nokill?: Macro;
};
export type BanishSource = BanishSimpleDo | BanishMacroDo;
function getTracker(source: BanishSource): Item | Skill {
  if ("tracker" in source) return source.tracker;
  return source.do;
}

const banishSources: BanishSource[] = [
  {
    name: "Bowl Curveball",
    available: () =>
      have($item`cosmic bowling ball`) || get("cosmicBowlingBallReturnCombats") === 0,
    do: $skill`Bowl a Curveball`,
    free: true,
  },
  {
    name: "Asdon Martin",
    available: (): boolean => {
      if (args.debug.lastasdonbumperturn && myTurncount() - args.debug.lastasdonbumperturn > 30)
        return false;

      // From libram
      if (!asdonFualable(50)) return false;
      const banishes = get("banishedMonsters").split(":");
      const bumperIndex = banishes
        .map((string) => string.toLowerCase())
        .indexOf("spring-loaded front bumper");
      if (bumperIndex === -1) return true;
      return myTurncount() - parseInt(banishes[bumperIndex + 1]) > 30;
    },
    prepare: () => AsdonMartin.fillTo(50),
    do: $skill`Asdon Martin: Spring-Loaded Front Bumper`,
    free: true,
    blocked: ["Tavern/Basement", "Bat/Boss Bat"],
  },
  {
    name: "Spring Shoes Kick Away",
    available: () => have($item`spring shoes`) && !have($effect`Everything Looks Green`),
    equip: $item`spring shoes`,
    do: Macro.skill($skill`Spring Kick`).skill($skill`Spring Away`),
    tracker: $skill`Spring Kick`,
    free: true,
  },
  {
    // Only in Grey You
    name: "System Sweep",
    available: () => have($skill`System Sweep`),
    do: $skill`System Sweep`,
    free: false,
  },
  {
    name: "Feel Hatred",
    available: () => get("_feelHatredUsed") < 3 && have($skill`Emotionally Chipped`),
    do: $skill`Feel Hatred`,
    free: true,
  },
  {
    name: "Latte",
    available: () =>
      (!get("_latteBanishUsed") || (get("_latteRefillsUsed") < 2 && myTurncount() < 1000)) && // Save one refill for aftercore
      have($item`latte lovers member's mug`),
    prepare: refillLatte,
    do: $skill`Throw Latte on Opponent`,
    equip: $item`latte lovers member's mug`,
    free: true,
  },
  {
    name: "Reflex Hammer",
    available: () => get("_reflexHammerUsed") < 3 && have($item`Lil' Doctor™ bag`),
    do: $skill`Reflex Hammer`,
    equip: $item`Lil' Doctor™ bag`,
    free: true,
  },
  {
    name: "Snokebomb",
    available: () => get("_snokebombUsed") < 3 && have($skill`Snokebomb`),
    prepare: () => {
      if (myMp() < 50 && myMaxmp() >= 50) customRestoreMp(50);
    },
    do: $skill`Snokebomb`,
    equip: [
      // for MP
      { equip: $items`sea salt scrubs` },
      { equip: $items`hopping socks` },
    ],
    free: true,
  },
  {
    name: "KGB dart",
    available: () =>
      get("_kgbTranquilizerDartUses") < 3 && have($item`Kremlin's Greatest Briefcase`),
    do: $skill`KGB tranquilizer dart`,
    equip: $item`Kremlin's Greatest Briefcase`,
    free: true,
  },
  {
    name: "Tennis Ball",
    available: () => !!args.resources.speed && have($item`tennis ball`),
    do: $item`tennis ball`,
    free: true,
  },
  {
    name: "Yam Stinkbomb",
    available: () => !!args.resources.speed && have($item`stuffed yam stinkbomb`),
    do: $item`stuffed yam stinkbomb`,
    free: true,
  },
  {
    name: "Middle Finger",
    available: () => !get("_mafiaMiddleFingerRingUsed") && have($item`mafia middle finger ring`),
    do: $skill`Show them your ring`,
    equip: $item`mafia middle finger ring`,
    free: true,
  },
  {
    // Only in Avatar of Boris
    name: "Banishing Shout",
    available: () => have($skill`Banishing Shout`),
    do: $skill`Banishing Shout`,
    free: false,
    capacity: 3,
  },
  {
    name: "Batter Up",
    available: () =>
      have($skill`Batter Up!`) && myClass() === $class`Seal Clubber` && myFury() >= 5,
    do: $skill`Batter Up!`,
    equip: { weapon: $item`seal-clubbing club` },
    free: false,
  },
];

const killBanishSources: BanishSource[] = [
  {
    name: "Monkey Paw",
    available: () => have($item`cursed monkey's paw`) && get("_monkeyPawWishesUsed", 0) === 0,
    equip: $item`cursed monkey's paw`,
    do: $skill`Monkey Slap`,
    free: false,
  },
  {
    name: "Spring Shoes Kick",
    available: () => have($item`spring shoes`),
    equip: $item`spring shoes`,
    do: () => Macro.skill($skill`Spring Kick`).step(killMacro()),
    tracker: $skill`Spring Kick`,
    nokill: Macro.trySkill($skill`Spring Kick`),
    free: false,
  },
  {
    name: "Monodent",
    available: () => have($item`Monodent of the Sea`) && get("_seadentLightningUsed", 0) < 11,
    equip: $item`Monodent of the Sea`,
    do: $skill`Sea *dent: Throw a Lightning Bolt`,
    free: false,
  },
];

/**
 * Return a list of all banishes not allocated to some available task.
 */
export function unusedBanishes(
  banishState: BanishState,
  tasks: Task[],
  taskName: string,
  style: "ends" | "kills" | "nokill"
): BanishSource[] {
  const relevantMonsters = new Set<Monster>();
  for (const task of tasks) {
    if (task.combat === undefined) continue;
    if (task.ignorebanishes?.()) continue;
    for (const monster of task.combat.where("banish")) relevantMonsters.add(monster);
    for (const monster of task.combat.where("killBanish")) relevantMonsters.add(monster);
    for (const monster of task.combat.where("ignoreSoftBanish")) relevantMonsters.add(monster);
  }

  const sources = {
    ends: banishSources,
    kills: killBanishSources,
    nokill: killBanishSources.filter((source) => source.nokill),
  }[style];
  return sources.filter((banish) => {
    if (!banish.available()) return false;
    if (banish.blocked?.includes(taskName)) return false;
    const overwritten = banishState.overwrittenMonster(getTracker(banish), banish.capacity ?? 1);
    if (!overwritten) return true;
    return !relevantMonsters.has(overwritten);
  });
}
