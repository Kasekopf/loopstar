import {
  $class,
  $coinmaster,
  $effect,
  $effects,
  $familiar,
  $item,
  $items,
  $location,
  $phylum,
  $skill,
  AprilingBandHelmet,
  AsdonMartin,
  AugustScepter,
  BurningLeaves,
  Clan,
  CursedMonkeyPaw,
  ensureEffect,
  get,
  have,
  MayamCalendar,
  Snapper,
} from "libram";
import {
  autosell,
  buy,
  canAdventure,
  cliExecute,
  drink,
  Effect,
  guildStoreAvailable,
  inHardcore,
  itemAmount,
  myClass,
  myDaycount,
  myGardenType,
  pullsRemaining,
  Skill,
  storageAmount,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
import { Quest } from "../../../engine/task";
import { pull } from "../util";
import { args } from "../../../args";

export const StartupQuest: Quest = {
  name: "Startup",
  tasks: [
    {
      name: "Pulls",
      ready: () => !inHardcore(),
      completed: () => inHardcore() || pullsRemaining() < 20 || myDaycount() > 1,
      do: () => {
        // buyable items

        // pull only items
        pull($item`pro skateboard`);
        pull($item`shark jumper`);
        pull($item`Flash Liquidizer Ultra Dousing Accessory`);
        pull($item`Spooky VHS Tape`);
        pull($item`sea lasso`);
        pull($item`sea cowbell`);
        pull($item`lodestone`);
        pull($item`Mer-kin pinkslip`);
        pull($item`stuffed yam stinkbomb`);
        pull($item`handful of split pea soup`);
        pull($item`anchor bomb`);
        if (storageAmount($item`Platinum Yendorian Express Card`) >= 1)
          pull($item`Platinum Yendorian Express Card`);
        pull($item`ink bladder`);
        pull($item`Mer-kin sneakmask`);
        pull($item`fishy pipe`);
        if (!have($item`Platinum Yendorian Express Card`)) {
          pull($item`minin' dynamite`);
        }
        if (!args.resources.speed) {
          pull($item`scale-mail underwear`);
        }
      },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Make tunac",
      completed: () => get("_floundryItemCreated"),
      do: () => cliExecute("acquire 1 tunac"),
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Swim Sprints",
      completed: () => get("_olympicSwimmingPool"),
      do: () => cliExecute("swim sprints"),
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Tune Snapper",
      ready: () => Snapper.have(),
      completed: () => Snapper.getTrackedPhylum() === $phylum`fish`,
      do: () => Snapper.trackPhylum($phylum`fish`),
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Drink beer",
      ready: () => have($item`astral six-pack`) || have($item`astral pilsner`),
      completed: () => !have($item`astral six-pack`) && !have($item`astral pilsner`),
      do: () => {
        if (have($item`astral six-pack`)) use($item`astral six-pack`);
        while (have($item`astral pilsner`)) {
          if (!have($effect`Ode to Booze`)) {
            useSkill($skill`The Ode to Booze`);
          }
          drink(1, $item`astral pilsner`);
        }
      },
      effects: $effects`Ode to Booze`,
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Sell Gems",
      completed: () =>
        !have($item`porquoise`) && !have($item`hamethyst`) && !have($item`baconstone`),
      do: () => {
        const stuff_to_sell = $items`hamethyst, baconstone, porquoise, Kokomo Resort Pass`;
        for (const item of stuff_to_sell) {
          if (have(item)) autosell(item, itemAmount(item));
        }
      },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Mayam Calendar",
      completed: () => !MayamCalendar.have() || MayamCalendar.remainingUses() === 0,
      do: () => {
        MayamCalendar.submit("vessel yam2 cheese explosion");
        MayamCalendar.submit("fur bottle wall clock");
        MayamCalendar.submit("eye meat yam3 yam4");
      },
      freeaction: true,
      limit: { tries: 1 },
      outfit: () => {
        if (have($familiar`Chest Mimic`))
          return { modifier: "mp", familiar: $familiar`Chest Mimic` };
        return { modifier: "mp", familiar: $familiar`Pocket Professor` };
      },
    },
    {
      name: "Asdon",
      completed: () => !AsdonMartin.have() || AsdonMartin.installed(),
      do: () => {
        use($item`Asdon Martin keyfob (on ring)`);
      },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Grab Rakes",
      completed: () => !BurningLeaves.have() || have($item`rake`),
      do: () => {
        visitUrl("campground.php?preaction=leaves");
      },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Grab Scepter Items",
      completed: () => !AugustScepter.have() || AugustScepter.getAugustCast(24),
      do: () => {
        useSkill($skill`Aug. 24th: Waffle Day!`);
      },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Set SIT Course",
      completed: () =>
        !have($item`S.I.T. Course Completion Certificate`) || get("_sitCourseCompleted"),
      do: () => {
        use($item`S.I.T. Course Completion Certificate`);
      },
      choices: { 1494: 1 },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Guild Pants Unlock",
      ready: () => myClass() === $class`Accordion Thief` || myClass() === $class`Disco Bandit`,
      completed: () => !have($item`tearaway pants`) || canAdventure($location`The Unquiet Garves`),
      do: () => {
        visitUrl("guild.php?place=challenge");
        visitUrl("guild.php?place=scg");
        visitUrl("guild.php?place=scg");
        visitUrl("guild.php?place=ocg");
        visitUrl("guild.php?place=ocg");
        visitUrl("guild.php?place=paco");
      },
      freeaction: true,
      limit: { tries: 1 },
      outfit: () => {
        return { pants: $item`tearaway pants` };
      },
    },
    {
      name: "Unlock Guild",
      ready: () =>
        (myClass() !== $class`Accordion Thief` && myClass() !== $class`Disco Bandit`) ||
        !have($item`tearaway pants`),
      completed: () => guildStoreAvailable(),
      do: () => cliExecute("guild"),
      choices: {
        //sleazy back alley
        108: 4, //craps: skip
        109: 1, //drunken hobo: fight
        110: 4, //entertainer: skip
        112: 2, //harold's hammer: skip
        21: 2, //under the knife: skip
        //haunted pantry
        115: 1, //drunken hobo: fight
        116: 4, //singing tree: skip
        117: 1, //knob goblin chef: fight
        114: 2, //birthday cake: skip
        //outskirts of cobb's knob
        113: 2, //knob goblin chef: fight
        111: 3, //chain gang: fight
        118: 2, //medicine quest: skip
      },
      limit: { tries: 2 }, // Extra try in case of protopack weirdness
    },
    {
      name: "Garden",

      completed: () => myGardenType() !== "rock" || have($item`milestone`),
      do: () => {
        cliExecute("garden pick");
      },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Censer Purchases",

      completed: () => !have($item`Sept-Ember Censer`) || get("availableSeptEmbers") <= 7,
      do: () => {
        visitUrl("shop.php?whichshop=september");
      },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Prepare Band",
      completed: () => !AprilingBandHelmet.have() || !AprilingBandHelmet.canJoinSection(),
      do: () => {
        AprilingBandHelmet.joinSection($item`Apriling band tuba`);
        AprilingBandHelmet.joinSection($item`Apriling band piccolo`);
        while (AprilingBandHelmet.canPlay($item`Apriling band piccolo`)) {
          AprilingBandHelmet.play($item`Apriling band piccolo`);
        }
      },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Get Sheriff Equipment",
      completed: () => !have($item`Clan VIP Lounge key`) || get("_photoBoothEquipment", 0) >= 3,
      do: () => {
        Clan.with("Bonus Adventures from Hell", () => {
          cliExecute("photobooth item sheriff pistol");
          cliExecute("photobooth item sheriff moustache");
          cliExecute("photobooth item sheriff badge");
        });
      },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Talk to Old Man",
      completed: () => have($item`really, really nice swimming trunks`),
      do: () => {
        visitUrl("place.php?whichplace=sea_oldman&action=oldman_oldman");
        if (have($item`sushi-rolling mat`)) use($item`sushi-rolling mat`);
      },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Open Ski Set",
      completed: () => !have($item`McHugeLarge duffel bag`) || have($item`McHugeLarge right pole`),
      do: () => visitUrl("inventory.php?action=skiduffel&pwd"),
      outfit: { avoid: $items`McHugeLarge duffel bag` },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Shower",
      completed: () =>
        !have($item`April Shower Thoughts shield`) ||
        get("_aprilShowerGlobsCollected") ||
        have($item`spitball`),
      do: () => {
        visitUrl("inventory.php?action=shower&pwd");
        visitUrl("shop.php?whichshop=showerthoughts");
        visitUrl("shop.php?whichshop=showerthoughts&action=buyitem&quantity=1&whichrow=1580&pwd");
      },
      freeaction: true,
      limit: { tries: 1 },
      outfit: { avoid: $items`April Shower Thoughts shield` },
    },
    {
      name: "2002",
      after: ["Pulls"],
      completed: () => !have($item`2002 Mr. Store Catalog`) || get("_2002MrStoreCreditsCollected"),
      do: () => {
        use($item`2002 Mr. Store Catalog`);
        if (!have($item`Flash Liquidizer Ultra Dousing Accessory`)) {
          buy($coinmaster`Mr. Store 2002`, 1, $item`Flash Liquidizer Ultra Dousing Accessory`);
        }
        if (!have($item`pro skateboard`)) {
          buy($coinmaster`Mr. Store 2002`, 1, $item`pro skateboard`);
        }
        buy(
          $coinmaster`Mr. Store 2002`,
          get("availableMrStore2002Credits"),
          $item`Spooky VHS Tape`
        );
      },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Acquire shark jumper",
      completed: () => have($item`shark jumper`) || !CursedMonkeyPaw.have(),
      do: () => CursedMonkeyPaw.wishFor($item`shark jumper`),
      freeaction: true,
      limit: { tries: 1 },
    },
  ],
};

const aprilBuffs = new Map<Effect, Skill>([
  [$effect`Thoughtful Empathy`, $skill`Empathy of the Newt`],
  [$effect`Lubricating Sauce`, $skill`Sauce Contemplation`],
  [$effect`Tubes of Universal Meat`, $skill`Manicotti Meditation`],
  [$effect`Slippery as a Seal`, $skill`Seal Clubbing Frenzy`],
  [$effect`Strength of the Tortoise`, $skill`Patience of the Tortoise`],
  [$effect`Disco over Matter`, $skill`Disco Aerobics`],
  [$effect`Mariachi Moisture`, $skill`Moxie of the Mariachi`],
]);

const nonAprilBuffs = new Map<Effect, Skill>([
  [$effect`Empathy`, $skill`Empathy of the Newt`],
  [$effect`Elemental Saucesphere`, $skill`Elemental Saucesphere`],
  [$effect`Astral Shell`, $skill`Astral Shell`],
  [$effect`Leash of Linguini`, $skill`Leash of Linguini`],
  [$effect`Singer's Faithful Ocelot`, $skill`Singer's Faithful Ocelot`],
  [$effect`Springy Fusilli`, $skill`Springy Fusilli`],
  [$effect`Only Dogs Love a Drunken Sailor`, $skill`Only Dogs Love a Drunken Sailor`],
]);

export const BuffQuest: Quest = {
  name: "Starting Buffs",
  tasks: [
    {
      name: "Get Accordion",
      after: ["Startup/Sell Gems", "Startup/Mayam Calendar"],
      completed: () => have($item`antique accordion`),
      do: () => buy($item`antique accordion`),
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "April Buffs",
      after: ["Get Accordion"],
      completed: () => Array.from(aprilBuffs.keys()).every((effect) => have(effect)),
      do: () => {
        for (const effect of aprilBuffs.keys()) {
          if (!have(effect)) {
            ensureEffect(effect, 120);
          }
        }
      },
      freeaction: true,
      limit: {},
      outfit: { modifier: "mp", offhand: $item`April Shower Thoughts shield` },
    },
    {
      name: "Non-April Buffs",
      after: ["Get Accordion"],
      completed: () => Array.from(nonAprilBuffs.keys()).every((effect) => have(effect)),
      do: () => {
        for (const effect of nonAprilBuffs.keys()) {
          if (!have(effect)) {
            ensureEffect(effect, 150);
          }
        }
      },
      freeaction: true,
      limit: {},
      outfit: { modifier: "mp", avoid: $items`April Shower Thoughts shield` },
    },
    {
      name: "Zirconia Buffs",
      completed: () => !have($item`blood cubic zirconia`) || get("_bczSweatEquityCasts") > 0,
      do: () => {
        for (let i = 0; i < 3; i++) {
          useSkill($skill`BCZ: Sweat Equity`);
          useSkill($skill`BCZ: Dial it up to 11`);
          useSkill($skill`BCZ: Prepare Spinal Tapas`);
          useSkill($skill`BCZ: Craft a Pheromone Cocktail`);
          useSkill($skill`BCZ: Create Blood Thinner`);
        }
      },
      freeaction: true,
      limit: { tries: 1 },
      outfit: { acc1: $item`blood cubic zirconia` },
    },
    {
      name: "Alliedradio Boon",
      ready: () => have($item`Allied Radio Backpack`),
      completed: () => get("_alliedRadioWildsunBoon"),
      do: () => cliExecute("alliedradio effect boon"),
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Softcore Lighthouse",
      ready: () => AugustScepter.have(),
      completed: () => !AugustScepter.have() || !AugustScepter.canCast(7),
      do: () => {
        useSkill($skill`Aug. 7th: Lighthouse Day!`);
      },
      freeaction: true,
      limit: { tries: 1 },
    },
  ],
};
