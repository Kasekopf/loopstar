import { step } from "grimoire-kolmafia";
import {
  ceil,
  equippedAmount,
  hippyStoneBroken,
  Item,
  itemAmount,
  retrieveItem,
  retrievePrice,
} from "kolmafia";
import {
  $familiar,
  $item,
  $items,
  clamp,
  get,
  have,
  MayamCalendar,
  set,
  undelay,
  withProperty,
} from "libram";
import { atLevel, debug, haveHugeLarge } from "../../lib";
import { Keys, keyStrategy } from "../../tasks/keys";
import { Quest, Task } from "../../engine/task";
import { args, toTempPref } from "../../args";
import { trainSetAvailable } from "../../tasks/misc";

/**
 * what: The item to buy.
 * needed: The amount we need to have. This amount should go
 *    from zero to nonzero at most once during a run.
 * price: The maximum price to spend.
 */
type AcquireSpec = {
  what: Item;
  needed: () => number;
  price: Prices | number | (() => number);
};

/**
 * Symbolic prices, set by arguments (see realizePrice()).
 */
enum Prices {
  Used, // Something consumed during the run
  Permanent, // Something not consumed during the run
  Adventure, // Something to save 1 adventure
}

function realizePrice(price: Prices | number | (() => number)): number {
  switch (price) {
    case Prices.Used:
      return args.casual.usedprice;
    case Prices.Permanent:
      return args.casual.equipprice;
    case Prices.Adventure:
      return get("valueOfAdventure");
    default:
      return undelay(price);
  }
}

