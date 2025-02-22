import { OutfitSpec } from "grimoire-kolmafia";
import { itemAmount, Monster } from "kolmafia";
import { $item, $monster, AutumnAton, get, have } from "libram";
import { oresNeeded } from "../tasks/level8";

export type BackupTarget = {
  monster: Monster;
  completed: () => boolean;
  outfit?: OutfitSpec | (() => OutfitSpec);
  limit_tries: number;
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
    monster: $monster`Eldritch Tentacle`,
    completed: () => false,
    limit_tries: 11,
  },
];

export function getActiveBackupTarget() {
  return backupTargets.find(
    (target) => !target.completed() && target.monster === get("lastCopyableMonster")
  );
}
