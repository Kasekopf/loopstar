import {
    $familiar,
    $items,
    $location,
    $monster,
    $skill,
    BurningLeaves,
    CyberRealm,
    get,
    have,
    Macro,
} from "libram";
import { Quest } from "../../../engine/task";
import { CombatStrategy } from "../../../engine/combat";
import { Location, useSkill } from "kolmafia";

type FreeZone = {
    location: Location;
    score: () => number;
    bias?: number;
};

function bestFreeZone(): Location {
    const saved = get("_seadentWaveZone", $location.none);
    const validZones = [
        $location`The Neverending Party`,
        $location`The X-32-F Combat Training Snowman`,
        $location`Cyberzone 1`,
    ];
    if (validZones.includes(saved)) return saved;

    const zones: FreeZone[] = [
        {
            location: $location`The Neverending Party`,
            score: () =>
                get("neverendingPartyAlways")
                    ? 10 - get("_neverendingPartyFreeTurns")
                    : 0,
            bias: 1, // NEP preference
        },
        {
            location: $location`The X-32-F Combat Training Snowman`,
            score: () =>
                get("snojoAvailable")
                    ? 10 - get("_snojoFreeFights")
                    : 0,
        },
        {
            location: $location`Cyberzone 1`,
            score: () =>
                CyberRealm.have() && have($skill`OVERCLOCK(10)`)
                    ? 10 - get("_cyberFreeFights")
                    : 0,
        },
    ];

    return zones
        .map((z) => ({
            location: z.location,
            value: z.score() + (z.bias ?? 0),
        }))
        .sort((a, b) => b.value - a.value)[0].location;
}

export const FreeFightZoneTask: Quest = {
    name: "Free Fights for Fishy",
    tasks: [
        {
            name: "Free Zone Fights",
            ready: () => get("neverendingPartyAlways"),
            completed: () => get("_neverendingPartyFreeTurns") >= 10,
            do: bestFreeZone(),
            combat: new CombatStrategy()
                .macro((): Macro => {
                    const zone = bestFreeZone();

                    return Macro.externalIf(
                        zone === $location`Cyberzone 1`,
                        // CYBERREALM
                        Macro.skill($skill`Throw Cyber Rock`).repeat()
                    ).externalIf(
                        zone !== $location`Cyberzone 1`,
                        // NON-CYBERREALM
                        Macro.trySkill($skill`Sea *dent: Talk to Some Fish`)
                            .externalIf(
                                zone === $location`The Neverending Party`,
                                Macro.trySkill($skill`BCZ: Refracted Gaze`)
                            )
                    );
                }).kill(),
            limit: { soft: 11 },
            outfit: {
                equip: $items`Everfull Dart Holster, spring shoes, Monodent of the Sea, toy Cupid bow, rake`,
                familiar: have($familiar`red-nosed snapper`) ? $familiar`red-nosed snapper` : $familiar`peace turkey`
            },
            post: () => !get("_seadentWaveUsed") ? useSkill($skill`Sea *dent: Summon a Wave`) : null
        },
        {
            name: "Free Fights (Barroom)",
            completed: () => !get("ownsSpeakeasy") || get("_speakeasyFreeFights") >= 3,
            do: $location`An Unusually Quiet Barroom Brawl`,
            combat: new CombatStrategy().killHard(),
            outfit: {
                modifier: "item",
                familiar: $familiar`Peace Turkey`,
                equip: $items`Everfull Dart Holster, spring shoes, April Shower Thoughts Shield`,
                avoid: $items`Peridot of Peril`,
            },
            limit: { soft: 11 },
        },
        {
            name: "Free Fights (Leaves)",
            completed: () =>
                !BurningLeaves.have() ||
                BurningLeaves.numberOfLeaves() < 11 ||
                get("_leafMonstersFought") >= 5,
            do: () => {
                BurningLeaves.burnLeaves(11);
            },
            combat: new CombatStrategy().killHard(),
            outfit: {
                familiar: $familiar`Peace Turkey`,
                equip: $items`Everfull Dart Holster, spring shoes, Monodent of the Sea, April Shower Thoughts Shield, toy Cupid bow`,
            },
            limit: { soft: 11 },
        },
    ],
};
