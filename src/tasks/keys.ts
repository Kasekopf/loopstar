import {
  buy,
  cliExecute,
  equip,
  equippedItem,
  getProperty,
  haveEquipped,
  inCasual,
  inHardcore,
  Item,
  itemAmount,
  mallPrice,
  myClass,
  myTurncount,
  numericModifier,
  pullsRemaining,
  runChoice,
  storageAmount,
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
  $monsters,
  $skill,
  $slots,
  BeachComb,
  ensureEffect,
  FloristFriar,
  get,
  have,
  Macro,
  set,
  SourceTerminal,
  uneffect,
} from "libram";
import { CombatStrategy } from "../engine/combat";
import { Quest, Task } from "../engine/task";
import { step } from "grimoire-kolmafia";
import { args, toTempPref } from "../args";
import { trainSetAvailable } from "./misc";
import { haveFlorest, underStandard } from "../lib";
import { castWithMpSwaps, ensureWithMPSwaps } from "../engine/moods";
import { Priorities } from "../engine/priority";

export enum Keys {
  Deck = "Deck",
  Lockpicking = "Manual of Lock Picking",
  Malware = "Daily Dungeon Malware",
  CandyCane = "Daily Dungeon Candy Cane",
  Dungeon = "Daily Dungeon",
  Fantasy = "Fantasy",
  Zap = "Zap",
  Zap2 = "Zap2",
}

type KeyTask = Omit<Task, "name"> & { which: Keys; possible: () => boolean | undefined };
const heroKeys: KeyTask[] = [
  {
    which: Keys.Deck,
    possible: () => have($item`Deck of Every Card`) && get("_deckCardsDrawn") === 0,
    after: [],
    completed: () => get("_deckCardsDrawn") > 0 || !have($item`Deck of Every Card`),
    do: () => {
      cliExecute("cheat tower");
      if (get("_deckCardsDrawn") <= 10) cliExecute("cheat sheep");
      if (get("_deckCardsDrawn") <= 10) {
        if (trainSetAvailable()) cliExecute("cheat island");
        else cliExecute("cheat mine");
      }
    },
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    which: Keys.Lockpicking,
    possible: () => have($skill`Lock Picking`) && !get("lockPicked"),
    after: [],
    completed: () => !have($skill`Lock Picking`) || get("lockPicked"),
    do: () => castWithMpSwaps([$skill`Lock Picking`]),
    choices: () => {
      return {
        1414: have($item`Boris's key`) ? (have($item`Jarlsberg's key`) ? 3 : 2) : 1,
      };
    },
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    which: Keys.CandyCane,
    possible: () =>
      !get("dailyDungeonDone") &&
      have($item`candy cane sword cane`) &&
      get("_lastDailyDungeonRoom") < 10 &&
      !get("candyCaneSwordDailyDungeon", false),
    ready: () =>
      step("questL13Final") !== -1 ||
      (have($item`Pick-O-Matic lockpicks`) &&
        have($item`ring of Detect Boring Doors`) &&
        have($item`eleven-foot pole`)),
    completed: () => get("dailyDungeonDone"),
    after: ["Daily Dungeon Malware"],
    ...dailyDungeonTask(),
  },
  {
    which: Keys.Dungeon,
    possible: () => !get("dailyDungeonDone"),
    completed: () => get("dailyDungeonDone"),
    after: ["Daily Dungeon Malware", "Daily Dungeon Candy Cane"],
    ...dailyDungeonTask(),
  },
  {
    which: Keys.Malware,
    possible: () =>
      !underStandard() &&
      !get("dailyDungeonDone") &&
      !get("_dailyDungeonMalwareUsed") &&
      ((!inHardcore() && (pullsRemaining() > 0 || myTurncount() >= 1000)) ||
        have($item`daily dungeon malware`)) &&
      (!have($item`Deck of Every Card`) || !have($skill`Lock Picking`)),
    completed: () => get("dailyDungeonDone") || get("_dailyDungeonMalwareUsed"),
    after: [],
    ...dailyDungeonTask(),
  },
  {
    which: Keys.Fantasy,
    possible: () => (get("frAlways") || get("_frToday")) && !underStandard(),
    after: ["Misc/Open Fantasy"],
    completed: () => $location`The Bandit Crossroads`.turnsSpent >= 5,
    priority: () => {
      if (
        have($item`Everfull Dart Holster`) &&
        !have($effect`Everything Looks Red`) &&
        myTurncount() >= 30
      ) {
        return Priorities.GoodDarts;
      }
      return Priorities.None;
    },
    do: $location`The Bandit Crossroads`,
    outfit: {
      familiar: $familiar`none`,
      equip: $items`FantasyRealm G. E. M.`,
      modifier: "moxie",
    },
    combat: new CombatStrategy().kill(),
    limit: { tries: 5 },
  },
  {
    which: Keys.Zap,
    possible: () => get("lastZapperWandExplosionDay") <= 0,
    after: ["Wand/Wand", "Pull/Key Zappable"],
    completed: () => get("lastZapperWandExplosionDay") >= 1 || get("_zapCount") >= 1,
    do: () => {
      unequipAcc(keyStrategy.getZapChoice(0));
      if (!inCasual()) {
        if (!have(keyStrategy.getZapChoice(0)) && myTurncount() >= 1000)
          buy(keyStrategy.getZapChoice(0), 1, 100000);
      }
      cliExecute(`zap ${keyStrategy.getZapChoice(0)}`);
    },
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    which: Keys.Zap2,
    possible: () => get("lastZapperWandExplosionDay") <= 0,
    after: ["Wand/Wand", "Keys/Zap", "Pull/Key Zappable 2"],
    completed: () => get("lastZapperWandExplosionDay") >= 1 || get("_zapCount") >= 2,
    do: () => {
      unequipAcc(keyStrategy.getZapChoice(1));
      if (!inCasual()) {
        if (!have(keyStrategy.getZapChoice(1)) && myTurncount() >= 1000)
          buy(keyStrategy.getZapChoice(1), 1, 100000);
      }
      cliExecute(`zap ${keyStrategy.getZapChoice(1)}`);
    },
    limit: { tries: 1 },
    freeaction: true,
  },
];

