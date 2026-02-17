import {
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $monsters,
  $skill,
  $stat,
  get,
  have,
  Macro,
} from "libram";
import { cliExecute, itemAmount, myPrimestat, use, visitUrl } from "kolmafia";
import { OutfitSpec, step } from "grimoire-kolmafia";
import { Quest, Resources } from "../../../engine/task";
import { CombatStrategy } from "../../../engine/combat";

export const SeaMonkeeQuest: Quest = {
  name: "Sea Monkee",
  tasks: [
    {
      name: "Octopus Garden",
      completed: () => step("questS02Monkees") >= 0 || have($item`wriggling flytrap pellet`),
      do: $location`An Octopus's Garden`,
      peridot: $monster`Neptune flytrap`,
      combat: new CombatStrategy()
        .macro(
          Macro.trySkill($skill`%fn, fire a Red, White and Blue Blast`).trySkill(
            $skill`%fn, let's pledge allegiance to a Zone`
          ),
          $monster`Neptune flytrap`
        )
        .macro(
          Macro.trySkill($skill`Sea *dent: Talk to Some Fish`).trySkill(
            $skill`BCZ: Refracted Gaze`
          ),
          $monsters`octopus gardener, sponge, stranglin' algae`
        )
        .kill(),
      outfit: () => {
        const result: OutfitSpec = {
          equip: $items`Everfull Dart Holster, spring shoes, April Shower Thoughts shield`,
        };

        if (get("rwbMonsterCount") > 0) {
          result.familiar = $familiar`Peace Turkey`;
        } else {
          if (
            have($familiar`Patriotic Eagle`) &&
            !have($effect`Everything Looks Red, White and Blue`)
          ) {
            result.familiar = $familiar`Patriotic Eagle`;
          } else {
            result.equip?.push($item`blood cubic zirconia`);
            result.familiar = $familiar`Peace Turkey`;
          }
        }
        return result;
      },
      limit: { soft: 20 },
    },
    {
      name: "Use Wriggling Pellet",
      after: ["Octopus Garden"],
      completed: () => step("questS02Monkees") >= 0,
      do: () => use($item`wriggling flytrap pellet`),
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Open Wreck",
      after: ["Use Wriggling Pellet"],
      completed: () => step("questS02Monkees") > 0,
      do: () => visitUrl("monkeycastle.php?who=1"),
      underwater: true,
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Wreck of the Edgar Fitzsimmons",
      after: ["Open Wreck"],
      completed: () => get("bigBrotherRescued"),
      do: $location`The Wreck of the Edgar Fitzsimmons`,
      resources: {
        which: Resources.NCForce,
        benefit: 5,
      },
      outfit: {
        modifier: "mp",
        avoid: $items`Peridot of Peril`,
        pants: $item`really, really nice swimming trunks`,
      },
      choices: { 299: 1 },
      limit: { soft: 20 },
    },
    {
      name: "Open Grandpa Zone",
      after: ["Wreck of the Edgar Fitzsimmons"],
      completed: () => step("questS02Monkees") >= 4,
      do: () => {
        visitUrl("monkeycastle.php?who=1");
        visitUrl("monkeycastle.php?who=2");
        visitUrl("monkeycastle.php?who=1");
      },
      underwater: true,
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Grandpa Anemone Mine",
      after: ["Open Grandpa Zone"],
      ready: () => myPrimestat() === $stat`Muscle`,
      completed: () => step("questS02Monkees") >= 5,
      do: $location`Anemone Mine`,
      combat: new CombatStrategy().kill(),
      outfit: {
        modifier: "-combat",
        equip: $items`Apriling band tuba, Everfull Dart Holster, McHugeLarge left ski, Möbius ring, shark jumper, bat wings, little bitty bathysphere`,
        avoid: $items`Mer-kin digpick`,
        familiar: $familiar`Peace Turkey`,
      },
      limit: { soft: 20 },
    },
    {
      name: "Grandpa Marinara Trench",
      after: ["Open Grandpa Zone"],
      ready: () => myPrimestat() === $stat`Mysticality`,
      completed: () => step("questS02Monkees") >= 5,
      do: $location`The Marinara Trench`,
      combat: new CombatStrategy().kill(),
      outfit: {
        modifier: "-combat",
        equip: $items`Apriling band tuba, Everfull Dart Holster, McHugeLarge left ski, Möbius ring, shark jumper, bat wings, little bitty bathysphere`,
        familiar: $familiar`Peace Turkey`,
      },
      limit: { soft: 20 },
    },
    {
      name: "Grandpa Dive Bar",
      after: ["Open Grandpa Zone"],
      ready: () => myPrimestat() === $stat`Moxie`,
      completed: () => step("questS02Monkees") >= 5,
      do: $location`The Dive Bar`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.step("pickpocket").if_(
            "monstername nurse shark",
            Macro.trySkill($skill`Sea *dent: Throw a Lightning Bolt`)
          );
        })
        .kill(),
      outfit: {
        modifier: "-combat",
        equip: $items`Apriling band tuba, Everfull Dart Holster, McHugeLarge left ski, Möbius ring, shark jumper, bat wings, little bitty bathysphere`,
        familiar: $familiar`Peace Turkey`,
      },
      limit: { soft: 20 },
    },
    {
      name: "Open Outpost",
      after: ["Grandpa Anemone Mine", "Grandpa Marinara Trench", "Grandpa Dive Bar"],
      completed: () => step("questS02Monkees") >= 6,
      do: () => {
        cliExecute("grandpa wife");
      },
      underwater: true,
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Outpost Grandma",
      after: ["Open Outpost"],
      completed: () => step("questS02Monkees") >= 9,
      do: $location`The Mer-Kin Outpost`,
      combat: new CombatStrategy().banish($monsters`Mer-kin burglar, Mer-kin raider`).kill(),
      outfit: () => {
        const result: OutfitSpec = {
          familiar: $familiar`Peace Turkey`,
        };
        if (itemAmount($item`Mer-kin prayerbeads`) < 3) {
          result.modifier = "item, -combat";
        } else {
          result.modifier = "-combat";
        }
        return result;
      },
      limit: { soft: 20 },
    },
    {
      name: "Grandma Note",
      after: ["Open Outpost"],
      ready: () =>
        have($item`Grandma's Note`) &&
        have($item`Grandma's Fuchsia Yarn`) &&
        have($item`Grandma's Chartreuse Yarn`),
      completed: () => have($item`Grandma's Map`) || step("questS02Monkees") >= 9,
      do: () => {
        cliExecute("grandpa note");
      },
      underwater: true,
      freeaction: true,
      limit: { tries: 1 },
    },
  ],
};
