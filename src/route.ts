import { orderByRoute } from "grimoire-kolmafia";
import { Task } from "./engine/task";

export const ROUTE_WAIT_TO_NCFORCE = 55;
export const ROUTE_WAIT_TO_EVENTUALLY_NCFORCE = 200;

export const routing: string[] = [
  // Break pvp stone ASAP
  "Misc/Break Stone",
  "Pull/All",

  // Start with the basic leveling tasks
  "Toot/Finish",

  // Get basic gear
  "Misc/Workshed",
  "Misc/Goose Exp",
  "Misc/Acquire Birch Battery",
  "Keys/Deck",

  // Level up
  "Misc/Cloud Talk",
  "Summon/War Frat 151st Infantryman", // Summon before leaving level 1
  "Misc/LOV Tunnel",
  "Misc/Daycare",
  "Misc/Bastille",
  "Misc/Mouthwash",
  "Misc/Snojo",

  // Eat as soon as possible
  "Diet/Eat",
  "Diet/Drink",
  "Diet/Numberology",

  // Start quests when able
  "Knob/Start",
  "McLargeHuge/Trapper Request",

  // Unlock island to start YRing
  "Misc/Unlock Island Submarine",
  "Misc/Unlock Island",

  // Initial tasks for delay
  "Manor/Kitchen",
  "Macguffin/Forest", // Start before -combat buffs
  "Mosquito/Burn Delay",
  "Macguffin/Compass", // Unlock desert for ultrahydrated use
  "Manor/Start Floor2",

  // First -combat group
  "War/Enrage", // Open the War ASAP for Yellow rays
  "War/Flyers Start", // Start the war and get flyers
  "War/Flyers End", // End the flyers quest ASAP in case of tracking errors
  "Giant/Basement Finish", // Nice big delay zone before manor is opened
  "Crypt/Cranny",

  "Hidden City/Forest Coin", // First to get meat
  "Hidden City/Forest Map",
  "Hidden City/Forest Fertilizer",
  "Hidden City/Forest Sapling", // Last to sell bar skins
  "Mosquito/Finish",

  // Do summons when ready
  "Summon/Mountain Man",
  "Summon/Astrologer Of Shub-Jigguwatt",
  "Summon/Astronomer",
  "Summon/Camel's Toe",
  "Summon/Baa'baa'bu'ran",

  // Start Hidden city
  "Hidden City/Open Temple",
  "Hidden City/Open City",
  "Hidden City/Open Bowling",
  "Hidden City/Open Office",
  "Hidden City/Open Hospital",
  "Hidden City/Open Apartment",

  // Setup additional -combats
  "Palindome/Copperhead",
  "Manor/Bedroom",
  "Palindome/Bat Snake",
  "Bat/Use Sonar 3", // Reveal more delay
  "Palindome/Cold Snake",
  "McLargeHuge/Climb",
  "Hidden City/Banish Janitors",

  // Get and use clovers
  "Misc/Hermit Clover",
  "McLargeHuge/Trapper Return",
  "Palindome/Protesters",

  // The following 3 tasks should always stay in this order
  "Macguffin/Oasis", // Get ultrahydrated as soon as needed
  "Macguffin/Oasis Drum", // Get drum as soon as pages are gathered
  "Macguffin/Desert", // charge camel for protestors

  // Finish remaining quests
  "Giant/Unlock HITS",
  "Crypt/Alcove",

  // Hidden City
  "Hidden City/Office Files", // Banish janitors under delay
  "Hidden City/Apartment",
  "Hidden City/Hospital",
  "Hidden City/Bowling",

  "Manor/Boss",
  "McLargeHuge/Finish", // Get Eagle beast banish
  "Giant/Finish",
  "Palindome/Talisman",
  "Palindome/Palindome Dudes", // Use Eagle beast banish
  "Crypt/Niche",
  "War/Junkyard End",

  "Tavern/Finish",

  // Setup for +meat/+item set
  "Digital/Vanya",
  "Digital/Megalo",
  "Hidden City/Office Boss", // Get Eagle dude banish
  "Macguffin/Upper Chamber",
  "Orc Chasm/Start Peaks",
  "Orc Chasm/ABoo Carto",
  "War/Open Nuns",

  // Bulk +meat/+item tasks
  "Misc/Shadow Rift",
  "Misc/Shadow Lodestone",
  "War/Nuns",
  "Crypt/Nook",
  "Orc Chasm/ABoo Clues",
  "Digital/Hero",
  "Orc Chasm/Oil Jar",
  "Macguffin/Middle Chamber", // Avoid Eagle beast banish!
  "Orc Chasm/Twin Init Search",
  "Orc Chasm/Twin Init", // Use Eagle dude banish
  "Digital/Key",

  "Keys/Star Key", // Allow for better use of orb
  "Macguffin/Finish",
  "Crypt/Finish",
  "War/Boss Hippie",
  "Orc Chasm/Finish",

  // Finish up with last delay
  "Bat/Finish",
  "Misc/Eldritch Tentacle",
  "Knob/King",

  // Leave open a while for remaining runaways
  "Friar/Finish",

  // Finish last keys
  "Keys/All Heroes",

  "Tower/Naughty Sorceress",
];

export function prioritize(tasks: Task[]): Task[] {
  return orderByRoute(tasks, routing, false);
}
