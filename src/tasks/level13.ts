import {
  cliExecute,
  haveEquipped,
  myBuffedstat,
  myClass,
  myMaxmp,
  numericModifier,
  runChoice,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $effect,
  $effects,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $skill,
  $stat,
  BeachComb,
  ensureEffect,
  get,
  have,
  Macro,
} from "libram";
import { CombatStrategy } from "../engine/combat";
import { atLevel, tryWish } from "../lib";
import { Quest, Resources, Task } from "../engine/task";
import { step } from "grimoire-kolmafia";
import { customRestoreMp, ensureWithMPSwaps, fillHp } from "../engine/moods";
import { args } from "../args";

const Challenges: Task[] = [
  {
    name: "Speed Challenge",
    after: ["Start"],
    completed: () => get("nsContestants1") > -1,
    prepare: () => {
      if (numericModifier("Initiative") < 400 && have($skill`Silent Hunter`)) {
        if (myClass() === $class`Seal Clubber`) ensureWithMPSwaps($effects`Silent Hunting`);
        else ensureWithMPSwaps($effects`Nearly Silent Hunting`);
      }

      if (
        have($item`designer sweatpants`) &&
        get("sweat", 0) >= 90 &&
        numericModifier("Initiative") < 400
      ) {
        // Use visit URL to avoid needing to equip the pants
        visitUrl("runskillz.php?action=Skillz&whichskill=7419&targetplayer=0&pwd&quantity=1");
      }
    },
    do: (): void => {
      visitUrl("place.php?whichplace=nstower&action=ns_01_contestbooth");
      runChoice(1);
      runChoice(6);
    },
    outfit: { modifier: "init", familiar: $familiar`Oily Woim` },
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Moxie Challenge",
    after: ["Start"],
    ready: () => get("nsChallenge1") === $stat`Moxie`,
    completed: () => get("nsContestants2") > -1,
    prepare: () => {
      if (myBuffedstat($stat`Moxie`) < 600 && BeachComb.have())
        BeachComb.tryHead($effect`Pomp & Circumsands`);
      if (myBuffedstat($stat`Moxie`) < 600 && have($item`gummi canary`))
        ensureEffect($effect`Gummiskin`);
      if (myBuffedstat($stat`Moxie`) < 600 && have($item`gaffer's tape`))
        ensureEffect($effect`Gaffe Free`);
      if (myBuffedstat($stat`Moxie`) < 600 && have($item`runproof mascara`))
        ensureEffect($effect`Unrunnable Face`);
      if (myBuffedstat($stat`Moxie`) < 600 && have($item`Black No. 2`))
        ensureEffect($effect`Locks Like the Raven`);
      if (myBuffedstat($stat`Moxie`) < 600 && have($item`old bronzer`))
        ensureEffect($effect`Sepia Tan`);
      if (myBuffedstat($stat`Moxie`) < 600 && have($item`sugar-coated pine cone`))
        ensureEffect($effect`Antsy in your Pantsy`);
      if (myBuffedstat($stat`Moxie`) < 600 && have($item`white candy heart`))
        ensureEffect($effect`Heart of White`);
      if (myBuffedstat($stat`Moxie`) < 600 && have($item`yellow candy heart`))
        ensureEffect($effect`Heart of Yellow`);

      if (
        myBuffedstat($stat`Moxie`) < 600 &&
        have($item`Powerful Glove`) &&
        get("_powerfulGloveBatteryPowerUsed") <= 95
      )
        ensureEffect($effect`Triple-Sized`);
    },
    do: (): void => {
      visitUrl("place.php?whichplace=nstower&action=ns_01_contestbooth");
      runChoice(2);
      runChoice(6);
    },
    outfit: { modifier: "moxie" },
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Muscle Challenge",
    after: ["Start"],
    ready: () => get("nsChallenge1") === $stat`Muscle`,
    completed: () => get("nsContestants2") > -1,
    prepare: () => {
      if (myBuffedstat($stat`Muscle`) < 600 && BeachComb.have())
        BeachComb.tryHead(BeachComb.head.MUSCLE);
      if (
        myBuffedstat($stat`Muscle`) < 600 &&
        have($item`Powerful Glove`) &&
        get("_powerfulGloveBatteryPowerUsed") <= 95
      )
        ensureEffect($effect`Triple-Sized`);
    },
    do: (): void => {
      visitUrl("place.php?whichplace=nstower&action=ns_01_contestbooth");
      runChoice(2);
      runChoice(6);
    },
    outfit: { modifier: "muscle" },
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Mysticality Challenge",
    after: ["Start"],
    ready: () => get("nsChallenge1") === $stat`Mysticality`,
    completed: () => get("nsContestants2") > -1,
    prepare: () => {
      if (myBuffedstat($stat`Mysticality`) < 600 && BeachComb.have())
        BeachComb.tryHead(BeachComb.head.MYSTICALITY);
      if (
        myBuffedstat($stat`Mysticality`) < 600 &&
        have($item`Powerful Glove`) &&
        get("_powerfulGloveBatteryPowerUsed") <= 95
      )
        ensureEffect($effect`Triple-Sized`);
    },
    do: (): void => {
      visitUrl("place.php?whichplace=nstower&action=ns_01_contestbooth");
      runChoice(2);
      runChoice(6);
    },
    outfit: { modifier: "mysticality" },
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Hot Challenge",
    after: ["Start"],
    ready: () => get("nsChallenge2") === "hot",
    completed: () => get("nsContestants3") > -1,
    prepare: () => {
      if (
        BeachComb.available() &&
        numericModifier("Hot Damage") + numericModifier("Hot Spell Damage") < 100
      )
        BeachComb.tryHead("HOT");
      if (
        args.resources.speed &&
        numericModifier("Hot Damage") + numericModifier("Hot Spell Damage") < 100
      )
        tryWish($effect`Dragged Through the Coals`);
    },
    do: (): void => {
      visitUrl("place.php?whichplace=nstower&action=ns_01_contestbooth");
      runChoice(3);
      runChoice(6);
    },
    outfit: { modifier: "hot dmg, hot spell dmg" },
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Cold Challenge",
    after: ["Start"],
    ready: () => get("nsChallenge2") === "cold",
    completed: () => get("nsContestants3") > -1,
    prepare: () => {
      if (
        BeachComb.available() &&
        numericModifier("Cold Damage") + numericModifier("Cold Spell Damage") < 100
      )
        BeachComb.tryHead("COLD");
      if (
        args.resources.speed &&
        numericModifier("Cold Damage") + numericModifier("Cold Spell Damage") < 100
      )
        tryWish($effect`Staying Frosty`);
    },
    do: (): void => {
      visitUrl("place.php?whichplace=nstower&action=ns_01_contestbooth");
      runChoice(3);
      runChoice(6);
    },
    outfit: { modifier: "cold dmg, cold spell dmg" },
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Spooky Challenge",
    after: ["Start"],
    ready: () => get("nsChallenge2") === "spooky",
    completed: () => get("nsContestants3") > -1,
    prepare: () => {
      if (
        BeachComb.available() &&
        numericModifier("Spooky Damage") + numericModifier("Spooky Spell Damage") < 100
      )
        BeachComb.tryHead("SPOOKY");
      if (
        args.resources.speed &&
        numericModifier("Spooky Damage") + numericModifier("Spooky Spell Damage") < 100
      )
        tryWish($effect`Bored Stiff`);
    },
    do: (): void => {
      visitUrl("place.php?whichplace=nstower&action=ns_01_contestbooth");
      runChoice(3);
      runChoice(6);
    },
    outfit: { modifier: "spooky dmg, spooky spell dmg" },
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Stench Challenge",
    after: ["Start"],
    ready: () => get("nsChallenge2") === "stench",
    completed: () => get("nsContestants3") > -1,
    prepare: () => {
      if (
        BeachComb.available() &&
        numericModifier("Stench Damage") + numericModifier("Stench Spell Damage") < 100
      )
        BeachComb.tryHead("STENCH");
      if (
        args.resources.speed &&
        numericModifier("Stench Damage") + numericModifier("Stench Spell Damage") < 100
      )
        tryWish($effect`Sewer-Drenched`);
    },
    do: (): void => {
      visitUrl("place.php?whichplace=nstower&action=ns_01_contestbooth");
      runChoice(3);
      runChoice(6);
    },
    outfit: { modifier: "stench dmg, stench spell dmg" },
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Sleaze Challenge",
    after: ["Start"],
    ready: () => get("nsChallenge2") === "sleaze",
    completed: () => get("nsContestants3") > -1,
    prepare: () => {
      if (
        BeachComb.available() &&
        numericModifier("Sleaze Damage") + numericModifier("Sleaze Spell Damage") < 100
      )
        BeachComb.tryHead("SLEAZE");
      if (
        args.resources.speed &&
        numericModifier("Sleaze Damage") + numericModifier("Sleaze Spell Damage") < 100
      )
        tryWish($effect`Fifty Ways to Bereave Your Lover`);
    },
    do: (): void => {
      visitUrl("place.php?whichplace=nstower&action=ns_01_contestbooth");
      runChoice(3);
      runChoice(6);
    },
    outfit: { modifier: "sleaze dmg, sleaze spell dmg" },
    limit: { tries: 1 },
    freeaction: true,
  },
];

