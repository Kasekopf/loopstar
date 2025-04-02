import { NamedDeltaTask, Quest } from "../../engine/task";
import { args, toTempPref } from "../../args";
import {
  cliExecute,
  drink,
  eat,
  fullnessLimit,
  getWorkshed,
  gnomadsAvailable,
  itemAmount,
  min,
  myAdventures,
  myAscensions,
  myFullness,
  myInebriety,
  myLevel,
  myMeat,
  mySign,
  myTurncount,
  retrieveItem,
  runChoice,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
import { set } from "libram/dist/counter";
import {
  $effect,
  $effects,
  $item,
  $items,
  $location,
  $monster,
  $skill,
  AugustScepter,
  clamp,
  directlyUse,
  get,
  have,
  MayamCalendar,
  TrainSet,
  Witchess,
} from "libram";
import { CombatStrategy } from "../../engine/combat";
import { fillHp } from "../../engine/moods";
import { Priorities } from "../../engine/priority";
import { Station } from "libram/dist/resources/2022/TrainSet";
import { haveOre, trainSetAvailable } from "../../tasks/misc";
import { OutfitSpec, step } from "grimoire-kolmafia";
import { atLevel, tryPlayApriling } from "../../lib";
import { coldPlanner } from "../../engine/outfit";

const deletedTasks = [
  "Misc/Snojo",
  "Misc/LOV Tunnel",
  "Misc/Toy Accordion",
  "Misc/Sewer Saucepan",
  "Misc/Sewer Totem",
  "Misc/Barrel Lid",
  "Misc/Clan Photo Booth Free Kill",
  "Misc/Boombox",
  "Misc/Goose Exp",
  "Misc/Mayam Calendar",
  "Manor/Wine Cellar",
  "Manor/Laundry Room",
  "Manor/Fulminate",
  "Manor/Boiler Room",
  "Manor/Blow Wall",
  // No WAND needed
  "Tower/Wand W",
  "Tower/Wand A",
  "Tower/Wand N",
  "Tower/Wand D",
  "Tower/Wand Parts",
  "Tower/Wand",
  "McLargeHuge/Extreme Outfit",
  "McLargeHuge/Extreme Snowboard Initial",
  "McLargeHuge/Extreme Snowboard",
  "Hidden City/Get Machete",
];

export const borisDeltas: NamedDeltaTask[] = [
  ...deletedTasks.map(
    (name) =>
      <NamedDeltaTask>{
        name: name,
        delete: true,
      }
  ),
  {
    name: "Manor/Boss",
    replace: {
      after: ["SlowManor/Blow Wall"],
    },
  },
  // Obtain Mayday immediately
  {
    name: "Misc/Mayday",
    replace: {
      completed: () => !get("hasMaydayContract") || !have($item`MayDay™ supply package`),
    },
  },
  {
    name: "Misc/Trainset",
    replace: {
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
    },
  },
  {
    name: "Keys/Deck",
    replace: {
      do: () => {
        cliExecute("cheat tower");
        if (get("_deckCardsDrawn") <= 10) cliExecute("cheat sheep");
        if (get("_deckCardsDrawn") <= 10) {
          if (trainSetAvailable()) cliExecute("cheat mickey");
          else cliExecute("cheat mine");
        }
      },
    },
  },
  {
    name: "Palindome/Cold Snake",
    replace: {
      outfit: { modifier: "+combat" },
    },
  },
  {
    name: "McLargeHuge/Climb",
    replace: {
      after: ["Boris/Ninja"],
      ready: () => coldPlanner.maximumPossible(true) >= 5,
      outfit: () => coldPlanner.outfitFor(5),
    },
  },
];

export const BorisQuest: Quest = {
  name: "Boris",
  tasks: [
    {
      name: "Skills",
      completed: () =>
        (have($skill`Gourmand`) &&
          have($skill`Banishing Shout`) &&
          have($skill`Bifurcating Blow`)) ||
        get(toTempPref("borisSkillsChecked"), 0) >= min(myLevel(), 15),
      do: () => {
        const page = visitUrl("da.php?place=gate1");
        const toLearn = Number(page.match("You can learn (\\d+) more skill")?.groups?.[1] ?? "0");

        for (let i = 0; i < toLearn; i++) {
          // Finish the skill trees Feasting -> Shouting -> Fighting
          if (!have($skill`Gourmand`)) visitUrl("da.php?pwd&whichtree=3&action=borisskill");
          else if (!have($skill`Banishing Shout`))
            visitUrl("da.php?pwd&whichtree=2&action=borisskill");
          else if (!have($skill`Bifurcating Blow`))
            visitUrl("da.php?pwd&whichtree=3&action=borisskill");
          else break;
        }
        set(toTempPref("borisSkillsChecked"), myLevel());
      },
      limit: { unready: true, tries: 15 },
      freeaction: true,
    },
    // Free Fights
    {
      name: "Witchess",
      completed: () => Witchess.fightsDone() >= 5,
      // Do this right when the doubling station is up,
      // so that in the fight after this the food is tripled.
      priority: () => Priorities.Start,
      ready: () =>
        Witchess.have() && TrainSet.installed() && TrainSet.next() === TrainSet.Station.COAL_HOPPER,
      do: () => {
        Witchess.fightPiece($monster`Witchess Knight`);
      },
      outfit: {
        equip: $items`makeshift garbage shirt, designer sweatpants, Everfull Dart Holster`,
      },
      combat: new CombatStrategy().kill(),
      freecombat: true,
      limit: { tries: 5 },
    },
    {
      name: "Snojo",
      after: [],
      ready: () =>
        get("snojoAvailable") &&
        // Wait until bowling ball is thrown
        !have($item`cosmic bowling ball`),
      prepare: (): void => {
        if (get("snojoSetting") === null) {
          visitUrl("place.php?whichplace=snojo&action=snojo_controller");
          runChoice(2); // Mysticality for ice rice
        }
        fillHp();
      },
      completed: () => get("_snojoFreeFights") >= 10,
      do: $location`The X-32-F Combat Training Snowman`,
      outfit: {
        equip: $items`designer sweatpants, Everfull Dart Holster`,
      },
      post: (): void => {
        if (get("_snojoFreeFights") === 10) cliExecute("hottub"); // Clean -stat effects
      },
      combat: new CombatStrategy().kill(),
      limit: { tries: 10 },
      freecombat: true,
    },
    {
      name: "Oliver",
      completed: () => get("_speakeasyFreeFights") >= 0,
      ready: () => get("ownsSpeakeasy"),
      do: $location`An Unusually Quiet Barroom Brawl`,
      combat: new CombatStrategy().kill(),
      outfit: {
        equip: $items`designer sweatpants, Everfull Dart Holster`,
      },
      freecombat: true,
      limit: { tries: 3 },
    },
    {
      name: "Neverending Party",
      after: [],
      completed: () => get("_neverendingPartyFreeTurns") >= 10,
      do: $location`The Neverending Party`,
      choices: { 1322: 2, 1324: 5 },
      combat: new CombatStrategy().kill(),
      outfit: {
        equip: $items`makeshift garbage shirt, designer sweatpants, Everfull Dart Holster`,
      },
      limit: { tries: 11 },
      freecombat: true,
    },
    {
      name: "LOV Tunnel",
      after: [],
      ready: () => get("loveTunnelAvailable"),
      completed: () => get("_loveTunnelUsed"),
      do: $location`The Tunnel of L.O.V.E.`,
      choices: {
        1222: 1,
        1223: 1,
        1224: 3, // +meat, +res
        1225: 1,
        1226: 3, // +items
        1227: 1,
        1228: 3, // chocolate (+adv)
      },
      outfit: {
        equip: $items`designer sweatpants, Everfull Dart Holster`,
      },
      combat: new CombatStrategy().kill(),
      limit: { tries: 1 },
      freecombat: true,
    },
    {
      name: "Boombox",
      after: [],
      completed: () =>
        !have($item`SongBoom™ BoomBox`) ||
        get("boomBoxSong") === "Special Seasoning" ||
        get("_boomBoxSongsLeft") === 0,
      do: () => cliExecute("boombox seasoning"),
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Mayam Calendar 1",
      after: [],
      completed: () =>
        !MayamCalendar.have() ||
        get("lastTempleAdventures") >= myAscensions() ||
        MayamCalendar.remainingUses() === 0,
      do: () => {
        cliExecute("mayam rings yam meat cheese yam"); // yam and swiss
        cliExecute("mayam rings chair wood wall clock");
        cliExecute("mayam rings eye meat eyepatch explosion");
      },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Mayam Calendar 2",
      after: ["Mayam Calendar 1", "BorisDiet/Such Great Heights"],
      completed: () => !MayamCalendar.have() || MayamCalendar.remainingUses() === 0,
      do: () => {
        cliExecute;
        cliExecute("mayam rings vessel yam cheese explosion"); // stuffed yam stinkbomb
        cliExecute("mayam rings chair wood wall clock");
        cliExecute("mayam rings eye meat eyepatch yam");
      },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Gnome Shirt",
      after: ["Misc/Unlock Beach"],
      ready: () =>
        (myMeat() >= 11000 || (myMeat() >= 6000 && getWorkshed() === $item`model train set`)) &&
        gnomadsAvailable(),
      completed: () => have($skill`Torso Awareness`),
      freeaction: true,
      do: () => {
        visitUrl("gnomes.php?action=trainskill&whichskill=12");
      },
      limit: { tries: 1 },
    },
    {
      name: "Tune after Diet",
      after: [],
      ready: () =>
        (mySign() === "Blender" && myInebriety() > 0 && have($skill`Torso Awareness`)) ||
        (mySign() === "Opossum" && myFullness() > 0),
      completed: () =>
        !have($item`hewn moon-rune spoon`) ||
        args.minor.tune === undefined ||
        get("moonTuned", false),
      freeaction: true,
      do: () => cliExecute(`spoon ${args.minor.tune}`),
      limit: { tries: 1 },
    },
    {
      name: "Airship YR Anything",
      after: ["Giant/Grow Beanstalk", "Gnome Shirt"],
      completed: () => have($item`amulet of extreme plot significance`) || have($item`Mohawk wig`),
      do: $location`The Penultimate Fantasy Airship`,
      // Other options (bat wings) are sometimes chosen by choice script
      choices: { 182: 1 },
      post: () => {
        if (have($effect`Temporary Amnesia`)) cliExecute("uneffect Temporary Amnesia");
      },
      limit: { soft: 50 },
      delay: 15,
      outfit: () =>
        <OutfitSpec>{
          modifier: "item",
          equip: $items`bat wings`,
          avoid: $items`broken champagne bottle`,
        },
      combat: new CombatStrategy()
        .yellowRay($monster`Burly Sidekick`)
        .yellowRay($monster`Quiet Healer`),
    },
    {
      name: "Ninja",
      after: ["McLargeHuge/Trapper Return", "Palindome/Cold Snake"],
      completed: () =>
        (have($item`ninja rope`) && have($item`ninja carabiner`) && have($item`ninja crampons`)) ||
        step("questL08Trapper") >= 3,
      prepare: () => {
        fillHp();
        tryPlayApriling("+combat");
      },
      ready: () => !get("noncombatForcerActive"),
      do: $location`Lair of the Ninja Snowmen`,
      outfit: () =>
        <OutfitSpec>{
          modifier: "50 combat, init",
          skipDefaults: true,
        },
      limit: { soft: 30 },
    },
  ],
};

export const BorisDietQuest: Quest = {
  name: "BorisDiet",
  tasks: [
    {
      name: "LOV Chocolate",
      after: ["Boris/LOV Tunnel"],
      ready: () => have($item`LOV Extraterrestrial Chocolate`),
      completed: () => get("_loveChocolatesUsed") > 0,
      do: () => use($item`LOV Extraterrestrial Chocolate`),
      limit: { tries: 1 },
      freeaction: true,
      withnoadventures: true,
    },
    {
      name: "Sausage",
      after: [],
      completed: () => !have($item`Kramco Sausage-o-Matic™`) || get("_sausagesEaten") >= 23,
      ready: () => have($item`magical sausage casing`) && myMeat() >= 10000,
      do: (): void => {
        const toEat = clamp(
          itemAmount($item`magical sausage casing`),
          0,
          23 - get("_sausagesEaten")
        );
        eat(toEat, $item`magical sausage`);
      },
      limit: { tries: 23 },
      freeaction: true,
      withnoadventures: true,
    },
    // Drinking
    {
      name: "Open Pilsner",
      after: [],
      completed: () => !have($item`astral six-pack`),
      do: () => use($item`astral six-pack`),
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Sweat Out",
      after: [],
      ready: () => myInebriety() > 0 && get("sweat") >= 25,
      completed: () => !have($item`designer sweatpants`) || get("_sweatOutSomeBoozeUsed") >= 3,
      do: () => useSkill($skill`Sweat Out Some Booze`),
      limit: { tries: 3 },
      freeaction: true,
    },
    {
      name: "Pilsner",
      after: ["Open Pilsner"],
      ready: () => atLevel(11) && myInebriety() < 4,
      completed: () => !have($item`astral pilsner`),
      prepare: () => {
        if (have($item`pocket wish`) && !have($effect`Ode to Booze`))
          cliExecute("genie effect ode to booze");
      },
      do: () => drink($item`astral pilsner`),
      limit: { tries: 6 },
      freeaction: true,
      withnoadventures: true,
    },
    {
      name: "Martini",
      after: ["Open Pilsner", "Pilsner"],
      ready: () => myInebriety() < 4,
      completed: () => !have($item`splendid martini`),
      do: () => drink($item`splendid martini`),
      limit: { tries: 1 },
      freeaction: true,
      withnoadventures: true,
    },
    // Eating
    {
      name: "Roller Coaster",
      after: [],
      ready: () => myFullness() >= 1,
      completed: () => !AugustScepter.canCast(16),
      do: () => useSkill($skill`Aug. 16th: Roller Coaster Day!`),
      limit: { tries: 1 },
      freeaction: true,
      withnoadventures: true,
    },
    {
      name: "Voraci Tea",
      after: [],
      ready: () => myFullness() >= 1,
      completed: () => !have($item`cuppa Voraci tea`) && get("_pottedTeaTreeUsed"),
      do: () => {
        if (!have($item`cuppa Voraci tea`)) retrieveItem($item`cuppa Voraci tea`);
        use($item`cuppa Voraci tea`);
      },
      limit: { tries: 1 },
      freeaction: true,
      withnoadventures: true,
    },
    {
      name: "Horseradish",
      after: ["Yam and Swiss"],
      ready: () =>
        (have($item`Special Seasoning`) || myAdventures() === 0) && have($skill`Gourmand`),
      completed: () => !have($item`jumping horseradish`) || myFullness() >= fullnessLimit(),
      do: () => eat($item`jumping horseradish`),
      effects: $effects`Song of the Glorious Lunch`,
      limit: { tries: 15 },
      freeaction: true,
      withnoadventures: true,
    },
    {
      name: "Ice Rice",
      after: ["Boris/Snojo", "Yam and Swiss"],
      ready: () =>
        (have($item`Special Seasoning`) || myAdventures() === 0) && have($skill`Gourmand`),
      completed: () => !have($item`ice rice`) || myFullness() >= fullnessLimit(),
      prepare: () => {
        if (have($item`pocket wish`) && !have($effect`Got Milk`) && !get("_milkOfMagnesiumUsed"))
          cliExecute("genie effect got milk");
      },
      do: () => eat($item`ice rice`),
      effects: $effects`Song of the Glorious Lunch`,
      limit: { tries: 1 },
      freeaction: true,
      withnoadventures: true,
    },
    {
      name: "Timespun Ice Rice",
      after: ["Boris/Snojo", "Ice Rice"],
      completed: () =>
        !have($item`Time-Spinner`) ||
        get("_timeSpinnerMinutesUsed") >= 8 ||
        myFullness() >= fullnessLimit(),
      do: () => {
        directlyUse($item`Time-Spinner`);
        runChoice(2);
        runChoice(1, `foodid=8697`);
      },
      effects: $effects`Song of the Glorious Lunch`,
      limit: { tries: 3 },
      freeaction: true,
      withnoadventures: true,
    },
    {
      name: "Cookbookbat Big",
      after: [],
      ready: () =>
        itemAmount($item`Vegetable of Jarlsberg`) >= 2 &&
        itemAmount($item`St. Sneaky Pete's Whey`) >= 2 &&
        itemAmount($item`Yeast of Boris`) >= 2,
      completed: () => get("pizzaOfLegendEaten") || myFullness() >= fullnessLimit(),
      do: () => {
        retrieveItem($item`Pizza of Legend`);
        eat($item`Pizza of Legend`);
      },
      effects: $effects`Song of the Glorious Lunch`,
      limit: { tries: 1 },
      freeaction: true,
      withnoadventures: true,
    },
    {
      name: "Cookbookbat Small",
      after: ["Cookbookbat Big"],
      completed: () => itemAmount($item`Yeast of Boris`) < 2 || myFullness() >= fullnessLimit(),
      do: () => {
        retrieveItem($item`Boris's bread`);
        eat($item`Boris's bread`);
      },
      effects: $effects`Song of the Glorious Lunch`,
      limit: { tries: 1 },
      freeaction: true,
      withnoadventures: true,
    },
    {
      name: "Yam and Swiss",
      after: ["Boris/Mayam Calendar 1"],
      ready: () => have($item`Special Seasoning`) || myAdventures() === 0,
      completed: () => !have($item`yam and swiss`) || myFullness() >= fullnessLimit(),
      do: () => eat($item`yam and swiss`),
      effects: $effects`Song of the Glorious Lunch`,
      limit: { tries: 1 },
      freeaction: true,
      withnoadventures: true,
    },
    {
      name: "Such Great Heights",
      after: ["Boris/Mayam Calendar 1", "Hidden City/Open City"],
      ready: () => have($item`stone wool`),
      completed: () => get("lastTempleAdventures") >= myAscensions(),
      do: $location`The Hidden Temple`,
      choices: { 582: 1, 579: 3 },
      limit: { tries: 1 },
      freeaction: true,
    },
  ],
};

export const SlowManorQuest: Quest = {
  name: "SlowManor",
  tasks: [
    {
      name: "Kitchen",
      after: ["Manor/Learn Recipe"],
      completed: () => have($item`loosening powder`),
      do: $location`The Haunted Kitchen`,
      limit: { tries: 10 },
      delay: 5,
    },
    {
      name: "Conservatory",
      after: ["Manor/Learn Recipe"],
      completed: () => have($item`powdered castoreum`),
      do: $location`The Haunted Conservatory`,
      limit: { tries: 10 },
      delay: 5,
    },
    {
      name: "Bathroom",
      after: ["Manor/Learn Recipe"],
      completed: () => have($item`drain dissolver`),
      do: $location`The Haunted Bathroom`,
      limit: { tries: 10 },
      delay: 5,
    },
    {
      name: "Gallery",
      after: ["Manor/Learn Recipe"],
      completed: () => have($item`triple-distilled turpentine`),
      do: $location`The Haunted Gallery`,
      limit: { tries: 10 },
      delay: 5,
    },
    {
      name: "Laboratory",
      after: ["Manor/Learn Recipe"],
      completed: () => have($item`detartrated anhydrous sublicalc`),
      do: $location`The Haunted Laboratory`,
      limit: { tries: 10 },
      delay: 5,
    },
    {
      name: "Storage Room",
      after: ["Manor/Learn Recipe"],
      completed: () => have($item`triatomaceous dust`),
      do: $location`The Haunted Storage Room`,
      limit: { tries: 10 },
      delay: 5,
    },
    {
      name: "Blow Wall",
      after: ["Kitchen", "Conservatory", "Bathroom", "Gallery", "Laboratory", "Storage Room"],
      completed: () => step("questL11Manor") >= 3,
      do: () => visitUrl("place.php?whichplace=manor4&action=manor4_chamberwall"),
      limit: { tries: 1 },
      freeaction: true,
    },
  ],
};

function getDesiredTrainsetConfig(): TrainSet.Cycle {
  const config: Station[] = [];
  if (myTurncount() <= 1) config.push(Station.TOWER_SEWAGE); // hit with first CBB fight
  config.push(Station.COAL_HOPPER);
  if (Witchess.have() && Witchess.fightsDone() < 5) {
    config.push(Station.TRACKSIDE_DINER);
  }
  config.push(Station.LOGGING_MILL);
  config.push(Station.GAIN_MEAT);
  config.push(Station.BRAWN_SILO);
  config.push(Station.TOWER_FIZZY);
  if (!haveOre()) config.push(Station.ORE_HOPPER);
  if (!config.includes(Station.TOWER_SEWAGE)) config.push(Station.TOWER_SEWAGE);
  config.push(Station.BRAIN_SILO);
  return config.slice(0, 8) as TrainSet.Cycle;
}
