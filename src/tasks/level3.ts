import {
  getProperty,
  myMaxmp,
  myMp,
  numericModifier,
  runChoice,
  runCombat,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $item,
  $items,
  $monster,
  $skill,
  BeachComb,
  have,
  Macro,
  SourceTerminal,
} from "libram";
import { CombatStrategy } from "../engine/combat";
import { atLevel } from "../lib";
import { Priorities } from "../engine/priority";
import { councilSafe } from "./level12";
import { Quest } from "../engine/task";
import { step } from "grimoire-kolmafia";
import { customRestoreMp, ensureWithMPSwaps } from "../engine/moods";
import { args } from "../args";

export const TavernQuest: Quest = {
  name: "Tavern",
  tasks: [
    {
      name: "Start",
      after: ["Mosquito/Finish"],
      ready: () => atLevel(3),
      completed: () => step("questL03Rat") >= 0,
      do: () => visitUrl("council.php"),
      limit: { tries: 1 },
      priority: () => (councilSafe() ? Priorities.None : Priorities.BadMood),
      freeaction: true,
    },
    {
      name: "Tavernkeep",
      after: ["Start"],
      completed: () => step("questL03Rat") >= 1,
      do: () => visitUrl("tavern.php?place=barkeep"),
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Basement",
      after: ["Tavernkeep"],
      completed: () => step("questL03Rat") >= 2,
      prepare: () => {
        if (have($skill`Saucestorm`)) {
          // Gain some +spelldmg if we can to help kill the rat kings
          if (have($skill`Carol of the Hells`)) {
            ensureWithMPSwaps([$effect`Carol of the Hells`], false);
          } else if (have($skill`Song of Sauce`)) {
            ensureWithMPSwaps([$effect`Song of Sauce`], false);
          }
          if (myMp() < 40 && myMaxmp() >= 40) customRestoreMp(40);
          if (myMp() < 20) customRestoreMp(20);
        }

        const elements = ["HOT", "COLD", "STENCH", "SPOOKY"];
        if (BeachComb.available()) {
          for (const element of elements) {
            if (numericModifier(`${element.toLowerCase()} Damage`) < 20) {
              BeachComb.tryHead(element as keyof typeof BeachComb.head);
            }
          }
        }
        // Get the source terminal buff if it would make a difference
        if (SourceTerminal.have() && !have($effect`damage.enh`) && args.resources.speed) {
          for (const element of elements) {
            if (
              numericModifier(`${element.toLowerCase()} Damage`) < 20 &&
              numericModifier(`${element.toLowerCase()} Damage`) >= 15
            ) {
              SourceTerminal.enhance($effect`damage.enh`);
              break;
            }
          }
        }
      },
      do: (): void => {
        visitUrl("cellar.php");
        const layout = getProperty("tavernLayout");
        const path = [3, 2, 1, 0, 5, 10, 15, 20, 16, 21];
        for (let i = 0; i < path.length; i++) {
          if (layout.charAt(path[i]) === "0") {
            visitUrl(`cellar.php?action=explore&whichspot=${path[i] + 1}`);
            runCombat();
            runChoice(-1);
            break;
          }
        }
      },
      outfit: () => {
        if (have($item`June cleaver`))
          return {
            modifier: "ML, -combat",
            equip: $items`June cleaver, old patched suit-pants, unbreakable umbrella, Jurassic Parka, barrel lid, carnivorous potted plant`,
            modes: {
              umbrella: have($item`tangle of rat tails`) ? "cocoon" : "broken",
              parka: "pterodactyl",
            },
          };
        return {
          modifier: "ML, +combat",
          equip: $items`old patched suit-pants, unbreakable umbrella, Jurassic Parka, barrel lid, carnivorous potted plant, giant bow tie`,
          modes: {
            umbrella: have($item`tangle of rat tails`) ? "cocoon" : "broken",
            parka: "spikolodon",
          },
        };
      },
      combat: new CombatStrategy()
        .macro(() => {
          if (have($skill`Saucegeyser`))
            return Macro.while_("!mpbelow 24", Macro.skill($skill`Saucegeyser`));
          else return new Macro();
        }, $monster`drunken rat king`)
        .killHard($monster`drunken rat king`)
        .ignore(),
      choices: () => {
        return {
          509: 1,
          510: 1,
          511: 2,
          // Possibly overridden in choice script
          514: numericModifier("Stench Damage") >= 20 ? 2 : 1,
          515: numericModifier("Spooky Damage") >= 20 ? 2 : 1,
          496: numericModifier("Hot Damage") >= 20 ? 2 : 1,
          513: numericModifier("Cold Damage") >= 20 ? 2 : 1,
        };
      },
      breathitinextender: true,
      limit: { tries: 10 },
    },
    {
      name: "Finish",
      after: ["Basement"],
      completed: () => step("questL03Rat") === 999,
      do: () => visitUrl("tavern.php?place=barkeep"),
      limit: { tries: 1 },
      freeaction: true,
    },
  ],
};
