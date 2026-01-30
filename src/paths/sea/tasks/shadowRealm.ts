import {
  $effect,
  $effects,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $monsters,
  $skill,
  ClosedCircuitPayphone,
  get,
  have,
  Macro,
} from "libram";
import { CombatStrategy } from "grimoire-kolmafia";
import { canAdventure, cliExecute, holiday, mpCost, myMp, use, useSkill, visitUrl } from "kolmafia";
import { Quest } from "../../../engine/task";

const bestRift = () =>
  canAdventure($location`Shadow Rift (The Misspelled Cemetary)`)
    ? $location`Shadow Rift (The Misspelled Cemetary)`
    : canAdventure($location`Shadow Rift (The Nearby Plains)`)
      ? $location`Shadow Rift (The Nearby Plains)`
      : $location`Shadow Rift (The Right Side of the Tracks)`;

export const ShadowRealmTask: Quest = {
  name: "Shadow Realm",
  tasks: [
    {
      name: "Open Shadow Realm",
      after: ["Startup/Guild Pants Unlock", "Startup/Unlock Guild"],
      completed: () => !have($item`closed-circuit pay phone`) || get("_shadowAffinityToday"),
      do: () => {
        ClosedCircuitPayphone.chooseQuest(({ entity }) => {
          if (entity === $monster`shadow spire`) {
            return 1;
          } else {
            return 2;
          }
        });
        if (holiday().includes("April Fool's Day")) visitUrl("questlog.php?which=7");
      },
      freeaction: true,
      limit: { tries: 1 },
      effects: $effects`The Ballad of Richie Thingfinder, Chorale of Companionship`,
      // post: () => abort()
    },
    {
      name: "Express Card",
      completed: () => !have($item`Platinum Yendorian Express Card`) || get("expressCardUsed"),
      do: () => {
        use($item`lodestone`);
        cliExecute("cast party soundtrack");
        const numCasts = Math.floor(myMp() / mpCost($skill`Bind Spice Ghost`));
        useSkill($skill`Bind Spice Ghost`, numCasts);
        use($item`Platinum Yendorian Express Card`);
      },
      limit: { soft: 11 },
    },
    {
      name: "Shadow Realm Fights",
      after: ["Open Shadow Realm"],
      completed: () =>
        !have($item`closed-circuit pay phone`) ||
        get("_shadowAffinityToday") ||
        !have($effect`Shadow Affinity`),
      prepare: () => ClosedCircuitPayphone.chooseQuest(() => 2),
      do: bestRift(),
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.step("pickpocket")
            .while_("hasskill 226", Macro.skill($skill`Perpetrate Mild Evil`))
            .trySkill($skill`Swoop like a Bat`)
            .tryItem("11646")
            .trySkill($skill`Darts: Throw at %part1`)
            .while_(`hasskill 7448 && !pastround 24`, Macro.skill($skill`Douse Foe`))
            .trySkill($skill`Sea *dent: Talk to Some Fish`)
            .trySkillRepeat($skill`Shieldbutt`);
        }, $monster`shadow slab`)
        .macro((): Macro => {
          return Macro.step("pickpocket")
            .externalIf(
              !have($item`shadow bread`, 3) && !have($item`shadow stick`, 3),
              Macro.trySkill($skill`Swoop like a Bat`)
            )
            .trySkill($skill`Sea *dent: Talk to Some Fish`)
            .trySkill($skill`Darts: Throw at %part1`)
            .externalIf(
              !get("_aprilShowerNorthernExplosion"),
              Macro.trySkill($skill`Northern Explosion`)
            )
            .trySkillRepeat($skill`Shieldbutt`);
        }, $monsters`shadow guy, shadow tree`)
        .macro((): Macro => {
          return Macro.trySkill($skill`Swoop like a Bat`).trySkillRepeat(
            $skill`Raise Backup Dancer`
          );
        }),
      post: () => {
        ClosedCircuitPayphone.submitQuest();
        if (!get("_seadentWaveUsed")) useSkill($skill`Sea *dent: Summon a Wave`);
      },
      choices: {
        1566: 1,
      },
      freeaction: true,
      limit: { turns: 1 },
      outfit: {
        familiar: $familiar`Jill-of-All-Trades`,
        equip: $items`Everfull Dart Holster, spring shoes, Monodent of the Sea, April Shower Thoughts shield, bat wings, toy Cupid bow, Flash Liquidizer Ultra Dousing Accessory, prismatic beret`,
      },
    },
    {
      name: "Use Candy Map",
      ready: () => have($item`map to a candy-rich block`),
      completed: () => holiday().includes("Halloween") || get("_mapToACandyRichBlockUsed"),
      do: () => {
        cliExecute("use map to a candy-rich block");
      },
      freeaction: true,
      limit: { soft: 11 },
    },
  ],
};
