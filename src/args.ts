import { Args, ParseError } from "grimoire-kolmafia";
import { Item } from "kolmafia";
import { $familiar, $item } from "libram";

export const supportedWorksheds = [
  $item`none`,
  $item`model train set`,
  $item`cold medicine cabinet`,
  $item`Asdon Martin keyfob (on ring)`,
  $item`TakerSpace letter of Marque`,
];

function workshedParser(value: string) {
  const item = Item.get(value);
  if (!supportedWorksheds.includes(item))
    return new ParseError(`received ${value} which was not a supported workshed`);
  return item;
}

export const args = Args.create(
  "loopstar",
  'This is a script to complete runs in a single day for supported paths.\n\nRun "loopstar sim" without quotes to check if this script will work for you in a casual run. You can also set the path option (for example "loopstar sim path=smol") to check with different supported paths.\n\nThe arguments accepted by the script are listed below. Note that you can combine multiple options; for example "loopstar pulls=18 fax=false" will save 2 pulls and avoid using a faxbot. Most options also have an associated setting to set an option permanently; for example "set loopstar_pulls=18" will cause the script to always save 2 pulls (unless overriden by using the pulls option at runtime).',
  {
    sim: Args.flag({ help: "Check if you have the requirements to run this script.", setting: "" }),
    path: Args.custom<string>(
      {
        // Fake the default value display;
        // we don't actually want to set a default value for non-sim debug commands like list.
        help: "Path to provide information for in sim. <font color='#888888'>[default: casual]</font>",
        options: [
          ["smol", "A Shrunken Adventurer am I"],
          ["casual", "Casual"],
          ["gyou", "Grey You"],
          ["aftercore", "Aftercore"],
        ],
        setting: "",
      },
      (value: string) => value.toLowerCase(),
      "TEXT"
    ),
    version: Args.flag({ help: "Show script version and exit.", setting: "" }),

    major: Args.group("Major Options", {
      pulls: Args.number({
        help: "Number of pulls to use. Lower this if you would like to save some pulls to use for in-ronin farming. (Note that this argument is not needed if you pull all your farming items before running the script).",
        default: 20,
      }),
      workshed: Args.custom<Item>(
        {
          help: "Workshed item to place in an empty workshed at the start of the run.",
          default: $item`model train set`,
        },
        workshedParser,
        "ITEM"
      ),
      swapworkshed: Args.custom<Item>(
        {
          help: "Workshed item to place in a workshed to replace the cold medicine cabinet.",
          default: $item`none`,
        },
        workshedParser,
        "ITEM"
      ),
    }),
    minor: Args.group("Minor Options", {
      pvp: Args.flag({
        help: "Break your hippy stone at the start of the run.",
        default: false,
      }),
      wand: Args.flag({
        help: "Always get the zap wand.",
        default: false,
      }),
      lgr: Args.flag({
        help: "Pull a lucky gold ring. If pulled, it will be equipped during many combats.",
        default: false,
      }),
      jellies: Args.flag({
        help: "Use your Space Jellyfish to get stench jellies during the war (this may reduce your goose familiar exp).",
        default: false,
      }),
      profitfamiliar: Args.flag({
        help: "Use free familiar turns for familiar related profits.",
        default: false,
      }),
      forcelocket: Args.flag({
        help: "Always equip the combat lover's locket, in order to get monsters inside quickly.",
        default: false,
      }),
      luck: Args.number({
        help: 'Multiply the threshold for stopping execution when "you may just be unlucky". Increasing this can be dangerous and cause the script to waste more adventures; use at your own risk.',
        default: 1,
      }),
      stillsuit: Args.familiar({
        help: "Equip the stillsuit to this familiar during the run",
        setting: "stillsuitFamiliar",
        default: $familiar`Gelatinous Cubeling`,
      }),
      delevel: Args.flag({
        help: "Delevel to level 13 with hot dogs before fighting the NS",
        default: false,
      }),
      tune: Args.string({
        help: "Use your hewn moon-rune spoon to retune to this sign after dieting.",
      }),
      warprofiteering: Args.flag({
        help: "Once we have 20 gauze garters, convert war items into items that autosell for meat",
        default: false,
      }),
    }),
    resources: Args.group("Resource Usage", {
      fax: Args.boolean({
        help: "Use a fax to summon a monster. Set to false if the faxbots are offline.",
        default: true,
      }),
      savebackups: Args.number({
        help: "Number of uses of the backup camera to save (max 11).",
        default: 0,
      }),
      saveember: Args.number({
        help: "Number of sept-ember embers to save (max 7).",
        default: 0,
      }),
      savelocket: Args.number({
        help: "Number of uses of the combat lover's locket to save (max 3).",
        default: 0,
      }),
      saveparka: Args.number({
        help: "Number of spikolodon spikes to save (max 5).",
        default: 0,
      }),
      saveapriling: Args.number({
        help: "Number of apriling band instruments to save (max 2).",
        default: 0,
      }),
      voterbooth: Args.boolean({
        help: "Attempt to use the voter booth if we have access.",
        default: true,
      }),
      pocketprofessor: Args.boolean({
        help: "Attempt to use the pocket professor.",
        default: true,
      }),
    }),
    smol: Args.group("Path: A Shrunken Adventurer am I", {
      skipfork: Args.flag({
        help: "Skip salad forking; note that this may cause failure due to lack of remaining adventures",
        default: false,
      }),
      skipmug: Args.flag({
        help: "Skip frosty mug; note that this may cause failure due to lack of remaining adventures",
        default: false,
      }),
      skipmilk: Args.flag({
        help: "Skip milk of magnesium",
        default: true,
      }),
    }),
    casual: Args.group("Path: Casual", {
      steelorgan: Args.boolean({
        help: "Get the steel organ",
        default: true,
      }),
      stomach: Args.number({
        help: "Amount of stomach to fill.",
        default: 6,
      }),
      liver: Args.number({
        help: "Amount of liver to fill.",
        default: 10,
      }),
      spleen: Args.number({
        help: "Amount of spleen to fill.",
        default: 0,
      }),
      voa: Args.number({
        help: "Value of an adventure, in meat",
        setting: "valueOfAdventure",
        default: 6500,
      }),
      milestoneprice: Args.number({
        help: "Skip the desert with milestones, when their price is cheaper than this (0 to always do desert).",
        default: 0,
      }),
      usedprice: Args.number({
        help: "Maximum price to pay for items to be used up during the run.",
        default: 10000,
      }),
      equipprice: Args.number({
        help: "Maximum price to pay for equipment or items that will not be used up.",
        default: 50000,
      }),
      pantogram: Args.boolean({
        help: "Make Pantogram pants for in-run farming.",
        default: false,
      }),
    }),
    gyou: Args.group("Path: Grey You", {
      absorb: Args.string({
        help: "A comma-separated list of skills to get, in addition to skills that will directly help the run.",
        default: "",
      }),
    }),
    aftercore: Args.group("Path: Aftercore", {
      goal: Args.string({
        help: "An aftercore goal to accomplish.",
        options: [
          ["level", "Level up to level 13"],
          ["organ", "Get your steel organ"],
          ["menagerie", "Unlock the Cobb's Knob Menagerie"],
          ["dis", "Complete the Suburbs of Dis quest"],
        ],
        setting: "",
      }),
    }),
    debug: Args.group("Debug Options", {
      actions: Args.number({
        help: "Maximum number of actions to perform, if given. Can be used to execute just a few steps at a time.",
      }),
      verbose: Args.flag({
        help: "Print out a list of possible tasks at each step.",
        default: false,
      }),
      ignoretasks: Args.string({
        help: "A comma-separated list of task names that should not be done. Can be used as a workaround for script bugs where a task is crashing.",
      }),
      completedtasks: Args.string({
        help: "A comma-separated list of task names the should be treated as completed. Can be used as a workaround for script bugs.",
      }),
      list: Args.flag({
        help: "Show the status of all tasks and exit.",
        setting: "",
      }),
      settings: Args.flag({
        help: "Show the parsed value for all arguments and exit.",
        setting: "",
      }),
      lastasdonbumperturn: Args.number({
        help: "Set the last usage of Asdon Martin: Spring-Loaded Front Bumper, in case of a tracking issue",
        hidden: true,
      }),
      ignorekeys: Args.flag({
        help: "Ignore the check that all keys can be obtained. Typically for hardcore, if you plan to get your own keys",
        default: false,
      }),
      halt: Args.number({
        help: "Halt when you have this number of adventures remaining or fewer",
        default: 0,
      }),
      verify: Args.flag({
        help: "Verify that all supported paths pass basic checks",
        default: false,
        hidden: true,
        setting: "",
      }),
      allocate: Args.flag({
        help: "Check the current task resource allocation",
        default: false,
        hidden: true,
        setting: "",
      }),
    }),
  },
  {
    defaultGroupName: "Information",
    positionalArgs: ["path"],
  }
);

const scriptName = Args.getMetadata(args).scriptName;
export function toTempPref(name: string) {
  return `_${scriptName}_${name}`;
}
