import {
  buy,
  cliExecute,
  closetAmount,
  familiarWeight,
  Item,
  itemAmount,
  myAscensions,
  myFamiliar,
  myHash,
  myMeat,
  putCloset,
  takeCloset,
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
  $skill,
  get,
  have,
  Macro,
} from "libram";
import { NCForce, Quest, Task } from "../engine/task";
import { OutfitSpec, step } from "grimoire-kolmafia";
import { Priorities } from "../engine/priority";
import { CombatStrategy } from "../engine/combat";
import { cosmicBowlingBallReady } from "../lib";
import { fillHp } from "../engine/moods";
import { tryPlayApriling } from "../engine/resources";

function manualChoice(whichchoice: number, option: number) {
  return visitUrl(`choice.php?whichchoice=${whichchoice}&pwd=${myHash()}&option=${option}`);
}

const Temple: Task[] = [
  {
    name: "Forest Coin",
    after: ["Mosquito/Burn Delay"],
    prepare: () => {
      tryPlayApriling("-combat");
    },
    completed: () =>
      have($item`tree-holed coin`) ||
      have($item`Spooky Temple map`) ||
      step("questM16Temple") === 999,
    do: $location`The Spooky Forest`,
    ncforce: NCForce.Yes,
    choices: { 502: 2, 505: 2, 334: 1 },
    outfit: { modifier: "-combat" },
    limit: { soft: 10 },
  },
  {
    name: "Forest Map",
    after: ["Forest Coin"],
    prepare: () => {
      tryPlayApriling("-combat");
    },
    completed: () => have($item`Spooky Temple map`) || step("questM16Temple") === 999,
    do: $location`The Spooky Forest`,
    ncforce: NCForce.Yes,
    choices: { 502: 3, 506: 3, 507: 1, 334: 1 },
    outfit: { modifier: "-combat" },
    limit: { soft: 10 },
  },
  {
    name: "Forest Fertilizer",
    after: ["Mosquito/Burn Delay"],
    prepare: () => {
      tryPlayApriling("-combat");
    },
    completed: () => have($item`Spooky-Gro fertilizer`) || step("questM16Temple") === 999,
    do: $location`The Spooky Forest`,
    ncforce: NCForce.Yes,
    choices: { 502: 3, 506: 2, 507: 1, 334: 1 },
    outfit: { modifier: "-combat" },
    limit: { soft: 10 },
  },
  {
    name: "Forest Sapling",
    after: ["Mosquito/Burn Delay"],
    prepare: () => {
      tryPlayApriling("-combat");
    },
    completed: () => have($item`spooky sapling`) || step("questM16Temple") === 999,
    do: $location`The Spooky Forest`,
    ncforce: NCForce.Yes,
    choices: { 502: 1, 503: 3, 504: 3, 334: 1 },
    outfit: { modifier: "-combat" },
    limit: { soft: 10 },
  },
  {
    name: "Open Temple",
    after: ["Forest Coin", "Forest Map", "Forest Sapling", "Forest Fertilizer"],
    completed: () => step("questM16Temple") === 999,
    do: () => use($item`Spooky Temple map`),
    limit: { tries: 1 },
    freeaction: true,
  },
  {
    name: "Temple Wool",
    after: ["Open Temple", "Misc/Hermit Clover"],
    completed: () =>
      itemAmount($item`stone wool`) >= 2 ||
      (itemAmount($item`stone wool`) === 1 && have($item`the Nostril of the Serpent`)) ||
      step("questL11Worship") >= 3,
    prepare: () => {
      if (
        itemAmount($item`11-leaf clover`) > 1 &&
        !have($effect`Lucky!`) &&
        !have($item`industrial fire extinguisher`)
      )
        use($item`11-leaf clover`);
    },
    do: $location`The Hidden Temple`,
    outfit: () => {
      if (have($item`industrial fire extinguisher`) && get("_fireExtinguisherCharge") >= 10)
        return {
          equip: $items`industrial fire extinguisher, deft pirate hook`,
          modifier: "+combat",
        };
      else
        return {
          familiar: $familiar`Grey Goose`,
          equip: $items`deft pirate hook`,
          modifier: "+combat, item",
        };
    },
    combat: new CombatStrategy()
      .macro(
        new Macro()
          .trySkill($skill`Fire Extinguisher: Polar Vortex`)
          .trySkill($skill`Fire Extinguisher: Polar Vortex`),
        $monster`baa-relief sheep`
      )
      .macro(new Macro().trySkill($skill`Emit Matter Duplicating Drones`), $monster`Baa'baa'bu'ran`)
      .killItem([$monster`baa-relief sheep`, $monster`Baa'baa'bu'ran`]),
    choices: { 579: 2, 580: 1, 581: 3, 582: 1 },
    limit: { soft: 20 },
  },
  {
    name: "Temple Nostril",
    after: ["Open Temple", "Temple Wool"],
    completed: () => have($item`the Nostril of the Serpent`) || step("questL11Worship") >= 3,
    do: $location`The Hidden Temple`,
    choices: { 579: 2, 582: 1 },
    effects: $effects`Stone-Faced`,
    limit: { tries: 1 },
  },
  {
    name: "Open City",
    after: ["Temple Nostril", "Macguffin/Diary"],
    acquire: [{ item: $item`stone wool` }],
    completed: () => step("questL11Worship") >= 3,
    do: () => {
      visitUrl("adventure.php?snarfblat=280");
      manualChoice(582, 2);
      manualChoice(580, 2);
      manualChoice(584, 4);
      manualChoice(580, 1);
      manualChoice(123, 2);
      visitUrl("choice.php");
      cliExecute("dvorak");
      manualChoice(125, 3);
    },
    outfit: { avoid: $items`June cleaver` },
    effects: $effects`Stone-Faced`,
    limit: { tries: 1 },
  },
];

