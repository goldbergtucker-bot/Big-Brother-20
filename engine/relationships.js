/*
 * BIG BROTHER SIMULATOR — RELATIONSHIP / ALLIANCE ENGINE
 *
 * Owns pairwise relationship math, alliance formation, and the social
 * "AI" decisions (who to nominate, whether to use the veto, who to
 * evict, who to take to final 2, how jury votes).
 */

(function () {
  const ALLIANCE_NAMES = [
    "The Committee", "Iron Circle", "The Hive", "Backdoor Bandits",
    "The Six", "Loose Cannons", "The Inner Ring", "Final Say",
    "The Wildcards", "Trust Fall", "The Vault", "Common Ground"
  ];

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function rel(state, aId, bId) {
    return state.relationships[aId] ? state.relationships[aId][bId] : null;
  }

  function bondScore(state, aId, bId) {
    const r = rel(state, aId, bId);
    if (!r) return 50;
    return (r.friendship + r.trust + r.loyalty + r.respect - r.rivalry) / 4;
  }

  function adjustPair(state, aId, bId, deltas) {
    [[aId, bId], [bId, aId]].forEach(([x, y]) => {
      const r = rel(state, x, y);
      if (!r) return;
      Object.keys(deltas).forEach(k => {
        if (typeof r[k] !== "number") return;
        r[k] = clamp(r[k] + deltas[k], 0, 100);
      });
    });
  }

  function activeAlliances(state) {
    return state.alliances.filter(a => a.active !== false);
  }

  function alliesOf(state, hgId) {
    return activeAlliances(state).filter(a => a.memberIds.includes(hgId));
  }

  function isAllyOf(state, aId, bId) {
    return activeAlliances(state).some(a => a.memberIds.includes(aId) && a.memberIds.includes(bId));
  }

  function livingHouseguests(state) {
    return state.houseguests.filter(h => h.active);
  }

  /** Occasionally forms a new alliance among houseguests with strong mutual bonds. */
  function formAlliances(state, week) {
    const living = livingHouseguests(state);
    if (living.length < 3) return null;

    const usedNames = new Set(state.alliances.map(a => a.name));
    const pairs = [];
    for (let i = 0; i < living.length; i++) {
      for (let j = i + 1; j < living.length; j++) {
        const a = living[i], b = living[j];
        if (isAllyOf(state, a.id, b.id)) continue;
        const score = bondScore(state, a.id, b.id);
        if (score >= 62) pairs.push({ a, b, score });
      }
    }
    if (!pairs.length) return null;
    pairs.sort((x, y) => y.score - x.score);

    // Seed a new alliance from the strongest pair, then pull in others
    // who bond well with both seed members.
    const seed = pairs[0];
    const memberIds = new Set([seed.a.id, seed.b.id]);
    for (const hg of living) {
      if (memberIds.has(hg.id) || memberIds.size >= 5) continue;
      const scores = [...memberIds].map(id => bondScore(state, hg.id, id));
      const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
      if (avg >= 60 && Math.random() < 0.55) memberIds.add(hg.id);
    }
    if (memberIds.size < 2) return null;

    let name = ALLIANCE_NAMES.find(n => !usedNames.has(n));
    if (!name) name = `Alliance ${state.alliances.length + 1}`;

    const alliance = {
      id: `alliance-${state.alliances.length + 1}`,
      name,
      memberIds: [...memberIds],
      formedWeek: week,
      active: true,
      type: "Simulated Alliance"
    };
    state.alliances.push(alliance);
    alliance.memberIds.forEach(id => {
      state.houseguests.find(h => h.id === id).allianceIds.push(alliance.id);
    });

    // Forming an alliance strengthens the bonds inside it.
    alliance.memberIds.forEach(aId => {
      alliance.memberIds.forEach(bId => {
        if (aId !== bId) adjustPair(state, aId, bId, { trust: 10, loyalty: 12, friendship: 6 });
      });
    });

    return alliance;
  }

  /** Marks alliances dead once they no longer have 2+ living members. */
  function pruneAlliances(state) {
    state.alliances.forEach(a => {
      const livingCount = a.memberIds.filter(id => {
        const hg = state.houseguests.find(h => h.id === id);
        return hg && hg.active;
      }).length;
      if (livingCount < 2) a.active = false;
    });
  }

  /**
   * HOH nomination logic.  Nominations are not simply random: the engine
   * weighs personal relationships, alliances, rivalry, strategic threat,
   * competition threat, and the HOH's own ratings.  Allies are heavily
   * protected unless the HOH is desperate or the alliance is already
   * breaking down.
   */
  function pairStrategyScore(state, hoh, a, b) {
    const ra = rel(state, hoh.id, a.id) || {};
    const rb = rel(state, hoh.id, b.id) || {};
    const sameAlliance = isAllyOf(state, a.id, b.id) ? 18 : 0;
    const duoBond = (bondScore(state, a.id, b.id) + bondScore(state, b.id, a.id)) / 2;
    const threatA = Number(a.ratings?.strategic || 50) * .28 + Number(a.ratings?.physical || 50) * .18 + Number(a.ratings?.mental || 50) * .12;
    const threatB = Number(b.ratings?.strategic || 50) * .28 + Number(b.ratings?.physical || 50) * .18 + Number(b.ratings?.mental || 50) * .12;
    const rivalry = (Number(ra.rivalry || 0) + Number(rb.rivalry || 0)) * .22;
    const duoSignal = (Number(ra.attraction || 0) + Number(rb.attraction || 0)) * .10 + duoBond * .18;
    return threatA + threatB + rivalry + sameAlliance * .25 + duoSignal - (bondScore(state, hoh.id, a.id) + bondScore(state, hoh.id, b.id)) * .22;
  }

  /**
   * HOH nomination logic deliberately creates recognizable BB strategy: most
   * weeks the HOH protects close allies, but sometimes nominates a visible
   * duo together or places a pawn next to a target they intend to backdoor.
   * The choice is strategic rather than a random pair.
   */
  function pickNominees(state, hoh, eligible, count) {
    if (count < 2 || eligible.length < 2) return eligible.slice(0, count);

    // An alliance is not an absolute game rule, but it is a strong strategic
    // commitment.  The old duo logic could bypass the normal ally-protection
    // check and nominate two of the HOH's allies simply because THEY were a
    // close pair.  That made the HOH look like they were randomly renominating
    // their own alliance.  Only a severe relationship breakdown can override
    // ally protection.
    const protectedAlly = hg => {
      if (!isAllyOf(state, hoh.id, hg.id)) return false;
      const r = rel(state, hoh.id, hg.id) || {};
      const rivalry = Number(r.rivalry || 0);
      const trust = Number(r.trust || 50);
      const loyalty = Number(r.loyalty || 50);
      return !(rivalry >= 78 && trust <= 30 && loyalty <= 30);
    };

    const protectedPool = eligible.filter(hg => !protectedAlly(hg));
    // If there are at least two non-allies, nominations should come from that
    // pool.  Allies remain available only when the HOH genuinely has no other
    // two-person nomination combination, preventing arbitrary ally-on-ally
    // nominations in normal circumstances.
    const nominationPool = protectedPool.length >= count ? protectedPool : eligible.slice();

    const pairs = [];
    for (let i = 0; i < nominationPool.length; i++) {
      for (let j = i + 1; j < nominationPool.length; j++) {
        const a = nominationPool[i], b = nominationPool[j];
        const score = pairStrategyScore(state, hoh, a, b);
        pairs.push({ a, b, score });
      }
    }
    pairs.sort((x, y) => y.score - x.score);

    // A duo nomination is allowed for a genuine showmance/very close pair,
    // but neither member should be the HOH's protected ally when other
    // candidates exist. Sharing an alliance is never, by itself, a reason to
    // nominate that alliance together.
    const duoChance = .16 + Math.max(0, Number(hoh.ratings?.strategic || 50) - 50) / 260;
    const duo = pairs.find(pair => {
      const ra = rel(state, hoh.id, pair.a.id) || {};
      const rb = rel(state, hoh.id, pair.b.id) || {};
      const ab = rel(state, pair.a.id, pair.b.id) || {};
      const ba = rel(state, pair.b.id, pair.a.id) || {};
      const pairBond = (bondScore(state, pair.a.id, pair.b.id) + bondScore(state, pair.b.id, pair.a.id)) / 2;
      const attraction = Math.max(Number(ra.attraction || 0), Number(rb.attraction || 0), Number(ab.attraction || 0), Number(ba.attraction || 0));
      const typeA = String(ab.type || '').toLowerCase();
      const typeB = String(ba.type || '').toLowerCase();
      const explicitDuo = typeA.includes('showmance') || typeB.includes('showmance') ||
        typeA.includes('secret pair') || typeB.includes('secret pair');
      const genuineClosePair = pairBond >= 78 || attraction >= 78;
      return (explicitDuo || genuineClosePair) &&
        (!protectedAlly(pair.a) && !protectedAlly(pair.b));
    });
    if (duo && Math.random() < duoChance) {
      state.nominationStrategy = { type: 'duo', nomineeIds: [duo.a.id, duo.b.id], reason: 'visible close duo / showmance' };
      return [duo.a, duo.b];
    }

    const scored = nominationPool.map(hg => {
      const r = rel(state, hoh.id, hg.id) || {};
      const bond = bondScore(state, hoh.id, hg.id);
      const rival = Number(r.rivalry || 0);
      const alliance = isAllyOf(state, hoh.id, hg.id);
      const strategicThreat = Number(hg.ratings?.strategic || 50);
      const compThreat = (Number(hg.ratings?.physical || 50) + Number(hg.ratings?.mental || 50)) / 2;
      let score = bond * .52 + Number(r.respect || 50) * .08 - rival * .24;
      score -= strategicThreat * .16 + compThreat * .08;

      if (alliance) {
        const trust = Number(r.trust || 50), loyalty = Number(r.loyalty || 50);
        const allianceBreakdown = rival >= 78 && trust <= 30 && loyalty <= 30;
        score += allianceBreakdown ? 2 : 42 + trust * .14 + loyalty * .14;
      }
      if (Number(r.friendship || 50) >= 72 && Number(r.trust || 50) >= 65) score += 18;
      if (Number(hg.ratings?.social || 50) < 45 && bond >= 48) score += 7;
      score += Math.random() * 16 - 8;
      return { hg, score };
    });
    scored.sort((a, b) => a.score - b.score);

    const chosen = scored.slice(0, count).map(x => x.hg);
    // Defensive final guard: when enough non-allies were available, never
    // return an HOH ally due to a scoring/tie edge case.
    if (protectedPool.length >= count && chosen.some(protectedAlly)) {
      const replacements = protectedPool.filter(hg => !chosen.some(x => x.id === hg.id));
      for (let i = 0; i < chosen.length; i++) {
        if (!protectedAlly(chosen[i]) || !replacements.length) continue;
        chosen[i] = replacements.shift();
      }
    }
    return chosen;
  }

  /**
   * Chooses whether a HOH should pursue a backdoor plan. A backdoor is more
   * likely when the target is a strong competitor, outside the HOH's
   * alliance, personally disliked, and unlikely to be selected for POV.
   */
  function planBackdoor(state, hoh, nominees) {
    const nomineeIds = new Set(nominees.map(n => n.id));
    const candidates = livingHouseguests(state).filter(hg => hg.id !== hoh.id && !nomineeIds.has(hg.id) && !hg.safe);
    if (!candidates.length) return { use: false, target: null, reason: "No eligible backdoor target" };

    // A backdoor is unnecessary when the HOH's actual initial target is already
    // on the block. The engine must not invent a second target simply because
    // the Veto phase exists.
    const initialTarget = nominees.slice().sort((a, b) => bondScore(state, hoh.id, a.id) - bondScore(state, hoh.id, b.id))[0] || null;
    const initialBond = initialTarget ? bondScore(state, hoh.id, initialTarget.id) : 0;
    // If the HOH already has a clearly disliked/low-bond nominee, treat that
    // as the normal target. Backdoor planning remains available when the block
    // looks more like a pawn setup.
    if (initialTarget && initialBond < 52) {
      return { use: false, target: null, reason: "Initial target is already nominated" };
    }

    const ranked = candidates.map(target => {
      const r = rel(state, hoh.id, target.id) || {};
      const bond = bondScore(state, hoh.id, target.id);
      const sameAlliance = isAllyOf(state, hoh.id, target.id);
      const trust = Number(r.trust || 50), loyalty = Number(r.loyalty || 50), rivalry = Number(r.rivalry || 0);
      const allianceBreakdown = sameAlliance && rivalry >= 78 && trust <= 30 && loyalty <= 30;

      // Alliance members are excluded from ordinary backdoor planning. The
      // only exception is an unmistakable alliance breakdown; even then the
      // event remains rare rather than automatic.
      if (sameAlliance && !allianceBreakdown) return { target, score: -Infinity, blockedAlly: true };

      const targetThreat = Number(target.ratings?.strategic || 50) * 0.42 + Number(target.ratings?.physical || 50) * 0.20 + Number(target.ratings?.mental || 50) * 0.14 + Number(target.ratings?.social || 50) * 0.08;
      const rivalryScore = rivalry * 0.30;
      const isolation = (100 - Number(r.friendship || 50)) * 0.10;
      const outsideAllianceBonus = sameAlliance ? -18 : 18;
      const breakdownBonus = allianceBreakdown ? 10 : 0;
      const score = targetThreat + rivalryScore + isolation - bond * 0.25 + outsideAllianceBonus + breakdownBonus + (Math.random() * 6 - 3);
      return { target, score, blockedAlly: false, allianceBreakdown };
    }).filter(x => Number.isFinite(x.score)).sort((a,b)=>b.score-a.score);

    const best = ranked[0];
    if (!best) return { use: false, target: null, reason: "No strategically appropriate backdoor target" };

    const hohStrategic = Number(hoh.ratings?.strategic || 50);
    // Planned backdoors should occur sometimes, especially for strategic HOHs,
    // but should never become the default every week.
    const threshold = 58 - (hohStrategic - 50) * 0.10;
    const baseChance = 0.22 + Math.max(0, hohStrategic - 50) / 220;
    const use = best.score >= threshold && Math.random() < Math.min(0.42, baseChance);
    if (!use) return { use: false, target: null, reason: "HOH chooses not to pursue a backdoor" };

    let reason = "major strategic threat";
    const r = rel(state, hoh.id, best.target.id) || {};
    if (Number(r.rivalry || 0) >= 60) reason = "personal rivalry";
    else if (!isAllyOf(state, hoh.id, best.target.id) && Number(best.target.ratings?.strategic || 50) >= 70) reason = "opposing strategic threat";
    else if (Number(best.target.ratings?.physical || 50) >= 75) reason = "competition threat";
    return { use: true, target: best.target, reason };
  }

  /** HOH breaks an eviction tie based on relationships, alliances and the
   * intended target rather than randomly. */
  function decideTieBreak(state, hoh, nomineeA, nomineeB) {
    const score = nominee => {
      const r = rel(state, hoh.id, nominee.id) || {};
      let v = bondScore(state, hoh.id, nominee.id);
      if (isAllyOf(state, hoh.id, nominee.id)) v += 35;
      v += Number(r.friendship || 50) * 0.12 + Number(r.trust || 50) * 0.12 + Number(r.loyalty || 50) * 0.10;
      v -= Number(r.rivalry || 0) * 0.30;
      if (state.intendedTarget === nominee.id || state.intendedTarget === `${nominee.firstName} ${nominee.lastName}`.trim()) v -= 30;
      if (state.backdoorTargetId === nominee.id) v -= 45;
      return v;
    };
    const a=score(nomineeA), b=score(nomineeB);
    if (Math.abs(a-b)<5) return Math.random()<0.5 ? nomineeA.id : nomineeB.id;
    return a < b ? nomineeA.id : nomineeB.id;
  }

  /** Chooses a replacement nominee after a veto save. */
  function pickReplacement(state, hoh, eligible, avoidIds) {
    const pool = eligible.filter(hg => !avoidIds.includes(hg.id));
    if (!pool.length) return null;

    // A genuine backdoor target always outranks the normal replacement logic.
    const plannedId = state.backdoorTargetId;
    if (plannedId) {
      const planned = pool.find(hg => hg.id === plannedId);
      if (planned && planned.id !== hoh.id && !planned.safe) return planned;
    }

    // Do not casually renominate one of the HOH's allies after a Veto/Cloud
    // save.  Only an unmistakable alliance breakdown is eligible to override
    // this protection.  If there are enough non-allies, use only them.
    const isProtectedAlly = hg => {
      if (!isAllyOf(state, hoh.id, hg.id)) return false;
      const r = rel(state, hoh.id, hg.id) || {};
      return !(Number(r.rivalry || 0) >= 78 && Number(r.trust || 50) <= 30 && Number(r.loyalty || 50) <= 30);
    };
    const nonAllies = pool.filter(hg => !isProtectedAlly(hg));
    const candidatePool = nonAllies.length ? nonAllies : pool;

    const replacement = pickNominees(state, hoh, candidatePool, 1)[0];
    if (replacement) return replacement;
    return candidatePool[0] || null;
  }

  /** Decides whether a veto winner uses the veto, and on whom. */
  function decideVetoUse(state, vetoWinner, hoh, nominees) {
    if (!nominees || !nominees.length) return { use: false };

    const activeCount = state.houseguests?.filter(h => h.active).length || 0;
    const isNominee = nominees.some(n => n.id === vetoWinner.id);
    if (activeCount === 4 && vetoWinner.id !== hoh.id && !isNominee) {
      return { use: false, final4SoleVoter: true };
    }

    if (vetoWinner.id === hoh.id) {
      if (state.backdoorTargetId && nominees.length) return { use: true, saveId: nominees[0].id, backdoor: true };
      return { use: false };
    }

    // A nominee who wins Veto always saves themselves.
    if (isNominee) return { use: true, saveId: vetoWinner.id };

    const candidates = nominees.map(n => {
      const r = rel(state, vetoWinner.id, n.id) || {};
      const bond = bondScore(state, vetoWinner.id, n.id);
      const alliance = isAllyOf(state, vetoWinner.id, n.id);
      const relationshipType = String(r.type || '').toLowerCase();
      const showmance = relationshipType.includes('showmance') || Number(r.attraction || 0) >= 70;
      const closePair = bond >= 68 || (Number(r.friendship || 0) >= 75 && Number(r.loyalty || 0) >= 70);
      let score = bond * .55 + Number(r.trust || 50) * .12 + Number(r.loyalty || 50) * .14 + Number(r.friendship || 50) * .08;
      if (alliance) score += 20;
      if (showmance) score += 42;
      else if (closePair) score += 25;
      score -= Number(r.rivalry || 0) * .40;
      return { n, score, showmance, closePair };
    }).sort((a, b) => b.score - a.score);

    const best = candidates[0];
    // Strong relationships should produce a dependable Veto-use decision.
    // This prevents a showmance/close ally from inexplicably being left on
    // the block merely because of a random roll.
    if (best.showmance || best.closePair || best.score >= 72) {
      return { use: true, saveId: best.n.id, reason: best.showmance ? 'protects showmance' : 'protects close ally' };
    }

    const willingness = clamp((best.score - 45) / 55, .05, .80);
    if (Math.random() < willingness) return { use: true, saveId: best.n.id, reason: 'protects ally' };
    return { use: false };
  }

  /** A single voter's eviction pick between two on the block. */
  function decideVote(state, voter, nomineeA, nomineeB, hoh) {
    let scoreA = bondScore(state, voter.id, nomineeA.id);
    let scoreB = bondScore(state, voter.id, nomineeB.id);

    // Vote with your alliance's lean if it has one.
    const myAllies = alliesOf(state, voter.id);
    myAllies.forEach(a => {
      a.memberIds.forEach(mid => {
        if (mid === voter.id) return;
        if (isAllyOf(state, mid, nomineeA.id)) scoreA += 12;
        if (isAllyOf(state, mid, nomineeB.id)) scoreB += 12;
      });
    });

    scoreA += Math.random() * 14 - 7;
    scoreB += Math.random() * 14 - 7;
    // Lower bond = evict. Return the id voted OUT.
    return scoreA <= scoreB ? nomineeA.id : nomineeB.id;
  }

  /**
   * A single voter's eviction pick among 2+ houseguests on the block at once
   * (multi-nominee blocks). Mirrors decideVote's logic but
   * generalized beyond a fixed pair. Returns the id voted OUT.
   */
  function decideVoteMulti(state, voter, nominees, hoh) {
    if (!nominees || !nominees.length) return null;
    if (nominees.length === 1) return nominees[0].id;
    const myAllies = alliesOf(state, voter.id);
    const scored = nominees.map(n => {
      let score = bondScore(state, voter.id, n.id);
      myAllies.forEach(a => {
        a.memberIds.forEach(mid => {
          if (mid === voter.id) return;
          if (isAllyOf(state, mid, n.id)) score += 12;
        });
      });
      score += Math.random() * 14 - 7;
      return { n, score };
    });
    scored.sort((a, b) => a.score - b.score);
    // Lowest bond gets voted out.
    return scored[0].n.id;
  }

  /** Final HOH decides who to sit next to in the final 2. */
  function decideFinalTwoPick(state, finalHoh, others) {
    // Take whoever you're most likely to beat: favor a lower jury-perceived
    // respect/strategic threat over pure friendship.
    const scored = others.map(hg => {
      const bond = bondScore(state, finalHoh.id, hg.id);
      const threat = hg.ratings.strategic * 0.6 + hg.ratings.social * 0.4;
      return { hg, score: bond * 0.5 - threat * 0.5 + (Math.random() * 10 - 5) };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored[0].hg;
  }

  /** A single juror's vote between the two finalists. */
  function decideJuryVote(state, juror, finalistA, finalistB) {
    const bondA = bondScore(state, juror.id, finalistA.id);
    const bondB = bondScore(state, juror.id, finalistB.id);
    const gameA = finalistA.ratings.strategic * 0.65 + finalistA.ratings.mental * 0.35;
    const gameB = finalistB.ratings.strategic * 0.65 + finalistB.ratings.mental * 0.35;

    const scoreA = bondA * 0.45 + gameA * 0.55 + (Math.random() * 12 - 6);
    const scoreB = bondB * 0.45 + gameB * 0.55 + (Math.random() * 12 - 6);
    return scoreA >= scoreB ? finalistA.id : finalistB.id;
  }

  window.RelEngine = {
    bondScore, adjustPair, isAllyOf, alliesOf, activeAlliances,
    formAlliances, pruneAlliances, pickNominees, pickReplacement,
    decideVetoUse, decideVote, decideVoteMulti, decideTieBreak, planBackdoor, decideFinalTwoPick, decideJuryVote,
    livingHouseguests
  };
})();
