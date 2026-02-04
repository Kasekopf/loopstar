import {
  $coinmaster,
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $skill,
  get,
  getActiveSongs,
  getSongCount,
  getSongLimit,
  have,
  Macro,
  uneffect,
} from "libram";
import { step } from "grimoire-kolmafia";
import {
  buy,
  cliExecute,
  Effect,
  equip,
  itemAmount,
  myMaxhp,
  myMp,
  restoreHp,
  use,
  useSkill,
} from "kolmafia";
import { Quest } from "../../../engine/task";
import { CombatStrategy } from "../../../engine/combat";

function pearlsReady(): boolean {
  if (have($item`unblemished pearl`, 5)) {
    return true;
  } else if (
    get("_unblemishedPearlAnemoneMine") &&
    get("_unblemishedPearlDiveBar") &&
    get("_unblemishedPearlMadnessReef") &&
    get("_unblemishedPearlMarinaraTrench") &&
    get("_unblemishedPearlTheBriniestDeepests")
  ) {
    return true;
  } else {
    return false;
  }
}

export const FinalQuest: Quest = {
  name: "Final Steps",
  tasks: [
    {
      name: "Nautical Seaceress",
      ready: () =>
        pearlsReady() &&
        get("shubJigguwattDefeated") &&
        get("yogUrtDefeated") &&
        step("questS02Monkees") === 999,
      completed: () => step("questL13Final") === 999,
      prepare: () => {
        // buy($coinmaster`Wet Crap For Sale`, 1, $item`scroll of sea strength`);
        // Actually, seems like the coinmaster only has sand penny stuff
        if (!have($effect`Sea Strength`)) {
          cliExecute("buy scroll of sea strength");
          use($item`scroll of sea strength`);
        }
        if (!have($effect`Sea Smarm`)) {
          // buy($coinmaster`Wet Crap For Sale`, 1, $item`scroll of sea smarm`);
          cliExecute("buy scroll of sea smarm");
          use($item`scroll of sea smarm`);
        }
        if (myMp() < 300) {
          useSkill($skill`Rest upside down`);
        }
        if (getSongCount() > getSongLimit()) {
          uneffect(<Effect>getActiveSongs().pop());
          useSkill($skill`Song of Bravado`);
        }
        if (!have($effect`Up To 11`)) {
          equip($item`blood cubic zirconia`);
          // Trivializes the whole fight
          useSkill($skill`BCZ: Dial it up to 11`);
        }
        restoreHp(myMaxhp());
      },
      do: $location`Mer-kin Temple (Center Door)`,
      combat: new CombatStrategy().macro((): Macro => {
        return Macro.trySkillRepeat($skill`Saucegeyser`); // Note: should be safe with up to 11 active
      }),
      outfit: {
        modifier: "moxie",
        familiar: $familiar`Peace Turkey`,
        equip: $items`Everfull Dart Holster, spring shoes, bat wings, shark jumper, Monodent of the Sea, April Shower Thoughts shield`,
      },
      limit: { soft: 11 },
    },
    {
      name: "Spend Sea Pennies",
      after: ["Nautical Seaceress"],
      ready: () => have($item`sand penny`),
      completed: () => itemAmount($item`sand penny`) < 10,
      do: () => {
        const numToBuy = Math.floor(itemAmount($item`sand penny`) / 10);
        buy($coinmaster`Wet Crap For Sale`, numToBuy, $item`sea gel`);
      },
      limit: { soft: 11 },
    },
  ],
};