const Apartment: Task[] = [
  {
    name: "Open Apartment",
    after: ["Get Machete", "Open City"],
    completed: () => get("hiddenApartmentProgress") >= 1,
    do: $location`An Overgrown Shrine (Northwest)`,
    outfit: {
      equip: $items`antique machete`,
    },
    combat: new CombatStrategy().killHard(),
    choices: { 781: 1 },
    limit: { tries: 4 },
    freecombat: true,
    acquire: [{ item: $item`antique machete` }],
  },
  {
    name: "Apartment Files", // Get the last McClusky files here if needed, as a backup plan
    after: ["Open Apartment", "Office Files", "Banish Janitors"],
    priority: () =>
      have($effect`Once-Cursed`) || have($effect`Twice-Cursed`) || have($effect`Thrice-Cursed`)
        ? Priorities.Effect
        : Priorities.None,
    completed: () =>
      have($item`McClusky file (page 5)`) ||
      have($item`McClusky file (complete)`) ||
      get("hiddenOfficeProgress") >= 7,
    do: $location`The Hidden Apartment Building`,
    combat: new CombatStrategy()
      .killHard($monster`ancient protector spirit (The Hidden Apartment Building)`)
      .kill($monster`pygmy witch accountant`)
      .banish($monster`pygmy janitor`)
      .banish($monster`pygmy witch lawyer`)
      .ignoreNoBanish($monster`pygmy shaman`)
      .ignore(),
    orbtargets: () => {
      if (have($effect`Thrice-Cursed`)) return [$monster`pygmy witch accountant`];
      else return [$monster`pygmy shaman`, $monster`pygmy witch accountant`];
    },
    post: makeCompleteFile,
    outfit: { equip: $items`miniature crystal ball, deft pirate hook` },
    limit: { soft: 9 },
    choices: { 780: 1 },
  },
  {
    name: "Apartment",
    after: ["Open Apartment", "Apartment Files"], // Wait until after all needed pygmy witch lawyers are done
    priority: () =>
      have($effect`Once-Cursed`) || have($effect`Twice-Cursed`) || have($effect`Thrice-Cursed`)
        ? Priorities.MinorEffect
        : Priorities.None,
    completed: () => get("hiddenApartmentProgress") >= 7,
    do: $location`The Hidden Apartment Building`,
    combat: new CombatStrategy()
      .killHard($monster`ancient protector spirit (The Hidden Apartment Building)`)
      .banish($monster`pygmy janitor`)
      .banish($monsters`pygmy witch lawyer, pygmy witch accountant`)
      .ignoreNoBanish($monster`pygmy shaman`)
      .ignore(),
    orbtargets: () => {
      if (have($effect`Thrice-Cursed`)) return [];
      else return [$monster`pygmy shaman`];
    },
    post: makeCompleteFile,
    outfit: () => {
      if (have($effect`Twice-Cursed`) && $location`The Hidden Apartment Building`.turnsSpent === 8)
        return { equip: $items`candy cane sword cane, miniature crystal ball, deft pirate hook` };
      return { equip: $items`miniature crystal ball, deft pirate hook` };
    },
    choices: { 780: 1 },
    limit: { soft: 9 },
  },
  {
    name: "Finish Apartment",
    after: ["Apartment"],
    completed: () => get("hiddenApartmentProgress") >= 8,
    do: $location`An Overgrown Shrine (Northwest)`,
    choices: { 781: 2 },
    limit: { tries: 1 },
    freeaction: true,
  },
];

