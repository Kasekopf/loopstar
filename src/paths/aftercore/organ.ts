import { step } from "grimoire-kolmafia";
import { drink, getWorkshed, haveEquipped, Item, itemAmount, toInt, visitUrl } from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $monsters,
  $skill,
  AsdonMartin,
  ensureEffect,
  have,
  Macro,
} from "libram";
import { CombatStrategy, killMacro } from "../../engine/combat";
import { Priorities } from "../../engine/priority";
import { Quest } from "../../engine/task";
import { asdonFualable, tryPlayApriling } from "../../lib";

export const OrganQuest: Quest = {
  name: "Organ",
  tasks: [
    {
      name: "Start",
      after: ["Friar/Finish"],
      completed: () => step("questM10Azazel") >= 0,
      do: (): void => {
        visitUrl("pandamonium.php?action=temp");
        visitUrl("pandamonium.php?action=sven");
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Tutu",
      after: ["Start"],
      completed: () => have($item`Azazel's tutu`) || step("questM10Azazel") === 999,
      acquire: [
        { item: $item`imp air`, num: 5 },
        { item: $item`bus pass`, num: 5 },
      ],
      do: () => visitUrl("pandamonium.php?action=moan"),
      limit: { tries: 2 },
      freeaction: true,
    },
    {
      name: "Arena",
      after: ["Start"],
      completed: (): boolean => {
        if (step("questM10Azazel") === 999) return true;
        if (have($item`Azazel's unicorn`)) return true;

        const count = (items: Item[]) => items.reduce((sum, item) => sum + itemAmount(item), 0);
        if (count($items`giant marshmallow, beer-scented teddy bear, gin-soaked blotter paper`) < 2)
          return false;
        if (count($items`booze-soaked cherry, comfy pillow, sponge cake`) < 2) return false;
        return true;
      },
      priority: () => {
        if (have($item`Everfull Dart Holster`) && !have($effect`Everything Looks Red`)) {
          return Priorities.GoodDarts;
        }
        return Priorities.None;
      },
      combat: new CombatStrategy().macro(() => {
        if (haveEquipped($item`Everfull Dart Holster`) && !have($effect`Everything Looks Red`))
          return killMacro();
        return new Macro();
      }),
      prepare: () => {
        tryPlayApriling("-combat");
      },
      do: $location`Infernal Rackets Backstage`,
      limit: { soft: 30 },
      outfit: { modifier: "-combat" },
    },
    {
      name: "Unicorn",
      after: ["Arena"],
      completed: () => have($item`Azazel's unicorn`) || step("questM10Azazel") === 999,
      do: (): void => {
        const goals: { [name: string]: Item[] } = {
          Bognort: $items`giant marshmallow, gin-soaked blotter paper`,
          Stinkface: $items`beer-scented teddy bear, gin-soaked blotter paper`,
          Flargwurm: $items`booze-soaked cherry, sponge cake`,
          Jim: $items`comfy pillow, sponge cake`,
        };
        visitUrl("pandamonium.php?action=sven");
        for (const member of Object.keys(goals)) {
          if (goals[member].length === 0) throw `Unable to solve Azazel's arena quest`;
          const item = have(goals[member][0]) ? toInt(goals[member][0]) : toInt(goals[member][1]);
          visitUrl(`pandamonium.php?action=sven&bandmember=${member}&togive=${item}&preaction=try`);
        }
      },
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Comedy Club",
      after: ["Start"],
      completed: () => have($item`observational glasses`),
      priority: () => {
        if (have($item`Everfull Dart Holster`) && !have($effect`Everything Looks Red`)) {
          return Priorities.GoodDarts;
        }
        return Priorities.None;
      },
      prepare: () => {
        tryPlayApriling("+combat");
        if (getWorkshed() === $item`Asdon Martin keyfob (on ring)` && asdonFualable(37)) {
          AsdonMartin.drive(AsdonMartin.Driving.Obnoxiously);
        }
        if (have($item`autumn leaf`)) {
          ensureEffect($effect`Crunching Leaves`);
        }
      },
      do: $location`The Laugh Floor`,
      outfit: {
        modifier: "+combat",
        familiar: $familiar`Jumpsuited Hound Dog`,
      },
      orbtargets: () => [],
      combat: new CombatStrategy()
        .killHard(
          $monsters`Carbuncle Top, Larry of the Field of Signs, Victor the Insult Comic Hellhound`
        )
        .macro(() => {
          if (haveEquipped($item`Everfull Dart Holster`) && !have($effect`Everything Looks Red`))
            return killMacro();
          return new Macro();
        }, $monsters`BL Imp, CH Imp, Pr Imp`),
      limit: { soft: 30 },
    },
    {
      name: "Lollipop",
      after: ["Comedy Club"],
      completed: () => have($item`Azazel's lollipop`) || step("questM10Azazel") === 999,
      do: () => visitUrl("pandamonium.php?action=mourn&preaction=observe"),
      outfit: { equip: $items`observational glasses` },
      limit: { tries: 1 },
    },
    {
      name: "Azazel",
      after: ["Tutu", "Unicorn", "Lollipop"],
      completed: () => step("questM10Azazel") === 999,
      do: () => visitUrl("pandamonium.php?action=temp"),
      limit: { tries: 1 },
    },
    {
      name: "Finish",
      after: ["Azazel"],
      completed: () => have($skill`Liver of Steel`),
      do: () => drink($item`steel margarita`),
      limit: { tries: 1 },
      freeaction: true,
    },
  ],
};