const ChallengeBosses: Task[] = [
  {
    name: "Speed Boss",
    after: ["Speed Challenge"],
    completed: () => get("nsContestants1") === 0,
    prepare: fillHp,
    do: $location`Fastest Adventurer Contest`,
    combat: new CombatStrategy().killHard(),
    limit: { tries: 5 },
    boss: true,
  },
  {
    name: "Stat Boss",
    after: ["Muscle Challenge", "Moxie Challenge", "Mysticality Challenge"],
    completed: () => get("nsContestants2") === 0,
    prepare: fillHp,
    do: $location`A Crowd of (Stat) Adventurers`,
    combat: new CombatStrategy().killHard(),
    limit: { tries: 10 },
    boss: true,
  },
  {
    name: "Element Boss",
    after: [
      "Hot Challenge",
      "Cold Challenge",
      "Spooky Challenge",
      "Stench Challenge",
      "Sleaze Challenge",
    ],
    completed: () => get("nsContestants3") === 0,
    prepare: fillHp,
    do: $location`A Crowd of (Element) Adventurers`,
    combat: new CombatStrategy().killHard(),
    limit: { tries: 10 },
    boss: true,
  },
];

const Door: Task[] = [
  {
    name: "Boris Lock",
    after: ["Maze", "Keys/All Heroes"],
    acquire: [{ item: $item`Boris's key` }],
    completed: () => get("nsTowerDoorKeysUsed").includes("Boris"),
    do: () => visitUrl("place.php?whichplace=nstower_door&action=ns_lock1"),
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Jarlsberg Lock",
    after: ["Maze", "Keys/All Heroes"],
    acquire: [{ item: $item`Jarlsberg's key` }],
    completed: () => get("nsTowerDoorKeysUsed").includes("Jarlsberg"),
    do: () => visitUrl("place.php?whichplace=nstower_door&action=ns_lock2"),
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Sneaky Pete Lock",
    after: ["Maze", "Keys/All Heroes"],
    acquire: [{ item: $item`Sneaky Pete's key` }],
    completed: () => get("nsTowerDoorKeysUsed").includes("Sneaky Pete"),
    do: () => visitUrl("place.php?whichplace=nstower_door&action=ns_lock3"),
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Star Lock",
    after: ["Maze", "Keys/Star Key"],
    acquire: [{ item: $item`Richard's star key` }],
    completed: () => get("nsTowerDoorKeysUsed").includes("Richard's star key"),
    do: () => visitUrl("place.php?whichplace=nstower_door&action=ns_lock4"),
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Digital Lock",
    after: ["Maze", "Digital/Key"],
    completed: () => get("nsTowerDoorKeysUsed").includes("digital key"),
    do: () => visitUrl("place.php?whichplace=nstower_door&action=ns_lock5"),
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Skeleton Lock",
    after: ["Maze", "Keys/Skeleton Key"],
    acquire: [{ item: $item`skeleton key` }],
    completed: () => get("nsTowerDoorKeysUsed").includes("skeleton key"),
    do: () => visitUrl("place.php?whichplace=nstower_door&action=ns_lock6"),
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Door",
    after: [
      "Boris Lock",
      "Jarlsberg Lock",
      "Sneaky Pete Lock",
      "Star Lock",
      "Digital Lock",
      "Skeleton Lock",
    ],
    completed: () => step("questL13Final") > 5,
    do: () => visitUrl("place.php?whichplace=nstower_door&action=ns_doorknob"),
    limit: { tries: 1 },
    freeaction: true,
  },
];