const Office: Task[] = [
  {
    name: "Open Office",
    after: ["Get Machete", "Open City"],
    completed: () => get("hiddenOfficeProgress") >= 1,
    do: $location`An Overgrown Shrine (Northeast)`,
    combat: new CombatStrategy().killHard(),
    outfit: {
      equip: $items`antique machete`,
    },
    choices: { 785: 1 },
    limit: { tries: 4 },
    freecombat: true,
    acquire: [{ item: $item`antique machete` }],
  },
  {
    name: "Office Files",
    after: ["Open Office", "Banish Janitors"],
    completed: () =>
      (have($item`McClusky file (page 1)`) &&
        have($item`McClusky file (page 2)`) &&
        have($item`McClusky file (page 3)`) &&
        have($item`McClusky file (page 4)`) &&
        have($item`McClusky file (page 5)`)) ||
      have($item`McClusky file (complete)`) ||
      get("hiddenOfficeProgress") >= 7 ||
      $location`The Hidden Office Building`.turnsSpent >= 10,
    do: $location`The Hidden Office Building`,
    post: makeCompleteFile,
    combat: new CombatStrategy()
      .kill($monster`pygmy witch accountant`)
      .banish($monster`pygmy janitor`)
      .banish($monsters`pygmy headhunter, pygmy witch lawyer`),
    choices: { 786: 2 },
    limit: { soft: 10 },
  },
  {
    name: "Office Clip",
    after: ["Office Files", "Apartment Files"],
    completed: () =>
      have($item`boring binder clip`) ||
      have($item`McClusky file (complete)`) ||
      get("hiddenOfficeProgress") >= 7,
    do: $location`The Hidden Office Building`,
    post: makeCompleteFile,
    choices: { 786: 2 },
    combat: new CombatStrategy().ignore(),
    limit: { tries: 6 },
  },
  {
    name: "Office Boss",
    after: ["Office Clip"],
    completed: () => get("hiddenOfficeProgress") >= 7,
    do: $location`The Hidden Office Building`,
    post: makeCompleteFile,
    choices: { 786: 1 },
    combat: new CombatStrategy()
      .killHard($monster`ancient protector spirit (The Hidden Office Building)`)
      .ignore()
      .macro(() => {
        const palindome_dudes_done = have(Item.get(7262)) || step("questL11Palindome") >= 3;
        if (
          get("banishedPhyla").includes("beast") &&
          officeBanishesDone() &&
          palindome_dudes_done
        ) {
          return Macro.trySkill($skill`%fn, Release the Patriotic Screech!`);
        }
        return new Macro();
      }),
    outfit: () => {
      const palindome_dudes_done = have(Item.get(7262)) || step("questL11Palindome") >= 3;
      if (get("banishedPhyla").includes("beast") && officeBanishesDone() && palindome_dudes_done)
        return { familiar: $familiar`Patriotic Eagle` };
      return {};
    },
    orbtargets: () => [],
    limit: { soft: 10 },
  },
  {
    name: "Finish Office",
    after: ["Office Boss"],
    completed: () => get("hiddenOfficeProgress") >= 8,
    do: $location`An Overgrown Shrine (Northeast)`,
    choices: { 785: 2 },
    limit: { tries: 1 },
    freeaction: true,
  },
];

