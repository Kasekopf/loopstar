import { gametimeToInt, getRevision, myPath, svnAtHead, svnExists } from "kolmafia";
import { debug } from "./lib";
import { get, set, sinceKolmafiaRevision } from "libram";
import { Args, step } from "grimoire-kolmafia";
import { lastCommitHash } from "./_git_commit";
import { args, toTempPref } from "./args";
import { getActivePath, loadEngine } from "./paths/all";
import {
  debugAllocate,
  debugList,
  debugSettings,
  debugVerify,
  printCompleteMessage,
  printRemainingTasks,
  runSim,
} from "./info";

const svn_name = "Kasekopf-loopstar-branches-release";

export function main(command?: string): void {
  sinceKolmafiaRevision(28726);

  Args.fill(args, command);

  // Handle informational commands
  if (args.debug.settings) {
    debugSettings(command);
    return;
  }
  if (args.help) {
    Args.showHelp(args);
    return;
  }
  if (args.sim) {
    runSim();
    return;
  }
  if (args.debug.list) {
    debugList(command);
    return;
  }
  if (args.debug.allocate) {
    debugAllocate(command);
    return;
  }
  if (args.debug.verify) {
    debugVerify();
    return;
  }

  printVersionInfo();
  if (args.version) return;

  // Load the engine for this path
  const path = getActivePath();
  if (step("questL13Final") === 999 && !args.aftercore.goal) {
    debug("");
    debug(
      'This script is designed to be run while inside of a run, but your run is complete! Run "loopstar help" for script options.'
    );
    return;
  }
  if (!path) throw `You are currently in a path (${myPath()}) which is not supported.`;
  const extraArgs = path.args();
  if (extraArgs) {
    Args.fill(args, extraArgs);
    // reload CLI args again so they always have highest priority.
    Args.fill(args, command);
  }

  path.runIntro();
  const engine = loadEngine(path);

  // Execute the engine
  if (get(toTempPref("first_start"), -1) === -1) set(toTempPref("first_start"), gametimeToInt());
  set(toTempPref("script_runs"), get(toTempPref("script_runs"), 0) + 1);
  try {
    engine.run(args.debug.actions);
    if (!path.finished() && path.active()) printRemainingTasks(engine);
  } finally {
    engine.propertyManager.resetAll();
  }
  printCompleteMessage(path);
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
