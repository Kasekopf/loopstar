import {
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $path,
  $skill,
  AprilingBandHelmet,
  AugustScepter,
  ensureEffect,
  get,
  have,
  Macro,
} from "libram";
import { cliExecute, myMaxhp, myMp, myPath, restoreHp, use, useSkill, visitUrl } from "kolmafia";
import { CombatStrategy } from "grimoire-kolmafia";
import { Quest } from "../../../engine/task";

export const ColosseumQuest: Quest = {
  name: "Colosseum",
  tasks: [
    {
      name: "Gymnasium",
      after: ["Currents/Seahorse"],
      prepare: () => {
        if (AprilingBandHelmet.canChangeSong()) {
          AprilingBandHelmet.conduct("Apriling Band Battle Cadence");
        }
        if (!have($effect`Hippy Stench`) && have($item`reodorant`)) {
          use($item`reodorant`);
        }
        if (!have($effect`Fresh Breath`) && AugustScepter.canCast(6)) {
          useSkill($skill`Aug. 6th: Fresh Breath Day!`);
        }
      },
      completed: () =>
        (have($item`Mer-kin gladiator mask`) || have($item`Mer-kin headguard`)) &&
        (have($item`Mer-kin gladiator tailpiece`) || have($item`Mer-kin thighguard`)),
      do: $location`Mer-kin Gymnasium`,
      outfit: {
        equip: $items`Mer-kin scholar mask, Mer-kin scholar tailpiece, spring shoes`,
        familiar: $familiar`Jumpsuited Hound Dog`,
        modifier: "+combat",
      },
      choices: { 701: 1 },
      limit: { soft: 11 },
    },
    {
      name: "Outfit",
      after: ["Gymnasium", "Mer-kin Gear/Get Mer-kin Mask", "Mer-kin Gear/Get Mer-kin Tailpiece"],
      ready: () =>
        (get("yogUrtDefeated") || myPath() !== $path`11,037 Leagues Under the Sea`) &&
        have($item`Mer-kin thighguard`) &&
        have($item`Mer-kin headguard`),
      completed: () =>
        (get("yogUrtDefeated") || myPath() !== $path`11,037 Leagues Under the Sea`) &&
        have($item`Mer-kin gladiator mask`) &&
        have($item`Mer-kin gladiator tailpiece`),
      do: () => {
        visitUrl("shop.php?whichshop=grandma");
        visitUrl("shop.php?whichshop=grandma&action=buyitem&quantity=1&whichrow=131&pwd");
        visitUrl("shop.php?whichshop=grandma&action=buyitem&quantity=1&whichrow=1619&pwd");
        visitUrl("shop.php?whichshop=grandma&action=buyitem&quantity=1&whichrow=126&pwd");
        visitUrl("shop.php?whichshop=grandma&action=buyitem&quantity=1&whichrow=127&pwd");
      },
      underwater: true,
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Fights",
      after: ["Outfit", "Currents/Seahorse"],
      completed: () => get("isMerkinGladiatorChampion"),
      prepare: () => {
        if (get("lastColosseumRoundWon") < 9) return; // easy fights
        // equip($item`April Shower Thoughts shield`)
        // useSkill($skill`Simmer`);
        // ensureEffect($effect`Elron's Explosive Etude`);
        ensureEffect($effect`Arched Eyebrow of the Archmage`);
        if (!get("telescopeLookedHigh")) cliExecute("telescope high");
        cliExecute("monorail");
        ensureEffect($effect`Glittering Eyelashes`);
      },
      do: $location`Mer-kin Colosseum`,
      combat: new CombatStrategy().macro((): Macro => {
        if (get("lastColosseumRoundWon") < 9) return Macro.trySkillRepeat($skill`Saucegeyser`);
        else return Macro.trySkillRepeat($skill`Raise Backup Dancer`);
      }),
      limit: { tries: 16 },
      outfit: {
        modifier: "mysticality",
        familiar: $familiar`Tiny Plastic Santa Claus Skeleton`,
        equip: $items`Everfull Dart Holster, spring shoes, bat wings, Monodent of the Sea, august scepter, Mer-kin gladiator mask, Mer-kin gladiator tailpiece`,
      },
    },
    {
      name: "Shub",
      after: ["Fights"],
      completed: () => get("shubJigguwattDefeated"),
      prepare: () => {
        // Restore hp and empty mana
        restoreHp(myMaxhp());
        const numcasts = Math.floor(myMp() / 2);
        useSkill(numcasts, $skill`The Moxious Madrigal`);
      },
      // eslint-disable-next-line libram/verify-constants
      do: $location`Mer-kin Temple Left Door`,
      combat: new CombatStrategy().macro((): Macro => {
        return Macro.item([$item`jam band bootleg`, $item`jam band bootleg`])
          .item([$item`jam band bootleg`, $item`jam band bootleg`])
          .item([$item`jam band bootleg`, $item`jam band bootleg`])
          .tryItem([$item`jam band bootleg`, $item`jam band bootleg`])
          .tryItem($item`jam band bootleg`)
          .attack()
          .repeat();
      }),
      post: () => {
        if (myMp() < 200) {
          useSkill($skill`Rest upside down`);
        }
      },
      outfit: {
        familiar: $familiar`Peace Turkey`,
        equip: $items`Mer-kin gladiator mask, Mer-kin gladiator tailpiece, dark porquoise ring, Everfull Dart Holster, spring shoes, bat wings, Monodent of the Sea, April Shower Thoughts shield`,
      },
      limit: { tries: 1 },
    },
  ],
};