function dailyDungeonTask(): Omit<Task, "completed" | "name" | "after"> {
  return {
    ready: () =>
      step("questL13Final") !== -1 ||
      (have($item`Pick-O-Matic lockpicks`) &&
        have($item`ring of Detect Boring Doors`) &&
        have($item`eleven-foot pole`)),
    prepare: () => {
      if (have($item`daily dungeon malware`))
        set(toTempPref("malware_amount"), itemAmount($item`daily dungeon malware`));
      if (have($item`Pick-O-Matic lockpicks`)) return;
      if (have($item`Platinum Yendorian Express Card`)) return;
      if (have($item`skeleton bone`) && have($item`loose teeth`) && !have($item`skeleton key`))
        cliExecute("make skeleton key");
    },
    do: $location`The Daily Dungeon`,
    post: () => {
      if (itemAmount($item`daily dungeon malware`) < get(toTempPref("malware_amount"), 0))
        set("_dailyDungeonMalwareUsed", true);
      uneffect($effect`Apathy`);
      cliExecute("refresh inv");
    },
    outfit: { equip: $items`ring of Detect Boring Doors, candy cane sword cane` },
    combat: new CombatStrategy()
      .macro(() => {
        if (
          !get("_dailyDungeonMalwareUsed") &&
          have($item`daily dungeon malware`) &&
          keyStrategy.useful(Keys.Malware)
        )
          return Macro.tryItem($item`daily dungeon malware`);
        return new Macro();
      })
      .killHard(),
    choices: () => {
      return {
        689: 1,
        690: have($item`ring of Detect Boring Doors`) ? 2 : 3,
        691: 3, // Do not skip the second chest; there is a chance we skip all the monsters
        692: getDoorSolution(),
        693: have($item`eleven-foot pole`) ? 2 : 1,
      };
    },
    expectbeatenup: () => get("lastEncounter") === "I Wanna Be a Door",
    limit: { tries: 15 },
  };
}

enum KeyState {
  DONE = "Done",
  READY = "Ready",
  MAYBE = "Maybe",
  UNNEEDED = "Unneeded",
  IMPOSSIBLE = "Impossible",
}

export class KeyStrategy {
  plan = new Map<Keys, KeyState>();
  tasks: KeyTask[];
  zap_choice?: Item[];

