import {
  beretBuskingEffects,
  cliExecute,
  drink,
  eat,
  equip,
  familiarEquippedEquipment,
  myAdventures,
  myFullness,
  myInebriety,
  myLevel,
  myMeat,
  mySign,
  reverseNumberology,
  use,
  useFamiliar,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $effects,
  $familiar,
  $item,
  $items,
  $monster,
  $monsters,
  $skill,
  $slot,
  CursedMonkeyPaw,
  get,
  have,
  Macro,
  PrismaticBeret,
} from "libram";
import { NamedDeltaTask, Quest } from "../../engine/task";
import { atLevel, tryWish } from "../../lib";
import { args } from "../../args";
import { customRestoreMp } from "../../engine/moods";
import { CombatStrategy, killMacro } from "../../engine/combat";

function saltyMouthBusk() {
  // Only try with the first two busks, and a check for hammertime for now
  if (!PrismaticBeret.have() || get("_beretBuskingUses") >= 5) return;
  const busk1Power = PrismaticBeret.findOptimalOutfitPower($effects`Salty Mouth`);
  const busk1Effects = Object.keys(beretBuskingEffects(busk1Power, get("_beretBuskingUses")));
  if (busk1Effects.includes("Salty Mouth")) {
    if (PrismaticBeret.buskAt(busk1Power)) return;
  }
  if (get("_beretBuskingUses") >= 4) return;
  const busk2Power = PrismaticBeret.findOptimalOutfitPower($effects`Salty Mouth`, {}, get("_beretBuskingUses") + 1);
  const busk2Effects = Object.keys(beretBuskingEffects(busk2Power, get("_beretBuskingUses") + 1))
  if (busk2Effects.includes("Salty Mouth")) {
    if (PrismaticBeret.buskAt(busk2Power)) return;
  }
  const hammertimeBusk1Power = PrismaticBeret.findOptimalOutfitPower($effects`Hammertime`);
  const hammertimeEffects = Object.keys(beretBuskingEffects(hammertimeBusk1Power, get("_beretBuskingUses")));
  if (hammertimeEffects.includes("Hammertime")) {
    const busk2PowerWithHammertime = PrismaticBeret.findOptimalOutfitPower($effects`Salty Mouth`, { hammerTime: true }, get("_beretBuskingUses") + 1);
    const busk2WithHammertimeEffects = Object.keys(beretBuskingEffects(busk2PowerWithHammertime, get("_beretBuskingUses") + 1));
    if (busk2WithHammertimeEffects.includes("Salty Mouth")) {
      PrismaticBeret.buskAt(hammertimeBusk1Power);
      PrismaticBeret.buskAt(busk2PowerWithHammertime, { hammerTime: true });
    }
  }
}

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
      withnoadventures: true,
    },
    {
      name: "Drink",
      ready: () =>
        atLevel(11) && (have($item`Frosty's frosty mug`) || args.smol.skipmug) && myMeat() >= 1000,
      completed: () =>
        myInebriety() === 1 || (!have($item`astral pilsner`) && !have($item`astral six-pack`)),
      do: () => {
        if (have($item`astral six-pack`)) use($item`astral six-pack`);
        customRestoreMp(20);
        useSkill($skill`Cannelloni Cocoon`);
        saltyMouthBusk();
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
      withnoadventures: true,
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
      withnoadventures: true,
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
        "Misc/Toy Accordion",
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
      name: "Sausage",
      after: ["Eat", "Macguffin/Diary", "Misc/Unlock Island"], // early meat-heavy tasks
      completed: () => !have($item`Kramco Sausage-o-Matic™`) || get("_sausagesEaten") >= 23,
      ready: () =>
        have($item`magical sausage casing`) && myMeat() >= 1000 + (1 + get("_sausagesEaten")) * 111,
      do: (): void => {
        // Pump-and-grind cannot be used from Left-Hand Man
        if (
          have($familiar`Left-Hand Man`) &&
          familiarEquippedEquipment($familiar`Left-Hand Man`) === $item`Kramco Sausage-o-Matic™`
        ) {
          useFamiliar($familiar`Left-Hand Man`);
          equip($slot`familiar`, $item`none`);
        }
        eat(1, $item`magical sausage`);
      },
      limit: { tries: 23 },
      freeaction: true,
      withnoadventures: true,
    },
    {
      name: "Limit Stats",
      after: ["Tower/Start"],
      completed: () =>
        get("nsContestants2") > -1 ||
        have($effect`Feeling Insignificant`) ||
        (!have($item`pocket wish`) && (!CursedMonkeyPaw.have() || CursedMonkeyPaw.wishes() === 0)),
      do: () => tryWish($effect`Feeling Insignificant`),
      limit: { tries: 1 },
      freeaction: true,
    },
  ],
};

export const smolDeltas: NamedDeltaTask[] = [
  // Get pocket wishes in-run
  {
    name: "Manor/Bathroom Delay",
    replace: {
      combat: new CombatStrategy()
        .killHard($monster`cosmetics wraith`)
        .macro(() => {
          if (have($item`genie bottle`)) return new Macro();
          return killMacro();
        }, $monster`toilet papergeist`)
        .banish($monsters`claw-foot bathtub, malevolent hair clog`),
      ignorebanishes: () => have($item`genie bottle`),
    },
  },
  {
    name: "Manor/Bathroom",
    replace: {
      combat: new CombatStrategy()
        .killHard($monster`cosmetics wraith`)
        .macro(() => {
          if (have($item`genie bottle`)) return new Macro();
          return killMacro();
        }, $monster`toilet papergeist`)
        .banish($monsters`claw-foot bathtub, malevolent hair clog`),
      ignorebanishes: () => have($item`genie bottle`),
    },
  },
  {
    name: "Tower/Moxie Challenge",
    combine: {
      after: ["Smol/Limit Stats"],
    },
  },
  {
    name: "Tower/Muscle Challenge",
    combine: {
      after: ["Smol/Limit Stats"],
    },
  },
  {
    name: "Tower/Mysticality Challenge",
    combine: {
      after: ["Smol/Limit Stats"],
    },
  },
];
