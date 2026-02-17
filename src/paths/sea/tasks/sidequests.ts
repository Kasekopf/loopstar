import {
  $coinmaster,
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $monsters,
  ensureEffect,
  get,
  have,
} from "libram";
import { Quest, Resources } from "../../../engine/task";
import { buy, closetAmount, itemAmount, takeCloset, visitUrl } from "kolmafia";
import { OutfitSpec, step } from "grimoire-kolmafia";
import { CombatStrategy } from "../../../engine/combat";

export const SkateParkQuest: Quest = {
  name: "Skate Park",
  tasks: [
    {
      name: "Skate Park",
      after: ["Sea Monkee/Open Grandpa Zone"],
      completed: () => get("skateParkStatus") !== "war",
      resources: {
        which: Resources.NCForce,
        benefit: 5,
      },
      do: $location`The Skate Park`,
      outfit: {
        familiar: $familiar`Peace Turkey`,
        equip: $items`skate blade`,
        modifier: "-combat",
      },
      post: () => {
        // Otherwise mafia won't update the war status for us
        visitUrl("sea_skatepark.php");
      },
      choices: { 403: 1 },
      limit: { soft: 11 },
    },
    {
      name: "Get Fishy",
      after: ["Skate Park"],
      ready: () => get("skateParkStatus") === "ice",
      completed: () => get("_skateBuff1"),
      do: () => {
        visitUrl("sea_skatepark.php?action=state2buff1");
      },
      freeaction: true,
      underwater: true,
      limit: { tries: 1 },
    },
  ],
};

export const MomQuest: Quest = {
  name: "Mom",
  tasks: [
    {
      name: "Open Abyss",
      after: ["Sea Monkee/Outpost Grandma"],
      ready: () => itemAmount($item`sand dollar`) + closetAmount($item`sand dollar`) >= 13,
      completed: () => have($item`black glass`),
      do: () => {
        const sandDollarsFromCloset = 13 - itemAmount($item`sand dollar`);
        if (sandDollarsFromCloset > 0) {
          takeCloset($item`sand dollar`, sandDollarsFromCloset);
        }
        visitUrl("monkeycastle.php?who=1");
        visitUrl("monkeycastle.php?who=2");
        buy($coinmaster`Big Brother`, 1, $item`black glass`);
      },
      underwater: true,
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Obtain Scale-Mail underwear",
      after: ["Sea Monkee/Open Grandpa Zone"],
      ready: () => have($item`dull fish scale`, 25) && have($item`pristine fish scale`),
      completed: () => have($item`scale-mail underwear`),
      do: () => {
        visitUrl("shop.php?whichshop=grandma");
        visitUrl("shop.php?whichshop=grandma&action=buyitem&quantity=1&whichrow=132&pwd");
      },
      underwater: true,
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Abyss",
      after: ["Open Abyss"],
      completed: () => step("questS02Monkees") === 999,
      prepare: () => {
        if (have($item`comb jelly`)) ensureEffect($effect`Jelly Combed`);
      },
      do: $location`The Caliginous Abyss`,
      combat: new CombatStrategy().killHard($monsters`Peanut`).kill(),
      outfit: () => {
        const baseOutfit: OutfitSpec = {
          familiar: $familiar`Peace Turkey`,
          equip: $items`old SCUBA tank, black glass, shark jumper, scale-mail underwear`,
        };
        if (get("_assertYourAuthorityCast") < 3) {
          baseOutfit.equip!.push(...$items`Sheriff badge, Sheriff moustache, Sheriff pistol`);
        }
        return baseOutfit;
      },
      limit: { soft: 11 },
    },
  ],
};
