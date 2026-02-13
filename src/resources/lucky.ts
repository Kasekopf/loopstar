import { itemAmount, use, useSkill } from "kolmafia";
import { $item, $skill, AprilingBandHelmet, AugustScepter, get } from "libram";

type LuckySource = {
  name: string;
  prepare: () => void;
  remaining: () => number;
};

export const luckySources: LuckySource[] = [
  {
    name: "Apriling Saxophone",
    prepare: () => AprilingBandHelmet.play($item`Apriling band saxophone`),
    remaining: () =>
      AprilingBandHelmet.canPlay($item`Apriling band saxophone`)
        ? 3 - get("_aprilBandSaxophoneUses")
        : 0,
  },
  {
    name: "11-leaf clover",
    prepare: () => use($item`11-leaf clover`),
    remaining: () => itemAmount($item`11-leaf clover`),
  },
  {
    name: "August Scepter",
    prepare: () => useSkill($skill`Aug. 2nd: Find an Eleven-Leaf Clover Day`),
    remaining: () => (AugustScepter.canCast(2) ? 1 : 0),
  },
  {
    name: "Heartstone: Luck",
    prepare: () => useSkill($skill`Heartstone: %luck`),
    remaining: () => (!get("heartstoneLuckUnlocked") ? 0 : get("_heartstoneLuckUsed") ? 0 : 1),
  },
];
