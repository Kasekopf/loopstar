import { itemAmount, Monster, myMeat, useSkill } from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $items,
  $monster,
  $skill,
  get,
  have,
  Macro,
  SourceTerminal,
} from "libram";
import { CombatStrategy } from "../engine/combat";
import { Quest, Task } from "../engine/task";
import { step } from "grimoire-kolmafia";
import { Priorities } from "../engine/priority";
import { fillHp } from "../engine/moods";
import { oresNeeded } from "./level8";
import { yellowRayPossible } from "../resources/yellowray";

export type SummonTarget = Omit<Task, "do" | "name" | "limit"> & {
  target: Monster;
  benefit: number;
  tries?: number;
};
const summonTargets: SummonTarget[] = [
  {
    target: $monster`War Frat 151st Infantryman`,
    priority: () => Priorities.Start,
    ready: () => !have($effect`Everything Looks Yellow`),
    completed: () =>
      have($item`beer helmet`) &&
      have($item`distressed denim pants`) &&
      have($item`bejeweled pledge pin`),
    after: [],
    outfit: {
      equip: $items`unwrapped knock-off retro superhero cape`,
      modes: { retrocape: ["heck", "hold"] },
      avoid: $items`carnivorous potted plant`,
    },
    combat: new CombatStrategy().yellowRay(),
    benefit: 10,
  },
  {
    target: $monster`mountain man`,
    after: [],
    ready: () =>
      myMeat() >= 1000 &&
      // YR the War frat first
      have($item`beer helmet`) &&
      have($item`distressed denim pants`) &&
      have($item`bejeweled pledge pin`),
    completed: () => oresNeeded() === 0,
    priority: () => (have($effect`Everything Looks Yellow`) ? Priorities.BadYR : Priorities.None),
    outfit: () => {
      if (yellowRayPossible())
        return {
          equip: $items`unwrapped knock-off retro superhero cape`,
          modes: { retrocape: ["heck", "hold"] },
          avoid: $items`carnivorous potted plant`,
        };
      else
        return {
          equip: $items`unwrapped knock-off retro superhero cape`,
          modes: { retrocape: ["heck", "hold"] },
          modifier: "item",
        };
    },
    combat: new CombatStrategy().yellowRay().macro(() => {
      const result = new Macro();
      if (have($effect`Everything Looks Yellow`)) {
        if (!have($item`Spooky VHS Tape`)) result.trySkill($skill`Feel Envy`);
        if (!have($skill`Feel Envy`) || get("_feelEnvyUsed"))
          result.tryItem($item`Spooky VHS Tape`);
      }
      return result;
    }),
    tries: 3,
    benefit: 9,
  },
  {
    target: $monster`Astrologer of Shub-Jigguwatt`,
    after: [],
    completed: () =>
      have($item`star chart`) ||
      have($item`Richard's star key`) ||
      get("nsTowerDoorKeysUsed").includes("Richard's star key") ||
      !have($item`Cargo Cultist Shorts`) ||
      (get("_cargoPocketEmptied") && !have($item`greasy desk bell`)),
    prepare: () => {
      fillHp();
      if (have($skill`Spirit of Peppermint`)) {
        useSkill($skill`Spirit of Peppermint`);
      }
    },
    outfit: { equip: $items`June cleaver`, modifier: "DR, sleaze res" },
    combat: new CombatStrategy()
      .macro(
        Macro.trySkill($skill`Micrometeorite`)
          .trySkill($skill`Curse of Weaksauce`)
          .trySkill($skill`Stuffed Mortar Shell`)
          .trySkill($skill`Saucecicle`)
          .trySkill($skill`Saucecicle`)
          .trySkill($skill`Saucecicle`)
      )
      .kill(),
    benefit: 3,
  },
  {
    target: $monster`Astronomer`,
    after: [],
    completed: () =>
      have($item`star chart`) ||
      have($item`Richard's star key`) ||
      get("nsTowerDoorKeysUsed").includes("Richard's star key") ||
      (have($item`Cargo Cultist Shorts`) && !get("_cargoPocketEmptied")),
    combat: new CombatStrategy().kill(),
    benefit: 3,
  },
  {
    target: $monster`Camel's Toe`,
    after: [],
    priority: () => {
      if (!have($familiar`Melodramedary`)) return Priorities.None;
      if (get("camelSpit") < 100) return Priorities.BadCamel;
      return Priorities.GoodCamel;
    },
    completed: () =>
      get("lastCopyableMonster") === $monster`Camel's Toe` ||
      (itemAmount($item`star`) >= 8 && itemAmount($item`line`) >= 7) ||
      have($item`Richard's star key`) ||
      get("nsTowerDoorKeysUsed").includes("Richard's star key"),
    prepare: () => {
      if (!have($familiar`Melodramedary`) || get("camelSpit") < 100) {
        if (
          SourceTerminal.have() &&
          !SourceTerminal.isCurrentSkill(SourceTerminal.Skills.Duplicate)
        ) {
          SourceTerminal.educate(SourceTerminal.Skills.Duplicate);
        }
      }
    },
    outfit: () => {
      if (have($familiar`Melodramedary`) && get("camelSpit") === 100)
        return {
          modifier: "item",
          familiar: $familiar`Melodramedary`,
          avoid: $items`carnivorous potted plant`,
        };
      if (!get("_epicMcTwistUsed"))
        return {
          modifier: "item",
          equip: $items`pro skateboard`,
          avoid: $items`carnivorous potted plant`,
        };
      return { modifier: "item" };
    },
    combat: new CombatStrategy()
      .macro(() => {
        if (have($familiar`Melodramedary`) && get("camelSpit") >= 100)
          return Macro.trySkill($skill`%fn, spit on them!`);
        const result = Macro.trySkill($skill`Do an epic McTwist!`);
        if (SourceTerminal.have()) result.trySkill($skill`Duplicate`).tryItem($item`shadow brick`);
        return result;
      })
      .killItem(),
    benefit: 3,
  },
  {
    target: $monster`Baa'baa'bu'ran`,
    after: [],
    completed: () =>
      itemAmount($item`stone wool`) >= 2 ||
      (itemAmount($item`stone wool`) === 1 && have($item`the Nostril of the Serpent`)) ||
      step("questL11Worship") >= 3 ||
      (have($item`Deck of Every Card`) && get("_deckCardsDrawn") === 0),
    outfit: { modifier: "item" },
    combat: new CombatStrategy().killItem(),
    benefit: 2,
  },
];

export function getSummonTask(spec: SummonTarget): Task {
  return {
    ...spec,
    name: spec.target.name.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase()), // capitalize first letter of each word
    ready: spec.ready,
    do: () => {
      throw `Attempted to summon ${spec.target.name} with no allocation`;
    },
    limit: { tries: spec.tries ?? 1 },
    resources: {
      which: { summon: spec.target },
      benefit: spec.benefit,
      required: true,
    },
  };
}

export const SummonQuest: Quest = {
  name: "Summon",
  tasks: summonTargets.map((s) => getSummonTask(s)),
};
