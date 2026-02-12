import { abort, availableChoiceOptions, getProperty, print, runChoice } from "kolmafia";
import { $item, get, have, set, ValueOf } from "libram";

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
    if (options[4] && !have($item`model airship`)) {
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
  // Tavern NCs
  else if ((choice === 496 || choice === 513 || choice === 514 || choice === 515) && options[2]) {
    // Manually select this option if avilable, in case we increased elemental dmg in prepare
    runChoice(2);
  }
  // Lil Doctor bag NC
  else if (choice === 1340) {
    runChoice(3);
  }
  //Sea stuff
  else if (choice === 1565) {
    runChoice(1);
  } else if (choice >= 48 && choice <= 61) {
    abort();
  } else if (choice === 312) {
    runChoice(3);
  } else if (choice === 315) {
    const encounters = get("_loopstar_outpost_choices", 0) + 1;
    set("_loopstar_outpost_choices", encounters);
    runChoice(encounters);
  } else if (choice === 1562) {
    const getPriority = (option: string): number => MOBIUS_PRIORITIES[option as MobiusOption];
    const bestChoice = Object.entries(options).reduce((a, b) =>
      getPriority(a[1]) <= getPriority(b[1]) ? a : b
    )[0];
    runChoice(Number(bestChoice));
  } else if (choice === 704) {
    // still want to debug this
    print(page);
    const libraryOptions = get("merkinCatalogChoices").split(",");
    for (const option of libraryOptions) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, choiceNum, status] = option.split(":");
      if (status === "unknown") {
        runChoice(parseInt(choiceNum));
        return;
      }
    }
  } else if (choice === 703) {
    const bestGuess = getDreadscrollGuess();
    const extra = `pro1=${bestGuess[0]}&pro2=${bestGuess[1]}&pro3=${bestGuess[2]}&pro4=${bestGuess[3]}&pro5=${bestGuess[4]}&pro6=${bestGuess[5]}&pro7=${bestGuess[6]}&pro8=${bestGuess[7]}`;
    runChoice(1, extra);
  } else if (choice === 310) {
    if (have($item`rough fish scale`, 10)) {
      runChoice(2);
    } else {
      runChoice(6);
    }
  }
}

