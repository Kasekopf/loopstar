import {
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $monsters,
  $skill,
  get,
  have,
  Macro,
} from "libram";
import { use, visitUrl } from "kolmafia";
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
      freeaction: true,
      limit: { soft: 11 },
    },
  ],
};