  constructor(tasks: KeyTask[]) {
    this.tasks = tasks;
  }

  public update(): void {
    const keysNeeded = Math.max(0, 3 - keyCount());

    let sureKeys = 0; // Number of keys we have definitely planned.
    let maybeKeys = 0; // Number of keys we plan to attempt if possible.
    for (const task of this.tasks) {
      // If we have already guaranteed all keys, no more are needed
      if (sureKeys >= keysNeeded) {
        this.plan.set(task.which, KeyState.UNNEEDED);
        continue;
      }

      switch (task.possible()) {
        case false:
          // This key is impossible to get.
          this.plan.set(task.which, KeyState.IMPOSSIBLE);
          break;
        case true:
          // If all the maybe-keys above succeed, then there is no need for this key. So set our state to maybe.
          // If there are not enough maybe-keys above, then we plan to do this key.
          this.plan.set(task.which, maybeKeys < keysNeeded ? KeyState.READY : KeyState.MAYBE);
          sureKeys++;
          maybeKeys++;
          break;
        case undefined:
          // The key is maybe possible to get.
          this.plan.set(task.which, KeyState.MAYBE);
          maybeKeys++;
      }
    }

    if (sureKeys < keysNeeded && !args.debug.ignorekeys) {
      const info = Array.from(this.plan.entries())
        .map((keyinfo) => keyinfo.join("="))
        .join("; ");
      throw `Can only guarantee ${sureKeys} of ${keysNeeded} keys. (${info})`;
    }
  }

  public useful(key: Keys): boolean | undefined {
    if (this.plan.get(key) === KeyState.READY) return true;
    if (this.plan.get(key) === KeyState.MAYBE) return undefined;
    return false;
  }

  public getZapChoice(which: 0 | 1): Item {
    if (!this.zap_choice) {
      this.zap_choice = makeZapChoice();
    }
    return this.zap_choice[which];
  }
}
export const keyStrategy = new KeyStrategy(heroKeys);

