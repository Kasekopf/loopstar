import {
  changeMcd,
  create,
  currentMcd,
  myDaycount,
  myInebriety,
  myLevel,
  numericModifier,
  restoreMp,
  use,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $effects,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $monsters,
  $phylum,
  $skill,
  ensureEffect,
  get,
  getActiveEffects,
  have,
  Macro,
} from "libram";
import { Quest, Task } from "../engine/task";
import { Modes, OutfitSpec, step } from "grimoire-kolmafia";
import { CombatStrategy, killMacro } from "../engine/combat";
import { Priorities } from "../engine/priority";
import { tuneSnapper } from "../lib";
import { tryPlayApriling } from "../engine/resources";

const Manor1: Task[] = [
  {
    name: "Kitchen",
    after: ["Start"],
    completed: () => step("questM20Necklace") >= 1,
    prepare: () => {
      if (have($item`rainbow glitter candle`)) use($item`rainbow glitter candle`);
    },
    do: $location`The Haunted Kitchen`,
    outfit: { modifier: "stench res, hot res", avoid: $items`Roman Candelabra` },
    choices: { 893: 2 },
    combat: new CombatStrategy().kill(),
    limit: { soft: 21 },
    delay: 7,
  },
  {
    name: "Billiards",
    after: ["Kitchen"],
    completed: () => step("questM20Necklace") >= 3,
    priority: () =>
      have($effect`Chalky Hand`) && !have($item`handful of hand chalk`)
        ? Priorities.Effect
        : Priorities.None,
    prepare: () => {
      if (have($item`handful of hand chalk`) && have($item`pool cue`))
        ensureEffect($effect`Chalky Hand`);
      tryPlayApriling("-combat");
    },
    ready: () => myInebriety() <= 15 && (myInebriety() === 1 || myDaycount() > 1), // Nonnegative contribution
    do: $location`The Haunted Billiards Room`,
    choices: { 875: 1, 900: 2, 1436: 1 },
    outfit: () => {
      return {
        equip: $items`pool cue`,
        modifier: "-combat",
      };
    },
    combat: new CombatStrategy()
      .ignore()
      .killItem($monster`chalkdust wraith`)
      .kill($monster`pooltergeist (ultra-rare)`),
    limit: {
      soft: 20,
      message: `Consider increasing your permanent pool skill with "A Shark's Chum", if you have not.`,
    },
  },
  {
    name: "Library",
    after: ["Billiards"],
    completed: () => step("questM20Necklace") >= 4,
    do: $location`The Haunted Library`,
    combat: new CombatStrategy().banish($monsters`banshee librarian, bookbat`).kill(),
    outfit: { equip: $items`deft pirate hook` },
    orbtargets: () => undefined, // do not dodge anything with orb
    choices: { 163: 4, 888: 5, 889: 5, 894: 1 },
    limit: { soft: 20 },
  },
  {
    name: "Finish Floor1",
    after: ["Library"],
    priority: () => Priorities.Free,
    completed: () => step("questM20Necklace") === 999,
    do: () => visitUrl("place.php?whichplace=manor1&action=manor1_ladys"),
    limit: { tries: 1 },
    freeaction: true,
  },
];

