import {
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $skill,
  ensureEffect,
  get,
  have,
  Macro,
} from "libram";
import { cliExecute, myMaxhp, myMp, restoreHp, useSkill, visitUrl } from "kolmafia";
import { CombatStrategy } from "grimoire-kolmafia";
import { Quest } from "../../../engine/task";

export const ColosseumQuest: Quest = {
  name: "Colosseum",
  tasks: [
    {
      name: "Get gladiator outfit",
      ready: () =>
        have($item`Mer-kin scholar mask`) &&
        have($item`Mer-kin scholar tailpiece`) &&
        get("yogUrtDefeated") &&
        have($item`Mer-kin thighguard`) &&
        have($item`Mer-kin headguard`),
      completed: () =>
        get("yogUrtDefeated") &&
        have($item`Mer-kin gladiator mask`) &&
        have($item`Mer-kin gladiator tailpiece`),
      do: () => {
        visitUrl("shop.php?whichshop=grandma");
        visitUrl("shop.php?whichshop=grandma&action=buyitem&quantity=1&whichrow=131&pwd");
        visitUrl("shop.php?whichshop=grandma&action=buyitem&quantity=1&whichrow=1619&pwd");
        visitUrl("shop.php?whichshop=grandma&action=buyitem&quantity=1&whichrow=126&pwd");
        visitUrl("shop.php?whichshop=grandma&action=buyitem&quantity=1&whichrow=127&pwd");
      },
      outfit: {
        equip: [$item`really, really nice swimming trunks`, $item`prismatic beret`],
        modifier: "+combat",
      },
      limit: { soft: 11 },
    },
    {
      name: "Fights",
      ready: () => have($item`Mer-kin gladiator mask`) && have($item`Mer-kin gladiator tailpiece`),
      completed: () => get("lastColosseumRoundWon") >= 12,
      do: $location`Mer-kin Colosseum`,
      combat: new CombatStrategy().macro((): Macro => {
        return Macro.trySkillRepeat($skill`Saucegeyser`);
      }),
      limit: { soft: 12 },
      outfit: {
        modifier: "mysticality",
        familiar: $familiar`Tiny Plastic Santa Claus Skeleton`,
        equip: $items`Everfull Dart Holster, spring shoes, bat wings, Monodent of the Sea, august scepter, Mer-kin gladiator mask, Mer-kin gladiator tailpiece`,
      },
    },
    {
      name: "Buff for hard fights",
      after: ["Fights"],
      completed: () => get("isMerkinGladiatorChampion") || get("telescopeLookedHigh"),
      do: () => {
        // equip($item`April Shower Thoughts shield`)
        // useSkill($skill`Simmer`);
        // ensureEffect($effect`Elron's Explosive Etude`);
        ensureEffect($effect`Arched Eyebrow of the Archmage`);
        cliExecute("telescope high");
        cliExecute("monorail");
        cliExecute("buy 5 glittery mascara; use 5 glittery mascara");
      },
      limit: { tries: 1 },
    },
    {
      name: "Hard fights",
      after: ["Buff for hard fights"],
      completed: () => get("isMerkinGladiatorChampion"),
      do: $location`Mer-kin Colosseum`,
      combat: new CombatStrategy().macro((): Macro => {
        return Macro.trySkillRepeat($skill`Raise Backup Dancer`);
      }),
      limit: { soft: 3 },
      outfit: {
        modifier: "mysticality",
        equip: $items`Everfull Dart Holster, spring shoes, bat wings, Monodent of the Sea, august scepter, Mer-kin gladiator mask, Mer-kin gladiator tailpiece`,
      },
    },
    {
      name: "Shub",
      after: ["Hard fights"],
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
        equip: $items`Everfull Dart Holster, spring shoes, bat wings, Monodent of the Sea, April Shower Thoughts shield, Mer-kin gladiator mask, Mer-kin gladiator tailpiece`,
      },
      limit: { soft: 11 },
    },
  ],
};
