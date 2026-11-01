/* Hypertower VII engine. No DOM and no changes to the I--XX engine. */
(function (root) {
  'use strict';
  const H = root.HT;
  if (!H || !H.N) throw Error('群星纪需要先加载 I–XX 引擎');
  if (H.GR) throw Error('群星纪引擎重复加载');
  const G = H.GR = {version: '7.0.0', schema: 7, modules: {}, handlers: {}, keys: {save: 'hypertower.v7', backup: 'hypertower.v7.backup', legacy: 'hypertower.v5'}};
  const old = {newState: H.newState, save: H.save, load: H.load, tick: H.tick, exportStr: H.exportStr, importStr: H.importStr, checkAch: H.checkAch,automate:H.automate,autoPrestige:H.autoPrestige,simulate:H.simulate};
  const N = H.N;
  function assert(ok, message) { if (!ok) throw Error(message); }
  function number(x, lo = 0, hi = Number.MAX_SAFE_INTEGER, integer = false, name = '数值') {
    assert(typeof x === 'number' && Number.isFinite(x) && x >= lo && x <= hi && (!integer || Number.isSafeInteger(x)), name + '无效'); return x;
  }
  function decimal(x, name = '计数') { assert(typeof x === 'string' && /^\d{1,10000}$/.test(x), name + '无效'); return BigInt(x); }
  function money(x) { const v = N(x); assert(v.sign >= 0 && !v.isNaN() && v.array.every(Number.isFinite), '货币无效'); return v; }
  function sumAmounts(a, b) {
    if(a.array.length===1&&a.array[0]===0)return b.clone();
    if(b.array.length===1&&b.array[0]===0)return a.clone();
    if(a.sign===1&&b.sign===1&&a.array.length===1&&b.array.length===1){
      const x=a.array[0],y=b.array[0];
      if(x>0&&y>0&&x<=Number.MAX_SAFE_INTEGER&&y<=Number.MAX_SAFE_INTEGER){
        // OmegaNum also adds native values here; retain its full routine past the precision cutoff.
        const larger=Math.max(x,y),smaller=Math.min(x,y);
        if(larger/smaller<=Number.MAX_SAFE_INTEGER)return N(x+y);
      }
    }
    return a.add(b);
  }
  function sumMoney(left, right) { return sumAmounts(money(left),money(right)); }
  const clone = x => JSON.parse(JSON.stringify(x));
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  function drain(job) { let result; do { result = job.next(); } while (!result.done); return result.value; }
  function hash(x) { const s = typeof x === 'string' ? x : stable(x); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  function hash64(x) { const text=typeof x==='string'?x:stable(x);let h=14695981039346656037n;for(const b of new TextEncoder().encode(text))h=BigInt.asUintN(64,(h^BigInt(b))*1099511628211n);return h.toString(36).padStart(13,'0').slice(-12); }
  function stable(x) { if (Array.isArray(x)) return '[' + x.map(stable).join(',') + ']'; if (x && typeof x === 'object') return '{' + Object.keys(x).sort().map(k => JSON.stringify(k) + ':' + stable(x[k])).join(',') + '}'; return JSON.stringify(x); }
  const bytes = text => new TextEncoder().encode(text).length;
  function safeJSON(text) { assert(typeof text === 'string' && text.length <= 8000000 && bytes(text) <= 8000000, '存档超过 8 MB'); return JSON.parse(text, (k, v) => { assert(!['__proto__', 'prototype', 'constructor'].includes(k), '存档含无效字段'); return v; }); }
  function syncCurrency(s,key,era) { if (!era && s.p3?.inf && ['dust','gamma'].includes(key)) s.p3.inf[key]=s.top[key].toString(); }
  const offlineGains = new WeakMap();
  function income(s, value) { const amount=money(value),factor=offlineGains.get(s)||1;return factor===1?amount.clone():amount.mul(factor); }
  function add(s, key, value, era, production = true) {
    const w=era?s.p3.ep[era]:s.top,k=era?'funds':key;
    let amount=production?income(s,value):money(value);
    const zero=amount.array.length===1&&amount.array[0]===0;
    if(!zero&&production&&!era&&key==='gamma'&&s.p3){const factor=1.25**[21,22,23,24].filter(id=>s.p3.ep[id]&&G.Obs.summary(s,id).bright===7).length;if(factor!==1)amount=amount.mul(factor);}
    const laser=!zero&&production&&!era&&key==='gamma'&&s.deg?.core.tree.D>=10&&s.p3.clock.laserStreak===3;
    if(laser)amount=amount.mul(8);w[k]=sumAmounts(money(w[k]),amount);if(laser)s.p3.clock.laserStreak=0;
    syncCurrency(s,key,era);return amount;
  }
  function spend(s, key, value, era) { const w = era ? s.p3.ep[era] : s.top, k = era ? 'funds' : key, v = money(value); if (money(w[k]).lt(v)) return false; w[k] = money(w[k]).sub(v); syncCurrency(s,key,era); return true; }
  function emit(s, type, data = {}) { s.events ||= []; s.events.push({type, t: s.time, ...data}); s.events = s.events.slice(-64); }
  function eraState(id) { return {id, level: 0, E: 0, complete: false, age: 0, funds: N(0), earned: N(0), up: Array(8).fill(0), clears: Array(4).fill(0), active: [], study: Array(4).fill(0), auto: {advance: false, explore: false, observe: false}, stats: {}, objects: {}}; }
  function top() { return Object.fromEntries(['gamma','ph','he','neutrons','gluons','horizonS','dust'].map(k => [k, N(0)])); }
  function migrate(input) {
    if (input.v === 7) return load(save(input));
    const state = old.load(old.save(input));
    state.v = 7; state.p1 = state.p2 = state.p3 = state.deg = null; state.journal = []; state.top = top(); state.events = []; state.created = Date.now(); state.saved = state.saved ?? state.last;
    return state;
  }
  function gate21(s) {
    if (s.p3 || s.era !== 20 || !s.eras?.['20']?.complete || BigInt(s.legacy?.round || '0') < 10n) return false;
    for (let i = 11; i <= 20; i++) { const a = s.archive?.[i]?.stars; if (!Array.isArray(a) || a.length !== 24 || a.some(n => n !== 3)) return false; }
    return true;
  }
  function legacyClone(s) { const raw = {...s, v: 5}; for (const k of ['p1','p2','p3','deg','top','events','journal','created','saved']) delete raw[k]; return old.load(old.save(raw)); }
  function enter21(s) {
    if (!gate21(s)) return false;
    const p1 = legacyClone(s), p2 = legacyClone(s);
    p1.era = 10; p1.won = true; p1.star = H.OMEGA; p1.best = H.OMEGA;
    p1.meta.started = true; p1.meta.rank = p1.meta.bestRank = 15;
    if (BigInt(p1.meta.epsilon) < 10n) p1.meta.epsilon = '10';
    p1.meta.bestEpsilon = p1.meta.epsilon; p1.meta.auto = {advance: true, shop: true, prestige: false};
    p1.eras = {}; p1.blueprints = []; p1.ord = {era: 10, alpha: {type: 'epsilon', index: p1.meta.epsilon}};
    p1.legacy.auto = false; p1.legacy.rebuilding = false; p1.workshop.enabled = false;p1.auto.arrange=true;
    p1.ui.shadow = true; p2.legacy.auto = true; p2.workshop.enabled = true; p2.ui.shadow = true;
    for (const [id, a] of Object.entries(p2.eras)) if (+id >= 12) a.auto = {harvest: true, buy: true, diagonal: true, next: true};
    if(p2.eras[11])p2.eras[11].auto={harvest:true,buy:true,diagonal:true};
    s.v = 7; s.p1 = p1; s.p2 = p2; s.top ||= top(); s.events ||= [];
    s.p3 = {era: 21, ep: {21: eraState(21)}, sky: G.Obs.newState(), clock: {carry: 0, p1Beat: -1e9, p2Beat: -1e9, p3Beat: -1e9, beatLength: 8, pulse: 0, p2Rounds: '0', season: 0, year: '0', leap: false, seed: .417}, ui: {pane: 'p3', tab: 'era', lens: 0, notation: s.ui?.notation || 'math'}};
    s.deg = G.Deg.newState(); s.journal = [{t: s.time, era: 21, at: Date.now()}];
    G.Hearts?.init(s); G.Deg.importLegacy(s); G.Era21.init(s); G.Workshop?.init(s);G.Shadow?.init(s); emit(s, 'entered', {era: 21}); return true;
  }
  function unlock(s, id) {
    assert(s.p3, '尚未进入群星纪'); const previous = s.p3.era;
    if (id === 'inf') return G.Inf.enter(s);
    number(id, 22, 24, true, '纪元');
    if (previous !== id - 1 || !s.p3.ep[previous].complete) return false;
    const c = s.deg.core;
    if (id === 22 && !c.relics.ns || id === 23 && !c.relics.quark || id === 24 && !c.bh) return false;
    s.p3.ep[id] = eraState(id); s.p3.era = id; c.phase = id - 20;
    G['Era' + id].init(s); G.Obs.unlock(s); s.journal.push({t: s.time, era: id, at: Date.now()}); emit(s, 'entered', {era: id}); return true;
  }
  function funds(s, id = s.p3.era) { return s.p3.ep[id]?.funds || N(0); }
  function research(s, id, i) {
    const a = s.p3.ep[id]; assert(a, '纪元未开启'); number(i, 0, 7, true);
    if (a.up[i] >= 8) return false;
    const row = G.Data.research[id][i], c = N(10).pow(+row[3] + +row[4] * a.up[i]), gamma = i >= 6 ? N(50).mul(N(3).pow(a.up[i])) : N(0);
    if (money(a.funds).lt(c) || money(s.top.gamma).lt(gamma)) return false;
    spend(s, '', c, id); spend(s, 'gamma', gamma); a.up[i]++; emit(s, 'research', {era: id, index: i, level: a.up[i]}); return true;
  }
  function perturb(s, id, list) { const a = s.p3.ep[id]; assert(a, '纪元未开启'); assert(Array.isArray(list) && list.length <= 3 && new Set(list).size === list.length, '最多叠加三个不同微扰'); list.forEach(i => { number(i, 0, 3, true); assert(a.clears[i] < 3, '微扰已完成'); }); a.active = list.slice();if(id===23)G.Era23.refresh(s); }
  function active(s,id){const normal=s.p3?.ep[id]?.active||[],tower=s.p3?.inf?.tower;return tower?.active?[...new Set([...normal,...(tower.combo||[]).filter(x=>x.era===+id).map(x=>x.pert-1)])]:normal;}
  const hasPert=(s,id,index)=>active(s,id).includes(index);
  function requirements(s, id = s.p3.era) { return G['Era' + id]?.requirements(s) || []; }
  function advance(s, id = s.p3.era) {
    const a = s.p3.ep[id]; if (!a || a.complete || a.E < 10 || requirements(s, id).some(r => !r.ok)) return false;
    const photons=10*(a.level+1)*(id-20)*(s.deg.core.tree.D>=5?1.5:1),W=G.Deg.window(s);
    const laserReady=s.deg.core.tree.D>=10&&s.p3.clock.laserStreak===3;
    add(s,'gamma',photons*W);
    // Arm after the third transition's own reward; the next positive photon income fires it once.
    if(s.deg.core.tree.D>=10){const k=s.p3.clock;k.laserStreak=laserReady?0:(W>1?Math.min(3,(k.laserStreak||0)+1):0);}
    a.level++; a.E = 0;
    if (a.level === G.Data.levels[id].length - 1) a.complete = true;
    G['Era' + id].onAdvance?.(s); G.Obs.unlock(s); emit(s, 'advance', {era: id, level: a.level}); return true;
  }
  function inject(s, id = s.p3.era) { const a = s.p3.ep[id]; assert(a && !a.complete, '无激发可注入'); const j = a.stats['inject:' + a.level] || 0; if (j >= 5 || a.E >= 10 || !spend(s, 'gamma', N(25).mul(N(1.6).pow(j)).mul(s.deg.core.tree.D>=2?.8:1))) return false; a.stats['inject:' + a.level] = j + 1; a.E = Math.min(10, a.E + 1); return true; }
  function excitation(s, id) {
    const a = s.p3.ep[id], sky = G.Obs.summary(s, id), c = s.deg.core;
    const merit = Math.min(4, (.6 + .4 * sky.quality) * (1 + 1.08 * sky.fraction));
    const speed = 1 + .015 * a.up.reduce((x,y) => x+y,0) + .025 * a.clears.reduce((x,y) => x+y,0);
    const couple = Math.sqrt(1 + .08 * logBig(s.p1.meta.epsilon)) * (1 + .04 * logBig(s.p2.legacy.round)) * G.Deg.resonance(s).mult * Math.pow(1 + c.Z, .25);
    return 10 * (G.Data.levels[id].length - 1) / (G.Data.hours[id] * 3600 * 1.6) * merit * speed * couple * .85 ** active(s,id).length * (c.phase===3&&c.tree.B>=11?1.15:1);
  }
  function logBig(x) { const t = String(x).replace(/^0+/, '') || '0'; return t === '0' ? 0 : Math.log10(Number(t.slice(0,15))) + Math.max(0,t.length-15); }
  function tick(s, dt) {
    number(dt, 0, 259200, false, '推进时间'); if (!s.p3) { const v = s.v; s.v = 5; try { old.tick(s, dt); } finally { s.v = v; } return s; }
    // A shared one-second lattice makes repeated online frames and offline replay identical.
    const clock = s.p3.clock; clock.carry += dt;
    let steps = Math.floor(clock.carry + 1e-9); clock.carry -= steps;
    while (steps-- > 0) step(s, 1);
    return s;
  }
  function collectShadowAchievements(s, shadow, got) {
    const before=shadow.ach,all=new Set(s.ach),missing=[];
    for(const key of before)if(!all.has(key)){all.add(key);missing.push(key);}
    // Only the temporary union is checked or changed; keep the original history and its references intact.
    shadow.ach=[...all];
    try {
      const earned=old.checkAch(shadow);
      if(!missing.length&&!earned.length)return;
      for(const list of [missing,earned])for(const key of list)if(!s.ach.includes(key)){s.ach.push(key);if(got)got.push(key);}
    } finally {shadow.ach=before;}
  }
  const achievementBridges=new WeakMap();
  function shadowAchievementBridge(s){let check=achievementBridges.get(s);if(!check){check=shadow=>collectShadowAchievements(s,shadow);achievementBridges.set(s,check);}return check;}
  function shadowNewState(){return old.load(old.save(old.newState()));}
  function step(s, dt, shadowNext) {
    const clock = s.p3.clock, beforeEps = s.p1.meta.epsilon, beforeRound = s.p2.legacy.round;
    const newState=H.newState,checkAch=H.checkAch;
    try { H.newState=shadowNewState; H.checkAch=shadowAchievementBridge(s); if (!G.Deg.paused(s)){if(G.Shadow)G.Shadow.p2(s,dt,shadowNext);else old.tick(s.p2,dt);}const p1dt=dt*(1+.05*(s.p3.ep[23]?.stats.backflow?.[10]||0));if(G.Shadow)G.Shadow.p1(s.p1,p1dt);else old.tick(s.p1,p1dt); }
    finally { H.newState=newState; H.checkAch=checkAch; }
    s.time += dt;
    if(s.p1.meta.epsilon!==beforeEps){const before=BigInt(beforeEps),after=BigInt(s.p1.meta.epsilon),beat=BigInt(clock.beatLength);
      if(after>before){clock.epsRate=Number(after-before)/dt;if(clock.lastBeat1!==undefined)clock.period1=s.time-clock.lastBeat1;clock.lastBeat1=s.time;}
      if(after/beat>before/beat)clock.p1Beat=s.time;
    }
    if (s.p2.legacy.round !== beforeRound) { clock.p2Beat = s.time; G.Deg.p2Beat(s, BigInt(s.p2.legacy.round) - BigInt(beforeRound)); }
    G.Deg.tick(s, dt); G.Obs.tick(s, dt); G.Hearts?.check(s);
    for (const [id, a] of Object.entries(s.p3.ep)) {
      a.age += dt; G['Era'+id].tick(s, dt);
      const r = !a.complete||a.active.length?excitation(s, +id):0; if (!a.complete) a.E = Math.min(10, a.E + r * dt);
      let changedPerturbation=false;
      for (const j of a.active.slice()) if (G.Obs.hasCompliant(s, +id, a.active)) { a.study[j] += r * dt; if (a.study[j] >= 8 * (a.clears[j] + 1)) { a.clears[j]++; a.study[j] = 0; a.active = a.active.filter(k => k !== j); changedPerturbation=true; emit(s, 'perturb', {era: +id, index: j}); } }
      if (+id===23&&changedPerturbation) G.Era23.refresh(s);
      if (a.up[7] && a.auto.advance) advance(s, +id);
    }
    if (s.p3.inf) G.Inf.tick(s, dt);
    clock.systemCarry=(clock.systemCarry||0)+dt;
    if (clock.systemCarry>=5) {clock.systemCarry%=5;G.Workshop?.run(s);G.Achievements?.check(s);checkAchievements(s);}
  }
  function nextEvent(s, shadowNext) {
    const p=s.p3;let t=Math.min(60,shadowNext);
    // Isolate the second that can change P2's beat, seeing or observation window.
    if(G.Shadow&&!G.Deg.paused(s)&&p.sky.queue.some(q=>q.length))t=Math.max(1,Math.min(t,shadowNext-1));
    if(p.automation?.enabled&&p.automation.rules.some(r=>r.enabled)||Object.values(p.ep).some(a=>a.auto.advance||a.auto.explore||a.auto.observe))t=1;
    t=Math.min(t,G.Deg.nextEvent(s));
    t=Math.min(t,G.Obs.nextEvent(s));
    for(const f of p.ep[22]?.furnace||[])t=Math.min(t,(f.t-f.tau)*60/1.25**p.ep[22].up[3]);
    const b=s.deg.core.bh;if(b?.starving){const k=5.8*(s.deg.core.tree.C>=4?1.5:1)*(p.inf?1.3**G.Inf.treeLevel(p.inf,1):1);t=Math.min(t,b.M**3/(3*k));if(!b.flash&&b.M>b.initial*Math.cbrt(.01))t=Math.min(t,(b.M**3-.01*b.initial**3)/(3*k));}
    return Math.max(1,Math.floor(t));
  }
  function offlinePolicy(s) { const silk = s.p3?.inf ? G.Inf.treeLevel(s.p3.inf, 4) : 0; return {cap: 86400 + Math.min(4, silk) * 43200, gain: 1 + .05 * Math.max(0, silk - 4)}; }
  function offline(s, seconds) {
    const policy=offlinePolicy(s),dt=Math.min(number(seconds,0,1e12),policy.cap),a={seconds:dt,gain:policy.gain,epsilon:s.p1?.meta.epsilon,round:s.p2?.legacy.round,mass:s.deg?.core.M,generations:s.deg?.core.gen},previousGain=offlineGains.get(s);
    offlineGains.set(s,policy.gain);
    try {if(!s.p3)tick(s,dt);else{const c=s.p3.clock;c.carry+=dt;let left=Math.floor(c.carry+1e-9);c.carry-=left;while(left>0){const shadowNext=G.Shadow?G.Shadow.next(s):60,t=Math.min(left,nextEvent(s,shadowNext));step(s,t,shadowNext);left-=t;}}}
    finally {if(previousGain===undefined)offlineGains.delete(s);else offlineGains.set(s,previousGain);}
    return {...a,epsilonAfter:s.p1?.meta.epsilon,roundAfter:s.p2?.legacy.round,massAfter:s.deg?.core.M,supernovae:s.deg?(BigInt(s.deg.core.gen)-BigInt(a.generations)).toString():'0'};
  }
  function pack(s) {
    const legacy={...s,v:5};for(const k of ['p1','p2','p3','deg','top','events','journal','created','saved'])delete legacy[k];
    const raw=safeJSON(old.save(legacy));for(const k of ['p1','p2','p3','deg','top','events','journal','created','saved'])raw[k]=s[k];
    if(s.p3){raw.p1=safeJSON(old.save(s.p1));raw.p2=safeJSON(old.save(s.p2));}
    raw.v = 7;
    return raw;
  }
  function save(s) { validate(s); const text=JSON.stringify(pack(s), (k,v) => typeof v === 'bigint' ? v.toString() : v); assert(bytes(text)<=8000000,'存档超过 8 MB'); return text; }
  function load(text) {
    const raw = safeJSON(text); if ([3,4,5].includes(raw.v)) return migrate(old.load(text)); assert(raw.v === 7, '不支持的存档版本');
    let s;
    if (raw.p3 === null) { const legacy = {...raw,v:5}; s = old.load(JSON.stringify(legacy)); for (const k of ['p1','p2','p3','deg','top','events','journal','created','saved']) s[k] = raw[k]; s.v = 7; }
    else { const legacy={...raw,v:5};for(const k of ['p1','p2','p3','deg','top','events','journal','created','saved'])delete legacy[k];s=old.load(JSON.stringify(legacy));for(const k of ['p1','p2','p3','deg','top','events','journal','created','saved'])s[k]=raw[k];s.v=7;s.p1 = old.load(JSON.stringify(raw.p1)); s.p2 = old.load(JSON.stringify(raw.p2)); }
    for (const k of Object.keys(s.top || {})) s.top[k] = money(s.top[k]);
    for (const a of Object.values(s.p3?.ep || {})) { a.funds = money(a.funds); a.earned = money(a.earned); }
    if (s.p3?.ep[24]) s.p3.ep[24].holonomy=money(s.p3.ep[24].holonomy);
    if (s.p3?.inf) G.Inf.revive(s);
    validate(s); return s;
  }
  function validate(s) {
    assert(s && s.v === 7, '群星纪存档版本无效'); number(s.time,0,1e15); assert(Array.isArray(s.journal) && bytes(JSON.stringify(s.journal)) <= 524288, '旅程纪录无效');
    assert(s.top && Object.keys(top()).every(k => s.top[k] !== undefined), '缺少共享货币'); Object.values(s.top).forEach(money);
    if (!s.p3) { assert(s.p1 === null && s.p2 === null && s.deg === null, '存档不能半分裂'); return true; }
    assert(s.p1?.era === 10 && s.p1.meta.started && !s.p1.eras['11'] && !s.p1.legacy.auto && !s.p1.workshop.enabled, 'P1 冻结不变量失效');
    assert(s.p2?.legacy.auto === true, 'P2 必须保持全自动');
    for (const [id,a] of Object.entries(s.p2.eras)) if (+id >= 12) assert(['harvest','buy','diagonal','next'].every(k => a.auto[k]), 'P2 自动化不变量失效');
    assert([21,22,23,24,'inf'].includes(s.p3.era), 'P3 纪元无效');
    const last = s.p3.era === 'inf' ? 24 : s.p3.era;
    assert(Object.keys(s.p3.ep).length===last-20,'纪元状态含未开启的纪元');
    for (let id = 21; id <= last; id++) { const a = s.p3.ep[id]; assert(a && a.id === id, '缺少纪元状态'); number(a.level,0,G.Data.levels[id].length-1,true); number(a.E,0,10); number(a.age,0,1e15); money(a.funds);money(a.earned);assert(a.complete === (a.level === G.Data.levels[id].length-1), '稳定记录与能级不符'); if (id < last) assert(a.complete, '禁止跳过纪元'); assert(a.up.length === 8 && a.clears.length === 4 && a.study.length === 4, '研究或微扰数据无效'); a.up.forEach(v => number(v,0,8,true)); a.clears.forEach(v => number(v,0,3,true)); a.study.forEach((v,i)=>number(v,0,8*(a.clears[i]+1)));assert(a.active.length <= 3 && new Set(a.active).size === a.active.length, '微扰集合无效'); a.active.forEach(v => {number(v,0,3,true);assert(a.clears[v]<3,'微扰已经完成');}); G['Era'+id].validate(s); }
    const c=s.p3.clock;number(c.carry,0,1);assert(c.carry<1,'时钟余数无效');decimal(c.year);number(c.season,0,23,true);number(c.pulse,0,10,true);number(c.seed,0,1);for(const k of ['p1Beat','p2Beat','p3Beat'])number(c[k],-1e9,s.time);for(const k of ['period1','period2'])if(c[k]!==undefined)number(c[k],Number.MIN_VALUE,1e15);number(c.beatLength,1,128,true);
    G.Obs.validate(s); G.Deg.validate(s);G.Workshop?.validate(s);G.Shadow?.validate(s);G.ForcingGame?.validate(s);G.Loopy?.validate(s);G.Links?.validate(s);G.Hearts?.validate(s);G.Legacy?.validate(s); if (s.p3.era === 'inf') { assert(s.p3.inf, '缺少无限循环状态'); G.Inf.validate(s); }else assert(!s.p3.inf,'无限循环尚未开启');
    return true;
  }
  function exportStr(s) { const j = save(s); return 'HT7:' + btoa(unescape(encodeURIComponent(j))); }
  function importStr(str) { assert(typeof str === 'string' && str.length <= 8000004, '存档过长'); str = str.trim(); assert(/^HT[3457]:/.test(str), '存档开头应为 HT3:、HT4:、HT5: 或 HT7:'); if (!str.startsWith('HT7:')) return migrate(old.importStr(str)); let text; try { text = decodeURIComponent(escape(atob(str.slice(4)))); } catch { throw Error('存档编码无效'); } return load(text); }
  function dispatch(s, action) { assert(action && typeof action.type === 'string', '操作无效'); const fn = G.handlers[action.type]; assert(fn, '未知操作：' + action.type); const result=fn(s, action);if(s.p3){G.Hearts?.dirty(s);G.Hearts?.check(s);}return result; }
  function view(s) { if (!s.p3) return {version:G.version, entered:false, gate21:gate21(s), era:s.era}; return {version:G.version,entered:true,era:s.p3.era,time:s.time,top:Object.fromEntries(Object.entries(s.top).map(([k,v])=>[k,money(v).toString()])),epochs:Object.values(s.p3.ep).map(a=>({id:a.id,level:a.level,E:a.E,complete:a.complete,funds:money(a.funds).toString(),up:a.up.slice(),requirements:requirements(s,a.id)})),sky:G.Obs.summary(s),deg:G.Deg.summary(s),inf:s.p3.inf?G.Inf.summary(s):null,events:clone(s.events||[])}; }
  function checkAchievements(s){if(!s.p3)return old.checkAch(s);const got=[];for(const p of [s.p1,s.p2])collectShadowAchievements(s,p,got);return got;}
  function install() { if (G.installed) return; G.installed = true; H.newState = () => migrate(old.newState()); H.save = s => s.v === 7 ? save(s) : old.save(s); H.load = text => { const raw = safeJSON(text); return raw.v === 7 ? load(text) : migrate(old.load(text)); }; H.exportStr = s => s.v === 7 ? exportStr(s) : old.exportStr(s); H.importStr = importStr; H.tick = (s,dt) => s.v === 7 ? tick(s,dt) : old.tick(s,dt);H.automate=s=>s.p3?undefined:old.automate(s);H.autoPrestige=s=>s.p3?undefined:old.autoPrestige(s);H.checkAch=s=>s.v===7?checkAchievements(s):old.checkAch(s);H.simulate=(s,seconds,cb)=>s.p3?offline(s,seconds):old.simulate(s,seconds,cb); }
  Object.assign(G, {N,old,assert,number,decimal,money,sumMoney,clone,clamp,drain,hash,hash64,stable,bytes,safeJSON,income,add,spend,emit,eraState,logBig,migrate,newState:()=>migrate(old.newState()),gate21,enter21,unlock,funds,research,perturb,requirements,advance,inject,excitation,tick,offlinePolicy,offline,save,load,validate,exportStr,importStr,dispatch,view,install});
  Object.assign(G,{active,hasPert});
  Object.assign(G.handlers, {'core.enter21':s=>enter21(s),'core.unlock':(s,a)=>unlock(s,a.era),'core.advance':(s,a)=>advance(s,a.era),'core.research':(s,a)=>research(s,a.era,a.index),'core.perturb':(s,a)=>perturb(s,a.era,a.indices),'core.inject':(s,a)=>inject(s,a.era)});
})(typeof self !== 'undefined' ? self : this);
