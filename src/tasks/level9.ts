import {
  changeMcd,
  council,
  currentMcd,
  getWorkshed,
  Item,
  itemAmount,
  myAscensions,
  myHp,
  myMaxhp,
  myMaxmp,
  myMeat,
  myMp,
  numericModifier,
  use,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $effects,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $skill,
  AutumnAton,
  ensureEffect,
  get,
  have,
  Macro,
} from "libram";
import { Priority, Quest, Resources, Task } from "../engine/task";
import { Guards, OutfitSpec, step } from "grimoire-kolmafia";
import { CombatStrategy } from "../engine/combat";
import { atLevel } from "../lib";
import { Priorities } from "../engine/priority";
import { councilSafe } from "./level12";
import { customRestoreMp, fillHp } from "../engine/moods";
import { stenchPlanner } from "../engine/outfit";
import { tryPlayApriling } from "../lib";
import { trainSetAvailable } from "./misc";
import { args } from "../args";

const ABoo: Task[] = [
  {
    name: "ABoo Start",
    after: ["Start Peaks"],
    completed: () =>
      $location`A-Boo Peak`.noncombatQueue.includes("Faction Traction = Inaction") ||
      get("booPeakProgress") < 100,
    do: $location`A-Boo Peak`,
    breathitinextender: true,
    limit: { tries: 1 },
  },
  {
    name: "ABoo Carto",
    after: ["ABoo Start"],
    completed: () =>
      !have($skill`Comprehensive Cartography`) ||
      $location`A-Boo Peak`.turnsSpent > 0 ||
      get("lastCartographyBooPeak") === myAscensions(),
    prepare: () => {
      if (have($item`pec oil`)) ensureEffect($effect`Oiled-Up`);
      use($item`A-Boo clue`);
      fillHp();
    },
    do: $location`A-Boo Peak`,
    effects: $effects`Red Door Syndrome`,
    outfit: {
      modifier: "20 spooky res, 20 cold res, HP",
      familiar: $familiar`Exotic Parrot`,
    },
    choices: { 611: 1, 1430: 1 },
    combat: new CombatStrategy().killItem(),
    limit: { tries: 1 },
    skipprep: true,
    expectbeatenup: true,
    breathitinextender: true,
  },
  {
    name: "ABoo Clues",
    after: ["ABoo Start", "ABoo Carto"],
    completed: () => itemAmount($item`A-Boo clue`) * 30 >= get("booPeakProgress"),
    do: $location`A-Boo Peak`,
    // eslint-disable-next-line libram/verify-constants
    outfit: { modifier: "item", equip: $items`Space Trip safety headphones, HOA regulation book, blood cubic zirconia` },
    combat: new CombatStrategy()
      // eslint-disable-next-line libram/verify-constants
      .macro(new Macro().trySkill($skill`CLEESH`).trySkill($skill`BCZ: Refracted Gaze`).attack().repeat()),
    orbtargets: () => [],
    choices: { 611: 1, 1430: 1 },
    resources: () => {
      if (args.resources.speed)
        return {
          which: Resources.Lucky,
          benefit: 2.5,
          repeat: 30 * (itemAmount($item`A-Boo clue`) + 2) <= get("booPeakProgress") ? 2 : 1,
          delta: {
            replace: {
              skipprep: true,
              breathitinextender: true,
            },
          },
        };
      return undefined;
    },
    limit: { soft: 15 },
  },
  {
    name: "ABoo Horror",
    after: ["ABoo Start", "ABoo Carto"],
    ready: () => have($item`A-Boo clue`),
    completed: () => get("booPeakProgress") === 0,
    prepare: () => {
      if (have($item`pec oil`)) ensureEffect($effect`Oiled-Up`);
      use($item`A-Boo clue`);
      fillHp();
    },
    do: $location`A-Boo Peak`,
    effects: $effects`Red Door Syndrome`,
    outfit: {
      modifier: "20 spooky res, 20 cold res, HP",
      familiar: $familiar`Exotic Parrot`,
    },
    choices: { 611: 1, 1430: 1 },
    limit: { tries: 5 },
    skipprep: true,
    breathitinextender: true,
    expectbeatenup: true,
  },
  {
    name: "ABoo Peak",
    after: ["ABoo Clues", "ABoo Horror"],
    completed: () => get("booPeakLit"),
    do: $location`A-Boo Peak`,
    limit: { tries: 1 },
  },
];

