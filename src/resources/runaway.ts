import { Outfit, OutfitSpec } from "grimoire-kolmafia";
import {
  cliExecute,
  Familiar,
  familiarWeight,
  getProperty,
  Item,
  mySign,
  myTurncount,
  numericModifier,
  toInt,
  useFamiliar,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $items,
  $skill,
  AsdonMartin,
  get,
  getActiveEffects,
  have,
  Macro,
} from "libram";
import { asdonFualable } from "../lib";
import { args } from "../args";
import { CombatResource } from "./lib";

export interface RunawaySource extends CombatResource {
  do: Macro;
  banishes: boolean;
  chance: () => number;
  useactively?: boolean;
}

export const runawayValue =
  have($item`Greatest American Pants`) || have($item`navel ring of navel gazing`)
    ? 0.8 * get("valueOfAdventure")
    : get("valueOfAdventure");

function commaItemFinder(): Item | undefined {
  const commaItem =
    $items`aquaviolet jub-jub bird, charpuce jub-jub bird, crimsilion jub-jub bird, stomp box`.find(
      (f) => have(f)
    );

  return commaItem;
}

export function asdonBanishAvailable() {
  if (args.debug.lastasdonbumperturn && myTurncount() - args.debug.lastasdonbumperturn > 30)
    return false;
  if (!asdonFualable(50)) return false;
  // The boss bat minions are not banishable, which breaks the tracking
  const banishes = get("banishedMonsters").split(":");
  const bumperIndex = banishes
    .map((string) => string.toLowerCase())
    .indexOf("spring-loaded front bumper");
  if (bumperIndex === -1) return true;
  return myTurncount() - parseInt(banishes[bumperIndex + 1]) > 30;
}

export function getRunawaySources(taskName: string): RunawaySource[] {
  const runawayFamiliarPlan = planRunawayFamiliar();

  return [
    {
      name: "Latte (Refill)",
      available: () =>
        (!get("_latteBanishUsed") || get("_latteRefillsUsed") < 2) && // Save one refill for aftercore
        have($item`latte lovers member's mug`) &&
        shouldFinishLatte(),
      prepare: refillLatte,
      do: new Macro().skill($skill`Throw Latte on Opponent`),
      chance: () => 1,
      equip: $item`latte lovers member's mug`,
      banishes: true,
    },
    {
      name: "Bowl Curveball",
      available: () =>
        have($item`cosmic bowling ball`) || get("cosmicBowlingBallReturnCombats") === 0,
      do: new Macro().skill($skill`Bowl a Curveball`),
      chance: () => 1,
      banishes: true,
      useactively: true,
    },
    {
      name: "Spring Shoes",
      available: () => have($item`spring shoes`) && !have($effect`Everything Looks Green`),
      do: new Macro().skill($skill`Spring Away`),
      chance: () => 1,
      equip: $item`spring shoes`,
      banishes: false,
      useactively: true,
    },
    {
      name: "Asdon Martin",
      available: (): boolean => {
        if (taskName === "Tavern/Basement" || taskName === "Bat/Boss Bat") return false;
        return asdonBanishAvailable();
      },
      prepare: () => AsdonMartin.fillTo(50),
      do: new Macro().skill($skill`Asdon Martin: Spring-Loaded Front Bumper`),
      chance: () => 1,
      banishes: true,
      useactively: true,
    },
    {
      name: "Bandersnatch",
      available: () =>
        runawayFamiliarPlan.available &&
        runawayFamiliarPlan.outfit.familiar === $familiar`Frumious Bandersnatch`,
      equip: runawayFamiliarPlan.outfit,
      do: new Macro().step(runawayFamiliarPlan.macro).runaway(),
      chance: () => 1,
      effect: $effect`Ode to Booze`,
      banishes: false,
    },
    {
      name: "Stomping Boots",
      available: () =>
        runawayFamiliarPlan.available &&
        runawayFamiliarPlan.outfit.familiar === $familiar`Pair of Stomping Boots`,
      equip: runawayFamiliarPlan.outfit,
      do: new Macro().step(runawayFamiliarPlan.macro).runaway(),
      chance: () => 1,
      banishes: false,
    },
    {
      name: "Comma Chameleon",
      prepare: (): void => {
        const commaItem = commaItemFinder();

        if (commaItem !== undefined && get("commaFamiliar") === null) {
          useFamiliar($familiar`Comma Chameleon`);
          visitUrl(`inv_equip.php?which=2&action=equip&whichitem=${toInt(commaItem)}&pwd`);
        }
      },
      available: (): boolean => {
        const commaItem = commaItemFinder();

        if (
          runawayFamiliarPlan.available &&
          runawayFamiliarPlan.outfit.familiar === $familiar`Comma Chameleon` &&
          (get("commaFamiliar") === $familiar`Frumious Bandersnatch` ||
            get("commaFamiliar") === $familiar`Pair of Stomping Boots` ||
            (commaItem !== undefined && have(commaItem)))
        )
          return true;
        return false;
      },
      equip: runawayFamiliarPlan.outfit,
      do: new Macro().step(runawayFamiliarPlan.macro).runaway(),
      chance: () => 1,
      effect: $effect`Ode to Booze`,
      banishes: false,
    },
    {
      name: "Peppermint Parasol",
      available: () => have($item`peppermint parasol`) && get("_navelRunaways") < 9,
      do: new Macro().item($item`peppermint parasol`),
      chance: () => (get("_navelRunaways") < 3 ? 1 : 0.2),
      banishes: false,
    },
    {
      name: "GAP",
      available: () => have($item`Greatest American Pants`),
      equip: $item`Greatest American Pants`,
      do: new Macro().runaway(),
      chance: () => (get("_navelRunaways") < 3 ? 1 : 0.2),
      banishes: false,
    },
    {
      name: "Navel Ring",
      available: () => have($item`navel ring of navel gazing`),
      equip: $item`navel ring of navel gazing`,
      do: new Macro().runaway(),
      chance: () => (get("_navelRunaways") < 3 ? 1 : 0.2),
      banishes: false,
    },
  ];
}

