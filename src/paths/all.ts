import { PathInfo } from "./pathinfo";
import { SmolInfo } from "./smol/info";

export function allPaths(): PathInfo[] {
  return [
    new SmolInfo(),
  ]
}
