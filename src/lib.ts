import { DelayedMacro, Guards, step } from "grimoire-kolmafia";
import {
  appearanceRates,
  availableAmount,
  buy,
  cliExecute,
  create,
  Effect,
  getFuel,
  getWorkshed,
  Item,
  Location,
  Monster,
  myAdventures,
  myAscensions,
  myFamiliar,
  myLevel,
  myMeat,
  myPrimestat,
  Phylum,
  print,
  Skill,
  totalTurnsPlayed,
  use,
  visitUrl,
} from "kolmafia";
import {
  $familiar,
  $item,
  $location,
  $monsters,
  $stat,
  AprilingBandHelmet,
  AsdonMartin,
  clamp,
  get,
  getTodaysHolidayWanderers,
  have,
  Macro,
  Snapper,
  undelay,
} from "libram";
import { makeValue, ValueFunctions } from "garbo-lib";

export function debug(message: string, color?: string): void {
  if (color) {
    print(message, color);
  } else {
    print(message);
  }
}

// From phccs
export function convertMilliseconds(milliseconds: number): string {
  const seconds = milliseconds / 1000;
  const minutes = Math.floor(seconds / 60);
  const secondsLeft = Math.round((seconds - minutes * 60) * 1000) / 1000;
  const hours = Math.floor(minutes / 60);
  const minutesLeft = Math.round(minutes - hours * 60);
  return (
    (hours !== 0 ? `${hours} hours, ` : "") +
    (minutesLeft !== 0 ? `${minutesLeft} minutes, ` : "") +
    (secondsLeft !== 0 ? `${secondsLeft} seconds` : "")
  );
}

export function atLevel(level: number): boolean {
  return myLevel() >= level;
}

const legionForms = [
  $item`Loathing Legion abacus`,
  $item`Loathing Legion can opener`,
  $item`Loathing Legion chainsaw`,
  $item`Loathing Legion corkscrew`,
  $item`Loathing Legion defibrillator`,
  $item`Loathing Legion double prism`,
  $item`Loathing Legion electric knife`,
  $item`Loathing Legion flamethrower`,
  $item`Loathing Legion hammer`,
  $item`Loathing Legion helicopter`,
  $item`Loathing Legion jackhammer`,
  $item`Loathing Legion kitchen sink`,
  $item`Loathing Legion knife`,
  $item`Loathing Legion many-purpose hook`,
  $item`Loathing Legion moondial`,
  $item`Loathing Legion necktie`,
  $item`Loathing Legion pizza stone`,
  $item`Loathing Legion rollerblades`,
  $item`Loathing Legion tape measure`,
  $item`Loathing Legion tattoo needle`,
  $item`Loathing Legion universal screwdriver`,
];
export function haveLoathingLegion(): boolean {
  return legionForms.some((item) => have(item));
}

export function tuneSnapper(phylum: Phylum) {
  if (myFamiliar() === $familiar`Red-Nosed Snapper` && Snapper.getTrackedPhylum() !== phylum) {
    Snapper.trackPhylum(phylum);
  }
}

let cachedHaveFlorest: boolean | undefined = undefined;
export function haveFlorest(): boolean {
  if (step("questL02Larva") === -1) return false; // we cannot check yet
  if (cachedHaveFlorest === undefined) {
    const village = visitUrl("forestvillage.php");
    cachedHaveFlorest = village.includes("action=fv_friar");
  }
  return cachedHaveFlorest;
}

export function underStandard(): boolean {
  // Change when the path leaves Standard
  return false;
}

const microphoneForms = [
  $item`Loathing Idol Microphone`,
  $item`Loathing Idol Microphone (75% charged)`,
  $item`Loathing Idol Microphone (50% charged)`,
  $item`Loathing Idol Microphone (25% charged)`,
];
export function haveLoathingIdolMicrophone(): boolean {
  return microphoneForms.some((item) => have(item));
}

export function getMonsters(where?: Location): Monster[] {
  if (where === undefined) return [];
  if (where === $location`The VERY Unquiet Garves`) {
    // Workaround
    return $monsters`basic lihc, party skelteon, corpulent zobmie, grave rober zmobie, senile lihc, slick lihc, gluttonous ghuol, gaunt ghuol`;
  }
  return Object.entries(appearanceRates(where)) // Get the maximum HP in the location
    .filter((i) => i[1] > 0)
    .map((i) => Monster.get(i[0]));
}

export function primestatId(): number {
  switch (myPrimestat()) {
    case $stat`Muscle`:
      return 1;
    case $stat`Mysticality`:
      return 2;
    case $stat`Moxie`:
      return 3;
  }
  return 1;
}

export function cosmicBowlingBallReady() {
  return have($item`cosmic bowling ball`) || get("cosmicBowlingBallReturnCombats") === 0;
}

let _valueFunctions: ValueFunctions | undefined = undefined;
function garboValueFunctions(): ValueFunctions {
  if (!_valueFunctions) {
    _valueFunctions = makeValue({
      itemValues: new Map([[$item`fake hand`, 50000]]),
    });
  }
  return _valueFunctions;
}

export function garboValue(item: Item, useHistorical = false): number {
  return garboValueFunctions().value(item, useHistorical);
}

export function garboAverageValue(...items: Item[]): number {
  return garboValueFunctions().averageValue(...items);
}

type ScoredItem<T> = {
  item: T;
  score: number;
  index: number;
};

