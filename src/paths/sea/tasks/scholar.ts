import {
  $coinmaster,
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $monsters,
  $skill,
  get,
  have,
  Macro,
} from "libram";

import {
  buy,
  cliExecute,
  closetAmount,
  itemAmount,
  myHp,
  myMaxhp,
  myMaxmp,
  myMp,
  putCloset,
  takeCloset,
  totalFreeRests,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
import { Quest, Resources } from "../../../engine/task";
import { CombatStrategy } from "../../../engine/combat";

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
      name: "Elementary School",
      after: ["Currents/Seahorse"],
      completed: () =>
        (have($item`Mer-kin scholar mask`) || have($item`Mer-kin facecowl`)) &&
        (have($item`Mer-kin scholar tailpiece`) || have($item`Mer-kin waistrope`)),
      prepare: () => {
        // Only use hallpasses once the teacher's lounge is unlocked
        if (get("merkinElementaryTeacherUnlock")) {
          if (closetAmount($item`Mer-kin hallpass`) > 0) {
            takeCloset($item`Mer-kin hallpass`, closetAmount($item`Mer-kin hallpass`));
          }
        } else {
          if (itemAmount($item`Mer-kin hallpass`) > 0) {
            putCloset(itemAmount($item`Mer-kin hallpass`), $item`Mer-kin hallpass`);
          }
        }
      },
      do: $location`Mer-kin Elementary School`,
      choices: {
        705: 4,
      },
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.ifNot(
            "monstername time cop",
            Macro.trySkill($skill`Sea *dent: Talk to Some Fish`)
          ).skill($skill`BCZ: Refracted Gaze`);
        })
        .kill(),
      resources: () => {
        if (get("merkinElementaryTeacherUnlock")) return undefined;
        return {
          which: Resources.NCForce,
          benefit: 5,
        };
      },
      outfit: {
        equip: $items`crappy Mer-kin mask, crappy Mer-kin tailpiece, Monodent of the Sea, blood cubic zirconia, Everfull Dart Holster, McHugeLarge left ski, toy Cupid bow`,
        modifier: "item",
      },
      limit: { soft: 11 },
    },
    {
      name: "Study Wordquiz",
      after: ["Currents/Seahorse"],
      ready: () => have($item`Mer-kin wordquiz`) && have($item`Mer-kin cheatsheet`),
      completed: () => get("merkinVocabularyMastery") >= 60,
      do: () => use($item`Mer-kin wordquiz`),
      freeaction: true,
      limit: { tries: 10 },
    },
    {
      name: "Study Wordquiz Bonus",
      after: ["Study Wordquiz"],
      ready: () => have($item`Mer-kin wordquiz`) && have($item`Mer-kin cheatsheet`),
      completed: () => get("merkinVocabularyMastery") >= 100,
      do: () => use($item`Mer-kin wordquiz`),
      freeaction: true,
      limit: { tries: 10 },
    },
    {
      name: "Outfit",
      after: ["Elementary School", "Study Wordquiz"],
      completed: () =>
        get("yogUrtDefeated") ||
        (have($item`Mer-kin scholar mask`) && have($item`Mer-kin scholar tailpiece`)),
      do: () => {
        visitUrl("shop.php?whichshop=grandma");
        if (have($item`crappy Mer-kin mask`)) {
          visitUrl("shop.php?whichshop=grandma&action=buyitem&quantity=1&whichrow=129&pwd");
        }
        if (have($item`crappy Mer-kin tailpiece`)) {
          visitUrl("shop.php?whichshop=grandma&action=buyitem&quantity=1&whichrow=130&pwd");
        }
      },
      underwater: true,
      limit: { tries: 1 },
    },
    {
      name: "Library Items",
      after: ["Outfit"],
      completed: () => {
        if (!have($item`Mer-kin knucklebone`) && get("dreadScroll4") === 0) return false;
        if (!have($item`Mer-kin worktea`) && get("dreadScroll7") === 0) return false;
        return true;
      },
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
      limit: { soft: 11 },
    },
    {
      name: "Library Scrolls",
      after: ["Library Items"],
      completed: () => get("dreadScroll2") !== 0 && get("dreadScroll5") !== 0,
      do: $location`Mer-kin Library`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          const result = new Macro();

          if (get("dreadScroll2") === 0) {
            result.while_(
              `hascombatitem 3809 && !match "a magnificent"`,
              Macro.item($item`Mer-kin healscroll`)
            );
          }
          if (get("dreadScroll5") === 0) {
            result.while_(`hascombatitem 3594`, Macro.item($item`Mer-kin killscroll`));
          }
          return result;
        }, $monsters`Mer-kin alphabetizer, Mer-kin drifter, Mer-kin researcher`)
        .kill(),
      outfit: {
        equip: $items`Mer-kin scholar mask, Mer-kin scholar tailpiece, toy Cupid bow, Möbius ring, Monodent of the Sea, Everfull Dart Holster, blood cubic zirconia`,
        modifier: "item",
      },
      limit: { soft: 11 },
    },
    {
      name: "Get Dreadscroll",
      after: ["Library Scrolls"],
      completed: () => have($item`Mer-kin dreadscroll`) || get("isMerkinHighPriest"),
      do: $location`Mer-kin Library`,
      outfit: {
        equip: $items`Mer-kin scholar mask, Mer-kin scholar tailpiece`,
        familiar: $familiar`Peace Turkey`,
        modifier: "-combat",
      },
      limit: { soft: 11 },
    },
    {
      name: "Eat nigiri",
      after: ["Get Dreadscroll"],
      ready: () => have($item`Mer-kin worktea`),
      completed: () => get("dreadScroll7") !== 0,
      do: () => {
        if (!have($item`white rice`)) {
          buy($item`white rice`);
        }
        cliExecute("create slick nigiri");
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Use knucklebone",
      after: ["Get Dreadscroll"],
      ready: () => have($item`Mer-kin knucklebone`),
      completed: () => get("dreadScroll4") !== 0,
      do: () => use($item`Mer-kin knucklebone`),
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
          useSkill($skill`Rest upside down`);
        }
        if (myHp() < 500) {
          useSkill($skill`Cannelloni Cocoon`);
        }
        useSkill($skill`Deep Dark Visions`);
      },
      outfit: {
        familiar: $familiar`Exotic Parrot`,
        modifier: "spooky res",
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Guess Dreadscroll",
      after: [
        "Eat nigiri",
        "Use knucklebone",
        "Cast Deep Dark Visions",
        "Library Scrolls",
        "Get Dreadscroll",
      ],
      ready: () => !have($effect`Deep-Tainted Mind`),
      completed: () => get("isMerkinHighPriest"),
      do: () => {
        use($item`Mer-kin dreadscroll`);
        visitUrl(`main.php`, false);
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
      // eslint-disable-next-line libram/verify-constants
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
        equip: $items`Mer-kin scholar tailpiece, Mer-kin scholar mask, Monodent of the Sea, April Shower Thoughts shield, bat wings, shark jumper`,
      },
      limit: { soft: 11 },
    },
    {
      name: "Get More Clues",
      after: ["Get Dreadscroll"],
      ready: () => get("dreadScrollGuesses") !== "",
      completed: () => get("isMerkinHighPriest") || getNumMissingClues() < 3 || firstGuessWasGood(),
      do: $location`Mer-kin Library`,
      resources: () => {
        return {
          which: Resources.NCForce,
          benefit: 5,
        };
      },
      outfit: {
        familiar: $familiar`Peace Turkey`,
        equip: $items`Mer-kin scholar tailpiece, Mer-kin scholar mask, McHugeLarge left ski`,
        modifier: "-combat",
      },
      limit: { soft: 11 },
    },
  ],
};
