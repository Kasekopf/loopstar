import {
  changeMcd,
  cliExecute,
  currentMcd,
  itemAmount,
  mallPrice,
  myBasestat,
  myTurncount,
} from "kolmafia";
import { args } from "../../args";
import { NamedDeltaTask, Quest } from "../../engine/task";
import { $effect, $item, $items, $monster, $skill, $stat, get, have, Macro, undelay } from "libram";
import { PullQuest } from "../../tasks/pulls";
import { OutfitSpec } from "grimoire-kolmafia";
import { CombatStrategy, killMacro } from "../../engine/combat";
import { getSummonTask } from "../../tasks/summons";
import { tryCape } from "../../tasks/level7";
import { fillHp } from "../../engine/moods";
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
  },
  {
    name: "Macguffin/Compass",
    combine: {
      ready: () => {
        if (args.casual.milestoneprice === 0) return true;
        if (mallPrice($item`milestone`) >= args.casual.milestoneprice) return true;
        if (get("desertExploration") > 0) return true; // If something went wrong with the milestones
        return false;
      },
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
  // Skip some unimportant combats
  {
    name: "Tavern/Basement",
    replace: {
      combat: new CombatStrategy()
        .macro(() => {
          const ratchets =
            itemAmount($item`tomb ratchet`) + itemAmount($item`crumbling wooden wheel`);
          const needed = have($item`ancient bomb`) ? 3 : have($item`ancient bronze token`) ? 7 : 10;
          if (!get("pyramidBombUsed") && ratchets < needed) {
            // We failed to buy enough ratchets, we need to kill the kings
            if (have($skill`Saucegeyser`))
              return Macro.while_("!mpbelow 24", Macro.skill($skill`Saucegeyser`));
            else return killMacro(true);
          }
          return new Macro();
        }, $monster`drunken rat king`)
        .ignore(),
    },
    amend: {
      outfit: (oldOutfit) => {
        const ratchets =
          itemAmount($item`tomb ratchet`) + itemAmount($item`crumbling wooden wheel`);
        const needed = have($item`ancient bomb`) ? 3 : have($item`ancient bronze token`) ? 7 : 10;
        if (!get("pyramidBombUsed") && ratchets < needed) {
          // We failed to buy enough ratchets, we need to kill the kings
          return undelay(oldOutfit);
        }
        return { equip: $items`June cleaver`, modifier: "-combat" };
      },
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
          myTurncount() >= 30
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
          myTurncount() >= 30
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
