import {
  availableAmount,
  buy,
  cliExecute,
  haveEquipped,
  itemAmount,
  myMaxmp,
  myMeat,
  runChoice,
  use,
  visitUrl,
} from "kolmafia";
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
  byStat,
  DaylightShavings,
  ensureEffect,
  get,
  have,
  Macro,
  uneffect,
} from "libram";
import { Quest, Task } from "../engine/task";
import { OutfitSpec, step } from "grimoire-kolmafia";
import { Priorities } from "../engine/priority";
import { CombatStrategy } from "../engine/combat";
import { atLevel, debug, haveLoathingIdolMicrophone } from "../lib";
import { councilSafe } from "./level12";
import { customRestoreMp } from "../engine/moods";
import { tryPlayApriling } from "../engine/resources";

const Diary: Task[] = [
  {
    name: "Forest",
    after: ["Start"],
    prepare: () => {
      tryPlayApriling("+combat");
    },
    completed: () => step("questL11Black") >= 2,
    do: $location`The Black Forest`,
    post: () => {
      if (have($effect`Really Quite Poisoned`)) uneffect($effect`Really Quite Poisoned`);
    },
    outfit: () => {
      const equip = [$item`blackberry galoshes`];
      if (have($item`latte lovers member's mug`) && !get("latteUnlocks").includes("cajun")) {
        equip.push($item`latte lovers member's mug`);
      }
      if (have($item`candy cane sword cane`) && !get("candyCaneSwordBlackForest", false))
        equip.push($item`candy cane sword cane`);

      if (have($item`reassembled blackbird`)) {
        return {
          equip: equip,
          modifier: "50 combat 5max, -1ML",
        };
      }

      return {
        equip: equip,
        familiar: $familiar`Reassembled Blackbird`,
        modifier: "50 combat 5max, item, -1ML",
        avoid: $items`broken champagne bottle`,
      };
    },
    choices: () => {
      return {
        923: 1,
        924: beeOption(),
        928: 4,
        1018: 1,
        1019: 1,
      };
    },
    combat: new CombatStrategy()
      .ignore($monster`blackberry bush`)
      .killItem($monsters`black adder, black panther`)
      .kill(),
    orbtargets: () => undefined, // do not dodge anything with orb
    limit: { soft: 15 },
  },
  {
    name: "Buy Documents",
    after: ["Forest"],
    ready: () => myMeat() >= 5000,
    completed: () => have($item`forged identification documents`) || step("questL11Black") >= 4,
    do: (): void => {
      visitUrl("woods.php");
      visitUrl("shop.php?whichshop=blackmarket");
      visitUrl("shop.php?whichshop=blackmarket&action=buyitem&whichrow=281&ajax=1&quantity=1");
    },
    outfit: { equip: $items`designer sweatpants` },
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Diary",
    after: ["Buy Documents", "Misc/Unlock Beach"],
    ready: () => myMeat() >= 500,
    completed: () => step("questL11Black") >= 4,
    do: $location`The Shore, Inc. Travel Agency`,
    post: (): void => {
      if (step("questL11Black") < 4) {
        debug("Possible mafia diary desync detected; refreshing...");
        cliExecute("refresh all");
        if (have($item`your father's MacGuffin diary`)) use($item`your father's MacGuffin diary`);
        visitUrl("questlog.php?which=1");
      }
    },
    choices: { 793: 1 },
    limit: { tries: 1 },
  },
];

