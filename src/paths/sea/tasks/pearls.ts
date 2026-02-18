import {
  $familiar,
  $item,
  $items,
  $location,
  $monsters,
  $skill,
  $stat,
  BooleanProperty,
  get,
  have,
  Macro,
  NumericProperty,
} from "libram";

import { Item, Location, Monster, myPrimestat, runChoice, visitUrl } from "kolmafia";
import { Quest, Task } from "../../../engine/task";
import { CombatStrategy } from "../../../engine/combat";
import { OutfitSpec, step } from "grimoire-kolmafia";

const POSSIBLE_HABS = $monsters`kid who is too old to be Trick-or-Treating, suburban security civilian, vandal kid, sausage goblin, Black Crayon Fish`;

type PearlSpec = {
  loc: Location;
  after: string[];
  modifier: string;
  obtained: BooleanProperty;
  progress: NumericProperty;
  avoid?: Item[];
  fish?: Monster[];
  preferwanderer?: () => boolean;
};

const PEARLS: PearlSpec[] = [
  {
    loc: $location`Anemone Mine`,
    after: ["Sea Monkee/Open Grandpa Zone"],
    modifier: "spooky res",
    obtained: "_unblemishedPearlAnemoneMine",
    progress: "_unblemishedPearlAnemoneMineProgress",
    avoid: $items`Mer-kin digpick`,
    preferwanderer: () => myPrimestat() !== $stat`Muscle` || step("questS02Monkees") >= 5,
  },
  {
    loc: $location`The Dive Bar`,
    after: ["Sea Monkee/Open Grandpa Zone"],
    modifier: "sleaze res",
    obtained: "_unblemishedPearlDiveBar",
    progress: "_unblemishedPearlDiveBarProgress",
    preferwanderer: () => myPrimestat() !== $stat`Moxie` || step("questS02Monkees") >= 5,
  },
  {
    loc: $location`The Marinara Trench`,
    after: ["Sea Monkee/Open Grandpa Zone"],
    modifier: "hot res",
    obtained: "_unblemishedPearlMarinaraTrench",
    progress: "_unblemishedPearlMarinaraTrenchProgress",
    preferwanderer: () => myPrimestat() !== $stat`Mysticality` || step("questS02Monkees") >= 5,
  },
  {
    loc: $location`Madness Reef`,
    after: ["Sea Monkee/Open Grandpa Zone"],
    modifier: "stench res",
    obtained: "_unblemishedPearlMadnessReef",
    progress: "_unblemishedPearlMadnessReefProgress",
    fish: $monsters`jamfish, magic dragonfish, pufferfish`,
  },
  {
    loc: $location`The Briniest Deepests`,
    after: [],
    modifier: "cold res",
    obtained: "_unblemishedPearlTheBriniestDeepests",
    progress: "_unblemishedPearlTheBriniestDeepestsProgress",
    fish: $monsters`acoustic electric eel, decent white shark, ganger`,
  },
];

export const PearlsQuest: Quest = {
  name: "Pearls",
  tasks: [
    {
      name: "Tricking",
      ready: () => have($item`Mer-kin gladiator mask`) && have($item`Mer-kin gladiator tailpiece`),
      completed: () => get("_trickOrTreatBlock").split("D").length < 6,
      do: () => {
        visitUrl(`place.php?whichplace=town&action=town_trickortreat`);
        const houseNumber = get("_trickOrTreatBlock").indexOf("D");
        if (houseNumber < 0) return;
        runChoice(3, `whichhouse=${houseNumber.toFixed(0)}`);
      },
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.step("pickpocket").skill($skill`Recall Facts: Monster Habitats`);
        })
        .killHard(),
      outfit: {
        familiar: $familiar`Peace Turkey`,
        equip: $items`Everfull Dart Holster, spring shoes, Mer-kin gladiator mask, Mer-kin gladiator tailpiece`,
      },
      freeaction: true,
      limit: { soft: 11 },
      preferwanderer: true,
    },
    ...PEARLS.map(
      (p: PearlSpec) =>
        <Task>{
          name: `${p.loc}`,
          after: p.after,
          completed: () => get(p.obtained),
          do: p.loc,
          combat: new CombatStrategy()
            .macro(() => {
              if (get("_monsterHabitatsFightsLeft") > 0 && get("screechCombats") !== 0 && p.fish) {
                return Macro.trySkill($skill`%fn, Release the Patriotic Screech!`);
              }
              return new Macro();
            }, p.fish)
            .macro((): Macro => {
              const nextPearlTurns = Math.ceil((100 - get(p.progress) - 0.0001) / 10.0);
              return Macro.externalIf(
                nextPearlTurns > 2,
                Macro.trySkill($skill`Blow the Purple Candle!`).trySkill(
                  $skill`Create an Afterimage`
                )
              ).trySkill($skill`Recall Facts: Monster Habitats`);
            }, POSSIBLE_HABS)
            .killHard(POSSIBLE_HABS)
            .kill(),
          outfit: () => {
            const result: OutfitSpec = {
              modifier: p.modifier,
              avoid: p.avoid,
            };
            if (get("_monsterHabitatsFightsLeft") > 0 && get("screechCombats") !== 0 && p.fish) {
              result.familiar = $familiar`Patriotic Eagle`;
            }
            return result;
          },
          preferwanderer: p.preferwanderer,
          delay: 10,
          limit: { soft: 20 },
        }
    ),
  ],
};