const acquireSpecs: AcquireSpec[] = [
  // Leveling
  {
    what: $item`Mmm-brr! brand mouthwash`,
    needed: () => {
      if (atLevel(12)) return 0;
      if (args.resources.saveember >= 6) return 3;
      if (
        have($item`Sept-Ember Censer`) &&
        (get("availableSeptEmbers") - args.resources.saveember >= 2 ||
          !get("_septEmbersCollected", false))
      ) {
        return 0;
      }
      return 3;
    },
    price: Prices.Used,
  },
  // L4
  {
    what: $item`sonar-in-a-biscuit`,
    needed: () => {
      if (step("questL04Bat") >= 3) return 0;
      if (step("questL04Bat") >= 2 || have($item`bat wings`)) return 1;
      if (step("questL04Bat") >= 1) return 2;
      return 3;
    },
    price: Prices.Used,
  },
  // L5
  ...$items`Knob Goblin harem veil, Knob Goblin harem pants`.map(
    (i) =>
      <AcquireSpec>{
        what: i,
        needed: () => (step("questL05Goblin") === 999 ? 0 : 1),
        price: Prices.Permanent,
      }
  ),
  {
    what: $item`Knob Goblin perfume`,
    needed: () => (step("questL05Goblin") === 999 ? 0 : 1),
    price: Prices.Used,
  },
  // L7
  {
    what: $item`gravy boat`,
    needed: () => {
      if (
        get("cyrptAlcoveEvilness") <= 13 &&
        get("cyrptCrannyEvilness") <= 13 &&
        get("cyrptNicheEvilness") <= 13 &&
        get("cyrptNookEvilness") <= 13
      )
        return 0;
      return 1;
    },
    price: Prices.Permanent,
  },
  // L8
  {
    what: $item`goat cheese`,
    needed: () => {
      if (step("questL08Trapper") >= 2) return 0;
      return 3;
    },
    price: Prices.Used,
  },
  ...$items`asbestos ore, chrome ore, linoleum ore`.map(
    (ore) =>
      <AcquireSpec>{
        what: ore,
        needed: () => {
          if (step("questL08Trapper") >= 2) return 0;
          if (get("trapperOre") !== ore) return 0;
          return 3;
        },
        price: Prices.Used,
        limit: 3,
      }
  ),
  ...$items`eXtreme mittens, snowboarder pants, eXtreme scarf`.map(
    (i) =>
      <AcquireSpec>{
        what: i,
        needed: () => {
          if (haveHugeLarge()) return 0;
          if (have($item`McHugeLarge duffel bag`)) return 0;
          if (step("questL08Trapper") >= 3) return 0;
          return 1;
        },
        price: Prices.Permanent,
      }
  ),
  // L9
  {
    what: $item`structural ember`,
    needed: () => {
      if (step("questL09Topping") >= 1) return 0;
      if (get("_structuralEmberUsed")) return 0;
      return 1;
    },
    price: Prices.Used,
  },
  {
    what: $item`snow boards`,
    needed: () => {
      if (step("questL09Topping") >= 1) return 0;
      // Wait for other sources to finish
      if (trainSetAvailable()) return 0;
      if (!get("_structuralEmberUsed")) return 0;
      if (
        MayamCalendar.have() &&
        MayamCalendar.remainingUses() > 0 &&
        MayamCalendar.available("wood")
      )
        return 0;
      const goal = have($item`bat wings`) ? 30 : 25;
      return clamp(ceil((goal - get("chasmBridgeProgress")) / 5), 0, 5);
    },
    price: Prices.Used,
  },
  {
    what: $item`bubblin' crude`,
    needed: () => {
      if (have($item`jar of oil`)) return 0;
      if (get("twinPeakProgress") & 4) return 0;
      return 12;
    },
    price: Prices.Used,
  },
  {
    what: $item`rusty hedge trimmers`,
    needed: () => {
      if (get("twinPeakProgress") === 0) return 0;
      if (get("twinPeakProgress") === 15) return 0;
      return [
        get("twinPeakProgress") & 1,
        get("twinPeakProgress") & 2,
        get("twinPeakProgress") & 4,
        get("twinPeakProgress") & 8,
      ].filter((n) => n === 0).length;
    },
    price: Prices.Used,
  },
  // L10
  {
    what: $item`enchanted bean`,
    needed: () => {
      if (have($item`bat wings`)) return 0;
      if (step("questL10Garbage") >= 1) return 0;
      return 1;
    },
    price: Prices.Used,
  },
  {
    what: $item`amulet of extreme plot significance`,
    needed: () => (step("questL10Garbage") >= 8 ? 0 : 1),
    price: Prices.Permanent,
  },
  {
    what: $item`Mohawk wig`,
    needed: () => (step("questL10Garbage") >= 10 ? 0 : 1),
    price: Prices.Permanent,
  },
  // L11
  {
    what: $item`blackberry galoshes`,
    needed: () => (step("questL11Black") >= 2 ? 0 : 1),
    price: Prices.Permanent,
  },
  // L11 Hidden City
  {
    what: $item`Spooky-Gro fertilizer`,
    needed: () => (step("questM16Temple") === 999 ? 0 : 1),
    price: Prices.Used,
  },
  {
    what: $item`stone wool`,
    needed: () => {
      if (step("questL11Worship") >= 3) return 0;
      if (have($item`the Nostril of the Serpent`)) return 1;
      return 2;
    },
    price: Prices.Used,
  },
  {
    what: $item`antique machete`,
    needed: () => {
      if (step("questL11Worship") < 999) return 1;
      if (
        have($item`unwrapped knock-off retro superhero cape`) &&
        !(
          get("cyrptAlcoveEvilness") <= 13 &&
          get("cyrptCrannyEvilness") <= 13 &&
          get("cyrptNicheEvilness") <= 13 &&
          get("cyrptNookEvilness") <= 13
        )
      )
        return 1;
      return 0;
    },
    price: Prices.Permanent,
  },
  {
    what: $item`bowling ball`,
    needed: () => {
      const timesBowled = get("hiddenBowlingAlleyProgress") - 1;
      return clamp(5 - timesBowled, 0, 5);
    },
    price: Prices.Used,
  },
  ...$items`half-size scalpel, head mirror, surgical mask, surgical apron, bloodied surgical dungarees`.map(
    (i) =>
      <AcquireSpec>{
        what: i,
        needed: () => (get("hiddenHospitalProgress") >= 7 ? 0 : 1),
        price: Prices.Permanent,
      }
  ),
  // L11 Palindome
  {
    what: $item`glark cable`,
    needed: () => {
      if (step("questL11Ron") >= 5) return 0;
      return clamp(5 - get("_glarkCableUses"), 0, 5);
    },
    price: Prices.Adventure,
  },
  {
    what: $item`disposable instant camera`,
    needed: () => {
      if (have($item`photograph of a dog`) || step("questL11Palindome") >= 3) return 0;
      return 1;
    },
    price: Prices.Used,
  },
  {
    what: $item`wet stew`,
    needed: () => {
      if (step("questL11Palindome") < 5 && !have($item`wet stunt nut stew`)) return 1;
      return 0;
    },
    price: Prices.Used,
  },
  {
    what: $item`stunt nuts`,
    needed: () => {
      if (step("questL11Palindome") < 5 && !have($item`wet stunt nut stew`)) return 1;
      return 0;
    },
    price: Prices.Used,
  },
  // L11 Desert
  {
    what: $item`milestone`,
    needed: () => {
      if (args.casual.milestoneprice === 0) return 0;
      return ceil((100 - get("desertExploration")) / 5);
    },
    price: () => args.casual.milestoneprice,
  },
  {
    what: $item`killing jar`,
    needed: () => ((get("gnasirProgress") & 4) === 0 ? 1 : 0),
    price: Prices.Used,
  },
  {
    what: $item`drum machine`,
    needed: () => ((get("gnasirProgress") & 16) === 0 ? 1 : 0),
    price: Prices.Used,
  },
  {
    what: $item`tomb ratchet`,
    needed: () => {
      if (get("pyramidBombUsed")) return 0;
      const ratchetLikes = itemAmount($item`crumbling wooden wheel`);
      const needed = have($item`ancient bomb`) ? 3 : have($item`ancient bronze token`) ? 7 : 10;
      return clamp(needed - ratchetLikes, 0, 10);
    },
    price: Prices.Used,
  },
  // L12
  {
    what: $item`seal tooth`,
    needed: () => {
      if (get("sidequestJunkyardCompleted") !== "none") return 0;
      if (step("questL12War") === 999) return 0;
      return 1;
    },
    price: Prices.Permanent,
  },
  ...$items`beer helmet, distressed denim pants, bejeweled pledge pin`.map(
    (i) =>
      <AcquireSpec>{
        what: i,
        needed: () => (step("questL12War") === 999 ? 0 : 1),
        price: Prices.Permanent,
      }
  ),
  // L13
  ...$items`Pick-O-Matic lockpicks, ring of Detect Boring Doors, eleven-foot pole`.map(
    (i) =>
      <AcquireSpec>{
        what: i,
        needed: () => (get("dailyDungeonDone") ? 0 : 1),
        price: Prices.Permanent,
      }
  ),
  {
    what: $item`daily dungeon malware`,
    needed: () => {
      if (keyStrategy.useful(Keys.Malware) === false) return 0;
      if (get("_dailyDungeonMalwareUsed")) return 0;
      return get("dailyDungeonDone") ? 0 : 1;
    },
    price: Prices.Used,
  },
  {
    what: $item`star chart`,
    needed: () => {
      if (
        have($item`Richard's star key`) ||
        get("nsTowerDoorKeysUsed").includes("Richard's star key")
      )
        return 0;
      return 1;
    },
    price: Prices.Used,
  },
  {
    what: $item`star`,
    needed: () => {
      if (
        have($item`Richard's star key`) ||
        get("nsTowerDoorKeysUsed").includes("Richard's star key")
      )
        return 0;
      return 8;
    },
    price: Prices.Used,
  },
  {
    what: $item`line`,
    needed: () => {
      if (
        have($item`Richard's star key`) ||
        get("nsTowerDoorKeysUsed").includes("Richard's star key")
      )
        return 0;
      return 7;
    },
    price: Prices.Used,
  },
  {
    what: $item`skeleton key`,
    needed: () => {
      if (get("nsTowerDoorKeysUsed").includes("skeleton key")) return 0;
      return 1;
    },
    price: Prices.Used,
  },
  ...$items`Boris's ring, Jarlsberg's earring, Sneaky Pete's breath spray`.map(
    (i) =>
      <AcquireSpec>{
        what: i,
        needed: () => {
          if (keyStrategy.useful(Keys.Zap) && keyStrategy.getZapChoice(0) === i) return 1;
          if (keyStrategy.useful(Keys.Zap2) && keyStrategy.getZapChoice(1) === i) return 1;
          return 0;
        },
        price: 100000,
      }
  ),
  {
    what: $item`gauze garter`,
    needed: () => (step("questL13Final") > 10 ? 0 : 10),
    price: Prices.Used,
  },
  {
    what: $item`Wand of Nagamar`,
    needed: () => (step("questL13Final") > 11 ? 0 : 1),
    price: Prices.Used,
  },
  // Misc Helpful Items
  {
    what: $item`bitchin' meatcar`,
    needed: () => (have($item`Desert Bus pass`) ? 0 : 1),
    price: 5000,
  },
  {
    what: $item`blue plate`,
    needed: () => (have($familiar`Shorter-Order Cook`) ? 1 : 0),
    price: Prices.Permanent,
  },
  {
    what: $item`peppermint parasol`,
    needed: () => {
      if (have($item`Greatest American Pants`) || have($item`navel ring of navel gazing`)) return 0;
      return 1;
    },
    price: Prices.Permanent,
  },
  {
    what: $item`shadow brick`,
    needed: () => clamp(13 - get("_shadowBricksUsed"), 0, 13),
    price: Prices.Adventure,
  },
  {
    what: $item`Spooky VHS Tape`,
    needed: () => {
      if (get("cyrptCrannyEvilness") <= 40) return 0;
      return 1;
    },
    price: Prices.Adventure,
  },
];

export function getAcquireQuest(): Quest {
  return {
    name: "Acquire",
    tasks: acquireSpecs.map(
      (a) =>
        <Task>{
          name: a.what.name,
          completed: () =>
            itemAmount(a.what) + equippedAmount(a.what) >= a.needed() ||
            get(toTempPref(`_failedacquire_${a.what.id}`), false),
          do: () => {
            const needed = a.needed();
            if (needed <= 0) return;
            if (needed <= itemAmount(a.what) + equippedAmount(a.what)) return;
            const maxPrice = realizePrice(a.price);
            const obtained = withProperty("autoBuyPriceLimit", maxPrice, () =>
              retrieveItem(a.what, needed)
            );
            if (!obtained) {
              debug(
                `Unable to acquire ${a.what} at ${maxPrice} (cost per: ${retrievePrice(a.what)})`
              );
              // Do not try to buy it again today;
              // the script can manage without it
              set(toTempPref(`_failedacquire_${a.what.id}`), true);
            }
          },
          freeaction: true,
          limit: {
            // If PvP is on, one might be stolen during the run
            tries: args.minor.pvp || hippyStoneBroken() ? 2 : 1,
          },
        }
    ),
  };
}
