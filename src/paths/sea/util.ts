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
  spleenLimit,
  storageAmount,
  toInt,
  use,
} from "kolmafia";
import {
  $effect,
  $effects,
  $item,
  $items,
  $location,
  $monster,
  $stat,
  AsdonMartin,
  get,
  have,
} from "libram";
import { Resource } from "../../resources/lib";

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

export const waterBreathSources: Resource[] = [
  {
    name: "Existing Effect",
    available: () => {
      const effects = $effects`Driving Waterproofly, Really Deep Breath, Pumped Stomach, Oxygenated Blood, Pneumatic`;
      for (const ef of effects) {
        if (have(ef)) return true;
      }
      return false;
    },
    prepare: () => {
      // nothing more needed
    },
  },
  {
    name: "Asdon Martin",
    available: () => getWorkshed() === $item`Asdon Martin keyfob (on ring)`,
    prepare: () => {
      AsdonMartin.drive($effect`Driving Waterproofly`);
    },
  },
  {
    name: "Mer-kin gladiator mask",
    available: () => have($item`Mer-kin gladiator mask`),
    equip: $item`Mer-kin gladiator mask`,
  },
  {
    name: "Mer-kin scholar mask",
    available: () => have($item`Mer-kin scholar mask`),
    equip: $item`Mer-kin scholar mask`,
  },
  {
    name: "crappy Mer-kin mask",
    available: () => have($item`crappy Mer-kin mask`),
    equip: $item`crappy Mer-kin mask`,
  },
  {
    name: "aerated diving helmet",
    available: () => have($item`aerated diving helmet`),
    equip: $item`aerated diving helmet`,
  },
  {
    name: "The Crown of Ed the Undying",
    available: () => have($item`The Crown of Ed the Undying`),
    equip: $item`The Crown of Ed the Undying`,
  },
  {
    name: "really, really nice swimming trunks",
    available: () => have($item`really, really nice swimming trunks`),
    equip: $item`really, really nice swimming trunks`,
  },
  {
    name: "fish juice box",
    available: () => have($item`fish juice box`),
    prepare: () => use($item`fish juice box`),
  },
  {
    name: "hyperinflated seal lung",
    available: () => have($item`hyperinflated seal lung`),
    prepare: () => use($item`hyperinflated seal lung`),
  },
  {
    name: "old SCUBA tank",
    available: () => have($item`old SCUBA tank`),
    equip: $item`old SCUBA tank`,
  },
];

export const familiarWaterBreathEquips = $items`das boot, little bitty bathysphere`;

export const familiarWaterBreathSources: Resource[] = [
  {
    name: "Existing Effect",
    available: () => have($effect`Driving Waterproofly`),
    prepare: () => {
      // nothing more needed
    },
  },
  {
    name: "Asdon Martin",
    available: () => getWorkshed() === $item`Asdon Martin keyfob (on ring)`,
    prepare: () => {
      AsdonMartin.drive($effect`Driving Waterproofly`);
    },
  },
  ...familiarWaterBreathEquips.map(
    (e) =>
      <Resource>{
        name: e.name,
        available: () => have(e),
        equip: e,
      }
  ),
];

export const fishySources: Resource[] = [
  {
    name: "Existing Effect",
    available: () => have($effect`Fishy`),
    prepare: () => {
      // nothing more needed
    },
  },
  {
    name: "fishy pipe",
    available: () => have($item`fishy pipe`) && !get("_fishyPipeUsed"),
    prepare: () => use($item`fishy pipe`),
  },
  {
    name: "cuppa Gill tea",
    available: () => have($item`cuppa Gill tea`),
    prepare: () => use($item`cuppa Gill tea`),
  },
  {
    name: "fish juice box",
    available: () => have($item`fish juice box`),
    prepare: () => use($item`fish juice box`),
  },
  {
    name: "fish sauce",
    available: () => have($item`fish sauce`) && mySpleenUse() < spleenLimit(),
    prepare: () => use($item`fish sauce`),
  },
];

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