const wand: Task[] = [
  {
    name: "Wand W",
    after: ["Wall of Bones"],
    ready: () =>
      !have($item`11-leaf clover`) && !have($skill`Aug. 2nd: Find an Eleven-Leaf Clover Day`),
    completed: () => have($item`ruby W`) || have($item`WA`) || have($item`Wand of Nagamar`),
    do: $location`Pandamonium Slums`,
    outfit: { modifier: "item" },
    combat: new CombatStrategy().killItem($monster`W imp`),
    limit: { soft: 20 },
  },
  {
    name: "Wand A",
    after: ["Wall of Bones"],
    ready: () =>
      !have($item`11-leaf clover`) && !have($skill`Aug. 2nd: Find an Eleven-Leaf Clover Day`),
    completed: () => have($item`metallic A`) || have($item`WA`) || have($item`Wand of Nagamar`),
    do: $location`The Penultimate Fantasy Airship`,
    outfit: { modifier: "item" },
    combat: new CombatStrategy().killItem($monster`MagiMechTech MechaMech`),
    limit: { soft: 20 },
  },
  {
    name: "Wand N",
    after: ["Wall of Bones"],
    ready: () =>
      !have($item`11-leaf clover`) && !have($skill`Aug. 2nd: Find an Eleven-Leaf Clover Day`),
    completed: () => have($item`lowercase N`) || have($item`ND`) || have($item`Wand of Nagamar`),
    do: $location`The Valley of Rof L'm Fao`,
    outfit: { modifier: "item" },
    combat: new CombatStrategy().killItem($monster`XXX pr0n`),
    limit: { soft: 20 },
  },
  {
    name: "Wand D",
    after: ["Wall of Bones"],
    ready: () =>
      !have($item`11-leaf clover`) && !have($skill`Aug. 2nd: Find an Eleven-Leaf Clover Day`),
    completed: () => have($item`heavy D`) || have($item`ND`) || have($item`Wand of Nagamar`),
    do: $location`The Castle in the Clouds in the Sky (Basement)`,
    outfit: { modifier: "item" },
    combat: new CombatStrategy().killItem($monster`Alphabet Giant`),
    limit: { soft: 20 },
  },
  {
    name: "Wand Parts",
    after: ["Wall of Bones"],
    completed: () =>
      have($item`Wand of Nagamar`) ||
      ((have($item`WA`) || (have($item`ruby W`) && have($item`metallic A`))) &&
        (have($item`ND`) || (have($item`lowercase N`) && have($item`heavy D`)))),
    do: $location`The Castle in the Clouds in the Sky (Basement)`,
    resources: {
      which: Resources.Lucky,
      benefit: 6,
      required: true,
    },
    limit: { tries: 1 },
  },
  {
    name: "Wand",
    after: ["Wand W", "Wand A", "Wand N", "Wand D", "Wand Parts"],
    completed: () => have($item`Wand of Nagamar`),
    do: () => {
      cliExecute("make Wand of Nagamar");
    },
    limit: { tries: 1 },
  },
];

