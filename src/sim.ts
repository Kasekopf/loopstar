import {
  Familiar,
  getWorkshed,
  Item,
  mallPrice,
  Monster,
  print,
  printHtml,
  Skill,
  storageAmount,
} from "kolmafia";
import {
  $familiar,
  $item,
  $monster,
  $skill,
  AutumnAton,
  CampAway,
  CombatLoversLocket,
  get,
  have,
  permedSkills,
} from "libram";
import { pullStrategy } from "./tasks/pulls";

class Hardcoded {
  have: boolean;
  name: string;

  constructor(have: boolean, name: string) {
    this.have = have;
    this.name = name;
  }
}

type Thing = Item | Familiar | Skill | Monster | Hardcoded;
interface Requirement {
  thing: Thing | Thing[];
  why: string;
}

/**
 * Return: a list of all things required to run the script.
 */
function buildIotmList(): Requirement[] {
  return [
    { thing: $item`Clan VIP Lounge key`, why: "YRs, +combat" },
    {
      thing: new Hardcoded(
        have($item`cold medicine cabinet`) || getWorkshed() === $item`cold medicine cabinet`,
        "Cold medicine cabinet"
      ),
      why: "Get Extrovermectin for profit",
    },
    {
      thing: new Hardcoded(have($skill`Summon Clip Art`), "Summon Clip Art"),
      why: "Amulet coin",
    },
    {
      thing: $familiar`Artistic Goth Kid`,
      why: "Wanderers",
    },
    {
      thing: $familiar`Reagnimated Gnome`,
      why: "Adv gain",
    },
    {
      thing: new Hardcoded(get("chateauAvailable"), "Chateau Mantegna"),
      why: "Free rests, +exp",
    },
    {
      thing: new Hardcoded(get("lovebugsUnlocked"), "Lovebugs"),
      why: "Crypt, Desert",
    },
    {
      thing: $item`Deck of Every Card`,
      why: "A key for the NS tower, stone wool, ore",
    },
    {
      thing: $item`protonic accelerator pack`,
      why: "Wanderers",
    },
    {
      thing: $familiar`Trick-or-Treating Tot`,
      why: "+item",
    },
    {
      thing: $familiar`Space Jellyfish`,
      why: 'Stench jellies for profit; see the argument "jellies"',
    },
    {
      thing: new Hardcoded(get("loveTunnelAvailable"), "LOV Tunnel"),
      why: "+exp",
    },
    {
      thing: $item`Kremlin's Greatest Briefcase`,
      why: "Banishes",
    },
    {
      thing: $item`January's Garbage Tote`,
      why: "+item, +meat",
    },
    {
      thing: $item`SongBoom™ BoomBox`,
      why: "Meat and special seasonings",
    },
    {
      thing: $item`Bastille Battalion control rig`,
      why: "+exp",
    },
    {
      thing: $item`latte lovers member's mug`,
      why: "Banishes",
    },
    {
      thing: new Hardcoded(get("voteAlways"), "Voting Booth"),
      why: "Wanderers",
    },
    {
      thing: new Hardcoded(get("daycareOpen"), "Boxing Daycare"),
      why: "+exp",
    },
    {
      thing: $item`Kramco Sausage-o-Matic™`,
      why: "Wanderers",
    },
    {
      thing: $item`Lil' Doctor™ bag`,
      why: "Banish, instakill, +item",
    },
    {
      thing: $item`Fourth of May Cosplay Saber`,
      why: "Familiar Weight",
    },
    {
      thing: new Hardcoded(CampAway.have(), "Distant Woods Getaway Brochure"),
      why: "+exp",
    },
    {
      thing: $item`Powerful Glove`,
      why: "Pixels",
    },
    { thing: $familiar`Left-Hand Man`, why: "Carn plant" },
    { thing: $familiar`Melodramedary`, why: "Desert progress" },
    {
      thing: $item`Cargo Cultist Shorts`,
      why: "Mountain man",
    },
    {
      thing: $skill`Comprehensive Cartography`,
      why: "Billiards, Friars, Nook, Castle, War start",
    },
    {
      thing: $item`unwrapped knock-off retro superhero cape`,
      why: "Slay the dead in crypt",
    },
    {
      thing: $item`miniature crystal ball`,
      why: "Monster prediction",
    },
    {
      thing: $skill`Emotionally Chipped`,
      why: "Banish, -combat, items",
    },
    {
      thing: $item`backup camera`,
      why: "ML, init",
    },
    {
      thing: $familiar`Shorter-Order Cook`,
      why: "Kill the Wall of Skin, initial exp",
    },
    {
      thing: $item`familiar scrapbook`,
      why: "+exp",
    },
    {
      thing: $item`industrial fire extinguisher`,
      why: "Harem outfit, Bat hole, stone wool, Crypt, Ultrahydrated, Shadow bricks",
    },
    {
      thing: $item`Daylight Shavings Helmet`,
      why: "+meat, +item",
    },
    {
      thing: $item`cursed magnifying glass`,
      why: "Wanderers",
    },
    {
      thing: new Hardcoded(
        have($item`cosmic bowling ball`) || get("cosmicBowlingBallReturnCombats", -1) >= 0,
        "Cosmic bowling ball"
      ),
      why: "Banishes",
    },
    {
      thing: $item`combat lover's locket`,
      why: "Reminiscing",
    },
    { thing: $familiar`Grey Goose`, why: "Duplication drones" },
    {
      thing: $item`unbreakable umbrella`,
      why: "-combat modifier, ML",
    },
    {
      thing: $item`June cleaver`,
      why: "Tavern, +adv",
    },
    {
      thing: $item`designer sweatpants`,
      why: "Sleaze damage, +init",
    },
    {
      thing: $item`Jurassic Parka`,
      why: "Meat, ML, -combat forces",
    },
    {
      thing: new Hardcoded(AutumnAton.have(), "autumn-aton"),
      why: "Lobsterfrogman",
    },
    {
      thing: new Hardcoded(
        have($item`model train set`) || getWorkshed() === $item`model train set`,
        "Model train set"
      ),
      why: "Meat, MP, Ore, Orc bridge parts, and res",
    },
    {
      thing: $item`S.I.T. Course Completion Certificate`,
      why: "Profit, +meat",
    },
    {
      thing: $item`closed-circuit pay phone`,
      why: "Shadow bricks, +meat",
    },
    {
      thing: $item`cursed monkey's paw`,
      why: "Banishes",
    },
    {
      thing: $item`Cincho de Mayo`,
      why: "-combat forces",
    },
    {
      thing: $item`2002 Mr. Store Catalog`,
      why: "+item, +init, wanderers",
    },
    {
      thing: $familiar`Patriotic Eagle`,
      why: "Niche, Palindome, Twin Paak",
    },
    {
      thing: $item`august scepter`,
      why: "Protestors, Nuns",
    },
    {
      thing: $skill`Just the Facts`,
      why: "Desert, Wishes",
    },
    {
      thing: $familiar`Jill-of-All-Trades`,
      why: "+meat, +item",
    },
    {
      thing: $item`candy cane sword cane`,
      why: "NS key, protestors, black forest, war start, bowling, shore",
    },
  ];
}

