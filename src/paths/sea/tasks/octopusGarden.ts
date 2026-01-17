import {
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $monsters,
  $skill,
  BurningLeaves,
  CursedMonkeyPaw,
  get,
  have,
  Macro,
  set,
  withChoice,
} from "libram";
import { adv1, haveFamiliar, inHardcore, myHash, runCombat, use, visitUrl } from "kolmafia";
import { step } from "grimoire-kolmafia";
import { Quest } from "../../../engine/task";
import { CombatStrategy } from "../../../engine/combat";

export const OctopusGardenTask: Quest = {
  name: "Octopus Garden",
  tasks: [
    {
      name: "Quiet Brawl",
      after: ["Shadow Realm/Remaining Shadow Realm Fights", "Cyber Realm/Finish Cyber Realm"],
      completed: () => !get("ownsSpeakeasy") || get("_speakeasyFreeFights") >= 3,
      do: $location`An Unusually Quiet Barroom Brawl`,
      combat: new CombatStrategy().killHard(),
      outfit: {
        modifier: "item",
        familiar: $familiar`Peace Turkey`,
        equip: $items`Everfull Dart Holster, spring shoes, April Shower Thoughts Shield`,
        avoid: $items`Peridot of Peril`,
      },
      limit: { soft: 11 },
    },
    {
      name: "Pre Flyer",
      after: ["Shadow Realm/Remaining Shadow Realm Fights", "Cyber Realm/Finish Cyber Realm"],
      completed: () =>
        !BurningLeaves.have() ||
        BurningLeaves.numberOfLeaves() < 11 ||
        get("_leafMonstersFought") >= 5,
      do: () => {
        BurningLeaves.burnLeaves(11);
      },
      combat: new CombatStrategy().killHard(),
      outfit: {
        familiar: $familiar`Peace Turkey`,
        equip: $items`Everfull Dart Holster, spring shoes, Monodent of the Sea, April Shower Thoughts Shield, toy Cupid bow`,
      },
      limit: { soft: 11 },
    },
    {
      name: "Dynamite",
      after: ["Pre Flyer"],
      ready: () =>
        inHardcore() &&
        have($item`pocket wish`) &&
        have($item`spitball`) &&
        have($item`Spooky VHS Tape`) &&
        !have($effect`Everything Looks Yellow`),
      completed: () => get("_autosea_gotdynamites", false),
      do: () => {
        visitUrl(`inv_use.php?pwd=${myHash()}&which=3&whichitem=9537`, false, true);
        visitUrl(
          `choice.php?pwd&whichchoice=1267&option=1&wish=to fight a tetched prospector`,
          true,
          true
        );
        visitUrl(`main.php`, false);
        runCombat();
      },
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.trySkill($skill`Darts: Throw at %part1`).tryItem([
            $item`Spooky VHS Tape`,
            $item`spitball`,
          ]);
        })
        .killHard(),
      post: () => set("_autosea_gotdynamites", true),
      limit: { soft: 11 },
      outfit: {
        familiar: $familiar`Peace Turkey`,
        equip: $items`Everfull Dart Holster, spring shoes, Monodent of the Sea, toy Cupid bow`,
      },
    },
    {
      name: "Blast Garden",
      after: ["Quiet Brawl", "Pre Flyer"],
      completed: () =>
        $location`An Octopus's Garden`.turnsSpent >= 1 ||
        get("bigBrotherRescued") ||
        !haveFamiliar($familiar`Patriotic Eagle`),
      do: $location`An Octopus's Garden`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.trySkill($skill`%fn, fire a Red, White and Blue Blast`)
            .trySkill($skill`%fn, let's pledge allegiance to a Zone`)
            .trySkill($skill`McHugeLarge Avalanche`);
        })
        .killFree(),
      peridot: $monster`Neptune Flytrap`,
      outfit: {
        familiar: $familiar`Patriotic Eagle`,
        equip: $items`Everfull Dart Holster, McHugeLarge left ski, Peridot of Peril, April Shower Thoughts shield`,
      },
      limit: { soft: 1 },
    },
    {
      name: "More Garden",
      after: ["Blast Garden"],
      completed: () =>
        have($item`wriggling flytrap pellet`) ||
        step("questS02Monkees") >= 0 ||
        get("rwbMonsterCount") < 1,
      do: $location`An Octopus's Garden`,
      combat: new CombatStrategy().killFree(),
      outfit: {
        familiar: $familiar`Peace Turkey`,
        equip: $items`Everfull Dart Holster, Spring Shoes, April Shower Thoughts shield`,
      },
      limit: { soft: 11 },
    },
    {
      name: "Unlucky Garden",
      after: ["More Garden"],
      completed: () => have($item`wriggling flytrap pellet`) || step("questS02Monkees") >= 0,
      do: $location`An Octopus's Garden`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.trySkill($skill`Sea *dent: Talk to Some Fish`).trySkill(
            $skill`BCZ: Refracted Gaze`
          );
        }, $monsters`octopus gardener, sponge, stranglin' algae`)
        .killFree(),
      outfit: {
        familiar: $familiar`Peace Turkey`,
        equip: $items`Everfull Dart Holster, Spring Shoes, April Shower Thoughts shield, blood cubic zirconia`,
      },
      limit: { soft: 11 },
    },
    {
      name: "Use Wriggling Pellet",
      ready: () => have($item`wriggling flytrap pellet`),
      completed: () => step("questS02Monkees") >= 0,
      do: () => use($item`wriggling flytrap pellet`),
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Turn in Quest",
      ready: () => step("questS02Monkees") == 0,
      completed: () => step("questS02Monkees") > 0,
      do: () => {
        visitUrl("monkeycastle.php?who=1");
      },
      outfit: {
        familiar: $familiar`red-nosed snapper`,
        pants: $item`really, really nice swimming trunks`,
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Do Wreck",
      ready: () => step("questS02Monkees") == 1,
      completed: () => step("questS02Monkees") > 1,
      do: () => {
        withChoice(299, 1, () => adv1($location`The Wreck of the Edgar Fitzsimmons`));
      },
      outfit: {
        modifier: "mp",
        avoid: $items`Peridot of Peril`,
        familiar: $familiar`red-nosed snapper`,
        pants: $item`really, really nice swimming trunks`,
      },
      peridot: $monster`holy diver`,
      limit: { soft: 11 },
    },
    {
      name: "Talk to brothers",
      ready: () => get("bigBrotherRescued"),
      completed: () => step("questS02Monkees") >= 4,
      do: () => {
        visitUrl("monkeycastle.php?who=1");
        visitUrl("monkeycastle.php?who=2");
        visitUrl("monkeycastle.php?who=1");
      },
      outfit: {
        familiar: $familiar`red-nosed snapper`,
        pants: $item`really, really nice swimming trunks`,
      },
      freeaction: true,
      limit: { soft: 11 },
    },
    {
      name: "Acquire shark jumper",
      after: ["Talk to brothers"],
      completed: () => have($item`shark jumper`) || !CursedMonkeyPaw.have(),
      do: () => CursedMonkeyPaw.wishFor($item`shark jumper`),
      freeaction: true,
      limit: { soft: 11 },
    },
  ],
};
