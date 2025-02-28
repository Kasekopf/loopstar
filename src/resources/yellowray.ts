import { myMeat, retrieveItem } from "kolmafia";
import { $effect, $item, $items, $skill, get, have, Macro, set } from "libram";
import { CombatResource } from "./lib";
import { killMacro } from "../engine/combat";

export type YellowRaySource = CombatResource;
export const yellowRaySources: YellowRaySource[] = [
  {
    name: "Jurassic Parka",
    available: () => have($skill`Torso Awareness`) && have($item`Jurassic Parka`),
    equip: {
      equip: $items`Jurassic Parka`,
      modes: { parka: "dilophosaur" },
      avoid: $items`bat wings`,
    },
    do: $skill`Spit jurassic acid`,
  },
  {
    name: "Yellow Rocket",
    available: () => myMeat() >= 250 && have($item`Clan VIP Lounge key`),
    prepare: () => retrieveItem($item`yellow rocket`),
    do: $item`yellow rocket`,
  },
  {
    name: "Retro Superhero Cape",
    available: () => have($item`unwrapped knock-off retro superhero cape`),
    equip: {
      equip: $items`unwrapped knock-off retro superhero cape`,
      modes: { retrocape: ["heck", "kiss"] },
    },
    do: $skill`Unleash the Devil's Kiss`,
  },
];

export function yellowRayPossible(): boolean {
  if (have($effect`Everything Looks Yellow`)) return false;
  return yellowRaySources.find((s) => s.available()) !== undefined;
}

export type ForceItemSource = CombatResource;
export const forceItemSources: ForceItemSource[] = [
  {
    name: "Saber",
    available: () => have($item`Fourth of May Cosplay Saber`) && get("_saberForceUses") < 5,
    prepare: () => set("choiceAdventure1387", 3),
    equip: $item`Fourth of May Cosplay Saber`,
    do: $skill`Use the Force`,
  },
  {
    name: "Envy",
    available: () => have($skill`Emotionally Chipped`) && get("_feelEnvyUsed") < 3,
    do: Macro.skill($skill`Feel Envy`).step(killMacro()),
  },
];

export function forceItemPossible(): boolean {
  return yellowRayPossible() || forceItemSources.find((s) => s.available()) !== undefined;
}
