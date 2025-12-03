import {
  $class,
  $coinmaster,
  $effect,
  $effects,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $monsters,
  $path,
  $skill,
  $stat,
  AprilingBandHelmet,
  ChestMimic,
  ensureEffect,
  get,
  getActiveSongs,
  getSongCount,
  getSongLimit,
  have,
  Macro,
  set,
  uneffect,
} from "libram";
import { Quest, ResourceRequest, Resources } from "../../engine/task";
import {
  abort,
  banishedBy,
  buy,
  canAdventure,
  cliExecute,
  drink,
  Effect,
  equip,
  inHardcore,
  Location,
  monkeyPaw,
  myClass,
  myMaxhp,
  myMp,
  myPath,
  myPrimestat,
  pullsRemaining,
  restoreHp,
  retrieveItem,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
import { CombatStrategy } from "../../engine/combat";
import { OutfitSpec, step } from "grimoire-kolmafia";

export const SeaQuest: Quest = {
  name: "The Sea",
  tasks: [
    {
      name: "Start",
      ready: () => get("kingLiberated") || myPath() === $path`11038 Leagues Under the Sea`,
      completed: () => get("questS01OldGuy") === "started",
      do: (): void => {
        retrieveItem($item`Spooky VHS Tape`, 1);
        retrieveItem($item`pro skateboard`, 1);
        retrieveItem($item`Flash Liquidizer Ultra Dousing Accessory`, 1);
        use($item`wardrobe-o-matic`);
        visitUrl("place.php?whichplace=sea_oldman&action=oldman_oldman"); // idk the visitUrls yet
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Pulls",
      ready: () => !inHardcore(),
      completed: () => inHardcore() || pullsRemaining() < 20,
      do: () => {
        cliExecute("pull pro skateboard");
        cliExecute("pull shark jumper");
        // cliExecute("pull scale-mail underwear");
        cliExecute("pull Flash Liquidizer Ultra Dousing Accessory");
        cliExecute("pull spooky VHS tape");
        cliExecute("pull groveling gravel");
        // cliExecute("pull mer-kin healscroll");
        // cliExecute("pull mer-kin killscroll");
        cliExecute("pull sea lasso");
        cliExecute("pull sea cowbell");
        cliExecute("pull lodestone");
        cliExecute("pull mer-kin pinkslip");
        cliExecute("pull stuffed yam stinkbomb");
        cliExecute("pull handful of split pea soup");
        cliExecute("pull anchor bomb");
        cliExecute("pull phosphor traces");
        cliExecute("pull Platinum Yendorian Express Card");
        cliExecute("pull ink bladder");
        cliExecute("pull Mer-kin sneakmask");
        if (!have($item`Platinum Yendorian Express Card`)) {
          cliExecute("pull minin' dynamite");
        }
      },
      limit: { tries: 1 },
      freeaction: true,
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
            useSkill($skill`The Ode to Booze`);
          }
          drink(1, $item`astral pilsner`);
        }
      },
      effects: $effects`Ode to Booze`,
      limit: { tries: 1 },
      freeaction: true,
    },
    // get shadow bricks
    {
      name: "Get Fishy",
      after: ["The Sea/Start"],
      prepare: () => {
        use($item`Black and White Apron Meal Kit`);
      }, // ensure fishy
      completed: () => get("questS02Monkees") !== "unstarted",
      do: () => {
        use($item`Black and White Apron Meal Kit`);
        visitUrl("choice.php?pwd&whichchoice=1518&option=1&meal=1&ingredients1[]=2524");
      },
      limit: { tries: 10 },
      outfit: {}, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Sea Garden",
      after: ["The Sea/Get Fishy"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
        retrieveItem($item`really, really nice swimming trunks`, 1);
      }, // ensure fishy
      completed: () => have($item`wriggling flytrap pellet`),
      do: $location`An Octopus's Garden`,
      limit: { tries: 10 },
      peridot: $monster`Neptune flytrap`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.trySkill($skill`%fn, fire a Red, White and Blue Blast`)
            .trySkill($skill`%fn, let's pledge allegiance to a Zone`)
            .trySkill($skill`McHugeLarge Avalanche`);
        })
        .killFree(),
      outfit: {
        familiar: $familiar`Patriotic Eagle`,
        equip: $items`Everfull Dart Holster, McHugeLarge left ski, Peridot of Peril, April Shower Thoughts shield`,
      },
      freeaction: false,
    },
    {
      name: "Visit Castle",
      after: ["The Sea/Sea Garden"],
      prepare: () => {
        use($item`wriggling flytrap pellet`);
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => get("questS02Monkees") !== "unstarted",
      do: () => {
        visitUrl("monkeycastle.php?who=1");
      },
      limit: { tries: 1 },

      outfit: { pants: $item`really, really nice swimming trunks` }, // Ensure we can breath water
      freeaction: true,
    },
    {
      name: "Rescue Brother",
      after: ["The Sea/Visit Castle"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => get("bigBrotherRescued"),
      do: $location`The Wreck of the Edgar Fitzsimmons`,
      choices: { 299: 1 },
      limit: { tries: 10 },

      outfit: { pants: $item`really, really nice swimming trunks`, modifier: "-com" }, // Ensure we can breath water
      resources: () =>
        <ResourceRequest>{
          which: Resources.NCForce,
          benefit: 8,
        },
      freeaction: false,
    },
    {
      name: "Big Brother Shopping",
      after: ["The Sea/Rescue Brother"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => have($item`fishy pipe`),
      do: () => {
        visitUrl("monkeycastle.php?who=1");
        visitUrl("monkeycastle.php?who=2");
        visitUrl("monkeycastle.php?who=1");
        retrieveItem($item`bubblin' stone`);
        // do skate park unlock
      },
      limit: { tries: 10 },

      outfit: { pants: $item`really, really nice swimming trunks` }, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Kill Miner",
      ready: () => step("questS02Monkees") >= 4,
      completed: () => have($item`Mer-kin digpick`),
      do: $location`Anemone Mine`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.step("pickpocket");
        })
        .killFree(),
      outfit: {
        modifier: "item",
        equip: $items`Monodent of the Sea, Everfull Dart Holster, spring shoes, Peridot of Peril, prismatic beret, shark jumper, toy Cupid bow`,
        familiar: $familiar`Grouper Groupie`,
      },
      peridot: $monster`Mer-kin miner`,
      limit: { tries: 1 },
      freeaction: false,
    },
    {
      name: "Manual Mining",
      ready: () => have($item`Mer-kin digpick`),
      completed: () =>
        have($item`teflon ore`) ||
        have($item`teflon swim fins`) ||
        have($item`crappy Mer-kin tailpiece`) ||
        have($item`Mer-kin scholar tailpiece`) ||
        have($item`Mer-kin gladiator tailpiece`),
      do: () => {
        // Mining logic not implemented yet
        abort();
      },
      outfit: {
        equip: $items`Mer-kin digpick`,
        avoid: $items`Peridot of Peril`,
      },
      limit: { tries: 1 },
      freeaction: false,
    },
    {
      name: "Dive Bar Noncombats",
      after: ["Manual Mining"],
      ready: () => step("questS02Monkees") >= 4,
      completed: () => myClass() !== $class`Accordion Thief` || step("questS02Monkees") >= 5,
      prepare: () => {
        if (AprilingBandHelmet.have()) {
          AprilingBandHelmet.conduct("Apriling Band Patrol Beat");
        }
      },
      do: $location`The Dive Bar`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.step("pickpocket").if_(
            "monstername nurse shark",
            Macro.trySkill($skill`Sea *dent: Throw a Lightning Bolt`)
          );
        })
        .killHard($monster`time cop`)
        .killFree(),
      outfit: {
        modifier: "-combat",
        equip: $items`Apriling band tuba, Everfull Dart Holster, McHugeLarge left ski, Möbius ring, shark jumper, bat wings, little bitty bathysphere`,
        familiar: $familiar`Peace Turkey`,
      },
      limit: { tries: 1 },
      freeaction: false,
    },
    {
      name: "Outpost Unlock",
      after: ["Dive Bar Noncombats"],
      completed: () => step("questS02Monkees") >= 6,
      do: () => {
        cliExecute("grandpa wife");
      },
      outfit: {
        pants: $item`really, really nice swimming trunks`,
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Outpost Freerun",
      after: ["Outpost Unlock"],
      completed: () => get("_autosea_didfreerun", false) || have($item`Mer-kin lockkey`),
      ready: () => !have($effect`Everything Looks Green`),
      do: $location`The Mer-Kin Outpost`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.step("pickpocket")
            .trySkill($skill`Darts: Throw at %part1`)
            .trySkill($skill`Spring Away`);
        }, $monsters`Mer-kin burglar, Mer-kin raider, Mer-kin healer`)
        .macro((): Macro => {
          return Macro.trySkill($skill`Darts: Throw at %part1`).trySkillRepeat($skill`Shieldbutt`);
        }, $monster`time cop`),
      post: () => {
        if (have($effect`Everything Looks Green`)) {
          set("_autosea_didfreerun", true);
        }
      },
      outfit: {
        equip: $items`Everfull Dart Holster, Möbius ring, spring shoes, little bitty bathysphere, Monodent of the Sea, April Shower Thoughts shield`,
        familiar: $familiar`Peace Turkey`,
      },
      limit: { tries: 1 },
      freeaction: false,
    },
    {
      name: "Run Crayon Egg",
      after: ["Generate Crayon Egg"],
      completed: () => get("_monsterHabitatsRecalled") > 0,
      do: () => {
        ChestMimic.differentiate($monster`Black Crayon Mer-kin`);
      },
      combat: new CombatStrategy().macro((): Macro => {
        return Macro.step("pickpocket")
          .trySkill($skill`Darts: Throw at %part1`)
          .trySkill($skill`%fn, lay an egg`)
          .trySkill($skill`Recall Facts: Monster Habitats`)
          .trySkill($skill`Recall Facts: %phylum Circadian Rhythms`)
          .trySkill($skill`Transcendent Olfaction`)
          .trySkill($skill`McHugeLarge Slash`)
          .trySkill($skill`Lunging Thrust-Smack`)
          .repeat();
      }),
      outfit: {
        equip: $items`Monodent of the Sea, McHugeLarge left pole, toy Cupid bow, spring shoes, Everfull Dart Holster`,
        familiar: $familiar`Chest Mimic`,
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Candelabra Egg",
      after: ["Run Crayon Egg"],
      completed: () =>
        get("_monsterHabitatsRecalled") > 1 ||
        get("_monsterHabitatsFightsLeft") === 0 ||
        get("_unblemishedPearlTheBriniestDeepests", false) ||
        have($effect`Everything Looks Purple`) ||
        !have($item`Roman Candelabra`),
      do: $location`The Briniest Deepests`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.step("pickpocket").trySkill("Blow the Purple Candle!");
        }, $monsters`Black Crayon Mer-kin`)
        .macro((): Macro => {
          return Macro.trySkill("Sea *dent: Throw a Lightning Bolt");
        }, $monsters`acoustic electric eel, decent white shark, ganger`)
        .kill(),
      outfit: {
        equip: $items`Everfull Dart Holster, Möbius ring, spring shoes, little bitty bathysphere, Monodent of the Sea, Roman Candelabra, shark jumper, bat wings, prismatic beret`,
        familiar: $familiar`Peace Turkey`,
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Rescue Grandpa",
      after: ["The Sea/Big Brother Shopping"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => get("questS02Monkees") === "step5",
      do:
        myPrimestat === $stat`Muscle`
          ? $location`Anemone Mine`
          : myPrimestat === $stat`Mysticality`
            ? $location`The Marinara Trench`
            : $location`The Dive Bar`,
      limit: { tries: 10 },
      outfit: { pants: $item`really, really nice swimming trunks`, modifier: "-combat" }, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Grandma Unlock",
      after: ["The Sea/Rescue Grandpa"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => canAdventure($location`The Mer-Kin Outpost`),
      do: () => {
        visitUrl("monkeycastle.php?action=grandpastory&topic=mom");
        visitUrl("monkeycastle.php?action=grandpastory&topic=Grandma");
      },
      limit: { tries: 1 },
      outfit: { pants: $item`really, really nice swimming trunks` }, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Rescue Grandma",
      after: ["The Sea/Grandma Unlock"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => get("questS02Monkees") === "step9",
      choices: { 695: 1 },
      do: $location`The Mer-Kin Outpost`,
      limit: { tries: 10 },

      outfit: { pants: $item`really, really nice swimming trunks`, modifier: "-combat" }, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Mom Unlock",
      after: ["The Sea/Rescue Grandma"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => get("questS02Monkees") === "step12",
      do: () => {
        visitUrl("monkeycastle.php?who=1");
        visitUrl("monkeycastle.php?who=2");
        retrieveItem($item`black glass`);
      },
      post: () => {
        visitUrl("monkeycastle.php?action=grandpastory&topic=mom");
        visitUrl("monkeycastle.php?action=grandpastory&topic=dad");
        visitUrl("monkeycastle.php?action=grandpastory&topic=dog");
      },
      limit: { tries: 10 },
      outfit: {}, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Skate Park Start",
      after: ["The Sea/Mom Unlock"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => have($item`skate blade`),
      do: $location`The Skate Park`,
      choices: { 403: 1 },
      limit: { tries: 1 },
      outfit: {}, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Skate Park Finish",
      after: ["The Sea/Skate Park Start"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => have($item`skate blade`),
      do: $location`The Skate Park`,
      choices: { 403: 1 },
      limit: { tries: 1 },
      outfit: { equip: $items`skate blade` }, // Ensure we can breath water
      resources: () =>
        <ResourceRequest>{
          which: Resources.NCForce,
          benefit: 8,
          repeat: 3,
        },
      //post: visit lutz?
      freeaction: false,
    },
    {
      name: "Rescue Mom",
      after: ["The Sea/Mom Unlock"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
        if (have($item`comb jelly`)) use($item`comb jelly`);
      }, // ensure fishy
      completed: () => get("questS02Monkees") === "finished",
      do: $location`The Caliginous Abyss`,
      limit: { tries: 28 },

      outfit: {
        pants: $item`really, really nice swimming trunks`,
        shirt: $item`shark jumper`,
        equip: $items`black glass`,
      }, // Ensure we can breath water
      freeaction: false,
      delay: 28,
    },
    {
      name: "Outpost Refract",
      after: ["Mimic diver"],
      ready: () => get("_bczRefractedGazeCasts", 0) < 12,
      completed: () =>
        have($item`Mer-kin lockkey`) ||
        have($item`Mer-kin trailmap`) ||
        have($item`Mer-kin hidepaint`) ||
        get("corralUnlocked") ||
        banishedBy($monster`Mer-kin burglar`).length > 0,
      do: $location`The Mer-Kin Outpost`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.ifNot(
            "monstername time cop",
            Macro.trySkill($skill`Sea *dent: Talk to Some Fish`)
          ).skill($skill`BCZ: Refracted Gaze`);
        })
        .killHard($monsters`time cop`)
        .killFree(),
      outfit: {
        modifier: "item",
        equip: $items`Everfull Dart Holster, Monodent of the Sea, toy Cupid bow, blood cubic zirconia, Möbius ring`,
        familiar: $familiar`Grouper Groupie`,
      },
      freeaction: false,
      limit: { tries: 1 },
    },
    {
      name: "Finish Mer-kin outpost",
      after: ["The Sea/Rescue Grandma"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => have($item`Mer-kin lockkey`) && have($item`Mer-kin stashbox`),
      do: $location`The Mer-Kin Outpost`,
      limit: { tries: 10 },
      delay: 26,
      outfit: { pants: $item`really, really nice swimming trunks` }, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Stashbox Trailmap",
      ready: () => have($item`Mer-kin stashbox`) || have($item`Mer-kin trailmap`),
      completed: () => get("corralUnlocked"),
      do: () => {
        if (have($item`Mer-kin stashbox`)) use($item`Mer-kin stashbox`);
        if (have($item`Mer-kin trailmap`)) use($item`Mer-kin trailmap`);
        cliExecute("grandpa currents");
      },
      outfit: {
        equip: [$item`really, really nice swimming trunks`],
        familiar: $familiar`Grouper Groupie`,
      },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Spend sand dollars",
      after: ["Corral Refract"],
      ready: () => have($item`sand dollar`, 50) || have($item`damp old boot`),
      completed: () => have($item`black glass`) && step("questS01OldGuy") === 999,
      do: () => {
        visitUrl("monkeycastle.php?who=1");
        visitUrl("monkeycastle.php?who=2");
        if (!have($item`black glass`) && have($item`sand dollar`, 13)) {
          buy($coinmaster`Big Brother`, 1, $item`black glass`);
        }
        if (!have($item`damp old boot`) && step("questS01OldGuy") < 999) {
          buy($coinmaster`Big Brother`, 1, $item`damp old boot`);
        }
        if (have($item`damp old boot`)) {
          visitUrl("place.php?whichplace=sea_oldman&action=oldman_oldman");
          if (have($item`sand dollar`, 10)) {
            visitUrl(
              "place.php?whichplace=sea_oldman&action=oldman_oldman&preaction=pickreward&whichreward=3609",
              true
            );
          } else {
            visitUrl(
              "place.php?whichplace=sea_oldman&action=oldman_oldman&preaction=pickreward&whichreward=6313",
              true
            );
            use($item`damp old wallet`);
          }
        }
        if (have($item`sand dollar`, 5)) {
          buy($coinmaster`Big Brother`, 1, $item`sea grease`);
          use($item`sea grease`);
        }
      },
      outfit: {
        equip: [$item`really, really nice swimming trunks`],
        familiar: $familiar`Grouper Groupie`,
      },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Create Sea Clothes",
      after: ["Corral Refract", "Spend sand dollars"],
      completed: () => have($item`sea cowboy hat`),
      do: () => {
        cliExecute("create sea chaps");
        cliExecute("create sea cowboy hat");
        cliExecute("create aerated diving helmet");
        cliExecute("create teflon swim fins");
      },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Prepare for seahorse",
      after: ["The Sea/Finish Mer-kin outpost"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => get("intenseCurrents"),
      do: () => {
        use($item`Mer-kin stashbox`);
        retrieveItem($item`damp old boot`);
        visitUrl("place.php?whichplace=sea_oldman&action=oldman_oldman");
        use($item`Mer-kin trailmap`);
        visitUrl("monkeycastle.php?action=grandpastory&topic=currents");
      },
      limit: { tries: 10 },
      outfit: { pants: $item`really, really nice swimming trunks` }, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Retrieve Seahorse",
      after: ["The Sea/Finish Mer-kin outpost"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
        if (!have($item`sea lasso`)) monkeyPaw($item`sea lasso`);
      }, // ensure fishy
      completed: () => get("seahorseName") !== "",
      do: $location`The Coral Corral`,
      limit: { tries: 10 },
      peridot: $monster`sea cow`,
      combat: new CombatStrategy().macro(
        Macro.externalIf(
          !have($item`sea cowbell`, 3),
          Macro.if_($monster`sea cow`, Macro.trySkill($skill`Swoop like a Bat`))
        )
          .externalIf(
            get("lassoTrainingCount", 0) < 18 && have($item`sea lasso`),
            Macro.tryItem($item`sea lasso`)
          )
          .externalIf(
            get("lassoTraining") === "deftly" &&
            have($item`sea cowbell`, 3) &&
            have($item`sea lasso`),
            Macro.if_(
              $monster`wild seahorse`,
              Macro.tryItem($item`sea cowbell`)
                .tryItem($item`sea cowbell`)
                .tryItem($item`sea cowbell`)
                .tryItem($item`sea lasso`)
            )
          )
      ),
      //combat - swoop sea cow
      outfit: { equip: $items`sea cowboy hat, sea chaps, bat wings` }, // Ensure we can breath water
      freeaction: false,
      post: () => {
        visitUrl("seafloor.php?action=currents");
        visitUrl("sea_merkin.php?seahorse=1");
      },
    },
    {
      name: "Prepare Scholar",

      after: ["The Sea/Retrieve Seahorse"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => have($item`Mer-kin scholar mask`) && have($item`Mer-kin scholar tailpiece`),
      do: $location`Mer-kin Elementary School`,
      limit: { tries: 10 },
      outfit: {}, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Do Scholar",

      after: ["The Sea/Prepare Scholar"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => have($item`Mer-kin dreadscroll`),
      do: $location`Mer-kin Library`,
      limit: { tries: 10 },
      outfit: { equip: $items`Mer-kin scholar mask, Mer-kin scholar tailpiece`, modifier: "-com" }, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Dreadscroll",

      after: ["The Sea/Prepare Scholar"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => get("seahorseName") !== "",
      do: () => {
        use($item`Mer-kin dreadscroll`);
        visitUrl(
          "choice.php?pro1=1&pro2=4&pro3=3&pro4=2&pro5=1&pro6=1&pro7=1&pro8=1&whichchoice=703&pwd&option=1"
        ); // fix this
      },
      limit: { tries: 10 },
      outfit: { equip: $items`Mer-kin scholar mask, Mer-kin scholar tailpiece`, modifier: "-com" }, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Prepare Gladiators",
      after: ["The Sea/Finish Mer-kin outpost"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () =>
        have($item`Mer-kin gladiator mask`) && have($item`Mer-kin gladiator tailpiece`),
      do: $location`Mer-kin Gymnasium`,
      limit: { tries: 10 },
      outfit: {}, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Get gladiator outfit",
      ready: () =>
        have($item`Mer-kin scholar mask`) &&
        have($item`Mer-kin scholar tailpiece`) &&
        get("yogUrtDefeated") &&
        have($item`Mer-kin thighguard`) &&
        have($item`Mer-kin headguard`),
      completed: () =>
        get("yogUrtDefeated") &&
        have($item`Mer-kin gladiator mask`) &&
        have($item`Mer-kin gladiator tailpiece`),
      do: () => {
        visitUrl("shop.php?whichshop=grandma");
        visitUrl("shop.php?whichshop=grandma&action=buyitem&quantity=1&whichrow=131&pwd");
        visitUrl("shop.php?whichshop=grandma&action=buyitem&quantity=1&whichrow=1619&pwd");
        visitUrl("shop.php?whichshop=grandma&action=buyitem&quantity=1&whichrow=126&pwd");
        visitUrl("shop.php?whichshop=grandma&action=buyitem&quantity=1&whichrow=127&pwd");
      },
      outfit: {
        equip: [$item`really, really nice swimming trunks`, $item`prismatic beret`],
      },
      freeaction: true,
      limit: { tries: 1 }
    },
    {
      name: "Fights",
      ready: () => have($item`Mer-kin gladiator mask`) && have($item`Mer-kin gladiator tailpiece`),
      completed: () => get("lastColosseumRoundWon") >= 12,
      do: $location`Mer-kin Colosseum`,
      combat: new CombatStrategy().macro((): Macro => {
        return Macro.trySkillRepeat($skill`Saucegeyser`);
      }),
      outfit: {
        modifier: "mysticality",
        familiar: $familiar`Foul Ball`,
        equip: $items`Everfull Dart Holster, spring shoes, bat wings, Monodent of the Sea, august scepter, Mer-kin gladiator mask, Mer-kin gladiator tailpiece`,
      },
      limit: { turns: 12 },
    },
    {
      name: "Buff for hard fights",
      after: ["Fights"],
      completed: () => get("isMerkinGladiatorChampion") || get("_aprilShowerSimmer"),
      do: () => {
        equip($item`April Shower Thoughts shield`);
        useSkill($skill`Simmer`);
        ensureEffect($effect`Elron's Explosive Etude`, 1);
        ensureEffect(
          $effect`Arched Eyebrow of the Archmage`,
        );
        cliExecute("telescope high");
        cliExecute("monorail");
        cliExecute("buy 5 glittery mascara; use 5 glittery mascara");
      },
      freeaction: true,
      limit: { tries: 1 }
    },
    {
      name: "Hard fights",
      after: ["Buff for hard fights"],
      completed: () => get("isMerkinGladiatorChampion"),
      do: $location`Mer-kin Colosseum`,
      combat: new CombatStrategy().macro((): Macro => {
        return Macro.trySkillRepeat($skill`Raise Backup Dancer`);
      }),
      outfit: {
        modifier: "mysticality",
        familiar: $familiar`Foul Ball`,
        equip: $items`Everfull Dart Holster, spring shoes, bat wings, Monodent of the Sea, august scepter, Mer-kin gladiator mask, Mer-kin gladiator tailpiece`,
      },
      freeaction: false,
      limit: { turns: 12 },
    },
    {
      name: "Shub",
      after: ["Hard fights"],
      completed: () => get("shubJigguwattDefeated"),
      prepare: () => {
        // Restore hp and empty mana
        restoreHp(myMaxhp());
        const numcasts = Math.floor(myMp() / 2);
        useSkill(numcasts, $skill`The Moxious Madrigal`);
      },
      do: $location`Mer-kin Temple Left Door`,
      combat: new CombatStrategy().macro((): Macro => {
        return Macro.item([$item`crayon shavings`, $item`crayon shavings`])
          .item([$item`crayon shavings`, $item`crayon shavings`])
          .item([$item`crayon shavings`, $item`crayon shavings`])
          .item([$item`crayon shavings`, $item`crayon shavings`])
          .attack()
          .repeat();
      }),
      post: () => {
        if (myMp() < 200) {
          useSkill($skill`Rest upside down`);
        }
      },
      outfit: {
        familiar: $familiar`Peace Turkey`,
        equip: $items`Everfull Dart Holster, spring shoes, bat wings, Monodent of the Sea, April Shower Thoughts shield, Mer-kin gladiator mask, Mer-kin gladiator tailpiece`,
      },
      freeaction: false,
      limit: { turns: 10 },
    },
    {
      name: "Kill Yog-urt",
      after: ["The Sea/Do Scholar"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => get("seahorseName") !== "",
      do: $location`Mer-kin Library`,

      // eslint-disable-next-line libram/verify-constants
      limit: { tries: myPath() === $path`11037 Leagues under the Sea` ? 3 : 1 },
      choices: { 710: 1, 711: 1, 712: 1, 713: 1 },
      combat: new CombatStrategy().macro(
        Macro.if_(
          $monster`Yog-Urt, Elder Goddess of Hatred`,
          Macro.tryItem($item`crayon shavings`, $item`Mer-kin healscroll`)
            .tryItem($item`crayon shavings`, $item`waterlogged scroll of healing`)
            .tryItem($item`crayon shavings`, $item`sea gel`)
            .trySkill($skill`Raise Backup Dancer`)
            .trySkill($skill`Raise Backup Dancer`)
        )
      ),
      outfit: {
        equip: $items`Mer-kin scholar mask, Mer-kin scholar tailpiece, Mer-kin prayerbeads, Mer-kin prayerbeads, Mer-kin prayerbeads`,
        modifier: "-hp, spell dmg",
      }, // Ensure we can breath water
      // new combat for all three bosses - probably need prefs
      freeaction: false,
      boss: true,
    },
    {
      name: "Final Abyss",
      ready: () => get("shubJigguwattDefeated"),
      completed: () => get("momSeaMonkeeProgress") >= 40,
      do: $location`The Caliginous Abyss`,
      combat: new CombatStrategy().killHard($monsters`Peanut`).killHard(),
      outfit: () => {
        const baseOutfit: OutfitSpec = {
          familiar: $familiar`Peace Turkey`,
          equip: $items`black glass, shark jumper, scale-mail underwear`,
        };
        if (get("_assertYourAuthorityCast") < 3) {
          baseOutfit.equip.push(...$items`Sheriff badge, Sheriff moustache, Sheriff pistol`);
        }
        return baseOutfit;
      },
      freeaction: false,
      limit: { turns: 10 },
    },
    {
      name: "Abyss Mom",
      after: ["Final Abyss"],
      completed: () => step("questS02Monkees") === 999,
      do: $location`The Caliginous Abyss`,
      outfit: {
        equip: $items`black glass`,
      },
      limit: { tries: 1 },
    },
    {
      name: "Fish Banish",
      after: ["Abyss Mom"],
      completed: () => get("screechCombats") !== 0 || !fishLocationAvailable(),
      do: () => getFishLocation()!,
      combat: new CombatStrategy()
        .killHard($monsters`time cop, Black Crayon Mer-kin`)
        .macro((): Macro => {
          return Macro.trySkill($skill`%fn, Release the Patriotic Screech!`);
        })
        .killHard(),
      outfit: {
        familiar: $familiar`Patriotic Eagle`,
        equip: $items`Monodent of the Sea, Everfull Dart Holster, cursed monkey's paw, Möbius ring, shark jumper, bat wings`,
      },
      limit: { turns: 10 },
    },
    {
      name: "Habitat Egg",
      after: ["Fish Banish"],
      ready: () => ChestMimic.eggMonsters().has($monster`Black Crayon Mer-kin`),
      completed: () =>
        !ChestMimic.have() || !have($skill`Just the Facts`) || get("_monsterHabitatsRecalled") > 1,
      do: () => {
        ChestMimic.differentiate($monster`Black Crayon Mer-kin`);
      },
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.step("pickpocket").skill($skill`Recall Facts: Monster Habitats`);
        })
        .killHard(),
      outfit: {
        familiar: $familiar`Peace Turkey`,
        equip: $items`Everfull Dart Holster, spring shoes`,
      },
      limit: { turns: 10 },
    },
    {
      name: "Do Habs",
      after: ["Habitat Egg"],
      completed: () => !pearlZoneAvailable() || get("_monsterHabitatsFightsLeft") === 0,
      do: () => getNextPearlZone()!,
      combat: new CombatStrategy()
        .killHard($monsters`time cop`)
        .macro((): Macro => {
          return Macro.externalIf(
            getNextPearlTurns() > 2,
            Macro.trySkill($skill`Blow the Purple Candle!`).trySkill($skill`Create an Afterimage`)
          ).trySkill($skill`Recall Facts: Monster Habitats`);
        }, $monsters`Black Crayon Mer-kin`)
        .killHard($monsters`Black Crayon Mer-kin`)
        .macro((): Macro => {
          return Macro.trySkill($skill`Punch Out your Foe`)
            .tryItem($item`stuffed yam stinkbomb`)
            .tryItem($item`handful of split pea soup`)
            .trySkill($skill`Sea *dent: Throw a Lightning Bolt`);
        }, $monsters`Mer-kin miner, killer clownfish, Mer-kin tippler`)
        .killHard(),
      outfit: {
        modifier: "-combat",
        equip: $items`Monodent of the Sea, Everfull Dart Holster, Roman Candelabra, cursed monkey's paw, Möbius ring, shark jumper, bat wings`,
        familiar: $familiar`Peace Turkey`,
      },
      limit: { turns: 10 },
    },
    {
      name: "Nautical Seaceress",
      ready: () =>
        pearlsReady() &&
        get("shubJigguwattDefeated") &&
        get("yogUrtDefeated") &&
        step("questS02Monkees") === 999,
      completed: () => step("questL13Final") === 999,
      prepare: () => {
        // buy($coinmaster`Wet Crap For Sale`, 1, $item`scroll of sea strength`);
        // Actually, seems like the coinmaster only has sand penny stuff
        if (!have($effect`Sea Strength`)) {
          cliExecute("buy scroll of sea strength");
          use($item`scroll of sea strength`);
        }
        if (!have($effect`Sea Smarm`)) {
          // buy($coinmaster`Wet Crap For Sale`, 1, $item`scroll of sea smarm`);
          cliExecute("buy scroll of sea smarm");
          use($item`scroll of sea smarm`);
        }
        if (myMp() < 300) {
          useSkill($skill`Rest upside down`);
        }
        if (getSongCount() > getSongLimit()) {
          uneffect(<Effect>getActiveSongs().pop());
          useSkill($skill`Song of Bravado`);
        }
        restoreHp(myMaxhp());
      },
      do: $location`Mer-kin Temple (Center Door)`,
      combat: new CombatStrategy().macro((): Macro => {
        return Macro.item([$item`crayon shavings`, $item`crayon shavings`])
          .item([$item`crayon shavings`, $item`crayon shavings`])
          .trySkillRepeat($skill`Saucegeyser`);
      }),
      outfit: {
        modifier: "moxie",
        familiar: $familiar`Peace Turkey`,
        equip: $items`Everfull Dart Holster, spring shoes, bat wings, shark jumper, Monodent of the Sea, April Shower Thoughts shield`,
      },
      boss: true,
      limit: { turns: 2 },
    },
  ],
};

function getFishLocation(): Location | undefined {
  if (!get("_unblemishedPearlTheBriniestDeepests")) {
    return $location`The Briniest Deepests`;
  } else if (!get("_unblemishedPearlMadnessReef")) {
    return $location`Madness Reef`;
  }
  return undefined;
}

function fishLocationAvailable(): boolean {
  return getFishLocation() !== undefined;
}

function getNextPearlZone(): Location | undefined {
  if (!get("_unblemishedPearlAnemoneMine")) {
    return $location`Anemone Mine`;
  } else if (!get("_unblemishedPearlTheBriniestDeepests")) {
    return $location`The Briniest Deepests`;
  } else if (!get("_unblemishedPearlMadnessReef")) {
    return $location`Madness Reef`;
  } else if (!get("_unblemishedPearlDiveBar")) {
    return $location`The Dive Bar`;
  }
  return undefined;
}

function pearlZoneAvailable(): boolean {
  return getNextPearlZone() !== undefined;
}

function getNextPearlTurns(): number {
  if (!get("_unblemishedPearlAnemoneMine")) {
    return Math.ceil((100 - get("_unblemishedPearlAnemoneMineProgress") - 0.0001) / 10.0);
  } else if (!get("_unblemishedPearlTheBriniestDeepests")) {
    return Math.ceil((100 - get("_unblemishedPearlTheBriniestDeepestsProgress") - 0.0001) / 10.0);
  } else if (!get("_unblemishedPearlMadnessReef")) {
    return Math.ceil((100 - get("_unblemishedPearlMadnessReefProgress") - 0.0001) / 10.0);
  } else if (!get("_unblemishedPearlDiveBar")) {
    return Math.ceil((100 - get("_unblemishedPearlDiveBarProgress") - 0.0001) / 10.0);
  }
  return 0;
}

function pearlsReady(): boolean {
  if (have($item`unblemished pearl`, 5)) {
    return true;
  } else if (
    get("_unblemishedPearlAnemoneMine") &&
    get("_unblemishedPearlDiveBar") &&
    get("_unblemishedPearlMadnessReef") &&
    get("_unblemishedPearlMarinaraTrench") &&
    get("_unblemishedPearlTheBriniestDeepests")
  ) {
    return true;
  } else {
    return false;
  }
}
