"use client";

import { useState, useEffect, useRef } from "react";

// ---- OWLS Design Tokens ----
const BG       = "#FBF7F0";
const CARD     = "#FFFFFF";
const BORDER   = "#E8D8B8";
const MAROON   = "#8B1A2A";
const GOLD     = "#C9A227";
const GOLD_L   = "#FAF0D7";
const MAROON_L = "#F9EBEC";
const GREEN    = "#1A7A50";
const RED      = "#CC2244";
const TEXT     = "#1A0A0E";
const MUTED    = "#6B4F55";
const MUTED2   = "#9A8090";
const OK_BG    = "#E6F7EF"; const OK_BRD = "#7ECBA8";
const WN_BG    = "#FFF8E8"; const WN_BRD = "#D4A020";
const NG_BG    = "#FDE8EE"; const NG_BRD = "#F0A0B4";

const PRACTICE_MET=9.0, PRACTICE_HOURS=2.5;
const STRENGTH_MET=6.0, STRENGTH_HOURS=1.5;
// 日常活動追加消費：通学~120kcal＋体育(週2-3回平均)~60kcal＋勉強(脳活動)~60kcal＋移動~60kcal≈300kcal
const DAILY_ACTIVITY_KCAL=300;
const COACH_PIN="1234";
const DEFAULT_APP_PIN=process.env.NEXT_PUBLIC_APP_PIN||"1987";
const DEFAULT_ADMIN_PW=process.env.NEXT_PUBLIC_ADMIN_PASSWORD||"1948owls";

// ---- Food Data ----
interface FoodItem { name:string; kcal:number; type:"コンビニ"|"外食"|"自炊"; note?:string; detail?:string; }

const MAIN_FOODS:FoodItem[]=[
  {name:"おにぎり3個 + サラダチキン2個 + ゆで卵2個",kcal:750,type:"コンビニ",
   detail:"セブン・ファミマ・ローソン：おにぎり×3(約330円)+サラダチキン×2(約430円)+ゆで卵×2(約190円)≒950円"},
  {name:"唐揚げ弁当(大盛り) + 豚汁 + バナナ",kcal:850,type:"コンビニ",
   detail:"ファミマ「大盛り弁当」(約500円)+豚汁(220円)+バナナ(90円)≒810円"},
  {name:"幕の内弁当 + おにぎり2個 + 牛乳500ml",kcal:900,type:"コンビニ",
   detail:"幕の内弁当(550〜650円)+おにぎり×2(240円)+牛乳(140円)≒1,030円"},
  {name:"ツナマヨおにぎり4個 + サンドイッチ + ヨーグルト",kcal:820,type:"コンビニ",
   detail:"おにぎり×4(440円)+ミックスサンド(350円)+ヨーグルト(120円)≒910円"},
  {name:"牛丼 特盛 + 半熟卵 + 味噌汁",kcal:890,type:"外食",
   note:"松屋・吉野家・すき家",detail:"松屋「牛めし特盛」560円+半熟卵80円+味噌汁無料≒640円"},
  {name:"カツカレー 大盛り",kcal:960,type:"外食",
   detail:"カレーチェーン・学食：約650〜850円。食べごたえ抜群の高カロリー"},
  {name:"ラーメン + 半チャーハン",kcal:900,type:"外食",
   detail:"ラーメン店の定番セット約900〜1,200円。二郎系は1杯で1,000kcal超も"},
  {name:"から揚げ定食 + ご飯大盛り + 汁物",kcal:780,type:"外食",
   detail:"松のや「ロースかつ定食」大盛り680円等。定食チェーンで700〜900円"},
  {name:"白米3杯 + 鶏むね肉200g + 野菜炒め",kcal:820,type:"自炊",
   detail:"鶏むね肉100g約60〜80円。食材費200〜300円でコスパ最高"},
  {name:"パスタ大盛り(ミートソース) + チキンソテー",kcal:790,type:"自炊",
   detail:"パスタ乾麺200g約60円+合いびき肉100g約100円。手軽に高カロリー"},
  {name:"ご飯大盛り + 納豆2パック + 卵3個 + 野菜",kcal:760,type:"自炊",
   detail:"納豆3パック100円+卵×3(70円)。高タンパク低コストの最強朝食"},
];

const PRE_PRACTICE_FOODS:FoodItem[]=[
  {name:"マルトデキストリン + プロテイン（水割り）",kcal:330,type:"自炊",
   note:"練習1〜2時間前【最推薦】",detail:"マルトデキストリン30g(約70円)+ホエイプロテイン1杯(約80円)+水400ml。消化が早く脂質ゼロ。練習前の王道エネルギー＆タンパク補給。Amazon等で1kgあたり500〜800円。"},
  {name:"バナナ2本 + ゆで卵2個",kcal:280,type:"コンビニ",
   note:"練習2〜3時間前",detail:"バナナ×2(約120円)+ゆで卵×2(約190円)≒310円。消化が良く素早いエネルギー補給"},
  {name:"おにぎり2個（梅・鮭等）",kcal:360,type:"コンビニ",
   note:"練習1〜2時間前",detail:"セブン「塩むすび」や「鮭」等 ×2(約220円)。脂質少なめで練習前に最適"},
  {name:"カロリーメイト4本 + スポドリ500ml",kcal:380,type:"コンビニ",
   note:"練習30分〜1時間前",detail:"カロリーメイト4本(278円)+スポドリ(160円)≒438円"},
  {name:"ウイダーinゼリー(エネルギー) + バナナ1本",kcal:260,type:"コンビニ",
   note:"練習直前30分以内",detail:"ウイダーinゼリー(200円)+バナナ(60円)≒260円。即座にエネルギー補給"},
  {name:"羊羹1本 + 水",kcal:170,type:"コンビニ",
   note:"練習直前の緊急補給",detail:"井村屋スポーツようかん(130円)。小さくて携帯しやすく即効性あり"},
  {name:"食パン2枚 + ピーナッツバター + 牛乳200ml",kcal:480,type:"自炊",
   note:"練習2〜3時間前の朝食",detail:"食パン2枚(約50円)+PB(約30円)+牛乳(約40円)≒120円。高カロリー朝食"},
];

const POST_PRACTICE_FOODS:FoodItem[]=[
  {name:"マルトデキストリン + プロテイン（水割り）",kcal:380,type:"自炊",
   note:"練習後30分以内【最推薦】",detail:"マルトデキストリン40g(約90円)+ホエイプロテイン1杯(約80円)+水400ml。ゴールデンタイムの最強リカバリー。糖質でインスリンを上げながらタンパク質を筋肉へ届ける。"},
  {name:"プロテイン(牛乳300ml割り) + バナナ1本",kcal:380,type:"自炊",
   note:"練習後30分以内",detail:"ホエイプロテイン1杯(約80円)+牛乳300ml(約60円)+バナナ(60円)≒200円。筋合成に最適"},
  {name:"サラダチキン2個 + おにぎり2個",kcal:580,type:"コンビニ",
   note:"練習後30分以内",detail:"サラダチキン×2(430円)+おにぎり×2(220円)≒650円。タンパク質と糖質のベストコンビ"},
  {name:"ゆで卵3個 + おにぎり2個 + スポドリ",kcal:520,type:"コンビニ",
   note:"練習後30〜60分",detail:"ゆで卵×3(285円)+おにぎり×2(220円)+スポドリ(160円)≒665円"},
  {name:"牛乳500ml + バナナ2本 + プロテインバー",kcal:550,type:"コンビニ",
   note:"練習後30〜60分",detail:"牛乳(140円)+バナナ×2(120円)+プロテインバー(200円)≒460円"},
  {name:"ヨーグルト(大) + グラノーラ + プロテイン",kcal:500,type:"自炊",
   note:"練習後1時間以内",detail:"ヨーグルト大(150円)+グラノーラ(約50円)+プロテイン(約80円)≒280円"},
  {name:"セブン「サラダチキン」+「金のビーフシチュー」+おにぎり",kcal:620,type:"コンビニ",
   note:"練習後の本格リカバリー",detail:"サラダチキン(215円)+金のビーフシチュー(321円)+おにぎり(120円)≒656円"},
];

// ---- Demo Data ----
const DEMO_THURSDAYS=["2026-04-02","2026-04-09","2026-04-16","2026-04-23","2026-04-30","2026-05-07","2026-05-14","2026-05-21"];
const DEMO_NOISE=[[-0.1,0.2,-0.1,0.3,0.0,0.2,-0.1,0.3],[0.1,-0.1,0.3,0.1,0.2,-0.2,0.4,0.1],[0.0,0.3,0.1,-0.2,0.3,0.1,0.2,-0.1],[-0.2,0.1,0.3,0.0,-0.1,0.4,0.1,0.2],[0.2,-0.2,0.2,0.3,-0.1,0.1,0.3,0.0]];
function makeDemoM(sw:number,wg:number,weeks:number,ni:number):Measurement[]{
  const n=DEMO_NOISE[ni%5];
  return DEMO_THURSDAYS.slice(0,weeks).map((date,i)=>({date,weight:Math.round((sw+wg*i+n[i])*10)/10}));
}
const DEMO_RAW=[
  {name:"田中 剛",   pos:["QB"],  h:178,bd:"2008-05-15",sw:71.5,wg:0.45,tS:77,tA:80,w:8},
  {name:"鈴木 大輔", pos:["RB"],  h:172,bd:"2008-09-20",sw:67.2,wg:0.35,tS:72,tA:75,w:8},
  {name:"佐藤 健",  pos:["RB"],  h:170,bd:"2009-01-10",sw:64.0,wg:0.40,tS:69,tA:72,w:8},
  {name:"山田 翔",  pos:["WR"],  h:175,bd:"2008-03-28",sw:61.0,wg:0.30,tS:65,tA:68,w:8},
  {name:"中村 悠",  pos:["WR"],  h:173,bd:"2009-06-15",sw:59.5,wg:0.28,tS:63,tA:66,w:7},
  {name:"小林 直人", pos:["WR"],  h:174,bd:"2008-11-22",sw:62.0,wg:0.32,tS:66,tA:69,w:8},
  {name:"加藤 雄大", pos:["WR"],  h:170,bd:"2009-02-18",sw:60.2,wg:0.27,tS:64,tA:67,w:6},
  {name:"吉田 豪",  pos:["TE"],  h:180,bd:"2008-07-07",sw:77.5,wg:0.55,tS:83,tA:86,w:8},
  {name:"渡辺 聖",  pos:["OL"],  h:178,bd:"2008-04-14",sw:86.0,wg:0.70,tS:93,tA:97,w:8},
  {name:"伊藤 大樹", pos:["OL"],  h:176,bd:"2008-08-30",sw:84.2,wg:0.65,tS:91,tA:95,w:8},
  {name:"松本 浩二", pos:["OL"],  h:179,bd:"2009-03-05",sw:81.0,wg:0.75,tS:88,tA:92,w:8},
  {name:"井上 力",  pos:["OL"],  h:177,bd:"2008-12-19",sw:89.5,wg:0.60,tS:96,tA:100,w:8},
  {name:"木村 颯",  pos:["OL"],  h:182,bd:"2008-06-28",sw:92.0,wg:0.80,tS:100,tA:104,w:8},
  {name:"林 大輝",  pos:["OL"],  h:175,bd:"2009-01-08",sw:83.0,wg:0.68,tS:90,tA:94,w:7},
  {name:"斎藤 龍",  pos:["DE"],  h:180,bd:"2008-10-11",sw:77.0,wg:0.55,tS:83,tA:86,w:8},
  {name:"清水 猛",  pos:["DE"],  h:178,bd:"2008-02-25",sw:75.5,wg:0.18,tS:81,tA:84,w:8},
  {name:"山口 蒼",  pos:["DE"],  h:179,bd:"2009-04-22",sw:73.2,wg:0.52,tS:79,tA:82,w:6},
  {name:"中島 勝",  pos:["DT"],  h:177,bd:"2008-09-01",sw:91.0,wg:0.78,tS:98,tA:102,w:8},
  {name:"小川 拓",  pos:["DT"],  h:176,bd:"2009-07-14",sw:87.2,wg:0.72,tS:94,tA:98,w:7},
  {name:"岡田 真司", pos:["LB"],  h:176,bd:"2008-05-29",sw:73.5,wg:0.48,tS:79,tA:82,w:8},
  {name:"橋本 進",  pos:["LB"],  h:174,bd:"2008-11-03",sw:71.0,wg:0.45,tS:77,tA:80,w:8},
  {name:"石田 慶",  pos:["LB"],  h:175,bd:"2009-02-11",sw:70.2,wg:0.15,tS:76,tA:79,w:5},
  {name:"前田 壮",  pos:["LB"],  h:177,bd:"2008-08-17",sw:74.0,wg:0.50,tS:80,tA:83,w:8},
  {name:"藤田 輝",  pos:["CB"],  h:171,bd:"2008-12-08",sw:62.5,wg:0.32,tS:67,tA:70,w:8},
  {name:"後藤 蓮",  pos:["CB"],  h:170,bd:"2009-03-25",sw:61.0,wg:0.28,tS:66,tA:69,w:5},
  {name:"上田 勇",  pos:["CB"],  h:172,bd:"2008-07-31",sw:63.0,wg:0.33,tS:68,tA:71,w:8},
  {name:"近藤 悠斗", pos:["S"],   h:175,bd:"2008-04-18",sw:67.0,wg:0.40,tS:72,tA:75,w:8},
  {name:"丸山 光",  pos:["S"],   h:174,bd:"2009-01-29",sw:66.0,wg:0.20,tS:71,tA:74,w:4},
  {name:"服部 英",  pos:["K/P"], h:173,bd:"2008-10-05",sw:65.2,wg:0.30,tS:69,tA:71,w:8},
  {name:"竹内 将",  pos:["QB"],  h:176,bd:"2009-06-12",sw:69.5,wg:0.42,tS:75,tA:78,w:3},
];
function buildDemoPlayers():Player[]{
  return DEMO_RAW.map((d,i)=>({
    id:`demo_${i}`,name:d.name,height:d.h,birthDate:d.bd,position:d.pos,
    targetWeightSep:d.tS,targetWeightApr:d.tA,
    measurements:makeDemoM(d.sw,d.wg,d.w,i),foodLogs:[],
  }));
}

