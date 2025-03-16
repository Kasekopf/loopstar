import {
  abort,
  canadiaAvailable,
  cliExecute,
  equippedAmount,
  familiarWeight,
  getWorkshed,
  gnomadsAvailable,
  inHardcore,
  initiativeModifier,
  knollAvailable,
  myAdventures,
  myAscensions,
  myBasestat,
  myFamiliar,
  myLevel,
  myMaxhp,
  myMaxmp,
  myMeat,
  mySign,
  myTurncount,
  numericModifier,
  retrieveItem,
  use,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $monsters,
  $skill,
  $stat,
  AutumnAton,
  get,
  have,
  Macro,
  undelay,
} from "libram";
import { NamedDeltaTask, Quest } from "../../engine/task";
import { atLevel } from "../../lib";
import { Priorities } from "../../engine/priority";
import { CombatStrategy } from "../../engine/combat";
import { globalAbsorbState } from "./absorb";
import { globalStateCache } from "../../engine/state";
import { step } from "grimoire-kolmafia";
import { args } from "../../args";
import { Keys, keyStrategy } from "../../tasks/keys";
import { getPullTask, PullSpec } from "../../tasks/pulls";
import { getSummonTask, SummonTarget } from "../../tasks/summons";

export const gyouDeltas: NamedDeltaTask[] = [
  // Make sure passives are high before doing Digital Key
  {
    name: "Digital/Vanya",
    combine: {
      after: ["Gyou/Big Wheelin' Twins"],
      // +init passive scales by Muscle
      ready: () => myBasestat($stat`Muscle`) >= 200,
    },
  },
  {
    name: "Digital/Fungus",
    combine: {
      // +meat passive scales by Moxie
      ready: () => myBasestat($stat`Moxie`) >= 200,
    },
  },
  {
    name: "Digital/Hero",
    combine: {
      // +item passive scales by Mysticality
      ready: () => myBasestat($stat`Moxie`) >= 200,
    },
  },
  // Wait for tavern until L17
  {
    name: "Tavern/Basement",
    replace: {
      priority: () =>
        (atLevel(17) || !have($item`backup camera`)) &&
        (!have($item`June cleaver`) ||
          (get("_juneCleaverStench") >= 20 &&
            get("_juneCleaverSpooky") >= 20 &&
            get("_juneCleaverHot") >= 20 &&
            get("_juneCleaverCold") >= 20))
          ? Priorities.None
          : Priorities.BadMood, // Wait for backup camera to max out
    },
  },
  // Get the Spectral Jellyfish faster if we need to
  {
    name: "Knob/Outskirts",
    combine: {
      priority: prioritizeJellyfish,
    },
  },
  {
    name: "Knob/Harem",
    combine: {
      priority: prioritizeJellyfish,
    },
    replace: {
      combat: new CombatStrategy()
        .macro(
          // Always use the fire extinguisher on the guard
          new Macro().trySkill($skill`Fire Extinguisher: Zone Specific`),
          $monster`Knob Goblin Harem Guard`
        )
        .macro(
          // Don't use the fire extinguisher if we want to absorb the madam
          () =>
            new Macro().externalIf(
              !globalAbsorbState.isTarget($monster`Knob Goblin Madam`),
              new Macro().trySkill($skill`Fire Extinguisher: Zone Specific`)
            ),
          $monster`Knob Goblin Madam`
        )
        .macro(
          // Don't use the fire extinguisher if we want to absorb the girl
          () =>
            new Macro().externalIf(
              !globalAbsorbState.isTarget($monster`Knob Goblin Harem Girl`),
              new Macro().trySkill($skill`Fire Extinguisher: Zone Specific`)
            ),
          $monster`Knob Goblin Harem Girl`
        )
        .banish($monster`Knob Goblin Harem Guard`)
        .killItem(),
    },
  },
  {
    name: "Knob/Perfume",
    combine: {
      priority: prioritizeJellyfish,
    },
  },
  {
    name: "Knob/King",
    combine: {
      priority: prioritizeJellyfish,
    },
  },
  {
    name: "Menagerie/Key",
    combine: {
      ready: () => !have($skill`Phase Shift`),
      priority: prioritizeJellyfish,
    },
  },
  {
    name: "Absorb/Phase Shift",
    combine: {
      priority: prioritizeJellyfish,
    },
  },
  // L7 changes
  {
    name: "Crypt/Alcove",
    combine: {
      // Wait for the +init skill
      ready: () => have($skill`Overclocking`) || !!(get("twinPeakProgress") & 8),
    },
  },
  {
    name: "Crypt/Cranny",
    combine: {
      // Wait for more stats
      ready: () => myTurncount() > 200,
    },
  },
  {
    name: "Crypt/Nook",
    amend: {
      orbtargets: (original) => {
        return () => {
          if (globalAbsorbState.isReprocessTarget($monster`party skelteon`))
            return $monsters`party skelteon`;
          return original?.();
        };
      },
    },
  },
  // L9 changes
  {
    name: "Orc Chasm/ABoo Clues",
    replace: {
      combat: new CombatStrategy()
        .macro(
          () =>
            numericModifier("Monster Level") < -45 ? new Macro() : new Macro().attack().repeat() // Attack the ghost directly if ML is too high
        )
        .killItem(),
    },
  },
  {
    name: "Orc Chasm/Bridge",
    replace: {
      ready: () =>
        ((have($item`frozen jeans`) ||
          have($item`industrial fire extinguisher`) ||
          (have($item`June cleaver`) && get("_juneCleaverCold", 0) >= 5) ||
          have($skill`Cryocurrency`) ||
          have($skill`Cooling Tubules`) ||
          have($skill`Snow-Cooling System`)) &&
          get("smutOrcNoncombatProgress") < 15) ||
        have($effect`Red Door Syndrome`) ||
        myMeat() >= 1000,
    },
    amend: {
      outfit: (original) => {
        return () => {
          // If we have enough +cold dmg from skills, just use that
          if (
            have($skill`Cryocurrency`) ||
            have($skill`Cooling Tubules`) ||
            have($skill`Snow-Cooling System`) ||
            !original
          ) {
            return {
              modifier: "item, -ML",
              equip: $items`Space Trip safety headphones, HOA regulation book`,
              avoid: $items`broken champagne bottle`,
            };
          }
          return undelay(original);
        };
      },
    },
  },
  // L11 changes
  {
    name: "Hidden City/Temple Wool",
    combine: {
      priority: () => {
        if (have($item`industrial fire extinguisher`)) return Priorities.None;
        if (familiarWeight($familiar`Grey Goose`) < 6) return Priorities.None;
        return { score: 1.1, reason: "Goose charged" };
      },
    },
  },
  {
    name: "Hidden City/Banish Janitors",
    replace: {
      ready: () => have($skill`System Sweep`),
    },
  },
  {
    name: "Hidden City/Bowling",
    amend: {
      combat: (original) => {
        return original
          ?.clone()
          .autoattack(new Macro().trySkill($skill`Infinite Loop`), $monster`drunk pygmy`);
      },
      // Disable parachute until skills have been obtained
      parachute: (original) => {
        return () => {
          if (
            (have($skill`System Sweep`) || get("relocatePygmyJanitor") === myAscensions()) &&
            have($skill`Double Nanovision`)
          )
            return undelay(original);
          return undefined;
        };
      },
    },
  },
  {
    name: "Macguffin/Forest",
    amend: {
      outfit: (original) => {
        return () => {
          if (
            !have($item`reassembled blackbird`) &&
            globalAbsorbState.isReprocessTarget($monster`black magic woman`) &&
            familiarWeight($familiar`Grey Goose`) >= 6
          ) {
            const orb = globalStateCache.orb().prediction($location`The Black Forest`);
            if (orb === $monster`black magic woman`) {
              // Swoop in for a single adventure to reprocess the black magic woman
              const equip = [$item`blackberry galoshes`];
              if (
                have($item`latte lovers member's mug`) &&
                !get("latteUnlocks").includes("cajun")
              ) {
                equip.push($item`latte lovers member's mug`);
              }
              if (have($item`candy cane sword cane`) && !get("candyCaneSwordBlackForest", false))
                equip.push($item`candy cane sword cane`);
              return {
                equip: [...equip, $item`miniature crystal ball`],
                familiar: $familiar`Grey Goose`,
                modifier: "50 combat 5max, -1ML",
              };
            }
          }
          return undelay(original) ?? {};
        };
      },
    },
  },
  {
    name: "Macguffin/Oasis Drum",
    combine: {
      prepare: () => {
        if (globalAbsorbState.hasReprocessTargets($location`The Oasis`)) {
          // Use ghost dog chow to prepare to reprocess Blur without needing arena adventures
          while (familiarWeight($familiar`Grey Goose`) < 6 && have($item`Ghost Dog Chow`))
            use($item`Ghost Dog Chow`);
        }
      },
    },
  },
  {
    name: "Macguffin/Desert",
    amend: {
      outfit: (original) => {
        return () => {
          if (
            globalAbsorbState.isReprocessTarget($monster`swarm of fire ants`) &&
            familiarWeight($familiar`Grey Goose`) >= 6 &&
            have($item`miniature crystal ball`)
          ) {
            const orb = globalStateCache.orb().prediction($location`The Arid, Extra-Dry Desert`);
            if (orb === $monster`swarm of fire ants`) {
              // Swoop in for a single adventure to reprocess the fire ants
              return {
                equip: $items`UV-resistant compass, miniature crystal ball`,
                familiar: $familiar`Grey Goose`,
              };
            } else {
              // Wait for the orb to predict swarm of fire ants
              return {
                equip: $items`UV-resistant compass, miniature crystal ball`,
                familiar: $familiar`Melodramedary`,
              };
            }
          }
          return undelay(original) ?? {};
        };
      },
    },
  },
  // L12 changes
  {
    name: "War/Lighthouse",
    combine: {
      priority: () => {
        // Wait to be higher level
        if (AutumnAton.have() && myBasestat($stat`Moxie`) < 200) return Priorities.BadMood;
        return Priorities.None;
      },
    },
  },
  {
    name: "War/Junkyard Hammer",
    combine: {
      priority: () => (myBasestat($stat`Moxie`) < 300 ? Priorities.BadMood : Priorities.None),
    },
  },
  {
    name: "War/Junkyard Wrench",
    combine: {
      priority: () => (myBasestat($stat`Moxie`) < 300 ? Priorities.BadMood : Priorities.None),
    },
  },
  {
    name: "War/Junkyard Pliers",
    combine: {
      priority: () => (myBasestat($stat`Moxie`) < 300 ? Priorities.BadMood : Priorities.None),
    },
  },
  {
    name: "War/Junkyard Screwdriver",
    combine: {
      priority: () => (myBasestat($stat`Moxie`) < 300 ? Priorities.BadMood : Priorities.None),
    },
  },
  {
    name: "War/Nuns",
    combine: {
      after: ["Absorb/Ponzi Apparatus"],
    },
  },
  // L13 changes
  {
    name: "Tower/Wall of Skin",
    replace: {
      combat: new CombatStrategy().macro(
        new Macro()
          .tryItem($item`beehive`)
          .skill($skill`Grey Noise`)
          .repeat()
      ),
    },
  },
  {
    name: "Tower/Shadow",
    combine: {
      after: ["Absorb/Overclocking"],
    },
  },
  // Misc changes
  {
    name: "Misc/Toy Accordion",
    delete: true,
  },
  {
    name: "Misc/Sewer Saucepan",
    delete: true,
  },
  {
    name: "Misc/Sewer Totem",
    delete: true,
  },
  {
    name: "Wand/Plus Sign",
    replace: {
      ready: () =>
        (myBasestat($stat`muscle`) >= 45 &&
          myBasestat($stat`mysticality`) >= 45 &&
          myBasestat($stat`moxie`) >= 45 &&
          (keyStrategy.useful(Keys.Zap) || args.minor.wand)) ||
        !globalAbsorbState.skillCompleted($skill`Hivemindedness`),
    },
  },
  {
    name: "Wand/Get Teleportitis",
    replace: {
      ready: () =>
        myMeat() >= 1000 && // Meat for goal teleportitis choice adventure
        familiarWeight($familiar`Grey Goose`) >= 6 && // Goose exp for potential absorbs during teleportits
        have($item`soft green echo eyedrop antidote`) && // Antitdote to remove teleportitis afterwards
        (keyStrategy.useful(Keys.Zap) ||
          args.minor.wand ||
          globalAbsorbState.skillCompleted($skill`Hivemindedness`)),
      priority: () =>
        familiarWeight($familiar`Grey Goose`) >= 6
          ? { score: 1, reason: "Goose charged" }
          : Priorities.None,
      outfit: { modifier: "-combat", familiar: $familiar`Grey Goose` },
    },
  },
  {
    name: "Wand/Mimic",
    replace: {
      outfit: { modifier: "-combat, init", familiar: $familiar`Grey Goose` },
    },
  },
  {
    name: "Misc/LOV Tunnel",
    delete: true,
  },
  // Nonstandard leveling
  {
    name: "Leveling/Cloud Talk",
    delete: true,
  },
  {
    name: "Leveling/Acquire Mouthwash",
    delete: true,
  },
  {
    name: "Leveling/Cut Melodramedary",
    delete: true,
  },
  {
    name: "Leveling/Mouthwash",
    delete: true,
  },
];

