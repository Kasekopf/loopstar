import {
  $coinmaster,
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $skill,
  ChestMimic,
  have,
  Macro,
} from "libram";
import {
  buy,
  closetAmount,
  inHardcore,
  itemAmount,
  myHash,
  print,
  retrieveItem,
  runCombat,
  takeCloset,
  useSkill,
  visitUrl,
} from "kolmafia";
import { Quest } from "../../../engine/task";
import { CombatStrategy } from "../../../engine/combat";
import { yellowRayPossible } from "../../../resources/yellowray";
import {
  getAsMatrix,
  getLayoutAsMatrix,
  Mine,
  mineCoordinate,
  MiningCoordinate,
  visitMine,
} from "../mining";
import { pull } from "../util";

export const SummonsQuest: Quest = {
  name: "Octopus Garden",
  tasks: [
    {
      name: "Dynamite",
      ready: () =>
        inHardcore() &&
        have($item`pocket wish`) &&
        have($item`spitball`) &&
        have($item`Spooky VHS Tape`) &&
        yellowRayPossible(),
      completed: () => have($item`minin' dynamite`, 2),
      do: () => {
        throw `Attempted to summon tetched prospector with no allocation`;
      },
      resources: {
        which: { summon: $monster`tetched prospector` },
        benefit: 200,
        required: true,
      },
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.trySkill($skill`Darts: Throw at %part1`).tryItem([
            $item`Spooky VHS Tape`,
            $item`spitball`,
          ]);
        })
        .killHard(),
      limit: { tries: 2 },
      outfit: {
        familiar: $familiar`Peace Turkey`,
        equip: $items`Everfull Dart Holster, spring shoes, Monodent of the Sea, toy Cupid bow`,
      },
    },
    {
      name: "Kill Miner",
      after: ["Sea Monkee/Open Grandpa Zone"],
      completed: () => have($item`Mer-kin digpick`),
      do: $location`Anemone Mine`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.step("pickpocket");
        })
        .kill(),
      outfit: {
        modifier: "item",
        equip: $items`Monodent of the Sea, Everfull Dart Holster, spring shoes, Peridot of Peril, prismatic beret, shark jumper, toy Cupid bow`,
      },
      peridot: $monster`Mer-kin miner`,
      limit: { soft: 11 },
    },
    {
      name: "Mine Teflon",
      ready: () => have($item`Mer-kin digpick`),
      completed: () =>
        have($item`teflon ore`) ||
        have($item`teflon swim fins`) ||
        have($item`crappy Mer-kin tailpiece`) ||
        have($item`Mer-kin scholar tailpiece`) ||
        have($item`Mer-kin gladiator tailpiece`),
      do: () => {
        print("Visiting mine...");
        visitMine(Mine.ANEMONE);
        const mineMatrix = getAsMatrix(Mine.ANEMONE);
        const mineOreMatrix = getLayoutAsMatrix(Mine.ANEMONE);
        print(mineMatrix.toString());
        print(mineOreMatrix.toString());
        for (let y = 5; y >= 1; y--) {
          if (mineMatrix[y][3] !== "o") {
            mineCoordinate(Mine.ANEMONE, [3 + 1, y + 1]);
            return;
          }
        }

        // Build list of remaining unmined spots matching criteria
        const availableCoordinates: MiningCoordinate[] = [];

        for (let x = 0; x < 6; x++) {
          for (let y = 0; y < 6; y++) {
            // Skip already mined squares
            if (mineMatrix[y][x] === "o") continue;

            // Check if sparkly (rows 0-2)
            if (y <= 2 && mineMatrix[y][x] === "*") {
              availableCoordinates.push([x, y]);
              continue;
            }

            // Check if on row 1 and adjacent to a mined square
            if (y === 1) {
              const adjacentMined =
                (x > 0 && mineMatrix[y][x - 1] === "o") || // left
                (x < 5 && mineMatrix[y][x + 1] === "o") || // right
                mineMatrix[y - 1][x] === "o" || // above (row 0)
                mineMatrix[y + 1][x] === "o"; // below (row 2)

              if (adjacentMined) {
                availableCoordinates.push([x, y]);
              }
            }
          }
        }

        // Choose the coordinate with best score
        let bestCoordinate: MiningCoordinate | null = null;
        let bestScore = -Infinity;

        for (const [x, y] of availableCoordinates) {
          let minVinylDistance = 1000;
          let minVelcroDistance = 1000;

          // Find minimum distance to each type of ore
          for (let oy = 0; oy < 6; oy++) {
            for (let ox = 0; ox < 6; ox++) {
              const cell = mineOreMatrix[oy][ox];
              const distance = Math.abs(x - ox) + Math.abs(y - oy);

              if (cell.includes("vinyl")) {
                minVinylDistance = Math.min(minVinylDistance, distance);
              }
              if (cell.includes("velcro")) {
                minVelcroDistance = Math.min(minVelcroDistance, distance);
              }
            }
          }

          // Score based on distances (higher is better)
          let score = minVinylDistance + minVelcroDistance;

          // Add sparkly bonus
          const sparklyBonus = mineMatrix[y][x] === "*" ? 2 : 0;
          score += sparklyBonus;

          if (score > bestScore) {
            bestScore = score;
            bestCoordinate = [x, y];
          }
        }

        if (bestCoordinate) {
          mineCoordinate(Mine.ANEMONE, [bestCoordinate[0] + 1, bestCoordinate[1] + 1]);
        }
      },
      outfit: {
        equip: $items`Mer-kin digpick`,
        avoid: $items`Peridot of Peril`,
      },
      post: () => {
        if (have($effect`Beaten Up`)) {
          useSkill($skill`Tongue of the Walrus`);
        }
      },
      limit: { soft: 11 },
    },
    {
      name: "Buy Waterlogged Bootstraps",
      after: ["Sea Monkee/Outpost Grandma"],
      ready: () => itemAmount($item`sand dollar`) + closetAmount($item`sand dollar`) >= 10,
      completed: () =>
        have($item`waterlogged bootstraps`) ||
        have($item`teflon swim fins`) ||
        have($item`crappy Mer-kin tailpiece`) ||
        have($item`Mer-kin scholar tailpiece`) ||
        have($item`Mer-kin gladiator tailpiece`),
      do: () => {
        const sandDollarsFromCloset = 13 - itemAmount($item`sand dollar`);
        if (sandDollarsFromCloset > 0) {
          takeCloset($item`sand dollar`, sandDollarsFromCloset);
        }
        visitUrl("monkeycastle.php?who=1");
        visitUrl("monkeycastle.php?who=2");
        buy($coinmaster`Big Brother`, 1, $item`waterlogged bootstraps`);
      },
      underwater: true,
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Get Mer-kin Tailpiece",
      after: ["Make Sea Chaps", "Mine Teflon", "Buy Waterlogged Bootstraps", "Currents/Seahorse"],
      completed: () =>
        have($item`crappy Mer-kin tailpiece`) ||
        have($item`Mer-kin gladiator tailpiece`) ||
        have($item`Mer-kin scholar tailpiece`),
      do: () => {
        retrieveItem($item`teflon swim fins`);
        visitUrl("shop.php?whichshop=grandma");
        visitUrl("shop.php?whichshop=grandma&action=buyitem&quantity=1&whichrow=125&pwd");
      },
      underwater: true,
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Fax diver",
      ready: () => ChestMimic.have() && $familiar`Chest Mimic`.experience >= 50,
      completed: () => have($item`aerated diving helmet`) || have($item`rusty rivet`),
      do: () => {
        visitUrl(`inv_use.php?pwd=${myHash()}&which=3&whichitem=9537`, false, true);
        visitUrl(
          `choice.php?pwd&whichchoice=1267&option=1&wish=to fight an unholy diver`,
          true,
          true
        );
        visitUrl(`main.php`, false);
        runCombat();
      },
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.trySkill($skill`%fn, lay an egg`).trySkill($skill`%fn, lay an egg`);
        })
        .killFree(),
      outfit: {
        modifier: "item",
        familiar: $familiar`Chest Mimic`,
        equip: $items`toy Cupid bow, Flash Liquidizer Ultra Dousing Accessory`,
      },
      limit: { turns: 1 },
    },
    {
      name: "Mimic diver",
      ready: () => ChestMimic.eggMonsters().has($monster`unholy diver`),
      completed: () =>
        have($item`aerated diving helmet`) ||
        have($item`rusty rivet`, 8) ||
        have($item`crappy Mer-kin mask`) ||
        have($item`Mer-kin scholar mask`) ||
        have($item`Mer-kin gladiator mask`),
      do: () => {
        ChestMimic.differentiate($monster`unholy diver`);
        if (!inHardcore() && itemAmount($item`rusty rivet`) === 7) {
          pull($item`rusty rivet`);
        }
      },
      combat: new CombatStrategy().killFree(),
      outfit: {
        modifier: "item",
        familiar: $familiar`Grey Goose`,
        equip: $items`toy Cupid bow, Flash Liquidizer Ultra Dousing Accessory`,
      },
      limit: { turns: 1 },
    },
    {
      name: "Get Mer-kin Mask",
      after: ["Fax diver", "Mimic diver", "Currents/Seahorse"],
      completed: () =>
        have($item`crappy Mer-kin mask`) ||
        have($item`Mer-kin gladiator mask`) ||
        have($item`Mer-kin scholar mask`),
      do: () => {
        retrieveItem($item`aerated diving helmet`);
        visitUrl("shop.php?whichshop=grandma");
        visitUrl("shop.php?whichshop=grandma&action=buyitem&quantity=1&whichrow=124&pwd");
      },
      underwater: true,
      freeaction: true,
      limit: { tries: 1 },
    },
  ],
};