/**
 * Sort the given items in an increasing, stable way.
 *
 * That is if key(a)=key(b), then a and b will appear in the same order as in
 * the original array.
 *
 * @param items The array to sort.
 * @param key The value to use for each array item.
 * @returns A new copy of the array, sorted.
 */
export function stableSort<T>(items: T[], key: (item: T) => number): T[] {
  const scoredItems: ScoredItem<T>[] = [];
  for (let i = 0; i < items.length; i++) {
    scoredItems.push({
      item: items[i],
      score: key(items[i]),
      index: i,
    });
  }
  scoredItems.sort((a, b) => {
    if (a.score === b.score) return a.index - b.index;
    return a.score - b.score;
  });
  return scoredItems.map((scoredItem) => scoredItem.item);
}

/**
 * Return true if we can possibly fuel the asdon to the required amount.
 */
export function asdonFualable(amount: number): boolean {
  if (!AsdonMartin.installed()) return false;
  if (
    !have($item`forged identification documents`) &&
    step("questL11Black") < 4 &&
    myMeat() < 10000
  )
    return false; // Save early
  if (amount <= getFuel()) return true;

  if (myMeat() < 6000) return false;
  // Use wad of dough with the bugbear outfit
  if (have($item`bugbear bungguard`) && have($item`bugbear beanie`)) {
    return myMeat() >= (amount - getFuel()) * 24 + 1000; // Save 1k meat as buffer
  }



  // Use all-purpose flower if we have enough ascensions
  if (myAscensions() >= 10 && (have($item`bitchin' meatcar`) || have($item`Desert Bus pass`))) {
    return myMeat() >= 3000 + (amount - getFuel()) * 14; // 2k for all-purpose flower + save 1k meat as buffer + soda water
  }

  return false;
}
export function tryPlayApriling(modifier: string): void {
  if (!AprilingBandHelmet.have()) return;

  if (modifier.includes("+combat")) {
    AprilingBandHelmet.conduct("Apriling Band Battle Cadence");
  }

  if (modifier.includes("-combat")) {
    if (get("noncombatForcerActive")) return;
    AprilingBandHelmet.conduct("Apriling Band Patrol Beat");
  }

  if (modifier.includes("food") || modifier.includes("booze")) {
    AprilingBandHelmet.conduct("Apriling Band Celebration Bop");
  }
}

export function haveHugeLarge() {
  return (
    have($item`McHugeLarge left pole`) &&
    have($item`McHugeLarge right pole`) &&
    have($item`McHugeLarge left ski`) &&
    have($item`McHugeLarge right ski`) &&
    have($item`McHugeLarge duffel bag`)
  );
}

export function flyersDone(): boolean {
  return get("flyeredML") >= 10000;
}

export enum BreathitinStates {
  IMPOSSIBLE = 0,
  READY = 1,
  UNDERGROUND = 2,
  EXTEND = 3,
  WAIT = 4,
}
export function breathitinProgress(): BreathitinStates {
  if (getWorkshed() !== $item`cold medicine cabinet`) return BreathitinStates.IMPOSSIBLE;
  if (get("_coldMedicineConsults") >= 5) return BreathitinStates.IMPOSSIBLE;

  const environments = get("lastCombatEnvironments");
  const underground = (environments.match(/u/g) || []).length;
  const undergroundLeft = underground >= 11 ? 0 : 11 - underground;
  const turnsLeft = clamp(get("_nextColdMedicineConsult") - totalTurnsPlayed(), 0, 20);

  if (turnsLeft <= 0 && undergroundLeft <= 0) return BreathitinStates.READY;
  if (turnsLeft <= undergroundLeft) return BreathitinStates.UNDERGROUND;
  if (undergroundLeft <= 0) return BreathitinStates.EXTEND;
  return BreathitinStates.WAIT;
}

export const NO_ADVENTURE_SPENT = Guards.create(
  () => myAdventures(),
  (adv) => myAdventures() >= adv
);

export const NO_ADVENTURE_SPENT_OR_HOLIDAY = Guards.create(
  () => myAdventures(),
  (adv) => myAdventures() >= adv || getTodaysHolidayWanderers().length > 0
);

export function tryWish(effect: Effect, using: "genie" | "monkey" | "any" = "any"): boolean {
  if (have(effect)) return true;
  if (have($item`pocket wish`) && using !== "monkey") {
    cliExecute(`genie effect ${effect.name}`);
    return true;
  }
  if (have($item`cursed monkey's paw`) && get("_monkeyPawWishesUsed") < 5 && using !== "genie") {
    cliExecute(`monkeypaw effect ${effect.name}`);
    return true;
  }
  return false;
}

/**
 * Get the macro provided by the resource for this action, or undefined if
 * no resource was provided.
 */
export function getMacro(resourceDo: DelayedMacro | Item | Skill): Macro {
  if (resourceDo instanceof Item) return new Macro().item(resourceDo);
  if (resourceDo instanceof Skill) return new Macro().skill(resourceDo);
  return undelay(resourceDo);
}

export function fuelUp(): void {
  buy(1, $item`all-purpose flower`);
  use($item`all-purpose flower`);
  buy(23, $item`soda water`);
  create(23, $item`loaf of soda bread`);
  cliExecute(`asdonmartin fuel ${availableAmount($item`loaf of soda bread`)} soda bread`);
}
