import {
  create,
  haveEquipped,
  Item,
  itemAmount,
  myDaycount,
  myHash,
  myMaxhp,
  restoreHp,
  runChoice,
  use,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $effects,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $monsters,
  $phylum,
  $skill,
  BeachComb,
  ensureEffect,
  get,
  have,
  Macro,
} from "libram";
import { Quest, Resources, Task } from "../engine/task";
import { OutfitSpec, step } from "grimoire-kolmafia";
import { CombatStrategy } from "../engine/combat";
import { ensureWithMPSwaps, fillHp } from "../engine/moods";
import { globalStateCache } from "../engine/state";
import { tryPlayApriling, tryWish, tuneSnapper } from "../lib";
import { Priorities } from "../engine/priority";
import { args } from "../args";

function shenItem(item: Item) {
  return (
    get("shenQuestItem") === item &&
    (step("questL11Shen") === 1 || step("questL11Shen") === 3 || step("questL11Shen") === 5)
  );
}

const Copperhead: Task[] = [
  {
    name: "Copperhead Start",
    after: ["Macguffin/Diary"],
    completed: () => step("questL11Shen") >= 1,
    do: $location`The Copperhead Club`,
    choices: { 1074: 1 },
    limit: { tries: 1 },
  },
  {
    name: "Copperhead",
    after: ["Copperhead Start"],
    ready: () =>
      step("questL11Shen") === 2 || step("questL11Shen") === 4 || step("questL11Shen") === 6,
    completed: () => step("questL11Shen") === 999,
    prepare: () => {
      if (have($item`crappy waiter disguise`))
        ensureEffect($effect`Crappily Disguised as a Waiter`);
    },
    do: $location`The Copperhead Club`,
    combat: new CombatStrategy().kill($monster`Mob Penguin Capo`),
    orbtargets: () => {
      if (have($familiar`Robortender`)) return [$monster`Mob Penguin Capo`];
      return [];
    },
    outfit: (): OutfitSpec => {
      if (have($familiar`Robortender`)) {
        const target = globalStateCache.orb().prediction($location`The Copperhead Club`);
        if (target === $monster`Mob Penguin Capo`)
          return { equip: $items`miniature crystal ball`, familiar: $familiar`Robortender` };
        else return { equip: $items`miniature crystal ball` };
      }
      return {};
    },
    choices: () => {
      return {
        852: 1,
        853: 1,
        854: 1,
        855: get("copperheadClubHazard") !== "lantern" ? 3 : 4,
      };
    },
    limit: { tries: 30 }, // Extra waiter disguise adventures
  },
  {
    name: "Bat Snake Sonar",
    after: ["Copperhead Start", "Bat/Use Sonar 1"],
    ready: () => shenItem($item`The Stankara Stone`),
    completed: () =>
      step("questL11Shen") === 999 ||
      have($item`The Stankara Stone`) ||
      (myDaycount() === 1 && step("questL11Shen") > 1) ||
      step("questL04Bat") >= 3,
    do: $location`The Batrat and Ratbat Burrow`,
    combat: new CombatStrategy().killHard($monster`Batsnake`).killItem(),
    outfit: { modifier: "item", avoid: $items`broken champagne bottle` },
    limit: { soft: 10 },
    orbtargets: () => [],
  },
  {
    name: "Bat Snake",
    after: ["Copperhead Start", "Bat/Use Sonar 1", "Bat Snake Sonar"],
    ready: () => shenItem($item`The Stankara Stone`),
    completed: () =>
      step("questL11Shen") === 999 ||
      have($item`The Stankara Stone`) ||
      (myDaycount() === 1 && step("questL11Shen") > 1),
    do: $location`The Batrat and Ratbat Burrow`,
    combat: new CombatStrategy().killHard($monster`Batsnake`),
    limit: { soft: 10 },
    orbtargets: () => [],
    delay: () => 5,
  },
  {
    name: "Cold Snake",
    after: ["Copperhead Start", "McLargeHuge/Trapper Return"],
    ready: () => shenItem($item`The First Pizza`) && !get("noncombatForcerActive"),
    completed: () =>
      step("questL11Shen") === 999 ||
      have($item`The First Pizza`) ||
      (myDaycount() === 1 && step("questL11Shen") > 3),
    prepare: () => {
      restoreHp(myMaxhp());
    },
    do: $location`Lair of the Ninja Snowmen`,
    outfit: () => {
      if (have($familiar`Trick-or-Treating Tot`) && !have($item`li'l ninja costume`))
        return { familiar: $familiar`Trick-or-Treating Tot` };
      return {};
    },
    combat: new CombatStrategy().killHard([
      $monster`Frozen Solid Snake`,
      $monster`ninja snowman assassin`,
    ]),
    orbtargets: () => undefined, // no assassins in orbs
    limit: { soft: 10 },
    delay: 5,
  },
  {
    name: "Hot Snake Precastle",
    after: ["Copperhead Start", "Giant/Ground"],
    ready: () =>
      shenItem($item`Murphy's Rancid Black Flag`) && !have($item`steam-powered model rocketship`),
    completed: () => step("questL11Shen") === 999 || have($item`Murphy's Rancid Black Flag`),
    do: $location`The Castle in the Clouds in the Sky (Top Floor)`,
    outfit: { equip: $items`Mohawk wig`, modifier: "-combat" },
    choices: () => {
      return {
        675: have($item`model airship`) ? 4 : 2,
        676: 4,
        677: step("questL10Garbage") >= 10 ? 2 : have($item`model airship`) ? 1 : 4,
        678: step("questL10Garbage") >= 10 ? 3 : 1,
        679: 1,
        1431: haveEquipped($item`Mohawk wig`) ? 4 : 1,
      };
    },
    orbtargets: () => [],
    combat: new CombatStrategy().killHard($monster`Burning Snake of Fire`),
    limit: { soft: 10 },
    delay: 5,
  },
  {
    name: "Hot Snake Postcastle",
    after: ["Copperhead Start", "Giant/Ground"],
    ready: () =>
      shenItem($item`Murphy's Rancid Black Flag`) && have($item`steam-powered model rocketship`),
    completed: () => step("questL11Shen") === 999 || have($item`Murphy's Rancid Black Flag`),
    do: $location`The Castle in the Clouds in the Sky (Top Floor)`,
    choices: { 675: 4, 676: 4, 677: 1, 678: 1, 679: 1, 1431: 4 },
    outfit: { modifier: "+combat" },
    combat: new CombatStrategy().killHard($monster`Burning Snake of Fire`),
    orbtargets: () => [],
    limit: { soft: 10 },
    delay: 5,
  },
  {
    name: "Sleaze Star Snake",
    after: ["Copperhead Start", "Giant/Unlock HITS"],
    ready: () => shenItem($item`The Eye of the Stars`),
    completed: () => step("questL11Shen") === 999 || have($item`The Eye of the Stars`),
    do: $location`The Hole in the Sky`,
    combat: new CombatStrategy().killHard($monster`The Snake With Like Ten Heads`),
    limit: { soft: 10 },
    delay: 5,
  },
  {
    name: "Sleaze Frat Snake",
    after: ["Copperhead Start"],
    ready: () => shenItem($item`The Lacrosse Stick of Lacoronado`),
    completed: () => step("questL11Shen") === 999 || have($item`The Lacrosse Stick of Lacoronado`),
    do: $location`The Smut Orc Logging Camp`,
    combat: new CombatStrategy().killHard($monster`The Frattlesnake`),
    limit: { soft: 10 },
    delay: 5,
  },
  {
    name: "Spooky Snake Precrypt",
    after: ["Copperhead Start"],
    ready: () => shenItem($item`The Shield of Brook`) && step("questL07Cyrptic") < 999,
    completed: () => step("questL11Shen") === 999 || have($item`The Shield of Brook`),
    do: $location`The Unquiet Garves`,
    combat: new CombatStrategy().killHard($monster`Snakeleton`),
    limit: { soft: 10 },
    delay: 5,
  },
  {
    name: "Spooky Snake Postcrypt",
    after: ["Copperhead Start"],
    ready: () => shenItem($item`The Shield of Brook`) && step("questL07Cyrptic") === 999,
    completed: () => step("questL11Shen") === 999 || have($item`The Shield of Brook`),
    do: $location`The VERY Unquiet Garves`,
    combat: new CombatStrategy().killHard($monster`Snakeleton`),
    limit: { soft: 10 },
    delay: 5,
  },
];