function buildLocketList(): Requirement[] {
  return [
    {
      thing: $monster`Astronomer`,
      why: "Star Key",
    },
    {
      thing: $monster`Camel's Toe`,
      why: "Star Key",
    },
    {
      thing: $monster`Baa'baa'bu'ran`,
      why: "Wool",
    },
    {
      thing: $monster`mountain man`,
      why: "Ore (without trainset)",
    },
    {
      thing: $monster`War Frat 151st Infantryman`,
      why: "Outfit (without numberology)",
    },
  ];
}

function buildMiscList(): Requirement[] {
  return [
    {
      thing: $familiar`Oily Woim`,
      why: "Bonus initiative",
    },
    {
      thing: $familiar`Gelatinous Cubeling`,
      why: "Daily dungeon",
    },
    {
      thing: $familiar`Hobo Monkey`,
      why: "Meat drops",
    },
    {
      thing: new Hardcoded(get("poolSharkCount") >= 25, "Permanent pool skill from A Shark's Chum"),
      why: "Haunted billiards room",
    },
  ];
}

function buildRequiredSkillsList(): (Requirement & { thing: Skill })[] {
  return [
    {
      thing: $skill`Saucestorm`,
      why: "Combat",
    },
    {
      thing: $skill`Cannelloni Cocoon`,
      why: "Healing",
    },
    {
      thing: $skill`Pizza Lover`,
      why: "Adv gain, +exp",
    },
  ];
}

