import {
  $coinmaster,
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $monsters,
  $skill,
  AprilingBandHelmet,
  AugustScepter,
  CinchoDeMayo,
  get,
  have,
  Macro,
} from "libram";
import { OutfitSpec, step } from "grimoire-kolmafia";

import {
  abort,
  buy,
  cliExecute,
  inHardcore,
  myHp,
  myMaxhp,
  myMaxmp,
  myMp,
  totalFreeRests,
  use,
  useFamiliar,
  useSkill,
  visitUrl,
} from "kolmafia";
import { Quest } from "../../../engine/task";
import { CombatStrategy } from "../../../engine/combat";
import { pull } from "../util";

function getNumMissingClues() {
  let missingClues = 0;
  for (let i = 1; i <= 8; i++) {
    if (get(`dreadScroll${i}`, 0) === 0) {
      missingClues += 1;
    }
  }
  return missingClues;
}

function firstGuessWasGood(): boolean {
  if (get("dreadScrollGuesses") === "") {
    return false;
  } else {
    const firstGuessAmount = get("dreadScrollGuesses").split(",")[0].split(":")[1];
    return parseInt(firstGuessAmount) < 2;
  }
}

function readyToAbyss(): boolean {
  if (get("spookyVHSTapeMonster") !== null) {
    return get("momSeaMonkeeProgress") < 36;
  } else {
    return get("momSeaMonkeeProgress") < 40;
  }
}

export function freeRest(): boolean {
  if (get("timesRested") >= totalFreeRests()) return false;

  if (myHp() >= myMaxhp() && myMp() >= myMaxmp()) {
    useSkill($skill`Donho's Bubbly Ballad`);
  }

  if (get("chateauAvailable")) {
    visitUrl("place.php?whichplace=chateau&action=chateau_restlabelfree");
  } else if (get("getawayCampsiteUnlocked")) {
    visitUrl("place.php?whichplace=campaway&action=campaway_tentclick");
  } else {
    visitUrl("campground.php?action=rest");
  }

  return true;
}

