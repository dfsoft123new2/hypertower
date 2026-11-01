'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const dir='D:/hypertower-recovery-20261026/walkthrough-work-20261101',base='D:/hypertower-recovery-20261026/hypertower';const {G}=require(base+'/tests/gr-helper.cjs').engine(),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const baselineSha256=sha(fs.readFileSync(dir+'/simulation-p3-baseline.json')),rows=[];
for(const [name,days,save]of[['day1',1,'simulation-p3-day1-save.json'],['week',7,'simulation-p3-latest-save.json'],['month',30,'simulation-p3-month-latest-save.json']]){
 const report=JSON.parse(fs.readFileSync(dir+'/simulation-p3-'+name+'.json','utf8')),raw=fs.readFileSync(dir+'/'+save,'utf8'),s=G.load(raw),r=report.samples.at(-1),inf=s.p3.inf;
 assert.equal(report.complete,true);assert.equal(report.baselineSha256,baselineSha256);G.validate(s);
 assert.equal(r.simulatedSeconds,days*86400);assert.equal(s.time,report.baseline.gameTime+r.simulatedSeconds);assert.equal(s.p3.shadow.mode,'exact');
 const actual={gameTime:s.time,circle:inf.n,phase:inf.phase,m:inf.ring.m,dust:G.money(s.top.dust).toString(),gamma:G.money(s.top.gamma).toString(),epsilon:s.p1.meta.epsilon,p2Round:s.p2.legacy.round,stars:inf.ring.stars.length,lit:inf.ring.stars.filter(x=>x.star).length,zhoutian:inf.ring.zhoutian,bh:s.deg.core.bh?.M||0,autoError:inf.autoError||null};
 for(const[key,value]of Object.entries(actual))assert.equal(r[key],value,key);
 rows.push({name,days,save,saveSha256:sha(raw),reloadValidated:true,exact:true,last:r});
}
const native=JSON.parse(fs.readFileSync(dir+'/simulation-p3-month.json','utf8')),resume=JSON.parse(fs.readFileSync(dir+'/resume-p3-test-691200-report.json','utf8')),strip=x=>Object.fromEntries(Object.entries(x).filter(([k])=>k!=='wallSeconds'));
assert.deepEqual(strip(native.samples.find(x=>x.simulatedSeconds===691200)),strip(resume.samples.at(-1)));
const pointer=JSON.parse(fs.readFileSync(dir+'/resume-p3-test-checkpoint.json','utf8')),raw=fs.readFileSync(dir+'/'+pointer.save,'utf8'),s=G.load(raw);assert.equal(sha(raw),pointer.saveSha256);G.validate(s);assert.equal(s.time,resume.baseline.gameTime+pointer.simulatedSeconds);
const result={baselineSha256,rows,resume8DayReportFieldsEqualExcludingWallTime:true,resumePointerHashAndTimeValidated:true,fullNative8DayStateComparison:false,pendingDays:[365,3650,36500],method:'native G.offline dt<=3600; exact P2; no trajectory modifications'};
fs.writeFileSync(dir+'/simulation-p3-validation.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
