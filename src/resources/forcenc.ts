import {
  cliExecute,
  equip,
  equippedItem,
  floor,
  haveEquipped,
  max,
  myPath,
  mySpleenUse,
  use,
  useSkill,
} from "kolmafia";
import {
  $item,
  $items,
  $path,
  $skill,
  $slot,
  AprilingBandHelmet,
  CinchoDeMayo,
  get,
  have,
  Macro,
} from "libram";
import { args } from "../args";
import { CombatResource } from "./lib";

type CombatForceNCSource = CombatResource & { do: Macro; remaining: () => number };
export const forceNCSources: CombatForceNCSource[] = [
  {
    name: "Parka",
    available: () =>
      have($skill`Torso Awareness`) &&
      have($item`Jurassic Parka`) &&
      get("_spikolodonSpikeUses") + args.resources.saveparka < 5,
    equip: { equip: $items`Jurassic Parka`, modes: { parka: "spikolodon" } },
    do: Macro.skill($skill`Launch spikolodon spikes`),
    remaining: () => {
      if (!have($skill`Torso Awareness`)) return 0;
      if (!have($item`Jurassic Parka`)) return 0;
      return max(0, 5 - get("_spikolodonSpikeUses") - args.resources.saveparka);
    },
  },
  {
    name: "McHugeLarge",
    available: () => have($item`McHugeLarge left ski`) && get("_mcHugeLargeAvalancheUses") < 3,
    equip: [
      { equip: $items`McHugeLarge left ski, designer sweatpants` },
      { equip: $items`McHugeLarge left ski` },
    ],
    do: Macro.trySkill($skill`Summon Love Gnats`)
      .externalIf(!get("lovebugsUnlocked"), Macro.trySkill($skill`Sweat Flood`))
      .skill($skill`McHugeLarge Avalanche`),
    remaining: () => {
      if (!have($item`McHugeLarge left ski`)) return 0;
      return get("_mcHugeLargeAvalancheUses");
    },
  },
];

export function forceNCPossible(): boolean {
  return forceNCSources.find((s) => s.available()) !== undefined;
}

type NoncombatForceNCSource = {
  name: string;
  available: () => boolean;
  prepare: () => void;
  remaining: () => number;
};

const tuba = $item`Apriling band tuba`;

export const noncombatForceNCSources: NoncombatForceNCSource[] = [
  {
    name: "Apriling band tuba",
    available: () => have(tuba) && tuba.dailyusesleft > 0,
    prepare: () => AprilingBandHelmet.play(tuba, true),
    remaining: () => {
      if (!AprilingBandHelmet.canJoinSection() && !have(tuba)) return 0;
      return tuba.dailyusesleft;
    },
  },
  {
    name: "Cincho",
    available: () => CinchoDeMayo.currentCinch() >= 60,
    prepare: () => {
      if (haveEquipped($item`Cincho de Mayo`)) {
        useSkill($skill`Cincho: Fiesta Exit`);
      } else {
        // Using fiesta exit directly sometimes errors:
        //   "Cannot acquire: replica Cincho de Mayo"
        const prev = equippedItem($slot`acc1`);
        equip($item`Cincho de Mayo`, $slot`acc1`);
        useSkill($skill`Cincho: Fiesta Exit`);
        equip(prev, $slot`acc1`);
      }
    },
    remaining: () => {
      if (!CinchoDeMayo.have()) return 0;
      return floor(CinchoDeMayo.totalAvailableCinch() / 60);
    },
  },
  {
    name: "Clara",
    available: () => have($item`Clara's bell`) && !get("_claraBellUsed"),
    prepare: () => use($item`Clara's bell`),
    remaining: () => {
      if (!have($item`Clara's bell`) || !get("_claraBellUsed")) return 0;
      return 1;
    },
  },
  {
    name: "Pillkeeper",
    available: () =>
      have($item`Eight Days a Week Pill Keeper`) &&
      !get("_freePillKeeperUsed") &&
      !!args.resources.speed,
    prepare: () => cliExecute("pillkeeper sneak"),
    remaining: () => (get("_freePillKeeperUsed") ? 0 : 1),
  },
  // Hack until a proper spleen manager is used
  {
    name: "Pillkeeper Boris",
    available: () =>
      myPath() === $path`Avatar of Boris` &&
      have($item`Eight Days a Week Pill Keeper`) &&
      mySpleenUse() < 4 &&
      !!args.resources.speed,
    prepare: () => cliExecute("pillkeeper sneak"),
    remaining: () => (mySpleenUse() < 4 ? 1 : 0),
  },
];
