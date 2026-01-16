import {
  $familiar,
  $item,
  $items,
  $location,
  $monsters,
  $skill,
  get,
  have,
  Macro,
  withChoice,
} from "libram";
import { CombatStrategy } from "grimoire-kolmafia";
import { useSkill } from "kolmafia";
import { Quest } from "../../../engine/task";

export const CyberRealmTask: Quest = {
  name: "Cyber Realm",
  tasks: [
    {
      name: "First Cyber Adventure",
      after: ["Shadow Realm/Eat Apron Meal"],
      completed: () => !have($item`server room key`) || get("_cyberFreeFights") >= 1,
      do: $location`Cyberzone 1`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.step("pickpocket")
            .trySkillRepeat($skill`Darts: Throw at %part1`)
            .trySkill($skill`Sea *dent: Throw a Lightning Bolt`);
        }, $monsters`redhat hacker, bluehat hacker, greenhat hacker, purplehat hacker, greyhat hacker`)
        .macro((): Macro => {
          return Macro.trySkillRepeat($skill`Throw Cyber Rock`);
        }, $monsters`zombie process, botfly, network worm, ICE man, rat (remote access trojan), firewall, ICE barrier, corruption quarantine, parental controls, null container`),
      outfit: {
        familiar: $familiar`Peace Turkey`,
        equip: $items`Everfull Dart Holster, spring shoes, Monodent of the Sea, toy Cupid bow, rake`,
        avoid: $items`bat wings`,
      },
      limit: { soft: 11 },
    },
    {
      name: "Flood Zone",
      after: ["First Cyber Adventure"],
      completed: () => !have($item`server room key`) || get("_seadentWaveZone") !== "" || true,
      do: () => {
        withChoice(1566, 1, () => useSkill($skill`Sea *dent: Summon a Wave`));
      },
      limit: { soft: 11 },
      outfit: { equip: $items`Monodent of the Sea` },
    },
    {
      name: "Finish Cyber Realm",
      after: ["Flood Zone", "First Cyber Adventure"],
      completed: () => !have($item`server room key`) || get("_cyberFreeFights") >= 10,
      do: $location`Cyberzone 1`,
      combat: new CombatStrategy()
        .macro((): Macro => {
          return Macro.step("pickpocket")
            .trySkillRepeat($skill`Darts: Throw at %part1`)
            .trySkill($skill`Sea *dent: Throw a Lightning Bolt`);
        }, $monsters`redhat hacker, bluehat hacker, greenhat hacker, purplehat hacker, greyhat hacker`)
        .macro((): Macro => {
          return Macro.trySkillRepeat($skill`Throw Cyber Rock`);
        }, $monsters`zombie process, botfly, network worm, ICE man, rat (remote access trojan), firewall, ICE barrier, corruption quarantine, parental controls, null container`),
      limit: { soft: 11 },
      outfit: {
        familiar: $familiar`Peace Turkey`,
        equip: $items`Everfull Dart Holster, spring shoes, Monodent of the Sea, toy Cupid bow, rake`,
        avoid: $items`bat wings`,
      },
    },
  ],
};
