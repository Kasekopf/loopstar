import { Outfit, OutfitSpec } from "grimoire-kolmafia";
import {
  abort,
  buyUsingStorage,
  cliExecute,
  getWorkshed,
  Item,
  Location,
  Monster,
  myPrimestat,
  mySpleenUse,
  Skill,
  spleenLimit,
  storageAmount,
  toInt,
  use,
} from "kolmafia";
import { $effect, $item, $items, $location, $monster, $stat, AsdonMartin, get, have } from "libram";

export function pull(item: Item) {
  if (get("_roninStoragePulls").split(",").includes(toInt(item).toString())) return;
  if (storageAmount(item) === 0) {
    if (!item.tradeable) return;
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
    {
      name: $item`Mer-kin gladiator mask`,
      available: () => have($item`Mer-kin gladiator mask`),
      outfit: { equip: $items`Mer-kin gladiator mask` },
    },
    {
      name: $item`Mer-kin scholar mask`,
      available: () => have($item`Mer-kin scholar mask`),
      outfit: { equip: $items`Mer-kin scholar mask` },
    },
    {
      name: $item`crappy Mer-kin mask`,
      available: () => have($item`crappy Mer-kin mask`),
      outfit: { equip: $items`crappy Mer-kin mask` },
    },
    {
      name: $item`old SCUBA tank`,
      available: () => have($item`old SCUBA tank`),
      outfit: { equip: $items`old SCUBA tank` },
    },
  ];
}

export type FamiliarBreathSource = {
  name: Item | Skill;
  available?: () => boolean;
  outfit?: OutfitSpec | (() => OutfitSpec);
  do?: () => void;
};

export function getFamiliarWaterBreathSources(): WaterBreathSource[] {
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
    {
      name: $item`das boot`,
      available: () => have($item`das boot`),
      outfit: { equip: $items`das boot` },
    },
    {
      name: $item`little bitty bathysphere`,
      available: () => have($item`little bitty bathysphere`),
      outfit: { equip: $items`little bitty bathysphere` },
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
      name: $item`cuppa Gill tea`,
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

export function applyFirstAvailableWaterBreathSource(outfit: Outfit): boolean {
  return applyBreathSources(outfit, getWaterBreathSources());
}

export function applyFirstAvailableFamiliarWaterBreathSource(outfit: Outfit): boolean {
  return applyBreathSources(outfit, getFamiliarWaterBreathSources());
}

function applyBreathSources(
  outfit: Outfit,
  sources: {
    available?: () => boolean;
    outfit?: OutfitSpec | (() => OutfitSpec);
    do?: () => void;
  }[]
): boolean {
  let fallback: typeof sources[number] | null = null;

  for (const source of sources) {
    if (!(source.available?.() ?? true)) continue;

    const spec =
      typeof source.outfit === "function" ? source.outfit?.() : source.outfit;


    if (spec && outfitAlreadySatisfies(outfit, spec)) {
      return true;
    }

    if (!fallback) fallback = source;
  }

  if (!fallback) return false;

  const spec =
    typeof fallback.outfit === "function" ? fallback.outfit() : fallback.outfit;

  if (spec?.equip && !outfit.equip(spec.equip)) return false;

  fallback.do?.();
  return true;
}

function outfitAlreadySatisfies(outfit: Outfit, spec: OutfitSpec): boolean {
  if (!spec.equip) return false;

  const items = Array.isArray(spec.equip) ? spec.equip : [spec.equip];
  return items.every(item => outfit.haveEquipped(item));
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
  if (get("neverendingPartyAlways")) return $monster`sausage goblin`;
  return $monster`Black Crayon Fish`;
}