const Oil: Task[] = [
  {
    name: "Oil Kill",
    after: ["Start Peaks"],
    completed: () => get("oilPeakProgress") === 0,
    prepare: () => {
      if (myMp() < 80 && myMaxmp() >= 80) customRestoreMp(80 - myMp());
      if (myHp() < 100 && myMaxhp() >= 100) customRestoreMp(100 - myMp());
      if (numericModifier("Monster Level") - currentMcd() >= 100) changeMcd(0); // no need to overshoot
    },
    do: $location`Oil Peak`,
    outfit: () => {
      const spec: OutfitSpec & { equip: Item[] } = {
        modifier: "ML 100 max, 0.1 item",
        equip: [],
        avoid: $items`Kramco Sausage-o-Matic™`,
      };

      // Use a retro superhero cape to dodge the first hit
      if (have($item`unwrapped knock-off retro superhero cape`)) {
        spec.equip.push($item`unwrapped knock-off retro superhero cape`);
        spec.modes = { retrocape: ["vampire", "hold"] };
      }

      // The unbreakable umbrella lowers the ML cap; handle it separately.
      if (have($item`unbreakable umbrella`)) {
        spec.modifier = "ML 80 max, 0.1 item";
        spec.equip.push($item`unbreakable umbrella`);
      }

      // Use the Tot for more +item
      if (have($familiar`Trick-or-Treating Tot`) && have($item`li'l ninja costume`)) {
        spec.familiar = $familiar`Trick-or-Treating Tot`;
        spec.equip.push($item`li'l ninja costume`);
      }

      return spec;
    },
    combat: new CombatStrategy().killItem(),
    limit: { tries: 18 },
    orbtargets: () => undefined,
  },
  {
    name: "Oil Peak",
    after: ["Oil Kill"],
    completed: () => get("oilPeakLit"),
    do: $location`Oil Peak`,
    limit: { tries: 1 },
    orbtargets: () => undefined,
  },
  {
    name: "Oil Jar", // get oil for jar of oil
    after: ["Oil Peak"],
    completed: () =>
      itemAmount($item`bubblin' crude`) >= 12 ||
      have($item`jar of oil`) ||
      !!(get("twinPeakProgress") & 4),
    do: $location`Oil Peak`,
    outfit: () => {
      if (have($item`unbreakable umbrella`))
        return {
          modifier: "ML 80 max, 0.1 item, monster level percent",
          equip: $items`unbreakable umbrella`,
        };
      else return { modifier: "ML, 0.1 item" };
    },
    combat: new CombatStrategy().killItem(),
    limit: { soft: 5 },
    orbtargets: () => undefined,
  },
];

