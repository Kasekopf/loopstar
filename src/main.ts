import {
  gametimeToInt,
  getRevision,
  inCasual,
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
import { getTaggedName, merge } from "./engine/task";
import { allocateResources } from "./engine/allocation";
import { allPaths, getActivePath } from "./paths/all";
import { PathInfo } from "./paths/pathinfo";
import { AftercoreInfo } from "./paths/aftercore/info";

const svn_name = "Kasekopf-loop-casual-branches-release";

export function main(command?: string): void {
  sinceKolmafiaRevision(28258);

  Args.fill(args, command);

  // Handle informational commands
  if (args.debug.settings) {
    debug(JSON.stringify(args));
    return;
  }
  if (args.help) {
    Args.showHelp(args);
    return;
  }
  if (args.sim) {
    const path = getActivePath(args.path ?? "casual");
    if (!path) {
      throw `Unknown path ${args.path} for sim`;
    }
    checkRequirements(path);
    return;
  }
  if (args.debug.list) {
    const path = getActivePath(args.path);
    if (!path) throw `Unknown path. To list tasks of a specific path, set the "path" arg.`;
    const engine = path.load(basePlan.getTasks());
    engine.updatePlan();
    listTasks(engine);
    return;
  }
  if (args.debug.allocate) {
    const path = getActivePath(args.path);
    if (!path) throw `Unknown path. To allocate tasks of a specific path, set the "path" arg.`;
    const engine = path.load(basePlan.getTasks());
    engine.updatePlan();
    allocateResources(engine.tasks, true);
    return;
  }
  if (args.debug.verify) {
    // Verify that all paths / goals can be loaded without exceptions
    for (const path of allPaths()) {
      const engine = path.load(basePlan.getTasks());
      debug(`${path.name()}: Loaded ${engine.tasks.length} tasks`);
    }
    const aftercore = new AftercoreInfo();
    for (const goal of ["level", "organ"]) {
      const engine = aftercore.getEngine(aftercore.getTasks(basePlan.getTasks(), goal));
      debug(`${goal}: Loaded ${engine.tasks.length} tasks`);
    }
    return;
  }

  printVersionInfo();
  if (args.version) return;

  // Load the engine for this path
  const path = getActivePath();
  if (step("questL13Final") > 11 && !args.aftercore.goal) {
    debug("");
    debug(
      'This script is designed to be run while inside of a run, but your run is complete! Run "loopstar help" for script options.'
    );
    return;
  }
  if (!path) throw `You are currently in a path (${myPath()}) which is not supported.`;
  path.runIntro();
  const baseTasks = basePlan.getTasks();
  const engine = path.load(baseTasks);

  // Execute the engine
  if (get(toTempPref("first_start"), -1) === -1) set(toTempPref("first_start"), gametimeToInt());
  set(toTempPref("script_runs"), get(toTempPref("script_runs"), 0) + 1);
  try {
    engine.run(args.debug.actions);
    if (step("questL13Final") <= 11 && path.active()) printRemainingTasks(engine);
  } finally {
    engine.propertyManager.resetAll();
  }
  printCompleteMessage(path);
}

function printCompleteMessage(path: PathInfo): void {
  if (step("questL13Final") > 11) {
    print("Run complete!", "purple");
  }
  print(`   Path: ${path.name()}`, "purple");
  print(`   Adventures used: ${turnsPlayed()}`, "purple");
  print(`   Adventures remaining: ${myAdventures()}`, "purple");

  const time = convertMilliseconds(
    gametimeToInt() - get(toTempPref("first_start"), gametimeToInt())
  );
  const attempts = get(toTempPref("script_runs"), 1);
  if (attempts === 1) print(`   Time: ${time} `, "purple");
  else print(`   Time: ${time} (over ${attempts} script runs)`, "purple");
  if (inHardcore() || inCasual()) {
    print(`   Pulls used: 0`);
  } else {
    print(
      `   Pulls used: ${get(toTempPref("pullsUsed"))} (${pullsRemaining()} remaining)`,
      "purple"
    );
  }
}

function printVersionInfo(): void {
  debug(
    `Running loopstar version[${lastCommitHash ?? "custom-built"}] in KoLmafia r${getRevision()} `
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
      debug(`${getTaggedName(task)}: Done`, "blue");
    } else {
      const allocation = resourceAllocations.get(task.name);
      const allocatedTask = allocation ? merge(task, allocation) : task;
      if (engine.available(allocatedTask)) {
        const priority = Prioritization.from(task);
        const reason = priority.explain();
        const why = reason === "" ? "Route" : reason;
        debug(`${getTaggedName(allocatedTask)}: Available[${priority.score()}: ${why}]`);
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
            debug(`  * ${strat} ${monster.name} ${monster.phylum} `);
          }
        } else {
          for (const monster of getMonsters(task.do)) {
            const strat =
              task.combat?.currentStrategy(monster) ?? task.combat?.getDefaultAction() ?? "ignore";
            debug(`  * ${strat} ${monster.name} ${monster.phylum} `, "grey");
          }
        }
      }
    }
  }
}

function printRemainingTasks(engine: Engine) {
  const remaining_tasks = engine.tasks.filter((task) => !task.completed());
  if (args.debug.actions !== undefined) {
    const next = engine.getNextTask();
    if (next) {
      debug(`Next task: ${getTaggedName(next)} `);
      return;
    }
  }

  debug("Remaining tasks:", "red");
  for (const task of remaining_tasks) {
    if (!task.completed()) debug(`${getTaggedName(task)} `, "red");
  }
  throw `Unable to find available task, but the run is not complete.`;
}
