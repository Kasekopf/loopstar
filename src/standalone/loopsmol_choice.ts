import { availableChoiceOptions, getProperty, print, runChoice } from "kolmafia";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function main(choice: number, page: string) {
  const options: { [key: number]: string } = availableChoiceOptions();

  if (choice === 923 && options[5]) {
    runChoice(5); // All Over the Map (The Black Forest)
  } else if (choice === 780 && options[4]) {
    runChoice(4); // Action Elevator
  } else if (choice === 785 && options[4]) {
    runChoice(4); // Air Apparent
  } else if (choice === 788 && options[2]) {
    runChoice(2); // Life is Like a Cherry of Bowls
  } else if (choice === 691 && options[4]) {
    runChoice(4); // Second Chest
  } else if (choice === 1322) {
    // If NEP quest is food or booze
    if (
      getProperty("_questPartyFairQuest") === "food" ||
      getProperty("_questPartyFairQuest") === "booze"
    ) {
      runChoice(1); // Accept
    } else {
      runChoice(2); // Decline
    }
  }
  // Random Lack of an Encounter
  else if (choice === 182) {
    if (options[4]) {
      // Pick up a model airship
      runChoice(4);
    } else if (options[6]) {
      // Bat Wings Skip
      runChoice(6);
    }
  }
  // Everfull dart handling
  else if (choice === 1525) {
    const priority: { [key: string]: number } = {
      "Throw a second dart quickly": 60,
      "Deal 25-50% more damage": 800,
      "You are less impressed by bullseyes": 10,
      "25% Better bullseye targeting": 20,
      "Extra stats from stats targets": 40,
      "Butt awareness": 30,
      "Add Hot Damage": 1000,
      "Add Cold Damage": 31,
      "Add Sleaze Damage": 1000,
      "Add Spooky Damage": 1000,
      "Add Stench Damage": 1000,
      "Expand your dart capacity by 1": 50,
      "Bullseyes do not impress you much": 9,
      "25% More Accurate bullseye targeting": 19,
      "Deal 25-50% extra damage": 10000,
      "Increase Dart Deleveling from deleveling targets": 100,
      "Deal 25-50% greater damage": 10000,
      // "Extra stats from stats targets":39, - Dupe in ash script, not sure about the logic here
      "25% better chance to hit bullseyes": 18,
    };

    let currentScore = 999999999;
    let choiceToRun = 1;

    for (const [option, optionText] of Object.entries(options)) {
      if (!priority[optionText]) {
        print(`dart perk "${optionText}" not in priority list`, "red");
        continue;
      }

      if (priority[optionText] >= currentScore) {
        continue;
      }

      currentScore = priority[optionText];
      choiceToRun = parseInt(option);
    }

    runChoice(choiceToRun);
  }
}