function buildRecommendedSkillsList(): (Requirement & { thing: Skill })[] {
  return [
    {
      thing: $skill`Torso Awareness`,
      why: "Shirts",
    },
    {
      thing: $skill`Curse of Weaksauce`,
      why: "Combat",
    },
    {
      thing: $skill`Snokebomb`,
      why: "Banishes",
    },
    {
      thing: $skill`Batter Up!`,
      why: "Banishes",
    },
    {
      thing: $skill`Ire of the Orca`,
      why: "Fury",
    },
    {
      thing: $skill`Lock Picking`,
      why: "Key",
    },
    {
      thing: $skill`Bend Hell`,
      why: "+sleaze dmg",
    },
    {
      thing: $skill`Smooth Movement`,
      why: "-combat",
    },
    {
      thing: $skill`The Sonata of Sneakiness`,
      why: "-combat",
    },
    {
      thing: $skill`Carlweather's Cantata of Confrontation`,
      why: "+combat",
    },
    {
      thing: $skill`Musk of the Moose`,
      why: "+combat",
    },
    {
      thing: $skill`Amphibian Sympathy`,
      why: "Fam weight",
    },
    {
      thing: $skill`Empathy of the Newt`,
      why: "Fam weight",
    },
    {
      thing: $skill`Leash of Linguini`,
      why: "Fam weight",
    },
    {
      thing: $skill`Tao of the Terrapin`,
      why: "QoL, Pixel Key",
    },
    {
      thing: $skill`Walberg's Dim Bulb`,
      why: "+init",
    },
    {
      thing: $skill`Springy Fusilli`,
      why: "+init",
    },
    {
      thing: $skill`Cletus's Canticle of Celerity`,
      why: "+init",
    },
    {
      thing: $skill`Suspicious Gaze`,
      why: "+init",
    },
    {
      thing: $skill`Song of Slowness`,
      why: "+init",
    },
    {
      thing: $skill`Ur-Kel's Aria of Annoyance`,
      why: "ML",
    },
    {
      thing: $skill`Pride of the Puffin`,
      why: "ML",
    },
    {
      thing: $skill`Drescher's Annoying Noise`,
      why: "ML",
    },
    {
      thing: $skill`Fat Leon's Phat Loot Lyric`,
      why: "+item",
    },
    {
      thing: $skill`Singer's Faithful Ocelot`,
      why: "+item",
    },
    {
      thing: $skill`The Polka of Plenty`,
      why: "+meat",
    },
    {
      thing: $skill`Disco Leer`,
      why: "+meat",
    },
    {
      thing: $skill`Garbage Nova`,
      why: "Wall of bones",
    },
    {
      thing: $skill`Gingerbread Mob Hit`,
      why: "Free kill",
    },
    {
      thing: $skill`Shattering Punch`,
      why: "Free kills",
    },
    {
      thing: $skill`Blood Bubble`,
      why: "QoL",
    },
    {
      thing: $skill`Blood Bond`,
      why: "Fam weight",
    },
  ];
}

function buildPullList(optional: boolean): Requirement[] {
  const result: Requirement[] = [];
  for (const pull of pullStrategy.pulls) {
    const items = pull.items().filter((item) => item) as Item[];

    // Ignore dynamic item selection for now
    if (items.length === 0) continue;

    // For cheap items, we will just buy it during the run
    const big_items = items.filter((item) => mallPrice(item) === 0 || mallPrice(item) > 200000);
    // Ignore item lists where the IOTM is just a sub for a cheaper item,
    // except still highlight GAP/navel ring.
    if (big_items.length < items.length && pull.name !== "Runaway IoTM") continue;
    if (pull.optional !== optional) continue;
    result.push({ thing: big_items, why: pull.description ?? "Pull" });
  }
  return result;
}

function checkThing(thing: Thing): [boolean, string] {
  if (thing instanceof Hardcoded) return [thing.have, thing.name];
  if (thing instanceof Familiar) return [have(thing), thing.hatchling.name];
  if (thing instanceof Skill) return [permedSkills().has(thing), thing.name];
  if (thing instanceof Monster)
    return [new Set(CombatLoversLocket.unlockedLocketMonsters()).has(thing), thing.name];
  return [have(thing) || storageAmount(thing) > 0, thing.name];
}

function check(req: Requirement): [boolean, string, Requirement] {
  if (Array.isArray(req.thing)) {
    const checks = req.thing.map(checkThing);

    return [
      checks.find((res) => res[0]) !== undefined,
      checks.map((res) => res[1]).join(" OR "),
      req,
    ];
  } else {
    const res = checkThing(req.thing);
    return [res[0], res[1], req];
  }
}

export function checkRequirements(): void {
  let missing_optional = 0;
  let missing = 0;

  const categories: [string, Requirement[], boolean][] = [
    ["Skills (Required)", buildRequiredSkillsList(), true],
    ["Expensive Pulls (Required)", buildPullList(false), true],
    ["Skills (Optional/Recommended)", buildRecommendedSkillsList(), false],
    ["Expensive Pulls (Optional)", buildPullList(true), false],
    ["IoTMs", buildIotmList(), false],
    ["Miscellany", buildMiscList(), false],
    ["Combat Lover's Locket Monsters", buildLocketList(), false],
  ];
  printHtml(
    "Checking your character... Legend: <font color='#888888'>✓ Have</font> / <font color='red'>X Missing & Required</font> / <font color='black'>X Missing & Optional"
  );
  for (const [name, requirements, required] of categories) {
    if (requirements.length === 0) continue;

    const requirements_info: [boolean, string, Requirement][] = requirements.map(check);
    print(name, "blue");
    for (const [have_it, name, req] of requirements_info.sort((a, b) => a[1].localeCompare(b[1]))) {
      const color = have_it ? "#888888" : required ? "red" : "black";
      const symbol = have_it ? "✓" : "X";
      if (!have_it && !required) missing_optional++;
      if (!have_it && required) missing++;
      print(`${symbol} ${name} - ${req.why}`, color);
    }
    print("");
  }

  // Print the count of missing things
  if (missing > 0) {
    print(
      `You are missing ${missing} required things. This script will not yet work for you.`,
      "red"
    );
    if (missing_optional > 0) print(`You are also missing ${missing_optional} optional things.`);
  } else {
    if (missing_optional > 0) {
      print(
        `You are missing ${missing_optional} optional things. This script may work, but it could do better.`
      );
    } else {
      print(`You have everything! You are the shiniest star. This script should work great.`);
    }
  }
}
