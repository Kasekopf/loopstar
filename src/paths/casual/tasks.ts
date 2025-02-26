import {
  changeMcd,
  cliExecute,
  currentMcd,
  drink,
  getWorkshed,
  Item,
  itemAmount,
  mallPrice,
  myBasestat,
  myTurncount,
  toInt,
  visitUrl,
} from "kolmafia";
import { args } from "../../args";
import { NamedDeltaTask, Quest } from "../../engine/task";
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
  AsdonMartin,
  ensureEffect,
  get,
  have,
  Macro,
} from "libram";
import { PullQuest } from "../../tasks/pulls";
import { OutfitSpec, step } from "grimoire-kolmafia";
import { CombatStrategy } from "../../engine/combat";
import { getSummonTask } from "../../tasks/summons";
import { tryCape } from "../../tasks/level7";
import { fillHp } from "../../engine/moods";
import { asdonFualable, tryPlayApriling } from "../../lib";
import { Priorities } from "../../engine/priority";

export const casualDeltas: NamedDeltaTask[] = [
  // Use as many milestones as permitted by price
  {
    name: "Macguffin/Milestone",
    combine: {
      ready: () => {
        if (args.casual.milestoneprice === 0) return false;
        return mallPrice($item`milestone`) < args.casual.milestoneprice;
      },
    },
    replace: {
      limit: { tries: 20 },
    },
  },
  // Do not worry about pulling anything
  ...PullQuest.tasks.map(
    (t) =>
      <NamedDeltaTask>{
        name: `${PullQuest.name}/${t.name}`,
        delete: true,
      }
  ),
  // Avoid using some buffs
  {
    name: "War/Nuns",
    replace: {
      prepare: () => {
        if (have($item`SongBoom™ BoomBox`) && get("boomBoxSong") !== "Total Eclipse of Your Meat")
          cliExecute("boombox meat");
      },
    },
  },
  {
    name: "Tower/Maze",
    replace: {
      effects: [],
    },
  },
  // Save some additional resources for aftercore
  {
    name: "Misc/Eldritch Tentacle",
    delete: true,
  },
  {
    name: "Misc/LOV Tunnel",
    delete: true,
  },
  {
    name: "Misc/Shadow Rift",
    delete: true,
  },
  // No need to setup some tasks
  {
    name: "Giant/Unlock HITS",
    replace: {
      ready: () => false,
    },
  },
  // Prefer to dump wanderers in digital realm
  {
    name: "Digital/Vanya",
    replace: {
      priority: () => {
        if (
          have($item`Everfull Dart Holster`) &&
          !have($effect`Everything Looks Red`) &&
          myTurncount() >= 10
        ) {
          return Priorities.GoodDarts;
        }
        return Priorities.None;
      },
      preferwanderer: true,
    },
  },
  {
    name: "Digital/Fungus",
    replace: {
      priority: () => {
        if (
          have($item`Everfull Dart Holster`) &&
          !have($effect`Everything Looks Red`) &&
          myTurncount() >= 10
        ) {
          return Priorities.GoodDarts;
        }
        return Priorities.None;
      },
      delay: 5,
      preferwanderer: true,
    },
  },
  {
    name: "Digital/Megalo",
    replace: {
      priority: () => {
        if (
          have($item`Everfull Dart Holster`) &&
          !have($effect`Everything Looks Red`) &&
          myTurncount() >= 10
        ) {
          return Priorities.GoodDarts;
        }
        return Priorities.None;
      },
      preferwanderer: true,
    },
  },
  {
    name: "Digital/Hero",
    replace: {
      priority: () => {
        if (
          have($item`Everfull Dart Holster`) &&
          !have($effect`Everything Looks Red`) &&
          myTurncount() >= 10
        ) {
          return Priorities.GoodDarts;
        }
        return Priorities.None;
      },
      delay: 5,
      preferwanderer: true,
    },
  },
  // Only enable -combat once +combat is not needed
  {
    name: "Misc/Horsery",
    replace: {
      after: ["Palindome/Cold Snake"],
    },
  },
];

export const CasualQuest: Quest = {
  name: "Casual",
  tasks: [
    getSummonTask({
      target: $monster`giant swarm of ghuol whelps`,
      after: ["Crypt/Start"],
      ready: () => myBasestat($stat`Muscle`) >= 62,
      completed: () => get("cyrptCrannyEvilness") <= 45, // Only do once
      prepare: () => {
        changeMcd(10);
        fillHp();
      },
      post: () => {
        if (currentMcd() > 0) changeMcd(0);
      },
      outfit: () =>
        <OutfitSpec>{
          equip: tryCape(
            $item`antique machete`,
            $item`gravy boat`,
            $item`unbreakable umbrella`,
            $item`barrel lid`,
            $item`carnivorous potted plant`
          ),
          modifier: "ML",
          modes: { retrocape: ["vampire", "kill"], umbrella: "broken" },
          skipDefaults: true,
        },
      combat: new CombatStrategy()
        .macro(() => {
          const macro = new Macro();
          if (get("spookyVHSTapeMonster") === null) macro.tryItem($item`Spooky VHS Tape`);
          macro.trySkill($skill`Slay the Dead`);
          if (have($skill`Garbage Nova`))
            macro.while_("!mpbelow 50", Macro.skill($skill`Garbage Nova`));
          if (have($skill`Splattersmash`))
            macro.while_("!mpbelow 25", Macro.skill($skill`Splattersmash`));
          if (have($skill`Saucegeyser`))
            macro.while_("!mpbelow 24", Macro.skill($skill`Saucegeyser`));
          return macro;
        })
        .killHard(),
      benefit: 2,
    }),
  ],
};

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
      do: $location`Infernal Rackets Backstage`,
      limit: { soft: 30 },
      outfit: { modifier: "-combat" },
    },
    {
      name: "Unicorn",
      after: ["Arena"],
      completed: () => have($item`Azazel's unicorn`) || step("questM10Azazel") === 999,
      prepare: () => {
        tryPlayApriling("-combat");
        if (getWorkshed() === $item`Asdon Martin keyfob (on ring)` && asdonFualable(37)) {
          AsdonMartin.drive(AsdonMartin.Driving.Stealthily);
        }
      },
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
      combat: new CombatStrategy().kill(
        $monsters`Carbuncle Top, Larry of the Field of Signs, Victor the Insult Comic Hellhound`
      ),
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
