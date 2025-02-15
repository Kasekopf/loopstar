import {
  gametimeToInt,
  getRevision,
  inHardcore,
  Location,
  myAdventures,
  myPath,
  print,
  pullsRemaining,
  runChoice,
  svnAtHead,
  svnExists,
  turnsPlayed,
  visitUrl,
} from "kolmafia";
import { all_tasks } from "./tasks/all";
import { prioritize } from "./route";
import { Engine } from "./engine/engine";
import { convertMilliseconds, debug, getMonsters } from "./lib";
import { $path, get, set, sinceKolmafiaRevision } from "libram";
import { Prioritization } from "./engine/priority";
import { Args, step } from "grimoire-kolmafia";
import { checkRequirements } from "./sim";
import { lastCommitHash } from "./_git_commit";
import { args, toTempPref } from "./args";

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

  printVersionInfo();
  if (args.version) return;

  if (myPath() !== $path`A Shrunken Adventurer am I` && !args.debug.list)
    throw `You are not currently in a Shrunken Adventurer run. Please start one.`;

  const set_time_now = get(time_property, -1) === -1;
  if (set_time_now) set(time_property, gametimeToInt());

  // Clear intro adventure
  set("choiceAdventure1507", 1);
  if (visitUrl("main.php").includes("dense, trackless jungle")) runChoice(-1);

  const tasks = prioritize(all_tasks());
  const engine = new Engine(
    tasks,
    args.debug.ignoretasks?.split(",") ?? [],
    args.debug.completedtasks?.split(",") ?? []
  );
  try {
    if (args.debug.list) {
      listTasks(engine);
      return;
    }

    engine.run(args.debug.actions);

    const remaining_tasks = tasks.filter((task) => !task.completed());
    if (!runComplete()) {
      if (args.debug.actions !== undefined) {
        const next = engine.getNextTask();
        if (next) {
          debug(`Next task: ${next.name}`);
          return;
        }
      }

      debug("Remaining tasks:", "red");
      for (const task of remaining_tasks) {
        if (!task.completed()) debug(`${task.name}`, "red");
      }
      throw `Unable to find available task, but the run is not complete.`;
    }
  } finally {
    engine.propertyManager.resetAll();
  }

  if (step("questL13Final") > 11) {
    print("Shrunken Adventurer complete!", "purple");
  }
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

function runComplete(): boolean {
  return step("questL13Final") > 11 || myPath() !== $path`A Shrunken Adventurer am I`;
}

function printVersionInfo(): void {
  debug(
    `Running loopsmol version [${lastCommitHash ?? "custom-built"}] in KoLmafia r${getRevision()}`
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
  for (const task of engine.tasks) {
    if (task.completed()) {
      debug(`${task.name}: Done`, "blue");
    } else {
      if (engine.available(task)) {
        const priority = Prioritization.from(task);
        const reason = priority.explain();
        const why = reason === "" ? "Route" : reason;
        debug(`${task.name}: Available [${priority.score()}: ${why}]`);
      } else {
        debug(`${task.name}: Not Available`, "red");
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
