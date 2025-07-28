import { OutfitSpec } from "grimoire-kolmafia";
import { itemAmount, Monster } from "kolmafia";
import { $effect, $item, $monster, AutumnAton, get, have } from "libram";
import { oresNeeded } from "../tasks/level8";
import { args } from "../args";

export type BackupTarget = {
  monster: Monster;
  completed: () => boolean;
  outfit?: OutfitSpec | (() => OutfitSpec);
  limit_tries: number;
  last?: boolean; // only when the other targets are all completed
  twiddle?: boolean; // requires a mafia twiddle after backing up to for a KoL bug
};

const backupTargets: BackupTarget[] = [
  {
    monster: $monster`Camel's Toe`,
    completed: () =>
      (itemAmount($item`star`) >= 8 && itemAmount($item`line`) >= 7) ||
      have($item`Richard's star key`) ||
      get("nsTowerDoorKeysUsed").includes("Richard's star key"),
    outfit: { modifier: "item" },
    limit_tries: 3,
  },
  {
    monster: $monster`mountain man`,
    completed: () => oresNeeded() === 0,
    outfit: { modifier: "item" },
    limit_tries: 2,
  },
  {
    monster: $monster`lobsterfrogman`,
    completed: () =>
      itemAmount($item`barrel of gunpowder`) >= 5 ||
      get("sidequestLighthouseCompleted") !== "none" ||
      !have($item`backup camera`) ||
      AutumnAton.have() ||
      (have($item`Fourth of May Cosplay Saber`) &&
        (get("_saberForceUses") < 5 || get("_saberForceMonsterCount") > 0)),
    limit_tries: 4,
  },
  {
    monster: $monster`swarm of ghuol whelps`,
    completed: () => get("cyrptCrannyEvilness") <= 13 || !args.resources.speed,
    outfit: {
      modifier: "ML",
      skipDefaults: true,
    },
    limit_tries: 3,
    twiddle: true,
  },
  {
    monster: $monster`giant swarm of ghuol whelps`,
    completed: () => get("cyrptCrannyEvilness") <= 13 || !args.resources.speed,
    outfit: {
      modifier: "ML",
      skipDefaults: true,
    },
    limit_tries: 3,
    twiddle: true,
  },
  {
    monster: $monster`sausage goblin`,
    completed: () =>
      get("cyrptCrannyEvilness") > 13 ||
      !args.resources.speed ||
      get("spookyravenRecipeUsed") !== "with_glasses" ||
      have($effect`Angering Pizza Purists`) ||
      have($effect`Too Noir For Snoir`),
    limit_tries: 11,
    last: true,
  },
  {
    monster: $monster`Eldritch Tentacle`,
    completed: () => false,
    limit_tries: 11,
    last: true,
  },
];

export function getActiveBackupTarget() {
  const target = backupTargets.find(
    (target) => !target.completed() && target.monster === get("lastCopyableMonster")
  );
  if (target?.last && backupTargets.find((target) => !target.completed() && !target.last)) {
    return undefined;
  }
  return target;
}
