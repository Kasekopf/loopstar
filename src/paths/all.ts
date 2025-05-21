import { orderByRoute, verifyDependencies } from "grimoire-kolmafia";
import { args } from "../args";
import { Engine } from "../engine/engine";
import { findAndMerge, NamedDeltaTask } from "../engine/task";
import { baseRoute } from "../route";
import { AftercoreInfo } from "./aftercore/info";
import { CasualInfo } from "./casual/info";
import { PathInfo } from "./pathinfo";
import { SmolInfo } from "./smol/info";
import { getAllTasks } from "../tasks/all";
import { GyouInfo } from "./gyou/info";
import { BorisInfo } from "./boris/info";

const pathInfos = {
  smol: new SmolInfo(),
  casual: new CasualInfo(),
  aftercore: new AftercoreInfo(),
  gyou: new GyouInfo(),
  boris: new BorisInfo(),
} as const;

export function getActivePath(overridePath: string | undefined = undefined): PathInfo | undefined {
  if (overridePath) {
    const override = new Map(Object.entries(pathInfos)).get(overridePath);
    if (override) return override;
  }
  return Object.values(pathInfos).find((p) => p.active());
}

export function allPaths(): PathInfo[] {
  return Object.values(pathInfos);
}

export function loadEngine(path: PathInfo): Engine {
  const customizedTasks = path.getTasks(getAllTasks());
  verifyDependencies(customizedTasks);

  const softTunedTasks = customizedTasks.map((t) => {
    if (t.limit.soft && args.minor.luck !== 1)
      return { ...t, limit: { ...t.limit, soft: t.limit.soft * args.minor.luck } };
    return t;
  });

  const ignoreTasks = args.debug.ignoretasks?.split(",") ?? [];
  const completedTasks = args.debug.completedtasks?.split(",") ?? [];
  const deltas = [
    ...ignoreTasks.map(
      (name) =>
        <NamedDeltaTask>{
          name: name.trim().replace('"', ""),
          replace: {
            ready: () => false,
          },
          tag: "ignoretasks",
        }
    ),
    ...completedTasks.map(
      (name) =>
        <NamedDeltaTask>{
          name: name.trim().replace('"', ""),
          replace: {
            completed: () => true,
          },
          tag: "completedtasks",
        }
    ),
  ];
  const tasksAfterIgnoreCompleted = findAndMerge(softTunedTasks, deltas, undefined, true);

  const route = path.getRoute(baseRoute);
  const routeOrderedTasks = orderByRoute(tasksAfterIgnoreCompleted, route, false);
  return path.getEngine(routeOrderedTasks);
}
