import {
  canEquip,
  cliExecute,
  Effect,
  equip,
  equippedAmount,
  equippedItem,
  getInventory,
  getWorkshed,
  inCasual,
  Item,
  itemAmount,
  mpCost,
  myClass,
  myHp,
  myMaxhp,
  myMaxmp,
  myMeat,
  myMp,
  myPath,
  myPrimestat,
  numericModifier,
  restoreHp,
  restoreMp,
  retrieveItem,
  Skill,
  Slot,
  toSkill,
  toSlot,
  use,
  useSkill,
  visitUrl,
  weaponHands,
} from "kolmafia";
import {
  $class,
  $effect,
  $effects,
  $item,
  $path,
  $skill,
  $slot,
  $slots,
  $stat,
  AsdonMartin,
  ensureEffect,
  freeCrafts,
  get,
  getActiveSongs,
  getSongLimit,
  have,
  isSong,
  set,
  uneffect,
  unequip,
} from "libram";
import { asdonFualable } from "../lib";
import { underStandard } from "../lib";
import { step } from "grimoire-kolmafia";
import { toTempPref } from "../args";

const aprilShieldEffects = new Map<Effect, Skill>([
  [$effect`Thoughtful Empathy`, $skill`Empathy of the Newt`],
  [$effect`Lubricating Sauce`, $skill`Sauce Contemplation`],
  [$effect`Tubes of Universal Meat`, $skill`Manicotti Meditation`],
  [$effect`Slippery as a Seal`, $skill`Seal Clubbing Frenzy`],
  [$effect`Strength of the Tortoise`, $skill`Patience of the Tortoise`],
  [$effect`Disco over Matter`, $skill`Disco Aerobics`],
  [$effect`Mariachi Moisture`, $skill`Moxie of the Mariachi`],
]);