const Desert: Task[] = [
  {
    name: "Scrip",
    after: ["Misc/Unlock Beach", "Misc/Unlock Island"],
    ready: () => myMeat() >= 6000 || (step("questL11Black") >= 4 && myMeat() >= 500),
    completed: () => have($item`Shore Inc. Ship Trip Scrip`) || have($item`UV-resistant compass`),
    do: $location`The Shore, Inc. Travel Agency`,
    outfit: () => {
      if (!get("candyCaneSwordShore")) return { equip: $items`candy cane sword cane` };
      else return {};
    },
    choices: () => {
      const swordReady = haveEquipped($item`candy cane sword cane`) && !get("candyCaneSwordShore");
      const statChoice = byStat({
        Muscle: 1,
        Mysticality: 2,
        Moxie: 3,
      });
      return { 793: swordReady ? 5 : statChoice };
    },
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Compass",
    after: ["Misc/Unlock Beach", "Scrip"],
    completed: () => have($item`UV-resistant compass`),
    do: () => buy($coinmaster`The Shore, Inc. Gift Shop`, 1, $item`UV-resistant compass`),
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Oasis",
    after: ["Compass"],
    completed: () => get("desertExploration") >= 100,
    ready: () => !have($effect`Ultrahydrated`) && get("oasisAvailable", false),
    do: $location`The Oasis`,
    limit: { soft: 10 },
  },
  {
    name: "Oasis Drum",
    after: ["Compass"],
    ready: () => have($item`worm-riding hooks`) || itemAmount($item`worm-riding manual page`) >= 15,
    priority: () => (have($effect`Ultrahydrated`) ? Priorities.MinorEffect : Priorities.None),
    completed: () =>
      get("desertExploration") >= 100 ||
      have($item`drum machine`) ||
      (get("gnasirProgress") & 16) !== 0,
    do: $location`The Oasis`,
    combat: new CombatStrategy().killItem($monster`blur`),
    outfit: { modifier: "item", avoid: $items`broken champagne bottle` },
    limit: { soft: 15 },
    post: (): void => {
      if (!visitUrl("place.php?whichplace=desertbeach").includes("action=db_gnasir")) return;
      if (
        itemAmount($item`worm-riding manual page`) >= 15 ||
        ((get("gnasirProgress") & 1) === 0 && have($item`stone rose`)) ||
        ((get("gnasirProgress") & 2) === 0 && have($item`can of black paint`)) ||
        ((get("gnasirProgress") & 4) === 0 && have($item`killing jar`))
      ) {
        let res = visitUrl("place.php?whichplace=desertbeach&action=db_gnasir");
        while (res.includes("value=2")) {
          res = runChoice(2);
        }
        runChoice(1);
      }
      cliExecute("use * desert sightseeing pamphlet");
      if (have($item`worm-riding hooks`) && have($item`drum machine`)) use($item`drum machine`);
    },
    parachute: $monster`blur`,
  },
  {
    name: "Milestone",
    after: ["Misc/Unlock Beach", "Diary"],
    ready: () => have($item`milestone`),
    completed: () => !have($item`milestone`) || get("desertExploration") >= 100,
    do: () => use($item`milestone`, availableAmount($item`milestone`)),
    limit: { tries: 5 }, // 5 to account for max of starting, poke garden & pull
    freeaction: true,
  },
  {
    name: "Desert",
    after: ["Diary", "Compass"],
    acquire: [{ item: $item`can of black paint`, useful: () => (get("gnasirProgress") & 2) === 0 }],
    ready: () => {
      const cond =
        (have($item`can of black paint`) ||
          myMeat() >= 1000 ||
          (get("gnasirProgress") & 2) !== 0) &&
        itemAmount($item`worm-riding manual page`) < 15 &&
        !have($item`worm-riding hooks`) &&
        ((!get("oasisAvailable", false) && !have($effect`A Girl Named Sue`)) ||
          have($effect`Ultrahydrated`));
      return cond;
    },
    priority: () => (have($effect`Ultrahydrated`) ? Priorities.MinorEffect : Priorities.None),
    completed: () => get("desertExploration") >= 100,
    do: $location`The Arid, Extra-Dry Desert`,
    outfit: (): OutfitSpec => {
      if (
        !have($skill`Just the Facts`) &&
        have($item`industrial fire extinguisher`) &&
        get("_fireExtinguisherCharge") >= 20 &&
        !get("fireExtinguisherDesertUsed") &&
        have($effect`Ultrahydrated`)
      )
        return {
          equip: $items`survival knife, industrial fire extinguisher, UV-resistant compass, dromedary drinking helmet`,
          familiar: $familiar`Melodramedary`,
          avoid: $items`Roman Candelabra, backup camera`,
        };
      else
        return {
          equip: $items`survival knife, UV-resistant compass, dromedary drinking helmet`,
          familiar: $familiar`Melodramedary`,
          avoid: $items`Roman Candelabra, backup camera`,
        };
    },
    combat: new CombatStrategy()
      .macro((): Macro => {
        if (
          !have($skill`Just the Facts`) &&
          have($effect`Ultrahydrated`) &&
          have($item`industrial fire extinguisher`) &&
          get("_fireExtinguisherCharge") >= 20 &&
          !get("fireExtinguisherDesertUsed")
        )
          return new Macro().trySkill($skill`Fire Extinguisher: Zone Specific`);
        else return new Macro();
      })
      .kill(),
    post: (): void => {
      if (!visitUrl("place.php?whichplace=desertbeach").includes("action=db_gnasir")) return;
      if ((get("gnasirProgress") & 16) > 0) return;
      if (
        itemAmount($item`worm-riding manual page`) >= 15 ||
        ((get("gnasirProgress") & 1) === 0 && have($item`stone rose`)) ||
        ((get("gnasirProgress") & 2) === 0 && have($item`can of black paint`)) ||
        ((get("gnasirProgress") & 4) === 0 && have($item`killing jar`))
      ) {
        let res = visitUrl("place.php?whichplace=desertbeach&action=db_gnasir");
        while (res.includes("value=2")) {
          res = runChoice(2);
        }
        runChoice(1);
      }
      cliExecute("use * desert sightseeing pamphlet");
      if (have($item`worm-riding hooks`) && have($item`drum machine`)) use($item`drum machine`);
    },
    limit: { soft: 30 },
    choices: { 805: 1 },
  },
];

