import {
  canEquip,
  cliExecute,
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
  useSkill,
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
  AugustScepter,
  ensureEffect,
  get,
  have,
  Macro,
} from "libram";
import { Quest, Task } from "../engine/task";
import { OutfitSpec, step } from "grimoire-kolmafia";
import { CombatStrategy, killMacro } from "../engine/combat";
import { ensureWithMPSwaps, fillHp } from "../engine/moods";
import { globalStateCache } from "../engine/state";
import { tuneSnapper } from "../lib";
import { Priorities } from "../engine/priority";
import { tryPlayApriling } from "../engine/resources";

function shenItem(item: Item) {
  return (
    get("shenQuestItem") === item.name &&
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
    name: "Bat Snake",
    after: ["Copperhead Start", "Bat/Use Sonar 1"],
    ready: () => shenItem($item`The Stankara Stone`),
    priority: () => {
      const jar_needed =
        !have($item`killing jar`) &&
        !have($familiar`Melodramedary`) &&
        (get("gnasirProgress") & 4) === 0 &&
        get("desertExploration") < 100;
      if (
        jar_needed &&
        get("lastEncounter") === "banshee librarian" &&
        have($skill`Emotionally Chipped`) &&
        get("_feelEnvyUsed") < 3 &&
        get("_feelNostalgicUsed") < 3
      )
        return Priorities.GoodFeelNostalgia;
      else return Priorities.None;
    },
    completed: () =>
      step("questL11Shen") === 999 ||
      have($item`The Stankara Stone`) ||
      (myDaycount() === 1 && step("questL11Shen") > 1),
    do: $location`The Batrat and Ratbat Burrow`,
    combat: new CombatStrategy()
      .macro(() => {
        const jar_needed =
          !have($item`killing jar`) &&
          !have($familiar`Melodramedary`) &&
          (get("gnasirProgress") & 4) === 0 &&
          get("desertExploration") < 100;
        if (jar_needed && get("lastEncounter") === "banshee librarian") {
          return Macro.trySkill($skill`Feel Nostalgic`)
            .trySkill($skill`Feel Envy`)
            .step(killMacro());
        }
        return new Macro();
      }, $monsters`batrat, ratbat`)
      .killHard($monster`Batsnake`)
      .killItem(),
    outfit: { modifier: "item", avoid: $items`broken champagne bottle` },
    limit: { soft: 10 },
    orbtargets: () => [],
    delay: () => (step("questL04Bat") >= 3 ? 5 : 0),
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
      tryPlayApriling("+combat");
    },
    do: $location`Lair of the Ninja Snowmen`,
    outfit: () => {
      const spec: OutfitSpec = {
        modifier: "50 combat, init",
        skipDefaults: true,
        familiar: $familiar`Jumpsuited Hound Dog`,
        avoid: $items`miniature crystal ball`,
      };
      if (have($familiar`Trick-or-Treating Tot`) && !have($item`li'l ninja costume`))
        spec.familiar = $familiar`Trick-or-Treating Tot`;
      if (
        have($item`latte lovers member's mug`) &&
        get("latteModifier").includes("Combat Rate: 10")
      ) {
        // Ensure kramco does not override +combat
        spec.offhand = $item`latte lovers member's mug`;
      }
      return spec;
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
        675: 4,
        676: 4,
        677: step("questL10Garbage") >= 10 ? 2 : 1,
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
      canEquip($item`transparent pants`) &&
      (itemAmount($item`11-leaf clover`) > cloversToSave() ||
        have($item`Flamin' Whatshisname`) ||
        step("questL11Shen") === 999),
    prepare: () => {
      if (have($item`lynyrd musk`)) ensureEffect($effect`Musky`);
      if (AugustScepter.canCast(2) && !have($effect`Lucky!`))
        useSkill($skill`Aug. 2nd: Find an Eleven-Leaf Clover Day`);
      if (itemAmount($item`11-leaf clover`) > cloversToSave() && !have($effect`Lucky!`))
        use($item`11-leaf clover`);
      if (
        !have($item`candy cane sword cane`) &&
        have($item`pocket wish`) &&
        !have($effect`Dirty Pear`)
      )
        cliExecute("genie effect dirty pear");
      if (have($skill`Bend Hell`) && !get("_bendHellUsed"))
        ensureWithMPSwaps([$effect`Bendin' Hell`]);
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
    outfit: () => {
      const sleazeitems = $items`candy cane sword cane, deck of lewd playing cards, June cleaver, designer sweatpants, Jurassic Parka, transparent pants`;
      if (itemAmount($item`11-leaf clover`) > cloversToSave() || have($effect`Lucky!`))
        return {
          modifier: "sleaze dmg, sleaze spell dmg",
          equip: sleazeitems,
          modes: { parka: "dilophosaur" },
        };
      return {
        modifier: "-combat, sleaze dmg, sleaze spell dmg",
        equip: sleazeitems,
        modes: { parka: "dilophosaur" },
      };
    },
    freeaction: () => itemAmount($item`11-leaf clover`) > cloversToSave() || have($effect`Lucky!`),
    limit: { soft: 30 },
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
      if (have($item`stunt nuts`))
        return {
          equip: $items`Talisman o' Namsilat`,
          modifier: "-combat",
          familiar: $familiar`Red-Nosed Snapper`,
        };
      return {
        equip: $items`Talisman o' Namsilat`,
        modifier: "-combat, item",
        avoid: $items`broken champagne bottle`,
        familiar: $familiar`Red-Nosed Snapper`,
      };
    },
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
      if (have($item`stunt nuts`))
        return {
          equip: $items`Talisman o' Namsilat`,
          modifier: "-combat",
          familiar: $familiar`Red-Nosed Snapper`,
        };
      return {
        equip: $items`Talisman o' Namsilat`,
        modifier: "-combat, item",
        avoid: $items`broken champagne bottle`,
        familiar: $familiar`Red-Nosed Snapper`,
      };
    },
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
    do: $location`Whitey's Grove`,
    outfit: { modifier: "50 combat, item" },
    combat: new CombatStrategy().killItem($monster`whitesnake`).killItem($monster`white lion`),
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