function getRelevantEffects(): { [modifier: string]: Effect[] } {
  const result = {
    "-combat": $effects`Smooth Movements, The Sonata of Sneakiness, Hiding From Seekers`,
    "+combat": $effects`Carlweather's Cantata of Confrontation, Musk of the Moose, Attracting Snakes`,
    "":
      myMeat() > 0
        ? $effects`Empathy, Leash of Linguini, Astral Shell, Elemental Saucesphere, Thoughtful Empathy`
        : [],
    "fam weight": $effects`Chorale of Companionship`,
    init: $effects`Walberg's Dim Bulb, Springy Fusilli, Cletus's Canticle of Celerity, Suspicious Gaze, Song of Slowness`,
    ML: $effects`Ur-Kel's Aria of Annoyance, Pride of the Puffin, Drescher's Annoying Noise`,
    item: $effects`Fat Leon's Phat Loot Lyric, Singer's Faithful Ocelot`,
    meat: $effects`Polka of Plenty, Disco Leer, Tubes of Universal Meat`,
    muscle: $effects`Go Get 'Em\, Tiger!, Big, Stevedave's Shanty of Superiority`,
    mysticality: $effects`Glittering Eyelashes, Big, Stevedave's Shanty of Superiority`,
    moxie: $effects`Butt-Rock Hair, Big, Stevedave's Shanty of Superiority`,
    " combat": [] as Effect[],
  };
  const all_attributes = [] as Effect[];

  if (step("questM20Necklace") === 999) {
    // Start considering good -combat buffs
    if (
      have($item`Clan VIP Lounge key`) &&
      !underStandard() &&
      (!get("_olympicSwimmingPool") || have($effect`Silent Running`))
    )
      result["-combat"].push($effect`Silent Running`);

    if (
      have($item`Clan VIP Lounge key`) &&
      (get("_photoBoothEffects", 0) < 3 || have($effect`Wild and Westy!`))
    )
      result["-combat"].push($effect`Wild and Westy!`);

    if (have($skill`Emotionally Chipped`) && get("_feelLonelyUsed") < 3)
      result["-combat"].push($effect`Feeling Lonely`);
  }

  if (have($item`ultra-soft ferns`)) {
    result["-combat"].push($effect`Ultra-Soft Steps`);
  }
  if (have($item`crunchy brush`)) {
    result["+combat"].push($effect`Crunchy Steps`);
  }

  if (myClass() !== $class`Pastamancer`) {
    result["init"].push($effect`Whispering Strands`);
  }

  if (
    have($skill`Seek out a Bird`) &&
    get("_birdsSoughtToday") < 6 &&
    !get(toTempPref("birdExpensive"), false)
  ) {
    if (get("_birdOfTheDayMods").includes("Monster Level")) {
      result["ML"].push($effect`Blessing of the Bird`);
    }
    if (get("_birdOfTheDayMods").includes("Muscle")) {
      result["muscle"].push($effect`Blessing of the Bird`);
    }
    if (get("_birdOfTheDayMods").includes("Myst")) {
      result["mysticality"].push($effect`Blessing of the Bird`);
    }
    if (get("_birdOfTheDayMods").includes("Moxie")) {
      result["moxie"].push($effect`Blessing of the Bird`);
    }
    if (get("_birdOfTheDayMods").includes("Initiative")) {
      result["init"].push($effect`Blessing of the Bird`);
    }
  }

  // If we are not in Smol,
  // or if we have an effect to override the 1 attribute cap,
  // +%stat effects may be worthwhile.
  if (
    !inCasual() &&
    (myPath() !== $path`A Shrunken Adventurer am I` ||
      have($effect`Feeling Insignificant`) ||
      have($effect`Drenched in Lava`) ||
      have($effect`Snowballed`))
  ) {
    // Add sauce potions
    const saucePotionsAvailable = Math.min(
      itemAmount($item`scrumptious reagent`),
      freeCrafts("food")
    );
    if (myPrimestat() === $stat`Muscle` && have($item`lime`) && saucePotionsAvailable >= 1) {
      result["mysticality"].push($effect`Stabilizing Oiliness`);
      result["moxie"].push($effect`Stabilizing Oiliness`);
    }
    if (saucePotionsAvailable >= 2) {
      result["muscle"].push($effect`Phorcefullness`);
      result["mysticality"].push($effect`Mystically Oiled`);
      result["moxie"].push($effect`Superhuman Sarcasm`);
    }
    if (saucePotionsAvailable >= 3) {
      all_attributes.push($effect`Tomato Power`);
    }

    // Other +attribute effects
    if (!get("_lyleFavored")) all_attributes.push($effect`Favored by Lyle`);
    if (get("telescopeUpgrades") > 0 && !get("telescopeLookedHigh"))
      all_attributes.push($effect`Starry-Eyed`);
    if (get("spacegateAlways") && get("spacegateVaccine2") && !get("_spacegateVaccine"))
      all_attributes.push($effect`Broad-Spectrum Vaccine`);
    if (have($item`protonic accelerator pack`) && !get("_streamsCrossed"))
      all_attributes.push($effect`Total Protonic Reversal`);
  }

  if (myPath() === $path`Grey You`) {
    result["-combat"].push($effect`Shifted Phase`);
    result["-combat"].push($effect`Darkened Photons`);
    result["+combat"].push($effect`Hooooooooonk!`);
  }

  result[" combat"] = result["+combat"];
  result["muscle"].push(...all_attributes);
  result["mysticality"].push(...all_attributes);
  result["moxie"].push(...all_attributes);
  return result;
}

function shrug(effects: Effect[]) {
  for (const effect of effects) {
    if (have(effect) && have($item`soft green echo eyedrop antidote`)) uneffect(effect);
  }
}

export function moodCompatible(modifier: string | undefined): boolean {
  // Since shrugging is limited, ensure we do not attempt a +combat task
  // while under -combat effects, and vice-versa.
  if (modifier === undefined) return true;
  if (modifier.includes("+combat") || modifier.includes(" combat")) {
    return (
      !have($effect`Smooth Movements`) &&
      !have($effect`The Sonata of Sneakiness`) &&
      !have($effect`Hiding From Seekers`) &&
      // Gyou Effects
      !have($effect`Shifted Phase`) &&
      !have($effect`Darkened Photons`)
    );
  }
  if (modifier.includes("-combat")) {
    return (
      !have($effect`Musk of the Moose`) &&
      !have($effect`Carlweather's Cantata of Confrontation`) &&
      !have($effect`Romantically Roused`) &&
      !have($effect`Fresh Breath`) &&
      !have($effect`Attracting Snakes`) &&
      // Gyou Effects
      !have($effect`Hooooooooonk!`)
    );
  }
  return true;
}

