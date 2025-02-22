import { visitUrl } from "kolmafia";
import { $item, $items, $location, $skill, clamp, get, have } from "libram";
import { atLevel } from "../lib";
import { Priorities } from "../engine/priority";
import { councilSafe } from "./level12";
import { AllocationRequest, Allocations, Quest } from "../engine/task";
import { step } from "grimoire-kolmafia";
import { tryPlayApriling } from "../lib";

export const FriarQuest: Quest = {
  name: "Friar",
  tasks: [
    {
      name: "Start",
      after: [],
      ready: () => atLevel(6),
      completed: () => step("questL06Friar") !== -1,
      do: () => visitUrl("council.php"),
      limit: { tries: 1 },
      priority: () => (councilSafe() ? Priorities.None : Priorities.BadMood),
      freeaction: true,
    },
    {
      name: "Heart",
      after: ["Start"],
      priority: () => {
        if (
          get("noncombatForcerActive") &&
          have($item`latte lovers member's mug`) &&
          !get("latteUnlocks").includes("wing")
        )
          return { score: -2, reason: "Still need latte here" };
        else return Priorities.None;
      },
      completed: () => have($item`box of birthday candles`) || step("questL06Friar") === 999,
      prepare: () => {
        tryPlayApriling("-combat");
      },
      do: $location`The Dark Heart of the Woods`,
      outfit: () => {
        if (have($item`latte lovers member's mug`) && !get("latteUnlocks").includes("wing")) {
          return { modifier: "-combat", equip: $items`latte lovers member's mug` };
        }
        return { modifier: "-combat" };
      },
      resources: () =>
        <AllocationRequest>{
          which: Allocations.NCForce,
          benefit: 1 / 0.65 / 2, // discounted due to late free runs
          repeat: clamp(4 - get("lastFriarsHeartNC"), 0, 4),
        },
      limit: { tries: 24 },
    },
    {
      name: "Neck",
      after: ["Start"],
      completed: () => have($item`dodecagram`) || step("questL06Friar") === 999,
      prepare: () => {
        tryPlayApriling("-combat");
      },
      do: $location`The Dark Neck of the Woods`,
      outfit: { modifier: "-combat" },
      choices: { 1428: 2 },
      resources: () => {
        const maxNCs = have($skill`Comprehensive Cartography`) ? 2 : 4;
        return {
          which: Allocations.NCForce,
          benefit: 1 / 0.65 / 2, // discounted due to late free runs
          repeat: clamp(4 - get("lastFriarsNeckNC"), 0, maxNCs),
        };
      },
      limit: { tries: 24 },
    },
    {
      name: "Elbow",
      after: ["Start"],
      priority: () => {
        if (
          get("noncombatForcerActive") &&
          have($item`latte lovers member's mug`) &&
          !get("latteUnlocks").includes("vitamins")
        )
          return { score: -2, reason: "Still need latte here" };
        else return Priorities.None;
      },
      completed: () => have($item`eldritch butterknife`) || step("questL06Friar") === 999,
      prepare: () => {
        tryPlayApriling("-combat");
      },
      do: $location`The Dark Elbow of the Woods`,
      outfit: () => {
        if (have($item`latte lovers member's mug`) && !get("latteUnlocks").includes("vitamins")) {
          return { modifier: "-combat", equip: $items`latte lovers member's mug` };
        }
        return { modifier: "-combat" };
      },
      resources: () =>
        <AllocationRequest>{
          which: Allocations.NCForce,
          benefit: 1 / 0.65 / 2, // discounted due to late free runs
          repeat: clamp(4 - get("lastFriarsElbowNC"), 0, 4),
        },
      limit: { tries: 24 },
    },
    {
      name: "Finish",
      after: ["Heart", "Elbow", "Neck"],
      completed: () => step("questL06Friar") === 999,
      do: () => visitUrl("friars.php?action=ritual&pwd"),
      limit: { tries: 1 },
      freeaction: true,
    },
  ],
};
