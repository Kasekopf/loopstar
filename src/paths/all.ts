import { AftercoreInfo } from "./aftercore/info";
import { CasualInfo } from "./casual/info";
import { PathInfo } from "./pathinfo";
import { SmolInfo } from "./smol/info";

const pathInfos = {
  smol: new SmolInfo(),
  casual: new CasualInfo(),
  aftercore: new AftercoreInfo(),
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