function rotatePyramid(goal: number): void {
  const ratchets = (goal - get("pyramidPosition") + 5) % 5;
  const to_buy =
    ratchets - itemAmount($item`tomb ratchet`) - itemAmount($item`crumbling wooden wheel`);
  if (to_buy > 0) {
    buy($item`tomb ratchet`, to_buy);
  }
  visitUrl("place.php?whichplace=pyramid&action=pyramid_control");
  for (let i = 0; i < ratchets; i++) {
    if (have($item`crumbling wooden wheel`)) {
      visitUrl("choice.php?whichchoice=929&option=1&pwd");
    } else {
      visitUrl("choice.php?whichchoice=929&option=2&pwd");
    }
  }
  if (get("pyramidPosition") !== goal) throw `Failed to rotate pyramid to ${goal}`;
  visitUrl("choice.php?whichchoice=929&option=5&pwd");
}

const Pyramid: Task[] = [
  {
    name: "Open Pyramid",
    after: ["Desert", "Oasis", "Oasis Drum", "Manor/Boss", "Palindome/Boss", "Hidden City/Boss"],
    completed: () => step("questL11Pyramid") >= 0,
    do: () => visitUrl("place.php?whichplace=desertbeach&action=db_pyramid1"),
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Upper Chamber",
    after: ["Open Pyramid"],
    completed: () => step("questL11Pyramid") >= 1,
    do: $location`The Upper Chamber`,
    outfit: { modifier: "+combat" },
    limit: { turns: 6 },
  },
  {
    name: "Middle Chamber",
    after: ["Upper Chamber"],
    prepare: () => {
      if (haveLoathingIdolMicrophone()) {
        ensureEffect($effect`Spitting Rhymes`);
      }
      if (have($item`tangle of rat tails`) && myMaxmp() >= 80) {
        customRestoreMp(80); // Weaksauce + 3x saucegeyser
      }
    },
    completed: () => {
      if (get("pyramidBombUsed")) return true;
      const ratchets = itemAmount($item`tomb ratchet`) + itemAmount($item`crumbling wooden wheel`);
      const needed = have($item`ancient bomb`) ? 3 : have($item`ancient bronze token`) ? 7 : 10;
      return ratchets >= needed;
    },
    do: $location`The Middle Chamber`,
    limit: { soft: 30 },
    combat: new CombatStrategy()
      .macro(() => {
        const result = Macro.tryItem($item`tangle of rat tails`)
          .trySkill($skill`Otoscope`)
          .trySkill($skill`Curse of Weaksauce`);
        if (have($skill`Saucegeyser`))
          return result.while_("!mpbelow 24", Macro.skill($skill`Saucegeyser`));
        return result;
      }, $monster`tomb rat`)
      .killItem([$monster`tomb rat`, $monster`tomb rat king`])
      .banish([$monster`tomb asp`, $monster`tomb servant`]),
    outfit: () => {
      const result: OutfitSpec = { modifier: "item", equip: [] };
      if (have($item`Lil' Doctor™ bag`) && get("_otoscopeUsed") < 3)
        result.equip?.push($item`Lil' Doctor™ bag`);
      else result.equip?.push($item`deft pirate hook`);
      if (DaylightShavings.nextBuff() === $effect`Spectacle Moustache`)
        result.equip?.push($item`Daylight Shavings Helmet`);
      return result;
    },
    delay: 9,
  },
  {
    name: "Middle Chamber Delay",
    after: ["Upper Chamber", "Middle Chamber"],
    prepare: () => {
      if (haveLoathingIdolMicrophone()) {
        ensureEffect($effect`Spitting Rhymes`);
      }
    },
    completed: () => {
      if (!get("controlRoomUnlock")) return false;
      if (get("pyramidBombUsed")) return true;
      const ratchets = itemAmount($item`tomb ratchet`) + itemAmount($item`crumbling wooden wheel`);
      const needed = have($item`ancient bomb`) ? 3 : have($item`ancient bronze token`) ? 7 : 10;
      return ratchets >= needed;
    },
    do: $location`The Middle Chamber`,
    limit: { soft: 30 },
    combat: new CombatStrategy().ignore(),
    delay: 9,
  },
  {
    name: "Get Token",
    after: ["Middle Chamber Delay"],
    completed: () =>
      have($item`ancient bronze token`) || have($item`ancient bomb`) || get("pyramidBombUsed"),
    do: () => rotatePyramid(4),
    limit: { tries: 1 },
  },
  {
    name: "Get Bomb",
    after: ["Get Token"],
    completed: () => have($item`ancient bomb`) || get("pyramidBombUsed"),
    do: () => rotatePyramid(3),
    limit: { tries: 1 },
  },
  {
    name: "Use Bomb",
    after: ["Get Bomb"],
    completed: () => get("pyramidBombUsed"),
    do: () => rotatePyramid(1),
    limit: { tries: 1 },
  },
  {
    name: "Boss",
    after: ["Use Bomb"],
    completed: () => step("questL11Pyramid") === 999,
    do: () => visitUrl("place.php?whichplace=pyramid&action=pyramid_state1a"),
    post: () => {
      // Autunmaton returning is not properly tracked
      cliExecute("refresh all");
    },
    outfit: () => {
      if (!have($item`Pick-O-Matic lockpicks`))
        return { familiar: $familiar`Gelatinous Cubeling` }; // Ensure we get equipment
      else return {};
    },
    combat: new CombatStrategy().killHard(),
    limit: { tries: 1 },
    boss: true,
  },
];

export const MacguffinQuest: Quest = {
  name: "Macguffin",
  tasks: [
    {
      name: "Start",
      after: [],
      ready: () => atLevel(11),
      priority: () => Priorities.Free, // Always start this quest ASAP, it is key for routing
      completed: () => step("questL11MacGuffin") !== -1,
      do: () => visitUrl("council.php"),
      limit: { tries: 1 },
      freeaction: true,
    },
    ...Diary,
    ...Desert,
    ...Pyramid,
    {
      name: "Finish",
      after: ["Boss"],
      priority: () => (councilSafe() ? Priorities.Free : Priorities.BadMood),
      completed: () => step("questL11MacGuffin") === 999,
      do: () => visitUrl("council.php"),
      limit: { tries: 1 },
      freeaction: true,
    },
  ],
};

function beeOption(): number {
  if (!have($familiar`Shorter-Order Cook`) && !have($item`beehive`)) return 3;
  if (!have($item`blackberry galoshes`) && itemAmount($item`blackberry`) >= 3) return 2;
  return 1;
}
