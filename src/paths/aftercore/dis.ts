import { Item, Location, myAscensions, myMaxhp, Phylum, restoreHp, visitUrl } from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $location,
  $locations,
  $monster,
  $phylum,
  get,
  Macro,
  Snapper,
} from "libram";
import { step } from "grimoire-kolmafia";
import { StringProperty } from "libram/dist/propertyTypes";
import { CombatStrategy } from "../../engine/combat";
import { Quest, Task } from "../../engine/task";

type SubQuest = {
  name: string;
  quest: StringProperty;
  location: Location;
  item: Item;
  choices: { enableBosses: number; firstBoss: number; secondBoss: number };
  bossPhylum: Phylum;
  combat: CombatStrategy;
};

export const ANAPEST_ZONES = $locations`The Clumsiness Grove, The Glacier of Jerks, The Maelstrom of Lovers`;

const subquests: SubQuest[] = [
  {
    name: "Clumsiness",
    quest: "questClumsinessGrove",
    location: $location`The Clumsiness Grove`,
    item: $item`clumsiness bark`,
    choices: { enableBosses: 560, firstBoss: 561, secondBoss: 563 },
    bossPhylum: $phylum`beast`,
    combat: new CombatStrategy()
      .macro(new Macro().item($item`clumsiness bark`).repeat(), $monster`The Thorax`)
      .macro(
        new Macro().item([$item`clumsiness bark`, $item`clumsiness bark`]).repeat(),
        $monster`The Bat in the Spats`
      )
      .ignore(),
  },
  {
    name: "Glacier",
    quest: "questGlacierOfJerks",
    location: $location`The Glacier of Jerks`,
    item: $item`dangerous jerkcicle`,
    choices: { enableBosses: 567, firstBoss: 568, secondBoss: 569 },
    bossPhylum: $phylum`beast`,
    combat: new CombatStrategy()
      .macro(
        new Macro().item([$item`dangerous jerkcicle`, $item`dangerous jerkcicle`]).repeat(),
        $monster`Mammon the Elephant`
      )
      .macro(
        new Macro()
          .while_(
            "!pastround 5",
            new Macro().item([$item`dangerous jerkcicle`, $item`dangerous jerkcicle`])
          )
          .attack()
          .repeat(),
        $monster`The Large-Bellied Snitch`
      )
      .ignore(),
  },
  {
    name: "Maelstrom",
    quest: "questMaelstromOfLovers",
    location: $location`The Maelstrom of Lovers`,
    item: $item`jar full of wind`,
    choices: { enableBosses: 564, firstBoss: 565, secondBoss: 566 },
    bossPhylum: $phylum`humanoid`,
    combat: new CombatStrategy()
      .macro(
        new Macro()
          .if_("gotjump", new Macro().attack())
          .while_("!pastround 31", new Macro().item($item`jar full of wind`).attack())
          .attack(),
        $monster`The Terrible Pinch`
      )
      .macro(
        new Macro().item([$item`jar full of wind`, $item`jar full of wind`]).repeat(),
        $monster`Thug 1 and Thug 2`
      )
      .ignore(),
  },
];

const disFactory = (subquest: SubQuest): Task[] => [
  {
    name: `Enable ${subquest.name} Bosses`,
    after: [],
    ready: () => get("lastThingWithNoNameDefeated") < myAscensions(),
    combat: subquest.combat,
    choices: { [subquest.choices.enableBosses]: 1 },
    completed: () => step(subquest.quest) >= 0,
    do: subquest.location,
    effects: [$effect`Dis Abled`],
    limit: { soft: 30 },
    outfit: { modifier: "-combat" },
  },
  {
    name: `Enable First ${subquest.name} Boss`,
    after: [`Enable ${subquest.name} Bosses`],
    combat: subquest.combat,
    choices: { [subquest.choices.firstBoss]: 1 },
    completed: () => step(subquest.quest) >= 1,
    do: subquest.location,
    effects: [$effect`Dis Abled`],
    limit: { soft: 5 },
    outfit: { modifier: "-combat" },
  },
  {
    name: `Hunt First ${subquest.name} Boss`,
    after: [`Enable First ${subquest.name} Boss`],
    acquire: [{ item: subquest.item, num: 6 }],
    combat: subquest.combat,
    boss: true,
    completed: () => step(subquest.quest) >= 2,
    do: subquest.location,
    effects: [
      $effect`Dis Abled`,
      ...(subquest.bossPhylum === $phylum`beast` ? [$effect`A Beastly Odor`] : []),
    ],
    limit: { soft: 5 },
    outfit: { modifier: "mainstat", familiar: $familiar`Red-Nosed Snapper` },
    prepare: () => {
      restoreHp(myMaxhp());
      Snapper.trackPhylum(subquest.bossPhylum);
    },
  },
  {
    name: `Enable Second ${subquest.name} Boss`,
    after: [`Hunt First ${subquest.name} Boss`],
    combat: subquest.combat,
    choices: { [subquest.choices.secondBoss]: 1 },
    completed: () => step(subquest.quest) >= 3,
    do: subquest.location,
    effects: [$effect`Dis Abled`],
    limit: { soft: 5 },
    outfit: { modifier: "-combat" },
  },
  {
    name: `Hunt Second ${subquest.name} Boss`,
    after: [`Enable Second ${subquest.name} Boss`],
    acquire: [{ item: subquest.item, num: 6 }],
    combat: subquest.combat,
    boss: true,
    completed: () => step(subquest.quest) === 999,
    do: subquest.location,
    effects: [
      $effect`Dis Abled`,
      ...(subquest.bossPhylum === $phylum`beast` ? [$effect`A Beastly Odor`] : []),
    ],
    limit: { soft: 5 },
    outfit: { modifier: "mainstat", familiar: $familiar`Red-Nosed Snapper` },
    prepare: () => {
      restoreHp(myMaxhp());
      Snapper.trackPhylum(subquest.bossPhylum);
    },
  },
];

const zip = <T>(items: T[][]) => {
  return items[0].map((_, i) => items.map((j) => j[i]));
};

export const DisQuest: Quest = {
  name: "Suburbs of Dis",
  tasks: [
    ...zip(subquests.map(disFactory)).flat(),
    {
      name: "Boss",
      after: subquests.map((subquest) => `Hunt Second ${subquest.name} Boss`),
      completed: () => get("lastThingWithNoNameDefeated") >= myAscensions(),
      do: () => visitUrl("suburbandis.php?action=dothis&pwd"),
      combat: new CombatStrategy().killHard(),
      outfit: { modifier: "mainstat", familiar: $familiar`Ms. Puck Man` },
      limit: { tries: 1 },
    },
  ],
};
