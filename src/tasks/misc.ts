import { CombatStrategy, killMacro } from "../engine/combat";
import {
  buy,
  cliExecute,
  equip,
  equippedAmount,
  equippedItem,
  familiarWeight,
  floristAvailable,
  fullnessLimit,
  gamedayToInt,
  getCampground,
  getClanName,
  getDwelling,
  getWorkshed,
  haveEquipped,
  hermit,
  hippyStoneBroken,
  Item,
  itemAmount,
  knollAvailable,
  myAdventures,
  myAscensions,
  myBasestat,
  myClass,
  myFullness,
  myFury,
  myHp,
  myLevel,
  myMaxhp,
  myMaxmp,
  myMeat,
  myMp,
  myPrimestat,
  myTurncount,
  numericModifier,
  print,
  putCloset,
  retrieveItem,
  runChoice,
  totalFreeRests,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
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
  $skill,
  $slots,
  $stat,
  AprilingBandHelmet,
  AsdonMartin,
  AugustScepter,
  AutumnAton,
  BurningLeaves,
  byClass,
  byStat,
  CinchoDeMayo,
  Clan,
  ClosedCircuitPayphone,
  DaylightShavings,
  directlyUse,
  ensureEffect,
  get,
  getSaleValue,
  have,
  haveInCampground,
  Macro,
  MayamCalendar,
  Robortender,
  set,
  TrainSet,
  undelay,
  uneffect,
  unequip,
} from "libram";
import { Quest, Task } from "../engine/task";
import { Guards, Outfit, OutfitSpec, step } from "grimoire-kolmafia";
import { Priorities } from "../engine/priority";
import { Engine } from "../engine/engine";
import { Keys, keyStrategy } from "./keys";
import { atLevel, haveLoathingIdolMicrophone, primestatId, underStandard } from "../lib";
import { args, toTempPref } from "../args";
import { coldPlanner, yellowSubmarinePossible } from "../engine/outfit";
import { fillHp, swapEquipmentForMp } from "../engine/moods";
import { Station } from "libram/dist/resources/2022/TrainSet";
import { getActiveBackupTarget } from "../resources/backup";
import { warCleared } from "./level12";

const meatBuffer = 1000;

