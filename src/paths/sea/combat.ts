import { ActionDefaults, CombatStrategy as BaseCombatStrategy } from "grimoire-kolmafia";
import { haveEquipped, Location, Monster, myLocation } from "kolmafia";
import { $effect, $item, $skill, CinchoDeMayo, get, have, Macro } from "libram";
import { CombatActions } from "../../engine/combat";
import { args } from "../../args";

export class SeaActionDefaults implements ActionDefaults<CombatActions> {
  ignore(target?: Monster | Location) {
    return this.kill(target);
  }

  ignoreSoftBanish(target?: Monster | Location) {
    return this.kill(target);
  }

  kill(target?: Monster | Location) {
    return seaKillMacro(target);
  }

  killHard(target?: Monster | Location) {
    return seaKillMacro(target);
  }

  ignoreNoBanish(target?: Monster | Location) {
    return this.kill(target);
  }

  killFree() {
    return this.abort();
  } // Abort if no resource provided

  banish(target?: Monster | Location) {
    return this.kill(target);
  }

  killBanish(target: Monster | Location | undefined) {
    return this.kill(target);
  }

  abort() {
    return new Macro().abort();
  }

  killItem(target?: Monster | Location) {
    return this.kill(target);
  }

  yellowRay(target?: Monster | Location) {
    return this.killItem(target);
  }

  forceItems(target?: Monster | Location) {
    return this.killItem(target);
  }
}

export function seaKillMacro(target: Monster | Location | undefined): Macro {
  const result = new Macro();
  if (get("lassoTrainingCount") < 18) {
    result.tryItem($item`sea lasso`);
  }
  if (haveEquipped($item`Everfull Dart Holster`)) {
    if (!have($effect`Everything Looks Red`)) {
      result
        .trySkill($skill`Darts: Aim for the Bullseye`)
        .trySkill($skill`Darts: Aim for the Bullseye`)
        .trySkill($skill`Darts: Aim for the Bullseye`)
        .trySkill($skill`Darts: Aim for the Bullseye`)
        .trySkill($skill`Darts: Aim for the Bullseye`);
    }
  }

  // If we are out of NC forces, use remaining cincho for candy
  if (
    args.resources.speed &&
    haveEquipped($item`Cincho de Mayo`) &&
    CinchoDeMayo.currentCinch() >= 5 &&
    CinchoDeMayo.totalAvailableCinch() < 60
  ) {
    result.trySkill($skill`Cincho: Projectile Piñata`);
  }

  return result
    .trySkill($skill`Saucegeyser`)
    .attack()
    .repeat();
}
