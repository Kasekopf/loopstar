import { Item, myPath, Skill } from "kolmafia";
import { $effect, $item, $items, $path, $skill, AsdonMartin, get, have } from "libram";
import { asdonFualable } from "../lib";
import { CombatResource } from "./lib";

interface FreekillSource extends CombatResource {
  do: Item | Skill;
}

export const freekillSources: FreekillSource[] = [
  {
    name: "Lil' Doctor™ bag",
    available: () => have($item`Lil' Doctor™ bag`) && get("_chestXRayUsed") < 3,
    do: $skill`Chest X-Ray`,
    equip: $item`Lil' Doctor™ bag`,
  },
  {
    name: "Gingerbread Mob Hit",
    available: () => have($skill`Gingerbread Mob Hit`) && !get("_gingerbreadMobHitUsed"),
    do: $skill`Gingerbread Mob Hit`,
  },
  {
    name: "Shattering Punch",
    available: () => have($skill`Shattering Punch`) && get("_shatteringPunchUsed") < 3,
    do: $skill`Shattering Punch`,
  },
  {
    name: "Replica bat-oomerang",
    available: () => have($item`replica bat-oomerang`) && get("_usedReplicaBatoomerang") < 3,
    do: $item`replica bat-oomerang`,
  },
  {
    name: "The Jokester's gun",
    available: () => have($item`The Jokester's gun`) && !get("_firedJokestersGun"),
    do: $skill`Fire the Jokester's Gun`,
    equip: $item`The Jokester's gun`,
  },
  {
    name: "Asdon Martin: Missile Launcher",
    available: () => asdonFualable(100) && !get("_missileLauncherUsed"),
    prepare: () => AsdonMartin.fillTo(100),
    do: $skill`Asdon Martin: Missile Launcher`,
  },
  {
    name: "Shadow Brick",
    available: () => have($item`shadow brick`) && get("_shadowBricksUsed") < 13,
    do: $item`shadow brick`,
  },
  {
    name: "Sweat Bullets",
    available: () =>
      have($item`blood cubic zirconia`) &&
      get("_bczSweatBulletsCasts", 0) < 7 &&
      myPath() !== $path`Grey You`,
    do: $skill`BCZ: Sweat Bullets`,
    equip: $item`blood cubic zirconia`,
  },
  {
    name: "Jurassic Parka",
    available: () =>
      have($skill`Torso Awareness`) &&
      have($item`Jurassic Parka`) &&
      !have($effect`Everything Looks Yellow`),
    equip: { equip: $items`Jurassic Parka`, modes: { parka: "dilophosaur" } },
    do: $skill`Spit jurassic acid`,
  },
];
