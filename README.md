Big Brother 20 — Custom Simulator

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
