import {
  cliExecute,
  drink,
  eat,
  Effect,
  equip,
  familiarEquippedEquipment,
  fullnessLimit,
  getWorkshed,
  inebrietyLimit,
  Item,
  itemAmount,
  mallPrice,
  myAdventures,
  myDaycount,
  myFullness,
  myInebriety,
  myLevel,
  myMeat,
  restoreMp,
  retrieveItem,
  reverseNumberology,
  use,
  useFamiliar,
  useSkill,
  visitUrl,
} from "kolmafia";
import { $effect, $effects, $familiar, $item, $items, $skill, $slot, clamp, get, have, maxBy } from "libram";
import { Quest } from "../../engine/task";
import { Priorities } from "../../engine/priority";

function calculateItemValue(item: Item): number {
  return item.name.length / 10;
}

function bestPizzaItemForLetter(letter: string): Item | null {
  const items = $items.all().filter((i) => i.name.startsWith(letter) && have(i));
  if (items.length === 0) return null;

  const itemsWithValues = items.map((item) => ({
    item,
    value: calculateItemValue(item),
  }));

  return maxBy(itemsWithValues, (entry) => entry.value)?.item ?? null;
}

// Function to design the pizza based on the effect's name letters
function designPizza(effect: Effect): Item[] {
  return effect.name
    .substring(0, 4)
    .split("")
    .map((letter) => bestPizzaItemForLetter(letter))
    .filter((x): x is Item => x !== null); // filter out nulls
}

// Simulation to calculate pizza cost and benefit
export function simCreatePizza(effect: Effect): [number, number] {
  const pizzaItems = designPizza(effect);

  const benefit = pizzaItems.reduce(
    (acc, it) => acc + calculateItemValue(it),
    0,
  );
  const cost = pizzaItems.reduce((acc, it) => acc + mallPrice(it), 0);

  return [cost, benefit];
}

// Function to create the pizza by calling the appropriate URL
export function createPizza(effect: Effect) {
  const pizzaItems = designPizza(effect);

  if (pizzaItems.length < 4) {
    throw `Not enough items to create pizza for ${effect.name}`;
  }

  visitUrl(
    `campground.php?action=makepizza&pizza=${pizzaItems
      .map((item) => item.id)
      .join(",")}`,
    true,
    true,
  );
}

const goodPizzaEffect = $effects`Bureaucratized, Down With Chow`;

