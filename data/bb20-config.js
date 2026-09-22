/*
 * BIG BROTHER 20 — SEASON CONFIGURATION
 * BB20-inspired custom simulator using the supplied BB24 simulator UI/engine architecture.
 * Competition names, twist timing and formats are based on the real U.S. Big Brother 20 season.
 */
window.BB20_CONFIG = Object.freeze({
  seasonId:"bb20-custom",
  seasonNumber:20,
  originalYear:2018,
  defaultCastSize:16,
  teams:[
    {id:"movein-1",name:"Move-In Group 1"},
    {id:"movein-2",name:"Move-In Group 2"},
    {id:"movein-3",name:"Move-In Group 3"},
    {id:"movein-4",name:"Move-In Group 4"}
  ],
  ratingKeys:["general","physical","mental","social","strategic"],
  relationshipKeys:["friendship","trust","loyalty","rivalry","respect","attraction"],
  juryThresholdPlacement:11,
  openingImmunityWeek:1,
  bonusLifeWeek:1,
  hackerWeeks:[6,7],
  battleBackWeek:10,
  doubleEvictionWeek:11,
  surpriseEvictionWeek:12,
  competitionSchedule:[
    {week:1,type:"immunity-1",name:"The Trash Folder",category:"physical",description:"Houseguests searched a dark, computer-themed room for hidden folders. Most folders granted an escape; the special folder advanced its finder to the final immunity round, while the last player without a folder received a punishment."},
    {week:1,type:"immunity-2",name:"HouseGuest CAPTCHA",category:"mental",description:"Houseguests were suspended above a pit of letter blocks and had to collect the correct letters and spell HOUSEGUEST on their platform. The fastest player advanced to the final immunity round and the last player received a punishment."},
    {week:1,type:"immunity-final",name:"Surfing the BB Web",category:"physical",description:"The two preliminary winners faced off on a surfing-style endurance course. The winner earned the power to grant immunity to two of the four move-in groups."},
    {week:1,type:"hoh",name:"Microchip Mayhem",category:"physical",description:"The eligible houseguests competed in a technology-themed Head of Household competition built around balancing and maneuvering through a high-tech course."},
    {week:1,type:"pov",name:"Going Viral",category:"physical",description:"Houseguests raced through a social-media-themed obstacle course, completing a series of tasks as quickly as possible to win the Power of Veto."},

    {week:2,type:"hoh",name:"Land a Job",category:"mental",description:"Houseguests matched clues and job-related information to the correct BB-themed positions, with speed and accuracy determining the winner."},
    {week:2,type:"pov",name:"HouseguestsOnly.com",category:"mental",description:"Players completed a timed matching challenge, deciphering clues and pairing the correct houseguest-related information with the appropriate labels."},

    {week:3,type:"hoh",name:"Product Launch",category:"physical",description:"Houseguests raced through a technology product-launch setup, completing physical tasks and assembling the required pieces before reaching the finish."},
    {week:3,type:"pov",name:"Mamma Mia Mayhem",category:"physical",description:"A chaotic food-and-Italian-themed competition in which houseguests maneuvered through obstacles and completed a series of messy tasks for the fastest finish."},

    {week:4,type:"hoh",name:"Out On A Limb",category:"physical",description:"Houseguests balanced on an elevated, tree-branch-themed structure while enduring movement and instability. The last player remaining won HOH."},
    {week:4,type:"pov",name:"Chop, Bonk, Spank",category:"physical",description:"Players navigated a playful obstacle course involving chopping, striking and timing-based stations, racing to complete the course fastest."},

    {week:5,type:"hoh",name:"Information Highway",category:"mental",description:"Houseguests answered questions and solved information-based clues while navigating a technology-themed highway of answers."},
    {week:5,type:"pov",name:"Goober Driver",category:"physical",description:"Houseguests drove oversized vehicles through a goofy course, collecting and delivering items while trying to complete the route in the fastest time."},

    {week:6,type:"hoh",name:"GIF That Keeps On Giving",category:"physical",description:"Players repeatedly maneuvered through a GIF-themed course while attempting to maintain control of moving objects and finish first."},
    {week:6,type:"hacker",name:"Crack the Code",category:"mental",description:"The anonymous Hacker Competition. Houseguests competed privately to solve a code; the winner secretly received the ability to alter a nomination, choose one Veto player and nullify one eviction vote."},
    {week:6,type:"pov",name:"Boom Power Trip",category:"physical",description:"A power-themed Veto competition involving moving and stacking objects through a timed course while avoiding mistakes."},

    {week:7,type:"hoh",name:"#HashtagTooLong!",category:"mental",description:"Houseguests answered questions about long and unusual social-media hashtags, combining memory and quick judgment to determine the winner."},
    {week:7,type:"hacker",name:"Hack the House",category:"mental",description:"The second anonymous Hacker Competition. The winner again received the three Hacker powers: secretly change a nominee, select a Veto participant and nullify one eviction vote."},
    {week:7,type:"pov",name:"OTEV the Sneezy Skunk",category:"mental",description:"OTEV appeared as a sneezy skunk. Houseguests searched for the correct answers hidden around the backyard and raced back to OTEV after each clue; the last correct player was eliminated each round."},

    {week:8,type:"hoh",name:"Glow & Flow",category:"physical",description:"A glowing endurance competition requiring houseguests to maintain balance and control while the course moved and challenged their footing."},
    {week:8,type:"pov",name:"Zing Force",category:"physical",description:"A Zingbot-themed competition where players used force, aim and timing to complete a series of physical targets and score points."},

    {week:9,type:"hoh",name:"Sweet Shot",category:"physical",description:"Houseguests launched and controlled objects toward scoring targets in a carnival-style shooting competition."},
    {week:9,type:"pov",name:"Mission to Planet Veto",category:"physical",description:"A space-themed Veto competition requiring houseguests to navigate a course and complete a mission while collecting the required pieces."},

    {week:10,type:"battleback",name:"Big Top Drop",category:"physical",description:"The first four jurors competed for a chance to return to the game in a circus-themed re-entry competition. The winner returned to the house."},
    {week:10,type:"hoh",name:"Pie in the Sky",category:"physical",description:"Houseguests competed in a high-flying pie-themed challenge, balancing and maneuvering through an elevated course to claim HOH."},
    {week:10,type:"pov",name:"Control Your Emoji",category:"physical",description:"Players balanced emoji balls on a seesaw. They had to transfer every emoji from one side to the other without dropping one or stepping off; the first to finish won Veto."},

    {week:11,type:"hoh",name:"Shell or Highwater",category:"physical",description:"Houseguests endured an aquatic, shell-themed challenge requiring balance and stamina. The last player remaining won HOH."},
    {week:11,type:"pov",name:"BB Comics",category:"mental",description:"Players raced to match houseguest comic covers and details, combining memory with a physical course."},
    {week:11,type:"hoh-double",name:"Buffering",category:"mental",description:"During the first Double Eviction round, houseguests answered questions about events and details from the season while navigating a buffering-themed board."},
    {week:11,type:"pov-double",name:"Block and Roll",category:"physical",description:"During the Double Eviction, players rolled and maneuvered large blocks through a course to complete the required pattern fastest."},

    {week:12,type:"hoh",name:"BB Flix & Chill",category:"mental",description:"Houseguests watched or recalled clips and events from the season, then answered questions about what they had seen."},
    {week:12,type:"pov",name:"Your Maze are Numbered",category:"mental",description:"Players navigated a numbered maze, using clues and spatial reasoning to determine the correct path and finish fastest."},
    {week:12,type:"hoh-double",name:"What The Bleep?",category:"mental",description:"Houseguests watched clips with words bleeped out and identified the missing phrases or statements."},
    {week:12,type:"pov-double",name:"Down to the Wires",category:"physical",description:"Players pulled and manipulated wires through a timed setup, carefully avoiding obstacles and completing the circuit first."},

    {week:13,type:"final-hoh-1",name:"Jetpack Attack",category:"physical",description:"The Final Three held onto moving jetpacks while being swung, jolted and blasted with effects. The last houseguest holding on won Part 1 and advanced to Part 3."},
    {week:13,type:"final-hoh-2",name:"Mount Evictus",category:"mental",description:"The two Part 1 losers solved rounds of clues identifying groups of evicted houseguests, then placed the correct names on a mountain and activated a laser. Fastest total time won Part 2."},
    {week:13,type:"final-hoh-3",name:"Jury Oddcasts",category:"mental",description:"The Part 1 and Part 2 winners answered True/False-style questions about statements from jurors and events of the season. The higher score became Final HOH."}
  ],
  twists:[
    {id:"premiere-immunity",name:"Premiere Immunity / House Division",week:1,summary:"The 16-player cast is divided into four move-in groups. Two preliminary competitions determine finalists for Surfing the BB Web. The winner grants immunity to two entire groups, leaving the other eight eligible for the first HOH and eviction."},
    {id:"bb-app-store",name:"BB App Store",week:1,summary:"The season's technology theme includes Power Apps and Crap Apps. The simulator tracks the major real BB20 powers: Bonus Life, The Cloud and Identity Theft, with the powers represented as optional strategic advantages."},
    {id:"bonus-life",name:"Bonus Life",week:1,summary:"The Bonus Life follows the real BB20 outcome: after remaining unused through the first three evictions, it activates at the fourth eviction, but the evicted Houseguest always fails the puzzle and remains evicted."},
    {id:"cloud",name:"The Cloud",week:2,summary:"A Power App that can protect its holder from being nominated at a Nomination Ceremony or Veto Meeting once during its active period."},
    {id:"identity-theft",name:"Identity Theft",week:3,summary:"A Power App tied to the BB App Store that gives its holder a strategic power over another houseguest's game. The simulator tracks it as a limited-use secret power."},
    {id:"hacker",name:"H@cker Competition",week:6,summary:"For Weeks 6 and 7, an anonymous Hacker can secretly replace one nominee, select a Veto participant and nullify one eviction vote."},
    {id:"jury-battleback",name:"Jury Battle Back",week:10,summary:"The first four jurors compete in Big Top Drop for a chance to return. The winner re-enters the game and resumes normal eligibility."},
    {id:"double-eviction",name:"Double Eviction",week:11,summary:"Week 11 contains two complete eviction cycles in the same week: the normal cycle followed immediately by a second HOH, nominations, Veto and eviction."},
    {id:"surprise-eviction",name:"Surprise Eviction",week:12,summary:"After the regular Week 12 eviction, the house immediately runs another HOH, nominations, Veto and eviction cycle before the Final Three."}
  ],
  notes:[
    "16-houseguest custom cast with four opening move-in groups of four.",
    "Opening immunity leaves half the house eligible for the first HOH.",
    "BB App Store powers are represented as season mechanics rather than requiring real viewer voting.",
    "H@cker Competition runs in Weeks 6 and 7.",
    "The first four jurors are eligible for the Week 10 Battle Back, which always occurs because the Bonus Life is fixed to its real BB20 failed outcome.",
    "Week 11 is the real Double Eviction week.",
    "Week 12 includes the real Surprise Eviction before the Final Three.",
    "Final Three uses the real BB20 Jetpack Attack / Mount Evictus / Jury Oddcasts sequence."
  ]
});
