// Adapted from oreo (https://github.com/loathers/oreo/tree/main)

import { haveEffect, isWearingOutfit, myBuffedstat, visitUrl } from "kolmafia";
import {
  $effect,
  $element,
  $skill,
  $stat,
  chunk,
  damageTakenByElement,
  extractItems,
  get,
  have,
  tuple,
} from "libram";

/**
 * Mines in the Kingdom of Loathing
 */
export enum Mine {
  /** Inside of Itznotyerzitz Mine */
  ITZNOTYERZITZ = 1,
  /** Deep Inside the Knob Shaft */
  KNOB = 2,
  /** Anemone Mine */
  ANEMONE = 3,
  /** The Gummi Mine (Retired, Crimbo 2011) */
  GUMMI = 4,
  /** Crimbonium Mine (Retired, Crimbo 2014) */
  CRIMBONIUM = 5,
  /** The Velvet / Gold Mine */
  VOLCANO = 6,
}

/**
 * Coordinate system that the Kingdom of Loathing uses for mining.
 * The first row, first column and last column are all unbreakable.
 */
export type MiningCoordinate = [column: number, row: number];

/**
 * @param mine Which mine
 * @returns Whether twinkly squares will be visible even when when not accessible
 */
export function hasObjectDetection(mine = 1): boolean {
  if (mine === Mine.CRIMBONIUM && have($effect`Crimbonar`)) return true;
  return haveEffect($effect`Object Detection`) !== 0 || isWearingOutfit("Dwarvish War Uniform");
}

/**
 * @param mine Which mine
 * @returns The maximum damage the current player can expect to take from a cave-in
 */
export function caveInCost(mine: Mine) {
  switch (mine) {
    case Mine.ITZNOTYERZITZ:
    case Mine.GUMMI:
    case Mine.CRIMBONIUM:
      return myBuffedstat($stat`muscle`) * 1.5;
    case Mine.KNOB:
      return myBuffedstat($stat`muscle`) * 0.5;
    case Mine.ANEMONE:
      return myBuffedstat($stat`muscle`) * 2.5;
    case Mine.VOLCANO:
      return damageTakenByElement(75, $element`hot`);
    default:
      return 0;
  }
}

const stateIndexToCoord = (position: number) => {
  const row = Math.floor(position / 6);
  const col = position % 6;
  return tuple<MiningCoordinate>(col + 1, row + 1);
};

const stateCoordToIndex = (coordinate: MiningCoordinate) => {
  return coordinate[0] * 8 + coordinate[1];
};

const getAccessibleSparklesForIndex = (state: string, index: number) => {
  // Translate index to 0-indexed coord
  const coords = stateIndexToCoord(index);
  const [col, row] = [coords[0] - 1, coords[1] - 1];

  // Front row sparkles are always accessible
  if (row >= 5 && state[index] === "*") return [coords];
  // Otherwise we are looking for open spots only
  if (state[index] !== "o") return [];

  // Look at the cardinal mask for sparkles
  return [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]
    .map(([dy, dx]) => {
      const y = col + dy;
      const x = row + dx;
      if (x < 0 || x > 5 || y < 0 || y > 5) return null;
      return x * 6 + y;
    })
    .filter((i) => i !== null)
    .filter((i) => state[i] === "*")
    .map(stateIndexToCoord);
};

/**
 * List all sparkly rocks adjacent to an open space. This will be simply a list of all sparkly rocks
 * without some form of Object Detection.
 *
 * This assumes all open spots are accessible. If spots at the back of the mine were somehow to be open
 * this would be no longer be correct.
 *
 * @param mine Which mine
 * @returns List of all sparkly rocks adjacent to an open space
 */
export function getAccessibleSparkles(mine: Mine) {
  const state = get(`mineState${mine}`, "");
  return [...Array(state.length).fill(0)].flatMap((v, position) =>
    getAccessibleSparklesForIndex(state, position)
  );
}

/**
 * @param mine Which mine
 * @returns Returns number of mined spots in the current cavern
 */
export function minedSpots(mine: Mine) {
  return get(`mineState${mine}`, "")
    .split("")
    .filter((c) => c === "o").length;
}

/**
 * Visit a new cavern if possible
 *
 * @param mine Which mine
 * @returns Page contents
 */
export function findNewCavern(mine: Mine) {
  return visitUrl(`mining.php?mine=${mine}&reset=1&pwd`, true);
}

/**
 * @param mine Which mine
 * @param coords Coordinates at which to mine (using the in-game coordinate system)
 * @returns Items acquired from mining that coordinate, if any.
 */
export function mineCoordinate(mine: Mine, [col, row]: MiningCoordinate) {
  const page = visitUrl(`mining.php?mine=${mine}&which=${col + 8 * row}&pwd`, true);
  return extractItems(page);
}

/**
 * Visit a mine
 *
 * @param mine Which mine
 * @returns Page contents
 */
export function visitMine(mine: Mine) {
  return visitUrl(`mining.php?mine=${mine}`);
}

/**
 * @param mine Which mine
 * @returns The state for the given mine
 */
export function getState(mine: Mine) {
  return get(`mineState${mine}`, "");
}

/**
 * Get the mine layout as a flat string array
 *
 * @param mine Which mine
 * @returns An array of strings representing the given mine
 */
export function getMineLayout(mine: Mine): string[] {
  const stateArray = getState(mine).split("");
  const oreString = get(`mineLayout${mine}`);
  for (let column = 1; column <= 6; column++) {
    for (let row = 1; row <= 6; row++) {
      const oreIndex = column + 8 * row;
      const stateIndex = column - 1 + 6 * (row - 1);
      const regex = new RegExp(`#${oreIndex}<img .+?itemimages/(.+?)\\.gif.+?>`);
      const match = oreString.match(regex);
      if (match) {
        stateArray[stateIndex] = match[1];
      }
    }
  }
  return stateArray;
}

export function getAsMatrix(mine: Mine) {
  return chunk(getState(mine).split(""), 6);
}

export function getLayoutAsMatrix(mine: Mine) {
  return chunk(getMineLayout(mine), 6);
}

/**
 * @returns Number of unconditionally free mines (minin' dynamite is not counted as it only works with non-sparkly spots)
 */
export function countFreeMines() {
  return (
    (have($skill`Unaccompanied Miner`) ? 5 - get("_unaccompaniedMinerUsed") : 0) +
    haveEffect($effect`Loded`)
  );
}