const Hospital: Task[] = [
  {
    name: "Open Hospital",
    after: ["Get Machete", "Open City"],
    completed: () => get("hiddenHospitalProgress") >= 1,
    do: $location`An Overgrown Shrine (Southwest)`,
    combat: new CombatStrategy().killHard(),
    outfit: {
      equip: $items`antique machete`,
    },
    choices: { 783: 1 },
    limit: { tries: 4 },
    freecombat: true,
    acquire: [{ item: $item`antique machete` }],
  },
  {
    name: "Hospital",
    after: ["Open Hospital", "Banish Janitors"],
    completed: () => get("hiddenHospitalProgress") >= 7,
    do: $location`The Hidden Hospital`,
    combat: new CombatStrategy()
      .startingMacro(Macro.trySkill($skill`%fn, let's pledge allegiance to a Zone`))
      .killHard($monster`ancient protector spirit (The Hidden Hospital)`)
      .kill($monster`pygmy witch surgeon`)
      .banish($monster`pygmy janitor`)
      .banish($monsters`pygmy orderlies, pygmy witch nurse`),
    outfit: () => {
      const result = <OutfitSpec>{
        shirt: have($skill`Torso Awareness`) ? $item`surgical apron` : undefined,
        equip: $items`half-size scalpel, head mirror, surgical mask, bloodied surgical dungarees`,
      };
      if (!have($effect`Citizen of a Zone`) && have($familiar`Patriotic Eagle`)) {
        result.familiar = $familiar`Patriotic Eagle`;
      }
      return result;
    },
    choices: { 784: 1 },
    limit: { soft: 20 },
  },
  {
    name: "Finish Hospital",
    after: ["Hospital"],
    completed: () => get("hiddenHospitalProgress") >= 8,
    do: $location`An Overgrown Shrine (Southwest)`,
    choices: { 783: 2 },
    limit: { tries: 1 },
    freeaction: true,
  },
];

const Bowling: Task[] = [
  {
    name: "Open Bowling",
    after: ["Get Machete", "Open City"],
    completed: () => get("hiddenBowlingAlleyProgress") >= 1,
    do: $location`An Overgrown Shrine (Southeast)`,
    combat: new CombatStrategy().killHard(),
    outfit: {
      equip: $items`antique machete`,
    },
    choices: { 787: 1 },
    limit: { tries: 4 },
    freecombat: true,
    acquire: [{ item: $item`antique machete` }],
  },
  {
    name: "Bowling",
    after: ["Open Bowling", "Banish Janitors"],
    priority: () =>
      get("camelSpit") === 100 && cosmicBowlingBallReady() && have($skill`Map the Monsters`)
        ? Priorities.BestCosmicBowlingBall
        : Priorities.None,
    ready: () =>
      myMeat() >= 500 &&
      (!bowlingBallsGathered() || get("spookyVHSTapeMonster") !== $monster`pygmy bowler`),
    acquire: [{ item: $item`Bowl of Scorpions`, optional: true }],
    completed: () => get("hiddenBowlingAlleyProgress") >= 7,
    prepare: () => {
      // Open the hidden tavern if it is available.
      if (get("hiddenTavernUnlock") < myAscensions() && have($item`book of matches`)) {
        use($item`book of matches`);
        buy($item`Bowl of Scorpions`);
      }
      // Backload the bowling balls due to banish timers
      if (!bowlingBallsGathered()) {
        if (have($item`bowling ball`))
          putCloset($item`bowling ball`, itemAmount($item`bowling ball`));
      } else {
        if (closetAmount($item`bowling ball`) > 0)
          takeCloset($item`bowling ball`, closetAmount($item`bowling ball`));
      }
      if (myFamiliar() === $familiar`Melodramedary` && get("camelSpit") === 100) fillHp();
    },
    do: $location`The Hidden Bowling Alley`,
    combat: new CombatStrategy()
      .killHard($monster`ancient protector spirit (The Hidden Bowling Alley)`)
      .killItem($monster`pygmy bowler`)
      .macro(() => {
        if (myFamiliar() === $familiar`Melodramedary` && get("camelSpit") === 100)
          return Macro.trySkill($skill`%fn, spit on them!`).tryItem($item`cosmic bowling ball`);
        return Macro.externalIf(
          get("spookyVHSTapeMonster") === $monster`none`,
          Macro.tryItem($item`Spooky VHS Tape`)
        ).trySkill($skill`Emit Matter Duplicating Drones`);
      }, $monster`pygmy bowler`)
      .banish($monster`pygmy janitor`)
      .banish($monster`pygmy orderlies`),
    outfit: () => {
      const result: OutfitSpec = {
        equip: $items`nurse's hat, deft pirate hook`,
        modifier: "item",
        avoid: $items`broken champagne bottle`,
      };
      if (have($familiar`Melodramedary`) && get("camelSpit") === 100) {
        result.familiar = $familiar`Melodramedary`;
      } else if (have($familiar`Grey Goose`) && familiarWeight($familiar`Grey Goose`) >= 6) {
        result.familiar = $familiar`Grey Goose`;
      }

      if (bowlingBallsGathered() && !get("candyCaneSwordBowlingAlley", false)) {
        result.equip?.push($item`candy cane sword cane`);
      }
      return result;
    },
    ignore_banishes: () => bowlingBallsGathered(),
    map_the_monster: () => {
      if (
        itemAmount($item`bowling ball`) === 0 &&
        have($familiar`Melodramedary`) &&
        get("camelSpit") === 100 &&
        cosmicBowlingBallReady()
      )
        return $monster`pygmy bowler`;
      return $monster`none`;
    },
    choices: { 788: 1 },
    parachute: () => {
      if (
        have($skill`Map the Monsters`) &&
        get("_monstersMapped") < 3 &&
        have($familiar`Melodramedary`)
      ) {
        return undefined;
      }
      return $monster`pygmy bowler`;
    },
    limit: { soft: 25 },
  },
  {
    name: "Finish Bowling",
    after: ["Bowling"],
    completed: () => get("hiddenBowlingAlleyProgress") >= 8,
    do: $location`An Overgrown Shrine (Southeast)`,
    choices: { 787: 2 },
    limit: { tries: 1 },
    freeaction: true,
  },
];