// ---- Types ----
interface Measurement{date:string;weight:number;}
interface FoodEntry{id:string;meal:string;name:string;kcal:number;}
interface FoodLog{date:string;entries:FoodEntry[];}
interface Player{
  id:string;name:string;height:number;birthDate:string;position:string[];
  targetWeightSep:number;targetWeightApr:number;measurements:Measurement[];
  foodLogs?:FoodLog[];
}
type TrafficLight="green"|"yellow"|"red";
type SortKey="status"|"position"|"gain_rate"|"weight"|"name"|"grade";
type SortDir="asc"|"desc";
type Screen="home"|"player_list"|"player_new"|"player_edit"|"player_detail"|"coach_pin"|"coach_dashboard"|"manager_bulk"|"team_ranking";

const POSITIONS=["QB","RB","WR","TE","OL","DL","DE","DT","LB","DB","CB","S","K/P","その他"];
const POS_ORDER=[...POSITIONS,"未設定"];
const SORT_OPTIONS:{key:SortKey;label:string}[]=[
  {key:"grade",label:"学年"},{key:"status",label:"ステータス"},{key:"position",label:"ポジション"},
  {key:"gain_rate",label:"増加量"},{key:"weight",label:"体重"},{key:"name",label:"名前"},
];

// ---- Utilities ----
const todayStr=()=>new Date().toISOString().split("T")[0];
const isThursday=()=>new Date().getDay()===4;
const posLabel=(p:string[])=>p.length>0?p.join(" / "):"未設定";
function calcAge(bd:string){
  const t=new Date(),b=new Date(bd);
  let a=t.getFullYear()-b.getFullYear();
  if(t.getMonth()-b.getMonth()<0||(t.getMonth()===b.getMonth()&&t.getDate()<b.getDate()))a--;
  return Math.max(0,a);
}
// 日本の学年計算（4月2日区切り）
function calcGrade(birthDate:string):number{
  const bd=new Date(birthDate);
  const bY=bd.getFullYear(),bM=bd.getMonth()+1,bD=bd.getDate();
  // 学年コーホート年（4月2日以降生まれは同年、4月1日以前は前年）
  const cohortYear=(bM>4||(bM===4&&bD>=2))?bY:bY-1;
  // 高校入学年 = コーホート年 + 16
  const hsEntryYear=cohortYear+16;
  const today=new Date();
  const academicYear=today.getMonth()>=3?today.getFullYear():today.getFullYear()-1;
  return Math.max(1,Math.min(3,academicYear-hsEntryYear+1));
}
function migratePlayer(raw:any):Player{
  let r={...raw};
  if(!r.birthDate){const yr=new Date().getFullYear()-(r.age??17);delete r.age;r.birthDate=`${yr}-04-01`;}
  if(!Array.isArray(r.position))r.position=(r.position&&r.position!=="未設定")?[r.position]:[];
  if(!r.foodLogs)r.foodLogs=[];
  return r as Player;
}
function latestWeight(p:Player):number|null{
  if(!p.measurements.length)return null;
  return[...p.measurements].sort((a,b)=>b.date.localeCompare(a.date))[0].weight;
}
function prevWeight(p:Player):number|null{
  const s=[...p.measurements].sort((a,b)=>b.date.localeCompare(a.date));
  return s.length>=2?s[1].weight:null;
}
function calcBMR(w:number,h:number,bd:string){return 10*w+6.25*h-5*calcAge(bd)+5;}
function calcDailyCalories(w:number,h:number,bd:string,gain:number){
  const bmr=Math.round(calcBMR(w,h,bd));
  const pe=Math.round((PRACTICE_MET-1)*w*PRACTICE_HOURS);
  const oe=Math.round((STRENGTH_MET-1)*w*STRENGTH_HOURS);
  const sur=Math.max(0,Math.round((gain*7700)/30));
  const act=DAILY_ACTIVITY_KCAL;
  return{bmr,practiceDay:bmr+pe+sur+act,offDay:bmr+oe+sur+act,practiceExtra:pe,offExtra:oe,surplus:sur,activity:act};
}
interface GoalInfo{
  label:string;target:number;daysLeft:number;weeksLeft:number;
  gainNeeded:number;weeklyNeeded:number;monthlyNeeded:number;monthlyRate:number;goalDate:Date;
}
function calcGoalInfo(p:Player,cur:number):GoalInfo{
  const today=new Date();today.setHours(0,0,0,0);
  const group=getPosGroup(p);
  const fresh=isFresh(p);

  // Bigs / Mids / Skills: BMI中央値から目標体重を算出
  if(group){
    const target=calcBMITarget(group,p.height);
    const gainNeeded=Math.max(0,Math.round((target-cur)*10)/10);
    const mr=group.monthlyRate;
    const wn=mr/4.33;
    const monthsToGoal=gainNeeded>0?gainNeeded/mr:0;
    const goalDate=new Date(today);
    goalDate.setDate(goalDate.getDate()+Math.ceil(monthsToGoal*30.5));
    const dl=Math.max(0,Math.round((goalDate.getTime()-today.getTime())/86400000));
    return{
      label:`${group.name} BMI${group.bmiMin}〜${group.bmiMax}目標`,
      target,goalDate,daysLeft:dl,weeksLeft:Math.round(dl/7),gainNeeded,
      weeklyNeeded:Math.round(wn*100)/100,
      monthlyNeeded:mr,
      monthlyRate:cur>0?Math.round((mr/cur)*100*10)/10:0,
    };
  }

  // Fresh（1年生・ポジション未定）: 月1kgペース
  if(fresh){
    const ms=[...p.measurements].sort((a,b)=>a.date.localeCompare(b.date));
    const startW=ms[0]?.weight??cur;
    const mr=1.0;
    const target=Math.round((startW+12)*10)/10;
    const gainNeeded=Math.max(0,Math.round((target-cur)*10)/10);
    const goalDate=new Date(ms[0]?.date||today);
    goalDate.setFullYear(goalDate.getFullYear()+1);
    const dl=Math.max(0,Math.round((goalDate.getTime()-today.getTime())/86400000));
    return{
      label:"Fresh月間+1kg目標",
      target,goalDate,daysLeft:dl,weeksLeft:Math.round(dl/7),gainNeeded,
      weeklyNeeded:Math.round(mr/4.33*100)/100,
      monthlyNeeded:mr,
      monthlyRate:cur>0?Math.round((mr/cur)*100*10)/10:0,
    };
  }

  // フォールバック（K/P・その他・上級生ポジション未設定）: 旧来の大会日程ベース
  const yr=today.getFullYear();
  const cands=[
    {label:"9月1日",date:new Date(yr,8,1),target:p.targetWeightSep},
    {label:"9月1日",date:new Date(yr+1,8,1),target:p.targetWeightSep},
    {label:"4月1日",date:new Date(yr,3,1),target:p.targetWeightApr},
    {label:"4月1日",date:new Date(yr+1,3,1),target:p.targetWeightApr},
  ].filter(c=>c.date>today&&c.target>0).sort((a,b)=>a.date.getTime()-b.date.getTime());
  if(!cands.length){
    const goalDate=new Date(today);goalDate.setFullYear(goalDate.getFullYear()+1);
    return{label:"目標未設定",target:0,goalDate,daysLeft:365,weeksLeft:52,gainNeeded:0,weeklyNeeded:0,monthlyNeeded:0,monthlyRate:0};
  }
  const nx=cands[0];
  const dl=Math.round((nx.date.getTime()-today.getTime())/86400000);
  const wl=dl/7,gn=nx.target-cur,wn=wl>0?gn/wl:0,mn=dl>0?(gn/dl)*30:0,mr2=cur>0?(mn/cur)*100:0;
  return{label:nx.label,target:nx.target,goalDate:nx.date,daysLeft:dl,weeksLeft:Math.round(wl),
    gainNeeded:Math.round(gn*10)/10,weeklyNeeded:Math.round(wn*10)/10,
    monthlyNeeded:Math.round(mn*10)/10,monthlyRate:Math.round(mr2*10)/10};
}
function calcStatus(p:Player,g:GoalInfo):TrafficLight{
  const cw=latestWeight(p);
  if(cw===null||g.gainNeeded<=0)return"green";
  if(g.daysLeft<=0)return"red";
  const s=[...p.measurements].sort((a,b)=>b.date.localeCompare(a.date));
  if(s.length<2)return"yellow";
  const days=Math.max(1,Math.round((new Date(s[0].date).getTime()-new Date(s[1].date).getTime())/86400000));
  const r=((s[0].weight-s[1].weight)/days*7)/(g.weeklyNeeded||1);
  return r>=0.8?"green":r>=0.4?"yellow":"red";
}
function statusStyle(s:TrafficLight){
  if(s==="green") return{bg:OK_BG,brd:OK_BRD,color:GREEN,text:"増量ペース：順調"};
  if(s==="yellow")return{bg:WN_BG,brd:WN_BRD,color:"#a07000",text:"増量ペース：やや遅れ"};
  return              {bg:NG_BG,brd:NG_BRD,color:RED,text:"増量ペース：遅れ"};
}
function calcTeamRank(players:Player[],targetId:string):number{
  const ranked=[...players].map(p=>{
    const cw=latestWeight(p)??0,g=calcGoalInfo(p,cw);
    const sorted=[...p.measurements].sort((a,b)=>a.date.localeCompare(b.date));
    const start=sorted[0]?.weight??cw;
    const pct=g.target>start?Math.min(100,Math.max(0,((cw-start)/(g.target-start))*100)):cw>=g.target?100:0;
    return{id:p.id,pct};
  }).sort((a,b)=>b.pct-a.pct);
  return ranked.findIndex(r=>r.id===targetId)+1;
}
function sortPlayers(players:Player[],key:SortKey,dir:SortDir):Player[]{
  return[...players].sort((a,b)=>{
    const cwa=latestWeight(a)??0,cwb=latestWeight(b)??0;
    const ga=calcGoalInfo(a,cwa),gb=calcGoalInfo(b,cwb);
    const ORD:{green:number;yellow:number;red:number}={red:0,yellow:1,green:2};
    let c=0;
    switch(key){
      case"status":c=ORD[calcStatus(a,ga)]-ORD[calcStatus(b,gb)];break;
      case"position":{
        // メインポジション（pos[0]）基準でソート
        const rk=(pos:string[])=>{if(!pos.length)return POS_ORDER.length;const idx=POS_ORDER.indexOf(pos[0]);return idx>=0?idx:POS_ORDER.length;};
        c=rk(a.position)-rk(b.position);break;
      }
      case"grade":c=calcGrade(a.birthDate)-calcGrade(b.birthDate);break;
      case"gain_rate":{
        // 実測の増加量（kg/月）でソート：計測2件未満は末尾
        const actualGainKg=(p:Player)=>{
          const ms=[...p.measurements].sort((a,b)=>a.date.localeCompare(b.date));
          if(ms.length<2)return-Infinity;
          const days=Math.max(1,Math.round((new Date(ms[ms.length-1].date).getTime()-new Date(ms[0].date).getTime())/86400000));
          return(ms[ms.length-1].weight-ms[0].weight)/days*30;
        };
        c=actualGainKg(a)-actualGainKg(b);break;
      }
      case"weight":c=cwa-cwb;break;
      case"name":c=a.name.localeCompare(b.name,"ja");break;
    }
    return dir==="asc"?c:-c;
  });
}

// 学年順ソート（3年→2年→1年、同学年内はポジション→名前）
function sortByGrade(players:Player[]):Player[]{
  const rk=(pos:string[])=>{if(!pos.length)return POS_ORDER.length;const idx=POS_ORDER.indexOf(pos[0]);return idx>=0?idx:POS_ORDER.length;};
  return[...players].sort((a,b)=>{
    const ga=calcGrade(a.birthDate),gb=calcGrade(b.birthDate);
    if(ga!==gb)return gb-ga; // 3年→1年
    const pd=rk(a.position)-rk(b.position);
    if(pd!==0)return pd;
    return a.name.localeCompare(b.name,"ja");
  });
}

// ---- Position Groups ----
interface PosGroupInfo{name:"Bigs"|"Mids"|"Skills";bmiMin:number;bmiMax:number;monthlyRate:number;annualLimit:number;}
const BIGS_GROUP:PosGroupInfo={name:"Bigs",bmiMin:28,bmiMax:33,monthlyRate:1.25,annualLimit:15};
const MIDS_GROUP:PosGroupInfo={name:"Mids",bmiMin:25,bmiMax:28,monthlyRate:0.83,annualLimit:10};
const SKILLS_GROUP:PosGroupInfo={name:"Skills",bmiMin:24,bmiMax:26,monthlyRate:0.83,annualLimit:10};
const BIGS_POS=["OL","DL","DE","DT"];
const MIDS_POS=["TE","RB","LB"];
const SKILLS_POS=["WR","DB","CB","S","QB"];
// Freshポジション選択肢（1年生ポジション未定向け）
const FRESH_POS_OPTIONS=[
  {label:"OL",group:"Bigs"},{label:"DL",group:"Bigs"},
  {label:"TE",group:"Mids"},{label:"RB",group:"Mids"},{label:"LB",group:"Mids"},
  {label:"WR",group:"Skills"},{label:"DB",group:"Skills"},{label:"QB",group:"Skills"},
];
function getPosGroup(p:Player):PosGroupInfo|null{
  const pos=p.position[0]||"";
  if(BIGS_POS.includes(pos))return BIGS_GROUP;
  if(MIDS_POS.includes(pos))return MIDS_GROUP;
  if(SKILLS_POS.includes(pos))return SKILLS_GROUP;
  return null;
}
function isFresh(p:Player):boolean{
  return calcGrade(p.birthDate)===1&&(!p.position[0]||p.position[0]==="その他");
}
function calcBMITarget(group:PosGroupInfo,heightCm:number):number{
  const h=heightCm/100;
  return Math.round(((group.bmiMin+group.bmiMax)/2)*h*h*10)/10;
}
function calcCurrentBMI(weight:number,heightCm:number):number{
  if(!weight||!heightCm)return 0;
  const h=heightCm/100;
  return Math.round(weight/(h*h)*10)/10;
}

