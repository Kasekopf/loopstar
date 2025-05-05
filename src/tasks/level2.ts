import { visitUrl } from "kolmafia";
import { $effect, $item, $items, $location, get, have } from "libram";
import { atLevel } from "../lib";
import { Priorities } from "../engine/priority";
import { councilSafe } from "./level12";
import { Quest, Resources } from "../engine/task";
import { step } from "grimoire-kolmafia";
import { tryPlayApriling } from "../lib";

export const MosquitoQuest: Quest = {
  name: "Mosquito",
  tasks: [
    {
      name: "Start",
      after: [],
      ready: () => atLevel(2),
      completed: () => step("questL02Larva") !== -1,
      do: () => visitUrl("council.php"),
      limit: { tries: 1 },
      priority: () => (councilSafe() ? Priorities.None : Priorities.BadMood),
      freeaction: true,
    },
    {
      name: "Burn Delay",
      after: ["Start"],
      ready: () =>
        !have($item`protonic accelerator pack`) ||
        get("questPAGhost") === "unstarted" ||
        get("ghostLocation") !== $location`The Spooky Forest`,
      completed: () => $location`The Spooky Forest`.turnsSpent >= 5 || step("questL02Larva") >= 1,
      do: $location`The Spooky Forest`,
      outfit: () => {
        // Maintain this buff during snojo
        if (have($effect`Super Skill`)) return { equip: $items`Greatest American Pants` };
        return {};
      },
      choices: { 502: 2, 505: 1, 334: 1 },
      limit: { tries: 5 },
      preferwanderer: true,
      delay: 5,
    },
    {
      name: "Mosquito",
      after: ["Burn Delay"],
      prepare: () => {
        tryPlayApriling("-combat");
      },
      completed: () => step("questL02Larva") >= 1,
      do: $location`The Spooky Forest`,
      choices: { 502: 2, 505: 1, 334: 1 },
      outfit: { modifier: "-combat" },
      resources: {
        which: Resources.NCForce,
        benefit: 1 / 0.55,
      },
      limit: { soft: 20 },
    },
    {
      name: "Finish",
      after: ["Mosquito"],
      priority: () => (councilSafe() ? Priorities.None : Priorities.BadMood),
      completed: () => step("questL02Larva") === 999,
      do: () => visitUrl("council.php"),
      limit: { tries: 1 },
      freeaction: true,
    },
  ],
};
