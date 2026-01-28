import {
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $monsters,
  $skill,
  CursedMonkeyPaw,
  get,
  have,
  Macro,
} from "libram";
import { haveFamiliar, inHardcore, use, visitUrl } from "kolmafia";
import { step } from "grimoire-kolmafia";
import { Quest, Resources } from "../../../engine/task";
import { CombatStrategy } from "../../../engine/combat";
import { yellowRayPossible } from "../../../resources/yellowray";

export const OctopusGardenTask: Quest = {
  name: "Octopus Garden",
  tasks: [
    {
      name: "Dynamite",
      ready: () =>
        inHardcore() &&
        have($item`pocket wish`) &&
        have($item`spitball`) &&
        have($item`Spooky VHS Tape`) &&
        yellowRayPossible(),
      completed: () => have($item`minin' dynamite`, 2),
      do: () => {
        throw `Attempted to summon tetched prospector with no allocation`;
      },
      resources: {
        which: { summon: $monster`tetched prospector` },
        benefit: 200,
        required: true,
      },
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.trySkill($skill`Darts: Throw at %part1`).tryItem([
            $item`Spooky VHS Tape`,
            $item`spitball`,
          ]);
        })
        .killHard(),
      limit: { tries: 2 },
      outfit: {
        familiar: $familiar`Peace Turkey`,
        equip: $items`Everfull Dart Holster, spring shoes, Monodent of the Sea, toy Cupid bow`,
      },
    },
    {
      name: "Blast Garden",
      ready: () => have($item`minin' dynamite`),
      completed: () => step("questS02Monkees") >= 0 || !haveFamiliar($familiar`Patriotic Eagle`),
      do: $location`An Octopus's Garden`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.trySkill($skill`%fn, fire a Red, White and Blue Blast`).trySkill(
            $skill`%fn, let's pledge allegiance to a Zone`
          );
        })
        .kill(),
      peridot: $monster`Neptune flytrap`,
      outfit: {
        familiar: $familiar`Patriotic Eagle`,
        equip: $items`Everfull Dart Holster, McHugeLarge left ski, Peridot of Peril, April Shower Thoughts shield`,
      },
      limit: { soft: 1 },
    },
    {
      name: "More Garden",
      after: ["Blast Garden"],
      completed: () =>
        have($item`wriggling flytrap pellet`) ||
        step("questS02Monkees") >= 0 ||
        get("rwbMonsterCount") < 1,
      do: $location`An Octopus's Garden`,
      outfit: {
        familiar: $familiar`Peace Turkey`,
        equip: $items`Everfull Dart Holster, spring shoes, April Shower Thoughts shield`,
      },
      limit: { soft: 11 },
    },
    {
      name: "Unlucky Garden",
      after: ["More Garden"],
      completed: () => have($item`wriggling flytrap pellet`) || step("questS02Monkees") >= 0,
      do: $location`An Octopus's Garden`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.trySkill($skill`Sea *dent: Talk to Some Fish`).trySkill(
            $skill`BCZ: Refracted Gaze`
          );
        }, $monsters`octopus gardener, sponge, stranglin' algae`)
        .kill(),
      outfit: {
        familiar: $familiar`Peace Turkey`,
        equip: $items`Everfull Dart Holster, spring shoes, April Shower Thoughts shield, blood cubic zirconia`,
      },
      limit: { soft: 11 },
    },
    {
      name: "Use Wriggling Pellet",
      ready: () => have($item`wriggling flytrap pellet`),
      completed: () => step("questS02Monkees") >= 0,
      do: () => use($item`wriggling flytrap pellet`),
      freeaction: true,
      limit: { soft: 1 },
    },
    {
      name: "Turn in Quest",
      ready: () => step("questS02Monkees") === 0,
      completed: () => step("questS02Monkees") > 0,
      do: () => {
        visitUrl("monkeycastle.php?who=1");
      },
      outfit: {
        pants: $item`really, really nice swimming trunks`,
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Do Wreck",
      ready: () => step("questS02Monkees") === 1,
      completed: () => step("questS02Monkees") > 1,
      choices: { 299: 1 },
      do: () => $location`The Wreck of the Edgar Fitzsimmons`,
      resources: () => {
        return {
          which: Resources.NCForce,
          benefit: 5
        };
      },
      outfit: {
        modifier: "mp",
        avoid: $items`Peridot of Peril`,
        pants: $item`really, really nice swimming trunks`,
      },
      limit: {},
    },
    {
      name: "Talk to brothers",
      ready: () => get("bigBrotherRescued"),
      completed: () => step("questS02Monkees") >= 4,
      do: () => {
        visitUrl("monkeycastle.php?who=1");
        visitUrl("monkeycastle.php?who=2");
        visitUrl("monkeycastle.php?who=1");
      },
      outfit: {
        pants: $item`really, really nice swimming trunks`,
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Acquire shark jumper",
      after: ["Talk to brothers"],
      completed: () => have($item`shark jumper`) || !CursedMonkeyPaw.have(),
      do: () => CursedMonkeyPaw.wishFor($item`shark jumper`),
      freeaction: true,
      limit: { soft: 11 },
    },
  ],
};
