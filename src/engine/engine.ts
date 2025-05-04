import {
  autosell,
  availableAmount,
  canAdventure,
  descToItem,
  Effect,
  equip,
  equippedItem,
  familiarEquippedEquipment,
  getWorkshed,
  haveEffect,
  haveEquipped,
  inCasual,
  Location,
  logprint,
  myAdventures,
  myFamiliar,
  myHp,
  myLevel,
  myMaxhp,
  myMaxmp,
  myMeat,
  myMp,
  myTurncount,
  numericModifier,
  print,
  printHtml,
  restoreHp,
  Slot,
  totalTurnsPlayed,
  toUrl,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
import { getTaggedName, hasDelay, merge, Task } from "./task";
import {
  $effect,
  $effects,
  $item,
  $items,
  $location,
  $locations,
  $monster,
  $skill,
  $slot,
  CrepeParachute,
  get,
  getTodaysHolidayWanderers,
  have,
  Macro,
  PropertiesManager,
  set,
  undelay,
  uneffect,
} from "libram";
import {
  Engine as BaseEngine,
  CombatResources,
  CombatStrategy,
  EngineOptions,
  Outfit,
} from "grimoire-kolmafia";
import { CombatActions, MyActionDefaults, replaceActions } from "./combat";
import {
  cacheDress,
  equipCharging,
  equipDefaults,
  equipFirst,
  equipInitial,
  equipUntilCapped,
  fixFoldables,
  getModifiersFrom,
} from "./outfit";
import { cliExecute, equippedAmount, itemAmount, runChoice } from "kolmafia";
import { debug, getMacro, stableSort } from "../lib";
import { refillLatte } from "../resources/runaway";
import { shouldFinishLatte } from "../resources/runaway";
import { Priorities, Prioritization } from "./priority";
import { args, toTempPref } from "../args";
import { flyersDone } from "../lib";
import { globalStateCache } from "./state";
import { removeTeleportitis, teleportitisTask } from "../tasks/misc";
import { keyStrategy } from "../tasks/keys";
import { applyEffects, customRestoreMp } from "./moods";
import { ROUTE_WAIT_TO_NCFORCE } from "../route";
import { unusedBanishes } from "../resources/banish";
import { CombatResource } from "../resources/lib";
import {
  canChargeVoid,
  ChainSource,
  getChainSources,
  wandererSources,
} from "../resources/wanderer";
import { getRunawaySources } from "../resources/runaway";
import { freekillSources } from "../resources/freekill";
import { forceItemSources, yellowRaySources } from "../resources/yellowray";
import { forceNCPossible, forceNCSources } from "../resources/forcenc";
import { getActiveBackupTarget } from "../resources/backup";
import { allocateResources, UNALLOCATED } from "./allocation";
import { warCleared } from "../tasks/level12";
import { swapperSources } from "../resources/swappers";

export type ActiveTask = Task & {
  activePriority?: Prioritization;
  otherEffects?: Effect[];
  availableTasks?: Task[];
};

export class Engine extends BaseEngine<CombatActions, ActiveTask> {
  constructor(tasks: Task[], options: EngineOptions<CombatActions, ActiveTask> = {}) {
    if (!options.combat_defaults) options.combat_defaults = new MyActionDefaults();
    super(tasks, options);
  }

  public override getNextTask(): ActiveTask | undefined {
    this.updatePlan();

    if (myAdventures() === 0) {
      // Try to generate adv, or die
      return this.tasks.find((task) => task.withnoadventures && this.available(task));
    }

    const resourcesAllocated = allocateResources(this.tasks);
    const tasksWithResources = this.tasks.map((task) => {
      const allocation = resourcesAllocated.get(task.name);
      if (allocation === undefined) return task;
      const resources = undelay(task.resources);
      if (resources?.delta && allocation !== UNALLOCATED)
        return merge(merge(task, resources.delta), allocation);
      return merge(task, allocation);
    });
    const availableTasks = tasksWithResources.filter((task) => this.available(task));

    // Teleportitis overrides all
    if (have($effect`Teleportitis`)) {
      const teleportitis = teleportitisTask(this, this.tasks);
      if (teleportitis.completed() && removeTeleportitis.ready()) {
        return {
          ...removeTeleportitis,
          activePriority: Prioritization.fixed(Priorities.Always),
          availableTasks,
        };
      }
      return {
        ...teleportitis,
        activePriority: Prioritization.fixed(Priorities.Always),
        availableTasks,
      };
    }

    // Otherwise, choose from all available tasks
    const chainSources = getChainSources();
    const taskPriorities = availableTasks.map((task) => {
      return {
        ...task,
        activePriority: this.prioritize(task, chainSources),
        availableTasks: availableTasks,
      };
    });

    // Sort tasks in a stable way, by priority (decreasing) and then by route
    const tasksOrderedByPriority = stableSort(
      taskPriorities,
      (task) => -1 * task.activePriority?.score()
    );
    if (args.debug.verbose) {
      printHtml("");
      printHtml("Available Tasks:");
      for (const task of tasksOrderedByPriority) {
        const name = getTaggedName(task);
        const reason = task.activePriority?.explainWithColor() ?? "Available";
        const score = task.activePriority?.score() ?? 0;
        printHtml(`<u>${name}</u>: ${reason} <font color='#888888'>(${score})</font>`);
      }
      printHtml("");
    }
    if (tasksOrderedByPriority.length > 0) return tasksOrderedByPriority[0];

    // No next task
    return undefined;
  }

  prioritize(task: ActiveTask, chainSources: ChainSource[]): Prioritization {
    return Prioritization.from(task, this.createOutfit(task), chainSources);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public printExecutingMessage(task: ActiveTask) {
    // Ignore since we printout in execute
  }

  public override run(actions?: number): void {
    this.initPropetiesManagerOnRun();
    super.run(actions);
  }

  public override execute(task: ActiveTask): void {
    debug(``);
    const name = getTaggedName(task);
    const reason = task.activePriority?.explain() ?? "";
    const why = reason === "" ? "Route" : reason;
    debug(`Executing ${name} [${why}]`, "blue");
    this.checkLimits({ ...task, limit: { ...task.limit, unready: false } }, () => true); // ignore unready for this initial check
    if (myAdventures() < args.debug.halt) throw `Running out of adventures!`;
    super.execute(task);

    if (task.completed()) {
      debug(`${task.name} completed!`, "blue");
    } else if (!(task.ready?.() ?? true)) {
      debug(`${task.name} not completed! [Again? Not ready]`, "blue");
    } else {
      const priority_explain = this.prioritize(task, getChainSources()).explain();
      if (priority_explain !== "") {
        debug(`${task.name} not completed! [Again? ${priority_explain}]`, "blue");
      } else {
        debug(`${task.name} not completed!`, "blue");
      }
    }
  }

  override customize(
    task: ActiveTask,
    outfit: Outfit,
    combat: CombatStrategy<CombatActions>,
    resources: CombatResources<CombatActions>
  ): void {
    if (undelay(task.freeaction) || undelay(task.skipprep)) {
      // Prepare only as requested by the task
      outfit.equip({ avoid: $items`Peridot of Peril` }); // peridot can still cause problems
      return;
    }

    // Setup forced wanderers
    const wanderers = [];
    const prioritizedWanderer = task.activePriority?.wanderer();
    const prioritizedChain = task.activePriority?.chain();
    if (prioritizedWanderer) {
      if (!equipFirst(outfit, [prioritizedWanderer]))
        throw `Wanderer equipment ${prioritizedWanderer.equip} conflicts with ${task.name}`;
      if (prioritizedChain) {
        if (!equipFirst(outfit, [prioritizedChain])) {
          throw `Chain equipment ${prioritizedChain.equip} conflicts with ${task.name}+${prioritizedWanderer.name}`;
        }
        combat.macro(prioritizedChain.do, undelay(prioritizedWanderer.monsters));
      }
    }

    // Setup forced backups
    if (task.activePriority?.has(Priorities.LastCopyableMonster)) {
      const backup = getActiveBackupTarget();
      if (!backup) throw `Backup requested but lastCopyableMonster changed?`;
      if (!outfit.equip($item`backup camera`)) throw `Cannot force backup camera on ${task.name}`;
      if (backup.outfit && !outfit.equip(undelay(backup.outfit)))
        throw `Cannot match equip for backup ${backup.monster} on ${task.name}`;
      outfit.equip({ avoid: $items`carnivorous potted plant` });
      const twiddleHack = Macro.externalIf(!!backup.twiddle, `"\ntwiddle\n"`); // Inject a twiddle to the CCS
      combat.startingMacro(
        Macro.if_("!monsterid 49", Macro.trySkill($skill`Back-Up to your Last Enemy`)).step(
          twiddleHack
        )
      );
      combat.action("killHard");
    }

    // Setup encouraged darts
    if (task.activePriority?.has(Priorities.GoodDarts)) {
      outfit.equip($item`Everfull Dart Holster`);
    }

    // Equip initial equipment
    this.customizeOutfitInitial(outfit);

    // Force the June cleaver if we really want it
    if (task.activePriority?.has(Priorities.GoodCleaver)) outfit.equip($item`June cleaver`);

    // Prepare combat macro
    if (combat.getDefaultAction() === undefined) combat.action("ignore");

    // Use rock-band flyers if needed (300 extra as a buffer for mafia tracking)
    const blacklist = new Set<Location>(
      $locations`The Copperhead Club, The Black Forest, Oil Peak`
    );
    const monster_blacklist = [
      ...getTodaysHolidayWanderers(),
      $monster`sausage goblin`,
      $monster`ninja snowman assassin`,
      $monster`Protagonist`,
      $monster`Quantum Mechanic`,
      $monster`government bureaucrat`,
      $monster`terrible mutant`,
      $monster`angry ghost`,
      $monster`annoyed snake`,
      $monster`slime blob`,
    ];
    if (get("camelSpit") === 100) monster_blacklist.push($monster`pygmy bowler`); // we will spit
    if (
      have($item`rock band flyers`) &&
      !flyersDone() &&
      (!(task.do instanceof Location) || !blacklist.has(task.do)) &&
      task.name !== "Misc/Protonic Ghost"
    ) {
      combat.macro(
        new Macro().if_(
          `!hpbelow 50 && ${monster_blacklist.map((m) => `!monsterid ${m.id}`).join(" && ")}`,
          new Macro().tryItem($item`rock band flyers`)
        ),
        undefined,
        true
      );
    }

    // Temporarily avoid this before implementation
    outfit.equip({ avoid: $items`Peridot of Peril` });

    if (wanderers.length === 0) {
      // Set up a banish if needed

      if (combat.can("yellowRay") && !have($effect`Everything Looks Yellow`)) {
        resources.provide("yellowRay", equipFirst(outfit, yellowRaySources));
      }
      let force_item_source: CombatResource | undefined = undefined;
      if (combat.can("forceItems")) {
        force_item_source = equipFirst(outfit, forceItemSources);
        if (force_item_source === undefined && !have($effect`Everything Looks Yellow`))
          force_item_source = equipFirst(outfit, yellowRaySources);
        resources.provide("forceItems", force_item_source);
      }

      const banishState = globalStateCache.banishes();
      if (!task.ignorebanishes?.()) {
        const unbanished = banishState.unbanished("banish", combat);
        const unkillbanished = banishState.unbanished("killBanish", combat);
        if (unbanished.length > 0) {
          const banishSources = unusedBanishes(
            banishState,
            task.availableTasks ?? [],
            task.name,
            "ends"
          );

          let usingSwapper = false;
          if (args.resources.speed) {
            // Consider using a swapper after a partial banish
            const trialOutfit = outfit.clone();
            const nokillSources = unusedBanishes(
              banishState,
              task.availableTasks ?? [],
              task.name,
              "nokill"
            );
            const nokill = equipFirst(trialOutfit, nokillSources);
            const swapper = equipFirst(trialOutfit, swapperSources);
            if (nokill && swapper) {
              const swapMacro = Macro.if_(
                unbanished.map((mon) => `monsterid ${mon.id}`).join(" || "),
                Macro.step(nokill.nokill ?? new Macro()).step(getMacro(swapper.do))
              );
              if (unbanished.length > 1) {
                const found = equipFirst(
                  trialOutfit,
                  banishSources.filter((source) => source !== nokill)
                );
                if (found) {
                  debug(`Banish targets: ${unbanished.join(", ")}`);
                  debug(`Banish assigned: ${found.name}`);
                  resources.provide("banish", found);
                  combat.startingMacro(swapMacro);
                  debug(`Swapper assigned: ${nokill.name} + ${swapper.name}`);
                  outfit = trialOutfit;
                  usingSwapper = true;
                }
              } else {
                debug(`Banish targets: ${unbanished.join(", ")}`);
                debug(`Swapper assigned: ${nokill.name} + ${swapper.name}`);
                combat.startingMacro(swapMacro);
                outfit = trialOutfit;
                usingSwapper = true;
              }
            }
          }

          if (!usingSwapper) {
            const found = equipFirst(outfit, banishSources);
            if (found) {
              debug(`Banish targets: ${unbanished.join(", ")}`);
              debug(`Banish assigned: ${found.name}`);
              resources.provide("banish", found);
            } else replaceActions(combat, "banish", "killBanish"); // also consider killBanishes for these
          }
        }
        if (unkillbanished.length > 0) {
          const banishSources = unusedBanishes(
            banishState,
            task.availableTasks ?? [],
            task.name,
            "kills"
          );
          const found = equipFirst(outfit, banishSources);
          if (found) resources.provide("killBanish", found);
          debug(`Banish targets: ${unkillbanished.join(", ")}`);
          debug(`Banish assigned: ${found?.name ?? "NONE"}`);
        }
      }

      // Don't equip the orb if we have a bad target
      if (task.activePriority?.has(Priorities.BadOrb)) {
        outfit.equip({ avoid: $items`miniature crystal ball` });
        if (outfit.equips.get($slot`familiar`) === $item`miniature crystal ball`) {
          outfit.equips.delete($slot`familiar`);
        }
      }

      // Equip an orb if we have a good target.
      // (If we have banished all the bad targets, there is no need to force an orb)
      if (task.activePriority?.has(Priorities.GoodOrb) && !banishState.isFullyBanished(combat)) {
        outfit.equip($item`miniature crystal ball`);
      }

      // Set up a runaway if there are combats we do not care about
      if (!outfit.skipDefaults) {
        const runawaySources = getRunawaySources().filter((s) => !s.blocked?.includes(task.name));
        let runaway: (CombatResource & { banishes?: boolean }) | undefined = undefined;
        if (combat.can("ignore") || combat.can("ignoreSoftBanish")) {
          // First, try guaranteed runaways
          runaway = equipFirst(
            outfit,
            runawaySources.filter((r) => r.chance() === 1)
          );
          // Second, if we are done with banishes, use one as a runaway
          if (!runaway) {
            if (
              !this.tasks.find(
                (t) => !t.completed() && t.combat?.can("banish") && !t.ignorebanishes?.()
              )
            ) {
              const banishSources = unusedBanishes(
                banishState,
                task.availableTasks ?? [],
                task.name,
                "ends"
              );
              const runawayBanish = equipFirst(
                outfit,
                banishSources.filter((b) => b.free)
              );
              if (runawayBanish) {
                runaway = { ...runawayBanish, banishes: true };
                logprint(`Repurposing ${runaway.name} as freerun`);
              }
            }
          }
          // Last, fill with probabilistic runaways
          if (!runaway) {
            runaway = equipFirst(
              outfit,
              runawaySources.filter((r) => r.chance() !== 1)
            );
          }

          if (runaway?.effect) task.otherEffects = [...(task.otherEffects ?? []), runaway.effect];
          resources.provide("ignore", runaway);
          resources.provide("ignoreSoftBanish", runaway);
        }
        if (combat.can("ignoreNoBanish") && myLevel() >= 11) {
          if (runaway !== undefined && !runaway.banishes)
            resources.provide("ignoreNoBanish", runaway);
          else {
            runaway = equipFirst(
              outfit,
              runawaySources.filter((source) => !source.banishes)
            );
            resources.provide("ignoreNoBanish", runaway);
            if (runaway?.effect) task.otherEffects = [...(task.otherEffects ?? []), runaway.effect];
          }
        }
      }

      // Set up a free kill if needed, or if no free kills will ever be needed again
      // (after Nuns, when we have expensive buffs running)
      if (combat.can("killFree"))
        resources.provide("killFree", equipFirst(outfit, freekillSources));
      if (
        (combat.can("kill") || combat.can("killItem")) &&
        !task.boss &&
        this.tasks.every((t) => t.completed() || !t.combat?.can("killFree")) &&
        (get("sidequestNunsCompleted") !== "none" || warCleared()) &&
        !task.activePriority?.has(Priorities.GoodDarts) &&
        get("breathitinCharges") === 0
      ) {
        // Kills will be upgraded to free kills at the end of this function
        resources.provide("killFree", equipFirst(outfit, freekillSources));
      }

      // Use an NC forcer if one is available and another task needs it.
      const nc_blacklist = new Set<Location>(
        $locations`The Enormous Greater-Than Sign, The Copperhead Club, The Black Forest`
      );
      const nc_task_blacklist = new Set<string>([
        "Misc/Protonic Ghost",
        "Gyou/Spectral Jellyfish", // gyou
      ]);
      if (
        forceNCPossible() &&
        !(task.do instanceof Location && nc_blacklist.has(task.do)) &&
        !nc_task_blacklist.has(task.name) &&
        !have($effect`Teleportitis`) &&
        force_item_source?.equip !== $item`Fourth of May Cosplay Saber` &&
        !get("noncombatForcerActive") &&
        prioritizedChain === undefined &&
        myTurncount() >= ROUTE_WAIT_TO_NCFORCE
      ) {
        if (
          task.availableTasks?.find((t) => t.tags?.includes("NCForce") && t.name !== task.name) !==
          undefined
        ) {
          const ncforcer = equipFirst(outfit, forceNCSources);
          if (ncforcer) {
            combat.macro(ncforcer.do, undefined, true);
          }
        }
      }
    }

    if (get("noncombatForcerActive")) {
      // Avoid some things that might override the NC and break the tracking
      outfit.equip({ avoid: $items`Kramco Sausage-o-Matic™` });
    }

    if (
      wanderers.length === 0 &&
      hasDelay(task) &&
      !get("noncombatForcerActive") &&
      !task.activePriority?.has(Priorities.LastCopyableMonster)
    )
      wanderers.push(...equipUntilCapped(outfit, wandererSources));

    if (!outfit.skipDefaults) {
      const mightKillSomething =
        task.activePriority?.has(Priorities.Wanderer) ||
        task.combat?.can("kill") ||
        task.combat?.can("killHard") ||
        task.combat?.can("killItem") ||
        task.combat?.can("killFree") ||
        task.combat?.can("forceItems") ||
        task.combat?.can("yellowRay") ||
        (!resources.has("ignore") && !resources.has("banish"));
      this.customizeOutfitCharging(
        task,
        outfit,
        mightKillSomething ?? false,
        task.nofightingfamiliars ?? false
      );
    }

    // Prepare full outfit
    const freecombat =
      (task.freecombat ?? false) ||
      wanderers.find((wanderer) => wanderer.chance() === 1) !== undefined ||
      resources.has("killFree") ||
      (task.activePriority?.has(Priorities.CosmicBowlingBall) ?? false) ||
      (task.activePriority?.has(Priorities.SpringShoes) ?? false) ||
      (task.activePriority?.has(Priorities.AsdonMartin) ?? false);
    if (!outfit.skipDefaults) {
      const modifier = getModifiersFrom(outfit);
      const glass_useful =
        canChargeVoid() &&
        !modifier.includes("-combat") &&
        !freecombat &&
        ((combat.can("kill") && !resources.has("killFree")) || combat.can("killHard") || task.boss);
      if (glass_useful && get("_voidFreeFights") < 4)
        // prioritize a few of these early in the run
        outfit.equip($item`cursed magnifying glass`);
      if (!task.boss && !freecombat && !modifier.includes("-combat") && !modifier.includes("ML"))
        outfit.equip($item`carnivorous potted plant`);
      if (glass_useful) outfit.equip($item`cursed magnifying glass`);
    }

    // Determine if it is useful to target monsters with an orb (with no predictions).
    // 1. If task.orbtargets is undefined, then use an orb if there are absorb targets.
    // 2. If task.orbtargets() is undefined, an orb is detrimental in this zone, do not use it.
    // 3. Otherwise, use an orb if task.orbtargets() is nonempty, or if there are absorb targets.
    const orb_targets = task.orbtargets?.() ?? [];
    if (orb_targets.length > 0 && !outfit.skipDefaults) {
      outfit.equip($item`miniature crystal ball`);
    }

    equipDefaults(outfit, task.nofightingfamiliars ?? false, freecombat);

    // Kill wanderers
    for (const wanderer of wanderers) {
      for (const monster of undelay(wanderer.monsters)) {
        if (combat.currentStrategy(monster) !== "killHard") {
          combat.action("killHard", monster);
          if (wanderer.action) combat.macro(wanderer.action, monster);
        }
      }
    }

    // Kill holiday wanderers
    const holidayMonsters = getTodaysHolidayWanderers();
    // TODO: better detection of which zones holiday monsters can appear
    if (holidayMonsters.length > 0 && !task.boss) combat.action("ignore", ...holidayMonsters);

    // Upgrade normal kills to free kills if provided
    if (resources.has("killFree") && !task.boss) {
      replaceActions(combat, "kill", "killFree");
      replaceActions(combat, "killItem", "killFree");
    }
  }

  customizeOutfitInitial(outfit: Outfit): void {
    equipInitial(outfit);
  }

  customizeOutfitCharging(
    task: ActiveTask,
    outfit: Outfit,
    mightKillSomething: boolean,
    noFightingFamiliars: boolean
  ): void {
    equipCharging(outfit, mightKillSomething, noFightingFamiliars);
  }

  createOutfit(task: Task): Outfit {
    const spec = undelay(task.outfit);
    const outfit = new Outfit();
    if (spec !== undefined) outfit.equip(spec); // no error on failure
    return outfit;
  }

  /**
   * Acquire all effects for the task.
   * @param _task The current executing task.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override acquireEffects(task: ActiveTask): void {
    // Do nothing; effects will be added in dress instead
  }

  override dress(task: ActiveTask, outfit: Outfit): void {
    const effects: Effect[] = undelay(task.effects) ?? [];
    const otherEffects = task.otherEffects ?? [];

    let modifier = outfit.modifier.join(",");
    if (undelay(task.skipeffects)) modifier = "";
    // No need to buff -combat if we just force the NC
    if (task.tags?.includes("NCForce") || get("noncombatForcerActive"))
      modifier = modifier.replace("-combat", "");
    applyEffects(modifier, [...effects, ...otherEffects]);

    try {
      cacheDress(outfit);
    } catch {
      // If we fail to dress, this is maybe just a mafia desync.
      // So refresh our inventory and try again (once).
      debug("Possible mafia desync detected; refreshing...");
      cliExecute("refresh all");
      // Do not try and cache-dress
      outfit.dress();
    }
    fixFoldables(outfit);

    const equipped = [...new Set(Slot.all().map((slot) => equippedItem(slot)))];
    if (args.debug.verbose) {
      print(`Equipped: ${equipped.join(", ")}`);
      print(`Familiar: ${myFamiliar()}`);
    }
    logModifiers(outfit);

    if (undelay(task.freeaction) || undelay(task.skipprep)) {
      // Prepare only as requested by the task
      return;
    }

    // HP/MP upkeep
    if (
      (have($effect`Once-Cursed`) || have($effect`Twice-Cursed`) || have($effect`Thrice-Cursed`)) &&
      get("hiddenApartmentProgress") < 7
    ) {
      this.propertyManager.set({
        hpAutoRecoveryItems: ensureRecovery("hpAutoRecoveryItems", [], ["relaxing hot tub"]),
      });
    } else {
      this.propertyManager.set({
        hpAutoRecoveryItems: ensureRecovery("hpAutoRecoveryItems", ["relaxing hot tub"], []),
      });
    }
    if (myHp() < 100 && myHp() < myMaxhp()) restoreHp(myMaxhp() < 100 ? myMaxhp() : 100);
    if (myMp() < 50 && myMaxmp() >= 50) customRestoreMp(50);
    else if (myMp() < 40 && myMaxmp() >= 40) customRestoreMp(40);
    else if (myMp() < 20) customRestoreMp(20);

    // Equip stillsuit
    if (
      have(args.minor.stillsuit) &&
      (itemAmount($item`tiny stillsuit`) > 0 ||
        (availableAmount($item`tiny stillsuit`) > 0 &&
          !haveEquipped($item`tiny stillsuit`) &&
          familiarEquippedEquipment(args.minor.stillsuit) !== $item`tiny stillsuit`))
    ) {
      equip(args.minor.stillsuit, $item`tiny stillsuit`);
    }
  }

  override setChoices(task: ActiveTask, manager: PropertiesManager): void {
    super.setChoices(task, manager);
    if (equippedAmount($item`June cleaver`) > 0) {
      this.propertyManager.setChoices({
        // June cleaver noncombats
        1467: 3, // +adv
        1468: get("_juneCleaverSkips", 0) < 5 ? 4 : 1,
        1469: get("_juneCleaverSkips", 0) < 5 ? 4 : 3,
        1470: 2, // teacher's pen
        1471: get("_juneCleaverSkips", 0) < 5 ? 4 : 1,
        1472: get("_juneCleaverSkips", 0) < 5 ? 4 : 2,
        1473: get("_juneCleaverSkips", 0) < 5 ? 4 : 2,
        1474: get("_juneCleaverSkips", 0) < 5 ? 4 : 2,
        1475: get("_juneCleaverSkips", 0) < 5 ? 4 : 1,
      });
    }
    this.propertyManager.set({ stillsuitFamiliar: args.minor.stillsuit });
  }

  override setCombat(
    task: ActiveTask,
    task_combat: CombatStrategy<CombatActions>,
    task_resources: CombatResources<CombatActions>
  ): void {
    // Always be ready to fight possible wanderers, even if we didn't equip
    // things on purpose, e.g. if we equip Kramco for +item.
    for (const wanderer of wandererSources) {
      if (wanderer.possible()) {
        for (const monster of undelay(wanderer.monsters)) {
          if (task_combat.currentStrategy(monster) !== "killHard") {
            task_combat.action("killHard", monster);
            if (wanderer.action) task_combat.macro(wanderer.action, monster);
          }
        }
        wanderer.prepare?.();
      }
    }

    // The carn potted plant may kill the enemy early,
    // so set up the normal combat as an autoattack.
    if (haveEquipped($item`carnivorous potted plant`)) {
      const macro = task_combat.compile(
        task_resources,
        this.options?.combat_defaults,
        task.do instanceof Location ? task.do : undefined
      );
      task_combat.autoattack(macro);
    }

    super.setCombat(task, task_combat, task_resources);
  }

  override do(task: ActiveTask): void {
    const beaten_turns = haveEffect($effect`Beaten Up`);
    const start_advs = myAdventures();

    const propertyManager = this.propertyManager;
    super.do({
      ...task,
      do: () => {
        // Consider crepe paper parachute cape if available
        const parachuteTarget = undelay(task.parachute);
        if (parachuteTarget && !task.activePriority?.has(Priorities.GoodOrb)) {
          if (CrepeParachute.fight(parachuteTarget)) return;
        }

        // Consider map the monsters if available
        const mapTarget = undelay(task.mapmonster);
        if (mapTarget && get("_monstersMapped") < 3 && have($skill`Map the Monsters`)) {
          propertyManager.setChoice(1435, `1&heyscriptswhatsupwinkwink=${mapTarget.id}`);
          if (!get("mappingMonsters")) useSkill($skill`Map the Monsters`);
        }

        if (task.do instanceof Location) return task.do;
        return task.do();
      },
    });

    if (myAdventures() !== start_advs) getCMCPills();

    // Crash if we unexpectedly lost the fight
    if (
      !undelay(task.expectbeatenup) &&
      have($effect`Beaten Up`) &&
      haveEffect($effect`Beaten Up`) < 5
    ) {
      // Poetic Justice gives 5
      if (
        haveEffect($effect`Beaten Up`) > beaten_turns || // Turns of beaten-up increased, so we lost
        (haveEffect($effect`Beaten Up`) === beaten_turns &&
          // Turns of beaten-up was constant but adventures went down, so we lost fight while already beaten up
          myAdventures() < start_advs)
      ) {
        print(
          `Fight was lost (debug info: ${beaten_turns} => ${haveEffect(
            $effect`Beaten Up`
          )}, (${start_advs} => ${myAdventures()}); stop.`
        );
        throw `Fight was lost (debug info: ${beaten_turns} => ${haveEffect(
          $effect`Beaten Up`
        )}, (${start_advs} => ${myAdventures()}); stop.`;
      }
    }
  }

  post(task: ActiveTask): void {
    super.post(task);

    // Try to fix evil tracking after backing up
    if (get("lastCopyableMonster") === $monster`giant swarm of ghuol whelps`) visitUrl("crypt.php");

    if (task.activePriority?.has(Priorities.BadOrb) && !haveEquipped($item`miniature crystal ball`))
      resetBadOrb();
    if (get("_latteBanishUsed") && shouldFinishLatte()) refillLatte();
    autosellJunk();
    for (const poisoned of $effects`Hardly Poisoned at All, A Little Bit Poisoned, Somewhat Poisoned, Really Quite Poisoned, Majorly Poisoned, Toad In The Hole`) {
      if (have(poisoned)) uneffect(poisoned);
    }
    globalStateCache.invalidate();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override initPropertiesManager(manager: PropertiesManager): void {
    // Initialize on engine.run() instead of constructor
  }

  initPropetiesManagerOnRun(): void {
    super.initPropertiesManager(this.propertyManager);
    this.propertyManager.set({
      louvreGoal: 7,
      louvreDesiredGoal: 7,
      requireBoxServants: false,
      autoAbortThreshold: "-0.05",
      recoveryScript: "",
      removeMalignantEffects: false,
      choiceAdventureScript: "loopstar_choice.js",
      lastChanceBurn: "",
      mpAutoRecoveryItems: ensureRecovery(
        "mpAutoRecoveryItems",
        ["black cherry soda", "doc galaktik's invigorating tonic"],
        [
          "rest in your campaway tent",
          "rest at the chateau",
          "rest at your campground",
          "sleep on your clan sofa",
        ]
      ),
      hpAutoRecoveryItems: ensureRecovery(
        "hpAutoRecoveryItems",
        ["scroll of drastic healing", "doc galaktik's homeopathic elixir"],
        [
          "rest in your campaway tent",
          "rest at the chateau",
          "rest at your campground",
          "sleep on your clan sofa",
        ]
      ),
    });
    this.propertyManager.setChoices({
      1106: 3, // Ghost Dog Chow
      1107: 1, // tennis ball
      1340: 3, // Is There A Doctor In The House?
      1341: 1, // Cure her poison
    });
  }

  updatePlan() {
    // Note order matters for these strategy updates
    globalStateCache.invalidate();
    keyStrategy.update(); // Update key plan with current state
  }
}

function autosellJunk(): void {
  if (inCasual()) return;
  if (myMeat() >= 10000) return;
  if (myTurncount() >= 1000) return; // stop after breaking ronin
  if (have($item`pork elf goodies sack`)) use($item`pork elf goodies sack`);
  if (have($item`MayDay™ supply package`)) use($item`MayDay™ supply package`);

  // Sell junk items
  const junk = $items`hamethyst, baconstone, meat stack, dense meat stack, facsimile dictionary, space blanket, 1\,970 carat gold, black snake skin, demon skin, hellion cube, adder bladder, weremoose spit, Knob Goblin firecracker, wussiness potion, diamond-studded cane, Knob Goblin tongs, Knob Goblin scimitar, eggbeater, red-hot sausage fork, Knob Goblin pants, awful poetry journal, black pixel, pile of dusty animal bones, 1952 Mickey Mantle card, liquid ice, fat stacks of cash`;
  for (const item of junk) {
    if (have(item)) autosell(item, itemAmount(item));
  }

  // Sell all but one of a few items
  const partial_junk = $items`ruby W, metallic A, lowercase N, heavy D`;
  for (const item of partial_junk) {
    if (itemAmount(item) > 1) autosell(item, itemAmount(item) - 1);
  }

  // Use wallets
  const wallets = $items`ancient vinyl coin purse, black pension check, old leather wallet, Gathered Meat-Clip, old coin purse`;
  for (const item of wallets) {
    if (have(item)) use(item, itemAmount(item));
  }

  // Sell a few other items if we have to
  const lastresorts = $items`keg shield, perforated battle paddle, bottle opener belt buckle, beer bomb, Kokomo Resort Pass, giant pinky ring, Eye Agate, Azurite, Lapis Lazuli`;
  for (const item of lastresorts) {
    if (myMeat() >= 1000) return;
    if (have(item)) autosell(item, itemAmount(item));
  }
}

function getCMCPills(): void {
  // Mafia doesn't always notice the workshed
  if (!get(toTempPref("checkWorkshed"), false)) {
    const workshed = visitUrl("campground.php?action=workshed");
    if (
      workshed.includes("Cold Medicine Cabinet") &&
      getWorkshed() !== $item`cold medicine cabinet`
    ) {
      throw `Mafia is not detecting your cold medicine cabinet; consider visiting manually`;
    }
    set(toTempPref("checkWorkshed"), true);
  }

  if (get("_coldMedicineConsults") >= 5) return;
  if (get("_nextColdMedicineConsult") > totalTurnsPlayed()) return;
  if (getWorkshed() !== $item`cold medicine cabinet`) return;

  const goal = args.minor.breathitin ? $item`Breathitin™` : $item`Extrovermectin™`;
  const options = visitUrl("campground.php?action=workshed");
  let match;
  const regexp = /descitem\((\d+)\)/g;
  while ((match = regexp.exec(options)) !== null) {
    const item = descToItem(match[1]);
    if (item === goal) {
      visitUrl("campground.php?action=workshed");
      runChoice(5);
      return;
    }
  }
}

function resetBadOrb(): boolean {
  if (get("hiddenBowlingAlleyProgress") !== 8) return false;

  const shrine = $location`An Overgrown Shrine (Southeast)`;

  if (!canAdventure(shrine)) return false;

  if (get("_juneCleaverFightsLeft") === 0 && haveEquipped($item`June cleaver`))
    cliExecute("unequip june cleaver");

  try {
    const encounter = visitUrl(toUrl(shrine));
    if (!encounter.includes("Fire When Ready")) {
      print("Unable to stare longingly at a shrine ball cradle");
    }
    // Walk away
    runChoice(6);
    return true;
  } catch (e) {
    print(`We ran into an issue when gazing at a shrine for balls: ${e}.`, "red");
  }

  return false;
}

function ensureRecovery(property: string, items: string[], avoid: string[]): string {
  const recovery_property = get(property).split(";");
  for (const item of items) {
    if (!recovery_property.includes(item)) {
      recovery_property.push(item);
    }
  }
  return recovery_property.filter((v) => !avoid.includes(v)).join(";");
}

const modifierNames: { [name: string]: string } = {
  combat: "Combat Rate",
  item: "Item Drop",
  meat: "Meat Drop",
  ml: "Monster Level",
  "stench res": "Stench Resistance",
  "stench dmg": "Stench Damage",
  "stench spell dmg": "Stench Spell Damage",
  "hot res": "Hot Resistance",
  "hot dmg": "Hot Damage",
  "hot spell dmg": "Hot Spell Damage",
  "cold res": "Cold Resistance",
  "cold dmg": "Cold Damage",
  "cold spell dmg": "Cold Spell Damage",
  "spooky res": "Spooky Resistance",
  "spooky dmg": "Spooky Damage",
  "spooky spell dmg": "Spooky Spell Damage",
  "sleaze res": "Sleaze Resistance",
  "sleaze dmg": "Sleaze Damage",
  "sleaze spell dmg": "Sleaze Spell Damage",
  init: "Initiative",
  "booze drop": "Booze Drop",
  "food drop": "Food Drop",
  da: "Damage Absorption",
};

function logModifiers(outfit: Outfit) {
  const maximizer = outfit.modifier.join(",").toLowerCase();
  for (const modifier of Object.keys(modifierNames)) {
    if (maximizer.includes(modifier)) {
      const name = modifierNames[modifier];
      const value = numericModifier(modifierNames[modifier]);
      logprint(`= ${name}: ${value}`);
    }
  }
}
