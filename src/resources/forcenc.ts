import { floor, max, useSkill } from "kolmafia";
import { $item, $items, $skill, AprilingBandHelmet, CinchoDeMayo, get, have, Macro } from "libram";
import { args } from "../args";
import { CombatResource } from "./lib";

export type ForceNCSorce = CombatResource & { do: Macro; remaining: () => number };
export const forceNCSources: ForceNCSorce[] = [
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

type ForceNCSource = {
  name: string;
  available: () => boolean;
  prepare: () => void;
  remaining: () => number;
};

const tuba = $item`Apriling band tuba`;

export const noncombatForceNCSources: ForceNCSource[] = [
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
    prepare: () => useSkill($skill`Cincho: Fiesta Exit`),
    remaining: () => {
      if (!CinchoDeMayo.have()) return 0;
      return floor(CinchoDeMayo.totalAvailableCinch() / 60);
    },
  },
];
