import { CombatResource as BaseCombatResource, OutfitSpec } from "grimoire-kolmafia";
import { Effect, Familiar, Item } from "kolmafia";

export interface Resource {
  name: string;
  available: () => boolean;
  prepare?: () => void;
  equip?: Item | Familiar | OutfitSpec | OutfitSpec[];
  effect?: Effect;
  chance?: () => number;
}

export type CombatResource = Resource & BaseCombatResource;