function haveEquipmentToCast(effect: Effect): boolean {
  // Check that we have the class equipment to get this skill
  const skill = aprilShieldEffects.get(effect) ?? toSkill(effect);
  if (skill === $skill`none`) return true;
  if (skill.class === $class`Turtle Tamer`) return have($item`turtle totem`);
  if (skill.class === $class`Sauceror`) return have($item`saucepan`);
  if (skill.class === $class`Accordion Thief`) return have($item`toy accordion`);
  return true;
}

export function applyEffects(modifier: string, other_effects: Effect[]): void {
  const relevantEffects = getRelevantEffects();

  const useful_effects = [...other_effects];
  for (const key in relevantEffects) {
    if (key === "ML" && modifier.includes("-ML")) continue;
    if (modifier.includes(key)) {
      useful_effects.push(...relevantEffects[key].filter((e) => haveEquipmentToCast(e)));
    }
  }

  // Remove wrong combat effects
  if (modifier.includes("+combat") || modifier.includes(" combat"))
    shrug(relevantEffects["-combat"]);
  if (modifier.includes("-combat")) shrug(relevantEffects["+combat"]);

  // Make room for songs
  const songs = useful_effects.filter(isSong).slice(0, getSongLimit());
  if (songs.length > 0) {
    const extra_songs = getActiveSongs().filter((e) => !songs.includes(e));
    while (songs.length + extra_songs.length > getSongLimit()) {
      const to_remove = extra_songs.pop();
      if (to_remove === undefined) break;
      else uneffect(to_remove);
    }
  }

  ensureWithMPSwaps(useful_effects);

  // Use asdon martin
  if (getWorkshed() === $item`Asdon Martin keyfob (on ring)` && asdonFualable(37)) {
    if (modifier.includes("-combat") && have($effect`Silent Running`))
      AsdonMartin.drive(AsdonMartin.Driving.Stealthily);
    // else if (modifier.includes("+combat")) AsdonMartin.drive(AsdonMartin.Driving.Obnoxiously);
    // else if (modifier.includes("init")) AsdonMartin.drive(AsdonMartin.Driving.Quickly);
    if (modifier.includes("meat") || modifier.includes("item")) {
      if (!have($effect`Driving Observantly`)) AsdonMartin.drive(AsdonMartin.Driving.Observantly);
    }
  }
}

export function ensureWithMPSwaps(effects: Effect[], required = true) {
  // Apply all relevant effects
  const hotswapped: [Slot, Item][] = []; //
  for (const effect of effects) {
    const shieldSlot = Slot.all().find(
      (slot) => equippedItem(slot) === $item`April Shower Thoughts shield`
    );

    if (effect === $effect`Empathy` && shieldSlot) {
      hotswapped.push([shieldSlot, $item`April Shower Thoughts shield`]);
      unequip($item`April Shower Thoughts shield`);
    }

    if (have(effect, effect === $effect`Ode to Booze` ? 5 : 1)) continue;
    if (!have(effect) && effect === $effect`Mystically Oiled`) {
      retrieveItem($item`ointment of the occult`);
    }
    const shieldSkill = aprilShieldEffects.get(effect);
    const skill = shieldSkill ?? toSkill(effect);

    if (skill !== $skill`none` && !have(skill)) continue; // skip

    if (shieldSkill && !shieldSlot) {
      if (!have($item`April Shower Thoughts shield`)) continue;

      if (weaponHands(equippedItem($slot`weapon`)) > 1) {
        hotswapped.push([$slot`weapon`, equippedItem($slot`weapon`)]);
        equip($slot`weapon`, $item`none`);
        // to make room for the weapon when unhotswapping
        hotswapped.push([$slot`offhand`, $item`none`]);
      } else {
        hotswapped.push([$slot`offhand`, equippedItem($slot`offhand`)]);
      }
      equip($item`April Shower Thoughts shield`);
    }

    // If we don't have the MP for this effect, hotswap some equipment
    const mpcost = mpCost(skill);
    if (mpcost > myMaxmp()) {
      hotswapped.push(...swapEquipmentForMp(mpcost));
    }
    if (effect === $effect`Blessing of the Bird` && mpcost > myMaxmp()) {
      // Seek out a Bird has become too expensive to cast,
      // so we may as well stop planning for it.
      set(toTempPref("birdExpensive"), true);
      continue;
    }
    if (myMp() < mpcost) customRestoreMp(mpcost);
    if (shieldSkill) {
      useSkill(shieldSkill);
    } else if (required) {
      ensureEffect(effect);
    } else {
      cliExecute(effect.default);
    }
  }

  // If we hotswapped equipment, restore our old equipment (in-reverse, to work well if we moved equipment around)
  hotswapped.reverse();
  for (const [slot, item] of hotswapped) equip(item, slot);
}

