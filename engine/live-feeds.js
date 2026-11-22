/*
 * BIG BROTHER 20 CUSTOM SIMULATOR — LIVE FEED SCENE GENERATOR
 *
 * Live feeds are written as observable scenes with dialogue, not narrator
 * summaries. This module only adds presentation events; it does not alter
 * competitions, nominations, veto decisions, powers, votes, or placements.
 */
(function () {
  const LiveFeeds = {};
  const name = p => `${p?.firstName || ""} ${p?.lastName || ""}`.trim() || `Houseguest ${p?.slot || ""}`;
  const label = p => String(p?.displayName || p?.firstName || name(p)).trim();
  const byId = (s, id) => s.houseguests.find(p => p.id === id) || null;
  const pick = a => a && a.length ? a[Math.floor(Math.random() * a.length)] : null;
  const shuffle = a => {
    a = (a || []).slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const timeLabel = minute => {
    const h = Math.floor(minute / 60) % 24, m = minute % 60;
    const ap = h >= 12 ? "PM" : "AM", hr = h % 12 || 12;
    return `${hr}:${String(m).padStart(2, "0")} ${ap} BBT`;
  };
  const rel = (s, a, b) => s.relationships?.[a?.id]?.[b?.id] ||
    { friendship: 50, trust: 50, loyalty: 50, respect: 50, attraction: 0, rivalry: 0, type: "Unspecified" };
  const active = s => s.houseguests.filter(p => p.active);
  const nominees = s => (s.nominees || []).map(id => byId(s, id)).filter(Boolean);
  const socialScore = (s, a, b) => {
    const r = rel(s, a, b);
    return Number(r.friendship || 0) * .28 + Number(r.trust || 0) * .25 +
      Number(r.loyalty || 0) * .16 + Number(r.respect || 0) * .16 +
      Number(r.attraction || 0) * .12 - Number(r.rivalry || 0) * .35;
  };
  function closest(s, p, exclude = []) {
    return active(s).filter(x => x.id !== p?.id && !exclude.includes(x.id))
      .sort((a, b) => socialScore(s, p, b) - socialScore(s, p, a))[0] || null;
  }
  function rival(s, p, exclude = []) {
    return active(s).filter(x => x.id !== p?.id && !exclude.includes(x.id))
      .sort((a, b) => socialScore(s, p, a) - socialScore(s, p, b))[0] || null;
  }
  function allianceMate(s, p) {
    const ids = p?.allianceIds || [];
    return pick(active(s).filter(x => x.id !== p?.id && (x.allianceIds || []).some(id => ids.includes(id))));
  }
  function groupForScene(s, size, anchor = null) {
    const people = active(s);
    if (people.length <= size) return shuffle(people);
    const pool = people.filter(p => p.id !== anchor?.id);
    const ranked = pool.map(p => ({ p, score: anchor ? socialScore(s, anchor, p) + Math.random() * 24 : Math.random() * 100 }))
      .sort((a, b) => b.score - a.score);
    const selected = [ ...(anchor ? [anchor] : []), ...ranked.slice(0, Math.max(0, size - (anchor ? 1 : 0))).map(x => x.p) ];
    return shuffle(selected);
  }
  function locationFor(topic, minute) {
    if (topic === "camera") return "Diary Room";
    if (topic === "hoh") return "HOH Room";
    if (topic === "conflict") return minute >= 18 * 60 ? "Kitchen" : "Backyard";
    if (topic === "campaign" || topic === "nominations" || topic === "veto") return pick(["HOH Room", "Bedroom", "Backyard Couch", "Kitchen"]);
    if (minute < 10 * 60) return pick(["Kitchen", "Bathroom Area", "Bedroom"]);
    if (minute < 17 * 60) return pick(["Backyard", "Kitchen", "Living Room", "Pool"]);
    return pick(["Living Room", "Kitchen", "Bedroom", "Backyard"]);
  }
  function makeUpdate(s, minute, text, people = [], kind = "conversation", topic = "") {
    return { time: timeLabel(minute), minute, text, participants: people.filter(Boolean).map(p => p.id), kind, location: locationFor(topic || kind, minute) };
  }
  function dialogueScene(s, minute, people, topic = "personal", options = {}) {
    people = (people || []).filter(Boolean);
    if (people.length < 1) return null;
    const [a, b, c, d, e, f, g, h] = people;
    const n = nominees(s), hoh = byId(s, s.currentHOH), pov = byId(s, (s.vetoWinners || []).slice(-1)[0]);
    const A = label(a), B = label(b), C = label(c), D = label(d), E = label(e), F = label(f), G = label(g), H = label(h);
    const loc = locationFor(topic, minute);
    const activity = options.activity || ({
      personal: "A few of them are making food and lingering around the counter.",
      alliance: "They settle around the kitchen counter and lower their voices.",
      paranoia: "They pause their conversation when someone walks past, then continue more quietly.",
      nominations: "They sit together and talk in low voices.",
      campaign: "They find a quiet place to talk without the rest of the room listening.",
      veto: "They sit together and talk through the upcoming veto decision.",
      conflict: "The conversation gets sharper, and the others stop what they are doing to listen.",
      hoh: "They sit in the HOH room with the door closed.",
      camera: ""
    })[topic] || "They talk while hanging out together.";

    const lines = [];
    const add = (speaker, words) => { if (speaker && words) lines.push(`${speaker}: "${words}"`); };
    let opening = `${loc} — ${activity}`;
    if (topic === "personal") {
      add(A, pick(["What is the first thing you're doing when you get home?", "I need a real meal. I'm so tired of eating the same things.", "What show have you been watching lately?", "I forgot how weird it is not having a phone in here."]));
      if (b) add(B, pick(["I'm going straight to my own bed and sleeping for twelve hours.", "I'm going to miss having everybody around, even the annoying parts.", "I keep thinking about what everyone outside is doing right now.", "I would pay a ridiculous amount of money for my favorite takeout."]));
      if (c) add(C, pick(["You say that now, but you'll miss the pool in about two days.", "I still can't believe we've been in here this long.", "I want to know what everybody's been saying about us.", "Can we please talk about something other than this game for five minutes?"]));
      if (d) add(D, pick(["That is not happening. I'm taking the good bed first.", "You are absolutely not getting my share of the snacks.", "I actually agree. I miss doing completely normal things.", "This conversation has somehow made me hungrier."]));
      if (e) add(E, pick(["You two argue like an old married couple.", "I'm just here for the food.", "I have a story that is going to make this even worse.", "Can somebody deal the cards?"]));
    } else if (topic === "alliance") {
      const mate = allianceMate(s, a);
      add(A, pick(["I need to know we're saying the same thing to people.", "I don't want to find out later that everybody made a separate deal.", "Who have you actually talked to since this morning?", "I'm trying to figure out who is being straight with me."]));
      if (b) add(B, pick(["I'm not promising anything until I know where the votes are.", "I told you what I heard. I don't know if it's the whole story.", "I haven't changed what I told you.", "You should ask them directly instead of taking somebody else's word for it."]));
      if (c) add(C, pick(["People keep asking me the same questions in different ways.", "I think we're hearing two different versions of the same conversation.", "I'm not telling everybody everything I know.", "I want to keep my options open, but that doesn't mean I'm against you."]));
      if (d) add(D, pick(["Then let's stop saying names in the middle of the kitchen.", "I need actions, not another promise.", "Who else knows we're having this conversation?", "I'm not putting my game in somebody else's hands."]));
      if (mate && !people.some(p => p.id === mate.id)) add(A, `I still need to check in with ${label(mate)} before I make a decision.`);
      if (e) add(E, pick(["I just want everybody to be honest about what they want.", "If the plan changes, I want to hear it from you first.", "I'm listening, but I'm not agreeing to anything yet."]));
    } else if (topic === "nominations" || topic === "campaign") {
      const nominee = n.find(x => x.id === a.id) || n[0];
      const otherNominee = n.find(x => x.id !== nominee?.id) || n[1];
      if (topic === "campaign" && nominee) {
        add(A, pick([`I need to know if I have your vote. Don't tell me what you think I want to hear.`, `If I stay, I need you to know I won't forget who helped me.`, `Have you heard anything concrete, or is everybody still giving you maybes?`, `I'm trying to figure out whether there's actually a path for me to stay.`]));
        if (b) add(B, pick(["I haven't made a final decision yet.", "I'm not going to lie to you. I need to talk to a couple more people.", "I hear you. I just don't want to promise something I can't deliver.", "Tell me who you think is voting against you."]));
        if (c) add(C, pick(["I heard a different number from somebody else.", "You should talk to them yourself. I don't want to speak for them.", "I don't think everybody has made up their mind.", "I can listen, but I can't promise you a vote."]));
      } else {
        add(A, `What are you hearing about ${nominee ? label(nominee) : "the nominations"}?`);
        if (b) add(B, pick(["I don't think everybody is being honest about where they stand.", "I'm waiting to see who actually makes a move.", "I heard one thing in here and something completely different outside.", "I don't want to be the person who starts a rumor."]));
        if (c) add(C, otherNominee ? `And what about ${label(otherNominee)}? Nobody seems to be saying the same thing.` : "I want to hear it directly from the people involved.");
        if (d) add(D, pick(["Then ask them. We don't have to guess.", "I don't want to get caught repeating something I can't verify.", "People are going to have to make their own decisions."]));
      }
      if (hoh && !people.some(p => p.id === hoh.id) && e) add(E, `Do you think ${label(hoh)} has actually told everybody the same plan?`);
    } else if (topic === "veto") {
      add(A, pick(["If I win, I need to decide what I can live with afterward.", "Everybody keeps asking me what I'd do if I won.", "I don't want to make a promise before the competition even happens.", "The veto changes everything, so I'm trying not to get ahead of myself."]));
      if (b) add(B, pov && pov.id === a.id ? "You already know everybody is going to ask you for something." : "You have to do what makes sense for your own game.");
      if (c) add(C, pick(["Would you actually use it if you won?", "Who do you think would be the replacement?", "I don't think the HOH is going to like being surprised.", "People are already campaigning and the competition hasn't even happened."]));
      if (d) add(D, pick(["I'm not telling anybody what I would do yet.", "I just want a fair shot to play.", "Let's see who wins before we start arguing about it."]));
    } else if (topic === "paranoia") {
      add(A, pick(["Have you noticed people keep leaving conversations when certain people walk in?", "I feel like I'm getting a different answer from everybody.", "Somebody knows more than they're saying.", "I don't know who started that, but it keeps coming back to me."]));
      if (b) add(B, pick(["I noticed it too, but I don't know what it means.", "Who told you that?", "I wouldn't repeat it until you know where it came from.", "That's exactly why I'm keeping my conversations separate."]));
      if (c) add(C, pick(["I heard the opposite from someone else.", "I don't want to get dragged into something I wasn't part of.", "Maybe they're just talking. Not everything is a deal.", "You need to ask them what they actually said."]));
      if (d) add(D, pick(["I'm not taking sides based on a rumor.", "If somebody has a problem with me, they can say it to my face.", "I just want to know what is true."]));
    } else if (topic === "conflict") {
      const r = rel(s, a, b);
      add(A, pick(["You keep saying one thing to me and something else to everybody else.", "Don't put words in my mouth. That's not what I said.", "I asked you a simple question and you still haven't answered it.", "I'm tired of hearing about what I supposedly said."]));
      if (b) add(B, pick(["You don't get to tell me who I can talk to.", "Then tell me exactly what you think I said.", "I said what I said. I'm not changing it because you're upset.", "You are making this a much bigger deal than it needs to be."]));
      if (c) add(C, pick(["Can you both lower your voices for a second?", "I was standing right there. That isn't how it happened.", "If you have an issue, talk to each other instead of everybody else.", "I'm not getting in the middle of this."]));
      if (d) add(D, pick(["I'm not taking responsibility for something I didn't do.", "This is why nobody trusts anybody in here.", "Can we please finish one conversation without yelling?"]));
    } else if (topic === "hoh") {
      add(A, pick(["I want to hear everybody out before I make a decision.", "I know people are going to ask me for safety. I can't promise everybody that.", "I need to figure out who is actually with me and who just wants something.", "I'm not telling the whole house what I'm thinking."]));
      if (b) add(B, pick(["You should be careful who you tell. People repeat everything.", "You don't owe everybody an answer tonight.", "I can tell you what I've heard, but I don't know if it's all true.", "Just don't make a promise you can't keep."]));
      if (c) add(C, pick(["I want to know where I stand before nominations.", "I'm not asking you to nominate anybody for me.", "I hope you remember who talked to you before you won."]));
    } else {
      add(A, "I don't know. What do you think?");
      if (b) add(B, "I think we should talk about it before everybody else gets involved.");
    }
    if (lines.length < 2 && b) add(B, "I hear you. I just need a little time to think about it.");
    const text = `${loc} — ${activity}\n${lines.join("\n")}`;
    return makeUpdate(s, minute, text, people, topic, topic);
  }
  function pairScene(s, minute, topic, exclude = []) {
    const pool = active(s).filter(p => !exclude.includes(p.id));
    if (pool.length < 2) return null;
    let a;
    if (topic === "campaign" && nominees(s).length) a = pick(nominees(s).filter(p => pool.some(x => x.id === p.id))) || pick(pool);
    else if (topic === "hoh") a = byId(s, s.currentHOH) || pick(pool);
    else a = pick(pool);
    const b = closest(s, a) || pick(pool.filter(p => p.id !== a.id));
    return dialogueScene(s, minute, [a, b], topic);
  }
  function groupScene(s, minute, topic, forceAll = false) {
    const people = active(s);
    if (people.length < 3) return null;
    const rivalry = people.flatMap(a => people.filter(b => b.id > a.id).map(b => ({ a, b, score: Number(rel(s, a, b).rivalry || 0) })))
      .sort((x, y) => y.score - x.score)[0];
    let anchor = topic === "conflict" && rivalry?.score >= 55 ? rivalry.a :
      (topic === "hoh" ? byId(s, s.currentHOH) : pick(people));
    const size = forceAll ? people.length : Math.min(people.length, 3 + Math.floor(Math.random() * Math.min(6, people.length - 2)));
    let group = groupForScene(s, size, anchor);
    if (topic === "conflict" && rivalry?.score >= 55 && !group.some(p => p.id === rivalry.b.id)) {
      group[group.length - 1] = rivalry.b;
    }
    return dialogueScene(s, minute, group, topic, {
      activity: topic === "personal" ? "They are playing cards and teasing each other between hands." :
        topic === "conflict" ? "A disagreement breaks out while the group is talking." :
        topic === "alliance" ? "They gather around the kitchen island and talk quietly." :
        "They sit together and compare what they have heard."
    });
  }
  function cameraTalk(s, minute) {
    const people = active(s);
    if (!people.length) return null;
    const h = pick(people), n = nominees(s), hoh = byId(s, s.currentHOH);
    const lines = [];
    if (n.some(x => x.id === h.id)) {
      lines.push(`${label(h)}: "Being on the block is not where I want to be. I need to figure out who is actually willing to vote for me and who is just trying to keep me calm."`);
      lines.push(`${label(h)}: "I'm going to keep talking to people. I can't afford to assume anybody's vote."`);
    } else if (hoh?.id === h.id) {
      lines.push(`${label(h)}: "Everybody wants something from me right now. I have to listen, but I can't tell everybody what I'm thinking."`);
      lines.push(`${label(h)}: "I need to make a decision that helps my game, not just make the room happy."`);
    } else {
      lines.push(`${label(h)}: "I feel good about a couple of people, but I'm not comfortable telling anybody everything."`);
      lines.push(`${label(h)}: "I want to keep my options open. The worst thing I can do is get too comfortable."`);
    }
    return makeUpdate(s, minute, `Diary Room\n${lines.join("\n")}`, [h], "camera", "camera");
  }

  function applyPairDamage(s, a, b, amount = 10) {
    if (!a || !b || !s.relationships?.[a.id]?.[b.id]) return;
    const clamp = v => Math.max(0, Math.min(100, v));
    [[a, b], [b, a]].forEach(([x, y]) => {
      const r = s.relationships[x.id][y.id];
      r.rivalry = clamp(Number(r.rivalry || 0) + amount);
      r.trust = clamp(Number(r.trust || 50) - Math.round(amount * .8));
      r.loyalty = clamp(Number(r.loyalty || 50) - Math.round(amount * .6));
      r.friendship = clamp(Number(r.friendship || 50) - Math.round(amount * .45));
      r.respect = clamp(Number(r.respect || 50) - Math.round(amount * .15));
    });
  }
  LiveFeeds.applyGameConsequences = function (s, week) {
    if (!s || !Array.isArray(s.houseguests)) return;
    const people = active(s);
    if (people.length < 4) return;
    s.feedGameIncidents = Array.isArray(s.feedGameIncidents) ? s.feedGameIncidents : [];
    const pairs = [];
    people.forEach(a => people.forEach(b => {
      if (a.id >= b.id) return;
      const r = rel(s, a, b);
      pairs.push({ a, b, score: Number(r.rivalry || 0) * .55 + (100 - Number(r.trust || 50)) * .20 + (100 - Number(r.loyalty || 50)) * .12 + Math.random() * 12 });
    }));
    pairs.sort((a, b) => b.score - a.score);
    const strongest = pairs[0];
    let incident = null;
    if (strongest && strongest.score >= 48 && Math.random() < .28) {
      incident = { type: "major-fight", participants: [strongest.a.id, strongest.b.id], week };
      applyPairDamage(s, strongest.a, strongest.b, 12);
    } else {
      const hoh = byId(s, s.currentHOH), n = nominees(s);
      if (hoh && n.length && Math.random() < .16) {
        const target = n.slice().sort((a, b) => socialScore(s, hoh, a) - socialScore(s, hoh, b))[0];
        if (target && target.id !== hoh.id) {
          incident = { type: "nomination-fallout", participants: [hoh.id, target.id], week };
          applyPairDamage(s, hoh, target, 9);
        }
      }
    }
    if (incident) s.feedGameIncidents.push(incident);
  };

  function generateDay(s, day) {
    const people = active(s), out = [];
    if (people.length < 2) return out;
    const n = nominees(s), hoh = byId(s, s.currentHOH), pov = byId(s, (s.vetoWinners || []).slice(-1)[0]);
    const addPair = (minute, topic, exclude = []) => { const item = pairScene(s, minute, topic, exclude); if (item) out.push(item); };
    const addGroup = (minute, topic, all = false) => { const item = groupScene(s, minute, topic, all); if (item) out.push(item); };
    const addCamera = minute => { const item = cameraTalk(s, minute); if (item) out.push(item); };

    if (day === "Thursday") {
      if (hoh) out.push(dialogueScene(s, 17 * 60 + 12, [hoh, closest(s, hoh)].filter(Boolean), "hoh"));
      addGroup(18 * 60 + 5, "personal");
      addPair(19 * 60 + 14, "alliance");
      addPair(20 * 60 + 26, "paranoia");
      addGroup(21 * 60 + 35, "personal");
      addCamera(22 * 60 + 42);
    } else if (day === "Friday") {
      addGroup(8 * 60 + 42, "personal");
      if (hoh) out.push(dialogueScene(s, 9 * 60 + 18, [hoh, closest(s, hoh)].filter(Boolean), "nominations"));
      addPair(10 * 60 + 35, "nominations");
      addGroup(12 * 60 + 14, "personal");
      if (n.length) addGroup(14 * 60 + 7, "campaign");
      addPair(16 * 60 + 11, "paranoia");
      addPair(18 * 60 + 17, "campaign");
      addGroup(20 * 60 + 46, "alliance");
      addCamera(22 * 60 + 2);
    } else if (day === "Saturday") {
      addGroup(8 * 60 + 36, "personal");
      addPair(9 * 60 + 12, "veto");
      addGroup(11 * 60 + 17, "alliance");
      addPair(12 * 60 + 2, "personal");
      out.push(makeUpdate(s, 14 * 60 + 15, "The Power of Veto competition is in progress.", (s.povPlayers || []).map(id => byId(s, id)).filter(Boolean), "feed-break", "veto"));
      if (pov) out.push(dialogueScene(s, 17 * 60 + 46, [pov, ...n.filter(x => x.id !== pov.id).slice(0, 2)], "veto"));
      addPair(18 * 60 + 54, "paranoia");
      addGroup(20 * 60 + 22, "personal");
      addCamera(22 * 60 + 6);
    } else if (day === "Sunday") {
      addGroup(9 * 60 + 8, "personal");
      if (n.length) addPair(10 * 60 + 14, "campaign");
      addPair(12 * 60 + 18, "alliance");
      addGroup(14 * 60 + 11, "personal");
      if (pov) out.push(dialogueScene(s, 16 * 60 + 32, [pov, n.find(x => x.id !== pov.id) || closest(s, pov)].filter(Boolean), "veto"));
      addPair(18 * 60 + 46, "paranoia");
      addGroup(20 * 60 + 3, "alliance");
      addCamera(22 * 60 + 31);
    } else if (day === "Monday") {
      addGroup(8 * 60 + 51, "personal");
      if (pov) out.push(dialogueScene(s, 9 * 60 + 36, [pov, closest(s, pov)].filter(Boolean), "veto"));
      addPair(10 * 60 + 27, "veto");
      addGroup(12 * 60 + 5, "campaign");
      addPair(14 * 60 + 54, "paranoia");
      addGroup(17 * 60 + 24, "personal");
      addPair(19 * 60 + 52, "alliance");
      addCamera(22 * 60 + 17);
    } else if (day === "Tuesday") {
      addGroup(9 * 60 + 4, "personal");
      addPair(10 * 60 + 16, "campaign");
      addGroup(11 * 60 + 29, "alliance");
      addPair(13 * 60 + 22, "paranoia");
      addPair(15 * 60 + 48, "personal");
      addGroup(17 * 60 + 3, "campaign");
      addPair(19 * 60 + 27, "alliance");
      addCamera(21 * 60 + 54);
    } else if (day === "Wednesday") {
      addGroup(8 * 60 + 57, "personal");
      addPair(10 * 60 + 8, "campaign");
      addGroup(11 * 60 + 19, "alliance");
      addPair(13 * 60 + 44, "paranoia");
      addPair(15 * 60 + 2, "campaign");
      addGroup(18 * 60 + 43, "personal");
      addPair(21 * 60 + 13, "alliance");
      addCamera(23 * 60 + 37);
    } else if (day === "Thursday-pre-eviction") {
      addGroup(8 * 60 + 34, "personal");
      if (n.length) addPair(9 * 60 + 11, "campaign");
      addPair(10 * 60 + 31, "alliance");
      addGroup(11 * 60 + 49, "personal");
      addPair(13 * 60 + 37, "campaign");
      addGroup(14 * 60 + 46, "alliance", true);
    }
    return out.filter(Boolean).sort((a, b) => a.minute - b.minute);
  }

  function dailyRecord(s, week, day, anchor) {
    const temp = {
      ...s,
      houseguests: (anchor?.snapshot?.houseguests || s.houseguests).map(h => ({ ...h })),
      nominees: (anchor?.snapshot?.nominees || s.nominees || []).slice(),
      currentHOH: anchor?.snapshot?.currentHOH || s.currentHOH,
      povPlayers: (anchor?.snapshot?.povPlayers || s.povPlayers || []).slice(),
      vetoWinners: (anchor?.snapshot?.vetoWinners || s.vetoWinners || []).slice(),
      relationships: s.relationships
    };
    const items = generateDay(temp, day);
    const displayDay = day === "Thursday-pre-eviction" ? "Thursday — Eviction Day" : day === "Thursday" ? "Thursday Night" : day;
    return {
      week, phase: "live-feeds", type: "live-feed-day", day,
      title: `Live Feeds — ${displayDay}`,
      snapshot: anchor?.snapshot ? JSON.parse(JSON.stringify(anchor.snapshot)) : null,
      lines: [],
      data: {
        day: displayDay,
        feedItems: items,
        participants: [...new Set(items.flatMap(x => x.participants || []))]
      }
    };
  }

  LiveFeeds.addToSeason = function (s) {
    if (!s?.season?.liveFeedsEnabled) { s.liveFeeds = { enabled: false, version: 3 }; return s; }
    if (!Array.isArray(s.history) || s.history.some(e => e.type === "live-feed-day")) return s;
    const original = s.history.slice(), out = [];
    const weeks = [...new Set(original.map(e => e.week).filter(w => typeof w === "number" && w >= 1))].sort((a, b) => a - b);
    const opening = original.filter(e => e.week === 0), finale = original.filter(e => e.week === "Final");
    opening.forEach(e => out.push(e));
    weeks.forEach(week => {
      const evs = original.filter(e => e.week === week);
      const hoh = evs.find(e => e.type === "hoh");
      const noms = evs.find(e => e.type === "nominations");
      const picked = evs.find(e => e.type === "pov-players");
      const pov = evs.find(e => e.type === "veto");
      const veto = evs.find(e => e.type === "veto-ceremony");
      let thursdayAdded = false, fridayAdded = false, saturdayAdded = false, postVetoDaysAdded = false;
      evs.forEach(e => {
        out.push(e);
        if (e === hoh && !thursdayAdded) { out.push(dailyRecord(s, week, "Thursday", hoh)); thursdayAdded = true; }
        if (e === noms && !fridayAdded) { out.push(dailyRecord(s, week, "Friday", noms)); fridayAdded = true; }
        if (e === pov && !saturdayAdded) {
          out.push(dailyRecord(s, week, "Saturday", pov));
          out.push(dailyRecord(s, week, "Sunday", pov));
          saturdayAdded = true;
        }
        if (e === veto && !postVetoDaysAdded) {
          ["Monday", "Tuesday", "Wednesday", "Thursday-pre-eviction"].forEach(day => out.push(dailyRecord(s, week, day, veto)));
          postVetoDaysAdded = true;
        }
      });
      const anchor = pov || picked || noms || hoh;
      if (!saturdayAdded && anchor) {
        out.push(dailyRecord(s, week, "Saturday", anchor));
        out.push(dailyRecord(s, week, "Sunday", anchor));
      }
      if (!postVetoDaysAdded && anchor) ["Monday", "Tuesday", "Wednesday", "Thursday-pre-eviction"].forEach(day => out.push(dailyRecord(s, week, day, anchor)));
    });
    finale.forEach(e => out.push(e));
    s.history = out;
    s.history.forEach((e, i) => e.id = i + 1);
    s.liveFeeds = { enabled: true, weekModel: "Thursday-to-Thursday", timezone: "BBT", dailyPageMode: true, version: 4, groupScenes: true, continuity: true, dialogueScenes: true };
    return s;
  };
  window.LiveFeeds = LiveFeeds;
})();