export const IH8UDietQuest: Quest = {
  name: "IH8UDiet",
  tasks: [
    {
      name: "Diabolic Pizza Cube",
      priority: () => Priorities.Free,
      ready: () => {
        if (getWorkshed() !== $item`diabolic pizza cube`) return false;
        return goodPizzaEffect.some(
          (eff) => designPizza(eff).length === 4,
        );
      },
      completed: () => myFullness() >= fullnessLimit(),
      do: () => {
        // actually make the pizza for the first effect that works
        const effect = goodPizzaEffect.find(
          (eff) => designPizza(eff).length === 4,
        );
        if (effect) createPizza(effect);
        eat($item`diabolic pizza`);
      },
      limit: { tries: 15 },
      freeaction: true,
    },
    {
      name: "Consume Booze (Good)",
      after: [],
      ready: () =>
        (!get("_miniKiwiIntoxicatingSpiritsBought") && have($item`mini kiwi`, 3)) ||
        (have($item`mini kiwi intoxicating spirits`) && myInebriety() < inebrietyLimit()),
      completed: () => myDaycount() > 1,
      do: (): void => {
        const canDrink = () => myInebriety() < inebrietyLimit();

        if (canDrink()) {
          if (have($item`astral six-pack`)) {
            use($item`astral six-pack`);
          }
          if (myLevel() >= 11) {
            while (canDrink() && have($item`astral pilsner`)) {
              if (!have($effect`Ode to Booze`) && have($skill`The Ode to Booze`)) {
                useSkill($skill`The Ode to Booze`);
              }
              drink($item`astral pilsner`);
            }
          }
        }

        if (
          (!get("_miniKiwiIntoxicatingSpiritsBought") && have($item`mini kiwi`, 3)) ||
          have($item`mini kiwi intoxicating spirits`)
        ) {
          retrieveItem($item`mini kiwi intoxicating spirits`);
          if (!have($effect`Ode to Booze`) && have($skill`The Ode to Booze`)) {
            useSkill($skill`The Ode to Booze`);
          }
          drink($item`mini kiwi intoxicating spirits`);
        }
      },
      limit: { tries: 15 },
      freeaction: true,
      withnoadventures: true,
    },
    {
      name: "Consume Food (Good)",
      after: [],
      ready: () =>
        myFullness() < fullnessLimit() &&
        (have($item`mini kiwi`, 3) || have($item`mini kiwi digitized cookies`)),
      completed: () => myDaycount() > 1,
      do: (): void => {
        const canEat = () => myFullness() < fullnessLimit();

        while (
          canEat() &&
          (have($item`mini kiwi`, 3) || have($item`mini kiwi digitized cookies`))
        ) {
          retrieveItem($item`mini kiwi digitized cookies`);
          eat($item`mini kiwi digitized cookies`);
        }
      },
      limit: { tries: 25 },
      freeaction: true,
      withnoadventures: true,
    },
    {
      name: "Consume Food (Bad)",
      after: [],
      ready: () =>
        myFullness() < fullnessLimit() && have($item`incredible mini-pizza`) && myAdventures() < 7,
      completed: () => myDaycount() > 1,
      do: (): void => {
        const canEat = () => myFullness() < fullnessLimit();

        while (canEat() && myAdventures() < 7 && have($item`incredible mini-pizza`)) {
          eat($item`incredible mini-pizza`);
        }
      },
      limit: { tries: 25 },
      freeaction: true,
      withnoadventures: true,
    },
    {
      name: "Consume Booze (Bad)",
      after: [],
      ready: () =>
        myInebriety() < inebrietyLimit() &&
        myAdventures() <= 7 &&
        ((have($item`mini kiwi`, 1) &&
          (have($item`bottle of gin`) || have($item`bottle of vodka`))) ||
          have($item`mini kiwitini`)),
      completed: () => myDaycount() > 1,
      do: (): void => {
        const canDrink = () => myInebriety() < inebrietyLimit() && myAdventures() <= 7;

        while (
          canDrink() &&
          ((have($item`mini kiwi`, 1) &&
            (have($item`bottle of gin`) || have($item`bottle of vodka`))) ||
            have($item`mini kiwitini`))
        ) {
          if (!have($effect`Ode to Booze`) && have($skill`The Ode to Booze`)) {
            useSkill($skill`The Ode to Booze`);
          }
          if (have($item`tuxedo shirt`)) {
            equip($item`tuxedo shirt`);
          }
          retrieveItem($item`mini kiwitini`);
          drink($item`mini kiwitini`);
        }
      },
      limit: { tries: 25 },
      freeaction: true,
      withnoadventures: true,
    },
    {
      name: "Sausage",
      completed: () => !have($item`Kramco Sausage-o-Matic™`) || get("_sausagesEaten") >= 23,
      ready: () => have($item`magical sausage casing`) && myMeat() > 10_000,
      do: (): void => {
        // Pump-and-grind cannot be used from Left-Hand Man
        if (
          have($familiar`Left-Hand Man`) &&
          familiarEquippedEquipment($familiar`Left-Hand Man`) === $item`Kramco Sausage-o-Matic™`
        ) {
          useFamiliar($familiar`Left-Hand Man`);
          equip($slot`familiar`, $item`none`);
        }
        const toEat = clamp(
          itemAmount($item`magical sausage casing`),
          0,
          23 - get("_sausagesEaten")
        );
        eat(toEat, $item`magical sausage`);
      },
      limit: { tries: 23 },
      freeaction: true,
      withnoadventures: true,
    },
    {
      name: "Hourglass",
      after: [],
      completed: () => !have($item`etched hourglass`) || get("_etchedHourglassUsed"),
      do: (): void => {
        use($item`etched hourglass`);
      },
      limit: { tries: 1 },
      freeaction: true,
      withnoadventures: true,
    },
    {
      name: "Numberology",
      after: [],
      completed: () =>
        get("_universeCalculated") >= get("skillLevel144") || get("_universeCalculated") >= 2,
      ready: () => myAdventures() > 0 && Object.keys(reverseNumberology()).includes("69"),
      do: (): void => {
        restoreMp(1);
        cliExecute("numberology 69");
      },
      limit: { tries: 5 },
      freeaction: true,
      withnoadventures: true,
    },
    {
      name: "Hourglass",
      after: [],
      completed: () => !have($item`etched hourglass`) || get("_etchedHourglassUsed"),
      do: (): void => {
        use($item`etched hourglass`);
      },
      limit: { tries: 1 },
      freeaction: true,
      withnoadventures: true,
    },
  ],
};
