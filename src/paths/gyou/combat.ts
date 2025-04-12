import { ActionDefaults } from "grimoire-kolmafia";
import {
  appearanceRates,
  floor,
  haveEquipped,
  Location,
  Monster,
  myBuffedstat,
  myLevel,
  myMp,
  numericModifier,
  Skill,
  Stat,
} from "kolmafia";
import { $effect, $item, $location, $skill, $stat, have, Macro } from "libram";
import { CombatActions } from "../../engine/combat";

export class GyouActionDefaults implements ActionDefaults<CombatActions> {
  ignore(target?: Monster | Location) {
    return this.kill(target);
  }

  ignoreSoftBanish(target?: Monster | Location) {
    return this.kill(target);
  }

  kill(target?: Monster | Location) {
    return this.killWith(target, $skill`Infinite Loop`, $stat`Moxie`, "any");
  }

  killHard(target?: Monster | Location) {
    return this.killWith(target, $skill`Infinite Loop`, $stat`Moxie`, "train");
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
    if (have($skill`Double Nanovision`))
      return this.killWith(target, $skill`Double Nanovision`, $stat`Mysticality`, "skip");
    else return this.kill(target);
  }

  yellowRay(target?: Monster | Location) {
    if (have($skill`Double Nanovision`))
      return this.killWith(target, $skill`Double Nanovision`, $stat`Mysticality`, "skip");
    else return this.killWith(target, $skill`Infinite Loop`, $stat`Moxie`, "skip");
  }

  forceItems(target?: Monster | Location) {
    return this.killItem(target);
  }

  private killWith(
    target: Monster | Location | undefined,
    killing_blow: Skill,
    killing_stat: Stat,
    darts: "train" | "skip" | "any"
  ): Macro {
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
      target === $location`Shadow Rift (The Misspelled Cemetary)` ||
      myMp() < 20 ||
      !have(killing_blow)
    )
      return result.attack().repeat();

    // Weaken monsters with Pseudopod slap until they are in range of our kill.
    // Since monsterhpabove is locked behind manuel/factoids, just do the maximum
    // number of slaps we could ever need for the monster/zone.
    if (myBuffedstat(killing_stat) * floor(myMp() / 20) < 100) {
      const HPgap = maxHP(target) - myBuffedstat(killing_stat) * floor(myMp() / 20);
      const slaps = Math.ceil(HPgap / 10);
      if (slaps > 0) {
        return result
          .while_(`!times ${slaps}`, new Macro().skill($skill`Pseudopod Slap`))
          .while_("!mpbelow 20", new Macro().skill(killing_blow))
          .attack()
          .repeat();
      }
    }
    return result.while_("!mpbelow 20", new Macro().skill(killing_blow)).attack().repeat();
  }
}

function getMonsters(where?: Location): Monster[] {
  if (where === undefined) return [];
  return Object.entries(appearanceRates(where)) // Get the maximum HP in the location
    .filter((i) => i[1] > 0)
    .map((i) => Monster.get(i[0]));
}

function maxHP(target?: Monster | Location): number {
  if (target === undefined) return 1;
  const base =
    target instanceof Location ? Math.max(...getMonsters(target).map(maxHP)) : target.baseHp;
  return Math.floor(1.05 * base) + numericModifier("Monster Level");
}
