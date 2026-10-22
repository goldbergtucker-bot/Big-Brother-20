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
    {week:1,type:"immunity-1",name:"The Trash Folder",category:"physical",description:"The opening challenge recreated the classic Black Box format: houseguests entered a dark, computer-themed enclosure and searched by touch for hidden folders. The special folder advanced its finder to the final immunity competition; the last houseguest without a folder received a punishment."},
    {week:1,type:"immunity-2",name:"Title Unknown",category:"physical",description:"In the second opening-night challenge, houseguests were tethered above a pit and collected letter blocks while their platforms moved. They had to assemble the required word; the winner advanced to the final immunity competition and the last-place player received a punishment. The season wiki does not give this challenge an official title."},
    {week:1,type:"immunity-final",name:"Surfing the BB Web",category:"physical",description:"The two preliminary winners faced off in a surfing-themed final challenge. The winner chose two of the four move-in groups to receive immunity, protecting eight houseguests from the first HOH and eviction cycle."},
    {week:1,type:"hoh",name:"Microchip Mayhem",category:"physical",description:"The eligible houseguests crossed individual balance beams to collect Deletion Dot balls, then returned and placed them into tubes labeled with each competitor's name. A player was eliminated when their tube held ten dots, so houseguests could target one another or cooperate. The last player remaining won HOH."},
    {week:1,type:"pov",name:"Going Viral",category:"physical",description:"This multi-stage Veto had a series of elimination rounds. Players advanced to smaller platforms and had to avoid touching the ground; later, they transported balls with a device while wearing shock collars, then identified and ordered the top three flavors of the fictional Sloda drink. The last player to complete the final flavor-ordering task won Veto."},

    {week:2,type:"hoh",name:"Land a Job",category:"skill",description:"Houseguests launched a ball onto a miniature city called San Bros. Each building represented a salary, and the salary of the building where a player's ball landed became their score. The highest salary won HOH."},
    {week:2,type:"pov",name:"HouseguestsOnly.com",category:"mental",description:"In individual timed runs, players reviewed dating profiles of former houseguests and matched each person to their ideal date location using clues from the profiles. They had to place all seven profiles correctly; incorrect placements required more work, and a 20-minute limit applied. The fastest correct time won Veto."},

    {week:3,type:"hoh",name:"Product Launch",category:"quiz",description:"Houseguests watched two promotional videos for the fictional tech company Pineapple, Inc. Julie then asked true-or-false questions about details in the videos. An incorrect answer eliminated a player; the last player remaining won HOH, with a tiebreaker if necessary."},
    {week:3,type:"pov",name:"Mamma Mia Madness",category:"physical",description:"Hosted by Rachel Reilly, players spun around beneath a disco ball 15 times to earn 30 seconds, then ran to build an eight-tier tower of champagne glasses. Before the clock expired, they had to return and spin again to earn more time. The first to finish the tower won Veto and a trip to the Greek islands; a player who volunteered to be a Have-Not could re-enter after elimination."},

    {week:4,type:"hoh",name:"Out On A Limb",category:"endurance",description:"Each houseguest stood on a peg attached to a tree and held on as long as possible while the tree moved. Water, honey, and feathers were sprayed at the players as the competition continued. The last houseguest remaining won HOH."},
    {week:4,type:"pov",name:"Chop, Bonk, Spank",category:"quiz",description:"Hosted by Rachel Reilly, players stood on targets while a machine performed sequences of chomp, bonk, and spank actions. Rachel asked questions about the sequence they had just experienced. Each correct answer earned a point; the highest score after seven rounds won Veto."},

    {week:5,type:"hoh",name:"Information Highway",category:"skill",description:"Known in the episode as Perfect Timing, houseguests sat on an oversized email and slid from an outbox toward an inbox. They tried to stop their timer as close to eight seconds as possible. The closest time won HOH; Bayleigh won with 8.08 seconds."},
    {week:5,type:"pov",name:"Goober Driver",category:"skill",description:"Players paved a road so they could drive four previously evicted houseguests across town. Each player had to build a continuous route and get all four passengers to the other side as quickly as possible. The fastest successful time won Veto; players who did not finish in time were timed out."},

    {week:6,type:"hoh",name:"GIF That Keeps On Giving",category:"quiz",description:"During the preceding week, houseguests were shown GIFs of themselves at set times. Julie asked true-or-false questions about what appeared in those GIFs. An incorrect answer eliminated a player; the last player remaining won HOH, with a numerical tiebreaker if needed."},
    {week:6,type:"hacker",name:"Crack the Code",category:"mental",description:"The first anonymous H@cker competition was played simultaneously by houseguests in separate rooms, concealing the winner's identity. The winner could secretly replace one of the HOH's nominees, choose one of the three randomly drawn Veto players, and nullify one eviction vote."},
    {week:6,type:"pov",name:"Boom Power Trip",category:"skill",description:"In this elimination-style Veto, players rolled a ball back and forth a required number of times. The first player unable to finish was eliminated and received a prize or punishment; each eliminated player could keep their item or exchange it for another player's item. The rounds continued until the remaining player held the Power of Veto."},

    {week:7,type:"hoh",name:"#HashtagTooLong!",category:"quiz",description:"Two houseguests faced off at a time. They were shown a long, mashed-together hashtag and three pictures, then raced to buzz in with the picture matching the hashtag's meaning. The winner stayed in and chose the next matchup; the loser was eliminated. If neither answered, both could be eliminated. The last player remaining won HOH."},
    {week:7,type:"hacker",name:"Hack the House",category:"mental",description:"The second anonymous H@cker competition used separate play areas to keep the winner secret. The winner could secretly replace one nominee, select one of the three Veto players, and nullify one eviction vote."},
    {week:7,type:"pov",name:"OTEV the Sneezy Skunk",category:"physical",description:"Each round, OTEV gave a clue and players searched the backyard for the item or answer that matched it, then returned to OTEV. The last player to return with the correct answer was eliminated. The final player remaining won Veto."},

    {week:8,type:"hoh",name:"Glow & Flow",category:"skill",description:"Players retrieved fuel, slid across a soaped-up dance floor, and used it to fill a glow stick. The first to fill the large glow stick won HOH; filling a smaller glow stick instead earned a $5,000 prize."},
    {week:8,type:"pov",name:"Zing Force",category:"physical",description:"This Zingbot-hosted Veto used the Hide-and-Go-Veto format. Each player had three minutes to hide their locked Veto card in the house, then houseguests took turns searching for cards. Finding a card eliminated its owner; the owner of the one card left hidden at the end won Veto."},

    {week:9,type:"hoh",name:"Sweet Shot",category:"skill",description:"Houseguests searched a candy ball pit for tokens and exchanged them for a chance to roll a ball down a conveyor belt toward a red cup. Landing a perfect shot immediately won HOH. Otherwise, the ball landed in a numbered slot; players could lock in that score or try again with another token. Tokens could be transferred, and after one hour the highest score won if no one made a perfect shot."},
    {week:9,type:"pov",name:"Mission to Planet Veto",category:"physical",description:"Players searched for and caught the required items within a time limit while being covered in slime. The player who collected the required items and completed the task successfully won the Power of Veto."},

    {week:10,type:"battleback",name:"Big Top Drop",category:"physical",description:"The first four jurors retrieved balls in their assigned colors as the balls spun in the air, carried them back, and dropped them one at a time into their tubes. The first player to fill their tube with four balls and hit the buzzer across the yard returned to the game. Scottie won."},
    {week:10,type:"hoh",name:"Pie in the Sky",category:"endurance",description:"Houseguests stood with both feet on small disks that spun around the backyard while holding onto ropes. As the competition continued, they were hit with pies and sprayed with condiments and feathers. The last houseguest remaining on their disk won HOH."},
    {week:10,type:"pov",name:"Control Your Emojis",category:"skill",description:"Players carried emoji pieces across a seesaw and placed them into a message bubble. If any emojis fell out, the player had to restart. The first player to place all their emojis and hit the button won Veto."},

    {week:11,type:"hoh",name:"Shell or Highwater",category:"skill",description:"Houseguests had three minutes to move three pearls, one at a time, down a seaweed plant and into oyster targets. The first to land all three pearls and buzz in won HOH; if time expired, the player who sank the most pearls won."},
    {week:11,type:"pov",name:"BB Comics",category:"physical",description:"Players climbed a ladder and used a zip line to view comic covers displayed behind them. They then recreated the correct lineup using comic covers from a pile containing decoys. The fastest accurate lineup won Veto."},
    {week:11,type:"hoh-double",name:"Buffering",category:"quiz",description:"Houseguests watched videos of earlier competitions. Each clip paused or buffered at a particular moment, and players answered a multiple-choice question about what they had seen. Correct answers earned points; the highest score after seven rounds won HOH."},
    {week:11,type:"pov-double",name:"Block and Roll",category:"skill",description:"Players arranged blocks to form a path that sent a ball through a tube and into a target hole. The first player to make the ball travel through the completed path and land in the hole won Veto."},

    {week:12,type:"hoh",name:"BB Flix & Chill",category:"quiz",description:"Houseguests answered questions about video clips and events from the season. Correct answers advanced their scores through the competition; the player with the strongest result won HOH."},
    {week:12,type:"pov",name:"Your Maze are Numbered",category:"physical",description:"In individual timed runs through a labyrinth, players had to find one wizard, two wolves, and three witches. Each section had to be completed within 30 seconds or the player had to start that section over. After finding the figures, the player pulled a sword from a stone; the fastest total time won Veto."},
    {week:12,type:"hoh-double",name:"What The Bleep?",category:"quiz",description:"Julie showed clips of conversations and speeches from the summer with a word or phrase bleeped out. Players selected the missing word or phrase from two options. Correct answers earned points, and the highest score won HOH."},
    {week:12,type:"pov-double",name:"Down to the Wires",category:"quiz",description:"Players answered questions about events from the summer, then used wires to lift numbered balls and drop them into the thumbs-up icon matching the correct answer. An incorrect answer or failing to answer before another player earned a strike; two strikes eliminated a player. The last player remaining won Veto."},

    {week:13,type:"final-hoh-1",name:"Jetpack Attack",category:"endurance",description:"The Final Three held onto moving jetpacks while they were swung and jolted and effects were blasted at them. The last houseguest holding on won Part 1 of the Final HOH and advanced directly to Part 3."},
    {week:13,type:"final-hoh-2",name:"Mount Evictus",category:"mental",description:"The two players who did not win Part 1 solved clues identifying groups of evicted houseguests, placed the correct names on a mountain, and activated a laser. The faster total time won Part 2 of the Final HOH."},
    {week:13,type:"final-hoh-3",name:"Jury Oddcasts",category:"quiz",description:"The Part 1 and Part 2 winners answered true-or-false questions about statements made by jurors and events from the season. The player with the higher score became the Final HOH."}
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
    "Week 11 is the first Double Eviction week; Week 12 also contains the surprise second eviction cycle.",
    "Week 12 includes the real Surprise Eviction before the Final Three.",
    "Final Three uses the real BB20 Jetpack Attack / Mount Evictus / Jury Oddcasts sequence."
  ]
});