interface RunawayFamiliarSpec {
  available: boolean;
  outfit: OutfitSpec;
  macro: Macro;
}

type FamweightOption = {
  thing: Item;
  rider?: Familiar;
};

const famweightOptions: FamweightOption[] = [
  // Fam equip
  { thing: $item`amulet coin` },
  { thing: $item`astral pet sweater` },
  { thing: $item`tiny stillsuit` },
  // Hats
  { thing: $item`crumpled felt fedora` },
  { thing: $item`Daylight Shavings Helmet` },
  // Hands
  { thing: $item`cursed pirate cutlass` },
  { thing: $item`Fourth of May Cosplay Saber` },
  { thing: $item`ghostly reins` },
  { thing: $item`iFlail` },
  { thing: $item`familiar scrapbook` },
  // Shirts
  { thing: $item`Stephen's lab coat` },
  // Back
  {
    thing: $item`Buddy Bjorn`,
    rider: $familiar`Gelatinous Cubeling`,
  },
  // Pants
  { thing: $item`repaid diaper` },
  { thing: $item`Great Wolf's beastly trousers` },
  { thing: $item`Greaves of the Murk Lord` },
  // Accessories
  { thing: $item`Belt of Loathing` },
  { thing: $item`Brutal brogues` },
  { thing: $item`hewn moon-rune spoon` },
  { thing: $item`Beach Comb` },
];

function planRunawayFamiliar(): RunawayFamiliarSpec {
  const familiarOptions = [];
  if (have($familiar`Frumious Bandersnatch`) && have($skill`The Ode to Booze`)) {
    familiarOptions.push($familiar`Frumious Bandersnatch`);
  }
  if (have($familiar`Pair of Stomping Boots`)) {
    familiarOptions.push($familiar`Pair of Stomping Boots`);
  }
  if (
    have($familiar`Comma Chameleon`) &&
    (getProperty("commaFamiliar") === "Frumious Bandersnatch" ||
      getProperty("commaFamiliar") === "Pair of Stomping Boots" ||
      getProperty("_commaRunDone"))
  ) {
    familiarOptions.push($familiar`Comma Chameleon`);
  }

  if (familiarOptions.length === 0) {
    return {
      available: false,
      outfit: {},
      macro: new Macro(),
    };
  }
  const chosenFamiliar = familiarOptions[0];
  const goalWeight = 5 * (1 + get("_banderRunaways"));
  let attainableWeight = familiarWeight(chosenFamiliar);

  // Include passive skills
  if (have($skill`Crimbo Training: Concierge`)) attainableWeight += 1;
  if (have($skill`Amphibian Sympathy`)) attainableWeight += 5;
  if (mySign() === "Platypus") attainableWeight += 5;

  // Include active effects
  for (const effect of getActiveEffects())
    attainableWeight += numericModifier(effect, "Familiar Weight");

  // Include as much equipment as needed
  const outfit = new Outfit();
  outfit.equip(chosenFamiliar);
  if (chosenFamiliar === $familiar`Pair of Stomping Boots`) {
    // Avoid reducing ML too much
    outfit.equip({ avoid: $items`Space Trip safety headphones, HOA regulation book` });
  }

  for (const option of famweightOptions) {
    if (attainableWeight >= goalWeight) break;
    if (option.rider && !have(option.rider)) continue;
    if (outfit.equip(option.thing)) {
      attainableWeight += numericModifier(option.thing, "Familiar Weight");
      if (option.rider) outfit.equip({ riders: { "buddy-bjorn": option.rider } });
    }
  }

  const macro = new Macro();
  if (
    attainableWeight < goalWeight &&
    attainableWeight + 20 >= goalWeight &&
    have($skill`Meteor Lore`) &&
    get("_meteorShowerUses") < 5
  ) {
    macro.trySkill($skill`Meteor Shower`);
    attainableWeight += 20;
  }

  return {
    outfit: outfit.spec(),
    available: attainableWeight >= goalWeight,
    macro: macro,
  };
}
/**
 * Return true if we have all of our final latte ingredients, but they are not in the latte.
 */

export function shouldFinishLatte(): boolean {
  if (!have($item`latte lovers member's mug`)) return false;
  if (myTurncount() >= 1000) return false;

  // Check that we have all the proper ingredients
  for (const ingredient of ["wing", "cajun", "vitamins"])
    if (!get("latteUnlocks").includes(ingredient)) return false;
  // Check that the latte is not already finished
  return !["Meat Drop: 40", "Combat Rate: 10", "Experience (familiar): 3"].every((modifier) =>
    get("latteModifier").includes(modifier)
  );
}
/**
 * Refill the latte, using as many final ingredients as possible.
 */

export function refillLatte(): void {
  if (!get("_latteBanishUsed")) return;
  const modifiers = [];
  if (get("latteUnlocks").includes("wing")) modifiers.push("wing");
  if (get("latteUnlocks").includes("cajun")) modifiers.push("cajun");
  if (get("latteUnlocks").includes("vitamins")) modifiers.push("vitamins");
  modifiers.push("cinnamon", "pumpkin", "vanilla"); // Always unlocked
  cliExecute(`latte refill ${modifiers.slice(0, 3).join(" ")}`);
}
