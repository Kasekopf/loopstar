import { OutfitSpec } from "grimoire-kolmafia";
import { getWorkshed, Item, Skill } from "kolmafia";
import { $effect, $item, AsdonMartin, have } from "libram";

export type FishySource = {
  name: Item | Skill;
  available?: () => boolean;
  outfit?: OutfitSpec | (() => OutfitSpec);
  do?: () => void;
};

export function getFishySources(): FishySource[] {
  return [
    {
      name: $item`Asdon Martin keyfob (on ring)`,
      available: () => have($item`Asdon Martin keyfob (on ring)`) || getWorkshed() === $item`Asdon Martin keyfob (on ring)`,
      do: () => {
        AsdonMartin.drive($effect`Driving Waterproofly`)
      }
    }
  ]
}

export function doFirstAvailableFishySource(): boolean {
  for (const source of getFishySources()) {
    if (source.available?.() ?? true) {
      source.do?.();
      return true;
    }
  }
  return false;
}
