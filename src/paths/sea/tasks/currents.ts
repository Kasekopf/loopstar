import {
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $monsters,
  $path,
  $skill,
  get,
  have,
  Macro,
} from "libram";
import { Quest } from "../../../engine/task";
import { cliExecute, itemAmount, myPath, retrieveItem, use, visitUrl } from "kolmafia";
import { CombatStrategy } from "../../../engine/combat";

export const CurrentsQuest: Quest = {
  name: "Currents",
  tasks: [
    {
      name: "Outpost Beads",
      after: ["Sea Monkee/Outpost Grandma"],
      completed: () => have($item`Mer-kin prayerbeads`, 3),
      do: $location`The Mer-Kin Outpost`,
      combat: new CombatStrategy().banish($monsters`Mer-kin burglar, Mer-kin raider`).kill(),
      outfit: {
        familiar: $familiar`Peace Turkey`,
        modifier: "item",
      },
      delay: 24,
      limit: { soft: 24 },
    },
    {
      name: "Outpost Delay",
      after: ["Outpost Beads"],
      completed: () =>
        have($item`Mer-kin stashbox`) ||
        have($item`Mer-kin trailmap`) ||
        get("corralUnlocked") ||
        $location`The Mer-Kin Outpost`.turnsSpent > 24 ||
        myPath() !== $path`11,037 Leagues Under the Sea`,
      do: $location`The Mer-Kin Outpost`,
      combat: new CombatStrategy().ignore(),
      delay: 24,
      limit: { soft: 24 },
    },
    {
      name: "Outpost Lockkey",
      after: ["Outpost Delay"],
      completed: () =>
        have($item`Mer-kin lockkey`) ||
        have($item`Mer-kin stashbox`) ||
        have($item`Mer-kin trailmap`) ||
        get("corralUnlocked"),
      do: $location`The Mer-Kin Outpost`,
      combat: new CombatStrategy().kill(),
      limit: { soft: 20 },
    },
    {
      name: "Outpost Stashbox",
      after: ["Outpost Lockkey"],
      completed: () =>
        have($item`Mer-kin stashbox`) || have($item`Mer-kin trailmap`) || get("corralUnlocked"),
      do: $location`The Mer-Kin Outpost`,
      outfit: {
        familiar: $familiar`Peace Turkey`,
        modifier: "-combat",
      },
      combat: new CombatStrategy().kill(),
      limit: { soft: 20 },
    },
    {
      name: "Open Corral",
      after: ["Outpost Stashbox"],
      completed: () => get("corralUnlocked"),
      do: () => {
        if (have($item`Mer-kin stashbox`)) use($item`Mer-kin stashbox`);
        if (have($item`Mer-kin trailmap`)) use($item`Mer-kin trailmap`);
        cliExecute("grandpa currents");
      },
      underwater: true,
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Corral Leather",
      after: ["Open Corral"],
      completed: () =>
        have($item`sea leather`) ||
        (have($item`sea chaps`) && have($item`sea cowboy hat`)) ||
        get("lassoTrainingCount") >= 20,
      do: $location`The Coral Corral`,
      combat: new CombatStrategy()
        .macro(Macro.trySkill($skill`Spring Kick`), $monster`Mer-kin rustler`)
        .macro(
          Macro.skill($skill`Sea *dent: Talk to Some Fish`)
            .skill($skill`BCZ: Refracted Gaze`)
            .skill($skill`Do an epic McTwist!`)
        )
        .kill(),
      outfit: {
        modifier: "item",
        equip: $items`Monodent of the Sea, toy Cupid bow, pro skateboard, spring shoes, blood cubic zirconia`,
      },
      post: () => use($item`Mer-kin thingpouch`, itemAmount($item`Mer-kin thingpouch`)),
      limit: { soft: 11 },
    },
    {
      name: "Make Sea Chaps",
      after: ["Corral Leather"],
      completed: () => have($item`sea chaps`),
      do: () => cliExecute("create sea chaps"),
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Make Sea Chaps",
      after: ["Corral Leather"],
      completed: () => have($item`sea cowboy hat`),
      do: () => cliExecute("create sea cowboy hat"),
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Corral Cowbell",
      after: ["Corral Leather"],
      completed: () =>
        (have($item`sea cowbell`, 3) && have($item`sea lasso`)) || get("seahorseName") !== "",
      do: $location`The Coral Corral`,
      combat: new CombatStrategy().banish($monster`Mer-kin rustler`).kill(),
      outfit: {
        modifier: "item",
      },
      post: () => use($item`Mer-kin thingpouch`, itemAmount($item`Mer-kin thingpouch`)),
      limit: { soft: 11 },
    },
    {
      name: "Seahorse",
      after: ["Corral Cowbell"],
      ready: () => get("lassoTrainingCount") >= 20,
      completed: () => get("seahorseName") !== "",
      do: $location`The Coral Corral`,
      // peridot: $monster`wild seahorse`,
      combat: new CombatStrategy()
        .banish($monsters`Mer-kin rustler, sea cowboy, sea cow`)
        .ignore($monster`tumbleweed`)
        .macro(() => {
          if (have($skill`Ambidextrous Funkslinging`)) {
            return Macro.item([$item`sea cowbell`, $item`sea cowbell`]).item([
              $item`sea cowbell`,
              $item`sea lasso`,
            ]);
          } else {
            return Macro.item($item`sea cowbell`)
              .item($item`sea cowbell`)
              .item($item`sea cowbell`)
              .item($item`sea lasso`);
          }
        }, $monsters`wild seahorse`),
      limit: { soft: 11 },
    },
    {
      name: "Get Mer-kin Mask",
      after: ["Seahorse"],
      completed: () =>
        have($item`crappy Mer-kin mask`) ||
        have($item`Mer-kin gladiator mask`) ||
        have($item`Mer-kin scholar mask`),
      do: () => {
        retrieveItem($item`aerated diving helmet`);
        visitUrl("shop.php?whichshop=grandma");
        visitUrl("shop.php?whichshop=grandma&action=buyitem&quantity=1&whichrow=124&pwd");
      },
      underwater: true,
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Get Mer-kin Tailpiece",
      after: ["Seahorse"],
      completed: () =>
        have($item`crappy Mer-kin tailpiece`) ||
        have($item`Mer-kin gladiator tailpiece`) ||
        have($item`Mer-kin scholar tailpiece`),
      do: () => {
        retrieveItem($item`teflon swim fins`);
        visitUrl("shop.php?whichshop=grandma");
        visitUrl("shop.php?whichshop=grandma&action=buyitem&quantity=1&whichrow=125&pwd");
      },
      underwater: true,
      freeaction: true,
      limit: { tries: 1 },
    },
  ],
};
