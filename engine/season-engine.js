/*
 * BIG BROTHER 20 CUSTOM SIMULATOR — SEASON ENGINE
 * Converted from the supplied BB24 architecture.
 * Core simulator remains custom-cast; BB20-specific twists and competitions
 * are implemented as isolated season mechanics.
 */
(function(){
  const C=()=>window.Competitions, R=()=>window.RelEngine, CFG=()=>window.BB20_CONFIG;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const living=s=>s.houseguests.filter(h=>h.active);
  const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const pick=a=>a&&a.length?a[Math.floor(Math.random()*a.length)]:null;
  const hg=(s,id)=>s.houseguests.find(h=>h.id===id)||null;
  const displayName=h=>{const n=`${h?.firstName||""} ${h?.lastName||""}`.trim();return n||`Houseguest ${h?.slot||""}`;};
  const ordinal=n=>{const v=n%100;return `${n}${v>=11&&v<=13?"th":({1:"st",2:"nd",3:"rd"}[n%10]||"th")}`;};

  function snapshot(s){return {
    phase:s.phase,week:s.week,currentHOH:s.currentHOH,originalHOH:s.originalHOH||null,
    nominees:(s.nominees||[]).slice(),intendedTarget:s.intendedTarget||null,targetHistory:(s.targetHistory||[]).slice(),
    povPlayers:(s.povPlayers||[]).slice(),vetoWinners:(s.vetoWinners||[]).slice(),evictionVotes:(s.evictionVotes||[]).slice(),
    evicted:(s.evicted||[]).slice(),jury:(s.jury||[]).slice(),
    bb20Twists:JSON.parse(JSON.stringify(s.bb20Twists||{})),
    houseguests:s.houseguests.map(h=>({id:h.id,slot:h.slot,firstName:h.firstName,lastName:h.lastName,portraitUrl:h.portraitUrl,gender:h.gender||"",active:h.active,safe:h.safe,nominated:h.nominated,juryMember:h.juryMember,evicted:h.evicted,placement:h.placement})),
    finale:s.finale?JSON.parse(JSON.stringify(s.finale)):null
  };}

  function eventData(s,e){
    const ids=a=>Array.isArray(a)?a.slice():[];
    const d={...(e.data||{})};
    d.competition=e.competition?JSON.parse(JSON.stringify(e.competition)):d.competition||null;
    d.participants=ids(e.participants||d.participants);d.nomineeIds=ids(e.nomineeIds||d.nomineeIds||s.nominees);
    d.povPlayers=ids(e.povPlayers||d.povPlayers||s.povPlayers);
    d.winnerId=e.winnerId||d.winnerId||null;d.hohId=e.hohId||d.hohId||s.currentHOH||null;d.evictedId=e.evictedId||d.evictedId||null;
    if(e.type==="veto-ceremony"){d.vetoUsed=!!(e.vetoUsed??d.vetoUsed);d.finalNomineeIds=ids(e.finalNomineeIds||d.finalNomineeIds||s.nominees);}
    if(e.type==="eviction-voting"){d.votes=(s.evictionVotes||[]).map(v=>({...v}));d.voterIds=d.votes.map(v=>v.voterId);}
    if(e.type==="eviction"){d.voteCounts={...(e.voteCounts||{})};d.tieBreakVoteId=e.tieBreakVoteId||null;d.tieBreakEvictedId=e.tieBreakEvictedId||null;d.evictedVoteCount=Number(e.evictedVoteCount||0);d.stayVoteCount=Number(e.stayVoteCount||0);}
    if(e.type==="jury-vote"){d.votes=(s._juryVotes||[]).map(v=>({...v}));d.voterIds=d.votes.map(v=>v.voterId);d.finalistIds=living(s).map(h=>h.id);}
    if(e.type==="winner"){d.runnerUpId=e.runnerUpId||null;d.thirdPlaceId=e.thirdPlaceId||null;d.afpId=e.afpId||null;d.afpVotes=e.afpVotes||{};}
    return d;
  }
  function log(s,e){const r={id:s.history.length+1,...e};r.snapshot=snapshot(s);r.data=eventData(s,r);s.history.push(r);}

  function ensureState(s){
    s.evicted=Array.isArray(s.evicted)?s.evicted:[];s.jury=Array.isArray(s.jury)?s.jury:[];
    s.nominees=s.nominees||[];s.povPlayers=s.povPlayers||[];s.vetoWinners=s.vetoWinners||[];s.evictionVotes=s.evictionVotes||[];
    s.history=s.history||[];s._priorHohIds=Array.isArray(s._priorHohIds)?s._priorHohIds:[];
    s.bb20Twists=s.bb20Twists||{};
    s.houseguests.forEach(h=>{h.gender=h.gender||"";h.allianceIds=h.allianceIds||[];h.ratings=h.ratings||{general:50,physical:50,mental:50,social:50,strategic:50};});
  }
  function relationshipScore(s,a,b){const r=s.relationships?.[a.id]?.[b.id]||{friendship:50,trust:50,loyalty:50,respect:50,attraction:0,rivalry:0};return (r.friendship||0)*.30+(r.trust||0)*.25+(r.loyalty||0)*.15+(r.respect||0)*.20+(r.attraction||0)*.10-(r.rivalry||0)*.35;}
  function isTrustedAlly(s,aId,bId){
    if(!aId||!bId||aId===bId)return false;
    const r=s.relationships?.[aId]?.[bId]||{};
    const betrayed=Number(r.rivalry||0)>=78&&Number(r.trust||50)<=30&&Number(r.loyalty||50)<=30;
    if(R()?.isAllyOf?.(s,aId,bId))return !betrayed;
    return !betrayed&&Number(r.friendship||50)>=72&&Number(r.trust||50)>=65&&Number(r.loyalty||50)>=65;
  }
  function randomizeRelationships(s){if(s.season.relationshipsRandomized||s.season.relationshipsCustomized)return;s.houseguests.forEach(a=>s.houseguests.forEach(b=>{if(a.id===b.id)return;const r=s.relationships[a.id][b.id];const n=()=>Math.round(Math.random()*40-20);r.friendship=clamp(r.friendship+n(),15,85);r.trust=clamp(r.trust+n(),15,85);r.loyalty=clamp(r.loyalty+n(),15,85);r.respect=clamp(r.respect+n(),15,85);r.rivalry=Math.round(Math.random()*25);r.attraction=Math.round(Math.random()*30);}));s.season.relationshipsRandomized=true;}

  function genderKey(h){
    const g=String(h?.gender||'').trim().toLowerCase();
    if(g==='male'||g==='man'||g==='m')return 'male';
    if(g==='female'||g==='woman'||g==='f')return 'female';
    return 'unspecified';
  }

  // With the standard 8-men/8-women BB20 cast, each move-in group is 2 men +
  // 2 women and each preliminary immunity side is 4 men + 4 women. If a custom
  // cast has unspecified or uneven gender entries, distribute those leftovers
  // as evenly as possible instead of dropping or duplicating anyone.
  function balancedGenderGroups(players, groupCount, groupSize){
    const men=shuffle(players.filter(h=>genderKey(h)==='male'));
    const women=shuffle(players.filter(h=>genderKey(h)==='female'));
    const unknown=shuffle(players.filter(h=>genderKey(h)==='unspecified'));
    const groups=Array.from({length:groupCount},()=>[]);
    // Exact BB20 cast path: build the required gender quotas directly instead
    // of relying on a general-purpose round-robin distribution. This guarantees
    // 2 men + 2 women in every move-in group and 4 men + 4 women on each
    // preliminary immunity side when the cast is 8 men / 8 women.
    if(groupSize%2===0 && unknown.length===0 && men.length===groupCount*(groupSize/2) && women.length===groupCount*(groupSize/2)){
      const quota=groupSize/2;
      for(let i=0;i<groupCount;i++){
        groups[i].push(...men.slice(i*quota,(i+1)*quota));
        groups[i].push(...women.slice(i*quota,(i+1)*quota));
        // Shuffle within each already-balanced group so gender order is not
        // visible or deterministic in the displayed cast list.
        groups[i]=shuffle(groups[i]);
      }
      return groups;
    }
    const addRoundRobin=(list,quota)=>{
      let cursor=0;
      for(const h of list){
        let placed=false;
        for(let step=0;step<groupCount;step++){
          const idx=(cursor+step)%groupCount;
          const g=groups[idx];
          const count=g.filter(x=>genderKey(x)===genderKey(h)).length;
          if(g.length<groupSize && (quota==null || count<quota[idx])){
            g.push(h);cursor=(idx+1)%groupCount;placed=true;break;
          }
        }
        if(!placed){
          for(let step=0;step<groupCount;step++){
            const idx=(cursor+step)%groupCount;
            if(groups[idx].length<groupSize){groups[idx].push(h);cursor=(idx+1)%groupCount;break;}
          }
        }
      }
    };
    const maleQuota=Array(groupCount).fill(Math.floor(groupSize/2));
    const femaleQuota=Array(groupCount).fill(Math.floor(groupSize/2));
    addRoundRobin(men,maleQuota);
    addRoundRobin(women,femaleQuota);
    addRoundRobin(unknown,null);
    const leftovers=groups.flat();
    const placed=new Set(leftovers.map(h=>h.id));
    const remaining=shuffle(players.filter(h=>!placed.has(h.id)));
    for(const h of remaining){const target=groups.filter(g=>g.length<groupSize).sort((a,b)=>a.length-b.length)[0];if(target)target.push(h);}
    return groups;
  }

  function setMoveInGroups(s){
    const pool=living(s);s.teams=[];
    const groups=balancedGenderGroups(pool,4,4);
    groups.forEach((group,i)=>{
      const team={id:`movein-${i+1}`,name:`Move-In Group ${i+1}`,memberIds:group.map(h=>h.id)};
      s.teams.push(team);group.forEach(h=>h.teamId=team.id);
    });
  }

  function openingImmunity(s){
    setMoveInGroups(s);
    const all=living(s);
    const balancedSides=balancedGenderGroups(all,2,8);
    const g1=balancedSides[0],g2=balancedSides[1];
    const p1=C().runCompetition(g1,{week:1,type:"immunity-1"});
    const p2=C().runCompetition(g2,{week:1,type:"immunity-2"});
    log(s,{week:1,phase:"premiere",type:"immunity-1",winnerId:p1.winner.id,participants:g1.map(x=>x.id),competition:p1,title:`Premiere Immunity — ${p1.label}`,lines:[`${displayName(p1.winner)} wins the first preliminary immunity competition and advances to the final round.`]});
    log(s,{week:1,phase:"premiere",type:"immunity-2",winnerId:p2.winner.id,participants:g2.map(x=>x.id),competition:p2,title:`Premiere Immunity — ${p2.label}`,lines:[`${displayName(p2.winner)} wins the second preliminary immunity competition and advances to the final round.`]});
    openingPunishments(s,p1,p2);
    const final=C().runCompetition([p1.winner,p2.winner],{week:1,type:"immunity-final"});
    log(s,{week:1,phase:"premiere",type:"immunity-final",winnerId:final.winner.id,participants:[p1.winner.id,p2.winner.id],competition:final,title:`Premiere Immunity — ${final.label}`,lines:[`${displayName(final.winner)} wins the final immunity competition and may protect two entire move-in groups.`]});
    // The Surfing the BB Web winner MUST protect their own move-in group first,
    // then choose one of the other three move-in groups. This is a BB20-specific
    // rule; do not randomly select the first protected group.
    const winnerTeam=s.teams.find(t=>t.memberIds.includes(final.winner.id));
    const otherTeams=shuffle(s.teams.filter(t=>t.id!==winnerTeam?.id));
    const groups=[winnerTeam,otherTeams[0]].filter(Boolean);
    const immuneIds=[];
    groups.forEach(g=>g.memberIds.forEach(id=>{const h=hg(s,id);if(h){h.safe=true;immuneIds.push(h.id);}}));
    // Keep a dedicated Week 1 immunity list.  The generic `safe` flag is used
    // elsewhere in the engine for temporary safety, so relying on it alone can
    // accidentally make immune HGs eligible for the first HOH after another
    // routine resets safety.
    s.bb20Twists.openingImmunity={winnerId:final.winner.id,immuneTeamIds:groups.map(g=>g.id),immuneIds};
    log(s,{week:1,phase:"premiere",type:"opening-immunity",winnerId:final.winner.id,participants:immuneIds,immuneIds,title:"Premiere Immunity — Two Groups Protected",lines:[`${displayName(final.winner)} grants immunity to ${groups.map(g=>g.name).join(" and ")}.`,`The following eight houseguests are immune from the first eviction and cannot play in the first HOH: ${immuneIds.map(id=>displayName(hg(s,id))).join(", ")}.`,`Only the other eight houseguests are eligible for the first HOH.`]});
  }

  function appStoreRound(s,week){
    if(week<1||week>3)return;
    const app=s.bb20Twists.apps=s.bb20Twists.apps||{receivedIds:[],earlyEvictions:0,bonusLifeUsed:false,cloudUsed:false,identityTheftUsed:false};
    app.receivedIds=Array.isArray(app.receivedIds)?app.receivedIds:[];
    const eligible=living(s).filter(h=>!app.receivedIds.includes(h.id));
    if(eligible.length<2)return;
    // Use a stable but non-deterministic public-vote-style selection based on
    // social/general ratings, with a little noise so custom casts do not always
    // produce the same App Store recipients.
    const scored=eligible.map(h=>({h,score:(h.ratings.social||50)*.55+(h.ratings.general||50)*.45+Math.random()*30})).sort((a,b)=>b.score-a.score);
    const top=scored[0].h, least=scored[scored.length-1].h;
    const powers=["Bonus Life","The Cloud","Identity Theft"], craps=["Hamazon","Yell!","Read It!"];
    const power=powers[week-1],crap=craps[week-1];
    app.receivedIds.push(top.id,least.id);
    if(power==="Bonus Life")app.bonusLifeHolderId=top.id;
    if(power==="The Cloud")app.cloudHolderId=top.id;
    if(power==="Identity Theft")app.identityTheftHolderId=top.id;
    if(crap==="Hamazon")app.crapPunishments={...(app.crapPunishments||{}),[least.id]:{name:crap,week,description:"The Houseguest receives the Hamazon punishment and must deal with the delivered ham/food punishment for the week."}};
    if(crap==="Yell!")app.crapPunishments={...(app.crapPunishments||{}),[least.id]:{name:crap,week,description:"An angry reviewer repeatedly gives the Houseguest loud negative feedback for 24 hours."}};
    if(crap==="Read It!")app.crapPunishments={...(app.crapPunishments||{}),[least.id]:{name:crap,week,description:"The Houseguest must wear a costume and read Hamlet in a Shakespearean style until the punishment is completed."}};
    log(s,{week,phase:"standard",type:"app-store",winnerId:top.id,participants:[top.id,least.id],data:{powerApp:power,crapApp:crap,crapId:least.id},title:`BB App Store — Week ${week}`,lines:[`${displayName(top)} is the week's Top Trending Houseguest and receives the ${power} Power App.`,`${displayName(least)} is the week's Least Trending Houseguest and receives the ${crap} Crap App punishment.`,`Neither Houseguest is eligible for another BB App Store result in a later week.`]});
  }

  function initializeApps(s){
    s.bb20Twists.apps={receivedIds:[],bonusLifeHolderId:null,cloudHolderId:null,identityTheftHolderId:null,bonusLifeUsed:false,cloudUsed:false,identityTheftUsed:false,earlyEvictions:0,crapPunishments:{}};
  }

  function openingPunishments(s,p1,p2){
    const losers=[p1?.ranking?.[p1.ranking.length-1]?.id,p2?.ranking?.[p2.ranking.length-1]?.id].filter(Boolean);
    const punishments=["Pinwheel of Doom","Robot"]; losers.forEach((id,i)=>{const h=hg(s,id);if(!h)return;const punishment=punishments[i]||"Week 1 Punishment";s.bb20Twists.openingPunishments=s.bb20Twists.openingPunishments||[];s.bb20Twists.openingPunishments.push({houseguestId:id,punishment});log(s,{week:1,phase:"premiere",type:"punishment",winnerId:id,participants:[id],title:`Week 1 Punishment — ${punishment}`,lines:[`${displayName(h)} receives the ${punishment} punishment from the Week 1 premiere competition.`]});});
  }

  function eligibleHOH(s,extra=[]){
    const blocked=new Set([...(s._priorHohIds||[]),...extra]);
    const openingImmune=new Set(s.bb20Twists?.openingImmunity?.immuneIds||[]);
    return living(s).filter(h=>{
      if(blocked.has(h.id)) return false;
      // Week 1 is special: the eight premiere-immune HGs are explicitly
      // ineligible even if another routine has changed the generic `safe` flag.
      if(Number(s.week)===1 && openingImmune.has(h.id)) return false;
      return !h.safe;
    });
  }

  function chooseNominees(s,hoh,week){
    let pool=living(s).filter(p=>p.id!==hoh.id&&!p.safe);
    if(R()?.pickNominees){try{const p=R().pickNominees(s,hoh,pool,Math.min(2,pool.length));if(p?.length>=2)return p.slice(0,2);}catch(e){}}
    return shuffle(pool).slice(0,2);
  }

  function applyCloud(s,hoh,noms,week){
    const holderId=s.bb20Twists.apps?.cloudHolderId;
    const holder=hg(s,holderId);
    if(!holder||!holder.active||s.bb20Twists.apps.cloudUsed)return noms;
    if(!noms.some(n=>n.id===holder.id))return noms;
    const r=s.relationships?.[hoh.id]?.[holder.id]||{};
    const targetRisk=(100-Number(r.trust||50))*.20+(100-Number(r.loyalty||50))*.12+Number(r.rivalry||0)*.42+Number(holder.ratings?.strategic||50)*.10+Number(holder.ratings?.physical||50)*.06;
    const useChance=Math.max(.18,Math.min(.88,.28+targetRisk/150));
    if(Math.random()>useChance){
      log(s,{week,phase:s.phase,type:"power-decision",winnerId:holder.id,title:"The Cloud — Held",lines:[`${displayName(holder)} is eligible to activate The Cloud but decides not to use it this week, preserving the power for a more dangerous nomination or Veto meeting.`]});
      return noms;
    }
    s.bb20Twists.apps.cloudUsed=true;
    const replPool=living(s).filter(p=>p.id!==hoh.id&&p.id!==holder.id&&!p.safe&&!noms.some(n=>n.id===p.id));
    const replacement=R()?.pickReplacement?R().pickReplacement(s,hoh,replPool,noms.map(n=>n.id)):pick(replPool);
    if(replacement){replacement.nominated=true;const final=noms.filter(n=>n.id!==holder.id).concat(replacement);log(s,{week,phase:s.phase,type:"power-use",winnerId:holder.id,title:"The Cloud — Power Used",lines:[`${displayName(holder)} activates The Cloud and protects themselves from nomination.`,`${displayName(hoh)} names ${displayName(replacement)} as the replacement nominee.`]});return final;}
    return noms;
  }

  function applyIdentityTheft(s,hoh,noms,week){
    const app=s.bb20Twists.apps||{},holder=hg(s,app.identityTheftHolderId);
    if(!holder||!holder.active||app.identityTheftUsed||holder.id===hoh.id)return noms;
    const hr=s.relationships?.[hoh.id]?.[holder.id]||{},nominated=noms.some(n=>n.id===holder.id);
    const risk=Number(hr.rivalry||0)*.45+(100-Number(hr.trust||50))*.18+(100-Number(hr.loyalty||50))*.12+(nominated?42:0)+(Number(holder.ratings?.strategic||50)-50)*.10;
    const useChance=Math.max(.10,Math.min(.62,.16+risk/180));
    if(Math.random()>useChance){
      log(s,{week,phase:s.phase,type:"power-decision",winnerId:holder.id,title:"Identity Theft — Held",lines:[`${displayName(holder)} secretly has Identity Theft available but decides not to use it this week.`]});
      return noms;
    }
    // Identity Theft replaces the HOH's *initial* nominations, so the two
    // selections must be new nominees rather than simply re-selecting someone
    // the HOH already put on the block. Keep the holder, HOH, and already-safe
    // Houseguests ineligible.
    const originalNomineeIds=new Set(noms.map(n=>n.id));
    const candidates=living(s).filter(p=>
      p.id!==hoh.id &&
      p.id!==holder.id &&
      !p.safe &&
      !originalNomineeIds.has(p.id)
    );
    if(candidates.length<2)return noms;
    const scored=candidates.map(target=>{
      const r=s.relationships?.[holder.id]?.[target.id]||{},ally=R()?.isAllyOf?.(s,holder.id,target.id);
      const threat=(target.ratings?.strategic||50)*.42+(target.ratings?.physical||50)*.16+(target.ratings?.social||50)*.10+(target.ratings?.mental||50)*.08;
      return {target,score:threat+Number(r.rivalry||0)*.35-(Number(r.friendship||50)+Number(r.trust||50))*.12-(ally?35:0)+Math.random()*8};
    }).sort((a,b)=>b.score-a.score);
    const chosen=scored.slice(0,2).map(x=>x.target); if(chosen.length<2)return noms;
    app.identityTheftUsed=true;
    // Mark this ceremony as an Identity Theft ceremony so the normal HOH
    // ally-protection cleanup cannot silently undo the power's nominations.
    s._identityTheftActive=true;
    noms.forEach(n=>n.nominated=false);
    chosen.forEach(n=>n.nominated=true);
    s.nominees=chosen.map(n=>n.id);
    s.intendedTarget=displayName(chosen[0]);
    s.intendedTargetId=chosen[0].id;
    s.targetHistory=[{text:displayName(chosen[0]),reason:"Identity Theft — secret replacement nominations"}];
    s.backdoorTargetId=null;
    log(s,{week,phase:s.phase,type:"power-use",winnerId:holder.id,title:"Identity Theft — Power Used",lines:[`${displayName(holder)} secretly activates Identity Theft and replaces the HOH's nominations.`,`${displayName(holder)} secretly nominates ${displayName(chosen[0])} and ${displayName(chosen[1])}.`,`The HOH retains control over later replacement nominations.`]});
    return chosen;
  }

  function runNominations(s,week){
    const hoh=hg(s,s.currentHOH);
    // Decide on the week's strategic plan BEFORE the nominations are made.
    // The previous implementation asked the backdoor planner to inspect the
    // already-selected nominees, which made the planner reject most weeks as
    // soon as one of those nominees looked like the obvious target. That made
    // intentional backdoors effectively disappear from the simulation.
    s.backdoorTargetId=null;
    s._plannedBackdoor=null;
    if(R()?.planBackdoor && !s._identityTheftActive){
      try {
        const prePlan=R().planBackdoor(s,hoh,[]);
        if(prePlan?.use&&prePlan.target){
          s._plannedBackdoor=prePlan;
          s.backdoorTargetId=prePlan.target.id;
        }
      } catch(e) { console.warn("BB20 pre-nomination backdoor planner skipped:",e); }
    }
    let noms=chooseNominees(s,hoh,week);

    // A planned backdoor requires two people the HOH is willing to leave on
    // the block as pawns. If the planned target was accidentally selected by
    // ordinary nomination scoring, replace that target with a safer pawn.
    if(s._plannedBackdoor?.target){
      const target=s._plannedBackdoor.target;
      if(noms.some(n=>n.id===target.id)){
        const pawnPool=living(s).filter(p=>
          p.id!==hoh.id && p.id!==target.id && !p.safe && !noms.some(n=>n.id===p.id)
        );
        const protectedPawnPool=pawnPool.filter(p=>{
          if(!R()?.isAllyOf?.(s,hoh.id,p.id)) return true;
          const r=s.relationships?.[hoh.id]?.[p.id]||{};
          return Number(r.rivalry||0)>=78 && Number(r.trust||50)<=30 && Number(r.loyalty||50)<=30;
        });
        const candidates=protectedPawnPool.length?protectedPawnPool:pawnPool;
        if(candidates.length){
          candidates.sort((a,b)=>{
            const score=p=>{
              const r=s.relationships?.[hoh.id]?.[p.id]||{};
              const bond=(Number(r.friendship||50)+Number(r.trust||50)+Number(r.loyalty||50)+Number(r.respect||50)-Number(r.rivalry||0))/4;
              const threat=(Number(p.ratings?.strategic||50)*.42+Number(p.ratings?.physical||50)*.20+Number(p.ratings?.mental||50)*.12);
              return bond-threat*.35+Math.random()*3;
            };
            return score(b)-score(a);
          });
          noms[noms.findIndex(n=>n.id===target.id)]=candidates[0];
        }
      }
    }

    noms=applyCloud(s,hoh,noms,week);
    // Record the HOH's genuine target before Identity Theft can replace the
    // block. The HOH should adapt their strategy to the stolen nominations,
    // not suddenly pretend that an ally put up by the power holder was their
    // intended target all along.
    const hohPreferredBeforeHijack=noms.slice().sort((a,b)=>relationshipScore(s,hoh,a)-relationshipScore(s,hoh,b))[0]||null;
    noms=applyIdentityTheft(s,hoh,noms,week);
    noms.forEach(n=>n.nominated=true);s.nominees=noms.map(n=>n.id);
    // The initial target is the least-protected nominee from the HOH's perspective.
    // Record the target as an ID as well as display text so later strategy checks
    // can reliably tell whether the real target is already on the block.
    // Defensive cleanup: if the nomination strategy somehow produced an HOH
    // ally while two or more eligible non-allies existed, replace that ally
    // before recording the ceremony. This prevents downstream code from ever
    // treating a protected ally as an intentional target.
    const isProtectedAlly = h => {
      if (!R()?.isAllyOf || !R().isAllyOf(s, hoh.id, h.id)) return false;
      const r = s.relationships?.[hoh.id]?.[h.id] || {};
      return !(Number(r.rivalry || 0) >= 78 && Number(r.trust || 50) <= 30 && Number(r.loyalty || 50) <= 30);
    };
    const availableNonAllies = living(s).filter(h => h.id !== hoh.id && !h.safe && !isProtectedAlly(h) && !noms.some(n => n.id === h.id));
    // Do not rewrite Identity Theft's secret nominations. The power holder,
    // not the HOH's original nomination strategy, owns the initial block when
    // the power is successfully activated.
    if (!s._identityTheftActive && availableNonAllies.length) {
      for (let i = 0; i < noms.length; i++) {
        if (!isProtectedAlly(noms[i])) continue;
        const replacement = availableNonAllies.shift();
        if (replacement) {
          noms[i].nominated = false;
          noms[i] = replacement;
          replacement.nominated = true;
        }
      }
    }
    // Keep the authoritative nominee IDs synchronized with the final names
    // shown in the nomination ceremony after any defensive replacement.
    s.nominees=noms.map(n=>n.id);
    // Final authoritative synchronization: the ceremony, state, and every
    // downstream POV/eviction routine all use this exact nominee list.
    s.nominees=noms.map(n=>n.id);
    let target;
    if(s._identityTheftActive){
      const preferred=hohPreferredBeforeHijack;
      const trustedAlly=h=>isTrustedAlly(s,hoh.id,h.id);
      const alternatives=living(s).filter(h=>h.id!==hoh.id&&!h.safe&&!trustedAlly(h));
      // Keep the original target when it remains a sensible target; otherwise
      // pick a different non-ally based on strategic/competition threat and
      // relationship risk. Never make a trusted ally the default target just
      // because Identity Theft put them on the block.
      target=preferred&&preferred.active&&!trustedAlly(preferred)?preferred:null;
      if(!target&&alternatives.length){
        alternatives.sort((a,b)=>{
          const score=h=>{
            const r=s.relationships?.[hoh.id]?.[h.id]||{};
            return Number(h.ratings?.strategic||50)*.36+Number(h.ratings?.physical||50)*.18+Number(h.ratings?.mental||50)*.12+Number(r.rivalry||0)*.30+(100-Number(r.trust||50))*.10+(100-Number(r.loyalty||50))*.08+Math.random()*4;
          };
          return score(b)-score(a);
        });
        target=alternatives[0];
      }
    } else {
      target=noms.slice().sort((a,b)=>relationshipScore(s,hoh,a)-relationshipScore(s,hoh,b))[0];
    }
    s.intendedTarget=target?displayName(target):null;
    s.intendedTargetId=target?.id||null;
    s.targetHistory=[{text:s.intendedTarget,reason:s._identityTheftActive?"HOH's revised target after Identity Theft":"Initial target"}];
    s.nominationStrategy=null;
    if(s._identityTheftActive){
      // Identity Theft owns the initial nominations and therefore cancels any
      // HOH backdoor plan for this ceremony, but not the HOH's separate target.
      s.backdoorTargetId=null;
      s._plannedBackdoor=null;
      s.nominationStrategy={type:"identity-theft",holderId:s.bb20Twists.apps.identityTheftHolderId};
    } else if(s._plannedBackdoor?.target){
      s.backdoorTargetId=s._plannedBackdoor.target.id;
      s.nominationStrategy={type:"backdoor",targetId:s.backdoorTargetId,reason:s._plannedBackdoor.reason};
      s.targetHistory.push({text:displayName(s._plannedBackdoor.target),reason:`Backdoor plan — ${s._plannedBackdoor.reason}`});
    }
    log(s,{week,phase:s.phase,type:"nominations",hohId:hoh.id,nomineeIds:s.nominees,intendedTarget:s.intendedTarget,backdoorTargetId:s.backdoorTargetId||null,targetHistory:s.targetHistory,nominationStrategy:s.nominationStrategy||null,title:"Nomination Ceremony",lines:[s._identityTheftActive?`The Identity Theft holder secretly replaces the HOH's initial nominations with ${noms.map(displayName).join(" and ")}. The HOH does not control the initial block but retains control of any replacement nomination after the Veto.`:`${displayName(hoh)} nominates ${noms.map(displayName).join(" and ")} for eviction.`,s._identityTheftActive&&s.intendedTarget?`${displayName(hoh)} adjusts their target to ${s.intendedTarget} rather than treating a trusted ally placed on the block by Identity Theft as their own target.`:"",s.nominationStrategy?.type==='duo'?`The HOH deliberately nominates the duo together as a strategic pair.`:"",s.backdoorTargetId?`The HOH is considering a backdoor against ${displayName(hg(s,s.backdoorTargetId))}.`:""] .filter(Boolean)});
    s._identityTheftActive=false;
    s._plannedBackdoor=null;
  }

  function selectPOVPlayers(s,week,forcedId=null){
    const hoh=hg(s,s.currentHOH),noms=s.nominees.map(id=>hg(s,id)).filter(Boolean);
    // The HOH and nominees are automatic participants. The remaining three
    // seats are drawn from eligible houseguests; a Hacker-selected player must
    // occupy one of those seats, never be silently dropped or duplicated.
    const fixed=[];
    if(hoh)fixed.push(hoh);
    noms.forEach(n=>{if(!fixed.some(p=>p.id===n.id))fixed.push(n);});
    const fixedIds=new Set(fixed.map(p=>p.id));
    let extrasPool=living(s).filter(p=>!fixedIds.has(p.id)&&p.active&&!p.safe);
    const forced=forcedId?hg(s,forcedId):null;
    const forcedEligible=!!(forced&&forced.active&&!forced.safe&&!fixedIds.has(forced.id)&&extrasPool.some(p=>p.id===forced.id));
    let extras=[];
    if(forcedEligible){
      extras.push(forced);
      extrasPool=extrasPool.filter(p=>p.id!==forced.id);
    }
    const seats=Math.max(0,Math.min(3,6-fixed.length)-extras.length);
    extras=extras.concat(shuffle(extrasPool).slice(0,seats));
    const pool=fixed.concat(extras);
    s.povPlayers=pool.map(p=>p.id);
    const lines=[`${pool.map(displayName).join(", ")} compete for the Power of Veto.`];
    if(forcedEligible)lines.push(`${displayName(forced)} takes the H@cker-selected Veto seat.`);
    log(s,{week,phase:s.phase,type:"pov-players",hohId:hoh?.id||null,nomineeIds:s.nominees,povPlayers:s.povPlayers,participants:s.povPlayers,title:"Power of Veto Players",lines});
    return pool;
  }

  function runPOV(s,week,type="pov",forcedId=null){
    const pool=selectPOVPlayers(s,week,forcedId),hoh=hg(s,s.currentHOH);
    const hacker=s.bb20Twists.hacker?.week===week?s.bb20Twists.hacker:null;
    const hackerReplacement=hg(s,hacker?.replacementId);
    const hohProtectingAlly=!!(hoh&&hackerReplacement&&hackerReplacement.active&&isTrustedAlly(s,hoh.id,hackerReplacement.id));
    let originalRatings=null;
    // If H@cker has put the HOH's ally on the block, the HOH has a strategic
    // reason to push harder in the Veto. Give a modest, temporary motivation
    // bonus to their competition performance; it improves their odds but never
    // guarantees a win, and their stored ratings are restored immediately.
    if(hohProtectingAlly&&pool.some(p=>p.id===hoh.id)){
      originalRatings={...hoh.ratings};
      ['general','physical','mental','social','strategic'].forEach(k=>hoh.ratings[k]=Math.min(100,Number(hoh.ratings[k]??50)+14));
    }
    const comp=C().runCompetition(pool,{week,type});
    if(originalRatings)hoh.ratings=originalRatings;
    s.vetoWinners=[comp.winner.id];
    const lines=[`${displayName(comp.winner)} wins the Power of Veto.`];
    if(hohProtectingAlly){
      lines.push(comp.winner.id===hoh.id?`${displayName(hoh)} wins the Veto while trying to protect ally ${displayName(hackerReplacement)} from the H@cker's nomination.`:`${displayName(hoh)} pushes to win the Veto to protect ally ${displayName(hackerReplacement)}, but ${displayName(comp.winner)} wins instead.`);
    }
    log(s,{week,phase:s.phase,type:"veto",winnerId:comp.winner.id,participants:pool.map(p=>p.id),competition:comp,title:`Power of Veto — ${comp.label}`,lines});
    return comp.winner;
  }

  function applyVeto(s,week,winner,forceNoUse=false){
    const noms=s.nominees.map(id=>hg(s,id)).filter(Boolean),hoh=hg(s,s.currentHOH);
    if(!noms.length)return;
    let decision=forceNoUse?{use:false}:R().decideVetoUse(s,winner,hoh,noms);
    const hacker=s.bb20Twists.hacker?.week===week?s.bb20Twists.hacker:null;
    const hackerReplacedAlly=hg(s,hacker?.replacementId);
    if(!forceNoUse&&winner.id===hoh?.id&&hackerReplacedAlly&&noms.some(n=>n.id===hackerReplacedAlly.id)&&isTrustedAlly(s,hoh.id,hackerReplacedAlly.id)){
      decision={use:true,saveId:hackerReplacedAlly.id,reason:"HOH protects ally targeted by H@cker"};
    }
    if(winner.id===noms[0]?.id||winner.id===noms[1]?.id) decision={use:true,saveId:winner.id};
    if(!decision.use){log(s,{week,phase:s.phase,type:"veto-ceremony",hohId:hoh.id,winnerId:winner.id,nomineeIds:s.nominees,finalNomineeIds:s.nominees,vetoUsed:false,title:"Veto Ceremony — Not Used",lines:[`${displayName(winner)} does not use the Power of Veto.`]});return;}
    const saved=noms.find(n=>n.id===decision.saveId)||noms[0];saved.nominated=false;
    const pool=living(s).filter(p=>p.id!==hoh.id&&!p.safe&&!noms.some(n=>n.id===p.id)&&p.id!==winner.id);
    let repl=R()?.pickReplacement?R().pickReplacement(s,hoh,pool,noms.map(n=>n.id)):pick(pool);
    const cloudHolder=hg(s,s.bb20Twists.apps?.cloudHolderId);
    if(repl&&cloudHolder&&cloudHolder.active&&!s.bb20Twists.apps.cloudUsed&&repl.id===cloudHolder.id){
      const cr=s.relationships?.[hoh.id]?.[cloudHolder.id]||{};
      const cloudRisk=Number(cr.rivalry||0)*.38+(100-Number(cr.trust||50))*.18+(100-Number(cr.loyalty||50))*.12+(Number(cloudHolder.ratings?.strategic||50)-50)*.08;
      const cloudUseChance=Math.max(.22,Math.min(.82,.30+cloudRisk/170));
      if(Math.random()<cloudUseChance){
        s.bb20Twists.apps.cloudUsed=true;
        const alternatives=pool.filter(p=>p.id!==cloudHolder.id);
        const alt=R()?.pickReplacement?R().pickReplacement(s,hoh,alternatives,noms.map(n=>n.id)):pick(alternatives);
        if(alt){
          log(s,{week,phase:s.phase,type:"power-use",winnerId:cloudHolder.id,title:"The Cloud — Veto Meeting Use",lines:[`${displayName(cloudHolder)} activates The Cloud when the replacement nomination is about to fall on them.`,`${displayName(hoh)} must choose another eligible replacement nominee.`]});
          repl=alt;
        }
      }
    }
    if(repl&&(repl.id===winner.id||repl.id===hoh.id||repl.safe))repl=pick(pool.filter(p=>p.id!==winner.id&&p.id!==hoh.id&&!p.safe));
    const finalNoms=noms.filter(n=>n.id!==saved.id);if(repl){repl.nominated=true;finalNoms.push(repl);}
    s.nominees=finalNoms.map(n=>n.id);
    log(s,{week,phase:s.phase,type:"veto-ceremony",hohId:hoh.id,winnerId:winner.id,nomineeIds:s.nominees,finalNomineeIds:s.nominees,vetoUsed:true,title:"Veto Ceremony — Used",lines:[`${displayName(winner)} uses the Power of Veto on ${displayName(saved)}${repl?`; ${displayName(hoh)} names ${displayName(repl)} as the replacement nominee.`:"."}`]});
  }

  function runHacker(s,week){
    if(!CFG().hackerWeeks.includes(week))return null;
    const pool=living(s).filter(h=>h.active);
    if(!pool.length)return null;
    const comp=C().runCompetition(pool,{week,type:"hacker"}),hacker=comp.winner;
    const originalNomineeIds=s.nominees.slice();
    const originalNomineeSet=new Set(originalNomineeIds);
    const noms=originalNomineeIds.map(id=>hg(s,id)).filter(Boolean);
    let removed=null,replacement=null;
    if(noms.length){
      // Choose a nominee the Hacker is least aligned with, then replace them
      // with a legal, active player. If no replacement is legal, leave the
      // original block untouched rather than creating mismatched flags/state.
      removed=noms.slice().sort((a,b)=>relationshipScore(s,hacker,a)-relationshipScore(s,hacker,b))[0];
      const replPool=pool.filter(p=>p.id!==hacker.id&&p.id!==s.currentHOH&&p.id!==s.currentHOH?.id&&!originalNomineeSet.has(p.id)&&!p.safe&&p.active);
      const nonAllyPool=replPool.filter(p=>{
        if(!R()?.isAllyOf || !R().isAllyOf(s,hacker.id,p.id))return true;
        const r=s.relationships?.[hacker.id]?.[p.id]||{};
        return Number(r.rivalry||0)>=78&&Number(r.trust||50)<=30&&Number(r.loyalty||50)<=30;
      });
      replacement=pick(nonAllyPool.length?nonAllyPool:replPool);
      if(replacement){
        removed.nominated=false;replacement.nominated=true;
        s.nominees=originalNomineeIds.filter(id=>id!==removed.id).concat(replacement.id);
      } else {
        removed=null;replacement=null;
        s.nominees=originalNomineeIds.slice();
      }
    }
    // The H@cker's extra POV choice must be a non-HOH, non-nominee active
    // player. If the HOH wins H@cker, the HOH already has their automatic seat.
    const nomineeIds=new Set(s.nominees);
    const forcedPool=living(s).filter(p=>p.id!==s.currentHOH&&p.id!==hacker.id&&!nomineeIds.has(p.id)&&p.active&&!p.safe);
    const forced=hacker.id===s.currentHOH?null:pick(forcedPool);
    // Keep all nominee flags synchronized with the authoritative nominee list.
    const finalSet=new Set(s.nominees);
    s.houseguests.forEach(p=>{p.nominated=finalSet.has(p.id);});
    const actualChanged=originalNomineeIds.some(id=>!finalSet.has(id))||s.nominees.some(id=>!originalNomineeSet.has(id));
    const removedActual=actualChanged?hg(s,originalNomineeIds.find(id=>!finalSet.has(id))):null;
    const replacementActual=actualChanged?hg(s,s.nominees.find(id=>!originalNomineeSet.has(id))):null;
    s.bb20Twists.hacker={...s.bb20Twists.hacker,week,hackerId:hacker.id,replacedId:removedActual?.id||null,replacementId:replacementActual?.id||null,forcedPovPlayerId:forced?.id||null,voteNullified:false,nullifiedVoterId:null};
    log(s,{week,phase:s.phase,type:"hacker",winnerId:hacker.id,participants:pool.map(p=>p.id),competition:comp,title:`H@cker Competition — ${comp.label}`,lines:[
      `The H@cker is anonymous to the house.`,
      actualChanged?`The H@cker removes ${displayName(removedActual)} from the block and replaces them with ${displayName(replacementActual)}. The nominations have changed.`:`The H@cker leaves the nominations unchanged because no legal replacement was available.`,
      forced?`${displayName(hacker)} secretly selects ${displayName(forced)} as the extra Veto player.`:hacker.id===s.currentHOH?`${displayName(hacker)} is already guaranteed a Veto seat as HOH, so no extra Veto player is selected.`:"No additional Veto player is selected.",
      "The H@cker may also nullify one eviction vote."
    ]});
    return hacker;
  }

  function evictionCycle(s,week,opts={}){
    const noms=s.nominees.map(id=>hg(s,id)).filter(Boolean);if(!noms.length)return null;
    const hoh=hg(s,s.currentHOH),nomIds=new Set(noms.map(n=>n.id));
    let voters=(opts.voterPool||living(s)).filter(p=>p.id!==hoh.id&&!nomIds.has(p.id));
    const hacker=s.bb20Twists.hacker?.week===week?s.bb20Twists.hacker:null;

    // BB20 Hacker power: during Weeks 6–7 exactly ONE otherwise-eligible
    // voter has their eviction vote blocked. Choose the blocked voter before
    // votes are generated so the blocked vote can never accidentally remain
    // in the official tally. The Hacker themselves is also a legal voter, so
    // they are allowed to be the blocked voter in the simulation.
    let nullifiedVoterId=null;
    if(hacker){
      const eligibleToBlock=voters.filter(v=>v.active&&v.id!==hoh.id&&!nomIds.has(v.id));
      const blockedVoter=pick(eligibleToBlock);
      if(blockedVoter){
        nullifiedVoterId=blockedVoter.id;
        voters=voters.filter(v=>v.id!==nullifiedVoterId);
        hacker.nullifiedVoterId=nullifiedVoterId;
        hacker.voteNullified=true;
        log(s,{week,phase:s.phase,type:"hacker-vote-nullified",winnerId:hacker.hackerId,blockedVoterId:nullifiedVoterId,title:"H@cker — Vote Nullified",lines:[`${displayName(hg(s,hacker.hackerId))} secretly nullifies ${displayName(hg(s,nullifiedVoterId))}'s eviction vote.`]});
      }
    }

    const counts={};noms.forEach(n=>counts[n.id]=0);s.evictionVotes=[];
    voters.forEach(v=>{let out=noms.length===2?R().decideVote(s,v,noms[0],noms[1],hoh):R().decideVoteMulti(s,v,noms,hoh);if(!(out in counts))out=noms[0].id;counts[out]++;s.evictionVotes.push({voterId:v.id,targetId:out});});
    const max=Math.max(...Object.values(counts)),tops=Object.keys(counts).filter(id=>counts[id]===max);
    let evictedId=tops.length===1?tops[0]:null,tie=null;
    if(tops.length>1){
      tie=R()?.decideTieBreak?R().decideTieBreak(s,hoh,hg(s,tops[0]),hg(s,tops[1])):tops[Math.floor(Math.random()*tops.length)];
      evictedId=tie;
      // The HOH's tie-break vote is a real deciding vote, so include it in the
      // official displayed count (e.g. 3–3 becomes 4–3), without treating the
      // HOH as an ordinary voter in the voting log.
      counts[evictedId]=(counts[evictedId]||0)+1;
    }
    const evicted=hg(s,evictedId);
    log(s,{week,phase:s.phase,type:"eviction-voting",nomineeIds:noms.map(n=>n.id),voterIds:voters.map(v=>v.id),votes:s.evictionVotes,title:"Eviction Vote",lines:s.evictionVotes.map(v=>`${displayName(hg(s,v.voterId))} votes to evict ${displayName(hg(s,v.targetId))}.`)});
    evicted.active=false;evicted.evicted=true;s.season.evictionCount++;
    s._permanentEvictionOrder=s._permanentEvictionOrder||[];
    if(!s._permanentEvictionOrder.includes(evicted.id))s._permanentEvictionOrder.push(evicted.id);
    const threshold=CFG().juryThresholdPlacement||11;
    const juryStartCount=Math.max(1,s.season.castSize-threshold+1);
    if(s._permanentEvictionOrder.length>=juryStartCount&&!s.jury.includes(evicted.id)){evicted.juryMember=true;s.jury.push(evicted.id);}
    evicted.placement=null;
    s.evicted.push(evicted.id);
    s.bb20Twists.apps&&(s.bb20Twists.apps.earlyEvictions=(s.bb20Twists.apps.earlyEvictions||0)+1);
    const evictedVotes=Number(counts[evictedId]||0);
    const totalCountedVotes=Object.values(counts).reduce((sum,n)=>sum+Number(n||0),0);
    const stayVoteCount=Math.max(0,totalCountedVotes-evictedVotes);
    log(s,{week,phase:s.phase,type:"eviction",evictedId:evicted.id,voteCounts:counts,evictedVoteCount:evictedVotes,stayVoteCount,tieBreakVoteId:tie?hoh.id:null,tieBreakEvictedId:tie||null,nomineeIds:noms.map(n=>n.id),title:"Eviction",lines:[`By a vote of ${evictedVotes}-${stayVoteCount}, ${displayName(evicted)} has been evicted.`,tie?`${displayName(hoh)} casts the tiebreaking vote.`:"",evicted.juryMember?`${displayName(evicted)} joins the jury.`:`${displayName(evicted)} has been evicted and is currently out of the game.`].filter(Boolean)});
    s.nominees=[];s.povPlayers=[];s.vetoWinners=[];s.evictionVotes=[];s.bb20Twists.hacker=null;
    return evicted;
  }

  function bonusLifeCheck(s,evicted,week){
    const app=s.bb20Twists.apps;if(!app||app.bonusLifeUsed||!evicted)return evicted;
    const holder=hg(s,app.bonusLifeHolderId);
    const earlyCount=app.earlyEvictions||0;
    // BB20-accurate deterministic outcome: Kaitlyn Herman received the
    // automatic Bonus Life opportunity after the fourth eviction and FAILED
    // the 2:30 puzzle. For this BB20 simulator, the Bonus Life therefore
    // never returns a Houseguest and never changes the jury/battle-back path.
    const eligibleNow=(holder?.id===evicted.id&&earlyCount<=3)||(earlyCount===4);
    if(!eligibleNow)return evicted;

    app.bonusLifeUsed=true;
    app.bonusLifeResult='failed';
    const comp={
      category:'mental',
      label:'Bonus Life — Outside The House',
      name:'Bonus Life — Outside The House',
      description:'Immediately after eviction, the evicted Houseguest must disassemble a life-size puzzle of themselves, move the pieces through the designated area, and reassemble the puzzle on the opposite side within 2 minutes and 30 seconds. They must complete the puzzle correctly and hit the buzzer before time expires. No other Houseguest competes in this challenge.',
      winner:null,
      participants:[{id:evicted.id,score:0}],
      ranking:[{id:evicted.id,score:0}],
      official:true,week,type:'bonus-life',result:'failed'
    };
    // Never add the Bonus Life loser to the jury prematurely and never
    // cancel the later Jury Battle Back. The normal eviction/jury logic has
    // already determined whether this person is a juror.
    s.bb20Twists.bonusLifeReturnOccurred=false;
    s.bb20Twists.juryBattleBackCancelled=false;
    log(s,{week,phase:s.phase,type:'bonus-life-return-failed',evictedId:evicted.id,participants:[evicted.id],competition:comp,title:'Bonus Life — Outside The House',lines:[`${displayName(evicted)} has been evicted and competes alone in the Bonus Life puzzle.`,`The challenge is a life-size puzzle of ${displayName(evicted)} with a 2 minute 30 second time limit.`,`${displayName(evicted)} does not complete the puzzle before time expires and remains evicted.`,`The Bonus Life does not return anyone to the game. The BB20 Jury Battle Back remains scheduled.`]});
    return evicted;
  }

  function runStandardWeek(s,week){
    s.week=week;
    s.phase="standard";
    // Opening-week immunity must remain active through the first HOH. On later
    // weeks, clear the previous week's safety before determining HOH eligibility.
    // Never clear Week 1 safety here, because those protected Houseguests are
    // specifically ineligible for the first HOH.
    if(week!==1){
      s.houseguests.forEach(h=>{h.safe=false;h.nominated=false;});
    }else{
      s.houseguests.forEach(h=>{h.nominated=false;});
    }
    const pool=eligibleHOH(s);if(pool.length<1)return null;
    const comp=C().runCompetition(pool,{week,type:"hoh"}),hoh=comp.winner;
    s.currentHOH=hoh.id;s._priorHohIds=[hoh.id];
    log(s,{week,phase:s.phase,type:"hoh",winnerId:hoh.id,participants:pool.map(p=>p.id),competition:comp,title:`Head of Household — ${comp.label}`,lines:[`${displayName(hoh)} wins HOH.`]});
    // The BB App Store results are revealed after the HOH competition, not
    // before it. The real twist operated in Weeks 1-3.
    if(week>=1&&week<=3)appStoreRound(s,week);
    runNominations(s,week);
    const hacker=runHacker(s,week);
    const forced=hacker?s.bb20Twists.hacker.forcedPovPlayerId:null;
    const pov=runPOV(s,week,"pov",forced);applyVeto(s,week,pov);
    const e=evictionCycle(s,week);
    if(e)bonusLifeCheck(s,e,week);
    return e;
  }

  function runDoubleEviction(s,week){
    s.week=week;s.phase="double-eviction";
    // A successful Bonus Life return cancels the later Jury Battle Back only.
    // The scheduled BB20 Double Eviction still happens normally.
    log(s,{week,phase:s.phase,type:"double-eviction-start",title:"Double Eviction Begins",lines:[s.bb20Twists.bonusLifeReturnOccurred?"The Bonus Life previously returned a Houseguest, so the Jury Battle Back will be skipped later in the season. The Double Eviction remains in effect.":"The house must complete two full eviction cycles during the same week."]});
    log(s,{week,phase:s.phase,type:"double-eviction-start",title:"Double Eviction Begins",lines:["The house must complete two full eviction cycles during the same week."]});
    runStandardWeek(s,week);
    if(living(s).length<=3)return;
    s.houseguests.forEach(h=>{h.safe=false;h.nominated=false;});
    const pool=eligibleHOH(s,[s.currentHOH].filter(Boolean));if(!pool.length)return;
    const comp=C().runCompetition(pool,{week,type:"hoh-double"}),hoh=comp.winner;s.currentHOH=hoh.id;s._priorHohIds=[hoh.id];
    log(s,{week,phase:s.phase,type:"hoh",round:2,winnerId:hoh.id,participants:pool.map(p=>p.id),competition:comp,title:`Double Eviction Round 2 — HOH — ${comp.label}`,lines:[`${displayName(hoh)} wins the second HOH of the week.`]});
    runNominations(s,week);
    const pov=runPOV(s,week,"pov-double");applyVeto(s,week,pov);
    evictionCycle(s,week);
  }

  function runSurpriseEviction(s,week){
    s.week=week;s.phase="surprise-eviction";s.houseguests.forEach(h=>{h.safe=false;h.nominated=false;});
    runStandardWeek(s,week);
    if(living(s).length<=3)return;
    s.houseguests.forEach(h=>{h.safe=false;h.nominated=false;});
    const pool=eligibleHOH(s,[s.currentHOH].filter(Boolean));if(pool.length<1)return;
    const comp=C().runCompetition(pool,{week,type:"hoh-double"}),hoh=comp.winner;s.currentHOH=hoh.id;s._priorHohIds=[hoh.id];
    log(s,{week,phase:s.phase,type:"hoh",round:2,winnerId:hoh.id,participants:pool.map(p=>p.id),competition:comp,title:`Surprise Eviction — HOH — ${comp.label}`,lines:[`${displayName(hoh)} wins the surprise second HOH.`]});
    runNominations(s,week);const pov=runPOV(s,week,"pov-double");applyVeto(s,week,pov);evictionCycle(s,week);
  }

  function runBattleBack(s){
    // BB20-accurate deterministic format: the Bonus Life is known to fail,
    // so the Jury Battle Back always occurs. Ignore any stale cancellation
    // flag from an older saved state.
    s.bb20Twists.juryBattleBackCancelled=false;
    const jurors=s.jury.map(id=>hg(s,id)).filter(Boolean).slice(0,4);
    if(jurors.length<2)return;
    const comp=C().runCompetition(jurors,{week:10,type:"battleback"});
    const winner=comp.winner;winner.active=true;winner.evicted=false;winner.juryMember=false;winner.placement=null;
    s.evicted=s.evicted.filter(id=>id!==winner.id);s.jury=s.jury.filter(id=>id!==winner.id);s._permanentEvictionOrder=(s._permanentEvictionOrder||[]).filter(id=>id!==winner.id);s.season.evictionCount=Math.max(0,s.season.evictionCount-1);
    s.bb20Twists.battleBackWinnerId=winner.id;
    log(s,{week:10,phase:"battleback",type:"battleback",winnerId:winner.id,participants:jurors.map(j=>j.id),competition:comp,title:`Jury Battle Back — ${comp.label}`,lines:[`${displayName(winner)} wins the Jury Battle Back and returns to the game.`,`The remaining jurors stay in the jury.`]});
  }

  function runFinale(s){
    s.week="Final";s.phase="finale";const three=living(s);if(three.length!==3)return;
    const p1=C().runCompetition(three,{week:13,type:"final-hoh-1"});log(s,{week:"Final",phase:"finale",type:"final3-part1",winnerId:p1.winner.id,participants:three.map(p=>p.id),competition:p1,title:`Final HOH Part 1 — ${p1.label}`,lines:[`${displayName(p1.winner)} wins Part 1 and advances to Part 3.`]});
    const rem=three.filter(p=>p.id!==p1.winner.id),p2=C().runCompetition(rem,{week:13,type:"final-hoh-2"});log(s,{week:"Final",phase:"finale",type:"final3-part2",winnerId:p2.winner.id,participants:rem.map(p=>p.id),competition:p2,title:`Final HOH Part 2 — ${p2.label}`,lines:[`${displayName(p2.winner)} wins Part 2 and advances to Part 3.`]});
    const p3=C().runCompetition([p1.winner,p2.winner],{week:13,type:"final-hoh-3"}),finalHoh=p3.winner,other=three.filter(p=>p.id!==finalHoh.id),chosen=R().decideFinalTwoPick(s,finalHoh,other),third=other.find(p=>p.id!==chosen.id);
    log(s,{week:"Final",phase:"finale",type:"final3-part3",winnerId:finalHoh.id,participants:[p1.winner.id,p2.winner.id],competition:p3,title:`Final HOH Part 3 — ${p3.label}`,lines:[`${displayName(finalHoh)} wins Final HOH.`]});
    third.active=false;third.evicted=true;third.placement=null;third.juryMember=true;if(!s.jury.includes(third.id))s.jury.push(third.id);s.evicted.push(third.id);s._permanentEvictionOrder=s._permanentEvictionOrder||[];if(!s._permanentEvictionOrder.includes(third.id))s._permanentEvictionOrder.push(third.id);
    log(s,{week:"Final",phase:"finale",type:"final-decision",hohId:finalHoh.id,thirdPlaceId:third.id,finalistIds:[finalHoh.id,chosen.id],title:"Final HOH's Decision",lines:[`${displayName(finalHoh)} takes ${displayName(chosen)} to Final 2 and evicts ${displayName(third)}.`]});
    const finalists=[finalHoh,chosen],jurors=s.jury.map(id=>hg(s,id)).filter(Boolean),tally={[finalists[0].id]:0,[finalists[1].id]:0};s._juryVotes=[];
    jurors.forEach(j=>{const vote=R().decideJuryVote(s,j,finalists[0],finalists[1]);tally[vote]++;s._juryVotes.push({voterId:j.id,targetId:vote});});
    log(s,{week:"Final",phase:"finale",type:"jury-vote",votes:s._juryVotes,finalistIds:finalists.map(p=>p.id),title:"The Jury Votes",lines:s._juryVotes.map(v=>`${displayName(hg(s,v.voterId))} votes for ${displayName(hg(s,v.targetId))}.`)});
    const winnerId=tally[finalists[0].id]>=tally[finalists[1].id]?finalists[0].id:finalists[1].id,runnerId=winnerId===finalists[0].id?finalists[1].id:finalists[0].id;
    hg(s,winnerId).placement=1;hg(s,runnerId).placement=2;hg(s,winnerId).active=false;hg(s,runnerId).active=false;
    const eliminationOrder=(s._permanentEvictionOrder||[]).filter(id=>id!==winnerId&&id!==runnerId);
    eliminationOrder.slice().reverse().forEach((id,index)=>{const h=hg(s,id);if(h)h.placement=index+3;});
    s.houseguests.forEach(h=>{if(h.placement>=3)h.juryMember=true;});
    const afpCandidates=s.houseguests.slice(),scores=afpCandidates.map(h=>{const avg=afpCandidates.filter(x=>x.id!==h.id).reduce((sum,o)=>sum+relationshipScore(s,h,o),0)/15;return{id:h.id,score:(h.ratings.social||50)*.45+(h.ratings.general||50)*.2+avg*.2+Math.random()*15};}).sort((a,b)=>b.score-a.score);
    const afpId=scores[0]?.id||winnerId,raw={};scores.forEach(x=>raw[x.id]=Math.max(.5,x.score));const total=Object.values(raw).reduce((a,b)=>a+b,0),afpVotes={};Object.keys(raw).forEach(id=>afpVotes[id]=Math.max(1,Math.round(raw[id]/total*100000)));const vt=Object.values(afpVotes).reduce((a,b)=>a+b,0);afpVotes[afpId]+=(100000-vt);
    s.finale={winnerId,runnerUpId:runnerId,thirdPlaceId:third.id,finalHohId:finalHoh.id,votes:tally,jurySize:jurors.length,prize:500000,runnerUpPrize:50000,americasFavoritePrize:25000,americasFavoriteId:afpId,americasFavoriteVotes:afpVotes};
    s.phase="complete";
    log(s,{week:"Final",phase:"finale",type:"winner",winnerId,runnerUpId:runnerId,thirdPlaceId:third.id,finalistIds:[winnerId,runnerId],afpId,afpVotes,title:`${displayName(hg(s,winnerId))} Wins Big Brother!`,lines:[`By a vote of ${tally[winnerId]}-${tally[runnerId]}, ${displayName(hg(s,winnerId))} wins Big Brother.`,`${displayName(hg(s,runnerId))} finishes as Runner-Up.`,`America's Favorite Houseguest: ${displayName(hg(s,afpId))}.`]});
  }

  function simulateSeason(s,config){
    ensureState(s);s.history=[];s.jury=[];s.evicted=[];s.evictionVotes=[];s.nominees=[];s.povPlayers=[];s.vetoWinners=[];s.currentHOH=null;s.finale=null;s._priorHohIds=[];s.bb20Twists={};s._permanentEvictionOrder=[];s.season.evictionCount=0;s.season.castSize=s.houseguests.length;
    s.houseguests.forEach(h=>{h.active=true;h.safe=false;h.nominated=false;h.juryMember=false;h.evicted=false;h.placement=null;});
    randomizeRelationships(s);openingImmunity(s);initializeApps(s);
    const firstPool=eligibleHOH(s);if(firstPool.length){
      const comp=C().runCompetition(firstPool,{week:1,type:"hoh"}),hoh=comp.winner;s.currentHOH=hoh.id;s._priorHohIds=[hoh.id];
      log(s,{week:1,phase:"standard",type:"hoh",winnerId:hoh.id,participants:firstPool.map(p=>p.id),competition:comp,title:`Head of Household — ${comp.label}`,lines:[`${displayName(hoh)} wins the first HOH of the season.`]});
      // App Store results are revealed after the first HOH, matching the BB20
      // episode/timeline order. The same rule is used for Weeks 2 and 3.
      appStoreRound(s,1);
      runNominations(s,1);const pov=runPOV(s,1,"pov");applyVeto(s,1,pov);const e=evictionCycle(s,1);if(e)bonusLifeCheck(s,e,1);
    }
    let week=2,guard=0;
    while(living(s).length>3&&week<=13&&guard<25){
      if(week===CFG().battleBackWeek){runBattleBack(s);}
      if(living(s).length<=3)break;
      if(week===CFG().doubleEvictionWeek)runDoubleEviction(s,week);
      else if(week===CFG().surpriseEvictionWeek)runSurpriseEviction(s,week);
      else if(week<=10)runStandardWeek(s,week);
      else break;
      week++;guard++;
    }
    // If the real-season week sequence has reached Final 3, proceed directly to finale.
    while(living(s).length>3&&guard<30){runStandardWeek(s,week);week++;guard++;}
    runFinale(s);
    if(window.LiveFeeds?.addToSeason)window.LiveFeeds.addToSeason(s);
    return s;
  }
  window.SeasonEngine={simulateSeason,displayName,ordinal};
})();
