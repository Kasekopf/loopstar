import {
  Familiar,
  gametimeToInt,
  inCasual,
  inHardcore,
  isDarkMode,
  Location,
  myAdventures,
  print,
  pullsRemaining,
  turnsPlayed,
} from "kolmafia";
import { Engine } from "./engine/engine";
import { convertMilliseconds, debug, getMonsters } from "./lib";
import { Args } from "grimoire-kolmafia";
import { checkRequirements } from "./sim";
import { args, toTempPref } from "./args";
import { getTaggedName, merge } from "./engine/task";
import { allocateResources } from "./engine/allocation";
import { allPaths, getActivePath, loadEngine } from "./paths/all";
import { AftercoreInfo } from "./paths/aftercore/info";
import { getAllTasks } from "./tasks/all";
import { getChainSources } from "./resources/wanderer";
import { PathInfo } from "./paths/pathinfo";
import { get } from "libram";

export function debugSettings(command?: string) {
  // Load path-specific arguments as well for the printout
  const path = getActivePath(args.path);
  if (path && path.args()) {
    Args.fill(args, path.args());
    Args.fill(args, command);
  }
  debug(
    JSON.stringify(
      args,
      (key, value) => {
        if (key === "workshed" || key === "swapworkshed") return value.name;
        if (key === "stillsuit") return `${Familiar.get(value.id)}`;
        return value;
      },
      1
    )
  );
}

export function runSim() {
  const path = getActivePath(args.path ?? "casual");
  if (!path) {
    throw `Unknown path ${args.path} for sim`;
  }
  checkRequirements(path);
}

export function debugList(command?: string) {
  const path = getActivePath(args.path);
  if (!path) throw `Unknown path. To list tasks of a specific path, set the "path" arg.`;
  const extraArgs = path.args();
  if (extraArgs) {
    Args.fill(args, extraArgs);
    // reload CLI args again so they always have highest priority.
    Args.fill(args, command);
  }
  const engine = loadEngine(path);
  engine.updatePlan();
  listTasks(engine);
  return;
}

export function debugAllocate(command?: string) {
  const path = getActivePath(args.path);
  if (!path) throw `Unknown path. To allocate tasks of a specific path, set the "path" arg.`;
  const extraArgs = path.args();
  if (extraArgs) {
    Args.fill(args, extraArgs);
    // reload CLI args again so they always have highest priority.
    Args.fill(args, command);
  }
  const engine = loadEngine(path);
  engine.updatePlan();
  allocateResources(engine.tasks, true);
}

export function debugVerify() {
  // Verify that all paths / goals can be loaded without exceptions
  for (const path of allPaths()) {
    debug(`Path ${path.name()}:`);
    path.finished(); // Check this returns
    const engine = loadEngine(path);
    debug(`- Loaded ${engine.tasks.length} tasks`);
  }
  const aftercore = new AftercoreInfo();
  const goalArgSpec = Args.getMetadata(args).spec.aftercore.args.goal;
  const goals = goalArgSpec.options?.map((i) => i[0]) ?? [];
  for (const goal of goals) {
    debug(`Goal ${goal}:`);
    aftercore.finished(goal); // Check this returns
    const engine = aftercore.getEngine(aftercore.getTasks(getAllTasks(), goal));
    debug(`- Loaded ${engine.tasks.length} tasks`);
  }
}

export function listTasks(engine: Engine, show_phyla = false): void {
  engine.updatePlan();
  const resourceAllocations = allocateResources(engine.tasks);
  const chainSources = getChainSources();
  for (const task of engine.tasks) {
    if (task.completed()) {
      debug(`${getTaggedName(task)}: Done`, isDarkMode() ? "yellow" : "blue");
    } else {
      const allocation = resourceAllocations.get(task.name);
      const allocatedTask = allocation ? merge(task, allocation) : task;
      if (engine.available(allocatedTask)) {
        const priority = engine.prioritize(task, chainSources);
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

export function printRemainingTasks(engine: Engine) {
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

export function printCompleteMessage(path: PathInfo): void {
  if (path.name() === "Aftercore") {
    if (path.finished()) {
      print("Goal complete!", "purple");
    }
    print(`Goal: ${args.aftercore.goal}`, "purple");
  } else {
    if (path.finished()) {
      print("Run complete!", "purple");
    }
    print(`   Path: ${path.name()}`, "purple");
  }
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
