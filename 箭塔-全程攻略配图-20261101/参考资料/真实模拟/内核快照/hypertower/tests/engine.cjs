const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const assert=require('node:assert/strict');
function engine(file='hypertower.html'){
  const html=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
  const c={console,Date,Math,btoa,atob,setTimeout,clearTimeout,performance};c.window=c;c.self=c;
  vm.createContext(c);
  const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  const count=file==='source-v3.html'?1:file==='hypertower.html'?scripts.length-1:3;
  if(file==='source-v3.html'){
    const vendor=fs.readFileSync(path.join(__dirname,'../vendor/omega-num.js'),'utf8');
    vm.runInContext(vendor,c);vm.runInContext(scripts.find(s=>s.includes('core engine')),c);
  }else for(const script of scripts.slice(0,count))vm.runInContext(script,c);
  return c.HT;
}
function omegaSave(H){
  const s=H.newState();s.era=5;s.won=true;s.wonT=7200;s.time=7200;s.star=H.OMEGA;s.best=H.OMEGA;
  s.foldN=30;s.ascN=10;s.towN=12;s.trN=15;s.lat=H.resizeLattice(s.lat,5);s.lat.d.fill(12);
  s.own=Array(12).fill(0);for(let i=1;i<12;i++)s.own[i]=i<4?4:1;
  s.stars=H.STARS.map(st=>st.id);s.up.phi=8;s.up.autoE=1;s.up.autoO=1;s.spire=21;s.para.fill(3);
  s.crease=H.N('1e100');s.power=H.N('1e100');s.brick=H.N('1e100');s.arrowE=H.N('1e10');
  s.ui.intro=true;s.ui.seen=5;s.ui.wonSeen=true;H.arrange(s,0);return s;
}
function runTests(){
  const H=engine(),M=H.Meta;let n=0;
  const test=(name,f)=>{f();console.log('PASS '+name);n++;};
  test('fresh start and original first engine',()=>{const s=H.newState();assert.equal(s.era,1);assert(H.buyEngine(s,0,false));H.tick(s,1);assert(s.star.gt(0));assert(!M.enabled(s));assert.equal(H.checkAch(s)[0],0);});
  test('phi=4 is attainable and achievement awarded',()=>{const s=H.newState();s.crease=H.N(1e10);while(H.canBuyUp(s,'phi'))H.buyUp(s,'phi');assert.equal(s.up.phi,12);assert.equal(H.phi(s),4);H.checkAch(s);assert(s.ach.includes(10));});
  test('real v3 export migrates without losing progress',()=>{const old=engine('source-v3.html'),s=omegaSave(old),str=old.exportStr(s),ns=H.importStr(str);assert.equal(ns.v,5);assert.equal(ns.era,5);assert.equal(ns.trN,s.trN);assert(ns.star.eq(H.OMEGA));assert.equal(ns.meta.started,false);assert.equal(ns.stars.length,s.stars.length);assert.equal(ns.lat.n,5);});
  test('legacy arrow gains and prestige helpers still work before collapse',()=>{const s=omegaSave(H);assert.equal(H.topArrow(s),10);assert(H.pendingArrow(s).gt(0));assert(H.pendingPower(s).gt(0));assert(H.pendingBrick(s).gt(0));assert(H.pendingCrease(s).gt(0));H.readyTo(s,'arrowE',1);assert(H.transcend(s));assert.equal(s.era,5);assert(!M.enabled(s));});
  test('new saves round trip including symbolic lambda',()=>{const s=omegaSave(H);M.prestige(s,0);s.meta.auto.advance=true;s.meta.lambdaFloor={rank:'1000000000000000000000000000000000000',height:73.25};const a=H.exportStr(s),ns=H.importStr(a);assert.equal(H.save(ns),H.save(s));assert(a.startsWith('HT5:'));assert(M.lambda(ns).rank>10n);});
  test('magnitude ordering and epsilon indices exceed Number range',()=>{const a=new M.Magnitude(10n,99),b=new M.Magnitude(11n,1),c=new M.Magnitude(10n**100n,25);assert(b.gt(a));assert(c.gt(b));assert(c.eq(new M.Magnitude(c.rank,25)));assert(!H.format(c,'scientific').includes('Infinity'));assert(!H.format(c,'math').includes('NaN'));});
  test('all eight notations cover normal, tower and nested values',()=>{const xs=[H.N(0),H.N(1234),H.N('1e308'),H.O.tetrate(10,100),H.N(10).arrow(10)(10),new M.Magnitude(2n,45),new M.Magnitude(15n,23)];for(const[id]of M.NOTATIONS)for(const x of xs){const s=H.format(x,id);assert(s.length>0);assert(!/NaN|Infinity|undefined/.test(s),id+' '+s);}assert(H.format(H.O.tetrate(10,100),'scientific').startsWith('F'));assert(H.format(H.N(10).arrow(3)(10),'scientific').startsWith('G'));assert.equal(H.format(H.N(1e8),'chinese'),'1亿');assert.equal(H.format(H.N(1234567),'engineering'),'1.23e6');});
  test('first collapse preserves all legacy upgrades and currencies',()=>{const s=omegaSave(H),p=s.power.toString();assert(M.prestige(s,0));assert.equal(s.era,6);assert.equal(s.meta.currency[0],1);assert.equal(s.own[12],1);assert.equal(s.power.toString(),p);assert.equal(s.up.phi,8);assert.equal(s.stars.length,H.STARS.length);assert.equal(M.pending(s,1),0);});
  test('a completed v3 player can obtain phi achievement upon collapse',()=>{const s=omegaSave(H);assert.equal(H.phi(s),3);M.prestige(s,0);assert.equal(H.phi(s),4);H.checkAch(s);assert(s.ach.includes(10));});
  test('locked stages and unaffordable upgrades cannot be bought',()=>{const s=omegaSave(H);M.prestige(s,0);assert(!M.buy(s,1,'drive'));assert(!M.prestige(s,4));assert(!M.buy(s,0,'operator'));assert(M.buy(s,0,'drive'));assert(!M.buy(s,0,'drive'));});
  test('swallow excludes lambda row and has bounded feedback',()=>{const s=omegaSave(H);M.prestige(s,0);const row=Math.floor(s.lat.lam/s.lat.n);for(let i=0;i<500;i++)M.swallow(s);assert.notEqual(s.meta.lastRow,row);assert(s.meta.echo<=60);assert(M.efficiency(s).echo<=1.4);assert(M.interval(s)>=6);assert.equal(s.meta.rank,0);assert.equal(s.meta.progress,0);});
  test('special operator stock and grid placement survive each reset',()=>{const s=omegaSave(H);M.prestige(s,0);for(let i=1;i<5;i++){s.meta.rank=i*3;s.meta.runSec=120;s.meta.stageSec.fill(120);assert(M.prestige(s,i));assert.equal(s.era,6+i);assert.equal(s.lat.n,i===1?6:7);assert.equal(s.own[12+i],1);assert.equal(s.meta.rank,0);assert.equal(s.meta.currency[i],1);}for(let id=1;id<17;id++)assert(H.placedCount(s.lat,id)<=s.own[id]);assert(M.lattice(s) instanceof M.Magnitude);});
  test('coarse offline and one-second online simulations agree',()=>{const s=omegaSave(H);M.prestige(s,0);s.meta.currency[0]=300;M.buy(s,0,'auto');s.meta.auto={shop:true,advance:true,prestige:true};const a=H.load(H.save(s)),b=H.load(H.save(s));for(let t=0;t<7200;t++)H.tick(a,1);for(let t=0;t<7200;t+=90)H.tick(b,90);assert.equal(H.save(a),H.save(b));});
  test('a large offline step cannot bypass an unstabilized rung',()=>{const s=omegaSave(H);M.prestige(s,0);H.tick(s,86400);assert.equal(s.meta.rank,0);assert.equal(s.meta.progress,100);assert(M.canAdvance(s));});
  test('challenge rules and goals remain achievable',()=>{const s=omegaSave(H);M.prestige(s,0);assert(!M.enterTrial(s,3));assert(M.enterTrial(s,0));H.tick(s,60);assert(M.rate(s)>0);s.meta.progress=100;M.advance(s);s.meta.progress=100;M.advance(s);assert.equal(s.meta.clears[0],1);assert.equal(s.meta.challenge,-1);s.meta.clears[0]=2;assert(!M.enterTrial(s,0));s.era=7;assert(M.enterTrial(s,1));const e=s.meta.echo;H.tick(s,120);assert.equal(s.meta.echo,e);assert.equal(s.meta.swallows,2);});
  test('epsilon progression persists beyond the safe integer boundary',()=>{const s=omegaSave(H);M.prestige(s,0);s.era=10;s.meta.rank=15;s.meta.bestRank=15;s.meta.epsilon='90071992547409931234567890';s.meta.bestEpsilon=s.meta.epsilon;s.meta.progress=100;M.advance(s);assert.equal(s.meta.epsilon,'90071992547409931234567891');assert.equal(H.importStr(H.exportStr(s)).meta.epsilon,s.meta.epsilon);assert(M.rate(s)>0);});
  test('malformed and impossible saves fail before replacing state',()=>{assert.throws(()=>H.importStr('garbage'));const s=omegaSave(H);const raw=JSON.parse(H.save(s));raw.lat.n=900;assert.throws(()=>H.load(JSON.stringify(raw)));raw.lat.n=5;raw.meta={...M.newMeta(),progress:-1};assert.throws(()=>H.load(JSON.stringify(raw)));assert.throws(()=>H.load('{"v":4,"__proto__":{"polluted":true}}'));assert.equal({}.polluted,undefined);});
  test('save schema supports a 9x9 legacy lattice and variable operator stock',()=>{const s=omegaSave(H);s.lat=H.resizeLattice(s.lat,9);while(s.own.length<19)s.own.push(0);const raw=H.save(s),t=H.load(raw);assert.equal(t.lat.n,9);assert.equal(t.own.length,19);assert(t.star.eq(s.star));assert.throws(()=>H.load(JSON.stringify({...JSON.parse(raw),v:4,era:11})));});
  console.log(n+' engine tests passed');
  fs.writeFileSync(path.join(__dirname,'engine-results.json'),JSON.stringify({passed:true,tests:n,version:5},null,2));
}
module.exports={engine,omegaSave};
if(require.main===module)runTests();