const Twin: Task[] = [
  {
    name: "Twin Stench Search",
    after: ["Start Peaks"],
    ready: () => !have($item`rusty hedge trimmers`) && stenchPlanner.maximumPossible(true) >= 4,
    completed: () => !!(get("twinPeakProgress") & 1),
    prepare: () => {
      if (numericModifier("stench resistance") < 4) ensureEffect($effect`Red Door Syndrome`);
      if (numericModifier("stench resistance") < 4)
        throw `Unable to ensure stench res for Twin Peak`;
      tryPlayApriling("-combat");
    },
    do: $location`Twin Peak`,
    choices: { 606: 1, 607: 1 },
    outfit: () => stenchPlanner.outfitFor(4, { modifier: "-combat, item" }),
    combat: new CombatStrategy()
      // eslint-disable-next-line libram/verify-constants
      .macro(new Macro().trySkill($skill`CLEESH`).trySkill($skill`BCZ: Refracted Gaze`).attack().repeat()),
    peridot: $monster`bearpig topiary animal`,
    limit: { soft: 10 },
  },
  {
    name: "Twin Stench",
    after: ["Start Peaks"],
    ready: () => have($item`rusty hedge trimmers`) && stenchPlanner.maximumPossible(true) >= 4,
    completed: () => !!(get("twinPeakProgress") & 1),
    prepare: () => {
      if (numericModifier("stench resistance") < 4) ensureEffect($effect`Red Door Syndrome`);
      if (numericModifier("stench resistance") < 4)
        throw `Unable to ensure stench res for Twin Peak`;
    },
    do: () => {
      use($item`rusty hedge trimmers`);
    },
    choices: { 606: 1, 607: 1 },
    outfit: () => stenchPlanner.outfitFor(4),
    limit: { tries: 1 },
  },
  {
    name: "Twin Item Search",
    after: ["Start Peaks"],
    ready: () => !have($item`rusty hedge trimmers`),
    completed: () => !!(get("twinPeakProgress") & 2),
    do: $location`Twin Peak`,
    choices: { 606: 2, 608: 1 },
    outfit: { modifier: "item 50min, -combat" },
    combat: new CombatStrategy()
      // eslint-disable-next-line libram/verify-constants
      .macro(new Macro().trySkill($skill`CLEESH`).trySkill($skill`BCZ: Refracted Gaze`).attack().repeat()),
    peridot: $monster`bearpig topiary animal`,
    limit: { soft: 10 },
  },
  {
    name: "Twin Item",
    after: ["Start Peaks"],
    ready: () => have($item`rusty hedge trimmers`),
    completed: () => !!(get("twinPeakProgress") & 2),
    do: () => {
      use($item`rusty hedge trimmers`);
    },
    choices: { 606: 2, 608: 1 },
    outfit: { modifier: "item 50min" },
    limit: { tries: 1 },
  },
  {
    name: "Twin Oil Search",
    after: ["Start Peaks", "Oil Jar"],
    ready: () => !have($item`rusty hedge trimmers`),
    completed: () => !!(get("twinPeakProgress") & 4),
    do: $location`Twin Peak`,
    choices: { 606: 3, 609: 1, 616: 1 },
    outfit: { modifier: "item, -combat" },
    combat: new CombatStrategy()
      // eslint-disable-next-line libram/verify-constants
      .macro(new Macro().trySkill($skill`CLEESH`).trySkill($skill`BCZ: Refracted Gaze`).attack().repeat()),
    peridot: $monster`bearpig topiary animal`,
    acquire: [{ item: $item`jar of oil` }],
    limit: { soft: 10 },
  },
  {
    name: "Twin Oil",
    after: ["Start Peaks", "Oil Jar"],
    ready: () => have($item`rusty hedge trimmers`),
    completed: () => !!(get("twinPeakProgress") & 4),
    do: () => {
      use($item`rusty hedge trimmers`);
    },
    choices: { 606: 3, 609: 1, 616: 1 },
    acquire: [{ item: $item`jar of oil` }],
    limit: { tries: 1 },
  },
  {
    name: "Twin Init Search",
    after: [
      "Twin Stench",
      "Twin Item",
      "Twin Oil",
      "Twin Stench Search",
      "Twin Item Search",
      "Twin Oil Search",
    ],
    ready: () => !have($item`rusty hedge trimmers`),
    completed: () => !!(get("twinPeakProgress") & 8),
    do: $location`Twin Peak`,
    choices: { 606: 4, 610: 1, 1056: 1 },
    outfit: { modifier: "init 40 min, item, -combat" },
    combat: new CombatStrategy()
      // eslint-disable-next-line libram/verify-constants
      .macro(new Macro().trySkill($skill`CLEESH`).trySkill($skill`BCZ: Refracted Gaze`).attack().repeat()),
    peridot: $monster`bearpig topiary animal`,
    limit: { soft: 10 },
  },
  {
    name: "Twin Init",
    after: [
      "Twin Stench",
      "Twin Item",
      "Twin Oil",
      "Twin Stench Search",
      "Twin Item Search",
      "Twin Oil Search",
    ],
    ready: () => have($item`rusty hedge trimmers`),
    completed: () => !!(get("twinPeakProgress") & 8),
    do: () => {
      use($item`rusty hedge trimmers`);
    },
    choices: { 606: 4, 610: 1, 1056: 1 },
    outfit: { modifier: "init 40 min" },
    limit: { tries: 1 },
  },
];

