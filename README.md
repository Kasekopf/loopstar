# Overview

This is a 1-day ascension script, using the [grimoire](https://github.com/Kasekopf/grimoire) framework. Supported paths at the moment are:

- Casual
- A Shrunken Adventurer am I

The script is designed to be run as part of a loop. In particular, it expects that something like [garbo](https://github.com/Loathing-Associates-Scripting-Society/garbage-collector) will use the rest of the turns. This means that some profitable daily resources (e.g. copiers) may be saved for aftercore, but most resources (free runaways, kills, some wanderers) are used to save turns where possible.

## Installation

To install the script, use the following command in the KoLMafia CLI.

```
git checkout https://github.com/Kasekopf/loopstar release
```

## Usage

1. In aftercore, run `loopstar sim` to verify that the script is installed, and to confirm that you meet the requirements. By default, the requirements will be listed to perform a "Casual" run. To view requirements for other paths, set the path argument like `loopstar sim path=smol`. See below for more details.
2. Ensure you satisfy the pre-run requirements for your desired run, listed below.
3. Ascend into your desired run, considering the recommendations below.
4. Run `loopstar` and watch it go! If you are more hesitant, you can run `loopstar actions 10` to only do 10 things and stop.

# Requirements

## Requirements for Casual

- Run `loopstar sim` to see requirements. Note that the required items listed are enough that the script will not crash, but _not_ necessarily enough to finish the run in one day.

Other Recommendations:

- Seal Clubber is the most tested class.
- Choose astral pilsners from The Deli Lama.
- Workshed will be set to `model train set` by default at the start of the run, but this can be changed with the `workshed` argument. The best workshed is probably `Asdon Martin keyfob (on ring)`. A `TakerSpace letter of Marque` is also a good option; in that case, see the `swapworkshed` arg as well.
- Consider the `stomach`, `liver`, and `spleen` arguments. The default values are designed for maximally green players. If you are missing items, you will probably to increase these. If you run out of adventures during the run, you can increases these arguments and rerun.
- If you are running something like [philter](https://github.com/Loathing-Associates-Scripting-Society/philter) or [keeping tabs](https://github.com/loathers/keeping-tabs), it may be worth checking that you are not autoselling anything that the script needs (or it will rebuy it every run). See [this file](src/paths/casual/acquire.ts) for a list.

## Requirements for Shrunken Adventurer

- Run `loopstar sim path=smol` to see requirements. Note that the required items listed are enough that the script will not crash, but _not_ necessarily enough to finish the run in one day. As a baseline, 2021-2023 standard set and all skill perms is certainly enough to finish in one day.
- **You must have a Pizza of Legend (or one of the other 2 legend foods) saved in Hagnk's Storage.** You will not be able to cook this item after ascending.

Other Recommendations:

- Seal Clubber is the most tested class.
- Choose astral pilsners from The Deli Lama.
- Astral mask or astral belt are both useful, but neither is required.
- Prefer candles for your eurdora.
- Workshed will be set to `model train set` by default at the start of the run, but this can be changed with the `workshed` argument. A `TakerSpace letter of Marque` is also a good option; in that case, see the `swapworkshed` arg as well.

# Options

Options can be changed in a few different ways:

- In the Mafia relay browser, select `loopstar` from the dropdown in the top right. Be sure to `Save Changes` after modifying a setting.
- By setting a mafia setting, e.g. `set loopstar_pulls=18`.
- By providing an argument at runtime, e.g. `loopstar pulls=18`. Note that any arguments provided at runtime override relay and mafia settings.

Run `loopstar help` for the full set of script commands and options:

```
> loopstar help

This is a script to complete runs in a single day for supported paths.

Run "loopstar sim" without quotes to check if this script will work for you in a casual run. You can also set the path option (for example "loopstar sim path=smol") to check with different supported paths.

The arguments accepted by the script are listed below. Note that you can combine multiple options; for example "loopstar pulls=18 fax=false" will save 2 pulls and avoid using a faxbot. Most options also have an associated setting to set an option permanently; for example "set loopstar_pulls=18" will cause the script to always save 2 pulls (unless overriden by using the pulls option at runtime).

Information:
  sim - Check if you have the requirements to run this script.
  path TEXT - Path to provide information for in sim. [default: casual]
    path smol - A Shrunken Adventurer am I
    path casual - Casual
    path aftercore - Aftercore
  version - Show script version and exit.
  help - Show this message and exit.

Major Options:
  pulls NUMBER - Number of pulls to use. Lower this if you would like to save some pulls to use for in-ronin farming. (Note that this argument is not needed if you pull all your farming items before running the script). [default: 20] [setting: loopstar_pulls]
  workshed ITEM - Workshed item to place in an empty workshed at the start of the run. [default: model train set] [setting: loopstar_workshed]
  swapworkshed ITEM - Workshed item to place in a workshed to replace the cold medicine cabinet. [default: none] [setting: loopstar_swapworkshed]

Minor Options:
  pvp - Break your hippy stone at the start of the run. [default: false] [setting: loopstar_pvp]
  wand - Always get the zap wand. [default: false] [setting: loopstar_wand]
  lgr - Pull a lucky gold ring. If pulled, it will be equipped during many combats. [default: false] [setting: loopstar_lgr]
  jellies - Use your Space Jellyfish to get stench jellies during the war (this may reduce your goose familiar exp). [default: false] [setting: loopstar_jellies]
  profitfamiliar - Use free familiar turns for familiar related profits. [default: false] [setting: loopstar_profitfamiliar]
  forcelocket - Always equip the combat lover's locket, in order to get monsters inside quickly. [default: false] [setting: loopstar_forcelocket]
  luck NUMBER - Multiply the threshold for stopping execution when "you may just be unlucky". Increasing this can be dangerous and cause the script to waste more adventures; use at your own risk. [default: 1] [setting: loopstar_luck]
  stillsuit FAMILIAR - Equip the stillsuit to this familiar during the run [default: Gelatinous Cubeling] [setting: stillsuitFamiliar]
  delevel - Delevel to level 13 with hot dogs before fighting the NS [default: false] [setting: loopstar_delevel]
  tune TEXT - Use your hewn moon-rune spoon to retune to this sign after dieting. [setting: loopstar_tune]
  warprofiteering - Once we have 20 gauze garters, convert war items into items that autosell for meat [default: false] [setting: loopstar_warprofiteering]

Resource Usage:
  fax BOOLEAN - Use a fax to summon a monster. Set to false if the faxbots are offline. [default: true] [setting: loopstar_fax]
  savebackups NUMBER - Number of uses of the backup camera to save (max 11). [default: 0] [setting: loopstar_savebackups]
  saveember NUMBER - Number of sept-ember embers to save (max 7). [default: 0] [setting: loopstar_saveember]
  savelocket NUMBER - Number of uses of the combat lover's locket to save (max 3). [default: 0] [setting: loopstar_savelocket]
  saveparka NUMBER - Number of spikolodon spikes to save (max 5). [default: 0] [setting: loopstar_saveparka]
  saveapriling NUMBER - Number of apriling band instruments to save (max 2). [default: 0] [setting: loopstar_saveapriling]
  voterbooth BOOLEAN - Attempt to use the voter booth if we have access. [default: true] [setting: loopstar_voterbooth]

Path: A Shrunken Adventurer am I:
  skipfork - Skip salad forking; note that this may cause failure due to lack of remaining adventures [default: false] [setting: loopstar_skipfork]
  skipmug - Skip frosty mug; note that this may cause failure due to lack of remaining adventures [default: false] [setting: loopstar_skipmug]
  skipmilk - Skip milk of magnesium [default: true] [setting: loopstar_skipmilk]

Path: Casual:
  steelorgan BOOLEAN - Get the steel organ [default: true] [setting: loopstar_steelorgan]
  stomach NUMBER - Amount of stomach to fill. [default: 6] [setting: loopstar_stomach]
  liver NUMBER - Amount of liver to fill. [default: 10] [setting: loopstar_liver]
  spleen NUMBER - Amount of spleen to fill. [default: 0] [setting: loopstar_spleen]
  voa NUMBER - Value of an adventure, in meat [default: 6500] [setting: valueOfAdventure]
  milestoneprice NUMBER - Skip the desert with milestones, when their price is cheaper than this. [default: 0] [setting: loopstar_milestoneprice]
  usedprice NUMBER - Maximum price to pay for items to be used up during the run. [default: 10000] [setting: loopstar_usedprice]
  equipprice NUMBER - Maximum price to pay for equipment or items that will not be used up. [default: 50000] [setting: loopstar_equipprice]

Path: Aftercore:
  goal TEXT - An aftercore goal to accomplish.
    goal level - Level up to level 13.
    goal organ - Get your steel organ.

Debug Options:
  actions NUMBER - Maximum number of actions to perform, if given. Can be used to execute just a few steps at a time. [setting: loopstar_actions]
  verbose - Print out a list of possible tasks at each step. [default: false] [setting: loopstar_verbose]
  ignoretasks TEXT - A comma-separated list of task names that should not be done. Can be used as a workaround for script bugs where a task is crashing. [setting: loopstar_ignoretasks]
  completedtasks TEXT - A comma-separated list of task names the should be treated as completed. Can be used as a workaround for script bugs. [setting: loopstar_completedtasks]
  list - Show the status of all tasks and exit.
  settings - Show the parsed value for all arguments and exit.
  ignorekeys - Ignore the check that all keys can be obtained. Typically for hardcore, if you plan to get your own keys [default: false] [setting: loopstar_ignorekeys]
  halt NUMBER - Halt when you have this number of adventures remaining or fewer [default: 0] [setting: loopstar_halt]
```

# Will this script work for me?

Run `loopstar sim` to see "Is the script intended to work unmodified on my character?". By default, this will be for a "Casual" run; to view requirements for other paths, set the path argument like `loopstar sim path=smol`. See below for more details. A sample output is below, but it may be slightly out of date.

```
> loopstar sim

Checking your character... Legend: ✓ Have / X Missing & Required / X Missing & Optional / ⊘ Missing & Disabled
Skills (Required)
✓ Cannelloni Cocoon - Healing
✓ Saucestorm - Combat

IoTMs
✓ 2002 Mr. Store Catalog - +item, +init, wanderers
✓ august scepter - Protestors, Nuns
✓ autumn-aton - Lobsterfrogman
✓ baby camelCalf - Desert progress
✓ backup camera - ML, init
✓ Bastille Battalion control rig - +exp
✓ Boxing Daycare - +exp
✓ candy cane sword cane - NS key, protestors, black forest, war start, bowling, shore
✓ Chateau Mantegna - Free rests, +exp
✓ Cincho de Mayo - -combat forces
✓ Clan VIP Lounge key - YRs, +combat
✓ closed-circuit pay phone - Shadow bricks, +meat
✓ Cold medicine cabinet - Get Extrovermectin for profit
✓ Comprehensive Cartography - Billiards, Friars, Nook, Castle, War start
✓ Cosmic bowling ball - Banishes
✓ cursed magnifying glass - Wanderers
✓ cursed monkey's paw - Banishes
✓ Dark Jill-of-All-Trades - +meat, +item
✓ Daylight Shavings Helmet - +meat, +item
✓ Deck of Every Card - A key for the NS tower, stone wool, ore
✓ designer sweatpants - Sleaze damage, +init
✓ Distant Woods Getaway Brochure - +exp
✓ Emotionally Chipped - Banish, -combat, items
✓ familiar scrapbook - +exp
✓ Fourth of May Cosplay Saber - Familiar Weight
✓ industrial fire extinguisher - Harem outfit, Bat hole, stone wool, Crypt, Ultrahydrated, Shadow bricks
✓ January's Garbage Tote - +item, +meat
✓ June cleaver - Tavern, Adv
✓ Jurassic Parka - Meat, ML, -combat forces
✓ Just the Facts - Desert, Wishes
✓ Kramco Sausage-o-Matic™ - Wanderers
✓ Kremlin's Greatest Briefcase - Banishes
✓ latte lovers member's mug - Banishes
✓ li'l orphan tot - +item
✓ Lil' Doctor™ bag - Banish, instakill, +item
✓ Lovebugs - Crypt, Desert
✓ LOV Tunnel - +exp
✓ miniature crystal ball - Monster prediction
✓ Model train set - Meat, MP, Ore, Orc bridge parts, and res
✓ Moping Artistic Goth Kid - Wanderers
✓ protonic accelerator pack - Wanderers
✓ S.I.T. Course Completion Certificate - Profit, +meat
✓ shortest-order cook - Kill the Wall of Skin, initial exp
✓ sinistral homunculus - Carn plant
✓ sleeping patriotic eagle - Niche, Palindome, Twin Paak
✓ SongBoom™ BoomBox - Meat and special seasonings
✓ space planula - Stench jellies for profit; see the argument "jellies"
✓ Summon Clip Art - Amulet coin
✓ Unagnimated Gnome - Adv
✓ unbreakable umbrella - -combat modifier, ML
✓ unwrapped knock-off retro superhero cape - Slay the dead in crypt
✓ Voting Booth - Wanderers

Expensive Items
✓ carnivorous potted plant - Free kills
✓ crepe paper parachute cape - Monster targetting
✓ deck of lewd playing cards - Protestors
✓ Greatest American Pants OR navel ring of navel gazing - Free runs
✓ lucky gold ring - Farming currency; see the argument "lgr"
✓ mafia thumb ring - Adv
✓ Shore Inc. Ship Trip Scrip - Shore trips

Skills
✓ Amphibian Sympathy - Fam weight
✓ Batter Up! - Banishes
✓ Bend Hell - +sleaze dmg
✓ Blood Bond - Fam weight
✓ Blood Bubble - QoL
✓ Calculate the Universe - Frat outfit, adv
✓ Carlweather's Cantata of Confrontation - +combat
✓ Cletus's Canticle of Celerity - +init
✓ Curse of Weaksauce - Combat
✓ Disco Leer - +meat
✓ Drescher's Annoying Noise - ML
✓ Empathy of the Newt - Fam weight
✓ Fat Leon's Phat Loot Lyric - +item
✓ Garbage Nova - Wall of bones
✓ Gingerbread Mob Hit - Free kill
✓ Ire of the Orca - Fury
✓ Leash of Linguini - Fam weight
✓ Lock Picking - Key
✓ Musk of the Moose - +combat
✓ Pride of the Puffin - ML
✓ Saucegeyser - Combat
✓ Shattering Punch - Free kills
✓ Singer's Faithful Ocelot - +item
✓ Smooth Movement - -combat
✓ Snokebomb - Banishes
✓ Song of Slowness - +init
✓ Springy Fusilli - +init
✓ Suspicious Gaze - +init
✓ Tao of the Terrapin - QoL, Pixel Key
✓ The Polka of Plenty - +meat
✓ The Sonata of Sneakiness - -combat
✓ Torso Awareness - Shirts
✓ Ur-Kel's Aria of Annoyance - ML
✓ Walberg's Dim Bulb - +init

Miscellany
✓ hobo monkey - Meat drops
✓ Permanent pool skill from A Shark's Chum - Haunted billiards room
✓ woim - Bonus initiative

You have everything! You are the shiniest star. This script should work great.
```

### Manual Installation

If you would like to make your own modifications to the script, the recommended way is to compile and install the script manually.

1. Compile the script, following instructions in the [kol-ts-starter](https://github.com/docrostov/kol-ts-starter).
2. Copy `loopstar.js` and `loopstar_choice.js` from `dist/KoLmafia/scripts/loopstar` to your Mafia scripts directory (or set up a symlink).