export const gyouPulls: PullSpec[] = [
  {
    pull: $items`warbear long johns, square sponge pants`,
    useful: () => !have($item`designer sweatpants`),
    name: "MP Regen Pants",
    benefit: 4,
  },
  {
    pull: $items`plastic vampire fangs, warbear goggles, burning newspaper`,
    useful: () =>
      !have($item`designer sweatpants`) &&
      get("greyYouPoints") < 11 &&
      !have($item`burning paper slippers`),
    post: () => {
      if (have($item`burning newspaper`)) retrieveItem($item`burning paper slippers`);
    },
    name: "Max HP with low path progression",
    benefit: 4,
  },
  {
    pull: $item`white page`,
    useful: () => !have($skill`Piezoelectric Honk`),
    optional: true,
    benefit: 3,
  },
  { pull: $item`portable cassette player`, benefit: 3 },
  {
    pull: $items`Space Trip safety headphones, HOA regulation book`,
    name: "-ML",
    optional: true,
    benefit: 6,
  },
  { pull: $item`yule hatchet`, benefit: 3 },
  {
    pull: $item`grey down vest`,
    useful: () =>
      (!have($skill`Summon Clip Art`) || get("tomeSummons") >= 3) && !have($item`toy Cupid bow`),
    optional: true,
    benefit: 3,
  },
  {
    pull: $item`teacher's pen`,
    duplicate: true,
    optional: true,
    benefit: 2,
  },
  { pull: $item`giant yellow hat`, benefit: 2 },
];