const Zepplin: Task[] = [
  {
    name: "Protesters Start",
    after: ["Macguffin/Diary"],
    completed: () => step("questL11Ron") >= 1,
    do: $location`A Mob of Zeppelin Protesters`,
    combat: new CombatStrategy().killHard($monster`The Nuge`),
    choices: { 856: 1, 857: 1, 858: 1, 866: 2, 1432: 1 },
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Protesters",
    after: ["Protesters Start", "Misc/Hermit Clover", "McLargeHuge/Clover Ore"],
    ready: () =>
      itemAmount($item`11-leaf clover`) > cloversToSave() ||
      have($item`Flamin' Whatshisname`) ||
      step("questL11Shen") === 999,
    prepare: () => {
      if (have($item`lynyrd musk`)) ensureEffect($effect`Musky`);
      if (!have($item`candy cane sword cane`)) tryWish($effect`Dirty Pear`);
      if (have($skill`Bend Hell`) && !get("_bendHellUsed"))
        ensureWithMPSwaps([$effect`Bendin' Hell`]);
      if (args.resources.speed && BeachComb.available()) BeachComb.tryHead("SLEAZE");
    },
    completed: () => get("zeppelinProtestors") >= 80,
    priority: () => (have($effect`Dirty Pear`) ? Priorities.Effect : Priorities.None),
    do: $location`A Mob of Zeppelin Protesters`,
    combat: new CombatStrategy()
      .macro(new Macro().tryItem($item`cigarette lighter`))
      .killHard($monster`The Nuge`)
      .killItem($monster`Blue Oyster cultist`)
      .killItem($monster`lynyrd skinner`)
      .kill(),
    choices: () => {
      return {
        856: 1,
        857: haveEquipped($item`candy cane sword cane`) ? 2 : 1,
        858: 1,
        866: 2,
        1432: 1,
      };
    },
    outfit: {
      modifier: "-combat, sleaze dmg, sleaze spell dmg",
      equip: $items`candy cane sword cane, deck of lewd playing cards, June cleaver, designer sweatpants, Jurassic Parka, transparent pants`,
      modes: { parka: "dilophosaur" },
    },
    limit: { soft: 30 },
    resources: {
      which: Resources.Lucky,
      benefit: 3,
      delta: {
        replace: {
          outfit: {
            modifier: "sleaze dmg, sleaze spell dmg",
            equip: $items`candy cane sword cane, deck of lewd playing cards, June cleaver, designer sweatpants, Jurassic Parka, transparent pants`,
            modes: { parka: "dilophosaur" },
          },
          skipprep: true,
        },
      },
      repeat: 4,
    },
  },
  {
    name: "Protesters Finish",
    after: ["Protesters"],
    completed: () => step("questL11Ron") >= 2,
    do: $location`A Mob of Zeppelin Protesters`,
    combat: new CombatStrategy().killHard($monster`The Nuge`),
    choices: { 856: 1, 857: 1, 858: 1, 866: 2, 1432: 1 },
    limit: { tries: 2 }, // If clovers were used before the intro adventure, we need to clear both the intro and closing advs here.
    freeaction: true,
  },
  {
    name: "Zepplin",
    after: ["Protesters Finish"],
    completed: () => step("questL11Ron") >= 5,
    prepare: () => {
      if (have($item`Red Zeppelin ticket`)) return;
      visitUrl("woods.php");
      visitUrl("shop.php?whichshop=blackmarket");
      visitUrl("shop.php?whichshop=blackmarket&action=buyitem&whichrow=289&ajax=1&quantity=1");
      if (!have($item`Red Zeppelin ticket`))
        throw `Unable to buy Red Zeppelin ticket; please buy manually`;
    },
    do: $location`The Red Zeppelin`,
    combat: new CombatStrategy()
      .killHard($monster`Ron "The Weasel" Copperhead`)
      .macro((): Macro => {
        return Macro.externalIf(get("_glarkCableUses") < 5, Macro.tryItem($item`glark cable`));
      }, $monsters`man with the red buttons, red skeleton, red butler`)
      .banish($monsters`Red Herring, Red Snapper`)
      .kill(),
    peridot: $monster`red butler`,
    orbtargets: () => $monsters`man with the red buttons, red skeleton, red butler`,
    outfit: {
      modifier: "item",
      avoid: $items`broken champagne bottle`,
    },
    limit: { soft: 13 },
  },
];

