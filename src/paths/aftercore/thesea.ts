import { $effect, $item, $items, $location, $monster, $path, $skill, $stat, get, have, Macro } from "libram";
import { Quest, ResourceRequest, Resources } from "../../engine/task";
import { canAdventure, haveEquipped, monkeyPaw, myMp, myPath, myPrimestat, restoreMp, retrieveItem, use, visitUrl } from "kolmafia";
import { CombatStrategy } from "../../engine/combat";


export const SeaQuest: Quest = {
  name: "The Sea",
  tasks: [
    {
      name: "Start",
      // eslint-disable-next-line libram/verify-constants
      ready: () => get("kingLiberated") || myPath() === $path`11037 Leagues Under the Sea`,
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
    // get shadow bricks
    {
      name: "Get Fishy",
      after: ["The Sea/Start"],
      prepare: () => {
        use($item`Black and White Apron Meal Kit`)
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
        // eslint-disable-next-line libram/verify-constants
        retrieveItem($item`really, really nice swimming trunks`, 1);
      }, // ensure fishy
      completed: () => have($item`wriggling flytrap pellet`),
      do: $location`An Octopus's Garden`,
      limit: { tries: 10 },
      peridot: $monster`Neptune flytrap`,
      combat: new CombatStrategy().macro(Macro.externalIf(
        have($skill`Transcendent Olfaction`) &&
        (get("olfactedMonster") !== $monster`Neptune flytrap` ||
          !have($effect`On the Trail`)) &&
        get("_olfactionsUsed") < 3,
        Macro.if_(
          $monster`Neptune flytrap`,
          Macro.trySkill($skill`Transcendent Olfaction`),
        ),
      )),
      //Macro to olfact + RWB + pledge
      // eslint-disable-next-line libram/verify-constants
      outfit: { pants: $item`really, really nice swimming trunks`, modifier: "item" }, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Visit Castle",
      // eslint-disable-next-line libram/verify-constants
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
      // eslint-disable-next-line libram/verify-constants
      outfit: { pants: $item`really, really nice swimming trunks` }, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Rescue Brother",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Visit Castle"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => get("bigBrotherRescued"),
      do: $location`The Wreck of the Edgar Fitzsimmons`,
      choices: { 299: 1 },
      limit: { tries: 10 },
      // eslint-disable-next-line libram/verify-constants
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
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Rescue Brother"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => have($item`fishy pipe`),
      do: () => {
        visitUrl("monkeycastle.php?who=1");
        visitUrl("monkeycastle.php?who=2");
        retrieveItem($item`bubblin' stone`);
        // do skate park unlock
      },
      limit: { tries: 10 },
      // eslint-disable-next-line libram/verify-constants
      outfit: { pants: $item`really, really nice swimming trunks` }, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Rescue Grandpa",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Big Brother Shopping"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => get("questS02Monkees") === "step5",
      do: myPrimestat === $stat`Muscle` ? $location`Anemone Mine` : myPrimestat === $stat`Mysticality` ? $location`The Marinara Trench` : $location`The Dive Bar`,
      limit: { tries: 10 },
      // eslint-disable-next-line libram/verify-constants
      outfit: { pants: $item`really, really nice swimming trunks`, modifier: "-combat" }, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Grandma Unlock",
      // eslint-disable-next-line libram/verify-constants
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
      // eslint-disable-next-line libram/verify-constants
      outfit: { pants: $item`really, really nice swimming trunks` }, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Rescue Grandma",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Grandma Unlock"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => get("questS02Monkees") === "step9",
      choices: { 695: 1, },
      do: $location`The Mer-Kin Outpost`,
      limit: { tries: 10 },
      // eslint-disable-next-line libram/verify-constants
      outfit: { pants: $item`really, really nice swimming trunks`, modifier: "-combat" }, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Mom Unlock",
      // eslint-disable-next-line libram/verify-constants
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
      // eslint-disable-next-line libram/verify-constants
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
      // eslint-disable-next-line libram/verify-constants
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
          repeat: 3
        },
      //post: visit lutz?
      freeaction: false,
    },
    {
      name: "Rescue Mom",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Mom Unlock"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
        if (have($item`comb jelly`)) use($item`comb jelly`);
      }, // ensure fishy
      completed: () => get("questS02Monkees") === "finished",
      do: $location`The Caliginous Abyss`,
      limit: { tries: 28 },
      // eslint-disable-next-line libram/verify-constants
      outfit: { pants: $item`really, really nice swimming trunks`, shirt: $item`shark jumper`, equip: $items`black glass` }, // Ensure we can breath water
      freeaction: false,
      delay: 28
    },
    {
      name: "Finish Mer-kin outpost",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Rescue Grandma"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => have($item`Mer-kin lockkey`) && have($item`Mer-kin stashbox`),
      do: $location`The Mer-Kin Outpost`,
      limit: { tries: 10 },
      delay: 26,
      // eslint-disable-next-line libram/verify-constants
      outfit: { pants: $item`really, really nice swimming trunks` }, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Prepare for seahorse",
      // eslint-disable-next-line libram/verify-constants
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
      // eslint-disable-next-line libram/verify-constants
      outfit: { pants: $item`really, really nice swimming trunks` }, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Retrieve Seahorse",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Finish Mer-kin outpost"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
        if (!have($item`sea lasso`)) monkeyPaw($item`sea lasso`);
      }, // ensure fishy
      completed: () => get("seahorseName") !== "",
      do: $location`The Coral Corral`,
      limit: { tries: 10 },
      peridot: $monster`sea cow`,
      combat: new CombatStrategy().macro(Macro.externalIf(
        !have($item`sea cowbell`, 3),
        Macro.if_(
          $monster`sea cow`,
          Macro.trySkill($skill`Swoop like a Bat`),
        ),
      ).externalIf(get("lassoTrainingCount", 0) < 18 && have($item`sea lasso`), Macro.tryItem($item`sea lasso`)).externalIf(get("lassoTraining") === "deftly" && have($item`sea cowbell`, 3) && have($item`sea lasso`), Macro.if_($monster`wild seahorse`, Macro.tryItem($item`sea cowbell`).tryItem($item`sea cowbell`).tryItem($item`sea cowbell`).tryItem($item`sea lasso`)))),
      //combat - swoop sea cow
      outfit: { equip: $items`sea cowboy hat, sea chaps, bat wings` }, // Ensure we can breath water
      freeaction: false,
      post: () => {
        visitUrl("seafloor.php?action=currents");
        visitUrl("sea_merkin.php?seahorse=1");
      }
    },
    {
      name: "Prepare Scholar",
      // eslint-disable-next-line libram/verify-constants
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
      // eslint-disable-next-line libram/verify-constants
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
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Prepare Scholar"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => get("seahorseName") !== "",
      do: () => {
        use($item`Mer-kin dreadscroll`);
        visitUrl("choice.php?pro1=1&pro2=4&pro3=3&pro4=2&pro5=1&pro6=1&pro7=1&pro8=1&whichchoice=703&pwd&option=1"); // fix this
      },
      limit: { tries: 10 },
      outfit: { equip: $items`Mer-kin scholar mask, Mer-kin scholar tailpiece`, modifier: "-com" }, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Prepare Gladiators",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Finish Mer-kin outpost"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => have($item`Mer-kin gladiator mask`) && have($item`Mer-kin gladiator tailpiece`),
      do: $location`Mer-kin Gymnasium`,
      limit: { tries: 10 },
      outfit: {}, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Do Gladiators",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Prepare Gladiators"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
        if (myMp() < 500) restoreMp(500);
      }, // ensure fishy
      completed: () => get("lastColosseumRoundWon") === 15,
      do: $location`Mer-kin Colosseum`,
      limit: { tries: 15 },
      outfit: { equip: $items`big hot pepper, Mer-kin gladiator mask, Mer-kin gladiator tailpiece`, modifier: "Spell Dmg" }, // Ensure we can breath water
      combat: new CombatStrategy().macro(Macro.trySkill($skill`Stuffed Mortar Shell`).trySkill($skill`Raise Backup Dancer`).trySkill($skill`Raise Backup Dancer`)),
      freeaction: false,
    },
    {
      name: "Kill Yog-urt",
      // eslint-disable-next-line libram/verify-constants
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
        Macro.if_($monster`Yog-Urt, Elder Goddess of Hatred`, Macro.tryItem($item`crayon shavings`, $item`Mer-kin healscroll`).tryItem($item`crayon shavings`, $item`waterlogged scroll of healing`).tryItem($item`crayon shavings`, $item`sea gel`).trySkill($skill`Raise Backup Dancer`).trySkill($skill`Raise Backup Dancer`))
      ),
      outfit: { equip: $items`Mer-kin scholar mask, Mer-kin scholar tailpiece, Mer-kin prayerbeads, Mer-kin prayerbeads, Mer-kin prayerbeads`, modifier: "-hp, spell dmg" }, // Ensure we can breath water
      // new combat for all three bosses - probably need prefs
      freeaction: false,
      boss: true,
    },
    {
      name: "Kill Shub-Jigg",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Do Gladiators"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => get("seahorseName") !== "",
      do: $location`Mer-kin Library`,
      // eslint-disable-next-line libram/verify-constants
      limit: { tries: myPath() === $path`11037 Leagues under the Sea` ? 3 : 1 },
      choices: { 708: 1, 709: 1 },
      combat: new CombatStrategy().macro(
        Macro.if_($monster`Shub-Jigguwatt, Elder God of Violence`, Macro.tryItem($item`crayon shavings`, $item`crayon shavings`).tryItem($item`crayon shavings`, $item`crayon shavings`).tryItem($item`crayon shavings`, $item`crayon shavings`).attack().attack().attack())
      ),
      outfit: { equip: $items`Mer-kin gladiator mask, Mer-kin gladiator tailpiece`, modifier: "+hp, weapon dmg" }, // Ensure we can breath water
      // new combat for all three bosses - probably need prefs
      freeaction: false,
      boss: true,
    },
    {
      name: "Kill Seaceress",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Kill Yog-urt", "The Sea/Kill Shub-Jigg"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => get("seahorseName") !== "",
      do: $location`Mer-kin Library`,
      // eslint-disable-next-line libram/verify-constants
      limit: { tries: myPath() === $path`11037 Leagues under the Sea` ? 3 : 1 },
      // eslint-disable-next-line libram/verify-constants
      outfit: { pants: $item`really, really nice swimming trunks`, modifier: "+hp, spell dmg" }, // Ensure we can breath water
      combat: new CombatStrategy()
        .macro(() => Macro.externalIf(haveEquipped($item`June cleaver`), Macro.attack().repeat()))
        .kill(),
      freeaction: false,
      boss: true,
    },
  ]
}