export const ChasmQuest: Quest = {
  name: "Orc Chasm",
  tasks: [
    {
      name: "Start",
      after: [],
      ready: () => atLevel(9),
      completed: () => step("questL09Topping") !== -1,
      do: () => visitUrl("council.php"),
      limit: { tries: 1 },
      priority: () => (councilSafe() ? Priorities.None : Priorities.BadMood),
      freeaction: true,
    },
    {
      name: "Bat Wings Bridge Parts",
      after: ["Start"],
      ready: () => have($item`bat wings`) && get("chasmBridgeProgress") >= 25,
      completed: () => step("questL09Topping") >= 1,
      do: () => {
        visitUrl(`place.php?whichplace=orc_chasm&action=bridge${get("chasmBridgeProgress")}`); // use existing materials
        visitUrl("place.php?whichplace=orc_chasm&action=bridge_jump");
        visitUrl("place.php?whichplace=highlands&action=highlands_dude");
      },
      outfit: { equip: $items`bat wings` },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Bridge",
      after: ["Start", "Macguffin/Forest"], // Wait for black paint
      priority: (): Priority => {
        if (getWorkshed() === $item`model train set`) {
          return Priorities.BadTrain;
        }
        if (AutumnAton.have()) {
          if ($location`The Smut Orc Logging Camp`.turnsSpent === 0)
            return Priorities.GoodAutumnaton;
        }
        return Priorities.None;
      },
      ready: () =>
        ((have($item`frozen jeans`) ||
          have($item`industrial fire extinguisher`) ||
          (have($item`June cleaver`) && get("_juneCleaverCold", 0) >= 5)) &&
          get("smutOrcNoncombatProgress") < 15) ||
        have($effect`Red Door Syndrome`) ||
        myMeat() >= 1000,
      completed: () => step("questL09Topping") >= 1,
      prepare: () => {
        if (get("smutOrcNoncombatProgress") >= 15 && step("questL11Black") >= 2) {
          ensureEffect($effect`Red Door Syndrome`);
          ensureEffect($effect`Butt-Rock Hair`);
        }
      },
      do: $location`The Smut Orc Logging Camp`,
      post: (): void => {
        if (have($item`smut orc keepsake box`) && get("lastEncounter") === "smut orc pervert")
          use($item`smut orc keepsake box`);
        visitUrl(`place.php?whichplace=orc_chasm&action=bridge${get("chasmBridgeProgress")}`); // use existing materials
      },
      outfit: () => {
        if (get("smutOrcNoncombatProgress") < 15) {
          // eslint-disable-next-line libram/verify-constants
          const equip = $items`Space Trip safety headphones, HOA regulation book, blood cubic zirconia`;
          if (have($item`frozen jeans`)) equip.push($item`frozen jeans`);
          else if (have($item`June cleaver`) && get("_juneCleaverCold", 0) >= 5)
            equip.push($item`June cleaver`);
          else if (have($item`industrial fire extinguisher`))
            equip.push($item`industrial fire extinguisher`);
          return {
            modifier: "item, -ML",
            equip: equip,
            avoid: $items`broken champagne bottle`,
          };
          // eslint-disable-next-line libram/verify-constants
        } else return { modifier: "sleaze res", equip: $items`combat lover's locket, blood cubic zirconia` };
      },
      combat: new CombatStrategy()
        // eslint-disable-next-line libram/verify-constants
        .macro(new Macro().trySkill($skill`CLEESH`).trySkill($skill`BCZ: Refracted Gaze`).attack().repeat(), [
          $monster`smut orc jacker`,
          $monster`smut orc nailer`,
          $monster`smut orc pipelayer`,
          $monster`smut orc screwer`,
        ])
        .kill(),
      choices: { 1345: 3 },
      skipprep: () => get("smutOrcNoncombatProgress") >= 15,
      limit: {
        soft: 45,
        guard: Guards.after(
          () => !AutumnAton.have() || $location`The Smut Orc Logging Camp`.turnsSpent > 0
        ),
      },
    },
    {
      name: "Structural Ember",
      after: ["Start"],
      ready: () => have($item`structural ember`) && !trainSetAvailable(),
      completed: () => get("_structuralEmberUsed"),
      do: () => use($item`structural ember`),
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Bridge Parts",
      after: ["Start"],
      ready: () =>
        ((have($item`morningwood plank`) ||
          have($item`raging hardwood plank`) ||
          have($item`weirdwood plank`)) &&
          (have($item`long hard screw`) ||
            have($item`messy butt joint`) ||
            have($item`thick caulk`))) ||
        have($item`snow boards`),
      completed: () => step("questL09Topping") >= 1,
      do: () => {
        visitUrl(`place.php?whichplace=orc_chasm&action=bridge${get("chasmBridgeProgress")}`); // use existing materials
      },
      freeaction: true,
      limit: { tries: 30, unready: true },
    },
    {
      name: "Start Peaks",
      after: ["Bridge", "Bat Wings Bridge Parts", "Bridge Parts"],
      completed: () => step("questL09Topping") >= 2,
      do: () => {
        visitUrl("place.php?whichplace=highlands&action=highlands_dude");
        council();
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    ...ABoo,
    ...Oil,
    ...Twin,
    {
      name: "Finish",
      after: ["ABoo Peak", "Oil Peak", "Twin Init", "Twin Init Search"],
      completed: () => step("questL09Topping") === 999,
      do: () => {
        visitUrl("place.php?whichplace=highlands&action=highlands_dude");
        council();
      },
      limit: { tries: 1 },
      freeaction: true,
    },
  ],
};