export const KeysQuest: Quest = {
  name: "Keys",
  tasks: [
    ...keyStrategy.tasks.map((task) => {
      return {
        ...task,
        name: task.which,
        completed: () =>
          task.completed() ||
          keyStrategy.plan.get(task.which) === KeyState.DONE ||
          keyStrategy.plan.get(task.which) === KeyState.UNNEEDED ||
          keyStrategy.plan.get(task.which) === KeyState.IMPOSSIBLE,
        ready: () =>
          (task.ready === undefined || task.ready()) &&
          keyStrategy.plan.get(task.which) === KeyState.READY,
      };
    }),
    {
      name: "All Heroes",
      after: keyStrategy.tasks.map((task) => task.which),
      completed: () => keyCount() >= 3,
      do: (): void => {
        throw "Unable to obtain enough fat loot tokens";
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Star Key",
      after: ["Giant/Unlock HITS"],
      completed: () =>
        (have($item`star chart`) && itemAmount($item`star`) >= 8 && itemAmount($item`line`) >= 7) ||
        have($item`Richard's star key`) ||
        get("nsTowerDoorKeysUsed").includes("Richard's star key"),
      do: $location`The Hole in the Sky`,
      outfit: { modifier: "item", avoid: $items`broken champagne bottle` },
      combat: new CombatStrategy().kill($monster`Astronomer`).killItem(),
      limit: { soft: 20 },
      orbtargets: () => (!have($item`star chart`) ? [$monster`Astronomer`] : []),
    },
    {
      name: "Skeleton Key",
      after: ["Crypt/Nook Boss", "Tower/Start"],
      prepare: () => {
        if (step("questM23Meatsmith") === -1) {
          visitUrl("shop.php?whichshop=meatsmith");
          visitUrl("shop.php?whichshop=meatsmith&action=talk");
          runChoice(1);
        }
      },
      completed: () =>
        (have($item`skeleton bone`) && have($item`loose teeth`)) ||
        have($item`skeleton key`) ||
        get("nsTowerDoorKeysUsed").includes("skeleton key"),
      outfit: { modifier: "item", avoid: $items`broken champagne bottle` },
      combat: new CombatStrategy()
        .killItem($monsters`factory-irregular skeleton, remaindered skeleton, swarm of skulls`)
        .banish($monster`novelty tropical skeleton`),
      do: $location`The Skeleton Store`,
      limit: { soft: 10 },
    },
  ],
};

export const DigitalQuest: Quest = {
  name: "Digital",
  tasks: [
    {
      name: "Open",
      after: ["Mosquito/Start", "Misc/Check Florist"],
      completed: () => have($item`continuum transfunctioner`),
      do: () => {
        visitUrl("place.php?whichplace=forestvillage&action=fv_mystic");
        runChoice(1);
        runChoice(1);
        runChoice(1);
      },
      choices: { 664: 1 },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Fungus",
      after: ["Open"],
      completed: () => getScore() >= 10000,
      ready: () => get("8BitColor", "black") === "red",
      prepare: () => {
        if (numericModifier("meat drop") < 450 && have($item`flapper fly`)) {
          ensureEffect($effect`Flapper Dancin'`);
        }
      },
      do: $location`The Fungus Plains`,
      outfit: {
        modifier: "meat",
        equip: $items`continuum transfunctioner`,
        avoid: $items`Roman Candelabra`,
      },
      combat: new CombatStrategy().kill(),
      limit: { soft: 16 },
      nochain: true,
    },
    {
      name: "Vanya",
      after: ["Open"],
      completed: () => getScore() >= 10000,
      priority: () => {
        if (
          have($item`Everfull Dart Holster`) &&
          !have($effect`Everything Looks Red`) &&
          myTurncount() >= 30
        ) {
          return Priorities.GoodDarts;
        }
        if (have($effect`Sinuses For Miles`) || have($effect`Frosty`)) {
          return { score: -0.1, reason: "Focus on +item/+meat push" };
        }
        return Priorities.None;
      },
      prepare: () => {
        if (numericModifier("Initiative") < 600 && have($skill`Silent Hunter`)) {
          if (myClass() === $class`Seal Clubber`) ensureWithMPSwaps($effects`Silent Hunting`);
          else ensureWithMPSwaps($effects`Nearly Silent Hunting`);
        }

        const initOptions: [boolean, () => void][] = [
          [
            have($item`designer sweatpants`) && get("sweat", 0) >= 15,
            () =>
              visitUrl("runskillz.php?action=Skillz&whichskill=7419&targetplayer=0&pwd&quantity=1"),
          ],
          [
            have($item`Clan VIP Lounge key`) && get("_poolGames") < 3,
            () => ensureEffect($effect`Hustlin'`),
          ],
        ];

        const speedInitOptions: [boolean, () => void][] = [
          [BeachComb.have(), () => BeachComb.tryHead($effect`Resting Beach Face`)],
          [have($item`ant agonist`), () => ensureEffect($effect`All Fired Up`)],
          [have($item`yellow candy heart`), () => ensureEffect($effect`Heart of Yellow`)],
          [have($item`peppermint twist`), () => ensureEffect($effect`Peppermint Twisted`)],
          [
            SourceTerminal.have() && !have($effect`init.enh`),
            () => SourceTerminal.enhance($effect`init.enh`),
          ],
        ];

        if (args.resources.speed) initOptions.push(...speedInitOptions);
        for (const option of initOptions) {
          if (numericModifier("Initiative") < 600 && option[0]) option[1]();
        }
      },
      ready: () => get("8BitColor", "black") === "black" || get("8BitColor", "black") === "",
      do: $location`Vanya's Castle`,
      outfit: () => {
        return {
          modifier: "init",
          equip: $items`continuum transfunctioner, backup camera, bat wings`,
          modes: { backupcamera: "init" },
          avoid: $items`Roman Candelabra`,
        };
      },
      combat: new CombatStrategy().kill(),
      limit: { soft: 16 },
      delay: 16,
      nochain: true,
    },
    {
      name: "Megalo",
      after: ["Open"],
      completed: () => getScore() >= 10000,
      priority: () => {
        if (
          have($item`Everfull Dart Holster`) &&
          !have($effect`Everything Looks Red`) &&
          myTurncount() >= 30
        ) {
          return Priorities.GoodDarts;
        }
        return Priorities.None;
      },
      prepare: () => {
        // Get the GAP DA buff, saving 1 for after the run
        if (haveEquipped($item`Greatest American Pants`) && get("_gapBuffs") < 4) {
          ensureEffect($effect`Super Structure`); // after GAP are equipped
        }
      },
      ready: () => get("8BitColor", "black") === "blue",
      do: $location`Megalo-City`,
      outfit: () => {
        if (have($item`Greatest American Pants`) && get("_gapBuffs") < 4)
          return {
            modifier: "DA",
            equip: $items`continuum transfunctioner, Greatest American Pants`,
            avoid: $items`Roman Candelabra`,
          };
        else
          return {
            modifier: "DA",
            equip: $items`continuum transfunctioner`,
            avoid: $items`Roman Candelabra`,
          };
      },
      combat: new CombatStrategy().kill(),
      limit: { soft: 16 },
      delay: 16,
      nochain: true,
    },
    {
      name: "Hero",
      after: ["Open"],
      completed: () => getScore() >= 10000,
      ready: () => get("8BitColor", "black") === "green",
      do: $location`Hero's Field`,
      post: () => {
        if (haveFlorest() && FloristFriar.Rutabeggar.available()) {
          FloristFriar.Rutabeggar.plant();
        }
      },
      outfit: () => {
        if (have($familiar`Trick-or-Treating Tot`) && have($item`li'l ninja costume`))
          return {
            modifier: "item",
            familiar: $familiar`Trick-or-Treating Tot`,
            equip: $items`continuum transfunctioner, li'l ninja costume`,
            avoid: $items`Roman Candelabra`,
          };
        else
          return {
            modifier: "item",
            equip: $items`continuum transfunctioner`,
            avoid: $items`Roman Candelabra`,
          };
      },
      combat: new CombatStrategy().killItem(),
      limit: { soft: 16 },
      nochain: true,
    },
    {
      name: "Key",
      after: ["Open", "Fungus", "Vanya", "Megalo", "Hero"],
      completed: () =>
        have($item`digital key`) || get("nsTowerDoorKeysUsed").includes("digital key"),
      do: () => {
        if (getScore() >= 10000) {
          visitUrl("place.php?whichplace=8bit&action=8treasure");
          runChoice(1);
        }
      },
      outfit: { equip: $items`continuum transfunctioner` },
      limit: { tries: 2 }, // The first time may only set the property
    },
  ],
};

function keyCount(): number {
  let count = itemAmount($item`fat loot token`);
  if (have($item`Boris's key`) || get("nsTowerDoorKeysUsed").includes("Boris")) count++;
  if (have($item`Jarlsberg's key`) || get("nsTowerDoorKeysUsed").includes("Jarlsberg")) count++;
  if (have($item`Sneaky Pete's key`) || get("nsTowerDoorKeysUsed").includes("Sneaky Pete")) count++;
  return count;
}

function unequipAcc(acc: Item): void {
  if (!haveEquipped(acc)) return;
  for (const slot of $slots`acc1, acc2, acc3`) {
    if (equippedItem(slot) === acc) equip(slot, $item`none`);
  }
}

function makeZapChoice(): Item[] {
  function _retrieval_cost(option: Item): number {
    if (have(option)) return -2;
    if (storageAmount(option) > 0) return -1;
    return mallPrice(option);
  }
  const options = $items`Boris's ring, Jarlsberg's earring, Sneaky Pete's breath spray`;
  return options.sort((i, j) => _retrieval_cost(i) - _retrieval_cost(j));
}

function min(a: number, b: number) {
  return a < b ? a : b;
}

function getScore(): number {
  const score = getProperty("8BitScore");
  if (score === "") return 0;
  return parseInt(score.replace(",", ""));
}

function getDoorSolution(): number {
  if (have($item`Pick-O-Matic lockpicks`)) return 3;
  if (have($item`Platinum Yendorian Express Card`)) return 7;
  const skeletonKeys =
    itemAmount($item`skeleton key`) +
    min(itemAmount($item`skeleton bone`), itemAmount($item`loose teeth`));
  if (
    skeletonKeys > 1 ||
    (skeletonKeys === 1 && get("nsTowerDoorKeysUsed").includes("skeleton key"))
  )
    return 2;
  return 4;
}