export const ScholarTask: Quest = {
  name: "Scholar",
  tasks: [
    {
      name: "Get Dreadscroll",
      after: ["Item Run/Learn scroll words"],
      completed: () => have($item`Mer-kin dreadscroll`) || get("isMerkinHighPriest"),
      do: $location`Mer-kin Library`,
      outfit: {
        equip: $items`Mer-kin scholar mask, Mer-kin scholar tailpiece, Möbius ring, Monodent of the Sea, everfull dart holster, spring shoes`,
        familiar: $familiar`Peace Turkey`,
      },
      limit: { soft: 11 },
    },
    {
      name: "Eat nigiri",
      after: ["Get Dreadscroll"],
      completed: () => get("dreadScroll7") !== 0,
      do: () => {
        if (!have($item`Mer-kin worktea`) && !inHardcore()) {
          pull($item`Mer-kin worktea`);
        }
        if (!have($item`white rice`)) {
          buy($item`white rice`);
        }
        if (!have($item`Mer-kin worktea`)) {
          abort("Couldn't get worktea for sushi somehow.");
        }
        cliExecute("create slick nigiri");
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Use knucklebone",
      after: ["Get Dreadscroll"],
      completed: () => get("dreadScroll4") !== 0,
      do: () => {
        if (!have($item`Mer-kin knucklebone`) && !inHardcore()) {
          pull($item`Mer-kin knucklebone`);
        }
        if (!have($item`Mer-kin knucklebone`)) {
          abort("Couldn't get knucklebone for dreadscroll somehow.");
        }
        use($item`Mer-kin knucklebone`);
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Cast Deep Dark Visions",
      after: ["Get Dreadscroll"],
      completed: () => get("dreadScroll3") !== 0,
      do: () => {
        if (!have($effect`Minor Invulnerability`)) {
          use($item`scroll of minor invulnerability`);
        }
        if (myMp() < 200) {
          useSkill($skill`rest upside down`);
        }
        if (myHp() < 500) {
          useSkill($skill`Cannelloni Cocoon`);
        }
        useSkill($skill`Deep Dark Visions`);
      },
      outfit: {
        familiar: $familiar`Exotic Parrot`,
        modifier: "Spooky resistance",
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Kill YogUrt",
      ready: () => get("isMerkinHighPriest"),
      completed: () => get("yogUrtDefeated"),
      prepare: () => {
        buy($coinmaster`Wet Crap For Sale`, 1, $item`sea gel`);
        buy($coinmaster`Wet Crap For Sale`, 1, $item`waterlogged scroll of healing`);
      },
      do: $location`Mer-kin Temple Right Door`,
      combat: new CombatStrategy().macro((): Macro => {
        return Macro.item($item`Mer-kin healscroll`)
          .item($item`waterlogged scroll of healing`)
          .trySkillRepeat($skill`Saucegeyser`);
      }),
      outfit: {
        familiar: $familiar`Peace Turkey`,
        acc1: $item`Mer-kin prayerbeads`,
        acc2: $item`Mer-kin prayerbeads`,
        acc3: $item`Mer-kin prayerbeads`,
        equip: $items`Mer-kin scholar tailpiece, Mer-kin scholar mask, Monodent of the Sea, April shower thoughts shield, bat wings, shark jumper`,
      },
      limit: { soft: 11 },
    },
    {
      // Maybe we failed to get killscroll or healscroll clues. We still want to have at least 5 clues to guess.
      name: "Collect Emergency Dreadscroll Clues",
      after: ["Eat nigiri", "Use knucklebone", "Cast Deep Dark Visions"],
      completed: () => getNumMissingClues() <= 3,
      prepare: () => {
        if (!get("noncombatForcerActive")) {
          if (get("_mcHugeLargeAvalancheUses") < 3) {
            return;
          } else if (CinchoDeMayo.have() && CinchoDeMayo.totalAvailableCinch() >= 60) {
            if (have($familiar`skeleton of crimbo past`)) {
              useFamiliar($familiar`skeleton of crimbo past`);
            }
            while (CinchoDeMayo.currentCinch() < 60) {
              if (!freeRest()) {
                throw "Failed to cinch up!";
              }
            }
            useSkill($skill`Cincho: Fiesta Exit`);
            useFamiliar($familiar`Peace Turkey`);
          } else if (get("_aprilBandTubaUses") < 3) {
            AprilingBandHelmet.play($item`Apriling band tuba`);
          }
        }
      },
      do: $location`Mer-kin Library`,
      combat: new CombatStrategy().macro((): Macro => {
        return Macro.trySkill($skill`McHugeLarge avalanche`);
      }),
      outfit: {
        familiar: $familiar`Peace Turkey`,
        equip: $items`Mer-kin scholar tailpiece, Mer-kin scholar mask, McHugeLarge left ski`,
        modifier: "-combat",
      },
      limit: { soft: 11 },
    },
    {
      name: "Guess Dreadscroll",
      after: ["Collect Emergency Dreadscroll Clues"],
      ready: () => have($item`Mer-kin dreadscroll`) && !have($effect`Deep-Tainted Mind`),
      completed: () => get("isMerkinHighPriest"),
      do: () => {
        use($item`Mer-kin dreadscroll`);
        visitUrl(`main.php`, false);
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Get More Clues",
      ready: () => have($item`Mer-kin dreadscroll`) && get("dreadScrollGuesses") !== "",
      completed: () => get("isMerkinHighPriest") || getNumMissingClues() < 3 || firstGuessWasGood(),
      prepare: () => {
        if (!get("noncombatForcerActive")) {
          if (get("_mcHugeLargeAvalancheUses") < 3) {
            return;
          } else if (CinchoDeMayo.have() && CinchoDeMayo.totalAvailableCinch() >= 60) {
            if (have($familiar`skeleton of crimbo past`)) {
              useFamiliar($familiar`skeleton of crimbo past`);
            }
            while (CinchoDeMayo.currentCinch() < 60) {
              if (!freeRest()) {
                throw "Failed to cinch up!";
              }
            }
            useSkill($skill`Cincho: Fiesta Exit`);
            useFamiliar($familiar`Peace Turkey`);
          } else if (get("_aprilBandTubaUses") < 3) {
            AprilingBandHelmet.play($item`Apriling band tuba`);
          }
        }
      },
      do: $location`Mer-kin Library`,
      combat: new CombatStrategy().macro((): Macro => {
        return Macro.trySkill($skill`McHugeLarge avalanche`);
      }),
      outfit: {
        familiar: $familiar`Peace Turkey`,
        equip: $items`Mer-kin scholar tailpiece, Mer-kin scholar mask, McHugeLarge left ski`,
        modifier: "-combat",
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Do Skate Park",
      after: ["Get More Clues"],
      completed: () => get("skateParkStatus") !== "war",
      prepare: () => {
        if (!get("noncombatForcerActive")) {
          if (get("_mcHugeLargeAvalancheUses") < 3) {
            return;
          } else if (CinchoDeMayo.have() && CinchoDeMayo.totalAvailableCinch() >= 60) {
            if (have($familiar`skeleton of crimbo past`)) {
              useFamiliar($familiar`skeleton of crimbo past`);
            }
            while (CinchoDeMayo.currentCinch() < 60) {
              if (!freeRest()) {
                throw "Failed to cinch up!";
              }
            }
            useSkill($skill`Cincho: Fiesta Exit`);
            useFamiliar($familiar`Peace Turkey`);
          } else if (get("_aprilBandTubaUses") < 3) {
            AprilingBandHelmet.play($item`Apriling band tuba`);
          }
        }
      },
      do: $location`The Skate Park`,
      outfit: () => {
        let equipItems = $items`really\, really nice swimming trunks, möbius ring`;
        if (have($item`skate blade`)) {
          equipItems.push($item`skate blade`);
        }
        return {
          familiar: $familiar`Peace Turkey`,
          equip: equipItems,
          modifier: "-combat",
        };
      },
      post: () => {
        // Otherwise mafia won't update the war status for us
        visitUrl("sea_skatepark.php");
      },
      choices: { 403: 1 },
      limit: { soft: 11 },
    },
    {
      name: "Get Fishy",
      after: ["Do Skate Park"],
      ready: () => get("skateParkStatus") == "ice",
      completed: () => get("_skateBuff1"),
      do: () => {
        visitUrl("sea_skatepark.php?action=state2buff1");
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Finish Dive Bar",
      after: ["Get Fishy"],
      completed: () => get("_unblemishedPearlDiveBar"),
      do: $location`The Dive Bar`,
      combat: new CombatStrategy().kill(),
      outfit: {
        equip: $items`Möbius ring, Everfull Dart Holster, blood cubic zirconia, shark jumper, toy Cupid bow, really\, really nice swimming trunks`,
        familiar: $familiar`Grouper Groupie`,
        modifier: "item",
      },
      limit: { soft: 11 },
    },
    {
      name: "Scholar Abyss",
      after: ["Get Fishy"],
      ready: () => readyToAbyss(),
      completed: () => get("momSeaMonkeeProgress") >= 40,
      do: $location`The Caliginous Abyss`,
      combat: new CombatStrategy().killHard($monsters`Peanut`),
      outfit: () => {
        let baseOutfit: OutfitSpec = {
          familiar: $familiar`Peace Turkey`,
          equip: $items`old SCUBA tank, black glass, shark jumper, scale-mail underwear`,
        };
        if (get("_assertYourAuthorityCast") < 3) {
          baseOutfit.equip!.push(...$items`Sheriff badge, Sheriff moustache, Sheriff pistol`);
        }
        return baseOutfit;
      },
      limit: { soft: 11 },
    },
    {
      name: "Abyss Mom",
      after: ["Scholar Abyss"],
      completed: () => step("questS02Monkees") == 999,
      do: $location`The Caliginous Abyss`,
      outfit: {
        equip: $items`black glass`,
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Gymnasium",
      after: ["Finish Dive Bar", "Get Fishy"],
      prepare: () => {
        if (AprilingBandHelmet.canChangeSong()) {
          AprilingBandHelmet.conduct("Apriling Band Battle Cadence");
        }
        if (!have($effect`Hippy Stench`) && have($item`reodorant`)) {
          use($item`reodorant`);
        }
        if (!have($effect`Fresh Breath`) && AugustScepter.canCast(6)) {
          useSkill($skill`Aug. 6th: Fresh Breath Day!`);
        }
      },
      completed: () =>
        (have($item`Mer-kin thighguard`) && have($item`Mer-kin headguard`)) ||
        have($item`Mer-kin gladiator mask`),
      do: $location`Mer-kin Gymnasium`,
      outfit: {
        equip: $items`Mer-kin scholar mask, Mer-kin scholar tailpiece, spring shoes`,
        familiar: $familiar`jumpsuited hound dog`,
        modifier: "+combat",
      },
      choices: { 701: 1 },
      limit: { soft: 11 },
    },
    {
      name: "Anemone Mine Stalling",
      after: ["Gymnasium"],
      completed: () => get("isMerkinHighPriest") || get("_unblemishedPearlAnemoneMine"),
      do: $location`Anemone Mine`,
      combat: new CombatStrategy().kill(),
      outfit: {
        equip: $items`Möbius ring, Everfull Dart Holster, blood cubic zirconia, shark jumper, toy Cupid bow, really\, really nice swimming trunks`,
        familiar: $familiar`Peace Turkey`,
      },
      limit: { soft: 11 },
    },
  ],
};