function bowlingBallsGathered(): boolean {
  let balls = 0;
  balls += itemAmount($item`bowling ball`);
  balls += closetAmount($item`bowling ball`);
  if (get("spookyVHSTapeMonster") === $monster`pygmy bowler`) balls += 1;
  if (have($item`candy cane sword cane`) && !get("candyCaneSwordBowlingAlley", false)) balls += 1;

  const timesBowled = get("hiddenBowlingAlleyProgress") - 1;
  return timesBowled + balls >= 5;
}

export const HiddenQuest: Quest = {
  name: "Hidden City",
  tasks: [
    ...Temple,
    {
      name: "Get Machete",
      after: ["Open City"],
      completed: () => have($item`antique machete`),
      do: $location`The Hidden Park`,
      outfit: { modifier: "-combat" },
      choices: { 789: 2 },
      limit: { soft: 10 },
    },
    ...Office,
    ...Apartment,
    ...Hospital,
    ...Bowling,
    {
      name: "Banish Janitors",
      after: ["Open City"],
      completed: () =>
        get("relocatePygmyJanitor") === myAscensions() || have($skill`Emotionally Chipped`),
      do: $location`The Hidden Park`,
      outfit: { modifier: "-combat" },
      choices: { 789: 2 },
      limit: { soft: 15 },
    },
    {
      name: "Boss",
      after: ["Finish Office", "Finish Apartment", "Finish Hospital", "Finish Bowling"],
      completed: () => step("questL11Worship") === 999,
      do: $location`A Massive Ziggurat`,
      outfit: {
        equip: $items`antique machete`,
      },
      choices: { 791: 1 },
      combat: new CombatStrategy()
        .killHard($monster`dense liana`)
        .killHard($monster`Protector Spectre`),
      limit: { tries: 4 },
      acquire: [{ item: $item`antique machete` }],
      boss: true,
    },
  ],
};

function makeCompleteFile(): void {
  if (
    have($item`McClusky file (page 1)`) &&
    have($item`McClusky file (page 2)`) &&
    have($item`McClusky file (page 3)`) &&
    have($item`McClusky file (page 4)`) &&
    have($item`McClusky file (page 5)`) &&
    have($item`boring binder clip`)
  ) {
    cliExecute("make McClusky file (complete)");
  }
}

function officeBanishesDone(): boolean {
  if (get("hiddenHospitalProgress") < 7) return false;
  if (get("hiddenApartmentProgress") < 7) return false;
  if (get("hiddenBowlingAlleyProgress") < 7) return false;
  return (
    (have($item`McClusky file (page 1)`) &&
      have($item`McClusky file (page 2)`) &&
      have($item`McClusky file (page 3)`) &&
      have($item`McClusky file (page 4)`) &&
      have($item`McClusky file (page 5)`)) ||
    have($item`McClusky file (complete)`) ||
    get("hiddenOfficeProgress") >= 7
  );
}