export const TowerQuest: Quest = {
  name: "Tower",
  tasks: [
    {
      name: "Start",
      after: [
        "Mosquito/Finish",
        "Tavern/Finish",
        "Bat/Finish",
        "Knob/King",
        "Friar/Finish",
        "Crypt/Finish",
        "McLargeHuge/Finish",
        "Orc Chasm/Finish",
        "Giant/Finish",
        "Macguffin/Finish",
        "War/Boss Hippie",
      ],
      ready: () => atLevel(13),
      completed: () => step("questL13Final") !== -1,
      do: () => visitUrl("council.php"),
      limit: { tries: 1 },
      freeaction: true,
    },
    ...Challenges,
    ...ChallengeBosses,
    {
      name: "Coronation",
      after: ["Speed Boss", "Stat Boss", "Element Boss"],
      completed: () => step("questL13Final") > 2,
      do: (): void => {
        visitUrl("place.php?whichplace=nstower&action=ns_01_contestbooth");
        runChoice(-1);
      },
      choices: { 1003: 4 },
      limit: { tries: 1 },
    },
    {
      name: "Frank",
      after: ["Coronation"],
      completed: () => step("questL13Final") > 3,
      do: (): void => {
        visitUrl("place.php?whichplace=nstower&action=ns_02_coronation");
        runChoice(-1);
      },
      choices: { 1020: 1, 1021: 1, 1022: 1 },
      limit: { tries: 1 },
    },
    {
      name: "Maze",
      after: ["Frank"],
      completed: () => step("questL13Final") > 4,
      prepare: () => {
        fillHp();
      },
      do: $location`The Hedge Maze`,
      choices: { 1004: 1, 1005: 2, 1008: 2, 1011: 2, 1013: 1, 1022: 1 },
      outfit: {
        modifier: "hot res, cold res, stench res, spooky res, sleaze res",
        familiar: $familiar`Exotic Parrot`,
      },
      effects: $effects`Red Door Syndrome`,
      limit: { tries: 1 },
    },
    ...Door,
    {
      name: "Beehive",
      after: ["Macguffin/Forest"],
      completed: () =>
        have($item`beehive`) ||
        (have($familiar`Shorter-Order Cook`) && have($item`June cleaver`)) ||
        step("questL13Final") > 6,
      do: $location`The Black Forest`,
      choices: {
        923: 1,
        924: 3,
        1018: 1,
        1019: 1,
      },
      outfit: { modifier: "-combat" },
      limit: { soft: 5 },
    },
    {
      name: "Wall of Skin",
      after: ["Door", "Beehive"],
      prepare: () => {
        if (have($item`handful of hand chalk`)) ensureEffect($effect`Chalky Hand`);
        fillHp();
      },
      completed: () => step("questL13Final") > 6,
      do: $location`Tower Level 1`,
      outfit: {
        familiar: $familiar`Shorter-Order Cook`,
        equip: $items`hot plate, June cleaver, bottle opener belt buckle`,
      },
      combat: new CombatStrategy()
        .macro(
          new Macro()
            .tryItem($item`beehive`)
            .attack()
            .repeat()
        )
        .kill(),
      boss: true,
      limit: { tries: 1 },
    },
    {
      name: "Wall of Meat",
      after: ["Wall of Skin"],
      prepare: () => {
        fillHp();
      },
      completed: () => step("questL13Final") > 7,
      do: $location`Tower Level 2`,
      outfit: () => {
        if (have($familiar`Trick-or-Treating Tot`) && have($item`li'l pirate costume`)) {
          return {
            modifier: "meat",
            familiar: $familiar`Trick-or-Treating Tot`,
            equip: $items`li'l pirate costume, June cleaver`,
          };
        }
        return {
          modifier: "meat",
          equip: $items`amulet coin, June cleaver`, // Use amulet coin (if we have) to avoid using orb
        };
      },
      combat: new CombatStrategy().killHard(),
      boss: true,
      limit: { tries: 2 },
    },
    {
      name: "Wall of Bones",
      after: ["Wall of Meat", "Giant/Ground Knife"],
      completed: () => step("questL13Final") > 8,
      acquire: [
        { item: $item`meteorb`, optional: true, useful: () => have($item`metal meteoroid`) },
      ],
      prepare: () => {
        if (have($item`electric boning knife`)) return;
        if (haveEquipped($item`Great Wolf's rocket launcher`)) {
          if (myBuffedstat($stat`moxie`) < 1000) ensureEffect($effect`Cock of the Walk`);
          if (myBuffedstat($stat`moxie`) < 1000) ensureEffect($effect`Superhuman Sarcasm`);
          if (myBuffedstat($stat`moxie`) < 1000) ensureEffect($effect`Gr8ness`);
        }
        fillHp();
        customRestoreMp(Math.min(200, myMaxmp()));
      },
      do: $location`Tower Level 3`,
      outfit: () => {
        if (have($item`electric boning knife`)) return {};
        if (have($skill`Garbage Nova`))
          return {
            modifier: "spell dmg, myst",
            equip: $items`meteorb, unwrapped knock-off retro superhero cape`,
            modes: { retrocape: ["heck", "kill"] },
            familiar: $familiar`none`, // Familiar actions can cause wall of bones to heal
          };
        if (have($item`Great Wolf's rocket launcher`))
          return { equip: $items`Great Wolf's rocket launcher`, modifier: "moxie" };
        return {};
      },
      combat: new CombatStrategy().macro(() => {
        if (have($item`electric boning knife`)) return Macro.item($item`electric boning knife`);
        if (have($skill`Garbage Nova`)) return Macro.skill($skill`Garbage Nova`).repeat();
        if (haveEquipped($item`Great Wolf's rocket launcher`))
          return Macro.skill($skill`Fire Rocket`);
        throw `Unable to find way to kill Wall of Bones`;
      }),
      boss: true,
      limit: { tries: 1 },
    },
    ...wand,
    {
      name: "Mirror",
      after: ["Wall of Bones", "Wand"],
      completed: () => step("questL13Final") > 9,
      do: $location`Tower Level 4`,
      choices: { 1015: 2 },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Shadow",
      after: ["Mirror"],
      prepare: () => fillHp(),
      completed: () => step("questL13Final") > 10,
      do: $location`Tower Level 5`,
      outfit: () => ({
        equip: $items`unwrapped knock-off retro superhero cape, Jurassic Parka, attorney's badge`,
        modes: {
          parka: "kachungasaur",
          retrocape: ["heck", "hold"],
        },
        modifier: "HP",
        avoid: $items`extra-wide head candle`,
      }),
      combat: new CombatStrategy().macro(new Macro().item($item`gauze garter`).repeat()),
      boss: true,
      limit: { tries: 1 },
    },
    {
      name: "Naughty Sorceress",
      after: ["Shadow"],
      completed: () => step("questL13Final") > 11,
      do: $location`The Naughty Sorceress' Chamber`,
      outfit: { modifier: "muscle", equip: $items`June cleaver` },
      combat: new CombatStrategy()
        .macro(() => Macro.externalIf(haveEquipped($item`June cleaver`), Macro.attack().repeat()))
        .kill(),
      boss: true,
      limit: { tries: 1 },
    },
  ],
};
