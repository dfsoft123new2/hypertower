"use strict";
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const here=__dirname,args=process.argv.slice(2),task=args.shift();
function copyTree(from,to){fs.mkdirSync(to,{recursive:true});for(const item of fs.readdirSync(from,{withFileTypes:true})){const a=path.join(from,item.name),b=path.join(to,item.name);if(item.isDirectory())copyTree(a,b);else if(item.isFile())fs.copyFileSync(a,b);else throw new Error('Unsupported snapshot entry');}}
const tasks={p1:'simulate-p1-longterm.cjs',p2:'simulate-walkthrough-p2-horizons-20261101.cjs','p2-day':'simulate-walkthrough-p2-native-day-20261101.cjs','p2-low':'simulate-walkthrough-p2-low-20261101.cjs','p3-resume':'resume-p3-exact.cjs'};
if(!tasks[task]){console.log('使用：node 复跑.cjs p1 | p2 | p2-day | p2-low | p3-resume [--days N]');process.exit(task?2:0);}
if(task==='p3-resume'){
  const caller=process.cwd();
  for(let i=0;i<args.length;i++)if(['--checkpoint','--save','--report'].includes(args[i])){
    if(args[i+1]===undefined)throw new Error('缺少输入路径：'+args[i]);
    args[i+1]=path.resolve(caller,args[i+1]);i++;
  }
}
const source=path.join(here,'原始脚本',tasks[task]);if(!fs.existsSync(source))throw new Error('缺少任务脚本：'+tasks[task]);
const stamp=new Date().toISOString().replace(/[:.]/g,'-'),root=path.join(here,'复跑输出',stamp+'-'+task),work=path.join(root,'walkthrough-work-20261101');
fs.mkdirSync(work,{recursive:true});copyTree(path.join(here,'内核快照','hypertower'),path.join(root,'hypertower'));
for(const stage of ['P1','P2'])copyTree(path.join(here,stage),path.join(work,'simulation-'+stage.toLowerCase()));
for(const f of fs.readdirSync(path.join(here,'P3')))fs.copyFileSync(path.join(here,'P3',f),path.join(work,f));
const targetRoot=root.split(path.sep).join('/');
for(const f of fs.readdirSync(path.join(here,'原始脚本'))){let text=fs.readFileSync(path.join(here,'原始脚本',f),'utf8');text=text.replaceAll('D:/hypertower-recovery-20261026',targetRoot);fs.writeFileSync(path.join(root,f),text);fs.writeFileSync(path.join(work,f),text);}
console.log('隔离复跑目录：'+root);console.log('原始资料不变；结果仅保存在以上目录。');
const run=cp.spawnSync(process.execPath,[path.join(root,tasks[task]),...args],{cwd:root,stdio:'inherit'});if(run.error)throw run.error;process.exitCode=run.status??1;
