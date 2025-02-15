import { itemAmount, myDaycount, numericModifier, use, visitUrl } from "kolmafia";
import {
  $effect,
  $item,
  $items,
  $location,
  $monster,
  $skill,
  ensureEffect,
  get,
  have,
  Macro,
} from "libram";
import { Quest } from "../engine/task";
import { Outfit, step } from "grimoire-kolmafia";
import { Priorities } from "../engine/priority";
import { CombatStrategy } from "../engine/combat";
import { atLevel } from "../lib";
import { councilSafe } from "./level12";
import { stenchPlanner } from "../engine/outfit";

export const BatQuest: Quest = {
  name: "Bat",
  tasks: [
    {
      name: "Start",
      after: [],
      ready: () => atLevel(4),
      completed: () => step("questL04Bat") !== -1,
      do: () => visitUrl("council.php"),
      limit: { tries: 1 },
      priority: () => (councilSafe() ? Priorities.Free : Priorities.BadMood),
      freeaction: true,
    },
    {
      name: "Bat Wings Entrance",
      priority: () => Priorities.Free,
      after: ["Start"],
      ready: () => have($item`bat wings`),
      completed: () => get("batWingsBatHoleEntrance", false),
      do: $location`The Bat Hole Entrance`,
      prepare: () => {
        if (numericModifier("stench resistance") < 1) ensureEffect($effect`Red Door Syndrome`);
        if (numericModifier("stench resistance") < 1)
          throw `Unable to ensure stench res for guano junction`;
      },
      post: () => {
        if (have($item`sonar-in-a-biscuit`)) use($item`sonar-in-a-biscuit`);
      },
      outfit: { modifier: "10 stench res", equip: $items`bat wings`, avoid: $items`June cleaver` },
      limit: { tries: 1 },
    },
    {
      name: "Bat Wings Guano",
      priority: () => Priorities.Free,
      after: ["Start"],
      ready: () => have($item`bat wings`) && atLevel(4),
      completed: () => get("batWingsGuanoJunction", false),
      do: $location`Guano Junction`,
      prepare: () => {
        if (numericModifier("stench resistance") < 1) ensureEffect($effect`Red Door Syndrome`);
        if (numericModifier("stench resistance") < 1)
          throw `Unable to ensure stench res for guano junction`;
      },
      post: () => {
        if (have($item`sonar-in-a-biscuit`)) use($item`sonar-in-a-biscuit`);
      },
      outfit: { modifier: "10 stench res", equip: $items`bat wings`, avoid: $items`June cleaver` },
      limit: { tries: 1 },
    },
    {
      name: "Bat Wings Batrat",
      priority: () => Priorities.Free,
      after: ["Start", "Use Sonar 1"],
      ready: () => have($item`bat wings`),
      completed: () => get("batWingsBatratBurrow", false),
      do: $location`The Batrat and Ratbat Burrow`,
      prepare: () => {
        if (numericModifier("stench resistance") < 1) ensureEffect($effect`Red Door Syndrome`);
        if (numericModifier("stench resistance") < 1)
          throw `Unable to ensure stench res for guano junction`;
      },
      post: () => {
        if (have($item`sonar-in-a-biscuit`)) use($item`sonar-in-a-biscuit`);
      },
      outfit: { modifier: "10 stench res", equip: $items`bat wings`, avoid: $items`June cleaver` },
      limit: { tries: 1 },
    },
    {
      name: "Bat Wings Bean",
      priority: () => Priorities.Free,
      after: ["Start", "Use Sonar 2"],
      ready: () => have($item`bat wings`),
      completed: () => get("batWingsBeanbatChamber", false),
      do: $location`The Beanbat Chamber`,
      prepare: () => {
        if (numericModifier("stench resistance") < 1) ensureEffect($effect`Red Door Syndrome`);
        if (numericModifier("stench resistance") < 1)
          throw `Unable to ensure stench res for guano junction`;
      },
      post: () => {
        if (have($item`sonar-in-a-biscuit`)) use($item`sonar-in-a-biscuit`);
      },
      outfit: { modifier: "10 stench res", equip: $items`bat wings`, avoid: $items`June cleaver` },
      limit: { tries: 1 },
    },
    {
      name: "Get Sonar 1",
      after: [],
      completed: () => step("questL04Bat") + itemAmount($item`sonar-in-a-biscuit`) >= 1,
      do: $location`Guano Junction`,
      ready: () => stenchPlanner.maximumPossible(true) >= 1,
      prepare: () => {
        if (numericModifier("stench resistance") < 1) ensureEffect($effect`Red Door Syndrome`);
        if (numericModifier("stench resistance") < 1)
          throw `Unable to ensure stench res for guano junction`;
      },
      post: () => {
        if (have($item`sonar-in-a-biscuit`)) use($item`sonar-in-a-biscuit`);
      },
      outfit: (): Outfit => {
        if (
          !have($skill`Comprehensive Cartography`) &&
          have($item`industrial fire extinguisher`) &&
          get("_fireExtinguisherCharge") >= 20 &&
          !get("fireExtinguisherBatHoleUsed")
        )
          return stenchPlanner.outfitFor(1, {
            equip: $items`industrial fire extinguisher`,
          });
        else return stenchPlanner.outfitFor(1, { modifier: "item" });
      },
      choices: { 1427: 1 },
      combat: new CombatStrategy()
        .macro(new Macro().trySkill($skill`Fire Extinguisher: Zone Specific`))
        .kill($monster`screambat`)
        .killItem(),
      limit: { tries: 10 },
    },
    {
      name: "Use Sonar 1",
      after: ["Get Sonar 1"],
      completed: () => step("questL04Bat") >= 1,
      do: () => use($item`sonar-in-a-biscuit`),
      limit: { tries: 3 },
      freeaction: true,
    },
    {
      name: "Get Sonar 2",
      after: ["Use Sonar 1"],
      completed: () => step("questL04Bat") + itemAmount($item`sonar-in-a-biscuit`) >= 2,
      priority: () => {
        if (
          step("questL11Shen") === 999 ||
          have($item`The Stankara Stone`) ||
          (myDaycount() === 1 && step("questL11Shen") > 1)
        )
          return Priorities.None;
        return Priorities.BadMood;
      },
      prepare: () => {
        if (numericModifier("stench resistance") < 1) ensureEffect($effect`Red Door Syndrome`);
        if (numericModifier("stench resistance") < 1)
          throw `Unable to ensure stench res for guano junction`;
      },
      do: $location`Guano Junction`,
      post: () => {
        if (have($item`sonar-in-a-biscuit`)) use($item`sonar-in-a-biscuit`);
      },
      outfit: { modifier: "item, 10 stench res" },
      combat: new CombatStrategy().kill($monster`screambat`).killItem(),
      limit: { tries: 10 },
    },
    {
      name: "Use Sonar 2",
      after: ["Get Sonar 2"],
      completed: () => step("questL04Bat") >= 2,
      do: () => use($item`sonar-in-a-biscuit`),
      limit: { tries: 3 },
      freeaction: true,
    },
    {
      name: "Get Sonar 3",
      after: ["Use Sonar 2"],
      completed: () => step("questL04Bat") + itemAmount($item`sonar-in-a-biscuit`) >= 3,
      prepare: () => {
        if (numericModifier("stench resistance") < 1) ensureEffect($effect`Red Door Syndrome`);
        if (numericModifier("stench resistance") < 1)
          throw `Unable to ensure stench res for guano junction`;
      },
      do: $location`Guano Junction`,
      post: () => {
        if (have($item`sonar-in-a-biscuit`)) use($item`sonar-in-a-biscuit`);
      },
      outfit: { modifier: "item, 10 stench res" },
      combat: new CombatStrategy().kill($monster`screambat`).killItem(),
      limit: { tries: 10 },
    },
    {
      name: "Use Sonar 3",
      after: ["Get Sonar 3"],
      completed: () => step("questL04Bat") >= 3,
      do: () => use($item`sonar-in-a-biscuit`),
      limit: { tries: 3 },
      freeaction: true,
    },
    {
      name: "Boss Bat",
      after: ["Bat/Use Sonar 3"],
      completed: () => step("questL04Bat") >= 4,
      do: $location`The Boss Bat's Lair`,
      combat: new CombatStrategy().killHard($monster`Boss Bat`).ignore(),
      limit: { soft: 10 },
      delay: 6,
    },
    {
      name: "Finish",
      after: ["Boss Bat"],
      priority: () => (councilSafe() ? Priorities.Free : Priorities.BadMood),
      completed: () => step("questL04Bat") === 999,
      do: () => visitUrl("council.php"),
      limit: { tries: 1 },
      freeaction: true,
    },
  ],
};
