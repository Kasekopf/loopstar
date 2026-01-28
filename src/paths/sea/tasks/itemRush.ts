import {
  $coinmaster,
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $monsters,
  $skill,
  AprilingBandHelmet,
  AugustScepter,
  BloodCubicZirconia,
  CursedMonkeyPaw,
  get,
  getBanishedMonsters,
  have,
  Macro,
  PeridotOfPeril,
  PrismaticBeret,
} from "libram";
import { step } from "grimoire-kolmafia";

import {
  abort,
  adv1,
  buy,
  cliExecute,
  closetAmount,
  inHardcore,
  itemAmount,
  myHash,
  myMeat,
  print,
  putCloset,
  retrieveItem,
  takeCloset,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
import { Quest, Resources } from "../../../engine/task";
import { CombatStrategy } from "../../../engine/combat";
import { pull } from "../util";

function haveElementarySchoolRefractItems() {
  let numItems = 0;
  numItems += itemAmount($item`Mer-kin hallpass`);
  numItems += closetAmount($item`Mer-kin hallpass`);
  numItems += itemAmount($item`Mer-kin facecowl`);
  numItems += itemAmount($item`Mer-kin waistrope`);
  if (have($item`Mer-kin scholar mask`)) {
    numItems += 1;
  }
  if (have($item`Mer-kin scholar tailpiece`)) {
    numItems += 1;
  }
  return numItems >= 2;
}

function doneWithElementarySchool() {
  let numItems = 0;
  if (
    have($item`Mer-kin facecowl`) ||
    have($item`Mer-kin scholar mask`) ||
    have($item`Mer-kin gladiator mask`)
  ) {
    numItems += 1;
  }
  if (
    have($item`Mer-kin waistrope`) ||
    have($item`Mer-kin scholar tailpiece`) ||
    have($item`Mer-kin gladiator tailpiece`)
  ) {
    numItems += 1;
  }
  return numItems >= 2;
}

function doneWithScholarRefract() {
  if (have($item`Mer-kin dreadscroll`)) {
    return true;
  }
  if (get("_bczRefractedGazeCasts") >= 12) {
    return true;
  } else if (!have($item`Mer-kin knucklebone`) && get("dreadScroll4") === 0) {
    return false;
  } else if (!have($item`Mer-kin worktea`) && get("dreadScroll7") === 0) {
    return false;
  }
  return true;
}

export const ItemTask: Quest = {
  name: "Item Run",
  tasks: [
    {
      name: "Collect Buffs",
      ready: () =>
        get("_unblemishedPearlMarinaraTrench") &&
        have($item`teflon ore`) &&
        !have($item`ink bladder`) &&
        step("questS02Monkees") < 10 &&
        get("_beretBuskingUses") === 0,
      completed: () => get("_beretBuskingUses") > 0,
      do: () => {
        cliExecute("buy paper-plate-mail pants");
        cliExecute("buy alpha-mail pants");
        cliExecute("buy chain-mail monokini");
        PrismaticBeret.buskAt(220);
        PrismaticBeret.buskAt(230);
        PrismaticBeret.buskAt(350);
        PrismaticBeret.buskAt(280);
        if (have($item`scale-mail underwear`)) {
          PrismaticBeret.buskAt(470);
        }
        if (AugustScepter.canCast(7)) {
          useSkill($skill`Aug. 7th: Lighthouse Day!`);
        }
        cliExecute("genie effect frosty");
        cliExecute("alliedradio effect intel");
        if (!have($effect`Party Soundtrack`)) {
          cliExecute("cast party soundtrack");
        }
        if (have($item`lump of loyal latite`)) {
          use($item`lump of loyal latite`);
        }
        useSkill($skill`Steely-Eyed Squint`);
      },
      limit: { soft: 11 },
    },
    {
      name: "Buy scuba gear",
      ready: () => myMeat() > 10000,
      completed: () => have($item`old SCUBA tank`),
      do: () => {
        visitUrl("place.php?whichplace=sea_oldman&action=oldman_oldman");
        visitUrl(
          `place.php?whichplace=sea_oldman&action=oldman_oldman&preaction=buytank&pwd=${myHash()}`,
          true
        );
      },
      limit: { soft: 11 },
    },
    {
      name: "Buy goggles",
      ready: () => have($item`sand penny`, 100),
      completed: () => have($item`undersea surveying goggles`),
      do: () => {
        buy($coinmaster`Wet Crap For Sale`, 1, $item`undersea surveying goggles`);
      },
      limit: { soft: 11 },
    },
    {
      name: "Banish 1",
      completed: () =>
        get("corralUnlocked") || have($item`Mer-kin lockkey`) || have($item`Mer-kin stashbox`),
      do: $location`The Mer-Kin Outpost`,
      combat: new CombatStrategy().banish($monsters`Mer-kin burglar, Mer-kin raider`).kill(),
      outfit: {
        familiar: $familiar`Peace Turkey`,
        modifier: "-combat",
      },
      limit: { soft: 11 },
    },
    {
      name: "Get lockkey",
      after: ["Banish 1"],
      completed: () =>
        have($item`Mer-kin lockkey`) || get("corralUnlocked") || have($item`Mer-kin stashbox`),
      do: $location`The Mer-Kin Outpost`,
      outfit: {
        equip: $items`Möbius ring, Everfull Dart Holster, blood cubic zirconia, toy Cupid bow`,
        modifier: "item, -combat",
      },
      limit: { soft: 11 },
    },
    {
      name: "Get stashbox",
      after: ["Get lockkey"],
      completed: () =>
        have($item`Mer-kin stashbox`) || have($item`Mer-kin trailmap`) || get("corralUnlocked"),
      do: $location`The Mer-Kin Outpost`,
      outfit: {
        equip: $items`spring shoes, Everfull Dart Holster, blood cubic zirconia`,
        familiar: $familiar`Peace Turkey`,
        modifier: "-combat",
      },
      prepare: () => {
        if (!have($effect`Fresh Scent`) && have($item`deodorant`)) {
          use($item`deodorant`);
        }
        if (!have($effect`Life Goals`) && have($item`Life Goals Pamphlet`)) {
          use($item`Life Goals Pamphlet`);
        }
        if (!have($effect`Colorfully Concealed`) && have($item`Mer-kin hidepaint`)) {
          use($item`Mer-kin hidepaint`);
        }
      },
      limit: { soft: 11 },
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
      },
      limit: { soft: 11 },
    },
    {
      name: "Corral Refract",
      ready: () => get("_bczRefractedGazeCasts") < 12,
      after: ["Stashbox Trailmap"],
      completed: () => have($item`sea leather`) || have($item`sea cowboy hat`),
      do: $location`The Coral Corral`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.if_(
            $monster`Mer-kin rustler`,
            Macro.skill($skill`Spring Kick`)
              .skill($skill`Sea *dent: Talk to Some Fish`)
              .skill($skill`BCZ: Refracted Gaze`)
              .skill($skill`Do an epic McTwist!`)
          );
        })
        .kill(),
      outfit: {
        modifier: "item",
        equip: $items`Monodent of the Sea, toy Cupid bow, pro skateboard, spring shoes, blood cubic zirconia`,
      },
      post: () => use($item`Mer-kin thingpouch`, itemAmount($item`Mer-kin thingpouch`)),
      limit: { soft: 11 },
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
        if (have($item`sand dollar`, 15)) {
          buy($coinmaster`Big Brother`, 1, $item`sea grease`);
          use($item`sea grease`);
        }
      },
      outfit: {
        equip: [$item`really, really nice swimming trunks`],
      },
      freeaction: true,
      limit: { soft: 11 },
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
      limit: { soft: 11 },
    },
    {
      name: "Create scale-mail underwear",
      after: ["Create Sea Clothes"],
      completed: () => have($item`scale-mail underwear`),
      do: () => {
        if (have($item`dull fish scale`, 25) && have($item`pristine fish scale`)) {
          visitUrl("shop.php?whichshop=grandma");
          visitUrl("shop.php?whichshop=grandma&action=buyitem&quantity=1&whichrow=132&pwd");
        }
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Dive Bar Peridot",
      completed: () =>
        get("_unblemishedPearlDiveBar") ||
        !PeridotOfPeril.have() ||
        PeridotOfPeril.periledToday($location`The Dive Bar`),
      prepare: () => {
        if (!have($item`sea lasso`)) {
          cliExecute("monkeypaw wish sea lasso");
        }
      },
      do: $location`The Dive Bar`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.tryItem($item`sea lasso`);
        }, $monsters`Mer-kin tippler`)
        .kill(),
      outfit: {
        equip: $items`Everfull Dart Holster, Peridot of Peril, shark jumper, toy Cupid bow, sea cowboy hat, sea chaps, old SCUBA tank, McHugeLarge left pole`,
        modifier: "item",
      },
      peridot: $monster`Mer-kin tippler`,
      limit: { soft: 11 },
    },
    {
      name: "Dive Bar Lassoing",
      after: ["Dive Bar Peridot"],
      completed: () => get("lassoTrainingCount") >= 20 || get("_unblemishedPearlDiveBar"),
      prepare: () => {
        if (!have($item`sea lasso`)) {
          cliExecute("monkeypaw wish sea lasso");
        }
      },
      do: $location`The Dive Bar`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.tryItem($item`sea lasso`).skill($skill`BCZ: Refracted Gaze`);
        }, $monsters`lounge lizardfish, nurse shark, time cop`)
        .macro((): Macro => {
          return Macro.item($item`sea lasso`);
        }, $monsters`Mer-kin tippler`)
        .kill(),
      outfit: {
        equip: $items`Everfull Dart Holster, blood cubic zirconia, shark jumper, toy Cupid bow, sea cowboy hat, sea chaps, old SCUBA tank`,
        modifier: "item",
      },
      limit: { soft: 11 },
    },
    {
      name: "Remaining Lassoing",
      after: ["Dive Bar Lassoing"],
      completed: () => get("lassoTrainingCount") >= 20,
      prepare: () => {
        if (!have($item`sea lasso`)) {
          cliExecute("monkeypaw wish sea lasso");
        }
      },
      do: $location`Anemone Mine`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.tryItem($item`sea lasso`);
        }, $monsters`Anemone combatant, time cop`)
        .macro((): Macro => {
          return Macro.tryItem($item`sea lasso`)
            .trySkill($skill`Sea *dent: Talk to Some Fish`)
            .tryItem($item`sea lasso`);
        }, $monsters`killer clownfish, Mer-kin miner`)
        .kill(),
      outfit: {
        equip: $items`Monodent of the Sea, Everfull Dart Holster, blood cubic zirconia, shark jumper, sea cowboy hat, sea chaps, old SCUBA tank`,
        familiar: $familiar`Red-Nosed Snapper`,
      },
      limit: { soft: 11 },
    },
    {
      name: "Peridot Seahorse",
      after: ["Remaining Lassoing"],
      completed: () => PeridotOfPeril.periledToday($location`The Coral Corral`),
      prepare: () => {
        if (!have($item`sea lasso`)) {
          cliExecute("monkeypaw wish sea lasso");
        }
        if (!have($item`sea cowbell`, 3)) {
          cliExecute("monkeypaw wish sea cowbell");
        }
        if (!have($item`sea lasso`) || !have($item`sea cowbell`, 3)) {
          abort("Failed to get enough sea lassos and cowbells.");
        }
      },
      do: $location`The Coral Corral`,
      combat: new CombatStrategy().macro((): Macro => {
        return Macro.item([$item`sea cowbell`, $item`sea cowbell`]).item([
          $item`sea cowbell`,
          $item`sea lasso`,
        ]);
      }, $monsters`wild seahorse`),
      outfit: {
        equip: $items`Peridot of Peril, Monodent of the Sea, Everfull Dart Holster, spring shoes`,
        familiar: $familiar`Peace Turkey`,
      },
      peridot: $monster`wild seahorse`,
      limit: { soft: 11 },
    },
    {
      name: "First Banish",
      after: ["Peridot Seahorse"],
      completed: () =>
        get("seahorseName") !== "" || getBanishedMonsters().has($item`stuffed yam stinkbomb`),
      do: $location`The Coral Corral`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.item([$item`sea cowbell`, $item`sea cowbell`]).item([
            $item`sea cowbell`,
            $item`sea lasso`,
          ]);
        }, $monsters`wild seahorse`)
        .banish($monsters`sea cowboy, sea cow`)
        .killHard(),
      outfit: {
        equip: $items`Everfull Dart Holster, spring shoes, Möbius ring`,
        familiar: $familiar`Peace Turkey`,
      },
      limit: { soft: 11 },
    },
    {
      name: "Find that seahorse",
      after: ["First Banish"],
      completed: () => get("seahorseName") !== "",
      do: () => {
        try {
          adv1($location`The Coral Corral`);
        } catch {
          print("Error while waffling for a seahorse ignored.");
        }
      },
      combat: new CombatStrategy().macro((): Macro => {
        return Macro.if_(
          "monstername wild seahorse",
          Macro.item([$item`sea cowbell`, $item`sea cowbell`]).item([
            $item`sea cowbell`,
            $item`sea lasso`,
          ])
        )
          .if_(
            "monstername wild seahorse",
            Macro.item([$item`sea cowbell`, $item`sea cowbell`]).item([
              $item`sea cowbell`,
              $item`sea lasso`,
            ])
          )
          .tryItem($item`stuffed yam stinkbomb`)
          .trySkill($skill`Snokebomb`);
      }),
      outfit: {
        equip: $items`Everfull Dart Holster, spring shoes, Möbius ring`,
        familiar: $familiar`Peace Turkey`,
      },
      limit: { soft: 11 },
    },
    {
      name: "Buy Mer-kin gear",
      after: ["Remaining Lassoing"],
      completed: () =>
        (have($item`crappy Mer-kin mask`) && have($item`crappy Mer-kin tailpiece`)) ||
        have($item`Mer-kin scholar tailpiece`) ||
        have($item`Mer-kin gladiator tailpiece`),
      do: () => {
        retrieveItem($item`aerated diving helmet`);
        retrieveItem($item`teflon swim fins`);
        visitUrl("shop.php?whichshop=grandma");
        if (!have($item`crappy Mer-kin mask`)) {
          if (!(have($item`pristine fish scale`, 3) && have($item`aerated diving helmet`))) {
            abort("Failed to get ingredients for crappy Mer-kin mask somehow");
          }
          visitUrl("shop.php?whichshop=grandma&action=buyitem&quantity=1&whichrow=124&pwd");
        }
        if (!have($item`crappy Mer-kin tailpiece`)) {
          if (
            !(
              have($item`pristine fish scale`, 3) &&
              have($item`teflon swim fins`) &&
              have($item`sea chaps`)
            )
          ) {
            abort("Failed to get ingredients for crappy Mer-kin tailpiece somehow");
          }
          visitUrl("shop.php?whichshop=grandma&action=buyitem&quantity=1&whichrow=125&pwd");
        }
      },
      outfit: {
        equip: [$item`really, really nice swimming trunks`, $item`prismatic beret`],
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Elementary School Refract",
      after: ["Buy Mer-kin gear", "Find that seahorse"],
      ready: () => BloodCubicZirconia.availableCasts($skill`BCZ: Refracted Gaze`, 200) > 1,
      completed: () => haveElementarySchoolRefractItems(),
      do: $location`Mer-kin Elementary School`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.ifNot(
            "monstername time cop",
            Macro.trySkill($skill`Sea *dent: Talk to Some Fish`)
          ).skill($skill`BCZ: Refracted Gaze`);
        })
        .kill(),
      resources: () => {
        return {
          which: Resources.NCForce,
          benefit: !get("merkinElementaryTeacherUnlock") ? 5 : 0,
        };
      },
      outfit: {
        equip: $items`crappy Mer-kin mask, crappy Mer-kin tailpiece, Monodent of the Sea, blood cubic zirconia, Everfull Dart Holster, McHugeLarge left ski, toy Cupid bow`,
        modifier: "item",
      },
      prepare: () => {
        if (itemAmount($item`Mer-kin hallpass`) > 0) {
          putCloset(itemAmount($item`Mer-kin hallpass`), $item`Mer-kin hallpass`);
        }
      },
      limit: { soft: 11 },
    },
    {
      name: "Elementary School Wrapup",
      completed: () => doneWithElementarySchool(),
      do: $location`Mer-kin Elementary School`,
      combat: new CombatStrategy().kill($monsters`Mer-kin monitor`),
      resources: () => {
        return {
          which: Resources.NCForce,
          benefit: !get("merkinElementaryTeacherUnlock") ? 5 : 0,
        };
      },
      outfit: {
        equip: $items`crappy Mer-kin mask, crappy Mer-kin tailpiece, Monodent of the Sea, Everfull Dart Holster, McHugeLarge left ski`,
        familiar: $familiar`Peace Turkey`,
        modifier: "-combat",
      },
      prepare: () => {
        if (!get("merkinElementaryTeacherUnlock")) {
          if (itemAmount($item`Mer-kin hallpass`) > 0) {
            putCloset(itemAmount($item`Mer-kin hallpass`), $item`Mer-kin hallpass`);
          }
          if (!get("noncombatForcerActive") && get("_aprilBandTubaUses") < 3) {
            AprilingBandHelmet.play($item`Apriling band tuba`);
          }
        } else {
          if (itemAmount($item`Mer-kin hallpass`) === 0) {
            takeCloset(1, $item`Mer-kin hallpass`);
          }
          if (!have($item`Mer-kin bunwig`)) {
            CursedMonkeyPaw.wishFor($item`Mer-kin bunwig`);
          }
        }
      },
      limit: { soft: 11 },
    },
    {
      name: "Mer-kin Scholar Prep",
      after: ["Elementary School Wrapup"],
      completed: () =>
        get("yogUrtDefeated") ||
        (have($item`Mer-kin scholar mask`) &&
          have($item`Mer-kin scholar tailpiece`) &&
          get("merkinVocabularyMastery") > 0),
      do: () => {
        if (
          itemAmount($item`Mer-kin cheatsheet`) < itemAmount($item`Mer-kin wordquiz`) &&
          !inHardcore()
        ) {
          pull($item`Mer-kin cheatsheet`);
        }
        use(
          $item`Mer-kin wordquiz`,
          Math.min(itemAmount($item`Mer-kin wordquiz`), itemAmount($item`Mer-kin cheatsheet`))
        );
        while (itemAmount($item`Mer-kin wordquiz`) > 0 && CursedMonkeyPaw.wishes() > 1) {
          CursedMonkeyPaw.wishFor($item`Mer-kin cheatsheet`);
          use($item`Mer-kin wordquiz`);
        }
        visitUrl("shop.php?whichshop=grandma");
        if (have($item`crappy Mer-kin mask`)) {
          visitUrl("shop.php?whichshop=grandma&action=buyitem&quantity=1&whichrow=129&pwd");
        }
        if (have($item`crappy Mer-kin tailpiece`)) {
          visitUrl("shop.php?whichshop=grandma&action=buyitem&quantity=1&whichrow=130&pwd");
        }
      },
      outfit: {
        equip: [$item`prismatic beret`, $item`really, really nice swimming trunks`],
      },
      limit: { soft: 11 },
    },
    {
      name: "Mer-kin Scholar Refract",
      after: ["Mer-kin Scholar Prep"],
      completed: () => doneWithScholarRefract(),
      do: $location`Mer-kin Library`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.ifNot(
            "monstername time cop",
            Macro.trySkill($skill`Sea *dent: Talk to Some Fish`)
          ).skill($skill`BCZ: Refracted Gaze`);
        })
        .kill(),
      outfit: {
        equip: $items`Mer-kin scholar mask, Mer-kin scholar tailpiece, toy Cupid bow, Möbius ring, Monodent of the Sea, Everfull Dart Holster, blood cubic zirconia`,
        modifier: "item",
      },
      delay: 5,
      limit: { soft: 11 },
    },
    {
      name: "Learn more vocab",
      after: ["Mer-kin Scholar Refract"],
      completed: () =>
        get("merkinVocabularyMastery") >= 60 ||
        PeridotOfPeril.periledToday($location`Mer-kin Elementary School`) ||
        have($item`Mer-kin dreadscroll`) ||
        get("isMerkinHighPriest"),
      do: $location`Mer-kin Elementary School`,
      peridot: $monster`Mer-kin monitor`,
      outfit: {
        equip: $items`Mer-kin scholar mask, Mer-kin scholar tailpiece, toy Cupid bow, Peridot of Peril, Monodent of the Sea, Everfull Dart Holster, blood cubic zirconia`,
        modifier: "item",
      },
      post: () => {
        use(
          $item`Mer-kin wordquiz`,
          Math.min(itemAmount($item`Mer-kin wordquiz`), itemAmount($item`Mer-kin cheatsheet`))
        );
      },
      limit: { soft: 11 },
    },
    {
      name: "Learn scroll words",
      after: ["Mer-kin Scholar Refract"],
      ready: () => have($item`Mer-kin scholar mask`) && have($item`Mer-kin scholar tailpiece`),
      completed: () =>
        get("isMerkinHighPriest") ||
        have($item`Mer-kin dreadscroll`) ||
        (get("dreadScroll2") !== 0 && get("dreadScroll5") !== 0) ||
        (have($item`Mer-kin scholar mask`) && !have($item`Mer-kin killscroll`)),
      do: $location`Mer-kin Library`,
      combat: new CombatStrategy().macro((): Macro => {
        return Macro.while_(
          "hascombatitem 3594 && hascombatitem 3809",
          Macro.item([$item`Mer-kin killscroll`, $item`Mer-kin healscroll`])
        );
      }, $monsters`Mer-kin alphabetizer, Mer-kin drifter, Mer-kin researcher`),
      outfit: {
        equip: $items`Mer-kin scholar mask, Mer-kin scholar tailpiece, Möbius ring, Monodent of the Sea, Everfull Dart Holster, spring shoes`,
        familiar: $familiar`Peace Turkey`,
      },
      post: () => {
        if (get("dreadScroll5") === 0) {
          pull($item`Mer-kin killscroll`);
        }
      },
      limit: { soft: 11 },
    },
    {
      name: "Learn healscroll words",
      after: ["Learn scroll words"],
      completed: () =>
        have($item`Mer-kin dreadscroll`) ||
        get("dreadScroll2") !== 0 ||
        !have($item`Mer-kin healscroll`),
      do: $location`Mer-kin Library`,
      combat: new CombatStrategy().macro((): Macro => {
        return Macro.while_(
          `hascombatitem 3809 && !match "a magnificent"`,
          Macro.item($item`Mer-kin healscroll`)
        );
      }, $monsters`Mer-kin alphabetizer, Mer-kin drifter, Mer-kin researcher`),
      outfit: {
        equip: $items`Mer-kin scholar mask, Mer-kin scholar tailpiece, Möbius ring, Monodent of the Sea, Everfull Dart Holster, spring shoes`,
        familiar: $familiar`Peace Turkey`,
      },
      post: () => {
        if (get("dreadScroll2") === 0) {
          pull($item`Mer-kin healscroll`);
        }
      },
      limit: { soft: 11 },
    },
  ],
};
