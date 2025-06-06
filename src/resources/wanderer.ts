import { DelayedMacro, OutfitSpec } from "grimoire-kolmafia";
import {
  familiarWeight,
  haveEquipped,
  Item,
  Monster,
  myAdventures,
  myFamiliar,
  totalTurnsPlayed,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $items,
  $monster,
  $skill,
  Counter,
  get,
  getKramcoWandererChance,
  have,
  Macro,
  PocketProfessor,
  SourceTerminal,
} from "libram";
import { atLevel } from "../lib";
import { Resource } from "./lib";
import { FamiliarWeightSpec, planFamiliarGear } from "./runaway";
import { args } from "../args";

export interface WandererSource extends Resource {
  monsters: Monster[] | (() => Monster[]);
  chance: () => number;
  action?: DelayedMacro;
  possible: () => boolean; // If it is possible to encounter this on accident in the current character state.
  chainable: boolean;
  fulloutfit?: boolean; // Prefer somewhere with no outfit requirements
}

export const wandererSources: WandererSource[] = [
  {
    name: "VHS Whelps",
    available: () =>
      Counter.get("Spooky VHS Tape Monster") <= 0 &&
      get("spookyVHSTapeMonster") === $monster`giant swarm of ghuol whelps`,
    monsters: () => [$monster`giant swarm of ghuol whelps`],
    equip: [
      {
        equip: $items`gravy boat`,
        familiar: $familiar`Left-Hand Man`,
        modifier: "ML",
        skipDefaults: true,
      },
      {
        equip: $items`gravy boat`,
        modifier: "ML",
        skipDefaults: true,
      },
      {
        modifier: "ML",
        skipDefaults: true,
      },
    ],
    chance: () => 1,
    possible: () => Counter.get("Spooky VHS Tape Monster") <= 0,
    chainable: false,
    fulloutfit: true,
  },
  {
    name: "VHS Tape",
    available: () => Counter.get("Spooky VHS Tape Monster") <= 0,
    equip: [{}],
    monsters: () => [get("spookyVHSTapeMonster") ?? $monster`none`],
    chance: () => 1,
    possible: () => Counter.get("Spooky VHS Tape Monster") <= 0,
    chainable: false,
  },
  {
    name: "Digitize",
    available: () => SourceTerminal.have() && Counter.get("Digitize Monster") <= 0,
    equip: [
      { equip: $items`Space Trip safety headphones` },
      {
        equip: $items`unwrapped knock-off retro superhero cape`,
        modes: { retrocape: ["heck", "hold"] },
      },
      {},
    ],
    monsters: () => [get("_sourceTerminalDigitizeMonster") ?? $monster`none`],
    prepare: () => {
      if (SourceTerminal.getDigitizeMonsterCount() + 1 === args.minor.redigitize)
        SourceTerminal.prepareDigitize();
    },
    chance: () => 1,
    action: () => {
      const result = new Macro();
      if (SourceTerminal.getDigitizeMonsterCount() + 1 === args.minor.redigitize)
        result.trySkill($skill`Digitize`);
      if (
        familiarWeight($familiar`Grey Goose`) <= 10 &&
        get("_sourceTerminalDigitizeMonster") === $monster`sausage goblin`
      )
        result.trySkill($skill`Emit Matter Duplicating Drones`);
      return result;
    },
    possible: () => SourceTerminal.have() && Counter.get("Digitize Monster") <= 5,
    chainable: true, // Assuming the copy is chainable
  },
  {
    name: "Voted",
    available: () =>
      have($item`"I Voted!" sticker`) &&
      totalTurnsPlayed() % 11 === 1 &&
      get("lastVoteMonsterTurn") < totalTurnsPlayed() &&
      get("_voteFreeFights") < 3 &&
      atLevel(5),
    equip: $item`"I Voted!" sticker`,
    monsters: [
      $monster`government bureaucrat`,
      $monster`terrible mutant`,
      $monster`angry ghost`,
      $monster`annoyed snake`,
      $monster`slime blob`,
    ],
    chance: () => 1, // when available
    possible: () => haveEquipped($item`"I Voted!" sticker`),
    chainable: false,
  },
  {
    name: "Cursed Magnifying Glass",
    available: () =>
      have($item`cursed magnifying glass`) &&
      get("_voidFreeFights") < 5 &&
      get("cursedMagnifyingGlassCount") >= 13,
    equip: $item`cursed magnifying glass`,
    monsters: [$monster`void guy`, $monster`void slab`, $monster`void spider`],
    chance: () => 1, // when available
    possible: () => haveEquipped($item`cursed magnifying glass`),
    chainable: false,
  },
  {
    name: "Goth",
    available: () => have($familiar`Artistic Goth Kid`) && get("_hipsterAdv") < 7,
    equip: $familiar`Artistic Goth Kid`,
    monsters: [
      $monster`Black Crayon Beast`,
      $monster`Black Crayon Beetle`,
      $monster`Black Crayon Constellation`,
      $monster`Black Crayon Golem`,
      $monster`Black Crayon Demon`,
      $monster`Black Crayon Man`,
      $monster`Black Crayon Elemental`,
      $monster`Black Crayon Crimbo Elf`,
      $monster`Black Crayon Fish`,
      $monster`Black Crayon Goblin`,
      $monster`Black Crayon Hippy`,
      $monster`Black Crayon Hobo`,
      $monster`Black Crayon Shambling Monstrosity`,
      $monster`Black Crayon Manloid`,
      $monster`Black Crayon Mer-kin`,
      $monster`Black Crayon Frat Orc`,
      $monster`Black Crayon Penguin`,
      $monster`Black Crayon Pirate`,
      $monster`Black Crayon Flower`,
      $monster`Black Crayon Slime`,
      $monster`Black Crayon Undead Thing`,
      $monster`Black Crayon Spiraling Shape`,
    ],
    chance: () => [0.5, 0.4, 0.3, 0.2, 0.1, 0.1, 0.1, 0][get("_hipsterAdv")],
    possible: () => myFamiliar() === $familiar`Artistic Goth Kid`,
    chainable: true,
  },
  {
    name: "Hipster",
    available: () => have($familiar`Mini-Hipster`) && get("_hipsterAdv") < 7,
    equip: $familiar`Mini-Hipster`,
    monsters: [
      $monster`angry bassist`,
      $monster`blue-haired girl`,
      $monster`evil ex-girlfriend`,
      $monster`peeved roommate`,
      $monster`random scenester`,
    ],
    chance: () => [0.5, 0.4, 0.3, 0.2, 0.1, 0.1, 0.1, 0][get("_hipsterAdv")],
    possible: () => myFamiliar() === $familiar`Mini-Hipster`,
    chainable: true,
  },
  {
    name: "Kramco",
    available: () => have($item`Kramco Sausage-o-Matic™`) && atLevel(2),
    equip: [
      { equip: $items`Kramco Sausage-o-Matic™, Space Trip safety headphones` },
      {
        equip: $items`Kramco Sausage-o-Matic™, unwrapped knock-off retro superhero cape`,
        modes: { retrocape: ["heck", "hold"] },
      },
      { equip: $items`Kramco Sausage-o-Matic™` },
    ],
    prepare: () => {
      if (SourceTerminal.have() && SourceTerminal.getDigitizeUses() === 0) {
        SourceTerminal.prepareDigitize();
      }
    },
    monsters: [$monster`sausage goblin`],
    chance: () => getKramcoWandererChance(),
    action: () => {
      const result = new Macro();
      if (SourceTerminal.have() && SourceTerminal.getDigitizeUses() === 0)
        result.trySkill($skill`Digitize`);
      if (
        familiarWeight($familiar`Grey Goose`) <= 10 &&
        haveEquipped($item`Space Trip safety headphones`)
      )
        result.trySkill($skill`Emit Matter Duplicating Drones`);
      return result;
    },
    possible: () => haveEquipped($item`Kramco Sausage-o-Matic™`),
    chainable: true,
  },
];