// ---- Motivation ----
function getMotivation(p:Player,goal:GoalInfo,status:TrafficLight):{emoji:string;msg:string;color:string}{
  const cw=latestWeight(p)??0;
  if(cw===0)return{emoji:"📋",msg:"まず今日の体重を記録しよう！",color:MUTED};
  if(cw>=goal.target)return{emoji:"🏆",msg:`目標の${goal.target}kg達成！次のステージへ進め！`,color:GOLD};
  const allW=p.measurements.map(m=>m.weight);
  const sorted=[...p.measurements].sort((a,b)=>a.date.localeCompare(b.date));
  let streak=0;
  for(let i=sorted.length-1;i>=1;i--){
    const d=Math.max(1,Math.round((new Date(sorted[i].date).getTime()-new Date(sorted[i-1].date).getTime())/86400000));
    const wg=((sorted[i].weight-sorted[i-1].weight)/d)*7;
    if(goal.weeklyNeeded>0&&wg>=goal.weeklyNeeded*0.8)streak++;else break;
  }
  if(streak>=4)return{emoji:"🔥",msg:`${streak}週連続ペース達成中！本物のアスリートだ！`,color:GREEN};
  if(streak>=2)return{emoji:"💪",msg:`${streak}週連続ペース達成！この勢いで行け！`,color:GREEN};
  const isNew=allW.length>0&&cw>=Math.max(...allW);
  if(isNew&&allW.length>1){const pw=prevWeight(p)??cw;if(cw>pw)return{emoji:"🎉",msg:`自己最高体重更新！${cw}kgは今の君の証だ！`,color:GREEN};}
  const idx=p.measurements.length%3;
  if(status==="green"){const m=["絶好調！このペースなら目標達成間違いなし！","食べて・寝て・鍛えてこの調子を続けろ！","いいペースだ！チームのために大きくなれ！"][idx];return{emoji:"✅",msg:m,color:GREEN};}
  if(status==="yellow"){const m=["もう少し！間食を1品追加してみよう！","あとひと押し！食事の量を少し増やそう！","ここが踏ん張りどころ！3食必ず食べよう！"][idx];return{emoji:"⚡",msg:m,color:"#a07000"};}
  const m=["今週こそ！1日5食を目標にしよう！","チームのために食え！お前ならできる！","ここからが本当の勝負！諦めるな！"][idx];
  return{emoji:"🔑",msg:m,color:RED};
}

