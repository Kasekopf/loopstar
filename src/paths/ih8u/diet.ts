import {
  cliExecute,
  drink,
  eat,
  equip,
  familiarEquippedEquipment,
  fullnessLimit,
  inebrietyLimit,
  itemAmount,
  myAdventures,
  myDaycount,
  myFullness,
  myInebriety,
  myLevel,
  restoreMp,
  retrieveItem,
  reverseNumberology,
  use,
  useFamiliar,
  useSkill,
} from "kolmafia";
import { $effect, $familiar, $item, $skill, $slot, clamp, get, have } from "libram";
import { Quest } from "../../engine/task";

export const IH8UDietQuest: Quest = {
  name: "IH8UDiet",
  tasks: [
    {
      name: "Consume Booze (Good)",
      after: [],
      ready: () =>
        ((myLevel() >= 11 && have($item`astral six-pack`)) ||
          have($item`astral pilsner`) ||
          (!get("_miniKiwiIntoxicatingSpiritsBought") && have($item`mini kiwi`, 3)) ||
          have($item`mini kiwi intoxicating spirits`)) &&
        myInebriety() < inebrietyLimit(),
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
      ready: () => have($item`magical sausage casing`),
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
      completed: () => get("_universeCalculated") >= get("skillLevel144"),
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