export const gyouSummons: SummonTarget[] = [
  {
    target: $monster`pygmy witch lawyer`,
    priority: () => Priorities.Start,
    after: [],
    completed: () => have($skill`Infinite Loop`),
    acquire: [
      {
        item: $item`Arr, M80`,
        num: 2,
        useful: () =>
          have($familiar`Vampire Vintner`) &&
          have($item`cosmic bowling ball`) &&
          have($item`unwrapped knock-off retro superhero cape`) &&
          (!have($item`Lil' Doctor™ bag`) || get("_chestXRayUsed") >= 3),
      },
      {
        // Backup plan if missing Vintner/bowling ball
        item: $item`yellow rocket`,
        num: 1,
        useful: () =>
          (!have($familiar`Vampire Vintner`) ||
            !have($item`cosmic bowling ball`) ||
            !have($item`unwrapped knock-off retro superhero cape`)) &&
          (!have($item`Lil' Doctor™ bag`) || get("_chestXRayUsed") >= 3),
      },
    ],
    prepare: () => {
      if (
        (equippedAmount($item`unwrapped knock-off retro superhero cape`) === 0 ||
          myFamiliar() !== $familiar`Vampire Vintner`) &&
        !have($item`yellow rocket`) &&
        (equippedAmount($item`Lil' Doctor™ bag`) === 0 || get("_chestXRayUsed") >= 3)
      )
        abort("Not ready for pygmy locket");

      if (initiativeModifier() < 50 && have($item`Clan VIP Lounge key`)) cliExecute("pool stylish");
      if (initiativeModifier() < 50) abort("Not enough init for pygmy locket");
    },
    combat: new CombatStrategy().macro(
      new Macro()
        .trySkill($skill`Chest X-Ray`)
        .tryItem($item`yellow rocket`)
        .tryItem($item`cosmic bowling ball`)
        .step("if hascombatitem 10769;use Arr;endif;") // Arr, M80; "use Arr, M80" trys and fails to funksling
        .step("if hascombatitem 10769;use Arr;endif;")
        .skill($skill`Pseudopod Slap`)
        .repeat()
    ),
    outfit: () => {
      if (have($item`Lil' Doctor™ bag`) && get("_chestXRayUsed") < 3) {
        return {
          modifier: "init",
          equip: $items`Lil' Doctor™ bag, unwrapped knock-off retro superhero cape`,
          modes: { retrocape: ["heck", "hold"] },
        };
      }

      if (
        have($familiar`Vampire Vintner`) &&
        have($item`cosmic bowling ball`) &&
        have($item`unwrapped knock-off retro superhero cape`)
      )
        return {
          modifier: "init",
          equip: $items`unwrapped knock-off retro superhero cape`,
          modes: { retrocape: ["heck", "hold"] },
          familiar: $familiar`Vampire Vintner`,
        };
      else return { modifier: "init, -1ML" }; // Just use yellow rocket
    },
    benefit: 100,
  },
  {
    target: $monster`Spectral Jellyfish`,
    after: [],
    ready: () => atLevel(6),
    completed: () => have($skill`Phase Shift`),
    combat: new CombatStrategy().kill(),
    outfit: {
      equip: $items`unwrapped knock-off retro superhero cape`,
      modes: { retrocape: ["heck", "hold"] },
      modifier: "10 init, moxie",
    },
    benefit: 4,
  },
  {
    target: $monster`anglerbush`,
    after: [],
    completed: () => have($skill`Ponzi Apparatus`),
    combat: new CombatStrategy().kill(),
    benefit: 5,
  },
  {
    target: $monster`Big Wheelin' Twins`,
    after: [],
    ready: () => atLevel(11),
    completed: () => have($skill`Overclocking`),
    combat: new CombatStrategy().kill(),
    benefit: 4,
  },
  {
    target: $monster`white lion`,
    ready: () => have($item`white page`) && have($skill`Double Nanovision`),
    completed: () => have($skill`Piezoelectric Honk`) || inHardcore() || !have($item`white page`),
    choices: { 940: 2 },
    outfit: { modifier: "item", avoid: $items`broken champagne bottle` },
    combat: new CombatStrategy().killItem(),
    benefit: 3,
  },
];