// ---- Weight Chart (with period selector) ----
type ChartPeriod="1m"|"3m"|"goal";
function WeightChart({player}:{player:Player}){
  const[period,setPeriod]=useState<ChartPeriod>("goal");
  const allMeas=[...player.measurements].sort((a,b)=>a.date.localeCompare(b.date));
  if(allMeas.length<2)return<div style={{textAlign:"center",color:MUTED2,fontSize:12,padding:"16px 0"}}>記録が2件以上になるとグラフが表示されます</div>;
  const cw=allMeas[allMeas.length-1].weight,goal=calcGoalInfo(player,cw);
  const now=Date.now();
  let meas:typeof allMeas,minTs:number,maxTs:number,showGoalLine=false;
  if(period==="1m"){
    const s=now-30*24*3600*1000;
    meas=allMeas.filter(m=>new Date(m.date).getTime()>=s);
    if(meas.length===0)meas=allMeas.slice(-2);
    minTs=Math.min(new Date(meas[0].date).getTime()-3*24*3600*1000,s);
    maxTs=now+7*24*3600*1000;
  }else if(period==="3m"){
    const s=now-90*24*3600*1000;
    meas=allMeas.filter(m=>new Date(m.date).getTime()>=s);
    if(meas.length===0)meas=allMeas.slice(-4);
    minTs=Math.min(new Date(meas[0].date).getTime()-3*24*3600*1000,s);
    maxTs=now+14*24*3600*1000;
  }else{
    meas=allMeas;
    minTs=new Date(meas[0].date).getTime();
    maxTs=goal.goalDate.getTime();
    showGoalLine=true;
  }
  const VW=340,VH=150,PL=38,PR=14,PT=8,PB=30,iW=VW-PL-PR,iH=VH-PT-PB;
  const allW=showGoalLine?[...meas.map(m=>m.weight),goal.target]:meas.map(m=>m.weight);
  const minW=Math.floor(Math.min(...allW)-0.5),maxW=Math.ceil(Math.max(...allW)+0.5);
  const xS=(ts:number)=>((ts-minTs)/(maxTs-minTs||1))*iW;
  const yS=(w:number)=>iH-((w-minW)/(maxW-minW||1))*iH;
  const pts=meas.map(m=>({x:xS(new Date(m.date).getTime()),y:yS(m.weight),w:m.weight}));
  const path=pts.map((p,i)=>`${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const wStep=Math.max(1,Math.ceil((maxW-minW)/3));
  const yTicks:number[]=[];
  for(let w=Math.ceil(minW/wStep)*wStep;w<=maxW+0.5;w+=wStep)yTicks.push(w);
  const xTicks:{x:number;label:string}[]=[];
  const curD=new Date(minTs);curD.setDate(1);
  while(curD.getTime()<=maxTs){const ts=curD.getTime();if(ts>=minTs)xTicks.push({x:xS(ts),label:`${curD.getMonth()+1}月`});curD.setMonth(curD.getMonth()+1);}
  const todayX=xS(now);
  const PERIODS:[ChartPeriod,string][]=[["1m","1か月"],["3m","3か月"],["goal","目標まで"]];
  return(
    <div>
      <div style={{display:"flex",gap:6,marginBottom:10}}>
        {PERIODS.map(([p,label])=>(
          <button key={p} onClick={()=>setPeriod(p)}
            style={{flex:1,padding:"6px 4px",borderRadius:8,fontSize:11,fontWeight:period===p?700:400,
              background:period===p?MAROON:"transparent",color:period===p?"#fff":MUTED,
              border:`1px solid ${period===p?MAROON:BORDER}`,cursor:"pointer",fontFamily:"inherit",minHeight:36}}>
            {label}
          </button>
        ))}
      </div>
      <svg width="100%" viewBox={`0 0 ${VW} ${VH}`} style={{display:"block",overflow:"visible"}}>
        <g transform={`translate(${PL},${PT})`}>
          {yTicks.map(w=><g key={w}><line x1={0} y1={yS(w)} x2={iW} y2={yS(w)} stroke={BORDER} strokeWidth={1}/><text x={-4} y={yS(w)} textAnchor="end" fontSize={9} fill={MUTED} dominantBaseline="middle">{w}</text></g>)}
          <line x1={0} y1={iH} x2={iW} y2={iH} stroke={BORDER} strokeWidth={1}/>
          {xTicks.map(t=><g key={t.label}><line x1={t.x} y1={iH} x2={t.x} y2={iH+4} stroke={MUTED2} strokeWidth={1}/><text x={t.x} y={iH+14} textAnchor="middle" fontSize={9} fill={MUTED2}>{t.label}</text></g>)}
          {todayX>=0&&todayX<=iW&&<line x1={todayX} y1={0} x2={todayX} y2={iH} stroke={NG_BRD} strokeWidth={1.5} strokeDasharray="3,3"/>}
          {showGoalLine&&pts.length>0&&<>
            <line x1={pts[0].x.toFixed(1)} y1={yS(meas[0].weight).toFixed(1)} x2={xS(maxTs).toFixed(1)} y2={yS(goal.target).toFixed(1)} stroke={GOLD} strokeWidth={1.5} strokeDasharray="5,4" opacity={0.8}/>
            <circle cx={xS(maxTs)} cy={yS(goal.target)} r={4} fill={GOLD} opacity={0.9}/>
            <text x={xS(maxTs)-2} y={yS(goal.target)-9} textAnchor="middle" fontSize={9} fill={GOLD} fontWeight="bold">{goal.target}</text>
          </>}
          <path d={path} fill="none" stroke={MAROON} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round"/>
          {pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={i===pts.length-1?5:3.5} fill={i===pts.length-1?MAROON:"#fff"} stroke={MAROON} strokeWidth={2}/>)}
          {pts.length>0&&<text x={pts[pts.length-1].x+7} y={pts[pts.length-1].y} fontSize={10} fill={MAROON} fontWeight="bold" dominantBaseline="middle">{pts[pts.length-1].w}</text>}
          <g transform={`translate(0,${iH+22})`}>
            <line x1={0} y1={0} x2={14} y2={0} stroke={MAROON} strokeWidth={2.5}/><circle cx={7} cy={0} r={3} fill={MAROON}/><text x={18} y={0} fontSize={8} fill={MUTED} dominantBaseline="middle">実績</text>
            {showGoalLine&&<><line x1={44} y1={0} x2={58} y2={0} stroke={GOLD} strokeWidth={1.5} strokeDasharray="4,3"/><text x={62} y={0} fontSize={8} fill={MUTED} dominantBaseline="middle">目標ライン</text></>}
          </g>
        </g>
      </svg>
    </div>
  );
}

// ---- Food Log Section ----
function FoodLogSection({player,practiceKcal,offKcal,onUpdate}:{
  player:Player;practiceKcal:number;offKcal:number;onUpdate:(p:Player)=>void;
}){
  const today=todayStr();
  const isPracticeDay=new Date().getDay()!==0; // Sun=off
  const targetKcal=isPracticeDay?practiceKcal:offKcal;
  const todayLog=(player.foodLogs??[]).find(l=>l.date===today)??{date:today,entries:[]};
  const totalKcal=todayLog.entries.reduce((s,e)=>s+e.kcal,0);
  const pct=Math.min(100,Math.round(totalKcal/targetKcal*100));
  const [showAdd,setShowAdd]=useState(false);
  const [mealType,setMealType]=useState("昼");
  const [selectedPreset,setSelectedPreset]=useState("");
  const [customName,setCustomName]=useState("");
  const [customKcal,setCustomKcal]=useState("");
  const allPresets=[
    ...MAIN_FOODS.map(f=>({...f,group:"メイン食"})),
    ...PRE_PRACTICE_FOODS.map(f=>({...f,group:"練習前補食"})),
    ...POST_PRACTICE_FOODS.map(f=>({...f,group:"練習後補食"})),
  ];
  const addEntry=()=>{
    const name=customName,kcal=parseInt(customKcal)||0;
    if(!name||!kcal)return;
    const entry:FoodEntry={id:Date.now().toString(),meal:mealType,name,kcal};
    const updatedLog={date:today,entries:[...todayLog.entries,entry]};
    const foodLogs=[...(player.foodLogs??[]).filter(l=>l.date!==today),updatedLog];
    onUpdate({...player,foodLogs});
    setSelectedPreset("");setCustomName("");setCustomKcal("");setShowAdd(false);
  };
  const removeEntry=(id:string)=>{
    const updatedLog={date:today,entries:todayLog.entries.filter(e=>e.id!==id)};
    const foodLogs=[...(player.foodLogs??[]).filter(l=>l.date!==today),updatedLog];
    onUpdate({...player,foodLogs});
  };
  const barColor=pct>=100?GREEN:pct>=70?GOLD:MAROON;
  return(
    <Card>
      <Label>📊 今日のカロリー記録 ({isPracticeDay?"練習日":"オフ日"})</Label>
      <div style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:5}}>
          <span style={{fontWeight:800,color:pct>=100?GREEN:MAROON,fontSize:20}}>{totalKcal.toLocaleString()}<span style={{fontSize:13,fontWeight:400,color:MUTED}}> kcal</span></span>
          <span style={{color:MUTED,fontSize:12,alignSelf:"flex-end"}}>目標 {targetKcal.toLocaleString()} kcal</span>
        </div>
        <div style={{height:12,background:BORDER,borderRadius:6,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:barColor,borderRadius:6,transition:"width 0.4s"}}/>
        </div>
        {pct<100
          ?<div style={{fontSize:12,color:MUTED,marginTop:4}}>あと <strong style={{color:MAROON}}>{(targetKcal-totalKcal).toLocaleString()} kcal</strong> 食べよう！</div>
          :<div style={{fontSize:12,color:GREEN,marginTop:4,fontWeight:700}}>✓ 目標カロリー達成！よく食べた！</div>}
      </div>
      {/* Entries */}
      {todayLog.entries.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
          {todayLog.entries.map(e=>(
            <div key={e.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",borderRadius:8,background:"#f8f5ef",minHeight:44}}>
              <div style={{flex:1,overflow:"hidden"}}>
                <span style={{fontSize:10,fontWeight:700,background:MAROON_L,color:MAROON,borderRadius:5,padding:"2px 6px",marginRight:6}}>{e.meal}</span>
                <span style={{fontSize:13,color:TEXT}}>{e.name}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0,marginLeft:8}}>
                <span style={{fontSize:13,fontWeight:700,color:MAROON}}>{e.kcal}</span>
                <span style={{fontSize:10,color:MUTED}}>kcal</span>
                <button onClick={()=>removeEntry(e.id)} style={{background:"none",border:"none",color:MUTED2,cursor:"pointer",fontSize:18,padding:"0 4px",minHeight:36,minWidth:28}}>×</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {!showAdd?(
        <button onClick={()=>setShowAdd(true)} style={{width:"100%",minHeight:50,borderRadius:10,border:`1.5px dashed ${MAROON}`,background:"transparent",color:MAROON,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>＋ 食事を記録する</button>
      ):(
        <div style={{background:"#f8f5ef",borderRadius:12,padding:"14px 12px",display:"flex",flexDirection:"column",gap:10}}>
          {/* Meal type */}
          <div style={{display:"flex",gap:6}}>
            {["朝","昼","夕","補食"].map(m=>(
              <button key={m} onClick={()=>setMealType(m)} style={{flex:1,minHeight:44,padding:"8px 4px",borderRadius:8,border:`1.5px solid ${mealType===m?MAROON:BORDER}`,background:mealType===m?MAROON:"#fff",color:mealType===m?"#fff":MUTED,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{m}</button>
            ))}
          </div>
          {/* Preset dropdown */}
          <select value={selectedPreset} onChange={e=>{
            setSelectedPreset(e.target.value);
            if(e.target.value){try{const f=JSON.parse(e.target.value);setCustomName(f.name);setCustomKcal(String(f.kcal));}catch{}}
          }} style={{width:"100%",padding:"12px 14px",borderRadius:8,fontSize:15,border:`1.5px solid ${BORDER}`,fontFamily:"inherit",background:"#fff",color:TEXT}}>
            <option value="">プリセットから選ぶ（任意）</option>
            <optgroup label="🍚 メイン食">
              {MAIN_FOODS.map((f,i)=><option key={i} value={JSON.stringify({name:f.name,kcal:f.kcal})}>{f.name}（{f.kcal}kcal）</option>)}
            </optgroup>
            <optgroup label="🔋 練習前補食">
              {PRE_PRACTICE_FOODS.map((f,i)=><option key={i} value={JSON.stringify({name:f.name,kcal:f.kcal})}>{f.name}（{f.kcal}kcal）</option>)}
            </optgroup>
            <optgroup label="💪 練習後補食">
              {POST_PRACTICE_FOODS.map((f,i)=><option key={i} value={JSON.stringify({name:f.name,kcal:f.kcal})}>{f.name}（{f.kcal}kcal）</option>)}
            </optgroup>
          </select>
          {/* Manual inputs */}
          <div style={{display:"flex",gap:8}}>
            <input type="text" value={customName} onChange={e=>{setCustomName(e.target.value);setSelectedPreset("");}} placeholder="食品名（手入力も可）" style={{flex:2,padding:"12px 14px",borderRadius:8,fontSize:15,border:`1.5px solid ${BORDER}`,fontFamily:"inherit",background:"#fff",color:TEXT}}/>
            <input type="number" inputMode="numeric" value={customKcal} onChange={e=>setCustomKcal(e.target.value)} placeholder="kcal" style={{width:80,padding:"12px 8px",borderRadius:8,fontSize:15,border:`1.5px solid ${BORDER}`,fontFamily:"inherit",background:"#fff",color:TEXT,textAlign:"center"}}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={addEntry} disabled={!customName||!customKcal} style={{flex:2,minHeight:52,borderRadius:10,background:customName&&customKcal?MAROON:"#ccc",color:"#fff",border:"none",fontSize:15,fontWeight:700,cursor:customName&&customKcal?"pointer":"not-allowed",fontFamily:"inherit"}}>追加する</button>
            <button onClick={()=>{setShowAdd(false);setSelectedPreset("");setCustomName("");setCustomKcal("");}} style={{flex:1,minHeight:52,borderRadius:10,background:"transparent",border:`1px solid ${BORDER}`,color:MUTED,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>キャンセル</button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ---- Food Recommendation ----
function FoodRecommendation({practiceKcal,offKcal}:{practiceKcal:number;offKcal:number}){
  const[open,setOpen]=useState(false);
  const[tab,setTab]=useState<"main"|"pre"|"post">("main");
  const foods=tab==="main"?MAIN_FOODS:tab==="pre"?PRE_PRACTICE_FOODS:POST_PRACTICE_FOODS;
  const typeColor={"コンビニ":MAROON,"外食":"#8B5A00","自炊":GREEN};
  const typeBg={"コンビニ":MAROON_L,"外食":WN_BG,"自炊":OK_BG};
  return(
    <div>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",minHeight:52,padding:"14px 18px",borderRadius:12,background:open?MAROON:GOLD_L,border:`1.5px solid ${open?MAROON:GOLD}`,color:open?"#fff":TEXT,fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:"inherit"}}>
        <span>🍱 おすすめ食事を見る</span>
        <span style={{fontSize:18}}>{open?"▲":"▼"}</span>
      </button>
      {open&&(
        <div style={{marginTop:8}}>
          <div style={{fontSize:12,color:MUTED,textAlign:"center",lineHeight:1.7,marginBottom:10,background:GOLD_L,borderRadius:10,padding:"10px 14px",border:`1px solid ${BORDER}`}}>
            練習日目標 <strong style={{color:MAROON}}>{practiceKcal.toLocaleString()} kcal</strong> ／ オフ日 <strong style={{color:MAROON}}>{offKcal.toLocaleString()} kcal</strong>
          </div>
          {/* 3-tab */}
          <div style={{display:"flex",gap:6,marginBottom:10}}>
            {([["main","🍚 メイン食"],["pre","🔋 練習前補食"],["post","💪 練習後補食"]] as const).map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)} style={{flex:1,minHeight:44,padding:"8px 4px",borderRadius:10,background:tab===id?MAROON:"transparent",border:`1.5px solid ${tab===id?MAROON:BORDER}`,color:tab===id?"#fff":MUTED,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{label}</button>
            ))}
          </div>
          {tab==="pre"&&<div style={{fontSize:11,color:"#7a5000",background:WN_BG,borderRadius:8,padding:"8px 12px",marginBottom:8,border:`1px solid ${WN_BRD}`}}>💡 練習2〜3時間前に食べておくと効果的！脂質の少ないものを選んで</div>}
          {tab==="post"&&<div style={{fontSize:11,color:GREEN,background:OK_BG,borderRadius:8,padding:"8px 12px",marginBottom:8,border:`1px solid ${OK_BRD}`}}>💡 練習後30分以内が筋合成のゴールデンタイム！タンパク質+糖質を素早く補給</div>}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {foods.map((f,i)=>(
              <div key={i} style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1,marginRight:10}}>
                    <div style={{fontSize:13,fontWeight:600,color:TEXT,lineHeight:1.5}}>{f.name}</div>
                    {f.note&&<div style={{fontSize:11,color:"#7a5000",background:WN_BG,borderRadius:5,padding:"2px 7px",marginTop:4,display:"inline-block"}}>{f.note}</div>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,flexShrink:0}}>
                    <span style={{fontSize:17,fontWeight:800,color:MAROON}}>約{f.kcal}</span>
                    <span style={{fontSize:10,color:MUTED2}}>kcal</span>
                    <span style={{fontSize:10,fontWeight:700,background:typeBg[f.type],color:typeColor[f.type],padding:"2px 7px",borderRadius:5}}>{f.type}</span>
                  </div>
                </div>
                {f.detail&&<div style={{fontSize:11,color:MUTED,marginTop:6,lineHeight:1.6,background:"#f8f5ef",borderRadius:6,padding:"6px 8px"}}>{f.detail}</div>}
              </div>
            ))}
          </div>
          <div style={{fontSize:11,color:MUTED2,textAlign:"center",marginTop:10}}>※カロリーは目安です。体重の変化を見ながら調整してください。</div>
        </div>
      )}
    </div>
  );
}

// ---- Shared UI ----
function Card({children,style}:{children:React.ReactNode;style?:React.CSSProperties}){return<div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:14,padding:"16px 18px",...style}}>{children}</div>;}
function Label({children}:{children:React.ReactNode}){return<div style={{fontSize:11,fontWeight:700,color:MUTED,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6}}>{children}</div>;}
function TInput({value,onChange,placeholder,type="text",style}:{value:string;onChange:(v:string)=>void;placeholder?:string;type?:string;style?:React.CSSProperties}){
  return<input type={type} inputMode={type==="number"?"decimal":undefined} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)}
    style={{width:"100%",padding:"12px 14px",borderRadius:10,fontSize:16,border:`1.5px solid ${BORDER}`,outline:"none",fontFamily:"inherit",boxSizing:"border-box",color:TEXT,background:"#f8f5ef",...style}}/>;
}
function Btn({children,onClick,color=MAROON,disabled,small,fullWidth}:{children:React.ReactNode;onClick:()=>void;color?:string;disabled?:boolean;small?:boolean;fullWidth?:boolean}){
  return<button onClick={onClick} disabled={disabled} style={{padding:small?"9px 16px":"13px 24px",borderRadius:10,fontSize:small?13:15,fontWeight:700,background:disabled?"#ccc":color,color:"#fff",border:"none",cursor:disabled?"not-allowed":"pointer",fontFamily:"inherit",minHeight:small?40:50,width:fullWidth?"100%":undefined}}>{children}</button>;
}
function BackBtn({onClick}:{onClick:()=>void}){return<button onClick={onClick} style={{background:"none",border:"none",fontSize:24,cursor:"pointer",padding:"4px 8px",color:MUTED,minWidth:44,minHeight:44,display:"flex",alignItems:"center"}}>←</button>;}

// ---- Player Form ----
interface FormInit{name?:string;height?:string;birthDate?:string;position?:string[];targetSep?:string;targetApr?:string;}
function PlayerFormScreen({title,init,showWeight,onSave,onBack}:{
  title:string;init?:FormInit;showWeight:boolean;
  onSave:(d:{name:string;height:number;birthDate:string;position:string[];targetSep:number;targetApr:number;weight?:number})=>void;
  onBack:()=>void;
}){
  const[name,setName]=useState(init?.name??"");
  const[height,setHeight]=useState(init?.height??"");
  const[birthDate,setBD]=useState(init?.birthDate??"");
  const[positions,setPositions]=useState<string[]>(init?.position??[]);
  const[weight,setWeight]=useState("");
  const[targetSep,setTSep]=useState(init?.targetSep??"");
  const[targetApr,setTApr]=useState(init?.targetApr??"");
  const setMain=(pos:string)=>setPositions(prev=>{const subs=prev.slice(1).filter(p=>p!==pos);return prev[0]===pos?[...subs]:[pos,...subs];});
  const toggleSub=(pos:string)=>setPositions(prev=>prev.slice(1).includes(pos)?[prev[0],...prev.slice(1).filter(p=>p!==pos)]:[prev[0],...prev.slice(1),pos]);
  const canSave=name&&height&&birthDate&&targetSep&&targetApr&&(!showWeight||weight);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><BackBtn onClick={onBack}/><span style={{fontSize:18,fontWeight:800,color:TEXT}}>{title}</span></div>
      <Card>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div><Label>名前</Label><TInput value={name} onChange={setName} placeholder="例：山田太郎"/></div>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}><Label>身長 (cm)</Label><TInput value={height} onChange={setHeight} type="number" placeholder="175"/></div>
            <div style={{flex:1}}><Label>生年月日 {birthDate?`(${calcAge(birthDate)}歳)`:""}</Label><TInput value={birthDate} onChange={setBD} type="date" style={{fontSize:15}}/></div>
          </div>
          <div>
            <Label>メインポジション（1つ）{positions[0]&&<span style={{background:MAROON,color:"#fff",borderRadius:6,padding:"2px 8px",marginLeft:6,fontSize:11,fontWeight:700}}>{positions[0]}</span>}</Label>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>
              {POSITIONS.map(pos=>{const isMn=positions[0]===pos;return(
                <button key={pos} onClick={()=>setMain(pos)} style={{padding:"9px 14px",borderRadius:9,fontSize:14,minHeight:44,border:`2px solid ${isMn?MAROON:BORDER}`,background:isMn?MAROON:"transparent",color:isMn?"#fff":MUTED2,cursor:"pointer",fontFamily:"inherit",fontWeight:isMn?800:400}}>{pos}</button>
              );})}
            </div>
            {positions[0]&&<>
              <Label>サブポジション（任意・複数可）{positions.slice(1).length>0&&<span style={{color:MUTED,marginLeft:6,fontWeight:600}}>{positions.slice(1).join(" / ")}</span>}</Label>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {POSITIONS.filter(pos=>pos!==positions[0]).map(pos=>{const isSub=positions.slice(1).includes(pos);return(
                  <button key={pos} onClick={()=>toggleSub(pos)} style={{padding:"9px 14px",borderRadius:9,fontSize:14,minHeight:44,border:`1.5px dashed ${isSub?MAROON:BORDER}`,background:isSub?MAROON_L:"transparent",color:isSub?MAROON:MUTED2,cursor:"pointer",fontFamily:"inherit",fontWeight:isSub?700:400}}>{pos}</button>
                );})}
              </div>
            </>}
          </div>
        </div>
      </Card>
      <Card>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {showWeight&&<div><Label>現在の体重 (kg)</Label><TInput value={weight} onChange={setWeight} type="number" placeholder="75.0"/></div>}
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}><Label>目標：9月1日 (kg)</Label><TInput value={targetSep} onChange={setTSep} type="number" placeholder="80.0"/></div>
            <div style={{flex:1}}><Label>目標：4月1日 (kg)</Label><TInput value={targetApr} onChange={setTApr} type="number" placeholder="82.0"/></div>
          </div>
        </div>
      </Card>
      <Btn fullWidth onClick={()=>{if(!canSave)return;onSave({name,height:parseFloat(height),birthDate,position:positions,targetSep:parseFloat(targetSep),targetApr:parseFloat(targetApr),...(showWeight?{weight:parseFloat(weight)}:{})});}} disabled={!canSave}>{showWeight?"登録する":"保存する"}</Btn>
    </div>
  );
}

// ---- Player List ----
function PlayerListScreen({players,onSelect,onNew,onBack,onRanking,myPlayerId}:{players:Player[];onSelect:(p:Player)=>void;onNew:()=>void;onBack:()=>void;onRanking:()=>void;myPlayerId?:string;}){
  const myPlayer=myPlayerId?players.find(p=>p.id===myPlayerId):null;
  // マイ選手を先頭、残りを学年順
  const sorted=[
    ...(myPlayer?[myPlayer]:[]),
    ...sortByGrade(players).filter(p=>p.id!==myPlayerId),
  ];
  let lastGrade=-1;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><BackBtn onClick={onBack}/><span style={{fontSize:18,fontWeight:800,color:TEXT}}>選手を選ぶ</span></div>
      {isThursday()&&<div style={{background:WN_BG,border:`1px solid ${WN_BRD}`,borderRadius:10,padding:"12px 16px",fontSize:14,color:"#7a5000",fontWeight:700}}>📅 今日は木曜日！体重を記録しましょう！</div>}
      {players.length===0
        ?<Card><div style={{textAlign:"center",color:MUTED,fontSize:14,padding:"20px 0"}}>まだ選手が登録されていません</div></Card>
        :sorted.map(p=>{
          const cw=latestWeight(p);const g=calcGoalInfo(p,cw??0);const sl=statusStyle(calcStatus(p,g));
          const isMe=p.id===myPlayerId;
          const grade=calcGrade(p.birthDate);
          const showHeader=!isMe&&grade!==lastGrade;
          if(!isMe)lastGrade=grade;
          return(
          <div key={p.id}>
            {isMe&&<div style={{fontSize:11,fontWeight:800,color:MAROON,letterSpacing:"0.08em",padding:"4px 4px 0"}}>👤 マイページ</div>}
            {showHeader&&<div style={{fontSize:12,fontWeight:800,color:MAROON,letterSpacing:"0.08em",padding:"4px 4px 0",marginTop:4}}>{grade}年生</div>}
            <button onClick={()=>onSelect(p)} style={{width:"100%",background:isMe?MAROON_L:CARD,border:`${isMe?"2px solid":"1px solid"} ${isMe?MAROON:BORDER}`,borderRadius:12,padding:"16px 18px",textAlign:"left",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",fontFamily:"inherit",minHeight:72}}>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:TEXT,display:"flex",alignItems:"center",gap:6}}>
                  {p.name}
                  {isMe&&<span style={{fontSize:11,background:MAROON,color:"#fff",borderRadius:20,padding:"2px 8px",fontWeight:700}}>あなた</span>}
                </div>
                <div style={{fontSize:12,marginTop:3}}>
                  <span style={{color:MUTED,fontWeight:700}}>{p.position[0]||"未設定"}</span>
                  {p.position.slice(1).map(sp=><span key={sp} style={{color:MUTED2}}>{"・"+sp}</span>)}
                  <span style={{color:MUTED}}> ／ {cw!==null?`${cw} kg`:"未計測"}</span>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{background:sl.bg,border:`1px solid ${sl.brd}`,borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700,color:sl.color}}>{sl.text}</span>
                <span style={{fontSize:22,color:MUTED2}}>›</span>
              </div>
            </button>
          </div>
        );})}
      <button onClick={onRanking} style={{minHeight:52,padding:"14px 18px",borderRadius:12,border:`2px solid ${MAROON}`,background:MAROON_L,fontSize:15,color:MAROON,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>🏅 チームランキングを見る</button>
      <button onClick={onNew} style={{minHeight:52,padding:"14px",borderRadius:12,border:`2px dashed ${BORDER}`,background:"transparent",fontSize:14,color:MUTED,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>＋ 新しい選手を登録</button>
    </div>
  );
}

// ---- Team Ranking ----
function TeamRankingScreen({players,onBack,onSelect}:{players:Player[];onBack:()=>void;onSelect:(p:Player)=>void;}){
  const ranked=[...players].map(p=>{
    const cw=latestWeight(p)??0,goal=calcGoalInfo(p,cw);
    const sorted=[...p.measurements].sort((a,b)=>a.date.localeCompare(b.date));
    const start=sorted[0]?.weight??cw;
    const pct=goal.target>start?Math.min(100,Math.max(0,((cw-start)/(goal.target-start))*100)):cw>=goal.target?100:0;
    let monthlyGain:number|null=null;
    if(sorted.length>=2){const days=Math.max(1,Math.round((new Date(sorted[sorted.length-1].date).getTime()-new Date(sorted[0].date).getTime())/86400000));monthlyGain=Math.round((sorted[sorted.length-1].weight-sorted[0].weight)/days*30*10)/10;}
    return{player:p,cw,goal,pct,status:calcStatus(p,goal),monthlyGain};
  }).sort((a,b)=>b.pct-a.pct);
  const medals=["🥇","🥈","🥉"];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><BackBtn onClick={onBack}/><span style={{fontSize:18,fontWeight:800,color:TEXT}}>🏅 チームランキング</span></div>
      <div style={{fontSize:12,color:MUTED,textAlign:"center"}}>目標体重への達成率（次の大会基準）</div>
      {ranked.length===0?<Card><div style={{textAlign:"center",color:MUTED,fontSize:14,padding:"20px 0"}}>選手が登録されていません</div></Card>:
        ranked.map((r,i)=>{
          const sl=statusStyle(r.status);
          const mgColor=r.monthlyGain===null?MUTED:r.monthlyGain>0?GREEN:RED;
          return(
            <button key={r.player.id} onClick={()=>onSelect(r.player)} style={{background:CARD,border:`1px solid ${i===0?GOLD:BORDER}`,borderRadius:12,padding:"14px 16px",textAlign:"left",cursor:"pointer",fontFamily:"inherit",minHeight:80}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontSize:i<3?28:15,minWidth:38,textAlign:"center",fontWeight:700}}>{i<3?medals[i]:`${i+1}位`}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:15,fontWeight:700,color:TEXT}}>{r.player.name}</span>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:11,color:MUTED}}>
                        <span style={{fontWeight:700}}>{r.player.position[0]||"未設定"}</span>
                        {r.player.position.slice(1).map(sp=><span key={sp} style={{color:MUTED2}}>{"・"+sp}</span>)}
                        {" / "}{r.cw}kg
                      </span>
                      <span style={{background:sl.bg,border:`1px solid ${sl.brd}`,borderRadius:6,padding:"2px 7px",fontSize:11,fontWeight:700,color:sl.color}}>{sl.text}</span>
                    </div>
                  </div>
                  <div style={{marginTop:6,height:8,background:BORDER,borderRadius:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${r.pct}%`,background:i===0?GOLD:i===1?"#a0a0a0":i===2?"#8b6914":MAROON,borderRadius:4}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:11,color:MUTED,flexWrap:"wrap",gap:2}}>
                    <div style={{display:"flex",gap:8}}>
                      <span style={{fontWeight:700,color:i===0?GOLD:MAROON}}>{Math.round(r.pct)}%達成</span>
                      <span style={{color:mgColor,fontWeight:600}}>月間{r.monthlyGain===null?"：記録なし":`：${r.monthlyGain>=0?"+":""}${r.monthlyGain}kg`}</span>
                    </div>
                    <span>目標 {r.goal.target}kg（{r.goal.label}）</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
    </div>
  );
}

