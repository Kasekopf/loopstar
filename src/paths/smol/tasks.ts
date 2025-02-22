import {
  cliExecute,
  drink,
  eat,
  myAdventures,
  myFullness,
  myInebriety,
  myLevel,
  myMeat,
  mySign,
  reverseNumberology,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
import { $effect, $effects, $item, $items, $skill, CursedMonkeyPaw, get, have } from "libram";
import { Quest } from "../../engine/task";
import { atLevel } from "../../lib";
import { args } from "../../args";
import { customRestoreMp } from "../../engine/moods";

export const SmolQuest: Quest = {
  name: "Smol",
  tasks: [
    {
      name: "Eat",
      ready: () =>
        atLevel(5) &&
        (have($item`Ol' Scratch's salad fork`) || args.smol.skipfork) &&
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
        if (!args.smol.skipfork) eat(1, $item`Ol' Scratch's salad fork`);

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
      freeaction: true,
    },
    {
      name: "Drink",
      ready: () => atLevel(11) && (have($item`Frosty's frosty mug`) || args.smol.skipmug),
      completed: () =>
        myInebriety() === 1 || (!have($item`astral pilsner`) && !have($item`astral six-pack`)),
      do: () => {
        if (have($item`astral six-pack`)) use($item`astral six-pack`);
        customRestoreMp(20);
        useSkill($skill`Cannelloni Cocoon`);
        if (!args.smol.skipmug) drink(1, $item`Frosty's frosty mug`);
        drink(1, $item`astral pilsner`);
      },
      outfit: {
        equip: $items`nurse's hat, sea salt scrubs`,
        modifier: "100 cold res, HP",
      },
      effects: $effects`Ode to Booze`,
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Numberology",
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
      after: ["Eat", "Drink"],
      ready: () => mySign() === "Blender" || mySign() === "Opossum",
      completed: () =>
        !have($item`hewn moon-rune spoon`) ||
        args.minor.tune === undefined ||
        get("moonTuned", false),
      freeaction: true,
      do: () => cliExecute(`spoon ${args.minor.tune}`),
      limit: { tries: 1 },
    },
    {
      name: "Acquire Red Rocket",
      after: [
        "Misc/Sewer Accordion",
        "Misc/Sewer Totem",
        "Misc/Sewer Saucepan",
        "Leveling/Acquire Mouthwash",
        "Leveling/Mouthwash",
      ],
      // with meat buffer (slightly smaller, so this can always trigger)
      ready: () => myMeat() >= 1000,
      completed: () =>
        have($item`red rocket`) ||
        !have($item`Clan VIP Lounge key`) ||
        have($effect`Ready to Eat`) ||
        myFullness() > 0 ||
        myLevel() >= 12,
      do: () => {
        visitUrl("clan_viplounge.php");
        visitUrl("clan_viplounge.php?action=fwshop&whichfloor=2");
        cliExecute("acquire red rocket");
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Limit Stats",
      after: ["Tower/Start"],
      completed: () =>
        get("nsContestants2") > -1 ||
        have($effect`Feeling Insignificant`) ||
        !have($item`pocket wish`) ||
        !CursedMonkeyPaw.have() ||
        CursedMonkeyPaw.wishes() === 0,
      do: () => {
        if (have($item`pocket wish`)) cliExecute("genie effect Feeling Insignificant");
        else CursedMonkeyPaw.wishFor($effect`Feeling Insignificant`);
      },
      limit: { tries: 1 },
      freeaction: true,
    },
  ],
};