export const MiscQuest: Quest = {
  name: "Misc",
  tasks: [
    {
      name: "Unlock Beach",
      after: ["Toy Accordion", "Sewer Saucepan", "Sewer Totem"],
      ready: () => myMeat() >= meatBuffer + (knollAvailable() ? 538 : 5000),
      completed: () => have($item`bitchin' meatcar`) || have($item`Desert Bus pass`),
      do: () => {
        if (knollAvailable()) cliExecute("acquire 1 bitchin' meatcar");
        else cliExecute("acquire 1 desert bus pass");
      },
      outfit: { equip: $items`designer sweatpants` },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Leprecondo",
      // eslint-disable-next-line libram/verify-constants
      ready: () => have($item`Leprecondo`),
      completed: () => isLeprecondoComplete() || get("_leprecondoRearrangements", 0) >= 3,
      do: () => {
        const furniture = chooseBestLeprecondo();
        // eslint-disable-next-line libram/verify-constants
        directlyUse($item`Leprecondo`);
        visitUrl(
          `choice.php?pwd&option=1&whichchoice=1556&r0=${furniture[0]}&r1=${furniture[1]}&r2=${furniture[2]}&r3=${furniture[3]}`
        );
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Mayam Calendar",
      completed: () => !MayamCalendar.have() || MayamCalendar.remainingUses() === 0,
      do: () => {
        cliExecute("mayam rings fur lightning eyepatch yam");
        cliExecute("mayam rings chair wood cheese clock");
        cliExecute("mayam rings eye meat wall explosion");
      },
      outfit: () => {
        if (have($familiar`Chest Mimic`)) return { familiar: $familiar`Chest Mimic` };
        return { familiar: $familiar`Grey Goose` };
      },
      limit: { tries: 2 },
      freeaction: true,
    },
    {
      name: "Island Scrip",
      after: ["Unlock Beach"],
      ready: () =>
        (myMeat() >= 6000 || (step("questL11Black") >= 4 && myMeat() >= meatBuffer + 500)) &&
        myAdventures() >= 20 &&
        !yellowSubmarinePossible(),
      completed: () =>
        itemAmount($item`Shore Inc. Ship Trip Scrip`) >= 3 ||
        have($item`dinghy plans`) ||
        have($item`dingy dinghy`) ||
        have($item`junk junk`) ||
        have($item`skeletal skiff`) ||
        have($item`yellow submarine`) ||
        get("_pirateDinghyUsed"),
      do: $location`The Shore, Inc. Travel Agency`,
      outfit: () => {
        if (!get("candyCaneSwordShore")) return { equip: $items`candy cane sword cane` };
        else return {};
      },
      choices: () => {
        const swordReady =
          haveEquipped($item`candy cane sword cane`) && !get("candyCaneSwordShore");
        const statChoice = byStat({
          Muscle: 1,
          Mysticality: 2,
          Moxie: 3,
        });
        return { 793: swordReady ? 5 : statChoice };
      },
      nofight: true,
      limit: { tries: 5 },
    },
    {
      name: "Unlock Island Takerspace",
      priority: () => Priorities.Start,
      ready: () =>
        getWorkshed() === $item`TakerSpace letter of Marque` || have($item`pirate dinghy`),
      completed: () =>
        have($item`dingy dinghy`) ||
        have($item`junk junk`) ||
        have($item`skeletal skiff`) ||
        have($item`yellow submarine`) ||
        get("_pirateDinghyUsed") ||
        (!have($item`pirate dinghy`) &&
          (get("takerSpaceAnchor") < 1 || get("takerSpaceMast") < 1 || get("takerSpaceSilk") < 1)),
      do: () => {
        if (!have($item`pirate dinghy`)) retrieveItem($item`pirate dinghy`);
        if (!have($item`deft pirate hook`)) retrieveItem($item`deft pirate hook`);
        use($item`pirate dinghy`);
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Unlock Island",
      after: ["Island Scrip"],
      ready: () =>
        (myMeat() >= meatBuffer + 400 || have($item`dingy planks`)) && !yellowSubmarinePossible(),
      completed: () =>
        get("_pirateDinghyUsed") ||
        have($item`dingy dinghy`) ||
        have($item`junk junk`) ||
        have($item`skeletal skiff`) ||
        have($item`yellow submarine`) ||
        get("_pirateDinghyUsed"),
      do: () => {
        retrieveItem($item`dingy planks`);
        retrieveItem($item`dinghy plans`);
        use($item`dinghy plans`);
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Unlock Island Submarine",
      after: ["Digital/Open"],
      ready: () =>
        itemAmount($item`yellow pixel`) >= 50 &&
        itemAmount($item`red pixel`) >= 5 &&
        itemAmount($item`blue pixel`) >= 5 &&
        itemAmount($item`green pixel`) >= 5,
      completed: () =>
        !yellowSubmarinePossible() ||
        get("_pirateDinghyUsed") ||
        have($item`dingy dinghy`) ||
        have($item`junk junk`) ||
        have($item`skeletal skiff`) ||
        have($item`yellow submarine`) ||
        get("_pirateDinghyUsed"),
      do: () => {
        retrieveItem($item`yellow submarine`);
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Floundry",
      after: [],
      ready: () => false,
      completed: () => have($item`fish hatchet`) || true,
      do: () => cliExecute("acquire 1 fish hatchet"),
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Acquire Kgnee",
      after: [],
      ready: () =>
        have($familiar`Reagnimated Gnome`) &&
        !have($item`gnomish housemaid's kgnee`) &&
        !get(toTempPref("checkedGnome"), false),
      completed: () =>
        !have($familiar`Reagnimated Gnome`) ||
        have($item`gnomish housemaid's kgnee`) ||
        get(toTempPref("checkedGnome"), false),
      do: () => {
        visitUrl("arena.php");
        runChoice(4);
        set(toTempPref("checkedGnome"), true);
      },
      outfit: { familiar: $familiar`Reagnimated Gnome` },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Voting",
      after: [],
      ready: () => !underStandard(),
      completed: () =>
        !args.resources.voterbooth ||
        have($item`"I Voted!" sticker`) ||
        get("_voteToday") ||
        !get("voteAlways"),
      do: (): void => {
        // Taken from garbo
        const voterValueTable = [
          {
            monster: $monster`terrible mutant`,
            value: getSaleValue($item`glob of undifferentiated tissue`) + 10,
          },
          {
            monster: $monster`angry ghost`,
            value: getSaleValue($item`ghostly ectoplasm`) * 1.11,
          },
          {
            monster: $monster`government bureaucrat`,
            value: getSaleValue($item`absentee voter ballot`) * 0.05 + 75 * 0.25 + 50,
          },
          {
            monster: $monster`annoyed snake`,
            value: gamedayToInt(),
          },
          {
            monster: $monster`slime blob`,
            value: 95 - gamedayToInt(),
          },
        ];

        visitUrl("place.php?whichplace=town_right&action=townright_vote");

        const monPriority = voterValueTable
          .sort((a, b) => b.value - a.value)
          .map((element) => element.monster.name);

        const initPriority = new Map<string, number>([
          ["Meat Drop: +30", 10],
          ["Item Drop: +15", 9],
          ["Familiar Experience: +2", 8],
          ["Adventures: +1", 7],
          ["Monster Level: +10", 5],
          [`${myPrimestat()} Percent: +25`, 3],
          [`Experience (${myPrimestat()}): +4`, 2],
          [`Cold Damage: +10`, 1],
          ["Meat Drop: -30", -2],
          ["Item Drop: -15", -2],
          ["Familiar Experience: -2", -2],
        ]);

        const monsterVote =
          monPriority.indexOf(get("_voteMonster1")) < monPriority.indexOf(get("_voteMonster2"))
            ? 1
            : 2;

        const voteLocalPriorityArr = [
          "_voteLocal1",
          "_voteLocal2",
          "_voteLocal3",
          "_voteLocal4",
        ].map((v, i) => [i, initPriority.get(get(v)) || (get(v).indexOf("-") === -1 ? 1 : -1)]);

        const bestVotes = voteLocalPriorityArr.sort((a, b) => b[1] - a[1]);
        const firstInit = bestVotes[0][0];
        const secondInit = bestVotes[1][0];

        visitUrl(
          `choice.php?option=1&whichchoice=1331&g=${monsterVote}&local[]=${firstInit}&local[]=${secondInit}`
        );

        if (!have($item`"I Voted!" sticker`)) {
          cliExecute("refresh all");
        }
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Protonic Ghost",
      after: [],
      completed: () => false,
      priority: () => {
        if (!get("lovebugsUnlocked") && have($item`designer sweatpants`) && get("sweat") < 5) {
          // Wait for more sweat, if possible
          return Priorities.BadSweat;
        } else return Priorities.Always;
      },
      ready: () => {
        if (!have($item`protonic accelerator pack`)) return false;
        if (get("questPAGhost") === "unstarted") return false;
        switch (get("ghostLocation")) {
          case $location`Cobb's Knob Treasury`:
            return step("questL05Goblin") >= 1;
          case $location`The Haunted Conservatory`:
            return step("questM20Necklace") >= 0;
          case $location`The Haunted Gallery`:
            return step("questM21Dance") >= 1;
          case $location`The Haunted Kitchen`:
            return step("questM20Necklace") >= 0;
          case $location`The Haunted Wine Cellar`:
            return step("questL11Manor") >= 1;
          case $location`The Icy Peak`:
            return step("questL08Trapper") === 999;
          case $location`Inside the Palindome`:
            return have($item`Talisman o' Namsilat`);
          case $location`The Old Landfill`:
            return myBasestat(myPrimestat()) >= 25 && step("questL02Larva") >= 0;
          case $location`Madness Bakery`:
          case $location`The Overgrown Lot`:
          case $location`The Skeleton Store`:
            return true; // Can freely start quest
          case $location`The Smut Orc Logging Camp`:
            return (
              step("questL09Topping") >= 0 &&
              // Wait until Blech House is cleared
              get("smutOrcNoncombatProgress") < 15
            );
          case $location`The Spooky Forest`:
            return step("questL02Larva") >= 0;
        }
        return false;
      },
      prepare: () => {
        // Start quests if needed
        switch (get("ghostLocation")) {
          case $location`Madness Bakery`:
            if (step("questM25Armorer") === -1) {
              visitUrl("shop.php?whichshop=armory");
              visitUrl("shop.php?whichshop=armory&action=talk");
              visitUrl("choice.php?pwd=&whichchoice=1065&option=1");
            }
            return;
          case $location`The Old Landfill`:
            if (step("questM19Hippy") === -1) {
              visitUrl("place.php?whichplace=woods&action=woods_smokesignals");
              visitUrl("choice.php?pwd=&whichchoice=798&option=1");
              visitUrl("choice.php?pwd=&whichchoice=798&option=2");
              visitUrl("woods.php");
            }
            if (have($item`funky junk key`))
              putCloset($item`funky junk key`, itemAmount($item`funky junk key`));
            return;
          case $location`The Overgrown Lot`:
            if (step("questM24Doc") === -1) {
              visitUrl("shop.php?whichshop=doc");
              visitUrl("shop.php?whichshop=doc&action=talk");
              runChoice(1);
            }
            return;
          case $location`The Skeleton Store`:
            if (step("questM23Meatsmith") === -1) {
              visitUrl("shop.php?whichshop=meatsmith");
              visitUrl("shop.php?whichshop=meatsmith&action=talk");
              runChoice(1);
            }
            return;
          case $location`The Icy Peak`:
            if (numericModifier("cold resistance") < 5) ensureEffect($effect`Red Door Syndrome`);
            if (numericModifier("cold resistance") < 5)
              throw `Unable to ensure cold res for The Icy Peak`;
            return;
          default:
            return;
        }
      },
      do: () => {
        return get("ghostLocation") ?? $location`none`;
      },
      outfit: (): OutfitSpec | Outfit => {
        if (get("ghostLocation") === $location`Inside the Palindome`)
          return {
            equip: $items`Talisman o' Namsilat, protonic accelerator pack, designer sweatpants`,
            modifier: "DA, DR",
          };
        if (get("ghostLocation") === $location`The Icy Peak`) {
          if (
            !get("lovebugsUnlocked") &&
            have($item`designer sweatpants`) &&
            get("sweat") >= 5 &&
            coldPlanner.maximumPossible(true, $slots`back, pants`) >= 5
          ) {
            return coldPlanner.outfitFor(5, {
              equip: $items`protonic accelerator pack, designer sweatpants`,
              modifier: "DA, DR",
            });
          }
          if (coldPlanner.maximumPossible(true, $slots`back`) >= 5)
            return coldPlanner.outfitFor(5, {
              equip: $items`protonic accelerator pack`,
              modifier: "DA, DR",
            });
          else return coldPlanner.outfitFor(5, { modifier: "DA, DR" }); // not enough cold res without back
        }
        return {
          equip: $items`protonic accelerator pack, designer sweatpants`,
          modifier: "DA, DR",
        };
      },
      combat: new CombatStrategy().macro(() => {
        if (get("lovebugsUnlocked")) {
          return new Macro()
            .skill($skill`Summon Love Gnats`)
            .skill($skill`Shoot Ghost`)
            .skill($skill`Shoot Ghost`)
            .skill($skill`Shoot Ghost`)
            .skill($skill`Trap Ghost`);
        }
        if (myClass() === $class`Seal Clubber` && myFury() >= 3 && have($skill`Club Foot`)) {
          return new Macro()
            .skill($skill`Club Foot`)
            .skill($skill`Shoot Ghost`)
            .skill($skill`Shoot Ghost`)
            .skill($skill`Shoot Ghost`)
            .skill($skill`Trap Ghost`);
        }

        if (haveEquipped($item`designer sweatpants`) && get("sweat") >= 5) {
          return new Macro()
            .skill($skill`Sweat Flood`)
            .skill($skill`Shoot Ghost`)
            .skill($skill`Shoot Ghost`)
            .skill($skill`Shoot Ghost`)
            .skill($skill`Trap Ghost`);
        }

        if (
          myHp() < myMaxhp() ||
          get("ghostLocation") === $location`The Haunted Wine Cellar` ||
          get("ghostLocation") === $location`The Overgrown Lot` ||
          equippedAmount($item`protonic accelerator pack`) === 0
        )
          return killMacro();
        else
          return new Macro()
            .skill($skill`Shoot Ghost`)
            .skill($skill`Shoot Ghost`)
            .skill($skill`Shoot Ghost`)
            .skill($skill`Trap Ghost`);
      }),
      choices: () => {
        const result = {
          1060: 5,
          1061: 6,
          1062: 7,
          899: 2,
          896: 1,
          893: 2,
          901: 2,
          334: 1,
          507: 1,
        };

        // Make progress in the Spooky Forest if needed
        if (!have($item`Spooky Temple map`) && step("questM16Temple") < 999) {
          if (!have($item`tree-holed coin`)) {
            return { ...result, 502: 2, 505: 2 };
          }
          return { ...result, 502: 3, 506: 3 };
        }
        if (!have($item`Spooky-Gro fertilizer`) && step("questM16Temple") < 999) {
          return { ...result, 502: 3, 506: 2 };
        }
        if (step("questL02Larva") < 1) {
          return { ...result, 502: 2, 505: 1 };
        }
        // Otherwise, skip it (through the tree-holed coin path)
        return { ...result, 502: 2, 505: 2 };
      },
      limit: {
        tries: 40,
        guard: Guards.create(
          () => myAdventures(),
          (adv) => myAdventures() >= adv // Assert we did not use an adventure
        ),
      },
    },
    {
      name: "Acquire Birch Battery",
      after: [],
      ready: () =>
        have($item`SpinMaster™ lathe`) &&
        (!get("_spinmasterLatheVisited") || have($item`flimsy hardwood scraps`)),
      completed: () => have($item`birch battery`),
      do: () => {
        visitUrl("shop.php?whichshop=lathe");
        cliExecute("acquire birch battery");
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Acquire Firework Hat",
      after: [],
      ready: () => myMeat() >= meatBuffer + 500,
      completed: () =>
        have($item`sombrero-mounted sparkler`) ||
        get("_fireworksShopHatBought") ||
        !have($item`Clan VIP Lounge key`),
      do: () => {
        visitUrl("clan_viplounge.php");
        visitUrl("clan_viplounge.php?action=fwshop&whichfloor=2");
        cliExecute("acquire sombrero-mounted sparkler");
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Acquire Rocket Boots",
      after: [],
      ready: () => myMeat() >= meatBuffer + 1000,
      completed: () =>
        have($item`rocket boots`) ||
        get("_fireworksShopEquipmentBought") ||
        !have($item`Clan VIP Lounge key`),
      do: () => {
        visitUrl("clan_viplounge.php");
        visitUrl("clan_viplounge.php?action=fwshop&whichfloor=2");
        cliExecute("acquire rocket boots");
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Goose Exp",
      after: [],
      completed: () =>
        familiarWeight($familiar`Grey Goose`) >= 9 ||
        get(toTempPref("chefGoose")) === "true" ||
        !have($familiar`Shorter-Order Cook`),
      do: () => {
        set(toTempPref("chefGoose"), "true");
      },
      outfit: { familiar: $familiar`Grey Goose` },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Hermit Clover",
      after: ["Hidden City/Open Temple"],
      ready: () => myMeat() >= meatBuffer + 1000,
      completed: () => get(toTempPref("clovers")) === "true",
      do: () => {
        hermit($item`11-leaf clover`, 3);
        set(toTempPref("clovers"), "true");
      },
      outfit: { equip: $items`designer sweatpants` },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Amulet Coin",
      after: [],
      completed: () =>
        have($item`amulet coin`) ||
        !have($skill`Summon Clip Art`) ||
        get("tomeSummons") >= 3 ||
        !have($familiar`Cornbeefadon`),
      do: () => {
        retrieveItem($item`box of Familiar Jacks`);
        use($item`box of Familiar Jacks`);
      },
      outfit: { familiar: $familiar`Cornbeefadon` },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Boombox",
      after: [],
      completed: () =>
        !have($item`SongBoom™ BoomBox`) ||
        get("boomBoxSong") === "Total Eclipse of Your Meat" ||
        get("_boomBoxSongsLeft") === 0,
      do: () => cliExecute("boombox meat"),
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Mayday",
      after: ["Macguffin/Start"],
      completed: () =>
        !get("hasMaydayContract") || (!have($item`MayDay™ supply package`) && atLevel(11)),
      ready: () => have($item`MayDay™ supply package`) && myTurncount() < 1000,
      do: () => use($item`MayDay™ supply package`),
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Open Fantasy",
      after: [],
      ready: () => (get("frAlways") || get("_frToday")) && !underStandard(),
      completed: () => have($item`FantasyRealm G. E. M.`),
      do: () => {
        visitUrl("place.php?whichplace=realm_fantasy&action=fr_initcenter");
        runChoice(-1);
      },
      choices: { 1280: 1 },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Workshed",
      after: [],
      priority: () => Priorities.Start,
      completed: () =>
        getWorkshed() !== $item`none` || !have(args.major.workshed) || myTurncount() >= 1000,
      do: () => use(args.major.workshed),
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Swap Workshed",
      after: [],
      ready: () =>
        (get("_coldMedicineConsults") >= 5 && getWorkshed() === $item`cold medicine cabinet`) ||
        ((get("_pirateDinghyUsed") ||
          get("takerSpaceAnchor") < 1 ||
          get("takerSpaceMast") < 1 ||
          get("takerSpaceSilk") < 1 ||
          have($item`dingy dinghy`) ||
          have($item`junk junk`) ||
          have($item`skeletal skiff`) ||
          have($item`yellow submarine`)) &&
          getWorkshed() === $item`TakerSpace letter of Marque`) ||
        (step("questL08Trapper") >= 2 &&
          step("questL09Topping") >= 1 &&
          getWorkshed() === $item`model train set`),
      completed: () =>
        !have(args.major.swapworkshed) || get("_workshedItemUsed") || myTurncount() >= 1000,
      do: () => use(args.major.swapworkshed),
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Bugbear Outfit",
      after: [],
      ready: () => myMeat() >= meatBuffer + 140,
      completed: () =>
        (!have($item`Asdon Martin keyfob (on ring)`) && !AsdonMartin.installed()) ||
        !knollAvailable() ||
        (have($item`bugbear beanie`) && have($item`bugbear bungguard`)) ||
        myAscensions() >= 10,
      do: () => {
        retrieveItem($item`bugbear beanie`);
        retrieveItem($item`bugbear bungguard`);
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Break Stone",
      after: [],
      completed: () => hippyStoneBroken(),
      ready: () => args.minor.pvp,
      do: (): void => {
        visitUrl("peevpee.php?action=smashstone&pwd&confirm=on", true);
        visitUrl("peevpee.php?place=fight");
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Autumnaton",
      after: [],
      ready: () => AutumnAton.available(),
      completed: () => !AutumnAton.have(),
      do: () => {
        // Refresh upgrades
        AutumnAton.upgrade();

        const upgrades = AutumnAton.currentUpgrades();
        const zones = [];
        if (!upgrades.includes("leftleg1")) {
          // Low underground locations
          zones.push($location`Guano Junction`, $location`Cobb's Knob Harem`, $location`Noob Cave`);
        }
        if (!upgrades.includes("rightleg1")) {
          // Mid indoor locations
          zones.push(
            $location`The Laugh Floor`,
            $location`The Haunted Library`,
            $location`The Haunted Kitchen`
          );
        }

        if (!upgrades.includes("leftarm1")) {
          // Low indoor locations
          zones.push($location`The Haunted Pantry`);
        }
        if (!upgrades.includes("rightarm1")) {
          // Mid outdoor locations
          zones.push(
            $location`The Smut Orc Logging Camp`,
            $location`The Goatlet`,
            $location`Vanya's Castle`,
            $location`The Dark Elbow of the Woods`,
            $location`The Dark Neck of the Woods`,
            $location`The Dark Heart of the Woods`
          );
        }

        // Valuble quest locations
        if (
          itemAmount($item`barrel of gunpowder`) < 5 &&
          get("sidequestLighthouseCompleted") === "none" &&
          !warCleared()
        )
          zones.push($location`Sonofa Beach`);

        if (itemAmount($item`goat cheese`) < 3 && step("questL08Trapper") < 2)
          zones.push($location`The Goatlet`);

        if (step("questL09Topping") < 1) {
          zones.push($location`The Smut Orc Logging Camp`);
        }

        // Mid underground locations for autumn dollar
        zones.push(
          $location`The Defiled Nook`,
          $location`Cobb's Knob Menagerie, Level 3`,
          $location`The Deep Machine Tunnels`,
          $location`The Daily Dungeon`
        );

        zones.push($location`The Sleazy Back Alley`); // always send it somewhere
        const result = AutumnAton.sendTo(zones);
        if (result) print(`Autumnaton sent to ${result}`);
      },
      limit: { tries: 15, unready: true },
      freeaction: true,
    },
    {
      name: "Saber",
      after: [],
      ready: () => have($item`Fourth of May Cosplay Saber`),
      completed: () => get("_saberMod") !== 0,
      do: (): void => {
        visitUrl("main.php?action=may4");
        // Familiar weight
        runChoice(4);
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Grapefruit",
      after: [],
      ready: () =>
        have($item`filthy corduroys`) &&
        have($item`filthy knitted dread sack`) &&
        step("questL12War") < 1,
      completed: () =>
        !have($familiar`Robortender`) ||
        have($item`grapefruit`) ||
        have($item`drive-by shooting`) ||
        get("_roboDrinks").toLowerCase().includes("drive-by shooting"),
      do: () => retrieveItem($item`grapefruit`),
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Prepare Robortender",
      after: ["Grapefruit"],
      ready: () =>
        (((have($item`fish head`) && have($item`boxed wine`)) || have($item`piscatini`)) &&
          have($item`grapefruit`)) ||
        have($item`drive-by shooting`),
      completed: () =>
        myTurncount() >= 1000 ||
        get("sidequestNunsCompleted") !== "none" ||
        !have($familiar`Robortender`) ||
        get("_roboDrinks").toLowerCase().includes("drive-by shooting"),
      do: () => {
        retrieveItem($item`drive-by shooting`);
        Robortender.feed($item`drive-by shooting`);
      },
      outfit: { familiar: $familiar`Robortender` },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Trainset",
      after: [],
      ready: () => getWorkshed() === $item`model train set` && TrainSet.canConfigure(),
      completed: () => {
        const config = TrainSet.cycle();
        const desiredConfig = getDesiredTrainsetConfig();
        for (let i = 0; i < 8; i++) {
          if (config[i] !== desiredConfig[i]) return false;
        }
        return true;
      },
      do: () => {
        TrainSet.setConfiguration(getDesiredTrainsetConfig());
      },
      limit: { tries: 20, unready: true },
      freeaction: true,
    },
    {
      name: "Harvest Chateau",
      after: [],
      ready: () => get("chateauAvailable") && !underStandard(),
      completed: () => get("_chateauDeskHarvested"),
      do: (): void => {
        visitUrl("place.php?whichplace=chateau&action=chateau_desk2");
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Learn About Bugs",
      after: [],
      ready: () => have($item`S.I.T. Course Completion Certificate`),
      completed: () => get("_sitCourseCompleted", true) || have($skill`Insectologist`),
      do: () => use($item`S.I.T. Course Completion Certificate`),
      choices: { [1494]: 2 },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Harvest Rock Garden",
      after: [],
      ready: () => haveInCampground($item`packet of rock seeds`),
      completed: () =>
        !haveInCampground($item`milestone`) || getCampground()[$item`milestone`.name] < 1,
      do: () => {
        visitUrl("campground.php?action=rgarden1&pwd");
        visitUrl("campground.php?action=rgarden2&pwd");
        visitUrl("campground.php?action=rgarden3&pwd");
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Cincho Rest",
      after: [],
      ready: () => CinchoDeMayo.currentCinch() + CinchoDeMayo.cinchRestoredBy() <= 100,
      completed: () => !have($item`Cincho de Mayo`) || get("timesRested") >= totalFreeRests(),
      do: () => {
        if (get("chateauAvailable") && !underStandard()) {
          visitUrl("place.php?whichplace=chateau&action=chateau_restlabelfree");
          return;
        }

        // For other sources, we cannot rest with full HP and MP.
        // First, try burning 1 MP with a starting skill.
        if (myMp() === myMaxmp() && myHp() === myMaxhp()) {
          const drainer = byClass({
            "Seal Clubber": $skill`Seal Clubbing Frenzy`,
            "Turtle Tamer": $skill`Patience of the Tortoise`,
            Pastamancer: $skill`Manicotti Meditation`,
            Sauceror: $skill`Sauce Contemplation`,
            "Disco Bandit": $skill`Disco Aerobics`,
            "Accordion Thief": $skill`Moxie of the Mariachi`,
            default: $skill`none`,
          });
          if (drainer !== $skill`none`) {
            useSkill(drainer);
          } else {
            // Next, try putting on some extra gear for max MP
            swapEquipmentForMp(myMaxmp() + 1);
          }
        }

        // Finally, try unequiping some existing gear that provides MP/HP and re-equip it
        if (myMp() === myMaxmp() && myHp() === myMaxhp()) {
          for (const slot of $slots`shirt, acc1, acc2, acc3, pants, back, hat`) {
            const item = equippedItem(slot);
            if (
              numericModifier(item, "Maximum HP") >= 0 &&
              numericModifier(item, "Maximum MP") >= 0
            ) {
              unequip(slot);
              equip(item, slot);
            }
          }
        }

        if (get("getawayCampsiteUnlocked") && !underStandard()) {
          visitUrl("place.php?whichplace=campaway&action=campaway_tentclick");
        } else {
          visitUrl("campground.php?action=rest");
        }
      },
      limit: {
        tries: 60, // Round off at a cincho usage
        guard: Guards.create(
          () => myAdventures(),
          (adv) => myAdventures() === adv // Assert we did not use an adventure
        ),
      },
      freeaction: true,
    },
    {
      name: "2002 Store",
      after: [],
      completed: () =>
        !have($item`2002 Mr. Store Catalog`) ||
        (get("availableMrStore2002Credits") === 0 && get("_2002MrStoreCreditsCollected")),
      do: () => {
        if (!get("_2002MrStoreCreditsCollected")) {
          use($item`2002 Mr. Store Catalog`);
        }
        if (!haveLoathingIdolMicrophone()) {
          buy($coinmaster`Mr. Store 2002`, 1, $item`Loathing Idol Microphone`);
        }
        if (get("availableMrStore2002Credits") > 0) {
          buy(
            $coinmaster`Mr. Store 2002`,
            get("availableMrStore2002Credits"),
            $item`Spooky VHS Tape`
          );
        }
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Shadow Rift",
      after: ["War/Open Nuns"],
      completed: () =>
        !have($item`closed-circuit pay phone`) ||
        (get("_shadowAffinityToday") &&
          !have($effect`Shadow Affinity`) &&
          get("encountersUntilSRChoice") !== 0),
      prepare: () => {
        if (AugustScepter.canCast(7)) useSkill($skill`Aug. 7th: Lighthouse Day!`);
        if (CinchoDeMayo.currentCinch() >= 25) ensureEffect($effect`Party Soundtrack`);
        if (have($item`pocket wish`) && !have($effect`Frosty`)) cliExecute("genie effect frosty");
        if (haveLoathingIdolMicrophone()) ensureEffect($effect`Spitting Rhymes`);
        if (!get("_shadowAffinityToday")) ClosedCircuitPayphone.chooseQuest(() => 2);
      },
      do: $location`Shadow Rift (The Misspelled Cemetary)`,
      post: (): void => {
        if (have(ClosedCircuitPayphone.rufusTarget() as Item)) {
          use($item`closed-circuit pay phone`);
        }
      },
      choices: { 1498: 1 },
      combat: new CombatStrategy()
        .macro((): Macro => {
          const result = Macro.while_(
            "hasskill 226",
            Macro.skill($skill`Perpetrate Mild Evil`)
          ).trySkill($skill`Swoop like a Bat`);
          // Use all but the last extinguisher uses on polar vortex.
          const vortex_count = (get("_fireExtinguisherCharge") - 20) / 10;
          if (vortex_count > 0) {
            for (let i = 0; i < vortex_count; i++)
              result.trySkill($skill`Fire Extinguisher: Polar Vortex`);
          }
          result.while_("hasskill 7448 && !pastround 25", Macro.skill($skill`Douse Foe`));
          return result;
        }, $monster`shadow slab`)
        .killHard(),
      outfit: () => {
        const result: OutfitSpec = {
          modifier: "item",
          avoid: $items`broken champagne bottle`,
          equip: [],
        };
        if (
          have($item`industrial fire extinguisher`) &&
          get("_fireExtinguisherCharge") >= 30 // Leave some for harem
        )
          result.equip?.push($item`industrial fire extinguisher`);
        else if (DaylightShavings.nextBuff() === $effect`Friendly Chops`)
          result.equip?.push($item`Daylight Shavings Helmet`);
        if (have($item`Flash Liquidizer Ultra Dousing Accessory`) && get("_douseFoeUses") < 3)
          result.equip?.push($item`Flash Liquidizer Ultra Dousing Accessory`);
        if (have($item`bat wings`) && get("_batWingsFreeFights") === 5) {
          result.equip?.push($item`bat wings`);
        }
        return result;
      },
      boss: true,
      freecombat: true,
      limit: { tries: 12 },
    },
    {
      name: "Shadow Lodestone",
      after: ["Misc/Shadow Rift"],
      completed: () => have($effect`Shadow Waters`) || !have($item`Rufus's shadow lodestone`),
      do: $location`Shadow Rift (The Misspelled Cemetary)`,
      choices: {
        1500: 2,
      },
      combat: new CombatStrategy().macro(Macro.abort()),
      limit: { tries: 1 },
    },
    {
      name: "Eldritch Tentacle",
      after: ["Keys/Star Key", "Crypt/Cranny"],
      ready: () => get("questL02Larva") !== "unstarted",
      completed: () => get("_eldritchTentacleFought") || step("questL13Final") > -1,
      do: () => {
        visitUrl("place.php?whichplace=forestvillage&action=fv_scientist", false);
        runChoice(1);
      },
      combat: new CombatStrategy().killHard(),
      limit: { tries: 1 },
    },
    {
      name: "LOV Tunnel",
      after: [],
      priority: () => Priorities.Start,
      ready: () => get("loveTunnelAvailable"),
      completed: () => get("_loveTunnelUsed"),
      do: $location`The Tunnel of L.O.V.E.`,
      choices: { 1222: 1, 1223: 1, 1224: primestatId(), 1225: 1, 1226: 2, 1227: 1, 1228: 3 },
      combat: new CombatStrategy()
        .macro(
          () => Macro.externalIf(haveEquipped($item`June cleaver`), Macro.attack().repeat()),
          $monster`LOV Enforcer`
        )
        .macro(Macro.skill($skill`Saucestorm`).repeat(), $monster`LOV Engineer`)
        .killHard(),
      outfit: {
        equip: $items`June cleaver`,
      },
      limit: { tries: 1 },
      freecombat: true,
    },
    {
      name: "Daycare",
      after: [],
      priority: () => Priorities.Start,
      ready: () => get("daycareOpen"),
      completed: () => get("_daycareGymScavenges") !== 0,
      do: (): void => {
        if ((get("daycareOpen") || get("_daycareToday")) && !get("_daycareSpa")) {
          cliExecute("daycare myst");
        }
        visitUrl("place.php?whichplace=town_wrong&action=townwrong_boxingdaycare");
        runChoice(3);
        runChoice(2);
      },
      outfit: {
        modifier: "exp",
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Bastille",
      after: [],
      priority: () => Priorities.Start,
      ready: () => have($item`Bastille Battalion control rig`),
      completed: () => get("_bastilleGames") !== 0,
      do: () =>
        cliExecute(`bastille ${myPrimestat() === $stat`Mysticality` ? "myst" : myPrimestat()}`),
      limit: { tries: 1 },
      freeaction: true,
      outfit: {
        modifier: "exp",
      },
    },
    {
      name: "Leaflet",
      after: [],
      ready: () => myLevel() >= 9,
      completed: () => get("leafletCompleted"),
      do: (): void => {
        visitUrl("council.php");
        cliExecute("leaflet");
        set("leafletCompleted", true);
      },
      freeaction: true,
      limit: { tries: 1 },
      outfit: {
        modifier: "exp",
      },
    },
    {
      name: "Horsery",
      after: [],
      ready: () => get("horseryAvailable"),
      completed: () => get("_horsery") === "dark horse",
      do: () => cliExecute("horsery dark"),
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Toy Accordion",
      after: [],
      ready: () => myMeat() >= 1000,
      completed: () => have($item`toy accordion`),
      do: () => retrieveItem($item`toy accordion`),
      outfit: { equip: $items`designer sweatpants` },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Sewer Totem",
      after: ["Toy Accordion"],
      ready: () => myMeat() >= 1000,
      completed: () => have($item`turtle totem`),
      do: () => retrieveItem($item`turtle totem`),
      outfit: { equip: $items`designer sweatpants` },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Sewer Saucepan",
      after: ["Toy Accordion", "Sewer Totem"],
      ready: () => myMeat() >= 1000,
      completed: () => have($item`saucepan`),
      do: () => retrieveItem($item`saucepan`),
      outfit: { equip: $items`designer sweatpants` },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Wish",
      after: [],
      completed: () => get("_genieWishesUsed") >= 3 || !have($item`genie bottle`),
      do: () => cliExecute(`genie wish for more wishes`),
      limit: { tries: 3 },
      freeaction: true,
    },
    {
      name: "Saucecrafting",
      after: [],
      ready: () => have($skill`Advanced Saucecrafting`) && myMp() >= 10,
      completed: () => get("reagentSummons") > 0,
      do: () => useSkill($skill`Advanced Saucecrafting`),
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Prevent Scurvy and Sobriety",
      after: [],
      ready: () => have($skill`Prevent Scurvy and Sobriety`) && myMp() >= 50,
      completed: () => get("_preventScurvy"),
      do: () => useSkill($skill`Prevent Scurvy and Sobriety`),
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Snojo",
      after: [],
      ready: () =>
        get("snojoAvailable") &&
        have($familiar`Frumious Bandersnatch`) &&
        have($item`Greatest American Pants`) &&
        have($skill`Flavour of Magic`) &&
        have($skill`Cannelloni Cannon`) &&
        have($skill`Saucegeyser`) &&
        // Wait until bowling ball is thrown
        !have($item`cosmic bowling ball`),
      priority: () => Priorities.Start,
      prepare: (): void => {
        if (get("snojoSetting") === null) {
          visitUrl("place.php?whichplace=snojo&action=snojo_controller");
          runChoice(primestatId());
        }
        if (equippedAmount($item`Greatest American Pants`) > 0 && get("_gapBuffs") < 5) {
          ensureEffect($effect`Super Skill`); // after GAP are equipped
        }
        cliExecute("uneffect ode to booze");
        cliExecute("uneffect scarysauce");
        fillHp();
      },
      completed: () => get("_snojoFreeFights") >= 10,
      do: $location`The X-32-F Combat Training Snowman`,
      post: (): void => {
        if (get("_snojoFreeFights") === 10) cliExecute("hottub"); // Clean -stat effects
      },
      combat: new CombatStrategy()
        .macro(
          new Macro()
            .trySkill($skill`Curse of Weaksauce`)
            .trySkill($skill`Stuffed Mortar Shell`)
            .while_(
              "!pastround 26 && !hpbelow 100 && !mpbelow 8",
              new Macro().skill($skill`Cannelloni Cannon`)
            )
            .trySkill($skill`Darts: Throw at %part1`)
            .while_("!mpbelow 24", new Macro().skill($skill`Saucegeyser`))
            .attack()
            .repeat()
        )
        .killHard(),
      outfit: {
        familiar: $familiar`Frumious Bandersnatch`,
        equip: $items`Greatest American Pants, familiar scrapbook, yule hatchet, June cleaver, sea salt scrubs, Everfull Dart Holster, teacher's pen, toy Cupid bow`,
        modifier: "mainstat, 4exp, HP",
      },
      effects: $effects`Spirit of Peppermint`,
      limit: { tries: 10 },
      freecombat: true,
    },
    {
      name: "Cowboy Boots",
      after: [],
      completed: () => have($item`your cowboy boots`) || !get("telegraphOfficeAvailable"),
      do: () => visitUrl("place.php?whichplace=town_right&action=townright_ltt"),
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Barrel Lid",
      after: [],
      completed: () => get("_barrelPrayer") || !get("barrelShrineUnlocked"),
      do: () => {
        visitUrl("da.php?barrelshrine=1");
        runChoice(-1);
      },
      choices: { 1100: 1 },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Delevel",
      after: ["Tower/Shadow"],
      ready: () => myFullness() === fullnessLimit(),
      completed: () => !args.minor.delevel || !atLevel(14) || !have($item`Clan VIP Lounge key`),
      do: () => cliExecute("eat basic hot dog"),
      freeaction: true,
      limit: { tries: 15 },
    },
    {
      name: "Blood Bubble",
      after: [],
      ready: () => myMeat() >= meatBuffer + 500,
      completed: () =>
        !have($skill`Blood Bubble`) || step("questL13Final") > 10 || have($effect`Blood Bubble`),
      do: () => {
        useSkill($skill`Blood Bubble`, Math.floor((myHp() - 1) / 30));
        fillHp();
        useSkill($skill`Blood Bubble`, Math.floor((myHp() - 1) / 30));
      },
      outfit: { modifier: "HP" },
      freeaction: true,
      limit: { tries: 10 },
    },
    {
      name: "Blood Bond",
      after: [],
      ready: () => myMeat() >= meatBuffer + 500,
      completed: () =>
        !have($skill`Blood Bond`) || step("questL13Final") > 10 || have($effect`Blood Bond`),
      do: () => {
        useSkill($skill`Blood Bond`, Math.floor((myHp() - 1) / 30));
        fillHp();
        useSkill($skill`Blood Bond`, Math.floor((myHp() - 1) / 30));
      },
      outfit: { modifier: "HP" },
      freeaction: true,
      limit: { tries: 10 },
    },
    {
      name: "Leaf Resin",
      ready: () =>
        BurningLeaves.have() && BurningLeaves.numberOfLeaves() >= 50 && !have($effect`Resined`),
      completed: () => step("questL12War") === 999, // Stop near the end of the run
      acquire: [{ item: $item`distilled resin` }],
      do: () => use($item`distilled resin`),
      limit: { tries: 5, unready: true },
      freeaction: true,
    },
    {
      name: "Leaf Canopy Bed",
      after: ["Leaflet"],
      ready: () => {
        if (!CinchoDeMayo.have()) return false;
        if (
          getDwelling() === $item`big rock` &&
          !have($item`Frobozz Real-Estate Company Instant House (TM)`)
        )
          return false;
        // Only when the extra free rests push over the next cincho threshold
        if (
          totalFreeRests() < 8 ||
          (totalFreeRests() >= 12 && totalFreeRests() < 17) ||
          (totalFreeRests() >= 24 && totalFreeRests() < 29) ||
          (totalFreeRests() >= 36 && totalFreeRests() < 41)
        ) {
          return have($item`forest canopy bed`) || BurningLeaves.numberOfLeaves() >= 74;
        }
        return false;
      },
      completed: () => "forest canopy bed" in getCampground(),
      do: () => {
        if (getDwelling() === $item`big rock`) {
          use($item`Frobozz Real-Estate Company Instant House (TM)`);
        }
        retrieveItem($item`forest canopy bed`);
        use($item`forest canopy bed`);
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Acquire Tuba",
      ready: () => args.resources.saveapriling < 2 && AprilingBandHelmet.canJoinSection(),
      completed: () => have($item`Apriling band tuba`),
      do: () => AprilingBandHelmet.joinSection($item`Apriling band tuba`),
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Open McHugeLarge Bag",
      after: [],
      completed: () => !have($item`McHugeLarge duffel bag`) || have($item`McHugeLarge right pole`),
      do: () => visitUrl("inventory.php?action=skiduffel&pwd"),
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Check Florist",
      after: ["Mosquito/Start"],
      completed: () => get("floristFriarChecked"),
      do: () => {
        floristAvailable();
        cliExecute("ash florist_available()");
      },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Clan Photo Booth Free Kill",
      after: [],
      completed: () =>
        get(toTempPref("photoBoothChecked"), false) ||
        (have($item`Sheriff moustache`) &&
          have($item`Sheriff badge`) &&
          have($item`Sheriff pistol`)) ||
        get("_photoBoothEquipment", 0) >= 3,
      do: (): void => {
        set(toTempPref("photoBoothChecked"), true);
        if (getClanName() !== "Bonus Adventures from Hell") {
          const clanWL = Clan.getWhitelisted();
          const bafhWL =
            clanWL.find((c) => c.name === getClanName()) !== undefined &&
            clanWL.find((c) => c.name === "Bonus Adventures from Hell") !== undefined;
          if (!bafhWL) return;
        }

        Clan.with("Bonus Adventures from Hell", () => {
          cliExecute("photobooth item moustache");
          cliExecute("photobooth item badge");
          cliExecute("photobooth item pistol");
        });
      },
      freeaction: true,
      limit: { tries: 3 },
    },
    {
      // The ultimate location to put needed backups
      name: `Backup Monster`,
      completed: () => false,
      ready: () => {
        if (!have($item`backup camera`)) return false;
        if (get("_backUpUses") >= 11 - args.resources.savebackups) return false;
        const target = getActiveBackupTarget();
        return target !== undefined && target.monster !== $monster`Eldritch Tentacle`;
      },
      do: $location`Noob Cave`,
      delay: 11,
      limit: { tries: 11 },
    },
  ],
};

export const WandQuest: Quest = {
  name: "Wand",
  tasks: [
    {
      name: "Plus Sign",
      after: [],
      ready: () =>
        myBasestat($stat`muscle`) >= 45 &&
        myBasestat($stat`mysticality`) >= 45 &&
        myBasestat($stat`moxie`) >= 45 &&
        (keyStrategy.useful(Keys.Zap) || args.minor.wand),
      completed: () => have($item`plus sign`) || get("lastPlusSignUnlock") === myAscensions(),
      do: $location`The Enormous Greater-Than Sign`,
      outfit: { modifier: "-combat" },
      choices: { 451: 3 },
      limit: { soft: 20 },
    },
    {
      name: "Get Teleportitis",
      after: ["Plus Sign"],
      ready: () =>
        myMeat() >= 1000 && // Meat for goal teleportitis choice adventure
        have($item`soft green echo eyedrop antidote`) && // Antitdote to remove teleportitis afterwards
        (keyStrategy.useful(Keys.Zap) || args.minor.wand),
      completed: () => have($effect`Teleportitis`) || get("lastPlusSignUnlock") === myAscensions(),
      do: $location`The Enormous Greater-Than Sign`,
      outfit: { modifier: "-combat" },
      choices: { 451: 5 },
      limit: { soft: 20 },
    },
    {
      name: "Mimic",
      after: ["Get Teleportitis"],
      ready: () => myMeat() >= 5000,
      completed: () =>
        have($item`dead mimic`) ||
        get("lastZapperWand") === myAscensions() ||
        have($item`aluminum wand`) ||
        have($item`ebony wand`) ||
        have($item`hexagonal wand`) ||
        have($item`marble wand`) ||
        have($item`pine wand`) ||
        (keyStrategy.useful(Keys.Zap) === false && !args.minor.wand),
      prepare: () => {
        if (have($item`plus sign`)) use($item`plus sign`);
      },
      do: $location`The Dungeons of Doom`,
      outfit: { modifier: "-combat, init" },
      orbtargets: () => undefined,
      combat: new CombatStrategy()
        .banish($monster`Quantum Mechanic`)
        .kill($monsters`mimic, The Master Of Thieves`), // Avoid getting more teleportitis
      choices: { 25: 2 },
      limit: { soft: 20 },
    },
    {
      name: "Wand",
      after: ["Mimic"],
      completed: () =>
        get("lastZapperWand") === myAscensions() ||
        have($item`aluminum wand`) ||
        have($item`ebony wand`) ||
        have($item`hexagonal wand`) ||
        have($item`marble wand`) ||
        have($item`pine wand`) ||
        keyStrategy.useful(Keys.Zap) === false,
      do: () => use($item`dead mimic`),
      freeaction: true,
      limit: { tries: 1 },
    },
  ],
};

export function teleportitisTask(engine: Engine, tasks: Task[]): Task {
  // Combine the choice selections from all tasks
  // Where multiple tasks make different choices at the same choice, prefer:
  //  * Earlier tasks to later tasks
  //  * Uncompleted tasks to completed tasks
  const choices: Task["choices"] = { 3: 3 }; // The goal choice

  const done_tasks = tasks.filter((task) => task.completed());
  const left_tasks = tasks.filter((task) => !task.completed());
  for (const task of [...left_tasks, ...done_tasks].reverse()) {
    const task_choices = undelay(task.choices);
    for (const choice_id_str in task_choices) {
      const choice_id = parseInt(choice_id_str);
      choices[choice_id] = task_choices[choice_id];
    }
  }

  // Escape the hidden city alters
  choices[781] = 6;
  choices[783] = 6;
  choices[785] = 6;
  choices[787] = 6;
  if (step("questL11Worship") >= 3) {
    // Escape the hidden heart of the hidden temple
    choices[580] = 3;
  }
  // Exit NEP intro choice
  choices[1322] = 6;
  // Leave the gingerbread city clock alone
  choices[1215] = 2;
  // Leave the daily dungeon alone
  choices[689] = 1;
  choices[690] = 3;
  choices[691] = 3;
  choices[692] = 8;
  choices[693] = 3;
  // Leave the shore alone
  choices[793] = 4;

  const combat = new CombatStrategy();
  const haiku_monsters = [
    $monster`amateur ninja`,
    $monster`ancient insane monk`,
    $monster`ferocious bugbear`,
    $monster`gelatinous cube`,
    $monster`Knob Goblin poseur`,
  ];
  combat.macro(new Macro().attack().repeat(), haiku_monsters);

  return {
    name: "Teleportitis",
    after: ["Wand/Get Teleportitis"],
    ready: () => have($effect`Teleportitis`),
    completed: () => get("lastPlusSignUnlock") === myAscensions(),
    do: $location`The Enormous Greater-Than Sign`,
    post: () => {
      // Some tracking is broken when we encounter it with teleportitis
      if (get("lastEncounter") === "Having a Ball in the Ballroom") set("questM21Dance", "step4");
      if (get("lastEncounter") === "Too Much Humanity" && step("questL11Ron") < 1)
        set("questL11Ron", "step1");
    },
    outfit: { equip: $items`antique machete` },
    combat: combat,
    choices: choices,
    limit: { soft: 20 },
  };
}

export const removeTeleportitis = {
  name: "Clear Teleportitis",
  after: [],
  ready: () => have($item`soft green echo eyedrop antidote`),
  completed: () => !have($effect`Teleportitis`),
  do: () => {
    uneffect($effect`Teleportitis`);
  },
  limit: { soft: 2 },
  freeaction: true,
};

export function haveOre() {
  if (step("questL08Trapper") >= 2) return true;
  const ore = get("trapperOre");
  if (ore) {
    return itemAmount(ore) >= 3;
  }
  return (
    itemAmount($item`asbestos ore`) >= 3 &&
    itemAmount($item`chrome ore`) >= 3 &&
    itemAmount($item`linoleum ore`) >= 3
  );
}

function willWorkshedSwap() {
  return false; // Cold medicine cabinet does not currently finish
}

export function trainSetAvailable() {
  if (getWorkshed() === $item`model train set`) return true;
  if (!have($item`model train set`)) return false;
  if (getWorkshed() === $item`none` && args.major.workshed === $item`model train set`) return true;
  if (args.major.swapworkshed === $item`model train set` && willWorkshedSwap()) return true;
  return false;
}

function getDesiredTrainsetConfig(): TrainSet.Cycle {
  const statPiece = byStat({
    Muscle: Station.BRAWN_SILO,
    Mysticality: Station.BRAIN_SILO,
    Moxie: Station.GROIN_SILO,
  });

  const config: Station[] = [];
  config.push(Station.COAL_HOPPER);
  if (!have($item`designer sweatpants`)) {
    config.push(Station.TOWER_FIZZY);
  } else if (myLevel() < 5 && (!have($item`Sept-Ember Censer`) || args.resources.saveember > 0)) {
    config.push(statPiece);
  }

  config.push(Station.LOGGING_MILL);
  config.push(Station.GAIN_MEAT);

  if (myLevel() < 12 && !config.includes(statPiece)) {
    config.push(statPiece);
  }

  if (!config.includes(Station.TOWER_FIZZY)) {
    config.push(Station.TOWER_FIZZY);
  }
  if (!haveOre()) config.push(Station.ORE_HOPPER);

  config.push(Station.TOWER_FROZEN);
  config.push(Station.SPOOKY_GRAVEYARD);
  config.push(Station.TRACKSIDE_DINER);
  config.push(Station.GRAIN_SILO);
  config.push(Station.CANDY_FACTORY);
  return config.slice(0, 8) as TrainSet.Cycle;
}

function chooseBestLeprecondo(): number[] {
  const furnitureFound = new Set(get("leprecondoDiscovered", "").split(",").map(Number));

  // Prioritizing familiar weight/Experience, then Meat Find, then random Booze
  const f1 = furnitureFound.has(21) ? 21 : 0; // Whiskeybed First to prevent overriding anything important
  const f2 = furnitureFound.has(8) ? 8 : 0; // Karaoke -> overwritten with treadmill for familiar weight
  const f3 = furnitureFound.has(9) ? 9 : 0; // Treadmill -> exercise, don't care about the food
  const f4 = furnitureFound.has(13) ? 13 : 0; // Sous vide -> meat% and random food

  return [f1, f2, f3, f4];
}

function isLeprecondoComplete(): boolean {
  return get("leprecondoInstalled", "0,0,0,0") === chooseBestLeprecondo().join(",");
}
