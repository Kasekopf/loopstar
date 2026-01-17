import { OutfitSpec } from "grimoire-kolmafia";
import { buyUsingStorage, cliExecute, Item, abort, storageAmount, Skill, getWorkshed } from "kolmafia";
import { $effect, $item, AsdonMartin, have } from "libram";

export function pull(item: Item) {
    if (storageAmount(item) === 0) {
        if (buyUsingStorage(item, 1, 15000) === 0) {
            abort(`Unable to buy desired pull item ${item.name}`);
        }
    }
    cliExecute(`pull ${item.name}`);
}

export type WaterBreathSource = {
    name: Item | Skill;
    available?: () => boolean;
    outfit?: OutfitSpec | (() => OutfitSpec);
    do?: () => void;
};

export function getWaterBreathSources(): WaterBreathSource[] {
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

export function doFirstAvailableWaterBreathSource(): boolean {
    for (const source of getWaterBreathSources()) {
        if (source.available?.() ?? true) {
            source.do?.();
            return true;
        }
    }
    return false;
}
