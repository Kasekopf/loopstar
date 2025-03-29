import { NamedDeltaTask, Quest } from "../../engine/task";
import { toTempPref } from "../../args";
import { cliExecute, min, myLevel, myTurncount, runChoice, visitUrl } from "kolmafia";
import { set } from "libram/dist/counter";
import { $item, $items, $location, $monster, $skill, get, have, TrainSet, Witchess } from "libram";
import { CombatStrategy } from "../../engine/combat";
import { fillHp } from "../../engine/moods";
import { Priorities } from "../../engine/priority";
import { Station } from "libram/dist/resources/2022/TrainSet";
import { haveOre } from "../../tasks/misc";
import { step } from "grimoire-kolmafia";

const deletedTasks = [
  "Misc/Snojo",
  "Misc/LOV Tunnel",
  "Misc/Toy Accordion",
  "Misc/Sewer Saucepan",
  "Misc/Sewer Totem",
  "Misc/Barrel Lid",
  "Misc/Clan Photo Booth Free Kill",
  "Misc/Boombox",
  "Manor/Wine Cellar",
  "Manor/Laundry Room",
  "Manor/Fulminate",
  "Manor/Boiler Room",
  "Manor/Blow Wall",
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
      priority: () => Priorities.Start,
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
