import { AftercoreInfo } from "./aftercore/info";
import { CasualInfo } from "./casual/info";
import { PathInfo } from "./pathinfo";
import { SmolInfo } from "./smol/info";

export function allPaths(): PathInfo[] {
  return [new SmolInfo(), new CasualInfo(), new AftercoreInfo()];
}
