import { $familiar, $item, $items, $monster, $skill, have, Macro } from "libram";
import { inHardcore } from "kolmafia";
import { Quest } from "../../../engine/task";
import { CombatStrategy } from "../../../engine/combat";
import { yellowRayPossible } from "../../../resources/yellowray";

export const SummonsQuest: Quest = {
  name: "Octopus Garden",
  tasks: [
    {
      name: "Dynamite",
      ready: () =>
        inHardcore() &&
        have($item`pocket wish`) &&
        have($item`spitball`) &&
        have($item`Spooky VHS Tape`) &&
        yellowRayPossible(),
      completed: () => have($item`minin' dynamite`, 2),
      do: () => {
        throw `Attempted to summon tetched prospector with no allocation`;
      },
      resources: {
        which: { summon: $monster`tetched prospector` },
        benefit: 200,
        required: true,
      },
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.trySkill($skill`Darts: Throw at %part1`).tryItem([
            $item`Spooky VHS Tape`,
            $item`spitball`,
          ]);
        })
        .killHard(),
      limit: { tries: 2 },
      outfit: {
        familiar: $familiar`Peace Turkey`,
        equip: $items`Everfull Dart Holster, spring shoes, Monodent of the Sea, toy Cupid bow`,
      },
    },
  ],
};