const Manor2: Task[] = [
  {
    name: "Start Floor2",
    after: ["Finish Floor1"],
    priority: () => Priorities.Free,
    completed: () => step("questM21Dance") >= 1,
    do: () => visitUrl("place.php?whichplace=manor2&action=manor2_ladys"),
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Gallery Delay",
    after: ["Start Floor2"],
    completed: () =>
      $location`The Haunted Gallery`.turnsSpent >= 5 ||
      have($item`Lady Spookyraven's dancing shoes`) ||
      step("questM21Dance") >= 2,
    do: $location`The Haunted Gallery`,
    choices: { 89: 6, 896: 1 }, // TODO: louvre
    limit: { turns: 5 },
    delay: 5,
  },
  {
    name: "Gallery",
    after: ["Gallery Delay"],
    completed: () => have($item`Lady Spookyraven's dancing shoes`) || step("questM21Dance") >= 2,
    do: $location`The Haunted Gallery`,
    choices: { 89: 6, 896: 1 }, // TODO: louvre
    outfit: { modifier: "-combat" },
    limit: { soft: 15 },
  },
  {
    name: "Bathroom Delay",
    after: ["Start Floor2"],
    completed: () =>
      $location`The Haunted Bathroom`.turnsSpent >= 5 ||
      have($item`Lady Spookyraven's powder puff`) ||
      step("questM21Dance") >= 2,
    do: $location`The Haunted Bathroom`,
    choices: { 881: 1, 105: 1, 892: 1 },
    combat: new CombatStrategy()
      .killHard($monster`cosmetics wraith`)
      .macro(() => {
        if (have($item`genie bottle`)) return new Macro();
        return killMacro();
      }, $monster`toilet papergeist`)
      .banish($monsters`claw-foot bathtub, malevolent hair clog`),
    limit: { turns: 5 },
    delay: 5,
    // No need to search for cosmetics wraith
    orbtargets: () => [],
    ignore_banishes: () => have($item`genie bottle`),
  },
  {
    name: "Bathroom",
    after: ["Bathroom Delay"],
    completed: () => have($item`Lady Spookyraven's powder puff`) || step("questM21Dance") >= 2,
    do: $location`The Haunted Bathroom`,
    choices: { 881: 1, 105: 1, 892: 1 },
    outfit: { modifier: "-combat" },
    combat: new CombatStrategy()
      .killHard($monster`cosmetics wraith`)
      .macro(() => {
        if (have($item`genie bottle`)) return new Macro();
        return killMacro();
      }, $monster`toilet papergeist`)
      .banish($monsters`claw-foot bathtub, malevolent hair clog`),
    limit: { soft: 15 },
    // No need to search for cosmetics wraith
    orbtargets: () => [],
    ignore_banishes: () => have($item`genie bottle`),
  },
  {
    name: "Bedroom",
    after: ["Start Floor2"],
    completed: () =>
      (have($item`Lady Spookyraven's finest gown`) || step("questM21Dance") >= 2) &&
      have($item`Lord Spookyraven's spectacles`),
    do: $location`The Haunted Bedroom`,
    choices: () => {
      return {
        876: 1,
        877: 1,
        878: !have($item`Lord Spookyraven's spectacles`) ? 3 : 4,
        879: 1,
        880: 1,
        897: 2,
      };
    },
    combat: new CombatStrategy()
      .killHard($monster`animated ornate nightstand`)
      .kill($monster`elegant animated nightstand`) // kill ornate nightstand if banish fails
      .banish(
        $monsters`animated mahogany nightstand, animated rustic nightstand, Wardröb nightstand`
      )
      .ignore($monster`tumbleweed`),
    delay: () => {
      if (!have($item`Lord Spookyraven's spectacles`)) return 0;
      if (
        !have($item`disposable instant camera`) &&
        !have($item`photograph of a dog`) &&
        step("questL11Palindome") < 3
      )
        return 0;
      return 5;
    },
    limit: { soft: 20 },
  },
  {
    name: "Bedroom Camera",
    after: ["Bedroom"],
    completed: () =>
      have($item`disposable instant camera`) ||
      have($item`photograph of a dog`) ||
      step("questL11Palindome") >= 3,
    do: $location`The Haunted Bedroom`,
    choices: {
      876: 1,
      877: 1,
      878: 4,
      879: 1,
      880: 1,
      897: 2,
    },
    combat: new CombatStrategy()
      .killHard($monster`animated ornate nightstand`)
      .banish(
        $monsters`animated mahogany nightstand, animated rustic nightstand, Wardröb nightstand, elegant animated nightstand`
      )
      .ignore($monster`tumbleweed`),
    parachute: $monster`animated ornate nightstand`,
    limit: { soft: 10 },
  },
  {
    name: "Open Ballroom",
    after: ["Gallery", "Bathroom", "Bedroom"],
    completed: () => step("questM21Dance") >= 3,
    priority: () => Priorities.Free,
    do: () => visitUrl("place.php?whichplace=manor2&action=manor2_ladys"),
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Finish Floor2",
    after: ["Open Ballroom"],
    completed: () => step("questM21Dance") >= 4,
    do: $location`The Haunted Ballroom`,
    limit: { turns: 1 },
  },
];

