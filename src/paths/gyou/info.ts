import { getTasks, step } from "grimoire-kolmafia";
import { myPath, runChoice, Skill, visitUrl } from "kolmafia";
import { $familiar, $item, $monster, $path, get, set } from "libram";
import { PathInfo } from "../pathinfo";
import { findAndMerge, Task } from "../../engine/task";
import { Engine } from "../../engine/engine";
import { buildPullRequirements, Hardcoded, Requirement, RequirementCategory } from "../../sim";
import { GyouEngine } from "./engine";
import { AbsorbQuest, AdvAbsorbQuest } from "./absorb";
import { MenagerieQuest } from "../aftercore/menagerie";
import { gyouDeltas, gyouPulls, GyouQuest } from "./tasks";
import { gyouRoute } from "./route";
import { args } from "../../args";

export class GyouInfo implements PathInfo {
  name(): string {
    return "Grey You";
  }

  active(): boolean {
    return myPath() === $path`Grey You`;
  }

  finished(): boolean {
    return step("questL13Final") > 11;
  }

  getTasks(tasks: Task[]): Task[] {
    const newTasks = getTasks(
      [AbsorbQuest, MenagerieQuest, GyouQuest, AdvAbsorbQuest],
      false,
      false
    );
    return findAndMerge([...newTasks, ...tasks], gyouDeltas);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getRoute(route: string[]): string[] {
    return gyouRoute;
  }

  getEngine(tasks: Task[]): Engine {
    return new GyouEngine(tasks);
  }

  runIntro() {
    // Clear intro adventure
    set("choiceAdventure1464", 1);
    if (visitUrl("main.php").includes("somewhat-human-shaped mass of grey goo nanites"))
      runChoice(-1);
  }

  getRequirements(reqs: Requirement[]): Requirement[] {
    return [
      ...reqs
        .filter((r) => !(r.thing instanceof Skill))
        .map((r) => {
          if (r.thing === $familiar`Grey Goose`) return { ...r, required: true, why: "Adventures" };
          if (r.thing === $item`Clan VIP Lounge key`) return { ...r, required: true };
          return r;
        }),
      ...buildPullRequirements(gyouPulls),
      {
        thing: $familiar`Vampire Vintner`,
        why: "Pygmy killing",
        category: RequirementCategory.IOTM,
      },
      {
        thing: $item`hewn moon-rune spoon`,
        why: "Access to an extra monster absorb (see tune arg)",
        category: RequirementCategory.IOTM,
      },
      {
        thing: new Hardcoded(get("hasMaydayContract"), "MayDay™ contract"),
        why: "+combat, early meat",
        category: RequirementCategory.IOTM,
      },
      {
        thing: $monster`pygmy witch lawyer`,
        why: "Infinite Loop",
        category: RequirementCategory.Locket,
      },
      {
        thing: $monster`Spectral Jellyfish`,
        why: "-Combat skill",
        category: RequirementCategory.Locket,
      },
      {
        thing: $monster`anglerbush`,
        why: "Meat skill",
        category: RequirementCategory.Locket,
      },
      {
        thing: $monster`Big Wheelin' Twins`,
        why: "Init skill",
        category: RequirementCategory.Locket,
      },
    ];
  }

  args(): string {
    return args.gyou.gyouargs;
  }
}
