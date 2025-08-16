import { $effect, $item, $location, $monster, $path, $stat, get, have } from "libram";
import { Quest, ResourceRequest, Resources } from "../../engine/task";
import { myPath, myPrimestat, visitUrl } from "kolmafia";


export const SeaQuest: Quest = {
  name: "The Sea",
  tasks: [
    {
      name: "Start",
      // eslint-disable-next-line libram/verify-constants
      ready: () => get("kingLiberated") || myPath() === $path`11037 Leagues Under the Sea`,
      completed: () => get("questS02Monkees") !== "unstarted",
      do: (): void => {
        visitUrl("place.php?whichplace=sea_oldman&action=oldman_oldman"); // idk the visitUrls yet
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Sea Garden",
      after: ["The Sea/Start"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => get("questS02Monkees") !== "unstarted",
      do: $location`An Octopus's Garden`,
      limit: { tries: 10 },
      peridot: $monster`Neptune flytrap`,
      outfit: {}, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Visit Castle",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Sea Garden"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => get("questS02Monkees") !== "unstarted",
      do: () => {
        visitUrl("monkeycastle.php?who=1");
      },
      limit: { tries: 1 },
      outfit: {}, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Rescue Brother",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Visit Castle"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => get("questS02Monkees") !== "unstarted",
      do: $location`The Wreck of the Edgar Fitzsimmons`,
      choices: { 299: 1 },
      limit: { tries: 10 },
      outfit: {}, // Ensure we can breath water
      resources: () =>
        <ResourceRequest>{
          which: Resources.NCForce,
          benefit: 8,
        },
      freeaction: false,
    },
    {
      name: "Big Brother Shopping",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Rescue Brother"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => have($item`fishy pipe`),
      do: () => {
        visitUrl("place.php?whichplace=sea_oldman&action=oldman_oldman"); // fix this
        visitUrl("monkeycastle.php?who=2");
        // do skate park unlock
      },
      limit: { tries: 10 },
      outfit: {}, // Ensure we can breath water
      resources: () =>
        <ResourceRequest>{
          which: Resources.NCForce,
          benefit: 8,
        },
      freeaction: false,
    },
    {
      name: "Skate Park",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Big Brother Shopping"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => have($item`fishy pipe`),
      do: $location`The Skate Park`,
      limit: { tries: 10 },
      outfit: {}, // Ensure we can breath water
      resources: () =>
        <ResourceRequest>{
          which: Resources.NCForce,
          benefit: 8,
        },
      freeaction: false,
    },
    {
      name: "Grandpa Zone Unlock",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Skate Park"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => have($item`fishy pipe`),
      do: () => {
        visitUrl("place.php?whichplace=sea_oldman&action=oldman_oldman"); // fix this
      },
      limit: { tries: 10 },
      outfit: { modifier: "-combat, -tie" }, // Ensure we can breath water
      resources: () =>
        <ResourceRequest>{
          which: Resources.NCForce,
          benefit: 8,
        },
      freeaction: false,
    },
    {
      name: "Rescue Grandpa",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Grandpa Zone Unlock"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => have($item`fishy pipe`),
      do: myPrimestat === $stat`Muscle` ? $location`Anemone Mine` : myPrimestat === $stat`Mysticality` ? $location`The Marinara Trench` : $location`The Dive Bar`,
      limit: { tries: 10 },
      outfit: {}, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Grandma Unlock",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Rescue Grandpa"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => have($item`fishy pipe`),
      do: () => {
        visitUrl("monkeycastle.php?action=grandpastory&topic=Trophyfish");
        visitUrl("monkeycastle.php?action=grandpastory&topic=Grandma");
      },
      limit: { tries: 10 },
      outfit: {}, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Rescue Grandma",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Grandma Unlock"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => have($item`fishy pipe`),
      do: $location`The Mer-Kin Outpost`,
      limit: { tries: 10 },
      outfit: {}, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Mom Unlock",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Rescue Grandma"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => have($item`fishy pipe`),
      do: () => {
        visitUrl("place.php?whichplace=sea_oldman&action=oldman_oldman"); // fix this
      },
      limit: { tries: 10 },
      outfit: {}, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Rescue Mom",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Mom Unlock"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => have($item`fishy pipe`),
      do: $location`The Caliginous Abyss`,
      limit: { tries: 28 },
      outfit: {}, // Ensure we can breath water
      freeaction: false,
      delay: 28
    },
    {
      name: "Finish Mer-kin outpost",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Rescue Grandma"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => have($item`Mer-kin lockkey`),
      do: $location`The Mer-Kin Outpost`,
      limit: { tries: 10 },
      outfit: {}, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Retrieve Seahorse",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Finish Mer-kin outpost"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => get("seahorseName") !== "",
      do: $location`The Coral Corral`,
      limit: { tries: 10 },
      outfit: {}, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Prepare Gladiators",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Retrieve Seahorse"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
        // ask grandpa about currents
      }, // ensure fishy
      completed: () => have($item`Mer-kin gladiator mask`) && have($item`Mer-kin gladiator tailpiece`),
      do: $location`Mer-kin Gymnasium`,
      limit: { tries: 10 },
      outfit: {}, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Do Gladiators",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Prepare Gladiators"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => get("seahorseName") !== "",
      do: $location`Mer-kin Colosseum`,
      limit: { tries: 10 },
      outfit: {}, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Prepare Gladiators",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Finish Mer-kin outpost"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => have($item`Mer-kin gladiator mask`) && have($item`Mer-kin gladiator tailpiece`),
      do: $location`Mer-kin Gymnasium`,
      limit: { tries: 10 },
      outfit: {}, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Do Gladiators",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Prepare Gladiators"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => get("seahorseName") !== "",
      do: $location`Mer-kin Colosseum`,
      limit: { tries: 10 },
      outfit: {}, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Prepare Scholar",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Retrieve Seahorse"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => have($item`Mer-kin scholar mask`) && have($item`Mer-kin scholar tailpiece`),
      do: $location`Mer-kin Elementary School`,
      limit: { tries: 10 },
      outfit: {}, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Do Scholar",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Prepare Scholar"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => get("seahorseName") !== "",
      do: $location`Mer-kin Library`,
      limit: { tries: 10 },
      outfit: {}, // Ensure we can breath water
      freeaction: false,
    },
    {
      name: "Kill the Boss",
      // eslint-disable-next-line libram/verify-constants
      after: ["The Sea/Do Scholar"],
      prepare: () => {
        if (!have($effect`Fishy`)) throw "Get Fishy, rerun";
      }, // ensure fishy
      completed: () => get("seahorseName") !== "",
      do: $location`Mer-kin Library`,
      limit: { tries: 10 },
      outfit: {}, // Ensure we can breath water
      freeaction: false,
    },
  ]
}