export const GyouQuest: Quest = {
  name: "Gyou",
  tasks: [
    // Additional buffs for +famexp
    {
      name: "Fortune",
      after: [],
      ready: () =>
        ((inHardcore() && myAdventures() < 20 && myTurncount() >= 50) ||
          step("questL11Worship") >= 3) &&
        familiarWeight($familiar`Grey Goose`) < 6,
      completed: () => get("_clanFortuneBuffUsed") || !have($item`Clan VIP Lounge key`),
      do: () => {
        cliExecute("fortune buff susie");
      },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Friar Buff",
      after: ["Friar/Finish", "Macguffin/Desert"], // After the desert to avoid wasting it on the camel
      completed: () => get("friarsBlessingReceived"),
      ready: () => familiarWeight($familiar`Grey Goose`) < 6,
      do: () => {
        cliExecute("friars familiar");
      },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Dog Chow",
      after: [],
      ready: () => have($item`Ghost Dog Chow`) && familiarWeight($familiar`Grey Goose`) < 6,
      completed: () => globalAbsorbState.remainingReprocess().length === 0,
      do: () => {
        use($item`Ghost Dog Chow`);
        if (familiarWeight($familiar`Grey Goose`) < 6 && have($item`Ghost Dog Chow`))
          use($item`Ghost Dog Chow`);
      },
      outfit: { familiar: $familiar`Grey Goose` },
      freeaction: true,
      limit: { soft: 20 },
    },
    {
      name: "Grey Down Vest",
      after: [],
      completed: () =>
        have($item`grey down vest`) ||
        have($item`toy Cupid bow`) ||
        !have($skill`Summon Clip Art`) ||
        get("tomeSummons") >= 3,
      priority: () => Priorities.Free,
      do: () => {
        retrieveItem($item`box of Familiar Jacks`);
        use($item`box of Familiar Jacks`);
      },
      outfit: { familiar: $familiar`Grey Goose` },
      freeaction: true,
      limit: { tries: 1 },
    },
    {
      name: "Gnome Shirt",
      after: [],
      ready: () =>
        (myMeat() >= 11000 || (myMeat() >= 6000 && getWorkshed() === $item`model train set`)) &&
        gnomadsAvailable(),
      completed: () => have($skill`Torso Awareness`),
      priority: () => Priorities.Free,
      freeaction: true,
      do: () => {
        visitUrl("gnomes.php?action=trainskill&whichskill=12");
      },
      limit: { tries: 1 },
    },
    {
      name: "Gnome Items",
      after: ["Gnome Shirt"],
      ready: () => myMeat() >= 11000 && gnomadsAvailable(),
      completed: () => have($skill`Powers of Observatiogn`),
      priority: () => Priorities.Free,
      freeaction: true,
      do: () => {
        visitUrl("gnomes.php?action=trainskill&whichskill=10");
      },
      limit: { tries: 1 },
    },
    {
      name: "Tune from Muscle",
      after: ["Misc/Unlock Beach", "Misc/Bugbear Outfit"],
      ready: () =>
        knollAvailable() &&
        (mySign() !== "Vole" ||
          ((myMaxmp() - numericModifier("Maximum MP") >= 50 ||
            (myMaxmp() - numericModifier("Maximum MP") >= 40 && have($item`birch battery`))) &&
            myMaxhp() - numericModifier("Maximum HP") >= 40 &&
            myMeat() >= 6000)),
      completed: () =>
        !have($item`hewn moon-rune spoon`) ||
        args.minor.tune === undefined ||
        get("moonTuned", false),
      priority: () => Priorities.Free,
      freeaction: true,
      do: () => cliExecute(`spoon ${args.minor.tune}`),
      limit: { tries: 1 },
    },
    {
      name: "Tune from Myst",
      after: [],
      ready: () => canadiaAvailable(),
      completed: () =>
        !have($item`hewn moon-rune spoon`) ||
        args.minor.tune === undefined ||
        get("moonTuned", false),
      priority: () => Priorities.Free,
      freeaction: true,
      do: () => cliExecute(`spoon ${args.minor.tune}`),
      limit: { tries: 1 },
    },
    {
      name: "Tune from Moxie",
      after: ["Gnome Shirt", "Gnome Items"],
      ready: () => gnomadsAvailable(),
      completed: () =>
        !have($item`hewn moon-rune spoon`) ||
        args.minor.tune === undefined ||
        get("moonTuned", false),
      priority: () => Priorities.Free,
      freeaction: true,
      do: () => cliExecute(`spoon ${args.minor.tune}`),
      limit: { tries: 1 },
    },
    {
      name: "Retune Moon",
      after: ["Tune from Muscle", "Tune from Myst", "Tune from Moxie"],
      ready: () => false,
      completed: () =>
        !have($item`hewn moon-rune spoon`) ||
        args.minor.tune === undefined ||
        get("moonTuned", false),
      do: () => false,
      limit: { tries: 1 },
    },
    {
      name: "Mumming Trunk",
      after: [],
      priority: () => Priorities.Free,
      completed: () => !have($item`mumming trunk`) || get("_mummeryUses").includes("2,"),
      do: () => cliExecute("mummery mp"),
      outfit: { familiar: $familiar`Grey Goose` },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Wardrobe-O-Matic",
      priority: () => Priorities.Free,
      ready: () => have($item`wardrobe-o-matic`) && myLevel() >= 20,
      completed: () => have($item`futuristic hat`),
      do: () => use($item`wardrobe-o-matic`),
      limit: { tries: 1 },
      freeaction: true,
    },
    ...gyouPulls.map((s) => getPullTask(s)),
    ...gyouSummons.map((s) => getSummonTask(s)),
  ],
};
function prioritizeJellyfish() {
  // Get the Spectral Jellyfish manually if we cannot summon it
  if (!have($skill`Phase Shift`)) {
    return Priorities.SeekJellyfish;
  } else {
    return Priorities.None;
  }
}
