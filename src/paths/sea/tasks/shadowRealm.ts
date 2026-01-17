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
import { cliExecute, holiday, mpCost, myHash, myMp, use, useSkill, visitUrl } from "kolmafia";
import { Quest } from "../../../engine/task";

export const ShadowRealmTask: Quest = {
  name: "Shadow Realm",
  tasks: [
    {
      name: "Open Shadow Realm",
      after: ["Startup/Guild Pants Unlock"],
      completed: () => !have($item`closed-circuit pay phone`) || get("_shadowAffinityToday"),
      do: () =>
        ClosedCircuitPayphone.chooseQuest(({ entity }) => {
          if (entity === $monster`Shadow Spire`) {
            return 1;
          } else {
            return 2;
          }
        }),
      freeaction: true,
      limit: { soft: 11 },
      effects: $effects`The Ballad of Richie Thingfinder, Chorale of Companionship`,
      // post: () => abort()
    },
    {
      name: "Displaced Fish Shadow Realm",
      after: ["Open Shadow Realm"],
      completed: () =>
        !have($item`closed-circuit pay phone`) ||
        have($item`displaced fish`) ||
        get("bwApronMealsEaten") > 0 ||
        !have($effect`Shadow Affinity`),
      do: $location`Shadow Rift (The Misspelled Cemetary)`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return (
            Macro.step("pickpocket")
              .while_("hasskill 226", Macro.skill($skill`Perpetrate Mild Evil`))
              .trySkill($skill`Swoop like a Bat`)
              //while !match "The force of the blow knocks something" && !times 3
              .tryItem("11646")
              .trySkill($skill`Darts: Throw at %part1`)
              .while_(`hasskill 7448 && !pastround 25`, Macro.skill($skill`Douse Foe`))
              .trySkill($skill`CLEESH`)
              .trySkillRepeat($skill`Saucegeyser`)
          );
        }, $monster`shadow slab`)
        .macro((): Macro => {
          return Macro.step("pickpocket")
            .trySkill($skill`Swoop like a Bat`)
            .trySkill($skill`CLEESH`)
            .trySkill($skill`Darts: Throw at %part1`)
            .trySkillRepeat($skill`Shieldbutt`);
        }, $monsters`shadow guy, shadow tree`),
      freeaction: true,
      limit: { soft: 11 },
      outfit: {
        familiar: $familiar`Jill-of-All-Trades`,
        modifier: "item",
        equip: $items`Everfull Dart Holster, spring shoes, designer sweatpants, Monodent of the Sea, April Shower Thoughts shield, bat wings, toy Cupid bow, Flash Liquidizer Ultra Dousing Accessory, prismatic beret`,
      },
    },

    {
      name: "Express Card",
      after: ["Eat Apron Meal"],
      completed: () => !have($item`Platinum Yendorian Express Card`) || get("expressCardUsed"),
      do: () => {
        use($item`lodestone`);
        cliExecute("cast party soundtrack");
        let numCasts = Math.floor(myMp() / mpCost($skill`Bind Spice Ghost`));
        useSkill($skill`Bind Spice Ghost`, numCasts);
        use($item`Platinum Yendorian Express Card`);
      },
      limit: { soft: 11 },
    },
    {
      name: "Remaining Shadow Realm Fights",
      after: ["Displaced Fish Shadow Realm", "Eat Apron Meal", "Express Card"],
      completed: () =>
        !have($item`closed-circuit pay phone`) ||
        (get("_shadowAffinityToday") &&
          !have($effect`Shadow Affinity`) &&
          get("encountersUntilSRChoice") !== 0),
      do: $location`Shadow Rift (The Misspelled Cemetary)`,
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
      },
      freeaction: true,
      limit: { soft: 11 },
      outfit: {
        familiar: $familiar`Jill-of-All-Trades`,
        equip: $items`Everfull Dart Holster, spring shoes, Monodent of the Sea, April Shower Thoughts shield, bat wings, toy Cupid bow, Flash Liquidizer Ultra Dousing Accessory, prismatic beret`,
      },
    },
    {
      name: "Use Candy Map",
      completed: () => holiday().includes("Halloween") || get("_mapToACandyRichBlockUsed"),
      do: () => {
        cliExecute("use map to a candy-rich block");
      },
      freeaction: true,
      limit: { soft: 11 },
    },
  ],
};
