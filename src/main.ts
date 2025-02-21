import {
  gametimeToInt,
  getRevision,
  inHardcore,
  Location,
  myAdventures,
  myPath,
  print,
  pullsRemaining,
  svnAtHead,
  svnExists,
  turnsPlayed,
} from "kolmafia";
import { basePlan } from "./tasks/all";
import { Engine } from "./engine/engine";
import { convertMilliseconds, debug, getMonsters } from "./lib";
import { get, set, sinceKolmafiaRevision } from "libram";
import { Prioritization } from "./engine/priority";
import { Args, step } from "grimoire-kolmafia";
import { checkRequirements } from "./sim";
import { lastCommitHash } from "./_git_commit";
import { args, toTempPref } from "./args";
import { allPaths } from "./paths/all";
import { SmolInfo } from "./paths/smol/info";
import { getTaggedName, merge } from "./engine/task";
import { allocateResources } from "./engine/allocation";

const time_property = toTempPref("first_start");
const svn_name = "Kasekopf-loop-casual-branches-release";

export function main(command?: string): void {
  sinceKolmafiaRevision(28258);

  Args.fill(args, command);
  if (args.debug.settings) {
    debug(JSON.stringify(args));
    return;
  }
  if (args.help) {
    Args.showHelp(args);
    return;
  }
  if (args.sim) {
    checkRequirements();
    return;
  }
  if (args.debug.verify) {
    // Debugging check
    const path = new SmolInfo();
    const plan = path.getPlan(basePlan);
    const tasks = plan.getTasks();
    const engine = path.getEngine(tasks);
    listTasks(engine);
    return;
  }

  printVersionInfo();
  if (args.version) return;

  const path = allPaths().find((p) => p.getPath() === myPath());
  if (!path) throw `You are currently in a path (${myPath()}) which is not supported.`;

  const set_time_now = get(time_property, -1) === -1;
  if (set_time_now) set(time_property, gametimeToInt());

  path.runIntro();

  // Construct the list of tasks
  const plan = path.getPlan(basePlan);
  const tasks = plan.getTasks();
  const engine = path.getEngine(tasks);
  try {
    if (args.debug.list) {
      listTasks(engine);
      return;
    }

    engine.run(args.debug.actions);

    const remaining_tasks = tasks.filter((task) => !task.completed());
    if (step("questL13Final") <= 11 && myPath() === path.getPath()) {
      if (args.debug.actions !== undefined) {
        const next = engine.getNextTask();
        if (next) {
          debug(`Next task: ${getTaggedName(next)}`);
          return;
        }
      }

      debug("Remaining tasks:", "red");
      for (const task of remaining_tasks) {
        if (!task.completed()) debug(`${getTaggedName(task)}`, "red");
      }
      throw `Unable to find available task, but the run is not complete.`;
    }
  } finally {
    engine.propertyManager.resetAll();
  }

  if (step("questL13Final") > 11) {
    print("Run complete!", "purple");
  }
  print(`   Path: ${path.getPath()}`, "purple");
  print(`   Adventures used: ${turnsPlayed()}`, "purple");
  print(`   Adventures remaining: ${myAdventures()}`, "purple");
  if (set_time_now)
    print(
      `   Time: ${convertMilliseconds(gametimeToInt() - get(time_property, gametimeToInt()))}`,
      "purple"
    );
  else
    print(
      `   Time: ${convertMilliseconds(
        gametimeToInt() - get(time_property, gametimeToInt())
      )} since first run today started`,
      "purple"
    );
  if (inHardcore()) {
    print(`   Pulls used: 0 (Hardcore)`);
  } else {
    print(
      `   Pulls used: ${get(toTempPref("pullsUsed"))} (${pullsRemaining()} remaining)`,
      "purple"
    );
  }
}

function printVersionInfo(): void {
  debug(
    `Running loopstar version [${lastCommitHash ?? "custom-built"}] in KoLmafia r${getRevision()}`
  );
  if (lastCommitHash !== undefined) {
    if (svnExists(svn_name) && !svnAtHead(svn_name))
      debug(
        'A newer version of this script is available and can be obtained with "svn update".',
        "red"
      );
    else if (args.version) {
      debug("This script is up to date.", "red");
    }
  }
}

function listTasks(engine: Engine, show_phyla = false): void {
  engine.updatePlan();
  const resourceAllocations = allocateResources(engine.tasks);
  for (const task of engine.tasks) {
    if (task.completed()) {
      debug(`${task.name}: Done`, "blue");
    } else {
      const allocation = resourceAllocations.get(task.name);
      const allocatedTask = allocation ? merge(task, allocation) : task;
      if (engine.available(allocatedTask)) {
        const priority = Prioritization.from(task);
        const reason = priority.explain();
        const why = reason === "" ? "Route" : reason;
        debug(`${getTaggedName(allocatedTask)}: Available [${priority.score()}: ${why}]`);
      } else {
        debug(`${getTaggedName(allocatedTask)}: Not Available`, "red");
      }
    }

    if (show_phyla) {
      // For eagle planning
      if (task.do instanceof Location) {
        if (task.combat?.can("banish")) {
          for (const monster of getMonsters(task.do)) {
            const strat =
              task.combat.currentStrategy(monster) ?? task.combat.getDefaultAction() ?? "ignore";
            debug(`  * ${strat} ${monster.name} ${monster.phylum}`);
          }
        } else {
          for (const monster of getMonsters(task.do)) {
            const strat =
              task.combat?.currentStrategy(monster) ?? task.combat?.getDefaultAction() ?? "ignore";
            debug(`  * ${strat} ${monster.name} ${monster.phylum}`, "grey");
          }
        }
      }
    }
  }
}
