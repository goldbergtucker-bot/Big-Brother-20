[README.md](https://github.com/user-attachments/files/32445056/README.md)
# Big Brother 20 — Custom Simulator

A BrantSteele-style custom-cast simulator converted from the supplied Big Brother 24 simulator architecture.

## BB20 season mechanics included
- Four opening move-in groups of four
- Premiere Immunity sequence: The Trash Folder, HouseGuest CAPTCHA, Surfing the BB Web
- First-week House Division / immunity selection
- BB App Store powers: Bonus Life, The Cloud, Identity Theft
- H@cker Competition in Weeks 6 and 7
- Jury Battle Back in Week 10
- Week 11 Double Eviction
- Week 12 Surprise Eviction
- Final HOH: Jetpack Attack, Mount Evictus, Jury Oddcasts
- BB20 competition names and descriptions are stored in `data/bb20-config.js` for compatibility with the existing UI.

## Architecture
The supplied simulator UI, styling, relationship engine and live-feed presentation are retained. The season configuration and season engine are replaced with BB20-specific mechanics.

The simulator remains a custom-cast simulator: the real BB20 season is used as the rules/twist/competition reference, while outcomes are randomized from the user's custom ratings and relationships.


## Fixes v9 — Ally Protection
- HOH nominations now strongly protect alliance members from initial nominations.
- Duo/showmance nomination logic can no longer bypass that protection.
- Veto/Cloud replacement nominations avoid the HOH's protected allies whenever another eligible non-ally exists.
- H@cker replacement nominations use the same ally-protection principle.
- Ally nominations remain possible only when the HOH/player has no viable non-ally option or the relationship is an extreme alliance breakdown (very high rivalry with very low trust/loyalty).
- Nomination strategy state is reset each week so a prior week's duo label cannot carry into a later ceremony.
- Existing BB20 twists, backdoor logic, veto strategy, and all previous fixes are preserved.

- Fixes v10: H@cker remains an eligible eviction voter in Weeks 6-7; the Hacker only nullifies one other legal vote.
- Fixes v10: nomination event data is rebuilt after defensive ally replacement so the displayed nominee names cannot disagree with the actual nominee IDs.
- Fixes v10: backdoor planning is now reachable when the initial nominees are pawns/high-bond players, with a controlled probability rather than every HOH using a backdoor.
