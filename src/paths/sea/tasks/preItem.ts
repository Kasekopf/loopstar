import {
  $class,
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $monsters,
  $skill,
  AprilingBandHelmet,
  ChestMimic,
  ClosedCircuitPayphone,
  get,
  have,
  Macro,
  PeridotOfPeril,
  set,
  withChoice,
} from "libram";
import { step } from "grimoire-kolmafia";

import { abort, adv1, canAdventure, cliExecute, myClass, print, useSkill } from "kolmafia";
import { Quest, Resources } from "../../../engine/task";
import { CombatStrategy } from "../../../engine/combat";
import {
  countFreeMines,
  visitMine,
  Mine,
  getAsMatrix,
  getLayoutAsMatrix,
  mineCoordinate,
  MiningCoordinate,
} from "../mining";
import { bestCopyTarget, grandpaZone } from "../util";

export const PreItemTask: Quest = {
  name: "Pre-Item Run",
  tasks: [
    {
      name: "Shadow Rift Buff",
      ready: () =>
        ClosedCircuitPayphone.have() &&
        !ClosedCircuitPayphone.rufusTarget() &&
        have($item`Rufus's shadow lodestone`) &&
        step("questS02Monkees") >= 4,
      completed: () => have($effect`Shadow Waters`) || step("questS02Monkees") >= 5,
      do: () => {
        withChoice(1500, 2, () => adv1($location`Shadow Rift (The Misspelled Cemetary)`, -1, ""));
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Kill Miner",
      ready: () => step("questS02Monkees") >= 4,
      completed: () => have($item`Mer-kin digpick`),
      do: $location`Anemone Mine`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.step("pickpocket");
        })
        .kill(),
      outfit: {
        modifier: "item",
        equip: $items`Monodent of the Sea, Everfull Dart Holster, spring shoes, Peridot of Peril, prismatic beret, shark jumper, toy cupid bow`,
      },
      peridot: $monster`Mer-kin miner`,
      limit: { soft: 11 },
    },
    {
      name: "Free Mining",
      ready: () => have($item`Mer-kin digpick`),
      completed: () => countFreeMines() === 0,
      do: () => {
        print("Visiting mine...");
        visitMine(Mine.ANEMONE);
        const mineMatrix = getAsMatrix(Mine.ANEMONE);
        const mineOreMatrix = getLayoutAsMatrix(Mine.ANEMONE);
        print(mineMatrix.toString());
        print(mineOreMatrix.toString());
        for (let y = 5; y >= 1; y--) {
          if (mineMatrix[y][3] !== "o") {
            mineCoordinate(Mine.ANEMONE, [3 + 1, y + 1]);
            return;
          }
        }

        // Build list of remaining unmined spots matching criteria
        const availableCoordinates: MiningCoordinate[] = [];

        for (let x = 0; x < 6; x++) {
          for (let y = 0; y < 6; y++) {
            // Skip already mined squares
            if (mineMatrix[y][x] === "o") continue;

            // Check if sparkly (rows 0-2)
            if (y <= 2 && mineMatrix[y][x] === "*") {
              availableCoordinates.push([x, y]);
              continue;
            }

            // Check if on row 1 and adjacent to a mined square
            if (y === 1) {
              const adjacentMined =
                (x > 0 && mineMatrix[y][x - 1] === "o") || // left
                (x < 5 && mineMatrix[y][x + 1] === "o") || // right
                mineMatrix[y - 1][x] === "o" || // above (row 0)
                mineMatrix[y + 1][x] === "o"; // below (row 2)

              if (adjacentMined) {
                availableCoordinates.push([x, y]);
              }
            }
          }
        }

        // Choose the coordinate with best score
        let bestCoordinate: MiningCoordinate | null = null;
        let bestScore = -Infinity;

        for (const [x, y] of availableCoordinates) {
          let minVinylDistance = 1000;
          let minVelcroDistance = 1000;

          // Find minimum distance to each type of ore
          for (let oy = 0; oy < 6; oy++) {
            for (let ox = 0; ox < 6; ox++) {
              const cell = mineOreMatrix[oy][ox];
              const distance = Math.abs(x - ox) + Math.abs(y - oy);

              if (cell.includes("vinyl")) {
                minVinylDistance = Math.min(minVinylDistance, distance);
              }
              if (cell.includes("velcro")) {
                minVelcroDistance = Math.min(minVelcroDistance, distance);
              }
            }
          }

          // Score based on distances (higher is better)
          let score = minVinylDistance + minVelcroDistance;

          // Add sparkly bonus
          const sparklyBonus = mineMatrix[y][x] === "*" ? 2 : 0;
          score += sparklyBonus;

          if (score > bestScore) {
            bestScore = score;
            bestCoordinate = [x, y];
          }
        }

        if (bestCoordinate) {
          mineCoordinate(Mine.ANEMONE, [bestCoordinate[0] + 1, bestCoordinate[1] + 1]);
        }
      },
      outfit: {
        equip: $items`Mer-kin digpick`,
        avoid: $items`Peridot of Peril`,
      },
      post: () => {
        if (have($effect`beaten up`)) {
          useSkill($skill`tongue of the walrus`);
        }
      },
      limit: { soft: 11 },
    },
    {
      name: "Manual Mining",
      ready: () => have($item`Mer-kin digpick`),
      completed: () =>
        have($item`teflon ore`) ||
        have($item`teflon swim fins`) ||
        have($item`crappy Mer-kin tailpiece`) ||
        have($item`Mer-kin scholar tailpiece`) ||
        have($item`Mer-kin gladiator tailpiece`),
      do: () => {
        // Mining logic not implemented yet
        print("Oh no, we ran out of free mining!");
        abort();
      },
      outfit: {
        equip: $items`Mer-kin digpick`,
        avoid: $items`Peridot of Peril`,
      },
      limit: { soft: 11 },
    },
    {
      name: "Dive Bar Noncombats",
      after: ["Manual Mining"],
      ready: () => step("questS02Monkees") >= 4,
      completed: () => step("questS02Monkees") >= 5,
      do: grandpaZone(),
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
      limit: { soft: 11 },
    },
    {
      name: "Outpost Unlock",
      after: ["Dive Bar Noncombats"],
      completed: () => step("questS02Monkees") >= 6,
      do: () => {
        cliExecute("grandpa wife");
      },
      outfit: {
        pants: $item`really, really nice swimming trunks`,
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Outpost Freerun",
      after: ["Outpost Unlock"],
      completed: () => have($item`Mer-kin lockkey`) || get("seahorseName") !== "",
      ready: () => !have($effect`Everything Looks Green`) && step("questS02Monkees") >= 6,
      do: $location`The Mer-Kin Outpost`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.step("pickpocket")
            .trySkill($skill`Darts: Throw at %part1`)
            .trySkill($skill`Spring Away`);
        }, $monsters`Mer-kin burglar, Mer-kin raider, Mer-kin healer`)
        .macro((): Macro => {
          return Macro.trySkill($skill`Darts: Throw at %part1`).trySkillRepeat($skill`Shieldbutt`);
        }, $monster`time cop`),
      post: () => {
        if (have($effect`Everything Looks Green`)) {
          set("_autosea_didfreerun", true);
        }
      },
      outfit: {
        equip: $items`Everfull Dart Holster, Möbius ring, Spring shoes, little bitty bathysphere, Monodent of the Sea, April Shower Thoughts shield`,
        familiar: $familiar`Peace Turkey`,
      },
      limit: { soft: 11 },
    },
    {
      name: "Generate Egg",
      after: ["Outpost Unlock"],
      completed: () =>
        get("_autosea_egg_generated", false) ||
        !have($skill`Just the Facts`) ||
        get("_monsterHabitatsRecalled") > 0,
      ready: () => ChestMimic.have() && canAdventure($location`Madness Reef`), // this doesn't actually work but idk what will
      do: () => {
        ChestMimic.receive(bestCopyTarget());
      },
      post: () => {
        set("_autosea_egg_generated", true);
      },
      outfit: {
        familiar: $familiar`Chest Mimic`,
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Run Egg",
      after: ["Generate Egg"],
      completed: () => get("_monsterHabitatsRecalled") > 0,
      do: () => {
        ChestMimic.differentiate(bestCopyTarget());
      },
      combat: new CombatStrategy().macro((): Macro => {
        return Macro.step("pickpocket")
          .trySkill($skill`Darts: Throw at %part1`)
          .trySkill($skill`Recall Facts: Monster Habitats`)
          .trySkill($skill`Recall Facts: %phylum Circadian Rhythms`)
          .trySkill($skill`Transcendent Olfaction`)
          .trySkill($skill`McHugeLarge Slash`)
          .trySkill($skill`Lunging Thrust-Smack`)
          .repeat();
      }),
      outfit: {
        equip: $items`Monodent of the Sea, McHugeLarge left pole, toy cupid bow, Spring shoes, Everfull Dart Holster`,
        familiar: $familiar`Peace Turkey`,
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Candelabra Egg",
      after: ["Run Egg"],
      completed: () =>
        get("_monsterHabitatsRecalled") > 1 ||
        get("_monsterHabitatsFightsLeft") == 0 ||
        get("_unblemishedPearlMadnessReef", false) ||
        have($effect`Everything Looks Purple`) ||
        !have($item`Roman Candelabra`),
      do: $location`Madness Reef`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.trySkill("Blow the Purple Candle!");
        }, bestCopyTarget())
        .macro((): Macro => {
          return Macro.trySkill("Sea *dent: Throw a Lightning Bolt");
        }, $monsters`magic dragonfish`)
        .kill(),
      outfit: {
        equip: $items`Everfull Dart Holster, Monodent of the Sea, Roman Candelabra, bat wings`,
        familiar: $familiar`Exotic Parrot`,
      },
      choices: { 311: 1 },
      limit: { soft: 11 },
    },
    {
      name: "Finish First Hab",
      after: ["Candelabra Egg"],
      completed: () =>
        get("_monsterHabitatsRecalled") > 1 ||
        get("_monsterHabitatsFightsLeft") == 0 ||
        get("_unblemishedPearlMadnessReef", false),
      do: $location`Madness Reef`,
      combat: new CombatStrategy().killHard(bestCopyTarget()).kill(),
      outfit: {
        equip: $items`Everfull Dart Holster, Monodent of the Sea, bat wings`,
        familiar: $familiar`Exotic Parrot`,
      },
      choices: { 311: 1 },
      limit: { soft: 11 },
    },
    {
      name: "Peridot Squid",
      after: ["Finish First Hab"],
      completed: () =>
        get("_olfactionsUsed") >= 2 || PeridotOfPeril.periledToday($location`The Marinara Trench`),
      do: $location`The Marinara Trench`,
      peridot: $monster`giant squid`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.trySkill($skill`Transcendent Olfaction`).trySkill($skill`McHugeLarge Slash`);
        })
        .kill(),
      outfit: {
        equip: $items`Everfull Dart Holster, Peridot of Peril, Spring Shoes, Monodent of the Sea, McHugeLarge Left Pole, bat wings, prismatic beret, shark jumper`,
        familiar: $familiar`Red-nosed Snapper`,
      },
      limit: { soft: 11 },
    },
    {
      name: "Finish farming squids with freekills",
      after: ["Finish First Hab"],
      completed: () =>
        get("_unblemishedPearlMarinaraTrench") ||
        25 - get("_shadowBricksUsed") - get("_bczSweatBulletsCasts") < 14,
      do: $location`The Marinara Trench`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.trySkill($skill`Sea *dent: Talk to Some Fish`);
        }, $monsters`diving belle, Mer-kin diver`)
        .macro((): Macro => {
          return Macro.if_("!monstername giant squid", Macro.skill($skill`BCZ: refracted gaze`));
        })
        .kill(),
      outfit: {
        equip: $items`Everfull Dart Holster, blood cubic zirconia, Möbius ring, Monodent of the Sea, April shower thoughts shield, bat wings, prismatic beret, shark jumper, toy Cupid bow`,
        familiar: $familiar`Red-nosed Snapper`,
      },
      limit: { soft: 11 },
    },
    {
      name: "Finish farming squids without freekills",
      after: ["Finish farming squids with freekills"],
      completed: () => get("_unblemishedPearlMarinaraTrench"),
      do: $location`The Marinara Trench`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.trySkill($skill`Sea *dent: Talk to Some Fish`);
        }, $monsters`diving belle, Mer-kin diver`)
        .macro((): Macro => {
          return Macro.if_("!monstername giant squid", Macro.skill($skill`BCZ: refracted gaze`));
        })
        .kill(),
      outfit: {
        equip: $items`Everfull Dart Holster, blood cubic zirconia, Möbius ring, Monodent of the Sea, April shower thoughts shield, bat wings, prismatic beret, shark jumper, toy Cupid bow`,
        familiar: $familiar`Red-nosed Snapper`,
      },
      limit: { soft: 11 },
    },
    {
      name: "Use ink bladders",
      after: ["Finish farming squids without freekills"],
      completed: () =>
        !have($item`ink bladder`) ||
        $location`The Mer-kin Outpost`.turnsSpent > 20 ||
        get("seahorseName") !== "",
      do: $location`The Mer-kin Outpost`,
      combat: new CombatStrategy().macro((): Macro => {
        return Macro.step("pickpocket")
          .trySkill($skill`Darts: Throw at %part1`)
          .tryItem($item`ink bladder`);
      }),
      outfit: {
        equip: $items`Everfull Dart Holster, Möbius ring, spring shoes, Monodent of the Sea`,
        familiar: $familiar`Peace Turkey`,
        modifier: "-combat",
      },
      limit: { soft: 11 },
    },
  ],
};