const Dome: Task[] = [
  {
    name: "Talisman",
    after: [
      "Copperhead",
      "Zepplin",
      "Bat Snake",
      "Cold Snake",
      "Hot Snake Precastle",
      "Hot Snake Postcastle",
      "Sleaze Star Snake",
      "Sleaze Frat Snake",
      "Spooky Snake Precrypt",
      "Spooky Snake Postcrypt",
    ],
    completed: () => have($item`Talisman o' Namsilat`),
    do: () => create($item`Talisman o' Namsilat`),
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Palindome Dog",
    after: ["Talisman", "Manor/Bedroom Camera"],
    completed: () => have($item`photograph of a dog`) || step("questL11Palindome") >= 3,
    prepare: () => tuneSnapper($phylum`dudes`),
    do: $location`Inside the Palindome`,
    outfit: () => {
      const familiar = get("banishedPhyla").includes("beast")
        ? undefined
        : $familiar`Red-Nosed Snapper`;
      const modifier = have($item`stunt nuts`) ? "-combat" : "-combat, item";
      return {
        equip: $items`Talisman o' Namsilat`,
        modifier: modifier,
        avoid: $items`broken champagne bottle`,
        familiar: familiar,
      };
    },
    peridot: $monster`Bob Racecar`,
    combat: new CombatStrategy()
      .banish($monsters`Evil Olive, Flock of Stab-bats, Taco Cat, Tan Gnat`)
      .macro(
        new Macro().item($item`disposable instant camera`),
        $monsters`Bob Racecar, Racecar Bob`
      )
      .killItem($monsters`Bob Racecar, Racecar Bob`)
      .kill(),
    limit: { soft: 20 },
  },
  {
    name: "Palindome Dudes",
    after: ["Palindome Dog"],
    completed: () => have(Item.get(7262)) || step("questL11Palindome") >= 3,
    do: $location`Inside the Palindome`,
    prepare: () => tuneSnapper($phylum`dudes`),
    outfit: () => {
      const familiar = get("banishedPhyla").includes("beast")
        ? undefined
        : $familiar`Red-Nosed Snapper`;
      const modifier = have($item`stunt nuts`) ? "-combat" : "-combat, item";
      return {
        equip: $items`Talisman o' Namsilat`,
        modifier: modifier,
        avoid: $items`broken champagne bottle`,
        familiar: familiar,
      };
    },
    peridot: $monster`Bob Racecar`,
    combat: new CombatStrategy()
      .banish($monsters`Evil Olive, Flock of Stab-bats, Taco Cat, Tan Gnat`)
      .killItem($monsters`Bob Racecar, Racecar Bob`)
      .kill(),
    limit: { soft: 20 },
  },
  {
    name: "Palindome Photos",
    after: ["Palindome Dog", "Palindome Dudes"],
    completed: () =>
      (have($item`photograph of a red nugget`) &&
        have($item`photograph of God`) &&
        have($item`photograph of an ostrich egg`)) ||
      step("questL11Palindome") >= 3,
    do: $location`Inside the Palindome`,
    outfit: () => {
      if (have($item`stunt nuts`))
        return { equip: $items`Talisman o' Namsilat`, modifier: "-combat" };
      return {
        equip: $items`Talisman o' Namsilat`,
        modifier: "-combat, item",
        avoid: $items`broken champagne bottle`,
      };
    },
    peridot: $monster`Bob Racecar`,
    combat: new CombatStrategy().killItem($monsters`Bob Racecar, Racecar Bob`),
    limit: { soft: 20 },
  },
  {
    name: "Palindome Nuts",
    after: ["Palindome Dog", "Palindome Dudes", "Palindome Photos"],
    do: $location`Inside the Palindome`,
    completed: () =>
      have($item`stunt nuts`) || have($item`wet stunt nut stew`) || step("questL11Palindome") >= 5,
    outfit: {
      equip: $items`Talisman o' Namsilat`,
      modifier: "item",
      avoid: $items`broken champagne bottle`,
    },
    peridot: $monster`Bob Racecar`,
    combat: new CombatStrategy().killItem($monsters`Bob Racecar, Racecar Bob`),
    limit: { soft: 20 },
  },
  {
    name: "Alarm Gem",
    after: ["Palindome Dudes", "Palindome Photos"],
    // If we are not cursed, or we've already completed the cursed quest. Then no risk of removing curse.
    ready: () =>
      $effects`Once-Cursed, Twice-Cursed, Thrice-Cursed`.find((e) => have(e)) === undefined ||
      get("hiddenApartmentProgress") >= 7,
    completed: () => step("questL11Palindome") >= 3,
    do: () => {
      if (have(Item.get(7262))) use(Item.get(7262));
      visitUrl("place.php?whichplace=palindome&action=pal_droffice");
      visitUrl(
        `choice.php?pwd=${myHash()}&whichchoice=872&option=1&photo1=2259&photo2=7264&photo3=7263&photo4=7265`
      );
      use(1, Item.get(7270));
      visitUrl("place.php?whichplace=palindome&action=pal_mroffice");
      fillHp();
    },
    outfit: { equip: $items`Talisman o' Namsilat` },
    limit: { tries: 1 },
    freeaction: true,
    expectbeatenup: true,
  },
  {
    name: "Grove",
    after: ["Alarm Gem"],
    completed: () =>
      (have($item`bird rib`) && have($item`lion oil`)) ||
      have($item`wet stew`) ||
      have($item`wet stunt nut stew`) ||
      step("questL11Palindome") >= 5,
    ready: () =>
      !get("banishedPhyla").includes("beast") ||
      (have($item`Peridot of Peril`) &&
        (have($item`bird rib`) || have($item`lion oil`)) &&
        !get("_perilLocations").split(",").includes("100")),
    prepare: () => {
      tryPlayApriling("+combat");
    },
    do: $location`Whitey's Grove`,
    outfit: () => {
      if (
        have($item`Peridot of Peril`) &&
        (have($item`bird rib`) || have($item`lion oil`)) &&
        !get("_perilLocations").split(",").includes("100")
      ) {
        // We will use peridot to avoid the NCs
        return { modifier: "item, food drop" };
      }
      return { modifier: "200 combat, item, food drop" };
    },
    combat: new CombatStrategy().killItem($monster`whitesnake`).killItem($monster`white lion`),
    peridot: () => {
      if (have($item`bird rib`)) return $monster`white lion`;
      if (have($item`lion oil`)) return $monster`whitesnake`;
      return undefined;
    },
    limit: { soft: 15 },
  },
  {
    name: "Open Alarm",
    after: ["Alarm Gem", "Palindome Nuts", "Grove"],
    completed: () => step("questL11Palindome") >= 5,
    do: () => {
      if (!have($item`wet stunt nut stew`)) create($item`wet stunt nut stew`);
      visitUrl("place.php?whichplace=palindome&action=pal_mrlabel");
    },
    outfit: { equip: $items`Talisman o' Namsilat` },
    limit: { tries: 1 },
    freeaction: true,
  },
];

export const PalindomeQuest: Quest = {
  name: "Palindome",
  tasks: [
    ...Copperhead,
    ...Zepplin,
    ...Dome,
    {
      name: "Boss",
      after: ["Open Alarm"],
      completed: () => step("questL11Palindome") === 999,
      do: (): void => {
        visitUrl("place.php?whichplace=palindome&action=pal_drlabel");
        runChoice(-1);
      },
      outfit: { equip: $items`Talisman o' Namsilat, Mega Gem` },
      choices: { 131: 1 },
      combat: new CombatStrategy().killHard(),
      limit: { tries: 1 },
      boss: true,
    },
  ],
};

function cloversToSave(): number {
  return 1;
}
