import { ActionDefaults } from "grimoire-kolmafia";
import { haveEquipped, Location, Monster, myLevel } from "kolmafia";
import { $effect, $item, $location, $skill, have, Macro } from "libram";
import { CombatActions } from "../../engine/combat";

export class BorisActionDefaults implements ActionDefaults<CombatActions> {
  ignore(target?: Monster | Location) {
    return this.kill(target);
  }

  ignoreSoftBanish(target?: Monster | Location) {
    return this.kill(target);
  }

  kill(target?: Monster | Location) {
    return this.killBase(target, "any");
  }

  killHard(target?: Monster | Location) {
    return this.killBase(target, "train");
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

  private killBase(target: Monster | Location | undefined, darts: "train" | "skip" | "any"): Macro {
    const result = new Macro();
    if (haveEquipped($item`Everfull Dart Holster`)) {
      if (darts === "any" && !have($effect`Everything Looks Red`)) {
        result
          .trySkill($skill`Darts: Aim for the Bullseye`)
          .trySkill($skill`Darts: Aim for the Bullseye`)
          .trySkill($skill`Darts: Aim for the Bullseye`)
          .trySkill($skill`Darts: Aim for the Bullseye`)
          .trySkill($skill`Darts: Aim for the Bullseye`);
      } else if (darts !== "skip" && myLevel() >= 11) {
        result.trySkill($skill`Darts: Throw at %part1`);
      }
    }

    if (
      (target instanceof Monster && target.physicalResistance >= 70) ||
      target === $location`Shadow Rift (The Misspelled Cemetary)`
    )
      return result.attack().repeat();

    return result.skill($skill`Mighty Axing`).repeat();
  }
}
