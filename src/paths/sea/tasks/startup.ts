import {
  $class,
  $classes,
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
  AugustScepter,
  BurningLeaves,
  Clan,
  ensureEffect,
  get,
  have,
  Leprecondo,
  MayamCalendar,
  Snapper,
  TakerSpace,
} from "libram";
import {
  autosell,
  buy,
  canAdventure,
  cliExecute,
  drink,
  Effect,
  equip,
  haveEffect,
  hippyStoneBroken,
  inHardcore,
  itemAmount,
  max,
  mpCost,
  myClass,
  myGardenType,
  myMp,
  pullsRemaining,
  restoreMp,
  Skill,
  turnsPerCast,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
import { Quest } from "../../../engine/task";
import { pull } from "../util";

export const StartupQuest: Quest = {
  name: "Startup",
  tasks: [
    {
      name: "Pulls",
      after: [],
      ready: () => !inHardcore(),
      completed: () => inHardcore() || pullsRemaining() < 20,
      do: () => {
        pull($item`pro skateboard`);
        pull($item`shark jumper`);
        pull($item`Flash Liquidizer Ultra Dousing Accessory`);
        pull($item`spooky VHS tape`);
        pull($item`sea lasso`);
        pull($item`sea cowbell`);
        pull($item`lodestone`);
        pull($item`Mer-kin pinkslip`);
        pull($item`stuffed yam stinkbomb`);
        pull($item`handful of split pea soup`);
        pull($item`anchor bomb`);
        pull($item`Platinum Yendorian Express Card`);
        pull($item`ink bladder`);
        pull($item`Mer-kin sneakmask`);
        pull($item`fishy pipe`);
        if (!have($item`Platinum Yendorian Express Card`)) {
          pull($item`minin' dynamite`);
        }
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Make tunac",
      completed: () => get("_floundryItemCreated"),
      do: () => cliExecute("acquire 1 tunac"),
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Swim Sprints",
      completed: () => get("_olympicSwimmingPool"),
      do: () => cliExecute("swim sprints"),
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Tune Snapper",
      ready: () => Snapper.have(),
      completed: () => Snapper.getTrackedPhylum() === $phylum`fish`,
      do: () => Snapper.trackPhylum($phylum`fish`),
      freeaction: true,
      limit: { soft: 1 },
    },
    {
      name: "Drink beer",
      after: [],
      ready: () => have($item`astral six-pack`) || have($item`astral pilsner`),
      completed: () => !have($item`astral six-pack`) && !have($item`astral pilsner`),
      do: () => {
        if (have($item`astral six-pack`)) use($item`astral six-pack`);
        while (have($item`astral pilsner`)) {
          if (!have($effect`Ode to Booze`)) {
            useSkill($skill`Ode to Booze`);
          }
          drink(1, $item`astral pilsner`);
        }
      },
      effects: $effects`Ode to Booze`,
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Summon Resort Pass",
      after: [],
      completed: () =>
        !have($skill`Summon Kokomo Resort Pass`) || !(get("_summonResortPassesUsed") === 0),
      do: () => {
        useSkill($skill`Summon Kokomo Resort Pass`); // TODO: Figure out how to use this up to the cap
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Sell Gems",
      after: ["Toot/Get Gems", "Summon Resort Pass"],
      completed: () =>
        !have($item`porquoise`) && !have($item`hamethyst`) && !have($item`baconstone`),
      do: () => {
        const stuff_to_sell = $items`hamethyst, baconstone, porquoise, Kokomo Resort Pass`;
        for (const item of stuff_to_sell) {
          if (have(item)) autosell(item, itemAmount(item));
        }
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Mayam Calendar",
      after: [],
      completed: () => !MayamCalendar.have() || MayamCalendar.remainingUses() === 0,
      do: () => {
        MayamCalendar.submit("vessel yam2 cheese explosion");
        MayamCalendar.submit("fur bottle wall clock");
        MayamCalendar.submit("eye meat yam3 yam4");
      },
      freeaction: true,
      limit: { soft: 11 },
      outfit: () => {
        if (have($familiar`Chest Mimic`))
          return { modifier: "mp", familiar: $familiar`Chest Mimic` };
        return { modifier: "mp", familiar: $familiar`red-nosed snapper` };
      },
    },
    {
      name: "TakerSpace",
      after: [],
      completed: () => !TakerSpace.have() || TakerSpace.installed(),
      do: () => {
        use($item`TakerSpace letter of Marque`);
        TakerSpace.make($item`anchor bomb`, 1);
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Leprecondo",
      after: [],
      completed: () => !Leprecondo.have() || Leprecondo.rearrangesRemaining() < 3,
      do: () => {
        Leprecondo.setFurniture(
          "high-end home workout system",
          "ultimate retro game console",
          "internet-connected laptop",
          "padded weight bench"
        );
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Grab Rakes",
      after: [],
      completed: () => !BurningLeaves.have() || have($item`rake`),
      do: () => {
        visitUrl("campground.php?preaction=leaves");
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Grab Scepter Items",
      after: [],
      completed: () => !AugustScepter.have() || AugustScepter.getAugustCast(24),
      do: () => {
        useSkill($skill`Aug. 24th: Waffle Day!`);
        // useSkill($skill`Aug. 18th: Serendipity Day!`);
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Set SIT Course",
      after: [],
      completed: () =>
        !have($item`S.I.T. Course Completion Certificate`) || have($skill`Psychogeologist`),
      do: () => {
        use($item`S.I.T. Course Completion Certificate`);
      },
      choices: { [1494]: 1 },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Guild Pants Unlock",
      after: [],
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
      limit: { soft: 11 },
      outfit: () => {
        return { pants: $item`tearaway pants` };
      },
    },
    {
      name: "Garden",
      after: [],
      completed: () => myGardenType() !== "rock" || have($item`milestone`),
      do: () => {
        cliExecute("garden pick");
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Censer Purchases",
      after: [],
      completed: () => !have($item`Sept-Ember Censer`) || get("availableSeptEmbers") <= 7,
      do: () => {
        visitUrl("shop.php?whichshop=september");
        // visitUrl("shop.php?whichshop=september&action=buyitem&quantity=3&whichrow=1513&pwd");
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Prepare Band",
      after: [],
      completed: () => !AprilingBandHelmet.have() || !AprilingBandHelmet.canJoinSection(),
      do: () => {
        AprilingBandHelmet.joinSection($item`Apriling band tuba`);
        AprilingBandHelmet.joinSection($item`Apriling band piccolo`);
        while (AprilingBandHelmet.canPlay($item`Apriling band piccolo`)) {
          AprilingBandHelmet.play($item`Apriling band piccolo`);
        }
      },
      freeaction: true,
      limit: { soft: 11 },
      outfit: () => {
        if (have($familiar`Chest Mimic`)) return { familiar: $familiar`Chest Mimic` };
        return { familiar: $familiar`red-nosed snapper` };
      },
    },
    {
      name: "Get Sheriff Equipment",
      after: [],
      completed: () => !have($item`Clan VIP Lounge key`) || get("_photoBoothEquipment", 0) >= 3,
      do: () => {
        Clan.with("Bonus Adventures from Hell", () => {
          cliExecute("photobooth item sheriff pistol");
          cliExecute("photobooth item sheriff moustache");
          cliExecute("photobooth item sheriff badge");
        });
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Talk to Old Man",
      after: [],
      completed: () => have($item`really, really nice swimming trunks`),
      do: () => {
        visitUrl("place.php?whichplace=sea_oldman&action=oldman_oldman");
        if (have($item`sushi-rolling mat`)) use($item`sushi-rolling mat`);
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Open Ski Set",
      after: [],
      completed: () => !have($item`McHugeLarge duffel bag`) || have($item`McHugeLarge right pole`),
      do: () => visitUrl("inventory.php?action=skiduffel&pwd"),
      outfit: { avoid: $items`McHugeLarge duffel bag` },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Shower",
      after: [],
      completed: () =>
        !have($item`April Shower Thoughts Shield`) ||
        get("_aprilShowerGlobsCollected") ||
        have($item`spitball`),
      do: () => {
        visitUrl("inventory.php?action=shower&pwd");
        visitUrl("shop.php?whichshop=showerthoughts");
        visitUrl("shop.php?whichshop=showerthoughts&action=buyitem&quantity=1&whichrow=1580&pwd");
      },
      freeaction: true,
      limit: { soft: 11 },
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
      limit: { soft: 11 },
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
      limit: { soft: 11 },
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
      limit: { soft: 11 },
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
      limit: { soft: 11 },
      outfit: { modifier: "mp", avoid: $items`April Shower Thoughts shield` },
    },
    {
      name: "Zirconia Buffs",
      after: [],
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
      limit: { soft: 11 },
      outfit: { acc1: $item`blood cubic zirconia` },
    },
    {
      name: "Alliedradio Boon",
      after: [],
      ready: () => have($item`Allied Radio Backpack`),
      completed: () => get("_alliedRadioWildsunBoon"),
      do: () => cliExecute("alliedradio effect boon"),
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Softcore Lighthouse",
      after: [],
      ready: () => AugustScepter.have(),
      completed: () => !AugustScepter.have() || !AugustScepter.canCast(7),
      do: () => {
        useSkill($skill`Aug. 7th: Lighthouse Day!`);
      },
      freeaction: true,
      limit: { soft: 11 },
    },
  ],
};
