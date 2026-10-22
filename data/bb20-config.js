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
    {week:1,type:"immunity-1",name:"The Trash Folder",category:"physical",description:"Houseguests searched through a computer-themed trash area for folders. Finding a folder could advance a player, while players who failed to secure one faced the associated punishment; this was a fast-paced search/elimination challenge."},
    {week:1,type:"immunity-2",name:"HouseGuest CAPTCHA",category:"physical",description:"Players worked with oversized letters to assemble the word HOUSEGUEST while suspended over a pit. Speed and movement mattered as they collected and positioned the correct letters; it was a physical skill challenge, not a trivia quiz."},
    {week:1,type:"immunity-final",name:"Surfing the BB Web",category:"physical",description:"The preliminary winners faced off in a surfing-themed challenge requiring balance and control. The winner earned the opening twist's power to grant immunity to two of the four move-in groups."},
    {week:1,type:"hoh",name:"Microchip Mayhem",category:"physical",description:"Eligible houseguests competed in a technology-themed physical challenge. The winner became the first Head of Household."},
    {week:1,type:"pov",name:"Going Viral",category:"physical",description:"Houseguests raced through a social-media-themed course and completed physical tasks to earn the Power of Veto."},

    {week:2,type:"hoh",name:"Land a Job",category:"mental",description:"Houseguests used job-related clues and information to identify the correct answers. The challenge rewarded recall and deduction rather than athletic performance."},
    {week:2,type:"pov",name:"HouseguestsOnly.com",category:"mental",description:"Players used clues about houseguests and their online profiles to make the correct matches. This was a timed information/matching challenge."},

    {week:3,type:"hoh",name:"Product Launch",category:"physical",description:"Houseguests competed in a technology/product-launch themed challenge that emphasized physical execution and speed. The first player to complete the required task won HOH."},
    {week:3,type:"pov",name:"Mamma Mia Mayhem",category:"physical",description:"In this Italian-food-themed Power of Veto, players completed a messy, physical challenge built around the competition's food-and-pizza theme."},

    {week:4,type:"hoh",name:"Out On A Limb",category:"physical",description:"Houseguests held on and balanced on an elevated branch-like structure. The last player remaining won HOH; this was an endurance competition."},
    {week:4,type:"pov",name:"Chop, Bonk, Spank",category:"physical",description:"Players completed a slapstick, physical course featuring the competition's chop/bonk/spank stations. Speed and coordination determined the Veto winner."},

    {week:5,type:"hoh",name:"Information Highway",category:"mental",description:"Houseguests answered information and memory-based questions in a technology-themed competition. The player with the strongest accuracy and recall won HOH."},
    {week:5,type:"pov",name:"Goober Driver",category:"physical",description:"Players maneuvered through a goofy driving-themed course and completed the required driving task against the clock. Control and speed were central to winning the Veto."},

    {week:6,type:"hoh",name:"GIF That Keeps On Giving",category:"physical",description:"Houseguests faced a GIF-themed physical HOH challenge requiring repeated movement and control. The winner earned HOH."},
    {week:6,type:"hacker",name:"Crack the Code",category:"mental",description:"In the anonymous H@cker Competition, houseguests solved a code-based puzzle privately. The winner secretly gained the power to change one nominee, choose one Veto player, and nullify one eviction vote."},
    {week:6,type:"pov",name:"Boom Power Trip",category:"physical",description:"A power-themed Veto competition involving moving and stacking objects through a timed course while avoiding mistakes."},

    {week:7,type:"hoh",name:"#HashtagTooLong!",category:"mental",description:"Houseguests answered a social-media-themed quiz involving long or unusual hashtags. Recall and choosing the correct answers—not athletic ability—determined the HOH winner."},
    {week:7,type:"hacker",name:"Hack the House",category:"mental",description:"The second anonymous H@cker Competition challenged players to solve a puzzle privately. The winner could secretly change one nominee, choose one Veto participant, and nullify one eviction vote."},
    {week:7,type:"pov",name:"OTEV the Sneezy Skunk",category:"physical",description:"In the OTEV musical-chairs-style Veto, players raced to find the answer/item matching OTEV's clue and return to the skunk. The last player to return correctly was eliminated each round until one player remained."},

    {week:8,type:"hoh",name:"Glow & Flow",category:"physical",description:"Houseguests competed in a glowing, balance-and-endurance challenge. Players had to maintain their position and control as conditions became harder; the last to remain won HOH."},
    {week:8,type:"pov",name:"Zing Force",category:"physical",description:"In the Zingbot-themed Veto, players used physical coordination and aim to complete the challenge and score points. The highest-performing player won the Power of Veto."},

    {week:9,type:"hoh",name:"Sweet Shot",category:"physical",description:"Houseguests competed in a shooting-style challenge, aiming and controlling shots toward scoring targets. Accuracy and execution determined the HOH winner."},
    {week:9,type:"pov",name:"Mission to Planet Veto",category:"physical",description:"Players completed a space-themed Veto challenge built around maneuvering through the course and completing the mission's physical task."},

    {week:10,type:"battleback",name:"Big Top Drop",category:"physical",description:"The first four jurors competed in a circus-themed battle-back challenge. Scottie won and returned to the game."},
    {week:10,type:"hoh",name:"Pie in the Sky",category:"physical",description:"Houseguests completed a pie-themed physical HOH challenge that tested balance, coordination, and control."},
    {week:10,type:"pov",name:"Control Your Emoji",category:"physical",description:"Players balanced emoji balls on a seesaw and transferred them from one side to the other without dropping them or stepping off. The first to complete the task won Veto."},

    {week:11,type:"hoh",name:"Shell or Highwater",category:"physical",description:"Houseguests competed in a shell-themed endurance challenge that tested balance and stamina. The last player remaining won HOH."},
    {week:11,type:"pov",name:"BB Comics",category:"physical",description:"Players raced through the BB Comics course, viewing and matching comic details. The challenge combined a physical course with observation and recall; its dominant format was a timed physical run."},
    {week:11,type:"hoh-double",name:"Buffering",category:"mental",description:"Houseguests answered questions about details and events from the season in a buffering-themed quiz. Correct answers determined the HOH winner."},
    {week:11,type:"pov-double",name:"Block and Roll",category:"physical",description:"During the Double Eviction, players manipulated and rolled blocks to complete the challenge's required arrangement as quickly as possible."},

    {week:12,type:"hoh",name:"BB Flix & Chill",category:"mental",description:"Houseguests answered questions about clips, scenes, and events from the season in a movie-themed quiz. Recall and accuracy determined the HOH winner."},
    {week:12,type:"pov",name:"Your Maze are Numbered",category:"mental",description:"Players navigated the BB Labyrinth and searched for the specified objects in a required order. They had a limited time to find each next station before having to restart; the fastest successful time won Veto."},
    {week:12,type:"hoh-double",name:"What The Bleep?",category:"mental",description:"Julie showed clips from the season with a word or phrase bleeped out. Players chose the missing word or phrase from the available answers, earning points for correct responses."},
    {week:12,type:"pov-double",name:"Down to the Wires",category:"mental",description:"In the final Veto, players answered questions about the summer and used wires to raise balls into the icons matching their answers. Incorrect answers or failing to answer first earned strikes; two strikes eliminated a player."},

    {week:13,type:"final-hoh-1",name:"Jetpack Attack",category:"physical",description:"In Final HOH Part 1, the Final Three held onto moving jetpacks while being swung and jolted. The last houseguest holding on won Part 1."},
    {week:13,type:"final-hoh-2",name:"Mount Evictus",category:"mental",description:"In Final HOH Part 2, the two Part 1 losers solved clues about groups of evicted houseguests, placed the correct names on the mountain, and activated a laser. The fastest total time won Part 2."},
    {week:13,type:"final-hoh-3",name:"Jury Oddcasts",category:"mental",description:"In Final HOH Part 3, the finalists answered true-or-false questions based on statements from jurors and events of the season. The higher score won the final HOH."}
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
