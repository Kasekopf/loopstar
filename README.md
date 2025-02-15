# Overview

This is a Shrunken Adventurer softcore script, using the [grimoire](https://github.com/Kasekopf/grimoire) framework. It is a fork of [loopgyou](https://github.com/Kasekopf/loop-casual/tree/gyou).

### Strategy

The script is designed to be run as part of a loop. In particular, it expects that something like [garbo](https://github.com/Loathing-Associates-Scripting-Society/garbage-collector) will use the rest of the turns. This means that profitable daily resources (e.g. copiers) are avoided, but other resources (free runaways, kills, some wanderers) are used to save turns where possible.

### Installation

To install the script, use the following command in the KoLMafia CLI.

```
git checkout https://github.com/Kasekopf/loopsmol release
```

### Usage

1. In aftercore, run `loopsmol sim` to verify that the script is installed, and to confirm that you meet the requirements (see below for more details). Unlike `loopgyou`, there is no easy list of requirements to make the script run. A full standard set (2021-2023) and all perms is certainly enough. Not all helpful perms are listed, especially passives.
2. **Make a Pizza of Legend**.
3. Ascend into a Shrunken Adventurer Softcore run. Seal Clubber is the most tested class. Astral mask or astral belt are both useful, but neither is required. Prefer candles for your eurdora. Workshed will be set to `model train set` by default at the start of the run, but this can be changed with the `workshed` argument.
4. Run `loopsmol` and watch it go! If you are more hesitant, you can run `loopsmol actions 10` to only do 10 things and stop.

Options can be changed in a few different ways:

- In the Mafia relay browser, select `loopsmol` from the dropdown in the top right. Be sure to `Save Changes` after modifying a setting.
- By setting a mafia setting, e.g. `set loopsmol_pulls=18`.
- By providing an argument at runtime, e.g. `loopsmol pulls=18`. Note that any arguments provided at runtime override relay and mafia settings.

Run `loopsmol help` for the full set of script commands and options:

```
> loopsmol help

This is a script to complete Shrunken Adventurer Softcore runs. Run "loopsmol sim" without quotes to check if this script will work for you.

You must ascend manually into a Shrunken Adventurer Softcore run before running the script. Seal Clubber under a Vole sign is recommended for now. Astral mask or astral belt are both useful, but neither is required.

The arguments accepted by the script are listed below. Note that you can combine multiple options; for example "loopsmol pulls=18 fax=false" will save 2 pulls and avoid using a faxbot. Most options also have an associated setting to set an option permanently; for example "set loopsmol_pulls=18" will cause the script to always save 2 pulls (unless overriden by using the pulls option at runtime).

Commands:
  sim - Check if you have the requirements to run this script.
  version - Show script version and exit.
  help - Show this message and exit.

Major Options:
  pulls NUMBER - Number of pulls to use. Lower this if you would like to save some pulls to use for in-ronin farming. (Note that this argument is not needed if you pull all your farming items before running the script). [default: 20] [setting: loopsmol_pulls]
  workshed ITEM - Workshed item to place in an empty workshed at the start of the run. [default: model train set] [setting: loopsmol_workshed]
    workshed none - Do nothing
    workshed model train set - Swap to model train set
    workshed cold medicine cabinet - Swap to cold medicine cabinet
    workshed Asdon Martin keyfob - Swap to asdon martin keyfob
  swapworkshed ITEM - Workshed item to place in a workshed to replace the cold medicine cabinet. [default: none] [setting: loopsmol_swapworkshed]
    swapworkshed none - Do nothing
    swapworkshed model train set - Swap to model train set
    swapworkshed cold medicine cabinet - Swap to cold medicine cabinet
    swapworkshed Asdon Martin keyfob - Swap to asdon martin keyfob

Minor Options:
  fax BOOLEAN - Use a fax to summon a monster. Set to false if the faxbots are offline. [default: true] [setting: loopsmol_fax]
  lgr - Pull a lucky gold ring. If pulled, it will be equipped during many combats. [default: false] [setting: loopsmol_lgr]
  jellies - Use your Space Jellyfish to get stench jellies during the war (this may reduce your goose familiar exp). [default: false] [setting: loopsmol_jellies]
  pvp - Break your hippy stone at the start of the run. [default: false] [setting: loopsmol_pvp]
  wand - Always get the zap wand. [default: false] [setting: loopsmol_wand]
  forcelocket - Always equip the combat lover's locket, in order to get monsters inside quickly. [default: false] [setting: loopsmol_forcelocket]
  savelocket NUMBER - Number of uses of the combat lover's locket to save. [default: 0] [setting: loopsmol_savelocket]
  luck NUMBER - Multiply the threshold for stopping execution when "you may just be unlucky". Increasing this can be dangerous and cause the script to waste more adventures; use at your own risk. [default: 1] [setting: loopsmol_luck]
  saveparka NUMBER - Number of spikolodon spikes to save (max 5). [default: 0] [setting: loopsmol_saveparka]
  voterbooth - Attempt to use the voter booth if we have access. [default: true] [setting: loopsmol_voterbooth]
  skipfork - Skip salad forking; note that this may cause failure due to lack of remaining adventures [default: false] [setting: loopsmol_skipfork]
  skipmug - Skip frosty mug; note that this may cause failure due to lack of remaining adventures [default: false] [setting: loopsmol_skipmug]
  skipmilk - Skip milk of magnesium [default: true] [setting: loopsmol_skipmilk]

Debug Options:
  actions NUMBER - Maximum number of actions to perform, if given. Can be used to execute just a few steps at a time. [setting: loopsmol_actions]
  verbose - Print out a list of possible tasks at each step. [default: false] [setting: loopsmol_verbose]
  verboseequip - Print out equipment usage before each task to the CLI. [setting: loopsmol_verboseequip]
  ignoretasks TEXT - A comma-separated list of task names that should not be done. Can be used as a workaround for script bugs where a task is crashing. [setting: loopsmol_ignoretasks]
  completedtasks TEXT - A comma-separated list of task names the should be treated as completed. Can be used as a workaround for script bugs. [setting: loopsmol_completedtasks]
  list - Show the status of all tasks and exit.
  settings - Show the parsed value for all arguments and exit.
  ignorekeys - Ignore the check that all keys can be obtained. Typically for hardcore, if you plan to get your own keys [default: false] [setting: loopsmol_ignorekeys]
  halt NUMBER - Halt when you have this number of adventures remaining or fewer [default: 0] [setting: loopsmol_halt]
```

### Will this script work for me?

Run `loopsmol sim` to see "Is the script intended to work unmodified on my character?". A sample output is below, but it may be slightly out of date.

```
> loopsmol sim

Checking your character... Legend: ✓ Have / X Missing & Required / X Missing & Optional
Skills (Required)
✓ Cannelloni Cocoon - Healing
✓ Pizza Lover - Adv gain, +exp
✓ Saucestorm - Combat

Expensive Pulls (Required)
✓ Pizza of Legend - Pull

Skills (Optional/Recommended)
✓ Amphibian Sympathy - Fam weight
✓ Batter Up! - Banishes
✓ Bend Hell - +sleaze dmg
✓ Carlweather's Cantata of Confrontation - +combat
✓ Cletus's Canticle of Celerity - +init
✓ Curse of Weaksauce - Combat
✓ Disco Leer - +meat
✓ Drescher's Annoying Noise - ML
✓ Empathy of the Newt - Fam weight
✓ Fat Leon's Phat Loot Lyric - +item
✓ Ire of the Orca - Fury
✓ Leash of Linguini - Fam weight
✓ Lock Picking - Key
✓ Musk of the Moose - +combat
✓ Pride of the Puffin - ML
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

Expensive Pulls (Optional)
✓ Buddy Bjorn - Pull
✓ carnivorous potted plant - Pull
✓ deck of lewd playing cards - Pull
✓ Greatest American Pants OR navel ring of navel gazing - Runaway IoTM
✓ lucky gold ring - Farming currency; see the argument "lgr"
✓ mafia thumb ring - Pull
✓ old patched suit-pants - Pull

IoTMs
✓ 2002 Mr. Store Catalog - +item, +init, wanderers
✓ august scepter - Protestors, Nuns
✓ autumn-aton - Lobsterfrogman
✓ baby camelCalf - Desert progress
✓ backup camera - ML, init
✓ Bastille Battalion control rig - +exp
✓ Boxing Daycare - +exp
✓ Cargo Cultist Shorts - Mountain man
✓ Chateau Mantegna - Free rests, +exp
✓ Cincho de Mayo - -combat forces
✓ Clan VIP Lounge key - YRs, +combat
✓ closed-circuit pay phone - Shadow bricks, +meat
✓ Cold medicine cabinet - Get Extrovermectin for profit
✓ Cold medicine cabinet - Meat, MP, Ore, Orc bridge parts, and res
✓ combat lover's locket - Reminiscing
✓ Comprehensive Cartography - Billiards, Friars, Nook, Castle, War start
✓ Cosmic bowling ball - Banishes
✓ cursed magnifying glass - Wanderers
✓ cursed monkey glove - Banishes
✓ Dark Jill-of-All-Trades - +meat, +item
✓ Daylight Shavings Helmet - +meat, +item
✓ Deck of Every Card - A key for the NS tower, stone wool, ore
✓ designer sweatpants - Sleaze damage, +init
✓ Distant Woods Getaway Brochure - +exp
✓ Emotionally Chipped - Banish, -combat, items
✓ familiar scrapbook - +exp
✓ Fourth of May Cosplay Saber - Familiar Weight
✓ grey gosling - Duplication drones
✓ industrial fire extinguisher - Harem outfit, Bat hole, stone wool, Crypt, Ultrahydrated, Shadow bricks
✓ January's Garbage Tote - +item, +meat
✓ June cleaver - Tavern, +adv
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
✓ Moping Artistic Goth Kid - Wanderers
✓ Powerful Glove - Pixels
✓ protonic accelerator pack - Wanderers
✓ S.I.T. Course Completion Certificate - Profit, +meat
✓ shortest-order cook - Kill the Wall of Skin, initial exp
✓ sinistral homunculus - Carn plant
✓ sleeping patriotic eagle - Niche, Palindome, Twin Paak
✓ SongBoom™ BoomBox - Meat and special seasonings
✓ space planula - Stench jellies for profit; see the argument "jellies"
✓ Summon Clip Art - Amulet coin
✓ Unagnimated Gnome - Adv gain
✓ unbreakable umbrella - -combat modifier, ML
✓ unwrapped knock-off retro superhero cape - Slay the dead in crypt
✓ Voting Booth - Wanderers

Miscellany
✓ hobo monkey - Meat drops
✓ Permanent pool skill from A Shark's Chum - Haunted billiards room
✓ woim - Bonus initiative

Combat Lover's Locket Monsters
✓ Astronomer - Star Key
✓ Baa'baa'bu'ran - Wool
✓ Camel's Toe - Star Key
✓ mountain man - Ore (without trainset)

You have everything! You are the shiniest star. This script should work great.
```

### Manual Installation

If you would like to make your own modifications to the script, the recommended way is to compile and install the script manually.

1. Compile the script, following instructions in the [kol-ts-starter](https://github.com/docrostov/kol-ts-starter).
2. Copy loopsmol.js from KoLmafia/scripts/loopsmol to your Mafia scripts directory.