export function canChargeVoid(): boolean {
  return get("_voidFreeFights") < 5 && get("cursedMagnifyingGlassCount") < 13;
}

export interface ChainSource extends Resource {
  name: string;
  available: () => boolean;
  equip: Item | OutfitSpec;
  do: Macro;
  length: number;
}

export function getChainSources(): ChainSource[] {
  const pocketProfessorPlan = planPocketProfessor();

  return [
    {
      name: "Roman Candelabra",
      available: () =>
        have($item`Roman Candelabra`) &&
        !have($effect`Everything Looks Purple`) &&
        myAdventures() > 1,
      equip: $item`Roman Candelabra`,
      do: Macro.trySkill($skill`Blow the Purple Candle!`),
      length: 2,
    },
    {
      name: "Pocket Professor",
      available: () => pocketProfessorPlan.available && have($familiar`Pocket Professor`),
      equip: pocketProfessorPlan.outfit,
      do: Macro.trySkill($skill`lecture on relativity`),
      length: pocketProfessorPlan.length,
    },
  ];
}

function planPocketProfessor(): FamiliarWeightSpec & { length: number } {
  if (!have($familiar`Pocket Professor`) || !args.resources.pocketprofessor) {
    return {
      available: false,
      outfit: {},
      macro: new Macro(),
      weight: 0,
      length: 0,
    };
  }

  if (have($item`toy Cupid bow`) && !have($item`Pocket Professor memory chip`)) {
    // Give enough lectures just to trigger the memory chip
    const lecturesDone = get("_pocketProfessorLectures");
    const goal = (lecturesDone + 3) ** 2 - 1; // 5 more combats to get memory chip
    const plan = planFamiliarGear($familiar`Pocket Professor`, goal, false, [$item`toy Cupid bow`]);
    return {
      ...plan,
      length: PocketProfessor.currentlyAvailableLectures(plan.weight) + 1,
    };
  }

  // Include the memory chip if we have it
  const forced = [$item`Pocket Professor memory chip`].filter((i) => have(i));
  const includeChip = forced.length > 0;

  // Determine the maximum number of lectures we can possibly get
  const maxWeightPlan = planFamiliarGear($familiar`Pocket Professor`, 394, false, forced);
  const lectures = PocketProfessor.currentlyAvailableLectures(maxWeightPlan.weight, includeChip);
  if (lectures <= 0) {
    return {
      available: false,
      outfit: {},
      macro: new Macro(),
      weight: 0,
      length: 0,
    };
  }

  // Now, plan only to get that many lectures
  // (without needlessly going over the threshold)
  const lastLectureWeight = Math.floor(Math.sqrt(maxWeightPlan.weight - 1)) ** 2 + 1;
  const usefulPlan = planFamiliarGear(
    $familiar`Pocket Professor`,
    lastLectureWeight,
    false,
    forced
  );
  return {
    ...usefulPlan,
    length: PocketProfessor.currentlyAvailableLectures(usefulPlan.weight, includeChip) + 1,
  };
}
