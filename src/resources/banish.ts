import { Item, myClass, myFury, myMaxmp, myMp, myTurncount, Skill } from "kolmafia";
import { BanishState } from "../engine/state";
import { $class, $effect, $item, $items, $skill, get, have, Macro } from "libram";
import { args } from "../args";
import { killMacro } from "../engine/combat";
import { customRestoreMp } from "../engine/moods";
import { asdonFualable } from "../lib";
import { asdonFillTo } from "../lib";
import { refillLatte } from "./runaway";
import { CombatResource } from "./lib";
import { Task } from "../engine/task";

type BanishSimpleDo = CombatResource & {
  do: Item | Skill;
};
type BanishMacroDo = CombatResource & {
  do: Macro;
  tracker: Item | Skill;
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
    prepare: () => asdonFillTo(50),
    do: $skill`Asdon Martin: Spring-Loaded Front Bumper`,
  },
  {
    name: "Spring Shoes Kick Away",
    available: () => have($item`spring shoes`) && !have($effect`Everything Looks Green`),
    equip: $item`spring shoes`,
    do: Macro.skill($skill`Spring Kick`).skill($skill`Spring Away`),
    tracker: $skill`Spring Kick`,
  },
  {
    name: "Feel Hatred",
    available: () => get("_feelHatredUsed") < 3 && have($skill`Emotionally Chipped`),
    do: $skill`Feel Hatred`,
  },
  {
    name: "Latte",
    available: () =>
      (!get("_latteBanishUsed") || (get("_latteRefillsUsed") < 2 && myTurncount() < 1000)) && // Save one refill for aftercore
      have($item`latte lovers member's mug`),
    prepare: refillLatte,
    do: $skill`Throw Latte on Opponent`,
    equip: $item`latte lovers member's mug`,
  },
  {
    name: "Reflex Hammer",
    available: () => get("_reflexHammerUsed") < 3 && have($item`Lil' Doctor™ bag`),
    do: $skill`Reflex Hammer`,
    equip: $item`Lil' Doctor™ bag`,
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
  },
  {
    name: "KGB dart",
    available: () =>
      get("_kgbTranquilizerDartUses") < 3 && have($item`Kremlin's Greatest Briefcase`),
    do: $skill`KGB tranquilizer dart`,
    equip: $item`Kremlin's Greatest Briefcase`,
  },
  {
    name: "Middle Finger",
    available: () => !get("_mafiaMiddleFingerRingUsed") && have($item`mafia middle finger ring`),
    do: $skill`Show them your ring`,
    equip: $item`mafia middle finger ring`,
  },
  {
    name: "Monkey Paw",
    available: () => have($item`cursed monkey's paw`) && get("_monkeyPawWishesUsed", 0) === 0,
    equip: $item`cursed monkey's paw`,
    do: $skill`Monkey Slap`,
  },
  {
    name: "Spring Shoes Kick",
    available: () => have($item`spring shoes`),
    equip: $item`spring shoes`,
    do: Macro.skill($skill`Spring Kick`).step(killMacro()),
    tracker: $skill`Spring Kick`,
  },
  {
    name: "Batter Up",
    available: () =>
      have($skill`Batter Up!`) && myClass() === $class`Seal Clubber` && myFury() >= 5,
    do: $skill`Batter Up!`,
    equip: { weapon: $item`seal-clubbing club` },
  },
];

// Return a list of all banishes not allocated to some available task
export function unusedBanishes(banishState: BanishState, tasks: Task[]): BanishSource[] {
  const used_banishes = new Set<Item | Skill>();
  for (const task of tasks) {
    if (task.combat === undefined) continue;
    if (task.ignore_banishes?.()) continue;
    for (const monster of task.combat.where("banish")) {
      const banished_with = banishState.already_banished.get(monster);
      if (banished_with !== undefined) used_banishes.add(banished_with);
    }
  }

  return banishSources.filter(
    (banish) => banish.available() && !used_banishes.has(getTracker(banish))
  );
}