export function castWithMpSwaps(skills: Skill[]) {
  // Apply all relevant effects
  const hotswapped: [Slot, Item][] = []; //
  for (const skill of skills) {
    // If we don't have the MP for this skill, hotswap some equipment
    const mpcost = mpCost(skill);
    if (mpcost > myMaxmp()) {
      hotswapped.push(...swapEquipmentForMp(mpcost));
    }
    if (myMp() < mpcost) customRestoreMp(mpcost);
    useSkill(skill);
  }

  // If we hotswapped equipment, restore our old equipment (in-reverse, to work well if we moved equipment around)
  hotswapped.reverse();
  for (const [slot, item] of hotswapped) equip(item, slot);
}

export function swapEquipmentForMp(mpgoal: number): [Slot, Item][] {
  const hotswapped: [Slot, Item][] = [];
  const inventory_options = Object.entries(getInventory())
    .map((v) => Item.get(v[0]))
    .filter((item) => numericModifier(item, "Maximum MP") > 0 && canEquip(item));
  for (const slot of $slots`shirt, acc1, acc2, acc3, pants, back, hat`) {
    if (mpgoal <= myMaxmp()) break;
    if (slot === $slot`weapon` || slot === $slot`off-hand`) continue; // skip weapon handedness (for now)
    if (slot === $slot`shirt` && !have($skill`Torso Awareness`)) continue;
    const item = equippedItem(slot);

    // Find an item in the same slot that gives more max MP
    const canonical_slot =
      slot === $slot`acc3` ? $slot`acc1` : slot === $slot`acc2` ? $slot`acc1` : slot;
    const slot_options = inventory_options
      .filter(
        (it) =>
          equippedAmount(it) === 0 &&
          toSlot(it) === canonical_slot &&
          numericModifier(it, "Maximum HP") >= numericModifier(item, "Maximum HP") &&
          numericModifier(it, "Maximum MP") > numericModifier(item, "Maximum MP")
      )
      .sort((a, b) => numericModifier(b, "Maximum MP") - numericModifier(a, "Maximum MP"));

    // If there is such an item, equip it
    if (slot_options.length === 0) continue;
    hotswapped.push([slot, item]);
    equip(slot, slot_options[0]);
  }
  return hotswapped;
}

export function customRestoreMp(target: number) {
  if (myMp() >= target) return;
  if (get("sweat", 0) >= 80) {
    // Use visit URL to avoid needing to equip the pants
    visitUrl("runskillz.php?action=Skillz&whichskill=7420&targetplayer=0&pwd&quantity=1");
  }

  restoreMp(target);
  if (myMp() < target && myMp() < myMaxmp() && myMeat() < 90) {
    // Attempt to get more meat and try again
    // TODO: loopstar fix
    // if (pullStrategy.pullIfReady($item`1,970 carat gold`)) {
    //   autosell($item`1,970 carat gold`, 1);
    // } else if (pullStrategy.pullIfReady($item`1952 Mickey Mantle card`)) {
    //   autosell($item`1952 Mickey Mantle card`, 1);
    // }
    restoreMp(target);
  }
}

export function fillHp() {
  if (myHp() < myMaxhp()) {
    if (!restoreHp(myMaxhp())) {
      // Backup healing plan in a pinch
      if (have($item`scroll of drastic healing`)) {
        use($item`scroll of drastic healing`);
      } else if (
        get("_hotTubSoaks") < 5 &&
        ($effects`Once-Cursed, Twice-Cursed, Thrice-Cursed`.find((e) => have(e)) === undefined ||
          get("hiddenApartmentProgress") >= 7)
      ) {
        visitUrl("clan_viplounge.php?action=hottub");
      }
      let tries = 0;
      while (myHp() < myMaxhp() && myMeat() >= 1000 && tries < 30) {
        tries++;
        retrieveItem($item`Doc Galaktik's Homeopathic Elixir`);
        use($item`Doc Galaktik's Homeopathic Elixir`);
      }
    }
  }
}
