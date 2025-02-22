import { floor, runChoice, use, visitUrl } from "kolmafia";
import { $effect, $familiar, $item, $skill, ensureEffect, get, have, set } from "libram";
import { args } from "../args";
import { Priorities } from "../engine/priority";
import { atLevel } from "../lib";
import { Quest } from "../engine/task";

export const LevelingQuest: Quest = {
  name: "Leveling",
  tasks: [
    {
      name: "Cloud Talk",
      after: [],
      completed: () =>
        have($effect`That's Just Cloud-Talk, Man`) ||
        get("_campAwayCloudBuffs", 0) > 0 ||
        !get("getawayCampsiteUnlocked"),
      do: () => visitUrl("place.php?whichplace=campaway&action=campaway_sky"),
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Acquire Mouthwash",
      priority: () => Priorities.Start,
      completed: () =>
        !have($item`Sept-Ember Censer`) ||
        (get("availableSeptEmbers") <= 7 - args.resources.saveember &&
          get("_septEmbersCollected", false)) ||
        args.resources.saveember >= 7,
      do: (): void => {
        // Grab Embers
        visitUrl("shop.php?whichshop=september");
        set("_septEmbersCollected", true);

        // Grab Bembershoot
        if (!have($item`bembershoot`))
          visitUrl(`shop.php?whichshop=september&action=buyitem&quantity=1&whichrow=1516&pwd`);

        // Grab Mouthwashes
        const mouthwashes = floor((get("availableSeptEmbers", 0) - args.resources.saveember) / 2);
        visitUrl(
          `shop.php?whichshop=september&action=buyitem&quantity=${mouthwashes}&whichrow=1512&pwd`
        );
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Cut Melodramedary",
      after: [],
      priority: () => Priorities.Start,
      completed: () =>
        get("_entauntaunedToday") ||
        !have($familiar`Melodramedary`) ||
        !have($item`Fourth of May Cosplay Saber`) ||
        !have($familiar`Shorter-Order Cook`),
      do: () => {
        visitUrl("main.php?action=camel");
        runChoice(1);
      },
      outfit: {
        familiar: $familiar`Melodramedary`,
        weapon: $item`Fourth of May Cosplay Saber`,
      },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Mouthwash",
      after: ["Cloud Talk", "Cut Melodramedary", "Acquire Mouthwash", "Misc/Sewer Saucepan"],
      priority: () => Priorities.Start,
      completed: () => !have($item`Mmm-brr! brand mouthwash`) || atLevel(12),
      do: () => {
        // Use potions for cold resistance
        if (have($item`rainbow glitter candle`)) use($item`rainbow glitter candle`);
        if (have($item`pec oil`)) use($item`pec oil`);
        if (have($skill`Emotionally Chipped`) && get("_feelPeacefulUsed") < 3)
          ensureEffect($effect`Feeling Peaceful`);
        if (have($item`MayDay™ supply package`)) use($item`MayDay™ supply package`);
        if (have($item`scroll of Protection from Bad Stuff`))
          use($item`scroll of Protection from Bad Stuff`);
        if (have($item`bottle of antifreeze`)) use($item`bottle of antifreeze`);
        if (have($item`recording of Rolando's Rondo of Resisto`))
          use($item`recording of Rolando's Rondo of Resisto`);
        if (have($item`saucepan`) && have($skill`Scarysauce`)) ensureEffect($effect`Scarysauce`);

        use($item`Mmm-brr! brand mouthwash`);
      },
      outfit: () => {
        if (have($familiar`Trick-or-Treating Tot`) && have($item`li'l candy corn costume`))
          return {
            familiar: $familiar`Trick-or-Treating Tot`,
            modifier: "cold res",
          };
        return {
          familiar: $familiar`Exotic Parrot`,
          modifier: "cold res",
        };
      },
      limit: { tries: 4 },
      freeaction: true,
    },
  ],
};
