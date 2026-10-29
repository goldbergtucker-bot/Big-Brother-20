[README.md](https://github.com/user-attachments/files/34106470/README.md)
[README.md](https://github.com/user-attachments/files/34106219/README.md)
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


## Gameplay/UI Fixes — October 2026
- Opening move-in groups are balanced to 2 men and 2 women each when the cast has eight men and eight women. The two preliminary immunity sides are balanced to 4 men and 4 women each. The demo cast now pre-populates the real BB20 gender split.
- Identity Theft now preserves the HOH's separate strategic target across a nomination hijack. If the HOH's original target is a trusted ally, the HOH selects a different plausible target rather than treating an ally put up by Identity Theft as their intended target. The nomination event explicitly explains that the initial nominations were replaced.
- H@cker is allowed to win even if the winner is the HOH. The HOH is never selected as an extra Veto player because they already receive a Veto seat. Fixed the H@cker event message so it reports an actual nominee replacement instead of incorrectly saying nominations were unchanged.
- When H@cker replaces a nominee with a trusted ally of the HOH, the HOH receives a modest, temporary Veto-performance motivation boost (not a guaranteed win) and, if the HOH wins Veto, will use it to save that ally. The boost is restored immediately after the competition.
- HOH tie-break votes are counted in the displayed final tally (for example, a 3–3 tie becomes 4–3), and the tie-break decision uses the relationship/target strategy logic.
- Added a fifth **Competition Wins** tab showing each Houseguest's total and category breakdown (HOH, POV, H@cker, immunity, battle-back and final HOH). Evicted Houseguests remain visible with grayscale portraits. The tracker follows the current event reveal pointer to avoid showing unrevealed results.

### Files changed for these fixes
- `engine/season-engine.js` — balanced groups, Identity Theft strategy, H@cker legality/reporting, Veto ally-protection behavior, and tie-break tally.
- `app.js` — Competition Wins tracker and demo cast gender defaults.
- `index.html` — fifth Competition Wins tab and updated script cache version.
- `style.css` — Competition Wins layout and grayscale evicted portraits.


## Gameplay consistency fixes (October 2026)

- The four premiere move-in groups are balanced to two men and two women each when the cast contains eight men and eight women; the two preliminary immunity sides are balanced to four men and four women each. Set the Gender field for custom houseguests to enable this balance.
- H@cker nomination announcements are derived from the final before/after nominee lists, and nominee flags are synchronized with the final list. If no legal replacement exists, the original nominations remain unchanged and the announcement says so.
- The H@cker-selected Veto player is guaranteed one of the three extra Veto seats without duplicating the HOH or a nominee. If the HOH wins H@cker, the HOH receives only their normal automatic Veto seat.
- Tie-break events store the HOH voter separately from the nominee evicted by that vote; the display reports the HOH's deciding vote and the displayed tally includes it (for example, 4–3 instead of 3–3).
- Competition Wins recognizes standard, double-eviction, battle-back, and final-three competition event types.
- Versioned local script and stylesheet URLs force browsers to load the updated files after deployment.