// ---- Player Detail ----
function PlayerDetailScreen({player,players,onBack,onEdit,onUpdate,isCoach,myPlayerId,onSetMyPlayer}:{
  player:Player;players:Player[];onBack:()=>void;onEdit:()=>void;onUpdate:(p:Player)=>void;isCoach:boolean;
  myPlayerId?:string;onSetMyPlayer?:(id:string|null)=>void;
}){
  const cw=latestWeight(player)??0,pw=prevWeight(player);
  const goal=calcGoalInfo(player,cw),st=calcStatus(player,goal),sl=statusStyle(st);
  const mot=getMotivation(player,goal,st);
  const kcal=calcDailyCalories(cw,player.height,player.birthDate,goal.monthlyNeeded);
  const[inp,setInp]=useState(""),[saved,setSaved]=useState(false);
  const[recordDate,setRecordDate]=useState(todayStr());
  const dateMeasured=player.measurements.some(m=>m.date===recordDate);
  // Last measurement info (#8)
  const sortedMeas=[...player.measurements].sort((a,b)=>b.date.localeCompare(a.date));
  const lastDate=sortedMeas[0]?.date;
  const daysSinceLast=lastDate?Math.round((Date.now()-new Date(lastDate).getTime())/86400000):null;
  // チーム順位（全体）
  const myRank=players.length>0?calcTeamRank(players,player.id):null;
  // 学年順位
  const myGrade=calcGrade(player.birthDate);
  const gradePlayers=players.filter(p=>calcGrade(p.birthDate)===myGrade);
  const myGradeRank=gradePlayers.length>1?calcTeamRank(gradePlayers,player.id):null;
  const save=()=>{
    const w=parseFloat(inp);if(isNaN(w)||w<30||w>200)return;
    const nm=dateMeasured?player.measurements.map(m=>m.date===recordDate?{...m,weight:w}:m):[...player.measurements,{date:recordDate,weight:w}].sort((a,b)=>a.date.localeCompare(b.date));
    onUpdate({...player,measurements:nm});setSaved(true);setInp("");
  };
  const recent=[...player.measurements].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8).reverse();
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
        <BackBtn onClick={onBack}/>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:18,fontWeight:800,color:TEXT}}>{player.name}</span>
            {/* 順位バッジ：全体・学年を1バッジにまとめて表示 */}
            {myRank&&players.length>1&&(
              <span style={{display:"inline-flex",flexDirection:"column",alignItems:"center",background:myRank<=3?GOLD:MAROON_L,border:`1px solid ${myRank<=3?GOLD:MAROON}`,borderRadius:10,padding:"2px 9px"}}>
                <span style={{fontSize:8,fontWeight:600,color:myRank<=3?TEXT:MAROON,opacity:0.75,letterSpacing:"0.03em"}}>目標達成率</span>
                <span style={{fontSize:11,fontWeight:800,color:myRank<=3?TEXT:MAROON,lineHeight:1.2,whiteSpace:"nowrap"}}>{myRank<=3?["🥇","🥈","🥉"][myRank-1]:""}全体{myRank}位{myGradeRank&&gradePlayers.length>1?`・${myGrade}年${myGradeRank}位`:""}</span>
              </span>
            )}
          </div>
          <div style={{fontSize:12,color:MUTED,marginTop:2}}>
            <span style={{fontWeight:700,color:TEXT}}>{player.position[0]||"未設定"}</span>
            {player.position.slice(1).length>0&&<span style={{color:MUTED2,fontSize:11}}>（メイン）{player.position.slice(1).map(sp=><span key={sp}>・{sp}</span>)}（サブ）</span>}
            {player.position.length===1&&<span style={{color:MUTED2,fontSize:11}}>（メイン）</span>}
            <span> ／ {player.height}cm ／ {calcAge(player.birthDate)}歳</span>
          </div>
          {/* Last measurement days ago (#8) */}
          {daysSinceLast!==null&&<div style={{fontSize:11,color:daysSinceLast>10?RED:MUTED,marginTop:2,fontWeight:daysSinceLast>10?700:400}}>
            {daysSinceLast===0?"✓ 本日記録済み":`前回計測：${daysSinceLast}日前（${lastDate&&new Date(lastDate).toLocaleDateString("ja-JP",{month:"numeric",day:"numeric"})}）`}
            {daysSinceLast>10&&" ⚠ 記録が空いています"}
          </div>}
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
          <Btn onClick={onEdit} color={MUTED} small>編集</Btn>
          {onSetMyPlayer&&(myPlayerId===player.id
            ?<button onClick={()=>onSetMyPlayer(null)} style={{fontSize:10,color:GREEN,fontWeight:700,background:"none",border:"none",cursor:"pointer",padding:"2px 4px",whiteSpace:"nowrap",fontFamily:"inherit"}}>✓ マイページ設定中</button>
            :<button onClick={()=>onSetMyPlayer(player.id)} style={{fontSize:10,color:MAROON,fontWeight:700,background:"none",border:"none",cursor:"pointer",padding:"2px 4px",whiteSpace:"nowrap",fontFamily:"inherit"}}>⭐ マイページに設定</button>
          )}
        </div>
      </div>

      {/* 体重入力（モバイル最優先・最上部） */}
      <Card style={{border:`2px solid ${isThursday()?MAROON:GOLD}`,background:isThursday()?MAROON_L:GOLD_L}}>
        <Label>{isThursday()?"📅 今日は計測日（木曜日）！":"⚖️ 体重を記録"}</Label>
        {saved&&<div style={{background:OK_BG,border:`1px solid ${OK_BRD}`,borderRadius:8,padding:"10px 14px",fontSize:14,color:GREEN,fontWeight:700,marginBottom:12}}>✓ 記録しました！</div>}
        {/* Date selector (#4 & #5 - improved labels) */}
        <div style={{marginBottom:8}}>
          <div style={{fontSize:11,color:MUTED,marginBottom:4}}>📅 記録日（入力忘れの場合は日付を変更できます）</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <input type="date" value={recordDate} onChange={e=>{setRecordDate(e.target.value);setSaved(false);}} style={{flex:1,padding:"12px 14px",borderRadius:10,fontSize:16,border:`1.5px solid ${BORDER}`,outline:"none",fontFamily:"inherit",color:TEXT,background:"#fff"}}/>
            {recordDate!==todayStr()&&<span style={{fontSize:11,color:"#7a5000",background:WN_BG,border:`1px solid ${WN_BRD}`,borderRadius:7,padding:"5px 9px",fontWeight:700,whiteSpace:"nowrap"}}>過去の日付</span>}
          </div>
        </div>
        {dateMeasured&&!saved&&<div style={{fontSize:12,color:MUTED,marginBottom:8}}>💡 {recordDate===todayStr()?"本日分":"この日付の記録（上書き更新されます）"}</div>}
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:12}}>
          <input type="number" inputMode="decimal" value={inp} placeholder="例：76.5" onChange={e=>{setInp(e.target.value);setSaved(false);}} style={{flex:1,fontSize:32,textAlign:"center",padding:"14px 12px",height:68,borderRadius:12,border:`2px solid ${inp?MAROON:BORDER}`,outline:"none",fontFamily:"inherit",color:TEXT,background:"#fff",boxSizing:"border-box"}}/>
          <span style={{color:MUTED,fontSize:20,fontWeight:700,flexShrink:0}}>kg</span>
        </div>
        <button onClick={save} disabled={!inp} style={{width:"100%",height:56,fontSize:18,fontWeight:800,borderRadius:12,background:inp?MAROON:"#ccc",color:"#fff",border:"none",cursor:inp?"pointer":"not-allowed",fontFamily:"inherit"}}>記録する</button>
        <div style={{fontSize:11,color:MUTED,marginTop:8,textAlign:"center"}}>毎週木曜日に計測してください</div>
      </Card>

      {/* ステータス */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <Label>現在の体重</Label>
            <div style={{fontSize:40,fontWeight:900,color:TEXT,lineHeight:1}}>{cw>0?cw:"—"}<span style={{fontSize:18,color:MUTED,marginLeft:4}}>kg</span></div>
            {pw!==null&&cw>0&&<div style={{fontSize:13,color:cw>=pw?GREEN:RED,marginTop:4,fontWeight:700}}>{cw>=pw?"▲":"▼"} {Math.abs(Math.round((cw-pw)*10)/10)} kg（前回比）</div>}
          </div>
          <div style={{background:sl.bg,border:`1px solid ${sl.brd}`,borderRadius:10,padding:"10px 16px",fontSize:14,fontWeight:700,color:sl.color}}>{sl.text}</div>
        </div>
      </Card>

      {/* やる気メッセージ */}
      <div style={{background:mot.color+"18",border:`1.5px solid ${mot.color}44`,borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:26,flexShrink:0}}>{mot.emoji}</span>
        <span style={{fontSize:14,fontWeight:600,color:mot.color,lineHeight:1.6}}>{mot.msg}</span>
      </div>

      {/* 目標 */}
      <Card>
        <Label>目標まであと（次：{goal.label}）</Label>
        <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:12}}>
          <div style={{flex:1,minWidth:120}}><div style={{fontSize:26,fontWeight:800,color:MAROON}}>{goal.target} kg</div><div style={{fontSize:13,color:TEXT}}>残り <strong>{goal.daysLeft}</strong> 日 ／ <strong>{goal.weeksLeft}</strong> 週</div></div>
          <div style={{flex:1,minWidth:120}}><div style={{fontSize:12,color:MUTED,marginBottom:2}}>必要なペース</div><div style={{fontSize:22,fontWeight:800,color:TEXT}}>+{goal.weeklyNeeded}<span style={{fontSize:13,color:MUTED}}> kg/週</span></div><div style={{fontSize:13,color:MUTED}}>月間 +{goal.monthlyNeeded} kg（{goal.monthlyRate}%）</div></div>
        </div>
        {cw>0&&goal.gainNeeded>0&&(()=>{
          const s=[...player.measurements].sort((a,b)=>a.date.localeCompare(b.date));
          const st2=s[0]?.weight??cw,pct=Math.min(100,Math.max(0,((cw-st2)/(goal.target-st2||1))*100));
          return<div><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:MUTED,marginBottom:3}}><span>開始 {st2} kg</span><span>目標 {goal.target} kg</span></div><div style={{height:10,background:BORDER,borderRadius:6,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:GREEN,borderRadius:6}}/></div><div style={{fontSize:11,color:MUTED,marginTop:2,textAlign:"right"}}>{Math.round(pct)}% 達成</div></div>;
        })()}
      </Card>

      {/* グラフ */}
      <Card><Label>体重グラフ</Label><WeightChart player={player}/></Card>

      {/* カロリーガイド + 食事レコメンド */}
      <Card>
        <Label>1日の目安カロリー（MET基準）</Label>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12}}>
          <div style={{flex:1,minWidth:140,background:MAROON_L,borderRadius:10,padding:"12px 14px",border:`1px solid ${NG_BRD}`}}>
            <div style={{fontSize:11,color:MUTED,marginBottom:2}}>練習日（MET {PRACTICE_MET}×{PRACTICE_HOURS}h）</div>
            <div style={{fontSize:28,fontWeight:900,color:MAROON}}>{kcal.practiceDay.toLocaleString()}</div>
            <div style={{fontSize:11,color:MUTED}}>kcal（日常活動・増量余剰含む）</div>
          </div>
          <div style={{flex:1,minWidth:140,background:GOLD_L,borderRadius:10,padding:"12px 14px",border:`1px solid ${GOLD}`}}>
            <div style={{fontSize:11,color:MUTED,marginBottom:2}}>オフ日・筋トレ（MET {STRENGTH_MET}×{STRENGTH_HOURS}h）</div>
            <div style={{fontSize:28,fontWeight:900,color:"#8B5A00"}}>{kcal.offDay.toLocaleString()}</div>
            <div style={{fontSize:11,color:MUTED}}>kcal（日常活動・増量余剰含む）</div>
          </div>
        </div>
        <div style={{fontSize:11,color:MUTED2,lineHeight:1.8,background:"#f8f5ef",borderRadius:8,padding:"10px 12px",marginBottom:14}}>
          <div>BMR：{kcal.bmr.toLocaleString()} kcal ／ 練習消費：+{kcal.practiceExtra.toLocaleString()} kcal ／ 増量余剰：+{kcal.surplus.toLocaleString()} kcal/日</div>
          <div>日常活動（通学・体育週2-3回・勉強）：+{kcal.activity} kcal</div>
        </div>
        <FoodRecommendation practiceKcal={kcal.practiceDay} offKcal={kcal.offDay}/>
      </Card>

      {/* 履歴 */}
      {recent.length>0&&(
        <Card>
          <Label>記録履歴（直近8週）</Label>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {[...recent].reverse().map((m,i)=>{
              const pr=[...recent].reverse()[i+1];
              const diff=pr?Math.round((m.weight-pr.weight)*10)/10:null;
              return<div key={m.date} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",borderRadius:8,background:i===0?MAROON_L:"transparent",minHeight:44}}>
                <span style={{fontSize:13,color:MUTED}}>{new Date(m.date).toLocaleDateString("ja-JP",{month:"numeric",day:"numeric",weekday:"short"})}</span>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  {diff!==null&&<span style={{fontSize:12,color:diff>=0?GREEN:RED,fontWeight:700}}>{diff>=0?"▲":"▼"}{Math.abs(diff)}</span>}
                  <span style={{fontSize:16,fontWeight:800,color:TEXT}}>{m.weight} kg</span>
                </div>
              </div>;
            })}
          </div>
        </Card>
      )}

      {/* 目標体重 */}
      <Card>
        <Label>目標体重</Label>
        <div style={{display:"flex",gap:10}}>
          {[{label:"9月1日（夏大会）",v:player.targetWeightSep},{label:"4月1日（春大会）",v:player.targetWeightApr}].map(t=>(
            <div key={t.label} style={{flex:1,background:GOLD_L,borderRadius:10,padding:"12px 14px",border:`1px solid ${GOLD}`}}><div style={{fontSize:11,color:MUTED,marginBottom:2}}>{t.label}</div><div style={{fontSize:22,fontWeight:800,color:MAROON}}>{t.v} kg</div></div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ---- PIN ----
function PinScreen({title,pinCheck,onUnlock,onBack}:{title:string;pinCheck:(p:string)=>boolean;onUnlock:()=>void;onBack:()=>void;}){
  const[pin,setPin]=useState(""),[err,setErr]=useState(false);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><BackBtn onClick={onBack}/><span style={{fontSize:18,fontWeight:800,color:TEXT}}>{title}</span></div>
      <Card><Label>PINコードを入力</Label><TInput value={pin} onChange={v=>{setPin(v);setErr(false);}} type="password" placeholder="4桁のPIN"/>{err&&<div style={{fontSize:13,color:RED,marginTop:8,fontWeight:600}}>PINが違います</div>}<div style={{marginTop:14}}><Btn onClick={()=>{if(pinCheck(pin))onUnlock();else{setErr(true);setPin("");}}} disabled={pin.length<4} fullWidth>確認</Btn></div></Card>
    </div>
  );
}

// ---- Manager Bulk ----
function ManagerBulkScreen({players,onSave,onBack}:{players:Player[];onSave:(u:Player[])=>void;onBack:()=>void;}){
  const today=todayStr();
  const sorted=sortByGrade(players);
  const init=()=>{const m:Record<string,string>={};players.forEach(p=>{const e=p.measurements.find(x=>x.date===today);if(e)m[p.id]=String(e.weight);});return m;};
  const[weights,setW]=useState<Record<string,string>>(init);
  const[savedCount,setSC]=useState<number|null>(null);
  const filled=Object.values(weights).filter(w=>w&&!isNaN(parseFloat(w))).length;
  const saveAll=()=>{
    let upd=[...players];let cnt=0;
    Object.entries(weights).forEach(([id,ws])=>{
      const w=parseFloat(ws);if(isNaN(w)||w<30||w>200)return;
      const idx=upd.findIndex(p=>p.id===id);if(idx<0)return;
      const p=upd[idx];
      const nm=p.measurements.some(m=>m.date===today)?p.measurements.map(m=>m.date===today?{...m,weight:w}:m):[...p.measurements,{date:today,weight:w}].sort((a,b)=>a.date.localeCompare(b.date));
      upd[idx]={...p,measurements:nm};cnt++;
    });
    onSave(upd);setSC(cnt);
  };
  let lastGrade=-1;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><BackBtn onClick={onBack}/><div><div style={{fontSize:18,fontWeight:800,color:TEXT}}>マネージャー：一括記録</div><div style={{fontSize:12,color:MUTED}}>{today}（{isThursday()?"木曜・計測日":"通常日"}）</div></div></div>
      {savedCount!==null&&<div style={{background:OK_BG,border:`1px solid ${OK_BRD}`,borderRadius:10,padding:"12px 16px",fontSize:14,color:GREEN,fontWeight:700}}>✓ {savedCount}人分の体重を保存しました！</div>}
      {isThursday()&&savedCount===null&&<div style={{background:WN_BG,border:`1px solid ${WN_BRD}`,borderRadius:10,padding:"12px 16px",fontSize:14,color:"#7a5000",fontWeight:700}}>📅 今日は計測日（木曜日）です！</div>}
      {players.length===0?<Card><div style={{textAlign:"center",color:MUTED,fontSize:14,padding:"20px 0"}}>選手が登録されていません</div></Card>:(
        <Card style={{padding:"14px 16px"}}>
          <div style={{display:"flex",gap:8,fontSize:11,color:MUTED,fontWeight:700,paddingBottom:8,borderBottom:`1px solid ${BORDER}`,marginBottom:8}}><div style={{flex:2}}>名前</div><div style={{width:52}}>POS</div><div style={{width:54,textAlign:"right"}}>前回</div><div style={{width:108}}>今週の体重</div></div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {sorted.map(p=>{
              const lw=latestWeight(p);const f=weights[p.id]&&!isNaN(parseFloat(weights[p.id]));
              const grade=calcGrade(p.birthDate);const showHeader=grade!==lastGrade;lastGrade=grade;
              return(
              <div key={p.id}>
                {showHeader&&<div style={{fontSize:11,fontWeight:800,color:MAROON,letterSpacing:"0.06em",paddingTop:showHeader&&grade<3?8:0,paddingBottom:4,borderTop:grade<3?`1px dashed ${BORDER}`:"none",marginTop:grade<3?4:0}}>{grade}年生</div>}
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{flex:2,fontSize:14,fontWeight:600,color:TEXT,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{p.name}</div>
                  <div style={{width:52,fontSize:11,color:MUTED,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{p.position[0]||"—"}{p.position.length>1&&<span style={{color:MUTED2}}>+{p.position.length-1}</span>}</div>
                  <div style={{width:54,fontSize:12,color:MUTED2,textAlign:"right"}}>{lw!==null?`${lw}`:"—"}</div>
                  <div style={{width:108,display:"flex",alignItems:"center",gap:4}}>
                    <input type="number" inputMode="decimal" value={weights[p.id]??""} placeholder={lw!==null?String(lw):"体重"} onChange={e=>{setW({...weights,[p.id]:e.target.value});setSC(null);}} style={{width:76,padding:"10px 8px",borderRadius:8,fontSize:16,border:`1.5px solid ${f?MAROON:BORDER}`,outline:"none",fontFamily:"inherit",background:f?MAROON_L:"#f8f5ef",color:TEXT,boxSizing:"border-box" as const}}/>
                    <span style={{fontSize:11,color:MUTED}}>kg</span>
                  </div>
                </div>
              </div>
            );})}
          </div>
        </Card>
      )}
      <Btn onClick={saveAll} disabled={filled===0} color={GREEN} fullWidth>{filled>0?`${filled}人分を一括保存`:"体重を入力してください"}</Btn>
      <div style={{fontSize:11,color:MUTED2,textAlign:"center"}}>空欄の選手はスキップされます</div>
    </div>
  );
}

// ---- Coach Dashboard ----
function CoachScreen({players,onBack,onPlayerClick,onDelete}:{players:Player[];onBack:()=>void;onPlayerClick:(p:Player)=>void;onDelete:(id:string)=>void;}){
  const[sortKey,setSortKey]=useState<SortKey>("grade");
  const[sortDir,setSortDir]=useState<SortDir>("desc"); // 学年デフォルト：3年→1年
  const[delId,setDelId]=useState<string|null>(null);
  const handleSort=(key:SortKey)=>{if(key===sortKey)setSortDir(d=>d==="asc"?"desc":"asc");else{setSortKey(key);setSortDir("asc");}};
  const sorted=sortPlayers(players,sortKey,sortDir);
  const rkPos=(pos:string[])=>{if(!pos.length)return POS_ORDER.length;const idx=POS_ORDER.indexOf(pos[0]);return idx>=0?idx:POS_ORDER.length;};
  let lastPosGroup="";
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><BackBtn onClick={onBack}/><span style={{fontSize:18,fontWeight:800,color:TEXT}}>コーチ：全選手一覧</span></div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {SORT_OPTIONS.map(opt=>{const ac=opt.key===sortKey;return(
          <button key={opt.key} onClick={()=>handleSort(opt.key)} style={{padding:"7px 13px",borderRadius:20,fontSize:12,fontWeight:ac?700:400,background:ac?MAROON:"transparent",color:ac?"#fff":MUTED,border:`1px solid ${ac?MAROON:BORDER}`,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",minHeight:40}}>
            {opt.label}{ac?(sortDir==="asc"?" ↑":" ↓"):""}
          </button>);})}
      </div>
      {sorted.length===0?<Card><div style={{textAlign:"center",color:MUTED,fontSize:14,padding:"20px 0"}}>選手が登録されていません</div></Card>:
        sorted.map(p=>{
          const cw=latestWeight(p)??0,g=calcGoalInfo(p,cw),sl=statusStyle(calcStatus(p,g));
          const lastDate=[...p.measurements].sort((a,b)=>b.date.localeCompare(a.date))[0]?.date;
          const daysSince=lastDate?Math.round((Date.now()-new Date(lastDate).getTime())/86400000):null;
          const isDeleting=delId===p.id;
          // 実際の月間増加率
          const ms=[...p.measurements].sort((a,b)=>a.date.localeCompare(b.date));
          let actualGain:number|null=null;
          if(ms.length>=2){
            const days=Math.max(1,Math.round((new Date(ms[ms.length-1].date).getTime()-new Date(ms[0].date).getTime())/86400000));
            actualGain=Math.round((ms[ms.length-1].weight-ms[0].weight)/days*30*10)/10;
          }
          const gainColor=actualGain===null?MUTED:g.monthlyNeeded<=0?GREEN:actualGain>=g.monthlyNeeded?GREEN:actualGain>=g.monthlyNeeded*0.4?"#a07000":RED;
          // ポジション区切り
          const posIdx=rkPos(p.position);
          const posGroup=posIdx<POS_ORDER.length?POS_ORDER[posIdx]:"未設定";
          const showPosHeader=sortKey==="position"&&posGroup!==lastPosGroup;
          lastPosGroup=posGroup;
          return(
            <div key={p.id}>
              {showPosHeader&&(
                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,marginBottom:2}}>
                  <div style={{height:1,flex:1,background:BORDER}}/>
                  <span style={{fontSize:11,fontWeight:800,color:MAROON,letterSpacing:"0.1em",padding:"0 4px"}}>{posGroup}</span>
                  <div style={{height:1,flex:1,background:BORDER}}/>
                </div>
              )}
              <div style={{background:CARD,border:`1px solid ${isDeleting?RED:sl.brd}`,borderRadius:12,overflow:"hidden"}}>
                <div style={{padding:"14px 16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <button onClick={()=>onPlayerClick(p)} style={{flex:1,background:"none",border:"none",textAlign:"left",cursor:"pointer",fontFamily:"inherit",padding:0}}>
                      <div style={{fontSize:15,fontWeight:700,color:TEXT}}>{p.name}
                        <span style={{fontSize:12,fontWeight:400,marginLeft:8}}>
                          <span style={{color:MUTED,fontWeight:700}}>{p.position[0]||"未設定"}</span>
                          {p.position.slice(1).map(sp=><span key={sp} style={{color:MUTED2}}>{"・"+sp}</span>)}
                          <span style={{color:MUTED}}> ／ {calcAge(p.birthDate)}歳</span>
                        </span>
                      </div>
                      <div style={{fontSize:13,color:TEXT,marginTop:3}}>現在 <strong>{cw||"未計測"}</strong>{cw?" kg":""}{cw>0&&<> → 目標 <strong style={{color:MAROON}}>{g.target} kg</strong>（{g.label}）</>}</div>
                      <div style={{fontSize:12,color:MUTED,marginTop:1}}>
                        {cw>0?<>
                          あと {g.gainNeeded} kg ／ 実績 <strong style={{color:gainColor}}>{actualGain!==null?`${actualGain>=0?"+":""}${actualGain}kg/月`:"記録不足"}</strong>
                          <span style={{marginLeft:6}}>（必要 +{g.monthlyNeeded}kg/月）</span>
                        </>:"体重未記録"}
                      </div>
                      {daysSince!==null&&daysSince>10&&<div style={{fontSize:11,color:RED,marginTop:2,fontWeight:600}}>⚠ {daysSince}日間未記録</div>}
                    </button>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,marginLeft:8}}>
                      <div style={{background:sl.bg,border:`1px solid ${sl.brd}`,borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:700,color:sl.color,whiteSpace:"nowrap"}}>{sl.text}</div>
                      <button onClick={()=>setDelId(isDeleting?null:p.id)} style={{background:"none",border:`1px solid ${NG_BRD}`,borderRadius:6,padding:"6px 10px",fontSize:11,color:RED,cursor:"pointer",fontFamily:"inherit",minHeight:36}}>
                        {isDeleting?"キャンセル":"削除"}
                      </button>
                    </div>
                  </div>
                </div>
                {isDeleting&&(<div style={{background:NG_BG,borderTop:`1px solid ${NG_BRD}`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}><span style={{fontSize:13,color:RED,fontWeight:600}}>⚠ {p.name}のデータを全て削除します。元に戻せません。</span><button onClick={()=>{onDelete(p.id);setDelId(null);}} style={{padding:"9px 18px",borderRadius:8,background:RED,color:"#fff",border:"none",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",minHeight:44}}>完全削除</button></div>)}
              </div>
            </div>
          );
        })}
    </div>
  );
}

// ---- App PIN Screen ----
function AppPinScreen({onSuccess}:{onSuccess:()=>void}){
  const[pin,setPin]=useState("");
  const[err,setErr]=useState(false);
  const[checking,setChecking]=useState(false);
  const MAX=4;

  const submit=(p:string)=>{
    setChecking(true);
    // 短いディレイで視覚的フィードバック
    setTimeout(()=>{
      const cur=localStorage.getItem("af_app_pin")||DEFAULT_APP_PIN;
      if(p===cur){
        localStorage.setItem("af_auth_ok","1");
        onSuccess();
      }else{
        setErr(true);
        setPin("");
        setChecking(false);
      }
    },250);
  };

  const addDigit=(d:string)=>{
    if(checking)return;
    setErr(false);
    const next=pin+d;
    if(next.length>MAX)return;
    setPin(next);
    if(next.length===MAX)submit(next);
  };

  const delDigit=()=>{
    if(checking)return;
    setErr(false);
    setPin(p=>p.slice(0,-1));
  };

  const NUMS=["1","2","3","4","5","6","7","8","9","","0","⌫"];

  return(
    <div style={{minHeight:"100vh",background:MAROON,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:"0 24px",userSelect:"none" as const}}>
      {/* ロゴ */}
      <div style={{textAlign:"center",marginBottom:44}}>
        <div style={{fontSize:52,marginBottom:8}}>🦉</div>
        <div style={{fontSize:26,fontWeight:900,color:GOLD,letterSpacing:"0.1em",lineHeight:1}}>NISHI OWLS</div>
        <div style={{fontSize:11,color:"#FFE8A0",letterSpacing:"0.08em",marginTop:6}}>都立西高アメリカンフットボール部</div>
        <div style={{height:1,background:GOLD,opacity:0.3,margin:"10px 60px 0"}}/>
      </div>
      {/* PINドット */}
      <div style={{display:"flex",gap:16,marginBottom:10}}>
        {Array.from({length:MAX}).map((_,i)=>(
          <div key={i} style={{width:18,height:18,borderRadius:9,
            border:`2px solid ${err?"#FF8090":GOLD}`,
            background:i<pin.length?(err?"#FF8090":GOLD):"transparent",
            transition:"background 0.12s,border-color 0.12s"
          }}/>
        ))}
      </div>
      <div style={{minHeight:22,marginBottom:20,textAlign:"center"}}>
        {err&&<span style={{color:"#FF8090",fontSize:13,fontWeight:700}}>PINが違います。もう一度入力してください</span>}
        {!err&&<span style={{color:"rgba(255,255,255,0.45)",fontSize:12}}>PINコードを入力</span>}
      </div>
      {/* 数字キーパッド */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,width:"100%",maxWidth:260}}>
        {NUMS.map((k,i)=>{
          if(k==="")return<div key={i}/>;
          const isDel=k==="⌫";
          return(
            <button key={i} onClick={()=>isDel?delDigit():addDigit(k)}
              style={{height:68,borderRadius:34,
                border:`1.5px solid ${isDel?"rgba(255,255,255,0.18)":"rgba(201,162,39,0.45)"}`,
                background:isDel?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.11)",
                color:"#fff",fontSize:isDel?22:26,fontWeight:700,
                cursor:"pointer",fontFamily:"inherit",
                WebkitTapHighlightColor:"transparent" as unknown as string,
                display:"flex",alignItems:"center",justifyContent:"center"}}>
              {k}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- PIN Change Modal ----
function PinChangeModal({onClose,onPinChanged}:{onClose:()=>void;onPinChanged:()=>void}){
  const[step,setStep]=useState<1|2>(1);
  const[adminPw,setAdminPw]=useState("");
  const[showPw,setShowPw]=useState(false);
  const[adminErr,setAdminErr]=useState(false);
  const[newPin,setNewPin]=useState("");
  const[confirmPin,setConfirmPin]=useState("");
  const[pinErr,setPinErr]=useState("");
  const[done,setDone]=useState(false);

  const checkAdmin=()=>{
    const pw=localStorage.getItem("af_admin_pw")||DEFAULT_ADMIN_PW;
    if(adminPw===pw){setStep(2);setAdminErr(false);}
    else{setAdminErr(true);setAdminPw("");}
  };

  const savePin=()=>{
    if(newPin.length<4){setPinErr("PINは4桁以上の数字で入力してください");return;}
    if(!/^\d+$/.test(newPin)){setPinErr("PINは数字のみで入力してください");return;}
    if(newPin!==confirmPin){setPinErr("確認用PINが一致しません");return;}
    localStorage.setItem("af_app_pin",newPin);
    localStorage.removeItem("af_auth_ok");
    setDone(true);
  };

  const overlayStyle:React.CSSProperties={position:"fixed",inset:0,
    background:"rgba(0,0,0,0.65)",zIndex:500,
    display:"flex",alignItems:"center",justifyContent:"center",padding:20};
  const boxStyle:React.CSSProperties={background:CARD,borderRadius:16,
    padding:"24px 20px",width:"100%",maxWidth:340,
    boxShadow:"0 8px 40px rgba(0,0,0,0.4)"};
  const cancelBtnStyle:React.CSSProperties={flex:1,minHeight:50,borderRadius:10,
    background:"transparent",border:`1px solid ${BORDER}`,color:MUTED,
    fontSize:14,cursor:"pointer",fontFamily:"inherit"};
  const actionBtnStyle=(disabled:boolean):React.CSSProperties=>({flex:2,minHeight:50,borderRadius:10,
    background:disabled?"#ccc":MAROON,color:"#fff",border:"none",
    fontSize:15,fontWeight:700,cursor:disabled?"not-allowed":"pointer",fontFamily:"inherit"});

  return(
    <div style={overlayStyle} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={boxStyle}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <span style={{fontSize:16,fontWeight:800,color:TEXT}}>🔐 PIN変更</span>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:24,cursor:"pointer",color:MUTED,padding:"0 4px",lineHeight:1}}>×</button>
        </div>

        {done?(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{background:OK_BG,border:`1px solid ${OK_BRD}`,borderRadius:10,
              padding:"14px 16px",fontSize:14,color:GREEN,fontWeight:700,lineHeight:1.7}}>
              ✓ PINを変更しました。<br/>新しいPINで再ログインしてください。
            </div>
            <button onClick={onPinChanged} style={{...actionBtnStyle(false),flex:undefined,width:"100%"}}>
              閉じて再ログイン
            </button>
          </div>
        ):step===1?(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{fontSize:13,color:MUTED,lineHeight:1.6}}>管理者パスワードを入力してください</div>
            <div style={{position:"relative"}}>
              <TInput value={adminPw} onChange={v=>{setAdminPw(v);setAdminErr(false);}}
                type={showPw?"text":"password"} placeholder="管理者パスワード"/>
              <button onClick={()=>setShowPw(s=>!s)}
                style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
                  background:"none",border:"none",cursor:"pointer",color:MUTED,fontSize:12,padding:"4px 6px",fontFamily:"inherit"}}>
                {showPw?"隠す":"表示"}
              </button>
            </div>
            {adminErr&&<div style={{fontSize:13,color:RED,fontWeight:600}}>パスワードが違います</div>}
            <div style={{display:"flex",gap:8}}>
              <button onClick={onClose} style={cancelBtnStyle}>キャンセル</button>
              <button onClick={checkAdmin} disabled={!adminPw} style={actionBtnStyle(!adminPw)}>次へ →</button>
            </div>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{fontSize:13,color:MUTED,lineHeight:1.6}}>新しいPINを設定してください（数字4桁以上）</div>
            <div><Label>新しいPIN</Label>
              <TInput value={newPin} onChange={v=>{setNewPin(v);setPinErr("");}} type="tel" placeholder="数字で入力"/>
            </div>
            <div><Label>確認用PIN</Label>
              <TInput value={confirmPin} onChange={v=>{setConfirmPin(v);setPinErr("");}} type="tel" placeholder="もう一度入力"/>
            </div>
            {pinErr&&<div style={{fontSize:13,color:RED,fontWeight:600}}>{pinErr}</div>}
            <div style={{display:"flex",gap:8}}>
              <button onClick={onClose} style={cancelBtnStyle}>キャンセル</button>
              <button onClick={savePin} disabled={!newPin||!confirmPin} style={actionBtnStyle(!newPin||!confirmPin)}>変更する</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Home ----
function HomeScreen({onPlayer,onManager,onCoach,onDemo,showDemo,myPlayer,onMyPage}:{
  onPlayer:()=>void;onManager:()=>void;onCoach:()=>void;onDemo:()=>void;showDemo:boolean;
  myPlayer?:Player;onMyPage?:()=>void;
}){
  const[notifPerm,setNotifPerm]=useState<string>("default");
  const[notifDone,setNotifDone]=useState(false);
  useEffect(()=>{if(typeof window!=="undefined"&&"Notification"in window)setNotifPerm(Notification.permission);},[]);
  const requestNotif=async()=>{
    if(typeof window==="undefined"||!("Notification"in window))return;
    const perm=await Notification.requestPermission();
    setNotifPerm(perm);setNotifDone(true);
    if(perm==="granted"){
      new Notification("🦉 NISHI OWLS",{body:"木曜日にアプリを開くと計測リマインダーが届きます！",icon:"/favicon.ico"});
    }
  };
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* OWLS Header */}
      <div style={{background:MAROON,borderRadius:20,padding:"28px 20px 24px",textAlign:"center",boxShadow:`0 6px 24px ${MAROON}55`}}>
        <div style={{fontSize:52,marginBottom:4}}>🦉</div>
        <div style={{fontSize:28,fontWeight:900,color:GOLD,letterSpacing:"0.1em",lineHeight:1}}>NISHI OWLS</div>
        <div style={{fontSize:12,color:"#FFE8A0",letterSpacing:"0.08em",marginTop:6}}>都立西高アメリカンフットボール部</div>
        <div style={{height:1,background:GOLD,opacity:0.3,margin:"10px 40px"}}/>
        <div style={{fontSize:11,color:"#FFD070",letterSpacing:"0.06em"}}>体重管理システム</div>
      </div>
      {/* マイページショートカット */}
      {myPlayer&&onMyPage&&(
        <button onClick={onMyPage} style={{minHeight:76,borderRadius:16,background:`linear-gradient(135deg,${MAROON} 60%,#B02438)`,border:"none",fontSize:16,fontWeight:800,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",gap:16,padding:"0 20px",boxShadow:`0 6px 24px ${MAROON}55`,fontFamily:"inherit",position:"relative",overflow:"hidden"}}>
          <span style={{fontSize:36}}>👤</span>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:11,color:"#FFD070",fontWeight:600,letterSpacing:"0.06em",marginBottom:2}}>マイページ</div>
            <div style={{fontSize:19,fontWeight:900,color:"#fff"}}>{myPlayer.name}</div>
            <div style={{fontSize:11,color:"#FFB0BC",marginTop:1}}>{myPlayer.position[0]||""} ／ 最新 {latestWeight(myPlayer)??"-"} kg</div>
          </div>
          <span style={{marginLeft:"auto",fontSize:22,opacity:0.7}}>›</span>
        </button>
      )}
      {/* Action buttons */}
      <button onClick={onPlayer} style={{minHeight:70,borderRadius:14,background:GOLD,border:"none",fontSize:17,fontWeight:800,cursor:"pointer",color:TEXT,display:"flex",alignItems:"center",justifyContent:"center",gap:12,boxShadow:`0 4px 16px ${GOLD}66`,fontFamily:"inherit"}}>
        <span style={{fontSize:34}}>🏋️</span>
        <div style={{textAlign:"left"}}><div>選手として記録する</div><div style={{fontSize:12,fontWeight:500,color:MUTED,marginTop:2}}>体重を入力・自分の進捗を確認</div></div>
      </button>
      <button onClick={onManager} style={{minHeight:64,borderRadius:14,background:"#fff",border:`2px solid ${MAROON}`,fontSize:16,fontWeight:700,cursor:"pointer",color:MAROON,display:"flex",alignItems:"center",justifyContent:"center",gap:12,fontFamily:"inherit"}}>
        <span style={{fontSize:28}}>📝</span>
        <div style={{textAlign:"left"}}><div>マネージャー：一括記録</div><div style={{fontSize:12,fontWeight:500,color:MUTED,marginTop:1}}>全選手の体重を一括入力</div></div>
      </button>
      <button onClick={onCoach} style={{minHeight:64,borderRadius:14,background:MAROON_L,border:`2px solid ${MAROON}`,fontSize:16,fontWeight:700,cursor:"pointer",color:MAROON,display:"flex",alignItems:"center",justifyContent:"center",gap:12,fontFamily:"inherit"}}>
        <span style={{fontSize:28}}>📋</span>
        <div style={{textAlign:"left"}}><div>コーチ：全体確認</div><div style={{fontSize:12,fontWeight:500,color:MUTED,marginTop:1}}>🔒 PIN: 選手管理・ソート・削除</div></div>
      </button>
      {/* Thursday notification (#10) */}
      {notifPerm!=="granted"&&!notifDone&&(
        <button onClick={requestNotif} style={{minHeight:52,borderRadius:12,background:"transparent",border:`1.5px solid #2563EB`,color:"#2563EB",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <span style={{fontSize:20}}>🔔</span>
          <div style={{textAlign:"left"}}><div>木曜日の計測リマインダーを受け取る</div><div style={{fontSize:11,fontWeight:400,opacity:0.8}}>アプリを開いたとき通知が届きます</div></div>
        </button>
      )}
      {(notifPerm==="granted"||notifDone)&&(
        <div style={{fontSize:12,color:GREEN,textAlign:"center",fontWeight:600}}>✓ 通知設定済み（木曜日にアプリを開くとリマインダーが届きます）</div>
      )}
      {notifPerm==="denied"&&(
        <div style={{fontSize:11,color:MUTED,textAlign:"center"}}>通知はブラウザ設定からオンにできます</div>
      )}
      {showDemo&&(
        <button onClick={onDemo} style={{minHeight:52,borderRadius:12,background:"transparent",border:`2px dashed ${GOLD}`,fontSize:14,color:"#8B5A00",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
          🎮 デモデータ（30人）を読み込む
        </button>
      )}
      <div style={{fontSize:11,color:MUTED2,textAlign:"center"}}>NISHI OWLS © 2026</div>
    </div>
  );
}

// ---- Main App ----
export default function WeightApp(){
  const[screen,setScreen]=useState<Screen>("home");
  const[players,setPlayers]=useState<Player[]>([]);
  const[selected,setSelected]=useState<Player|null>(null);
  const[coachOK,setCoachOK]=useState(false);
  const[prevScreen,setPrevScreen]=useState<Screen>("player_list");
  const[myPlayerId,setMyPlayerIdState]=useState<string|null>(null);
  // 認証状態：null=確認中, false=未認証, true=認証済み
  const[authed,setAuthed]=useState<boolean|null>(null);
  const[showPinModal,setShowPinModal]=useState(false);
  const txRef=useRef(0);
  const tyRef=useRef(0);

  useEffect(()=>{
    try{
      // 認証チェック
      const ok=localStorage.getItem("af_auth_ok");
      setAuthed(ok==="1");
      const raw=localStorage.getItem("af_weight_players");
      if(raw)setPlayers((JSON.parse(raw) as any[]).map(migratePlayer));
      const myId=localStorage.getItem("af_my_player");
      if(myId)setMyPlayerIdState(myId);
    }catch{setAuthed(false);}
    if(typeof window!=="undefined"&&"serviceWorker"in navigator){
      navigator.serviceWorker.register("/sw.js").then(reg=>{
        if(isThursday()&&"Notification"in window&&Notification.permission==="granted"){
          reg.showNotification("🦉 NISHI OWLS - 今日は計測日！",{body:"体重を記録しましょう！毎週木曜が計測日です。",tag:"thursday-reminder",icon:"/favicon.ico"});
        }
      }).catch(()=>{});
    }
  },[]);

  // 画面遷移時にスクロールトップ
  useEffect(()=>{if(typeof window!=="undefined")window.scrollTo(0,0);},[screen]);

  const save=(updated:Player[])=>{setPlayers(updated);localStorage.setItem("af_weight_players",JSON.stringify(updated));};
  const cur=(p:Player)=>players.find(x=>x.id===p.id)??p;
  const goDetail=(p:Player,from:Screen)=>{setSelected(p);setPrevScreen(from);setScreen("player_detail");};
  const loadDemo=()=>{save(buildDemoPlayers());setScreen("player_list");};
  const setMyPlayer=(id:string|null)=>{
    setMyPlayerIdState(id);
    if(id)localStorage.setItem("af_my_player",id);
    else localStorage.removeItem("af_my_player");
  };
  const myPlayer=players.find(p=>p.id===myPlayerId)??null;

  // 統合「戻る」ナビゲーション
  const goBack=()=>{
    switch(screen){
      case"player_list":case"coach_pin":case"manager_bulk":setScreen("home");break;
      case"player_new":setScreen("player_list");break;
      case"player_edit":setScreen("player_detail");break;
      case"player_detail":case"team_ranking":setScreen(prevScreen);break;
      case"coach_dashboard":setScreen("home");break;
      default:break;
    }
  };

  // スワイプで戻る（右スワイプ80px以上・横方向が主体）
  const onTouchStart=(e:React.TouchEvent)=>{txRef.current=e.touches[0].clientX;tyRef.current=e.touches[0].clientY;};
  const onTouchEnd=(e:React.TouchEvent)=>{
    if(screen==="home")return;
    const dx=e.changedTouches[0].clientX-txRef.current;
    const dy=e.changedTouches[0].clientY-tyRef.current;
    if(dx>80&&Math.abs(dx)>Math.abs(dy)*1.5)goBack();
  };

  // 認証確認中はなにも描画しない（画面フラッシュ防止）
  if(authed===null)return null;
  // 未認証はPIN入力画面のみ表示
  if(!authed)return<AppPinScreen onSuccess={()=>setAuthed(true)}/>;

  return(
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
      style={{background:BG,minHeight:"100vh",fontFamily:"'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif"}}>
      <div style={{maxWidth:560,margin:"0 auto",padding:"16px 16px 100px"}}>
        {screen==="home"&&<HomeScreen onPlayer={()=>setScreen("player_list")} onManager={()=>setScreen("manager_bulk")} onCoach={()=>coachOK?setScreen("coach_dashboard"):setScreen("coach_pin")} onDemo={loadDemo} showDemo={players.length===0} myPlayer={myPlayer??undefined} onMyPage={myPlayer?()=>goDetail(myPlayer,"home"):undefined}/>}
        {screen==="player_list"&&<PlayerListScreen players={players} onSelect={p=>goDetail(p,"player_list")} onNew={()=>setScreen("player_new")} onBack={goBack} onRanking={()=>{setPrevScreen("player_list");setScreen("team_ranking");}} myPlayerId={myPlayerId??undefined}/>}
        {screen==="team_ranking"&&<TeamRankingScreen players={players} onBack={goBack} onSelect={p=>goDetail(p,"team_ranking")}/>}
        {screen==="player_new"&&(
          <PlayerFormScreen title="選手を登録" showWeight={true}
            onSave={d=>{const p:Player={id:Date.now().toString(),name:d.name,height:d.height,birthDate:d.birthDate,position:d.position,targetWeightSep:d.targetSep,targetWeightApr:d.targetApr,measurements:[{date:todayStr(),weight:d.weight??0}],foodLogs:[]};const upd=[...players,p];save(upd);setSelected(p);setScreen("player_detail");}}
            onBack={goBack}/>
        )}
        {screen==="player_edit"&&selected&&(
          <PlayerFormScreen title="選手情報を編集" showWeight={false}
            init={{name:selected.name,height:String(selected.height),birthDate:selected.birthDate,position:selected.position,targetSep:String(selected.targetWeightSep),targetApr:String(selected.targetWeightApr)}}
            onSave={d=>{const upd=players.map(p=>p.id===selected.id?{...p,name:d.name,height:d.height,birthDate:d.birthDate,position:d.position,targetWeightSep:d.targetSep,targetWeightApr:d.targetApr}:p);save(upd);setSelected(upd.find(p=>p.id===selected.id)??selected);setScreen("player_detail");}}
            onBack={goBack}/>
        )}
        {screen==="player_detail"&&selected&&(
          <PlayerDetailScreen player={cur(selected)} players={players} isCoach={coachOK}
            onBack={goBack} onEdit={()=>setScreen("player_edit")}
            onUpdate={upd=>{save(players.map(p=>p.id===upd.id?upd:p));setSelected(upd);}}
            myPlayerId={myPlayerId??undefined} onSetMyPlayer={setMyPlayer}/>
        )}
        {screen==="coach_pin"&&<PinScreen title="コーチ確認" pinCheck={p=>p===COACH_PIN} onUnlock={()=>{setCoachOK(true);setScreen("coach_dashboard");}} onBack={goBack}/>}
        {screen==="coach_dashboard"&&(<CoachScreen players={players} onBack={goBack} onPlayerClick={p=>goDetail(p,"coach_dashboard")} onDelete={id=>{const upd=players.filter(p=>p.id!==id);save(upd);}}/>)}
        {screen==="manager_bulk"&&<ManagerBulkScreen players={players} onSave={save} onBack={goBack}/>}
      </div>
      {/* 左下フローティング戻るボタン */}
      {screen!=="home"&&(
        <button onClick={goBack} aria-label="戻る"
          style={{position:"fixed",bottom:28,left:20,zIndex:200,width:52,height:52,borderRadius:26,
            background:MAROON,color:"#fff",border:"none",fontSize:22,cursor:"pointer",
            boxShadow:`0 4px 20px ${MAROON}55`,display:"flex",alignItems:"center",justifyContent:"center",
            fontFamily:"inherit",WebkitTapHighlightColor:"transparent"}}>←</button>
      )}
      {/* PIN変更リンク（トップページ右下・目立たないデザイン） */}
      {screen==="home"&&(
        <button onClick={()=>setShowPinModal(true)}
          style={{position:"fixed",bottom:14,right:14,zIndex:100,
            background:"none",border:"none",color:"rgba(0,0,0,0.22)",
            fontSize:10,cursor:"pointer",fontFamily:"inherit",
            padding:"8px 10px",lineHeight:1.4,textAlign:"right"}}>
          PIN変更<br/>（富岡のみ）
        </button>
      )}
      {showPinModal&&(
        <PinChangeModal
          onClose={()=>setShowPinModal(false)}
          onPinChanged={()=>{setAuthed(false);setShowPinModal(false);}}/>
      )}
    </div>
  );
}
