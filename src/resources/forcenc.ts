import { useSkill } from "kolmafia";
import { $item, $items, $skill, AprilingBandHelmet, CinchoDeMayo, get, have, Macro } from "libram";
import { args } from "../args";
import { CombatResource } from "./lib";

export type ForceNCSorce = CombatResource & { do: Macro };
export const forceNCSources: ForceNCSorce[] = [
  {
    name: "Parka",
    available: () =>
      have($skill`Torso Awareness`) &&
      have($item`Jurassic Parka`) &&
      get("_spikolodonSpikeUses") + args.minor.saveparka < 5,
    equip: { equip: $items`Jurassic Parka`, modes: { parka: "spikolodon" } },
    do: Macro.skill($skill`Launch spikolodon spikes`),
  },
  {
    name: "McHugeLarge",
    available: () => have($item`McHugeLarge left ski`) && get("_mcHugeLargeAvalancheUses", 0) < 3,
    equip: [
      { equip: $items`McHugeLarge left ski, designer sweatpants` },
      { equip: $items`McHugeLarge left ski` },
    ],
    do: Macro.trySkill($skill`Summon Love Gnats`)
      .externalIf(!get("lovebugsUnlocked"), Macro.trySkill($skill`Sweat Flood`))
      .skill($skill`McHugeLarge Avalanche`),
  },
];

export function forceNCPossible(): boolean {
  return forceNCSources.find((s) => s.available()) !== undefined;
}

type ForceNCSource = {
  available: () => boolean;
  do: () => void;
};

const tuba = $item`Apriling band tuba`;

export const noncombatForceNCSources: ForceNCSource[] = [
  {
    available: () => (AprilingBandHelmet.canJoinSection() || have(tuba)) && tuba.dailyusesleft > 0,
    do: () => AprilingBandHelmet.play(tuba, true),
  },
  {
    available: () => CinchoDeMayo.currentCinch() >= 60,
    do: () => useSkill($skill`Cincho: Fiesta Exit`),
  },
];

export function tryForceNC(): boolean {
  if (get("noncombatForcerActive")) return true;
  noncombatForceNCSources.find((source) => source.available())?.do();
  return get("noncombatForcerActive");
}
