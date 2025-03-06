import { $item, $location, $monster, $monsters, have } from "libram";
import { CombatStrategy } from "../../engine/combat";
import { Quest } from "../../engine/task";


export const MenagerieQuest: Quest = {
  name: "Unlock Menagerie",
  tasks: [
    {
      name: "Get Menagerie Key",
      after: ["Knob/King"],
      ready: () => have($item`Cobb's Knob lab key`),
      completed: () => have($item`Cobb's Knob Menagerie key`),
      do: $location`Cobb's Knob Laboratory`,
      combat: new CombatStrategy()
        .banish($monsters`Knob Goblin Alchemist, Knob Goblin Mad Scientist`)
        .kill($monster`Knob Goblin Very Mad Scientist`),
      outfit: {
        modifier: "item",
      },
      limit: { tries: 10 },
    },
  ],
};
