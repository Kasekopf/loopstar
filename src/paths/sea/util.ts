import { OutfitSpec } from "grimoire-kolmafia";
import {
  buyUsingStorage,
  cliExecute,
  Item,
  abort,
  storageAmount,
  Skill,
  getWorkshed,
  use,
  mySpleenUse,
  spleenLimit,
  myPrimestat,
  Location,
  Monster,
} from "kolmafia";
import { $effect, $item, $location, $monster, $stat, AsdonMartin, get, have } from "libram";

export function pull(item: Item) {
  if (storageAmount(item) === 0) {
    if (buyUsingStorage(item, 1, 15000) === 0) {
      abort(`Unable to buy desired pull item ${item.name}`);
    }
  }
  cliExecute(`pull ${item.name}`);
}

export type WaterBreathSource = {
  name: Item | Skill;
  available?: () => boolean;
  outfit?: OutfitSpec | (() => OutfitSpec);
  do?: () => void;
};

export function getWaterBreathSources(): WaterBreathSource[] {
  return [
    {
      name: $item`Asdon Martin keyfob (on ring)`,
      available: () =>
        have($item`Asdon Martin keyfob (on ring)`) ||
        getWorkshed() === $item`Asdon Martin keyfob (on ring)`,
      do: () => {
        AsdonMartin.drive($effect`Driving Waterproofly`);
      },
    },
  ];
}

export type FishySource = {
  name: Item;
  available?: () => boolean;
  do?: () => void;
};

export function fishySource(source: FishySource): Required<FishySource> {
  return {
    available: () => have(source.name),
    do: () => use(source.name),
    ...source,
  };
}

export function fishySources(): Required<FishySource>[] {
  return [
    fishySource({
      name: $item`cuppa gill tea`,
    }),
    fishySource({
      name: $item`fish juice box`,
    }),
    fishySource({
      name: $item`fishy pipe`,
      available: () => have($item`fishy pipe`) && !get("_fishyPipeUsed"),
    }),
    fishySource({
      name: $item`fish sauce`,
      available: () => have($item`fish sauce`) && mySpleenUse() < spleenLimit(),
    }),
  ];
}

export function doFirstAvailableFishySource(): boolean {
  for (const source of fishySources()) {
    if (source.available()) {
      source.do();
      return true;
    }
  }
  return false;
}

export function doFirstAvailableWaterBreathSource(): boolean {
  for (const source of getWaterBreathSources()) {
    if (source.available?.() ?? true) {
      source.do?.();
      return true;
    }
  }
  return false;
}

export function grandpaZone(): Location {
  switch (myPrimestat()) {
    case $stat`Muscle`:
      return $location`Anemone Mine`;
    case $stat`Moxie`:
      return $location`The Marinara Trench`;
    case $stat`Mysticality`:
      return $location`The Dive Bar`;
    default:
      return $location.none;
  }
}

export function bestCopyTarget(): Monster {
  if (get("neverendingPartyAlways")) return $monster`Sausage Goblin`;
  return $monster`black crayon fish`
}
