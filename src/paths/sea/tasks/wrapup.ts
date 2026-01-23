import { $familiar, $item, $items, $location, $monsters, $skill, get, have, Macro } from "libram";

import { Location, runChoice, visitUrl } from "kolmafia";
import { Quest } from "../../../engine/task";
import { CombatStrategy } from "../../../engine/combat";

function getFishLocation(): Location | undefined {
  if (!get("_unblemishedPearlTheBriniestDeepests")) {
    return $location`The Briniest Deepests`;
  } else if (!get("_unblemishedPearlMadnessReef")) {
    return $location`Madness Reef`;
  }
  return undefined;
}

function fishLocationAvailable(): boolean {
  return getFishLocation() !== undefined;
}

function getNextPearlZone(): Location | undefined {
  if (!get("_unblemishedPearlAnemoneMine")) {
    return $location`Anemone Mine`;
  } else if (!get("_unblemishedPearlTheBriniestDeepests")) {
    return $location`The Briniest Deepests`;
  } else if (!get("_unblemishedPearlMadnessReef")) {
    return $location`Madness Reef`;
  } else if (!get("_unblemishedPearlDiveBar")) {
    return $location`The Dive Bar`;
  }
  return undefined;
}

function pearlZoneAvailable(): boolean {
  return getNextPearlZone() !== undefined;
}

function getNextPearlTurns(): number {
  if (!get("_unblemishedPearlAnemoneMine")) {
    return Math.ceil((100 - get("_unblemishedPearlAnemoneMineProgress") - 0.0001) / 10.0);
  } else if (!get("_unblemishedPearlTheBriniestDeepests")) {
    return Math.ceil((100 - get("_unblemishedPearlTheBriniestDeepestsProgress") - 0.0001) / 10.0);
  } else if (!get("_unblemishedPearlMadnessReef")) {
    return Math.ceil((100 - get("_unblemishedPearlMadnessReefProgress") - 0.0001) / 10.0);
  } else if (!get("_unblemishedPearlDiveBar")) {
    return Math.ceil((100 - get("_unblemishedPearlDiveBarProgress") - 0.0001) / 10.0);
  }
  return 0;
}

export const WrapupQuest: Quest = {
  name: "Wrapup",
  tasks: [
    {
      name: "Fish Banish",
      completed: () =>
        !have($familiar`Patriotic Eagle`) || get("screechCombats") != 0 || !fishLocationAvailable(),
      do: () => getFishLocation()!,
      combat: new CombatStrategy().macro((): Macro => {
        return Macro.if_(
          "!monstername time cop",
          Macro.trySkill($skill`%fn, Release the Patriotic Screech!`)
        );
      }),
      outfit: {
        familiar: $familiar`Patriotic Eagle`,
        equip: $items`Monodent of the Sea, Everfull Dart Holster, cursed monkey's paw, Möbius ring, shark jumper, bat wings`,
      },
      limit: { soft: 11 },
      preferwanderer: true
    },
    {
      name: "Tricking",
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
      preferwanderer: true
    },
    {
      name: "Do Habs",
      after: ["Tricking"],
      completed: () => !pearlZoneAvailable() || get("_monsterHabitatsFightsLeft") == 0,
      do: () => getNextPearlZone()!,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.externalIf(
            getNextPearlTurns() > 2,
            Macro.trySkill($skill`Blow the Purple Candle`).trySkill($skill`Create an Afterimage`)
          ).trySkill($skill`Recall Facts: Monster Habitats`);
        }, $monsters`kid who is too old to be Trick-or-Treating, suburban security civilian, vandal kid`)
        .killHard(
          $monsters`kid who is too old to be Trick-or-Treating, suburban security civilian, vandal kid`
        )
        .macro((): Macro => {
          return Macro.trySkill($skill`Punch Out your Foe`)
            .tryItem($item`stuffed yam stinkbomb`)
            .tryItem($item`handful of split pea soup`)
            .trySkill($skill`Sea *dent: Throw a Lightning Bolt`);
        }, $monsters`Mer-kin miner, Killer clownfish, Mer-kin tippler`),
      outfit: {
        modifier: "-combat",
        equip: $items`Monodent of the Sea, Everfull Dart Holster, Roman Candelabra, cursed monkey's paw, Möbius ring, shark jumper, bat wings`,
        familiar: $familiar`Peace Turkey`,
      },
      limit: { soft: 11 },
      preferwanderer: true
    },
    {
      name: "Get Pearls",
      after: ["Do Habs", "Tricking", "Scholar/Abyss Mom"],
      completed: () => !pearlZoneAvailable(),
      do: () => getNextPearlZone()!,
      combat: new CombatStrategy().macro((): Macro => {
        return Macro.skill($skill`Saucegeyser`);
      }, $monsters`magic dragonfish`),
      outfit: {
        modifier: "-combat",
        equip: $items`Monodent of the Sea, Everfull Dart Holster, Roman Candelabra, cursed monkey's paw, Möbius ring, shark jumper, bat wings`,
        familiar: $familiar`Peace Turkey`,
      },
      limit: { soft: 11 },
      preferwanderer: true
    },
  ],
};
