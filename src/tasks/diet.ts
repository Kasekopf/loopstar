import {
  cliExecute,
  drink,
  eat,
  myAdventures,
  myFullness,
  myInebriety,
  myLevel,
  mySign,
  reverseNumberology,
  use,
  useSkill,
} from "kolmafia";
import { $effect, $effects, $item, $items, $skill, get, have } from "libram";
import { Priorities } from "../engine/priority";
import { Quest } from "../engine/task";
import { atLevel } from "../lib";
import { args } from "../args";
import { customRestoreMp } from "../engine/moods";

export const DietQuest: Quest = {
  name: "Diet",
  tasks: [
    {
      name: "Eat",
      ready: () =>
        atLevel(5) &&
        (have($item`Ol' Scratch's salad fork`) || args.minor.skipfork) &&
        ((!get("pizzaOfLegendEaten") && have($item`Pizza of Legend`)) ||
          (!get("calzoneOfLegendEaten") && have($item`Calzone of Legend`)) ||
          (!get("deepDishOfLegendEaten") && have($item`Deep Dish of Legend`))) &&
        (have($effect`Ready to Eat`) || myLevel() >= 12),
      completed: () => myFullness() > 0,
      do: () => {
        customRestoreMp(20);
        useSkill($skill`Cannelloni Cocoon`);
        if (have($item`milk of magnesium`) && !get("_milkOfMagnesiumUsed"))
          use($item`milk of magnesium`);
        if (!args.minor.skipfork) eat(1, $item`Ol' Scratch's salad fork`);

        if (!get("calzoneOfLegendEaten") && have($item`Calzone of Legend`))
          eat(1, $item`Calzone of Legend`);
        else if (!get("pizzaOfLegendEaten") && have($item`Pizza of Legend`))
          eat(1, $item`Pizza of Legend`);
        else if (!get("deepDishOfLegendEaten") && have($item`Deep Dish of Legend`))
          eat(1, $item`Deep Dish of Legend`);
      },
      outfit: {
        equip: $items`nurse's hat, familiar scrapbook, LOV Eardigan, LOV Epaulettes, LOV Earrings, sea salt scrubs`,
        modifier: "100 hot res, HP",
      },
      limit: { tries: 1 },
    },
    {
      name: "Drink",
      ready: () => atLevel(11) && (have($item`Frosty's frosty mug`) || args.minor.skipmug),
      completed: () =>
        myInebriety() === 1 || (!have($item`astral pilsner`) && !have($item`astral six-pack`)),
      do: () => {
        if (have($item`astral six-pack`)) use($item`astral six-pack`);
        customRestoreMp(20);
        useSkill($skill`Cannelloni Cocoon`);
        if (!args.minor.skipmug) drink(1, $item`Frosty's frosty mug`);
        drink(1, $item`astral pilsner`);
      },
      outfit: {
        equip: $items`nurse's hat, sea salt scrubs`,
        modifier: "100 cold res, HP",
      },
      effects: $effects`Ode to Booze`,
      limit: { tries: 1 },
    },
    {
      name: "Numberology",
      priority: () => Priorities.Free,
      after: ["Summon/War Frat 151st Infantryman"],
      completed: () =>
        // When you use 3 casts of numberology in ronin,
        // it locks you out of all your remaining casts once you break ronin
        get("_universeCalculated") >= get("skillLevel144") || get("_universeCalculated") >= 2,
      ready: () => myAdventures() > 0 && Object.keys(reverseNumberology()).includes("69"),
      do: (): void => {
        customRestoreMp(1);
        cliExecute("numberology 69");
      },
      limit: { tries: 5 },
      freeaction: true,
    },
    {
      name: "Tune after Diet",
      after: ["Diet/Eat", "Diet/Drink"],
      ready: () => mySign() === "Blender" || mySign() === "Opossum",
      completed: () =>
        !have($item`hewn moon-rune spoon`) ||
        args.minor.tune === undefined ||
        get("moonTuned", false),
      priority: () => Priorities.Free,
      freeaction: true,
      do: () => cliExecute(`spoon ${args.minor.tune}`),
      limit: { tries: 1 },
    },
  ],
};
