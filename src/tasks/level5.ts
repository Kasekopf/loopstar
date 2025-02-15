import { use, visitUrl } from "kolmafia";
import {
  $effect,
  $effects,
  $item,
  $items,
  $location,
  $monster,
  $monsters,
  $skill,
  ensureEffect,
  get,
  have,
  Macro,
} from "libram";
import { Quest } from "../engine/task";
import { OutfitSpec, step } from "grimoire-kolmafia";
import { Priorities } from "../engine/priority";
import { CombatStrategy } from "../engine/combat";
import { atLevel } from "../lib";
import { councilSafe } from "./level12";

export const KnobQuest: Quest = {
  name: "Knob",
  tasks: [
    {
      name: "Start",
      after: [],
      ready: () => atLevel(5),
      completed: () => step("questL05Goblin") >= 0,
      prepare: () => {
        if (have($item`natural magick candle`)) ensureEffect($effect`The Odour of Magick`);
      },
      do: () => visitUrl("council.php"),
      limit: { tries: 1 },
      priority: () => (councilSafe() ? Priorities.Free : Priorities.BadMood),
      freeaction: true,
    },
    {
      name: "Outskirts",
      after: [],
      completed: () => have($item`Knob Goblin Encryption Key`) || step("questL05Goblin") > 0,
      outfit: () => {
        // Maintain this buff during snojo
        if (have($effect`Super Skill`)) return { equip: $items`Greatest American Pants` };
        return {};
      },
      do: $location`The Outskirts of Cobb's Knob`,
      choices: { 111: 3, 113: 2, 118: 1 },
      limit: { tries: 12 },
      delay: 10,
    },
    {
      name: "Open Knob",
      after: ["Start", "Outskirts"],
      priority: () => Priorities.Free,
      completed: () => step("questL05Goblin") >= 1,
      do: () => use($item`Cobb's Knob map`),
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Harem",
      after: ["Open Knob"],
      completed: () => have($item`Knob Goblin harem veil`) && have($item`Knob Goblin harem pants`),
      do: $location`Cobb's Knob Harem`,
      outfit: (): OutfitSpec => {
        if (
          have($item`industrial fire extinguisher`) &&
          get("_fireExtinguisherCharge") >= 20 &&
          !get("fireExtinguisherHaremUsed")
        )
          return {
            equip: $items`industrial fire extinguisher`,
          };
        else
          return {
            modifier: "item",
            avoid: $items`broken champagne bottle`,
          };
      },
      combat: new CombatStrategy()
        .macro(
          // Always use the fire extinguisher on the guard
          new Macro().trySkill($skill`Fire Extinguisher: Zone Specific`),
          $monsters`Knob Goblin Harem Guard, Knob Goblin Madam, Knob Goblin Harem Girl`
        )
        .banish($monsters`Knob Goblin Harem Guard, Knob Goblin Madam`)
        .killItem(),
      limit: { soft: 20 }, // Allow for Cobb's Knob lab key
    },
    {
      name: "Perfume",
      after: ["Harem"],
      completed: () =>
        have($effect`Knob Goblin Perfume`) ||
        have($item`Knob Goblin perfume`) ||
        step("questL05Goblin") === 999,
      do: $location`Cobb's Knob Harem`,
      outfit: { equip: $items`Knob Goblin harem veil, Knob Goblin harem pants` },
      limit: { tries: 2 }, // Allow for Cobb's Knob lab key
    },
    {
      name: "King",
      after: ["Harem", "Perfume"],
      priority: () => (have($effect`Knob Goblin Perfume`) ? Priorities.Effect : Priorities.None),
      completed: () => step("questL05Goblin") === 999,
      do: $location`Throne Room`,
      combat: new CombatStrategy().killHard($monster`Knob Goblin King`),
      outfit: {
        equip: $items`Knob Goblin harem veil, Knob Goblin harem pants`,
        modifier: "moxie, -10ML",
      },
      effects: $effects`Knob Goblin Perfume`,
      limit: { tries: 1 },
      boss: true,
    },
  ],
};
