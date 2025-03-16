import {
  canFaxbot,
  chatPrivate,
  cliExecute,
  isOnline,
  Monster,
  reverseNumberology,
  use,
  visitUrl,
  wait,
} from "kolmafia";
import { $item, $monster, $skill, CombatLoversLocket, get, have } from "libram";
import { args } from "../args";
import { underStandard } from "../lib";

type SummonSource = {
  name: string;
  available: () => number;
  ready?: () => boolean;
  canFight: (mon: Monster) => boolean;
  summon: (mon: Monster) => void;
};
export const summonSources: SummonSource[] = [
  {
    name: "Numberology",
    available: () => {
      if (!have($skill`Calculate the Universe`)) return 0;
      if (get("skillLevel144") === 0) return 0;
      if (get("_universeCalculated") === 3) return 0;
      return get("_universeCalculated") < get("skillLevel144") ? 1 : 0;
    },
    ready: () => Object.values(reverseNumberology()).includes(51),
    canFight: (mon: Monster) => mon === $monster`War Frat 151st Infantryman`, // Only use for war frat
    summon: () => cliExecute("numberology 51"),
  },
  {
    name: "White Page",
    available: () => (have($item`white page`) ? 1 : 0),
    canFight: (mon: Monster) => mon === $monster`white lion`,
    summon: () => use($item`white page`),
  },
  {
    name: "Combat Locket",
    available: () =>
      CombatLoversLocket.have()
        ? CombatLoversLocket.reminiscesLeft() - args.resources.savelocket
        : 0,
    canFight: (mon: Monster) => CombatLoversLocket.availableLocketMonsters().includes(mon),
    summon: (mon: Monster) => CombatLoversLocket.reminisce(mon),
  },
  {
    name: "Cargo Shorts",
    available: () => (have($item`Cargo Cultist Shorts`) && !get("_cargoPocketEmptied") ? 1 : 0),
    canFight: (mon: Monster) => mon === $monster`Astrologer of Shub-Jigguwatt`,
    summon: (mon: Monster) => {
      if (mon === $monster`Astrologer of Shub-Jigguwatt`) {
        cliExecute("cargo 533");
        use($item`greasy desk bell`);
      }
    },
  },
  {
    name: "Fax",
    available: () => {
      if (
        args.resources.fax &&
        !underStandard() &&
        !get("_photocopyUsed") &&
        have($item`Clan VIP Lounge key`)
      )
        return 1;
      return 0;
    },
    canFight: (mon: Monster) => canFaxbot(mon),
    summon: (mon: Monster) => {
      // Default to CheeseFax unless EasyFax is the only faxbot online
      const faxbot =
        ["OnlyFax", "CheeseFax", "EasyFax"].find((bot) => isOnline(bot)) ?? "CheeseFax";
      for (let i = 0; i < 6; i++) {
        if (i % 3 === 0) chatPrivate(faxbot, mon.name);
        wait(10 + i);
        if (checkFax(mon)) break;
      }
      if (!checkFax(mon)) {
        if (!isOnline(faxbot))
          throw `Failed to acquire photocopied ${mon.name}. Faxbot ${faxbot} appears to be offline.`;
        throw `Failed to acquire photocopied ${mon.name} but ${faxbot} is online.`;
      }
      use($item`photocopied monster`);
    },
  },
  {
    name: "Wish",
    available: () => (have($item`genie bottle`) ? 3 - get("_genieWishesUsed") : 0),
    canFight: () => true,
    summon: (mon: Monster) => {
      cliExecute(`genie monster ${mon.name}`);
      visitUrl("main.php");
    },
  },
];

// From garbo
function checkFax(mon: Monster): boolean {
  if (!have($item`photocopied monster`)) cliExecute("fax receive");
  if (get("photocopyMonster") === mon) return true;
  cliExecute("fax send");
  return false;
}
