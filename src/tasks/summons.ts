import {
  canFaxbot,
  chatPrivate,
  cliExecute,
  isOnline,
  itemAmount,
  Monster,
  myMeat,
  reverseNumberology,
  runCombat,
  use,
  visitUrl,
  wait,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $items,
  $monster,
  $skill,
  CombatLoversLocket,
  get,
  have,
  Macro,
} from "libram";
import { CombatStrategy } from "../engine/combat";
import { debug, underStandard } from "../lib";
import { args } from "../args";
import { Quest, Task } from "../engine/task";
import { step } from "grimoire-kolmafia";
import { yellowRayPossible } from "../engine/resources";
import { Priorities } from "../engine/priority";
import { fillHp } from "../engine/moods";
import { oresNeeded } from "./level8";

type SummonTarget = Omit<Task, "do" | "name" | "limit"> & {
  target: Monster;
  tries?: number;
};
const summonTargets: SummonTarget[] = [
  {
    target: $monster`War Frat 151st Infantryman`,
    priority: () => Priorities.Start,
    completed: () =>
      have($item`beer helmet`) &&
      have($item`distressed denim pants`) &&
      have($item`bejeweled pledge pin`),
    after: [],
    outfit: {
      equip: $items`unwrapped knock-off retro superhero cape`,
      modes: { retrocape: ["heck", "hold"] },
      avoid: $items`carnivorous potted plant`,
    },
    combat: new CombatStrategy().yellowRay(),
  },
  {
    target: $monster`mountain man`,
    after: [],
    ready: () =>
      myMeat() >= 1000 &&
      // YR the War frat first
      have($item`beer helmet`) &&
      have($item`distressed denim pants`) &&
      have($item`bejeweled pledge pin`),
    completed: () => oresNeeded() === 0,
    priority: () => (have($effect`Everything Looks Yellow`) ? Priorities.BadYR : Priorities.None),
    outfit: () => {
      if (yellowRayPossible())
        return {
          equip: $items`unwrapped knock-off retro superhero cape`,
          modes: { retrocape: ["heck", "hold"] },
          avoid: $items`carnivorous potted plant`,
        };
      else
        return {
          equip: $items`unwrapped knock-off retro superhero cape`,
          modes: { retrocape: ["heck", "hold"] },
          modifier: "item",
        };
    },
    combat: new CombatStrategy().yellowRay().macro(() => {
      const result = new Macro();
      if (have($effect`Everything Looks Yellow`)) {
        if (!have($item`Spooky VHS Tape`)) result.trySkill($skill`Feel Envy`);
        if (!have($skill`Feel Envy`) || get("_feelEnvyUsed"))
          result.tryItem($item`Spooky VHS Tape`);
      }
      return result;
    }),
    tries: 3,
  },
  {
    target: $monster`Astrologer of Shub-Jigguwatt`,
    after: [],
    completed: () =>
      have($item`star chart`) ||
      have($item`Richard's star key`) ||
      get("nsTowerDoorKeysUsed").includes("Richard's star key") ||
      !have($item`Cargo Cultist Shorts`) ||
      get("_cargoPocketEmptied"),
    prepare: () => {
      fillHp();
    },
    outfit: { equip: $items`June cleaver` },
    combat: new CombatStrategy()
      .macro(Macro.trySkill($skill`Micrometeorite`).trySkill($skill`Curse of Weaksauce`))
      .kill(),
  },
  {
    target: $monster`Astronomer`,
    after: ["Astrologer Of Shub-Jigguwatt"],
    completed: () =>
      have($item`star chart`) ||
      have($item`Richard's star key`) ||
      get("nsTowerDoorKeysUsed").includes("Richard's star key"),
    combat: new CombatStrategy().kill(),
  },
  {
    target: $monster`Astronomer`,
    after: [],
    ready: () => !have($item`Cargo Cultist Shorts`) || get("_cargoPocketEmptied"),
    completed: () =>
      have($item`star chart`) ||
      have($item`Richard's star key`) ||
      get("nsTowerDoorKeysUsed").includes("Richard's star key"),
    combat: new CombatStrategy().kill(),
  },
  {
    target: $monster`Camel's Toe`,
    after: [],
    priority: () => {
      if (!have($familiar`Melodramedary`)) return Priorities.None;
      if (get("camelSpit") < 100) return Priorities.BadCamel;
      return Priorities.GoodCamel;
    },
    completed: () =>
      get("lastCopyableMonster") === $monster`Camel's Toe` ||
      (itemAmount($item`star`) >= 8 && itemAmount($item`line`) >= 7) ||
      have($item`Richard's star key`) ||
      get("nsTowerDoorKeysUsed").includes("Richard's star key"),
    outfit: () => {
      if (get("camelSpit") === 100)
        return {
          modifier: "item",
          familiar: $familiar`Melodramedary`,
          avoid: $items`carnivorous potted plant`,
        };
      return { modifier: "item" };
    },
    combat: new CombatStrategy().macro(Macro.trySkill($skill`%fn, spit on them!`)).killItem(),
  },
  {
    target: $monster`Baa'baa'bu'ran`,
    after: [],
    completed: () =>
      itemAmount($item`stone wool`) >= 2 ||
      (itemAmount($item`stone wool`) === 1 && have($item`the Nostril of the Serpent`)) ||
      step("questL11Worship") >= 3,
    outfit: { modifier: "item" },
    combat: new CombatStrategy().killItem(),
  },
];

type SummonSource = {
  name: string;
  available: () => number;
  ready?: () => boolean;
  canFight: (mon: Monster) => boolean;
  summon: (mon: Monster) => void;
};
const summonSources: SummonSource[] = [
  {
    name: "Numberology",
    available: () => {
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
      CombatLoversLocket.have() ? CombatLoversLocket.reminiscesLeft() - args.minor.savelocket : 0,
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
        args.minor.fax &&
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

class SummonStrategy {
  targets: SummonTarget[];
  sources: SummonSource[];
  plan = new Map<Monster, SummonSource>();

  constructor(targets: SummonTarget[], sources: SummonSource[]) {
    this.targets = targets;
    this.sources = sources;
  }

  public update(): void {
    this.plan.clear();
    const targets = this.targets.filter((t) => !t.completed()).map((t) => t.target);
    for (const source of this.sources) {
      let available = source.available();
      for (const target of targets) {
        if (available > 0 && !this.plan.has(target) && source.canFight(target)) {
          this.plan.set(target, source);
          available -= 1;
        }
      }
    }
  }

  public getSourceFor(monster: Monster): SummonSource | undefined {
    return this.plan.get(monster);
  }

  public sourceReadyFor(monster: Monster): boolean {
    const source = this.getSourceFor(monster);
    if (source === undefined) return false;
    if (source.ready === undefined) return true;
    return source.ready();
  }
}
export const summonStrategy = new SummonStrategy(summonTargets, summonSources);

export const SummonQuest: Quest = {
  name: "Summon",
  tasks: summonTargets.map((task): Task => {
    return {
      ...task,
      name: task.target.name.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase()), // capitalize first letter of each word
      ready: () => (task.ready?.() ?? true) && summonStrategy.sourceReadyFor(task.target),
      do: () => {
        // Perform the actual summon
        const source = summonStrategy.getSourceFor(task.target);
        if (source) {
          debug(`Summon source: ${source.name}`);
          source.summon(task.target);
        } else throw `Unable to find summon source for ${task.target.name}`;
        runCombat();
      },
      limit: { tries: task.tries ?? 1 },
    };
  }),
};