function getDreadscrollGuess(): string {
  let possibleCodes: string[] = [""];
  for (let i = 1; i <= 8; i++) {
    const currentClue = get(`dreadScroll${i}`, 0);
    if (currentClue !== 0) {
      for (let j = 0; j < possibleCodes.length; j++) {
        possibleCodes[j] = possibleCodes[j] + currentClue;
      }
    } else {
      // Unknown clue: branch into all possibilities
      const newCodes: string[] = [];
      for (const code of possibleCodes) {
        for (let digit = 1; digit <= 4; digit++) {
          newCodes.push(code + digit);
        }
      }
      possibleCodes = newCodes;
    }
  }
  const pastGuesses = get("dreadScrollGuesses");
  if (pastGuesses) {
    const guesses = pastGuesses.split(",");
    for (const guess of guesses) {
      const [code, incorrectStr] = guess.split(":");
      const incorrectCount = parseInt(incorrectStr);

      // filter out all codes that don't match previous dreadscroll guesses
      possibleCodes = possibleCodes.filter((candidate) => {
        let differences = 0;
        for (let i = 0; i < 8; i++) {
          if (candidate[i] !== code[i]) {
            differences++;
          }
        }
        return differences === incorrectCount;
      });
    }
  }
  // Choose the code that minimizes expected errors among possible codes
  let bestCode = possibleCodes[0];
  let minExpectedErrors = 8;
  for (const candidate of possibleCodes) {
    let expectedErrors = 0;
    for (let pos = 0; pos < 8; pos++) {
      const candidateDigit = candidate[pos];
      let matchCount = 0;
      for (const possible of possibleCodes) {
        if (possible[pos] === candidateDigit) {
          matchCount++;
        }
      }
      // Probability this position is wrong
      const errorProb = 1 - matchCount / possibleCodes.length;
      expectedErrors += errorProb;
    }

    if (expectedErrors < minExpectedErrors) {
      minExpectedErrors = expectedErrors;
      bestCode = candidate;
    }
  }
  print(`Possible codes: ${possibleCodes}`);
  print(`Best guess: ${bestCode}`);
  return bestCode;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MOBIUS_BASE_TO_RES = {
  "Borrow a cup of sugar from yourself": "Return the sugar you borrowed",
  "Draw a goatee on yourself": "Succumb to evil",
  "Stop your arch-nemesis as a baby": "Go back and make the Naughty Sorceress naughty again",
  "Defend yourself": "Assassinate yourself",
  "Take the long odds on the trifecta": "Fix the race and also fix the race.",
  "Plant some seeds in the distant past": "Chop down some trees",
  "Give your past self investment tips": "Steal from your future self",
  "Steal a cupcake from young Susie": "Bake Susie a cupcake",
  "Play Schroedinger's Prank on yourself": "Check your pocket",
  "Shoot yourself in the foot": "Get shot in the foot",
  "Meet your parents when they were young": "Fix your parents' relationship",
  "Go back and take a 20-year-long nap": "Go back and set an alarm",
  "Lift yourself up by your bootstraps": "Let yourself get lifted up by your bootstraps",
  "Go back and write a best-seller.": "Replace your novel with AI drivel",
  "Peek in on your future": "Make yourself forget",
  "Steal a club from the past": "Prevent the deadly seal invasion",
  "Mind your own business": "Sit and write in your journal",
  "Plant some trees and harvest them in the future": "Teach hippies to make jams and jellies",
  "Go for a nature walk": "Go back in time and kill a butterfly",
  "Hey, free gun!": "Sell the gun",
  "Make friends with a famous poet": "Make enemies with a famous poet",
  "Cheeze it, it's the pigs!": "Aiding and abetterment",
  "Borrow meat from your future": "Repay yourself in the past",
  "I'm not messing with the timeline!": "I'm not messing with the timeline!",
} as const;

type MobiusOption = keyof typeof MOBIUS_BASE_TO_RES | ValueOf<typeof MOBIUS_BASE_TO_RES>;

const MOBIUS_PRIORITIES: Record<MobiusOption, number> = {
  "I'm not messing with the timeline!": 100,
  "Borrow a cup of sugar from yourself": 99,
  "Return the sugar you borrowed": 1000,
  "Draw a goatee on yourself": 1000,
  "Succumb to evil": 1000,
  "Make friends with a famous poet": 1000,
  "Make enemies with a famous poet": 1000,
  "Go back and take a 20-year-long nap": 10,
  "Go back and set an alarm": 31,
  "Go for a nature walk": 1000,
  "Go back in time and kill a butterfly": 1000,
  "Cheeze it, it's the pigs!": 1000,
  "Aiding and abetterment": 1000,
  "Plant some trees and harvest them in the future": 20,
  "Teach hippies to make jams and jellies": 1000,
  "Plant some seeds in the distant past": 1000,
  "Chop down some trees": 1000,
  "Play Schroedinger's Prank on yourself": 1000,
  "Check your pocket": 1000,
  "Steal a club from the past": 1000,
  "Prevent the deadly seal invasion": 1000,
  "Borrow meat from your future": 8,
  "Repay yourself in the past": 1000,
  "Mind your own business": 1000,
  "Sit and write in your journal": 1000,
  "Take the long odds on the trifecta": 1000,
  "Fix the race and also fix the race.": 1000,
  "Go back and write a best-seller.": 5,
  "Replace your novel with AI drivel": 6,
  "Lift yourself up by your bootstraps": 1000,
  "Let yourself get lifted up by your bootstraps": 1000,
  "Shoot yourself in the foot": 1000,
  "Get shot in the foot": 1000,
  "Give your past self investment tips": 1000,
  "Steal from your future self": 1000,
  "Peek in on your future": 1000,
  "Make yourself forget": 1000,
  "Defend yourself": 1000,
  "Assassinate yourself": 1000,
  "Stop your arch-nemesis as a baby": 1,
  "Go back and make the Naughty Sorceress naughty again": 2,
  "Steal a cupcake from young Susie": 9,
  "Bake Susie a cupcake": 1000,
  "Hey, free gun!": 1000,
  "Sell the gun": 1000,
  "Meet your parents when they were young": 1000,
  "Fix your parents' relationship": 1000,
};
