import { get } from "http";
import { Item, myAdventures, myDaycount, myFullness, myInebriety } from "kolmafia";
import { $item, $skill, have } from "libram";
import { args } from "../../args";
import { getPullTask, PullSpec } from "../../tasks/pulls";
import { Quest } from "../../engine/task";

export const smolPulls: PullSpec[] = [
  // Food
  {
    name: "Cookbookbat Food of Legend",
    pull: () => {
      const result: Item[] = [];
      if (!get("calzoneOfLegendEaten")) result.push($item`Calzone of Legend`);
      if (!get("pizzaOfLegendEaten")) result.push($item`Pizza of Legend`);
      if (!get("deepDishOfLegendEaten")) result.push($item`Deep Dish of Legend`);
      return result;
    },
    useful: () => {
      if (myFullness() >= 1) return false;
      if (myDaycount() > 1 && myAdventures() > 5) return undefined;
      return true;
    },
    priority: 200,
  },
  {
    pull: $item`Ol' Scratch's salad fork`,
    useful: () => {
      if (args.smol.skipfork) return false;
      if (myFullness() >= 1) return false;
      if (myDaycount() > 1 && myAdventures() > 5) return undefined;
      return true;
    },
    price: 400000,
    priority: 60,
  },
  {
    pull: $item`crepe paper parachute cape`,
    optional: true,
    priority: 10,
  },
  {
    pull: $item`Frosty's frosty mug`,
    useful: () => {
      if (args.smol.skipmug) return false;
      if (myInebriety() >= 1) return false;
      if (myDaycount() > 1 && myAdventures() > 5) return undefined;
      return true;
    },
    price: 200000,
    priority: 100,
  },
  {
    pull: $item`Bowl of Infinite Jelly`,
    useful: () => myFullness() === 0,
    optional: true,
    priority: 40,
  },
  {
    pull: $item`milk of magnesium`,
    useful: () => {
      if (args.smol.skipmilk) return false;
      if (get("_milkOfMagnesiumUsed")) return false;
      if (myFullness() >= 1) return false;
      if (myDaycount() > 1 && myAdventures() > 5) return undefined;
      return true;
    },
    priority: 5,
  },
  // Survivability pulls
  {
    pull: $item`nurse's hat`,
    priority: 100,
  },
  {
    pull: $item`sea salt scrubs`,
    useful: () => have($skill`Torso Awareness`),
    priority: 100,
  },
  {
    pull: $item`hopping socks`, // +max MP item
    useful: () => !have($skill`Torso Awareness`) && !have($item`SpinMaster™ lathe`),
    priority: 100,
  },
  // Pulls with high (avoided) requirements
  { pull: $item`old patched suit-pants`, optional: true, priority: 5 },
  {
    pull: $item`transparent pants`,
    optional: true,
    useful: () => !have($item`designer sweatpants`),
    priority: 5,
  },
];

export const SmolPullQuest: Quest = {
  name: "SmolPull",
  tasks: smolPulls.map((p) => getPullTask(p)),
};
