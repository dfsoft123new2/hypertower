const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base='D:/hypertower-recovery-20261026',dir=path.join(base,'walkthrough-work-20261101');const {H,G}=require(path.join(base,'hypertower/tests/gr-helper.cjs')).engine(),K=H.LateMath;
const {readyFromLegacy}=require(path.join(base,'hypertower/tests/gr-helper.cjs'));const out=[];
for(let id=16;id<24;id++){
 // Author a shared wiring design explicitly; no game solver or aided flag edit.
 const group=id%8,board=Array(64).fill('.');board[17]=String(3);board[10]=group%2?'E':'w';board[18]='p';if(group>=3)board[27]='p';if(group>=6)board[63]='f';
 const design={board,feedback:2},report=H.Late.evaluate(12,design,id,-1);assert(report.valid);
 const shared=H.Blueprint.validate({id:'guide-xii-'+(id+1),name:'攻略外部共享布线'+(id+1),era:12,kind:'era-12',source:'manual',payload:{puzzle:id,trial:-1,design}});
 const code=H.Blueprint.export(shared),imported=H.Blueprint.import(code),s=readyFromLegacy(H,G);s.era=12;s.ord={era:12,index:0,gear:1,coord:1,h:H.N(10)};
 const b=H.Blueprint.add(s,imported),a=H.Late.state(s);a.puzzle=b.payload.puzzle;a.design=K.clone(b.payload.design);a.aided=b.source==='solver';const result=H.Late.submit(s,'导入共享设计后正常提交');assert.equal(result.stars,3);
 out.push({era:12,number:id+1,source:'guide-authored shared design, not in-game automatic reference',design,report,code,uiImportThenSubmitStars:result.stars});
}
fs.writeFileSync(path.join(dir,'xii-shared-blueprints.json'),JSON.stringify({note:'外部共享设计通过正式HTB5导入、载入沙盒、正常提交。source=manual表示此攻略作者显式写出的设计，未改玩家aided字段；玩家导入共享答案不等于独立手解。',entries:out},null,2));
fs.writeFileSync(path.join(dir,'XII-17至24题-攻略共享蓝图.txt'),out.map(x=>'XII 第'+x.number+'题\n'+x.code).join('\n\n'));
console.log(JSON.stringify({entries:out.length,allValidated:true,uiImportThenSubmitStars:3,files:['xii-shared-blueprints.json','XII-17至24题-攻略共享蓝图.txt']}));