const ManorBasement: Task[] = [
  {
    name: "Ballroom Delay",
    after: ["Macguffin/Diary", "Finish Floor2"],
    completed: () => $location`The Haunted Ballroom`.turnsSpent >= 5 || step("questL11Manor") >= 1,
    do: $location`The Haunted Ballroom`,
    choices: { 90: 3, 106: 4, 921: 1 },
    limit: { turns: 5 },
    delay: 5,
  },
  {
    name: "Ballroom",
    after: ["Ballroom Delay"],
    completed: () => step("questL11Manor") >= 1,
    do: $location`The Haunted Ballroom`,
    outfit: { modifier: "-combat" },
    choices: { 90: 3, 106: 4, 921: 1 },
    limit: { soft: 10 },
  },
  {
    name: "Learn Recipe",
    after: ["Ballroom"],
    completed: () => get("spookyravenRecipeUsed") === "with_glasses",
    do: () => {
      visitUrl("place.php?whichplace=manor4&action=manor4_chamberwall");
      use($item`recipe: mortar-dissolving solution`);
    },
    outfit: { equip: $items`Lord Spookyraven's spectacles` },
    limit: { tries: 1 },
  },
  {
    name: "Wine Cellar",
    after: ["Learn Recipe"],
    prepare: () => tryPlayApriling("booze"),
    completed: () =>
      have($item`bottle of Chateau de Vinegar`) ||
      have($item`unstable fulminate`) ||
      have($item`wine bomb`) ||
      step("questL11Manor") >= 3,
    do: $location`The Haunted Wine Cellar`,
    outfit: () => {
      return {
        modifier: "item, booze drop",
        equip:
          have($item`Lil' Doctor™ bag`) && get("_otoscopeUsed") < 3 ? $items`Lil' Doctor™ bag` : [],
      };
    },
    choices: { 901: 2 },
    combat: new CombatStrategy()
      .macro(Macro.trySkill($skill`Otoscope`), $monster`possessed wine rack`)
      .killItem($monster`possessed wine rack`)
      .banish($monsters`mad wino, skeletal sommelier`),
    limit: { soft: 15 },
  },
  {
    name: "Laundry Room",
    after: ["Learn Recipe"],
    prepare: () => tryPlayApriling("food"),
    completed: () =>
      have($item`blasting soda`) ||
      have($item`unstable fulminate`) ||
      have($item`wine bomb`) ||
      step("questL11Manor") >= 3,
    do: $location`The Haunted Laundry Room`,
    outfit: () => {
      return {
        modifier: "item, food drop",
        equip:
          have($item`Lil' Doctor™ bag`) && get("_otoscopeUsed") < 3 ? $items`Lil' Doctor™ bag` : [],
      };
    },
    choices: { 891: 2 },
    combat: new CombatStrategy()
      .macro(Macro.trySkill($skill`Otoscope`), $monster`cabinet of Dr. Limpieza`)
      .killItem($monster`cabinet of Dr. Limpieza`)
      .banish($monsters`plaid ghost, possessed laundry press`),
    limit: { soft: 15 },
  },
  {
    name: "Fulminate",
    after: ["Wine Cellar", "Laundry Room"],
    completed: () =>
      have($item`unstable fulminate`) || have($item`wine bomb`) || step("questL11Manor") >= 3,
    do: () => create($item`unstable fulminate`),
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Boiler Room",
    after: ["Fulminate"],
    completed: () => have($item`wine bomb`) || step("questL11Manor") >= 3,
    prepare: () => {
      if (numericModifier("Monster Level") < 81) changeMcd(10);
      tuneSnapper($phylum`constructs`);
      restoreMp(200);
    },
    post: () => {
      if (currentMcd() > 0) changeMcd(0);
    },
    do: $location`The Haunted Boiler Room`,
    outfit: (): OutfitSpec => {
      const result = {
        equip: [$item`unstable fulminate`],
        modes: <Modes>{},
        familiar: $familiar`Red-Nosed Snapper`,
      };
      let ml_needed = 81 - 10; // -10 from MCD

      // Include effects
      for (const effect of getActiveEffects())
        ml_needed -= numericModifier(effect, "Monster Level");
      if (have($skill`Ur-Kel's Aria of Annoyance`) && !have($effect`Ur-Kel's Aria of Annoyance`))
        ml_needed -= Math.min(2 * myLevel(), 60);
      if (have($skill`Pride of the Puffin`) && !have($effect`Pride of the Puffin`)) ml_needed -= 10;
      if (have($skill`Drescher's Annoying Noise`) && !have($effect`Drescher's Annoying Noise`))
        ml_needed -= 10;

      // Include some equipment
      if (ml_needed > 0 && have($item`Jurassic Parka`) && have($skill`Torso Awareness`)) {
        result.equip.push($item`Jurassic Parka`);
        result.modes.parka = "spikolodon";
        ml_needed -= Math.min(3 * myLevel(), 33);
      }
      if (ml_needed > 0 && have($item`old patched suit-pants`)) {
        result.equip.push($item`old patched suit-pants`);
        ml_needed -= 40;
      }
      if (ml_needed > 0 && have($item`backup camera`)) {
        result.equip.push($item`backup camera`);
        result.modes.backupcamera = "ml";
        ml_needed -= Math.min(3 * myLevel(), 50);
      }

      if (ml_needed > 0) {
        return {
          ...result,
          modifier: "ML",
        };
      } else {
        return result;
      }
    },
    effects: $effects`Ur-Kel's Aria of Annoyance, Pride of the Puffin, Drescher's Annoying Noise`,
    choices: { 902: 2 },
    combat: new CombatStrategy()
      .kill($monster`monstrous boiler`)
      .banish($monsters`coaltergeist, steam elemental`),
    parachute: $monster`monstrous boiler`,
    limit: { soft: 10 },
  },
  {
    name: "Blow Wall",
    after: ["Boiler Room"],
    completed: () => step("questL11Manor") >= 3,
    do: () => visitUrl("place.php?whichplace=manor4&action=manor4_chamberwall"),
    limit: { tries: 1 },
    freeaction: true,
  },
];

export const ManorQuest: Quest = {
  name: "Manor",
  tasks: [
    {
      name: "Start",
      after: [],
      completed: () => step("questM20Necklace") >= 0,
      do: () => use($item`telegram from Lady Spookyraven`),
      limit: { tries: 1 },
      freeaction: true,
    },
    ...Manor1,
    ...Manor2,
    ...ManorBasement,
    {
      name: "Boss",
      after: ["Blow Wall"],
      completed: () => step("questL11Manor") >= 999,
      do: () => visitUrl("place.php?whichplace=manor4&action=manor4_chamberboss"),
      combat: new CombatStrategy().killHard(),
      limit: { tries: 1 },
      boss: true,
    },
  ],
};
