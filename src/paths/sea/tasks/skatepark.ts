
import { $familiar, $items, $location, get } from "libram";
import { Quest, Resources } from "../../../engine/task";
import { visitUrl } from "kolmafia";

export const SkateParkQuest: Quest = {
  name: "Skate Park",
  tasks: [
    {
      name: "Skate Park",
      after: ["Sea Monkee/Open Grandpa Zone"],
      completed: () => get("skateParkStatus") !== "war",
      resources: {
        which: Resources.NCForce,
        benefit: 5,
      },
      do: $location`The Skate Park`,
      outfit: {
        familiar: $familiar`Peace Turkey`,
        equip: $items`skate blade`,
        modifier: "-combat",
      },
      post: () => {
        // Otherwise mafia won't update the war status for us
        visitUrl("sea_skatepark.php");
      },
      choices: { 403: 1 },
      limit: { soft: 11 },
    },
    {
      name: "Get Fishy",
      after: ["Skate Park"],
      ready: () => get("skateParkStatus") === "ice",
      completed: () => get("_skateBuff1"),
      do: () => {
        visitUrl("sea_skatepark.php?action=state2buff1");
      },
      freeaction: true,
      underwater: true,
      limit: { tries: 1 },
    }
  ]
};
