"use client";

import { useState, useEffect, useRef } from "react";
import { isSupabaseEnabled, cloudFetchPlayers, cloudSavePlayers, cloudDeletePlayer, cloudSeedSnapshot } from "@/lib/supabase";

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
interface FoodItem { name:string; kcal:number; type:"コンビニ"|"外食"|"自炊"; note?:string; detail?:string; p?:number; f?:number; c?:number; seasonal?:"🌸春"|"☀️夏"|"🍂秋"|"❄️冬"; }

// ---- 季節メニュー ----
const SUMMER_FOODS:FoodItem[]=[
  {name:"冷やし中華 + サラダチキン",kcal:560,type:"外食",p:34,f:10,c:86,seasonal:"☀️夏",note:"☀️ 夏季おすすめ",detail:"さっぱり食べられる夏の定番。鶏肉でタンパク質もしっかり補える"},
  {name:"冷麺 + ゆで卵2個 + 牛乳",kcal:600,type:"外食",p:32,f:12,c:88,seasonal:"☀️夏",note:"☀️ 夏季おすすめ",detail:"焼肉チェーンや専門店で。ゆで卵で追加タンパク質を"},
  {name:"ざるそば(大盛) + 鶏天ぷら",kcal:580,type:"外食",p:26,f:16,c:84,seasonal:"☀️夏",note:"☀️ 夏季おすすめ",detail:"そばはGI値が低く持続エネルギーに。天ぷらでカロリー・タンパク質UP"},
  {name:"冷やしうどん + かき揚げ + 鶏むすび",kcal:620,type:"外食",p:22,f:14,c:98,seasonal:"☀️夏",note:"☀️ 夏季おすすめ",detail:"うどんチェーンで手軽に。食欲が落ちる夏でも食べやすい"},
  {name:"冷しゃぶ丼 + 枝豆 + 豆腐",kcal:650,type:"自炊",p:40,f:16,c:82,seasonal:"☀️夏",note:"☀️ 夏季おすすめ",detail:"冷たい豚しゃぶ+たれで食欲増進。枝豆でビタミンB1も"},
  {name:"冷やしトマト + 白飯大盛り + 鶏そぼろ",kcal:640,type:"自炊",p:36,f:10,c:100,seasonal:"☀️夏",note:"☀️ 夏季おすすめ",detail:"リコピンで疲労回復サポート。鶏そぼろで手軽に高タンパク"},
];
const WINTER_FOODS:FoodItem[]=[
  {name:"肉まん2個 + コーンスープ + おにぎり",kcal:540,type:"コンビニ",p:20,f:14,c:82,seasonal:"❄️冬",note:"❄️ 冬季おすすめ",detail:"コンビニで温かく手軽に。練習後の体を温めながら補給"},
  {name:"焼き芋（大）+ プロテインシェイク",kcal:500,type:"コンビニ",p:24,f:4,c:90,seasonal:"❄️冬",note:"❄️ 冬季おすすめ",detail:"焼き芋はビタミンC・食物繊維豊富。自然な甘さで炭水化物補給"},
  {name:"豚肉の鍋定食（豚バラ・豆腐・白菜）",kcal:680,type:"外食",p:38,f:24,c:72,seasonal:"❄️冬",note:"❄️ 冬季おすすめ",detail:"体が温まり消化も良い。豆腐と豚肉で良質なタンパク質コンビ"},
  {name:"おでん大盛り（練り物・大根・卵）+ おにぎり2個",kcal:560,type:"コンビニ",p:26,f:8,c:84,seasonal:"❄️冬",note:"❄️ 冬季おすすめ",detail:"コンビニおでんで体を温めながら補給。練り物はタンパク質も豊富"},
  {name:"豚汁定食 + ご飯大盛り",kcal:700,type:"外食",p:30,f:20,c:96,seasonal:"❄️冬",note:"❄️ 冬季おすすめ",detail:"具だくさん豚汁で栄養バランスGOOD。寒い時期の定番高カロリー定食"},
  {name:"きりたんぽ鍋 or 寄せ鍋 + 白飯",kcal:720,type:"外食",p:42,f:18,c:88,seasonal:"❄️冬",note:"❄️ 冬季おすすめ",detail:"鍋は野菜・タンパク質・炭水化物が一度に摂れる完全食に近い"},
];
const SPRING_FOODS:FoodItem[]=[
  {name:"たけのこご飯 + 豚のしょうが焼き定食",kcal:720,type:"外食",p:36,f:20,c:96,seasonal:"🌸春",note:"🌸 春季おすすめ",detail:"春の旬食材。しょうがで代謝UP・消化促進。体作りの開始時期に"},
  {name:"春巻き + チャーハン大盛り",kcal:750,type:"外食",p:28,f:26,c:96,seasonal:"🌸春",note:"🌸 春季おすすめ",detail:"中華チェーンで手軽に高カロリー。春は食欲が出てきて増量に最適"},
  {name:"菜の花・アスパラ炒め + 鶏むね定食 + 白飯",kcal:640,type:"自炊",p:42,f:14,c:88,seasonal:"🌸春",note:"🌸 春季おすすめ",detail:"春野菜でビタミン・ミネラル補給。鶏むねで高タンパク低脂質"},
];
const FALL_FOODS:FoodItem[]=[
  {name:"栗ご飯 + 鶏の唐揚げ定食",kcal:760,type:"外食",p:38,f:22,c:100,seasonal:"🍂秋",note:"🍂 秋季おすすめ",detail:"秋の旬。栗はエネルギー源として優秀。唐揚げでタンパク質を"},
  {name:"さつまいも天丼 + 豚汁",kcal:730,type:"外食",p:24,f:20,c:110,seasonal:"🍂秋",note:"🍂 秋季おすすめ",detail:"さつまいもはビタミンCが豊富で免疫サポートに。秋の炭水化物強化"},
  {name:"きのこパスタ + チキングリル + サラダ",kcal:700,type:"外食",p:40,f:18,c:90,seasonal:"🍂秋",note:"🍂 秋季おすすめ",detail:"きのこはビタミンD・食物繊維が豊富。秋は大会前の体作り本番"},
  {name:"鮭の塩焼き定食 + ご飯大盛り + 芋煮",kcal:680,type:"外食",p:42,f:16,c:88,seasonal:"🍂秋",note:"🍂 秋季おすすめ",detail:"鮭はEPA・DHAが豊富で筋肉の炎症を抑える。秋の回復食に最適"},
];

/** 現在の季節の食事を日付ベースでランダム選択（1〜2品）*/
function getSeasonalFoods():FoodItem[]{
  const m=new Date().getMonth();
  const d=new Date().getDate();
  const pool=m>=5&&m<=7?SUMMER_FOODS:m>=11||m<=1?WINTER_FOODS:m>=2&&m<=4?SPRING_FOODS:FALL_FOODS;
  const i1=d%pool.length;
  const i2=(d+3)%pool.length;
  return i1===i2?[pool[i1]]:[pool[i1],pool[i2]];
}

const MAIN_FOODS:FoodItem[]=[
  {name:"おにぎり3個 + サラダチキン2個 + ゆで卵2個",kcal:750,type:"コンビニ",p:70,f:16,c:95,
   detail:"セブン・ファミマ・ローソン：おにぎり×3(約330円)+サラダチキン×2(約430円)+ゆで卵×2(約190円)≒950円"},
  {name:"唐揚げ弁当(大盛り) + 豚汁 + バナナ",kcal:850,type:"コンビニ",p:38,f:28,c:112,
   detail:"ファミマ「大盛り弁当」(約500円)+豚汁(220円)+バナナ(90円)≒810円"},
  {name:"幕の内弁当 + おにぎり2個 + 牛乳500ml",kcal:900,type:"コンビニ",p:44,f:22,c:128,
   detail:"幕の内弁当(550〜650円)+おにぎり×2(240円)+牛乳(140円)≒1,030円"},
  {name:"チキン南蛮弁当 + おにぎり + 牛乳500ml",kcal:820,type:"コンビニ",p:38,f:24,c:108,
   detail:"チキン南蛮弁当(580円)+おにぎり(120円)+牛乳500ml(140円)≒840円。タルタルソースでカロリーUP・卵でタンパク質も"},
  {name:"牛丼 特盛 + 半熟卵 + 味噌汁",kcal:890,type:"外食",p:40,f:30,c:118,
   note:"松屋・吉野家・すき家",detail:"松屋「牛めし特盛」560円+半熟卵80円+味噌汁無料≒640円"},
  {name:"カツカレー 大盛り",kcal:960,type:"外食",p:34,f:34,c:130,
   detail:"カレーチェーン・学食：約650〜850円。食べごたえ抜群の高カロリー"},
  {name:"ラーメン + 半チャーハン",kcal:900,type:"外食",p:28,f:35,c:118,
   detail:"ラーメン店の定番セット約900〜1,200円。二郎系は1杯で1,000kcal超も"},
  {name:"から揚げ定食 + ご飯大盛り + 汁物",kcal:780,type:"外食",p:40,f:28,c:96,
   detail:"松のや「ロースかつ定食」大盛り680円等。定食チェーンで700〜900円"},
  {name:"白米3杯 + 鶏むね肉200g + 野菜炒め",kcal:820,type:"自炊",p:58,f:12,c:124,
   detail:"鶏むね肉100g約60〜80円。食材費200〜300円でコスパ最高"},
  {name:"パスタ大盛り(ミートソース) + チキンソテー",kcal:790,type:"自炊",p:44,f:20,c:106,
   detail:"パスタ乾麺200g約60円+合いびき肉100g約100円。手軽に高カロリー"},
  {name:"ご飯大盛り + 納豆2パック + 卵3個 + 野菜",kcal:760,type:"自炊",p:44,f:20,c:100,
   detail:"納豆3パック100円+卵×3(70円)。高タンパク低コストの最強朝食"},
];

const PRE_PRACTICE_FOODS:FoodItem[]=[
  {name:"マルトデキストリン + プロテイン（水割り）",kcal:330,type:"自炊",p:25,f:2,c:55,
   note:"練習1〜2時間前【最推薦】",detail:"マルトデキストリン30g(約70円)+ホエイプロテイン1杯(約80円)+水400ml。消化が早く脂質ゼロ。練習前の王道エネルギー＆タンパク補給。Amazon等で1kgあたり500〜800円。"},
  {name:"バナナ2本 + ゆで卵2個",kcal:280,type:"コンビニ",p:14,f:10,c:48,
   note:"練習2〜3時間前",detail:"バナナ×2(約120円)+ゆで卵×2(約190円)≒310円。消化が良く素早いエネルギー補給"},
  {name:"おにぎり2個（梅・鮭等）",kcal:360,type:"コンビニ",p:10,f:4,c:74,
   note:"練習1〜2時間前",detail:"セブン「塩むすび」や「鮭」等 ×2(約220円)。脂質少なめで練習前に最適"},
  {name:"カロリーメイト4本 + スポドリ500ml",kcal:380,type:"コンビニ",p:8,f:12,c:62,
   note:"練習30分〜1時間前",detail:"カロリーメイト4本(278円)+スポドリ(160円)≒438円"},
  {name:"ウイダーinゼリー(エネルギー) + バナナ1本",kcal:260,type:"コンビニ",p:5,f:0,c:65,
   note:"練習直前30分以内",detail:"ウイダーinゼリー(200円)+バナナ(60円)≒260円。即座にエネルギー補給"},
  {name:"羊羹1本 + 水",kcal:170,type:"コンビニ",p:2,f:0,c:43,
   note:"練習直前の緊急補給",detail:"井村屋スポーツようかん(130円)。小さくて携帯しやすく即効性あり"},
  {name:"食パン2枚 + ピーナッツバター + 牛乳200ml",kcal:480,type:"自炊",p:20,f:18,c:62,
   note:"練習2〜3時間前の朝食",detail:"食パン2枚(約50円)+PB(約30円)+牛乳(約40円)≒120円。高カロリー朝食"},
];

const POST_PRACTICE_FOODS:FoodItem[]=[
  {name:"マルトデキストリン + プロテイン（水割り）",kcal:380,type:"自炊",p:25,f:2,c:63,
   note:"練習後30分以内【最推薦】",detail:"マルトデキストリン40g(約90円)+ホエイプロテイン1杯(約80円)+水400ml。ゴールデンタイムの最強リカバリー。糖質でインスリンを上げながらタンパク質を筋肉へ届ける。"},
  {name:"プロテイン(牛乳300ml割り) + バナナ1本",kcal:380,type:"自炊",p:30,f:10,c:50,
   note:"練習後30分以内",detail:"ホエイプロテイン1杯(約80円)+牛乳300ml(約60円)+バナナ(60円)≒200円。筋合成に最適"},
  {name:"サラダチキン2個 + おにぎり2個",kcal:580,type:"コンビニ",p:50,f:5,c:86,
   note:"練習後30分以内",detail:"サラダチキン×2(430円)+おにぎり×2(220円)≒650円。タンパク質と糖質のベストコンビ"},
  {name:"ゆで卵3個 + おにぎり2個 + スポドリ",kcal:520,type:"コンビニ",p:22,f:14,c:78,
   note:"練習後30〜60分",detail:"ゆで卵×3(285円)+おにぎり×2(220円)+スポドリ(160円)≒665円"},
  {name:"牛乳500ml + バナナ2本 + プロテインバー",kcal:550,type:"コンビニ",p:30,f:15,c:78,
   note:"練習後30〜60分",detail:"牛乳(140円)+バナナ×2(120円)+プロテインバー(200円)≒460円"},
  {name:"ヨーグルト(大) + グラノーラ + プロテイン",kcal:500,type:"自炊",p:30,f:12,c:70,
   note:"練習後1時間以内",detail:"ヨーグルト大(150円)+グラノーラ(約50円)+プロテイン(約80円)≒280円"},
  {name:"セブン「サラダチキン」+「金のビーフシチュー」+おにぎり",kcal:620,type:"コンビニ",p:44,f:18,c:80,
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
    measurements:makeDemoM(d.sw,d.wg,d.w,i),
  }));
}

// ---- Types ----
interface Measurement{date:string;weight:number;}
interface Constitution{
  bodyType:number;   // 太りやすさ 1-5 (1=増えにくい, 5=増えやすい)
  appetite:number;   // 食欲・食事量 1-5 (1=少食, 5=大食い)
  digestion:number;  // 胃腸の強さ 1-5 (1=弱い, 5=強い)
  sleep:number;      // 睡眠・回復力 1-5 (1=短い・浅い, 5=十分・ぐっすり)
}
type GoalType="bulk"|"recomp"|"cut";
interface Player{
  id:string;name:string;height:number;birthDate:string;position:string[];
  targetWeightSep:number;targetWeightApr:number;measurements:Measurement[];
  constitution?:Constitution;
  goalType?:GoalType;      // 目標タイプ（デフォルト=bulk）
  goalBulkTarget?:number;  // 増量目標体重（bulk時にコーチが手動設定）
  goalCutTarget?:number;   // 減量目標体重（cut時のみ使用）
  team?:number;            // チーム番号 1〜5（コンペティション用）
}
// ---- Team Colors ----
const TEAM_COLORS:{[k:number]:{color:string;bg:string;border:string}}={
  1:{color:"#B91C1C",bg:"#FFF5F5",border:"#FECACA"}, // 赤（薄）
  2:{color:"#1565C0",bg:"#EFF6FF",border:"#BFDBFE"}, // 青（薄）
  3:{color:"#15803D",bg:"#F0FFF4",border:"#BBF7D0"}, // 緑（薄）
  4:{color:"#92400E",bg:"#FEFCE8",border:"#FDE68A"}, // 黄（薄）
  5:{color:"#6B21A8",bg:"#FAF5FF",border:"#DDD6FE"}, // 紫（薄）
};
const TEAM_LABELS=["Team 1","Team 2","Team 3","Team 4","Team 5"];

type TrafficLight="green"|"yellow"|"red"|"start";
type SortKey="status"|"position"|"gain_rate"|"weight"|"name"|"grade"|"thursday"
           |"grade_weight"|"grade_status"|"grade_gain"|"position_weight"|"position_status"|"team";
type SortDir="asc"|"desc";
type Screen="home"|"player_list"|"player_new"|"player_edit"|"player_detail"|"coach_pin"|"coach_dashboard"|"manager_bulk"|"guide";

const POSITIONS=["QB","RB","WR","TE","OL","DL","DE","DT","LB","DB","CB","S","K/P","その他","未定"];
const POS_ORDER=[...POSITIONS,"未設定"];
const SORT_OPTIONS:{key:SortKey;label:string;compound?:boolean}[]=[
  // 単独ソート
  {key:"grade",label:"学年"},{key:"status",label:"ステータス"},{key:"thursday",label:"木曜未計測"},
  {key:"team",label:"チーム"},{key:"position",label:"ポジション"},{key:"gain_rate",label:"増加量"},{key:"weight",label:"体重"},{key:"name",label:"名前"},
  // 複合ソート（学年固定 + 第2キー切替）
  {key:"grade_weight",label:"学年 & 体重",compound:true},
  {key:"grade_status",label:"学年 & ステータス",compound:true},
  {key:"grade_gain",label:"学年 & 増加量",compound:true},
  // 複合ソート（POS固定 + 第2キー切替）
  {key:"position_weight",label:"POS & 体重",compound:true},
  {key:"position_status",label:"POS & ステータス",compound:true},
];

// ---- Utilities ----
const todayStr=()=>new Date().toISOString().split("T")[0];
const isThursday=()=>new Date().getDay()===4;

/** 直近の木曜日（今日が木曜なら今日）を YYYY-MM-DD で返す */
function lastThursdayStr():string{
  const d=new Date();d.setHours(0,0,0,0);
  const day=d.getDay(); // 0=日 ... 4=木 ... 6=土
  const back=day>=4?day-4:day+3; // 木曜まで何日遡るか
  d.setDate(d.getDate()-back);
  return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

/** 先週の木曜日（直近木曜の7日前）を YYYY-MM-DD で返す */
function lastWeekThursdayStr():string{
  const d=new Date(lastThursdayStr()+"T00:00:00");
  d.setDate(d.getDate()-7);
  return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

/** 選手の木曜日計測率を返す { measured, total, rate } */
function thursdayRate(p:Player):{measured:number;total:number;rate:number}{
  if(p.measurements.length===0)return{measured:0,total:0,rate:0};
  const dates=new Set(p.measurements.map(m=>m.date));
  // 初回計測日以降の全木曜をカウント
  const firstDate=new Date([...p.measurements].sort((a,b)=>a.date.localeCompare(b.date))[0].date+"T00:00:00");
  const start=new Date(firstDate);
  while(start.getDay()!==4)start.setDate(start.getDate()+1); // 最初の木曜へ
  const last=new Date(lastThursdayStr()+"T00:00:00");
  if(start>last)return{measured:0,total:0,rate:0};
  let total=0,measured=0;
  const d=new Date(start);
  while(d<=last){
    total++;
    const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    if(dates.has(ds))measured++;
    d.setDate(d.getDate()+7);
  }
  return{measured,total,rate:total>0?Math.round(measured/total*100):0};
}

/** 直近木曜が未計測かどうか */
const isThursdayUnmeasured=(p:Player):boolean=>
  !p.measurements.some(m=>m.date===lastThursdayStr());
// テスト用ダミー選手（マネージャー一括登録・お祝い集計から除外）
const isTestPlayer=(p:Player):boolean=>p.name.replace(/[\s　]/g,"").startsWith("テスト");
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
interface Milestone{
  phase:number;label:string;
  targetWeight:number;phaseStartWeight:number;
  targetDate:Date;monthlyRate:number;
}
interface GoalInfo{
  label:string;target:number;daysLeft:number;weeksLeft:number;
  gainNeeded:number;weeklyNeeded:number;monthlyNeeded:number;monthlyRate:number;goalDate:Date;
  milestones?:Milestone[];activePhase?:number;finalTarget?:number;phaseStartWeight?:number;
  goalType?:GoalType; // 表示制御用
}
function calcGoalInfo(p:Player,cur:number):GoalInfo{
  const today=new Date();today.setHours(0,0,0,0);
  const group=getPosGroup(p);
  const fresh=isFresh(p);
  const grade=calcGrade(p.birthDate);
  const sMult=seasonalMultiplier();

  // ── 共通：キャリア最終大会日（全学年）= 3年生になる年の秋大会 9/14 ──
  const _schoolYForCareer=today.getMonth()>=3?today.getFullYear():today.getFullYear()-1;
  const careerEndDate=new Date(_schoolYForCareer+(3-grade),8,14);

  // ── 共通：次の大会日を取得するヘルパー ──
  const getNextTourney=():Date|null=>{
    const yr2=today.getFullYear();
    const dates:Date[]=[];
    for(let y2=yr2;y2<=yr2+2;y2++){dates.push(new Date(y2,3,14));dates.push(new Date(y2,8,14));}
    return dates.filter(d=>d.getTime()>today.getTime()&&d.getTime()<=careerEndDate.getTime()).sort((a,b)=>a.getTime()-b.getTime())[0]??null;
  };
  const tLabel=(d:Date)=>`${d.getMonth()===3?"🌸 春大会":"🍂 秋大会"} ${d.getMonth()+1}/${d.getDate()}`;

  // ── 体型改善（体重維持・体組成改善） ──
  if(p.goalType==="recomp"){
    const nt=getNextTourney();
    const goalDate=nt??new Date(today.getFullYear()+1,3,14);
    const dl=Math.max(0,Math.round((goalDate.getTime()-today.getTime())/86400000));
    return{
      label:`体型改善（現体重維持・体組成改善）`,
      target:cur,goalDate,daysLeft:dl,weeksLeft:Math.round(dl/7),
      gainNeeded:0,weeklyNeeded:0,monthlyNeeded:0,monthlyRate:0,goalType:"recomp",
    };
  }

  // ── 減量 ──
  if(p.goalType==="cut"){
    const nt=getNextTourney();
    const goalDate=nt??new Date(today.getFullYear()+1,3,14);
    const dl=Math.max(0,Math.round((goalDate.getTime()-today.getTime())/86400000));
    const months=Math.max(0.1,dl/30);
    const target=p.goalCutTarget??Math.round((cur-2)*10)/10; // 未設定なら−2kg
    const lossNeeded=Math.max(0,Math.round((cur-target)*10)/10);
    const mr=Math.round(lossNeeded/months*100)/100; // 月間減量ペース
    const label=nt?`減量（${tLabel(nt)}まで）`:"減量";
    return{
      label,target,goalDate,daysLeft:dl,weeksLeft:Math.round(dl/7),
      gainNeeded:-lossNeeded, // マイナス=減量が必要
      weeklyNeeded:Math.round(mr/4.33*100)/100,
      monthlyNeeded:mr,
      monthlyRate:cur>0?Math.round((mr/cur)*100*10)/10:0,
      goalType:"cut",
    };
  }

  // ── 3年生最終シーズン（春大会4/14〜秋大会9/14）: 最優先 ──
  // ただしコーチが goalBulkTarget を手動設定した場合はそちらを優先する
  if(is3rdYearFinalSeason(p,today)&&!p.goalBulkTarget){
    const y=today.getMonth()>=3?today.getFullYear():today.getFullYear()-1;
    const fallDate=new Date(y,8,14);
    const bmiCap=group?calcBMITarget(group,p.height):cur+5;
    const goalTarget=Math.min(bmiCap,Math.round((cur+1.0)*10)/10);
    const dl=Math.max(0,Math.round((fallDate.getTime()-today.getTime())/86400000));
    const months=Math.max(0.5,dl/30);
    const mr=Math.round(1.0/months*100)/100;
    const gainNeeded=Math.max(0,Math.round((goalTarget-cur)*10)/10);
    return{
      label:"3年最終シーズン（秋大会9/14まで+1kg）",
      target:goalTarget,goalDate:fallDate,
      daysLeft:dl,weeksLeft:Math.round(dl/7),gainNeeded,
      weeklyNeeded:Math.round(mr/4.33*100)/100,monthlyNeeded:mr,
      monthlyRate:cur>0?Math.round((mr/cur)*100*10)/10:0,
    };
  }

  // ── 大会日程ベース：次の大会を目標にする（春大会4/14・秋大会9/14）──
  const yr=today.getFullYear();
  const schoolY=today.getMonth()>=3?today.getFullYear():today.getFullYear()-1;
  // 全学年：3年生になる年の秋大会9/14がキャリア最終
  const maxTourneyDate=careerEndDate;

  // 今後の大会日程を最大3つ取得
  const allTourneyDates:Date[]=[];
  for(let y2=yr;y2<=yr+2;y2++){
    allTourneyDates.push(new Date(y2,3,14)); // 春大会 4/14
    allTourneyDates.push(new Date(y2,8,14)); // 秋大会 9/14
  }
  const upcomingTourneys=allTourneyDates.filter(d=>{
    if(d.getTime()<=today.getTime())return false;
    if(maxTourneyDate&&d.getTime()>maxTourneyDate.getTime())return false;
    return true;
  }).sort((a,b)=>a.getTime()-b.getTime()).slice(0,3);

  if(upcomingTourneys.length===0){
    const goalDate=new Date(today);goalDate.setFullYear(goalDate.getFullYear()+1);
    return{label:"目標未設定",target:0,goalDate,daysLeft:365,weeksLeft:52,gainNeeded:0,weeklyNeeded:0,monthlyNeeded:0,monthlyRate:0};
  }

  const nextTourney=upcomingTourneys[0];
  const dl=Math.max(0,Math.round((nextTourney.getTime()-today.getTime())/86400000));
  const months=Math.max(0.1,dl/30);

  // 月間増量ペース（グループ・体質・季節を反映）
  let baseMr=0.5;
  let finalTarget:number|undefined;
  if(group){
    const mult=constitutionMultiplier(p.constitution);
    baseMr=Math.max(0.05,Math.round(group.monthlyRate*mult*100)/100);
    // コーチが手動設定した目標体重があればそれを優先、なければBMI上限
    finalTarget=p.goalBulkTarget??calcBMITarget(group,p.height);
  }else if(fresh){
    const mult=constitutionMultiplier(p.constitution);
    baseMr=Math.max(0.05,Math.round(1.0*mult*100)/100);
    if(p.goalBulkTarget)finalTarget=p.goalBulkTarget;
  }else{
    // グループ未設定でも手動目標があれば使用
    if(p.goalBulkTarget)finalTarget=p.goalBulkTarget;
  }
  // 季節倍率を現在の月間ペースに適用（表示用）
  const mr=Math.max(0.05,Math.round(baseMr*sMult*100)/100);

  // 3年生時期の月間ペース（3年生は増量が難しいため0.8倍）
  const grade3Year=_schoolYForCareer+(3-grade);
  const grade3StartDate=new Date(grade3Year,3,1); // 3年生の4月1日から適用
  const seniorMr=Math.round(baseMr*0.8*100)/100;

  // 大会日までの期待増量（1〜2年期間はbaseMr、3年期間はseniorMrを適用）
  const gainByDate=(td:Date):number=>{
    if(grade===3){
      // すでに3年生：全期間seniorMr
      const months=Math.max(0.1,(td.getTime()-today.getTime())/(30*86400000));
      return seniorMr*months;
    }
    if(td<=grade3StartDate){
      // 大会日が3年生開始前：全期間baseMr
      const months=Math.max(0.1,(td.getTime()-today.getTime())/(30*86400000));
      return baseMr*months;
    }
    // 大会日が3年生開始後：期間分割
    const monthsJunior=Math.max(0,(grade3StartDate.getTime()-today.getTime())/(30*86400000));
    const monthsSenior=Math.max(0,(td.getTime()-grade3StartDate.getTime())/(30*86400000));
    return baseMr*monthsJunior+seniorMr*monthsSenior;
  };

  // 大会日時点の表示月間ペース（現在どちらの期間か）
  const rateAt=(td:Date):number=>(grade===3||td>=grade3StartDate)?seniorMr:baseMr;

  // 次の大会での目標体重（今の体重＋期待増量、BMIキャップ）
  const rawNextTarget=Math.round((cur+gainByDate(nextTourney))*10)/10;
  const nextTarget=finalTarget?Math.min(finalTarget,rawNextTarget):rawNextTarget;
  const gainNeeded=Math.max(0,Math.round((nextTarget-cur)*10)/10);

  // 直前の大会時点の体重（プログレスバーの開始点）
  const sortedMs=[...p.measurements].sort((a,b)=>a.date.localeCompare(b.date));
  const lastTourneys=[new Date(yr,3,14),new Date(yr,8,14),new Date(yr-1,3,14),new Date(yr-1,8,14)]
    .filter(d=>d<=today).sort((a,b)=>b.getTime()-a.getTime());
  const lastTourneyStr=lastTourneys.length>0
    ?`${lastTourneys[0].getFullYear()}-${String(lastTourneys[0].getMonth()+1).padStart(2,"0")}-${String(lastTourneys[0].getDate()).padStart(2,"0")}`
    :"";
  const measAtCycleStart=lastTourneyStr
    ?sortedMs.filter(m=>m.date<=lastTourneyStr).slice(-1)[0]??sortedMs[0]
    :sortedMs[0];
  const cycleStartWeight=measAtCycleStart?.weight??cur;

  // 大会ごとのマイルストーン
  // 学年別ペースで積み上げ。帳尻合わせの逆算はしない
  const milestones:Milestone[]=[];
  let prevMW=cycleStartWeight;
  for(let i=0;i<upcomingTourneys.length;i++){
    const td=upcomingTourneys[i];
    const rawW=Math.round((cur+gainByDate(td))*10)/10;
    const tW=finalTarget?Math.min(finalTarget,rawW):rawW;
    milestones.push({phase:i+1,label:tLabel(td),targetWeight:tW,phaseStartWeight:prevMW,targetDate:td,monthlyRate:rateAt(td)});
    prevMW=tW;
  }
  // 最終BMI目標マイルストーン（キャリア最終大会より前に現実的なペースで達成できる場合のみ追加）
  if(finalTarget&&prevMW<finalTarget){
    const remaining=Math.max(0,finalTarget-prevMW);
    const lastRate=milestones.length>0?milestones[milestones.length-1].monthlyRate:seniorMr;
    const moNeeded=Math.ceil(remaining/lastRate);
    const baseDate=milestones[milestones.length-1]?.targetDate??today;
    const rawFinalDate=new Date(baseDate);rawFinalDate.setMonth(rawFinalDate.getMonth()+moNeeded);
    if(rawFinalDate.getTime()<careerEndDate.getTime()){
      // キャリア最終大会より前に達成できる場合のみ表示
      milestones.push({phase:milestones.length+1,label:"🎯 最終BMI目標",targetWeight:finalTarget,phaseStartWeight:prevMW,targetDate:rawFinalDate,monthlyRate:lastRate});
    }
    // 達成できない場合は追加しない（無理なゴールを表示しない）
  }

  const activeM=milestones.find(m=>cur<m.targetWeight)??milestones[milestones.length-1];
  const groupLabel=group?`${group.name} ｜ `:fresh?"Fresh ｜ ":"";

  return{
    label:`${groupLabel}${tLabel(nextTourney)}まで`,
    target:nextTarget,goalDate:nextTourney,
    daysLeft:dl,weeksLeft:Math.round(dl/7),gainNeeded,
    weeklyNeeded:Math.round(mr/4.33*100)/100,monthlyNeeded:mr,
    monthlyRate:cur>0?Math.round((mr/cur)*100*10)/10:0,
    milestones,activePhase:activeM?.phase,
    finalTarget,phaseStartWeight:cycleStartWeight,
  };
}
function calcStatus(p:Player,g:GoalInfo):TrafficLight{
  const cw=latestWeight(p);
  // 体型改善は常に緑
  if(g.goalType==="recomp")return"green";
  // 直近8週間（56日）のデータのみ使用・4週間（28日）未満は判定しない
  const co=new Date();co.setDate(co.getDate()-56);
  const cos=`${co.getFullYear()}-${String(co.getMonth()+1).padStart(2,"0")}-${String(co.getDate()).padStart(2,"0")}`;
  const recent=[...p.measurements].filter(m=>m.date>=cos).sort((a,b)=>a.date.localeCompare(b.date));
  const hasEnoughData=recent.length>=2&&
    Math.round((new Date(recent[recent.length-1].date).getTime()-new Date(recent[0].date).getTime())/86400000)>=28;
  if(!hasEnoughData)return"start"; // 4週間未満は「記録スタート！」
  if(g.goalType==="cut"){
    if(cw===null)return"start";
    const days=Math.max(1,Math.round((new Date(recent[recent.length-1].date).getTime()-new Date(recent[0].date).getTime())/86400000));
    const weeklyLoss=-(recent[recent.length-1].weight-recent[0].weight)/days*7;
    return weeklyLoss>=g.weeklyNeeded*0.8?"green":weeklyLoss>=g.weeklyNeeded*0.4?"yellow":"red";
  }
  if(cw===null||g.gainNeeded<=0)return"green";
  if(g.daysLeft<=0)return"red";
  const days=Math.max(1,Math.round((new Date(recent[recent.length-1].date).getTime()-new Date(recent[0].date).getTime())/86400000));
  const r=((recent[recent.length-1].weight-recent[0].weight)/days*7)/(g.weeklyNeeded||1);
  return r>=0.8?"green":r>=0.4?"yellow":"red";
}
function statusStyle(s:TrafficLight,goalType?:GoalType){
  const iscut=goalType==="cut",isrecomp=goalType==="recomp";
  if(s==="green") return{bg:OK_BG,brd:OK_BRD,color:GREEN,text:iscut?"減量ペース：順調":isrecomp?"体型改善：順調":"増量ペース：順調"};
  if(s==="yellow")return{bg:WN_BG,brd:WN_BRD,color:"#a07000",text:iscut?"減量ペース：やや遅れ":"増量ペース：やや遅れ"};
  if(s==="start") return{bg:"#F0F0F0",brd:"#C0C0C0",color:MUTED,text:"記録スタート！"};
  return              {bg:NG_BG,brd:NG_BRD,color:RED,text:iscut?"減量ペース：遅れ":"増量ペース：遅れ"};
}
function sortPlayers(players:Player[],key:SortKey,dir:SortDir):Player[]{
  return[...players].sort((a,b)=>{
    const cwa=latestWeight(a)??0,cwb=latestWeight(b)??0;
    const ga=calcGoalInfo(a,cwa),gb=calcGoalInfo(b,cwb);
    const ORD:{green:number;yellow:number;red:number;start:number}={red:0,yellow:1,start:1,green:2};
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
        // 実測の増加量（kg/月）でソート：直近8週間、計測2件未満は末尾
        const actualGainKg=(p:Player)=>{
          const allMs=[...p.measurements].sort((a,b)=>a.date.localeCompare(b.date));
          const co=new Date();co.setDate(co.getDate()-56);
          const cos=`${co.getFullYear()}-${String(co.getMonth()+1).padStart(2,"0")}-${String(co.getDate()).padStart(2,"0")}`;
          const ms=allMs.filter(m=>m.date>=cos);
          if(ms.length<2)return-Infinity;
          const days=Math.max(1,Math.round((new Date(ms[ms.length-1].date).getTime()-new Date(ms[0].date).getTime())/86400000));
          return(ms[ms.length-1].weight-ms[0].weight)/days*30;
        };
        c=actualGainKg(a)-actualGainKg(b);break;
      }
      case"weight":c=cwa-cwb;break;
      case"name":c=a.name.localeCompare(b.name,"ja");break;
      case"thursday":{
        const ua=isThursdayUnmeasured(a)?0:1;
        const ub=isThursdayUnmeasured(b)?0:1;
        c=ua-ub;break;
      }
      case"team":{
        const ta=a.team??99,tb=b.team??99;
        if(ta!==tb){c=ta-tb;break;}
        const gA=calcGrade(a.birthDate),gB=calcGrade(b.birthDate);
        if(gA!==gB)return gB-gA; // 学年 3→1 固定（dir不問）
        const rkT=(pos:string[])=>{if(!pos.length)return POS_ORDER.length;const idx=POS_ORDER.indexOf(pos[0]);return idx>=0?idx:POS_ORDER.length;};
        const pd=rkT(a.position)-rkT(b.position);
        if(pd!==0)return pd;
        return a.name.localeCompare(b.name,"ja");
      }
      // ── 複合ソート：学年（3→1固定） + 第2キー（dir適用）──
      case"grade_weight":{
        const gA=calcGrade(a.birthDate),gB=calcGrade(b.birthDate);
        if(gA!==gB)return gB-gA; // 学年 3→1 固定
        c=cwa-cwb;break; // 体重は dir で切替
      }
      case"grade_status":{
        const ORDs:{green:number;yellow:number;red:number;start:number}={red:0,yellow:1,start:1,green:2};
        const gA=calcGrade(a.birthDate),gB=calcGrade(b.birthDate);
        if(gA!==gB)return gB-gA;
        c=ORDs[calcStatus(a,ga)]-ORDs[calcStatus(b,gb)];break;
      }
      case"grade_gain":{
        const gg=(p:Player)=>{
          const ms=[...p.measurements].sort((x,y)=>x.date.localeCompare(y.date));
          if(ms.length<2)return-Infinity;
          const days=Math.max(1,Math.round((new Date(ms[ms.length-1].date).getTime()-new Date(ms[0].date).getTime())/86400000));
          return(ms[ms.length-1].weight-ms[0].weight)/days*30;
        };
        const gA=calcGrade(a.birthDate),gB=calcGrade(b.birthDate);
        if(gA!==gB)return gB-gA;
        c=gg(a)-gg(b);break;
      }
      // ── 複合ソート：ポジション（標準順固定） + 第2キー（dir適用）──
      case"position_weight":{
        const rkW=(pos:string[])=>{if(!pos.length)return POS_ORDER.length;const idx=POS_ORDER.indexOf(pos[0]);return idx>=0?idx:POS_ORDER.length;};
        const pA=rkW(a.position),pB=rkW(b.position);
        if(pA!==pB)return pA-pB; // POS順 固定
        c=cwa-cwb;break;
      }
      case"position_status":{
        const ORDps:{green:number;yellow:number;red:number;start:number}={red:0,yellow:1,start:1,green:2};
        const rkS=(pos:string[])=>{if(!pos.length)return POS_ORDER.length;const idx=POS_ORDER.indexOf(pos[0]);return idx>=0?idx:POS_ORDER.length;};
        const pA=rkS(a.position),pB=rkS(b.position);
        if(pA!==pB)return pA-pB;
        c=ORDps[calcStatus(a,ga)]-ORDps[calcStatus(b,gb)];break;
      }
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

// チーム順 → 学年順（3年→1年）→ ポジション → 名前
function sortByTeamAndGrade(players:Player[]):Player[]{
  const rk=(pos:string[])=>{if(!pos.length)return POS_ORDER.length;const idx=POS_ORDER.indexOf(pos[0]);return idx>=0?idx:POS_ORDER.length;};
  return[...players].sort((a,b)=>{
    const ta=a.team??99,tb=b.team??99;
    if(ta!==tb)return ta-tb; // チーム1→5、未設定は末尾
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
  return calcGrade(p.birthDate)===1&&(!p.position[0]||p.position[0]==="その他"||p.position[0]==="未定");
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
// 体質スコアから月間増量ペースの倍率を算出（avg=1→×0.75, avg=3→×1.00, avg=5→×1.25）
function constitutionMultiplier(c?:Constitution):number{
  if(!c)return 1.0;
  const avg=(c.bodyType+c.appetite+c.digestion+c.sleep)/4;
  return Math.round((0.625+avg*0.125)*100)/100;
}
// 季節倍率：夏は増えにくい、冬は増えやすい
function seasonalMultiplier():number{
  const m=new Date().getMonth()+1;
  if(m===7||m===8)return 0.75;   // 真夏（増えにくい）
  if(m===6)       return 0.85;   // 梅雨・初夏
  if(m===9)       return 0.90;   // 初秋
  if(m===1||m===2)return 1.20;   // 真冬（増えやすい）
  if(m===11||m===12)return 1.10; // 初冬
  return 1.00;                   // 春・秋（3,4,5,10月）
}
function seasonNote():string|null{
  const m=new Date().getMonth()+1;
  if(m===7||m===8)return"🌞 真夏（×0.75）— 夏は増量しづらい時期";
  if(m===6)       return"☀️ 初夏（×0.85）— 暑くなり始め、やや増えにくい";
  if(m===9)       return"🍂 初秋（×0.90）— 夏明け、徐々に増えやすくなる";
  if(m===1||m===2)return"❄️ 真冬（×1.20）— 冬は最も増量しやすい時期";
  if(m===11||m===12)return"🍁 初冬（×1.10）— 寒くなり増えやすい";
  return null; // 春・秋は調整なし
}
// 3年生最終シーズン判定（春大会 4/14 〜 秋大会 9/14 の間）
function is3rdYearFinalSeason(p:Player,today:Date):boolean{
  if(calcGrade(p.birthDate)!==3)return false;
  const y=today.getMonth()>=3?today.getFullYear():today.getFullYear()-1;
  return today.getTime()>=new Date(y,3,14).getTime()&&today.getTime()<new Date(y,8,14).getTime();
}

// ---- Motivation ----
const MOTIVATION_MSGS={
  green:[
    "いいペースで来ている。この調子を続けよう",
    "毎週の積み重ねが、確実に体を変えている",
    "食べて・寝て・鍛えて。その繰り返しが力になる",
    "着実に前進中。記録を続けることが一番大事",
    "体が少しずつ変わってきているよ。よく頑張っている",
    "順調な増量ペース。この習慣を大切にしよう",
    "コツコツ積み上げている。それが一番の近道",
    "理想のペースで増えている。自信を持って進もう",
    "毎週記録してくれてありがとう。その継続が大事",
    "体作りは長い旅。今日も一歩進んでいる",
  ],
  yellow:[
    "間食を1品追加してみよう。バナナやおにぎりでも効果あり",
    "3食しっかり食べているか、振り返ってみよう",
    "練習後の補食、忘れていない？タンパク質を意識して",
    "少しずつで大丈夫。焦らず、でも継続を意識しよう",
    "睡眠は十分に取れている？回復も増量のうち",
    "食欲がない日は、食べやすいものから少しずつ",
    "あとひと押し。小さな積み重ねが体を作っていく",
    "食事の量を少し意識してみよう。特に夕食を大切に",
    "補食のタイミングを見直すだけで変わることもある",
    "体調は大丈夫？無理せず、できる範囲で続けよう",
  ],
  red:[
    "今週から食事を少し意識してみよう。まず3食から",
    "1日5食を目標に、少量ずつでも回数を増やしてみよう",
    "食事・睡眠・練習、どれか見直せることがないか考えてみよう",
    "スタッフに相談してみてもいい。一人で抱え込まなくて大丈夫",
    "焦らなくていい。でも食事だけは意識して続けてみよう",
    "まず補食を1つ増やすところから始めてみよう",
    "体は正直。食べた分だけ、ちゃんと応えてくれる",
    "今は伸び悩む時期かもしれない。記録を続けることが大事",
    "小さな一歩でいい。今日の食事を少し増やしてみよう",
  ],
  recomp:[
    "体重を維持しながら、質の良いトレーニングを続けよう",
    "数字より体の変化を感じることが大切な時期",
    "食事の質と十分な睡眠が体組成改善のカギ",
    "タンパク質をしっかり摂って、筋肉を守りながら絞っていこう",
    "見た目の変化はゆっくり。焦らず継続しよう",
  ],
  cut:[
    "無理なペースは体に負担。計画的に、着実に絞っていこう",
    "食事の質を保ちながら、少しずつ調整していこう",
    "減量中も筋肉を守るため、タンパク質を意識しよう",
    "体重だけでなく、体のコンディションにも注目しよう",
    "少しずつの変化が、大きな結果につながる",
  ],
};
function getMotivation(p:Player,goal:GoalInfo,status:TrafficLight):{emoji:string;msg:string;color:string}{
  const cw=latestWeight(p)??0;
  if(cw===0)return{emoji:"📋",msg:"まず今日の体重を記録しよう",color:MUTED};
  if(goal.goalType==="recomp"){
    const msgs=MOTIVATION_MSGS.recomp;
    return{emoji:"🔄",msg:msgs[p.measurements.length%msgs.length],color:"#2563EB"};
  }
  if(goal.goalType==="cut"){
    if(cw<=goal.target)return{emoji:"🏆",msg:`目標体重 ${goal.target}kg 達成！よく頑張った`,color:GOLD};
    const msgs=MOTIVATION_MSGS.cut;
    const emoji=status==="green"?"✅":status==="yellow"?"⚡":"🔑";
    return{emoji,msg:msgs[p.measurements.length%msgs.length],color:status==="green"?GREEN:status==="yellow"?"#a07000":RED};
  }
  if(cw>=goal.target&&goal.target>0)return{emoji:"🏆",msg:`目標の ${goal.target}kg 達成！次のステージへ`,color:GOLD};
  const allW=p.measurements.map(m=>m.weight);
  const sorted=[...p.measurements].sort((a,b)=>a.date.localeCompare(b.date));
  let streak=0;
  for(let i=sorted.length-1;i>=1;i--){
    const d=Math.max(1,Math.round((new Date(sorted[i].date).getTime()-new Date(sorted[i-1].date).getTime())/86400000));
    const wg=((sorted[i].weight-sorted[i-1].weight)/d)*7;
    if(goal.weeklyNeeded>0&&wg>=goal.weeklyNeeded*0.8)streak++;else break;
  }
  if(streak>=4)return{emoji:"🔥",msg:`${streak}週連続でペース達成中！すごい継続力だ`,color:GREEN};
  if(streak>=2)return{emoji:"💪",msg:`${streak}週連続でペース達成！この調子で続けよう`,color:GREEN};
  const isNew=allW.length>0&&cw>=Math.max(...allW);
  if(isNew&&allW.length>1){const pw=prevWeight(p)??cw;if(cw>pw)return{emoji:"🎉",msg:`自己最高体重更新！${cw}kgが今の実力`,color:GREEN};}
  const idx=p.measurements.length;
  if(status==="green"){const msgs=MOTIVATION_MSGS.green;return{emoji:"✅",msg:msgs[idx%msgs.length],color:GREEN};}
  if(status==="yellow"){const msgs=MOTIVATION_MSGS.yellow;return{emoji:"⚡",msg:msgs[idx%msgs.length],color:"#a07000"};}
  const msgs=MOTIVATION_MSGS.red;
  return{emoji:"🌱",msg:msgs[idx%msgs.length],color:RED};
}

// ---- Staff Consult Alert ----
interface ConsultAlert{type:"goal_cleared"|"stalled"|"grade12_slow";title:string;msg:string;}
function getStaffConsultAlert(p:Player,goal:GoalInfo,cw:number):ConsultAlert|null{
  if(cw===0)return null;
  const sorted=[...p.measurements].sort((a,b)=>a.date.localeCompare(b.date));
  const grade=calcGrade(p.birthDate);
  const now=Date.now();

  // ① 目標体重クリア
  if(goal.target>0&&cw>=goal.target){
    return{
      type:"goal_cleared",
      title:`🎉 目標体重 ${goal.target}kg 達成！`,
      msg:"コツコツ積み上げてきた努力は本物だ。本当によく頑張った！次のステージに向けた目標について、早めにスタッフに相談してください。"
    };
  }

  // ② 1・2年生：3ヶ月で1kg未満の増量（または減少）
  if((grade===1||grade===2)&&sorted.length>=2){
    const threeMonthsAgo=now-90*24*3600*1000;
    const oldMeas=sorted.filter(m=>new Date(m.date).getTime()<=threeMonthsAgo);
    const refMeas=oldMeas.length>0?oldMeas[oldMeas.length-1]:null;
    if(refMeas){
      const gain3m=Math.round((cw-refMeas.weight)*10)/10;
      if(gain3m<1.0){
        const gainStr=gain3m<=0?`${gain3m}kg（減少）`:`+${gain3m}kg`;
        return{
          type:"grade12_slow",
          title:"📋 増量ペースの確認が必要です",
          msg:`直近3ヶ月の体重変化は ${gainStr} です（目安：月+1kg以上）。食事・睡眠・練習の状況について、スタッフに相談してください。`
        };
      }
    }
  }

  // ③ 全学年：4回以上の計測で体重が増えていない（3週間以上の停滞）
  if(sorted.length>=4&&goal.target>0&&cw<goal.target){
    const recent4=sorted.slice(-4);
    const netGain=Math.round((recent4[recent4.length-1].weight-recent4[0].weight)*10)/10;
    const spanDays=Math.round((new Date(recent4[recent4.length-1].date).getTime()-new Date(recent4[0].date).getTime())/86400000);
    if(netGain<=0&&spanDays>=21){
      return{
        type:"stalled",
        title:"⚠️ 増量が止まっています",
        msg:`約${Math.round(spanDays/7)}週間、体重の増加が見られません。食事量・睡眠・コンディションについてスタッフに相談してください。`
      };
    }
  }

  return null;
}

// ---- Weight Chart (with period selector) ----
type ChartPeriod="1m"|"3m"|"6m"|"1y"|"goal";
function WeightChart({player}:{player:Player}){
  const[period,setPeriod]=useState<ChartPeriod>("3m");
  const allMeas=[...player.measurements].sort((a,b)=>a.date.localeCompare(b.date));
  if(allMeas.length<2)return(
    <div style={{textAlign:"center",fontSize:13,padding:"20px 0",lineHeight:1.8}}>
      {allMeas.length===0
        ?<span style={{color:MUTED2}}>まず体重を記録してみよう！</span>
        :<span style={{color:MAROON,fontWeight:700}}>🎉 あと1回記録するとグラフが表示されます！<br/><span style={{fontSize:11,color:MUTED,fontWeight:400}}>毎週記録を続けると成長が見えてくるよ</span></span>
      }
    </div>
  );
  const cw=allMeas[allMeas.length-1].weight,goal=calcGoalInfo(player,cw);
  const now=Date.now();
  let meas:typeof allMeas,minTs:number,maxTs:number;
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
  }else if(period==="6m"){
    const s=now-180*24*3600*1000;
    meas=allMeas.filter(m=>new Date(m.date).getTime()>=s);
    if(meas.length===0)meas=allMeas.slice(-8);
    minTs=Math.min(new Date(meas[0].date).getTime()-3*24*3600*1000,s);
    maxTs=now+21*24*3600*1000;
  }else if(period==="1y"){
    const s=now-365*24*3600*1000;
    meas=allMeas.filter(m=>new Date(m.date).getTime()>=s);
    if(meas.length===0)meas=allMeas;
    minTs=Math.min(new Date(meas[0].date).getTime()-3*24*3600*1000,s);
    maxTs=now+30*24*3600*1000;
  }else{
    meas=allMeas;
    minTs=new Date(meas[0].date).getTime();
    maxTs=goal.goalDate.getTime();
  }
  // 目標ラインは常に表示 — Y軸スケールに目標体重を含める
  const showGoalLine=goal.target>0;
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
  const PERIODS:[ChartPeriod,string][]=[["1m","1ヶ月"],["3m","3ヶ月"],["6m","6ヶ月"],["1y","1年"],["goal","最終目標"]];
  return(
    <div>
      <div style={{display:"flex",gap:4,marginBottom:10,flexWrap:"wrap"}}>
        {PERIODS.map(([p,label])=>(
          <button key={p} onClick={()=>setPeriod(p)}
            style={{flex:"1 1 0",minWidth:0,padding:"6px 2px",borderRadius:8,fontSize:11,fontWeight:period===p?700:400,
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
          {showGoalLine&&pts.length>0&&(()=>{
            // グローバルな最初の計測から目標日まで直線を引き、ビュー内の区間だけ描画する
            const goalTs=goal.goalDate.getTime();
            const originTs=new Date(allMeas[0].date).getTime();
            const originW=allMeas[0].weight;
            const tRange=goalTs-originTs||1;
            const wAtTs=(ts:number)=>originW+(goal.target-originW)*(ts-originTs)/tRange;
            // 描画区間をビュー内にクリップ
            const lineStartTs=Math.max(minTs,originTs);
            const lineEndTs=Math.min(maxTs,goalTs);
            if(lineStartTs>=lineEndTs)return null;
            const lx1=xS(lineStartTs),ly1=yS(wAtTs(lineStartTs));
            const lx2=xS(lineEndTs), ly2=yS(wAtTs(lineEndTs));
            const goalInView=goalTs<=maxTs;
            return<>
              <line x1={lx1.toFixed(1)} y1={ly1.toFixed(1)} x2={lx2.toFixed(1)} y2={ly2.toFixed(1)} stroke={GOLD} strokeWidth={1.5} strokeDasharray="5,4" opacity={0.8}/>
              {goalInView?(
                <>
                  <circle cx={lx2} cy={ly2} r={4} fill={GOLD} opacity={0.9}/>
                  <text x={lx2-2} y={ly2-9} textAnchor="middle" fontSize={9} fill={GOLD} fontWeight="bold">{goal.target}</text>
                </>
              ):(
                // 目標日がビュー外：右端に矢印ラベルで目標体重を表示
                <text x={iW-1} y={ly2-5} textAnchor="end" fontSize={9} fill={GOLD} fontWeight="bold">→{goal.target}kg</text>
              )}
            </>;
          })()}
          <path d={path} fill="none" stroke={MAROON} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round"/>
          {pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={i===pts.length-1?5:3.5} fill={i===pts.length-1?MAROON:"#fff"} stroke={MAROON} strokeWidth={2}/>)}
          {pts.length>0&&<text x={pts[pts.length-1].x+7} y={pts[pts.length-1].y} fontSize={10} fill={MAROON} fontWeight="bold" dominantBaseline="middle">{pts[pts.length-1].w}</text>}
          <g transform={`translate(0,${iH+22})`}>
            <line x1={0} y1={0} x2={14} y2={0} stroke={MAROON} strokeWidth={2.5}/><circle cx={7} cy={0} r={3} fill={MAROON}/><text x={18} y={0} fontSize={8} fill={MUTED} dominantBaseline="middle">実績</text>
            {showGoalLine&&<><line x1={44} y1={0} x2={58} y2={0} stroke={GOLD} strokeWidth={1.5} strokeDasharray="4,3"/><text x={62} y={0} fontSize={8} fill={MUTED} dominantBaseline="middle">{period==="goal"?"目標ライン":`目標${goal.target}kg`}</text></>}
          </g>
        </g>
      </svg>
    </div>
  );
}

// ---- Food Recommendation ----
const PFC_PHASES=[
  {key:"bulk",label:"📈 増量期",color:MAROON,bg:MAROON_L,
    desc:"体重・筋肉量を増やすフェーズ。カロリー余剰（+300〜500kcal）を作り、タンパク質でしっかり筋肉の材料を供給する。",
    p:{ratio:"2.0g/kg（固定）",pct:"20〜25%",tip:"毎食プロテイン源を確保（肉・魚・卵・大豆）"},
    f:{ratio:"体重×0.8〜1.0g",pct:"20〜25%",tip:"揚げ物は控えめに。オリーブ油・魚・ナッツ由来の良質な脂質を"},
    c:{ratio:"残りのカロリー",pct:"50〜60%",tip:"白飯・パン・麺など。練習前後に重点的に摂る"},
  },
  {key:"hyper",label:"💪 筋肥大期",color:"#2563EB",bg:"#eff6ff",
    desc:"体重をほぼ維持しながら筋肉を増やすフェーズ（リコンプ）。タンパク質を十分に確保し、トレーニングの質が重要。",
    p:{ratio:"2.0g/kg（固定）",pct:"25〜30%",tip:"最も重要。毎食20〜40gを目標。プロテインシェイクを活用"},
    f:{ratio:"体重×0.8〜1.0g",pct:"25〜30%",tip:"ホルモン分泌に必要。ただし脂肪の過剰摂取は避ける"},
    c:{ratio:"残りのカロリー",pct:"40〜50%",tip:"練習前後に集中。練習がない日は少し減らす"},
  },
  {key:"game",label:"🏈 試合期",color:GREEN,bg:OK_BG,
    desc:"体重を維持しつつパフォーマンスを最大化するフェーズ。炭水化物でエネルギーを切らさず、タンパク質で筋肉を守る。",
    p:{ratio:"2.0g/kg（固定）",pct:"20〜25%",tip:"筋肉の分解を防ぐ。試合前日・当日もしっかり確保"},
    f:{ratio:"体重×0.8〜1.0g",pct:"20〜25%",tip:"試合当日は脂質を控えめに（消化に時間がかかるため）"},
    c:{ratio:"残りのカロリー",pct:"45〜55%",tip:"試合前日はカーボローディング（炭水化物多め）が有効"},
  },
] as const;

function PFCGuide({weight,avgKcal}:{weight:number;avgKcal:number}){
  const[openPhase,setOpenPhase]=useState<string|null>(null);
  // 増量期PFC目安（デフォルト表示用）
  const pG=Math.round(weight*1.8);
  const pKcal=pG*4;
  const fKcal=Math.round(avgKcal*0.22);
  const fG=Math.round(fKcal/9);
  const cKcal=Math.max(0,avgKcal-pKcal-fKcal);
  const cG=Math.round(cKcal/4);
  return(
    <div style={{marginBottom:12}}>
      {/* PFC当日目安 */}
      <div style={{background:"#f8f5ef",borderRadius:10,padding:"10px 12px",marginBottom:10,border:`1px solid ${BORDER}`}}>
        <div style={{fontSize:11,fontWeight:700,color:MUTED,marginBottom:8}}>📊 1日のPFCバランス目安（増量期・体重{weight}kg基準）</div>
        <div style={{display:"flex",gap:6}}>
          {[
            {label:"P タンパク質",g:pG,kcal:pKcal,color:MAROON,bg:MAROON_L},
            {label:"F 脂質",g:fG,kcal:fKcal,color:"#d97706",bg:"#fffbeb"},
            {label:"C 炭水化物",g:cG,kcal:cKcal,color:GREEN,bg:OK_BG},
          ].map(({label,g,kcal,color,bg})=>(
            <div key={label} style={{flex:1,background:bg,borderRadius:8,padding:"8px 6px",textAlign:"center",border:`1px solid ${color}30`}}>
              <div style={{fontSize:9,fontWeight:700,color,marginBottom:3}}>{label}</div>
              <div style={{fontSize:18,fontWeight:900,color,lineHeight:1}}>{g}<span style={{fontSize:10,fontWeight:400}}>g</span></div>
              <div style={{fontSize:9,color:MUTED,marginTop:1}}>{kcal}kcal</div>
            </div>
          ))}
        </div>
      </div>
      {/* フェーズ別詳細（折りたたみ） */}
      <div style={{fontSize:11,fontWeight:700,color:MUTED,marginBottom:6,letterSpacing:"0.05em"}}>📚 フェーズ別PFC推奨バランス（タップで詳細）</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {PFC_PHASES.map(ph=>{
          const isOpen=openPhase===ph.key;
          return(
            <div key={ph.key} style={{borderRadius:10,overflow:"hidden",border:`1.5px solid ${isOpen?ph.color:BORDER}`}}>
              <button onClick={()=>setOpenPhase(isOpen?null:ph.key)} style={{width:"100%",padding:"10px 14px",background:isOpen?ph.bg:"#fff",border:"none",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",fontFamily:"inherit"}}>
                <span style={{fontSize:13,fontWeight:700,color:ph.color}}>{ph.label}</span>
                <span style={{fontSize:14,color:MUTED}}>{isOpen?"▲":"▼"}</span>
              </button>
              {isOpen&&(
                <div style={{padding:"10px 14px",background:ph.bg,borderTop:`1px solid ${ph.color}22`}}>
                  <div style={{fontSize:12,color:TEXT,lineHeight:1.6,marginBottom:10}}>{ph.desc}</div>
                  {[
                    {nutrient:"P タンパク質",d:ph.p,color:MAROON},
                    {nutrient:"F 脂質",d:ph.f,color:"#d97706"},
                    {nutrient:"C 炭水化物",d:ph.c,color:GREEN},
                  ].map(({nutrient,d,color})=>(
                    <div key={nutrient} style={{marginBottom:8,paddingBottom:8,borderBottom:`1px solid ${ph.color}22`}}>
                      <div style={{fontSize:12,fontWeight:700,color,marginBottom:2}}>{nutrient} <span style={{fontSize:11,fontWeight:400,color:MUTED}}>目安 {d.ratio}（カロリー比 {d.pct}）</span></div>
                      <div style={{fontSize:11,color:MUTED,lineHeight:1.5}}>💡 {d.tip}</div>
                    </div>
                  ))}
                  <div style={{fontSize:10,color:MUTED2,marginTop:4}}>※個人差があります。体重変化を見ながら調整してください。</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* PFCとは */}
      <div style={{fontSize:10,color:MUTED2,marginTop:8,lineHeight:1.7,background:"#f8f5ef",borderRadius:8,padding:"8px 10px"}}>
        <strong>PFCとは？</strong>　P=Protein（タンパク質）、F=Fat（脂質）、C=Carbohydrate（炭水化物）の3大栄養素。バランスよく摂ることが体作りの基本です。
      </div>
    </div>
  );
}

function FoodRecommendation({practiceKcal,offKcal,weight}:{practiceKcal:number;offKcal:number;weight:number}){
  const[open,setOpen]=useState(false);
  const[tab,setTab]=useState<"main"|"pre"|"post">("main");
  // メイン食に季節メニューをランダムで2品混入（4番目と8番目の位置）
  const mainWithSeasonal=(()=>{
    const seasonal=getSeasonalFoods();
    const base=[...MAIN_FOODS];
    // 4番目と8番目に差し込む
    const result:FoodItem[]=[];
    base.forEach((f,i)=>{
      if(i===3&&seasonal[0])result.push(seasonal[0]);
      if(i===7&&seasonal[1])result.push(seasonal[1]);
      result.push(f);
    });
    return result;
  })();
  const foods=tab==="main"?mainWithSeasonal:tab==="pre"?PRE_PRACTICE_FOODS:POST_PRACTICE_FOODS;
  const avgKcal=Math.round((practiceKcal+offKcal)/2);
  return(
    <div>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",minHeight:52,padding:"14px 18px",borderRadius:12,background:open?MAROON:GOLD_L,border:`1.5px solid ${open?MAROON:GOLD}`,color:open?"#fff":TEXT,fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:"inherit"}}>
        <span>🍱 PFCバランス・おすすめ食事を見る</span>
        <span style={{fontSize:18}}>{open?"▲":"▼"}</span>
      </button>
      {open&&(
        <div style={{marginTop:8}}>
          <div style={{fontSize:12,color:MUTED,textAlign:"center",lineHeight:1.7,marginBottom:10,background:GOLD_L,borderRadius:10,padding:"10px 14px",border:`1px solid ${BORDER}`}}>
            練習日目標 <strong style={{color:MAROON}}>{practiceKcal.toLocaleString()} kcal</strong> ／ オフ日 <strong style={{color:MAROON}}>{offKcal.toLocaleString()} kcal</strong>
          </div>
          {weight>0&&<PFCGuide weight={weight} avgKcal={avgKcal}/>}
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
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:2}}>
                      {f.seasonal&&<span style={{fontSize:10,fontWeight:800,background:f.seasonal.startsWith("☀️")?"#fef9c3":f.seasonal.startsWith("❄️")?"#e0f2fe":f.seasonal.startsWith("🌸")?"#fce7f3":"#fef3c7",color:f.seasonal.startsWith("☀️")?"#92400e":f.seasonal.startsWith("❄️")?"#1e40af":f.seasonal.startsWith("🌸")?"#9d174d":"#92400e",borderRadius:8,padding:"2px 8px",border:`1px solid ${f.seasonal.startsWith("☀️")?"#fde68a":f.seasonal.startsWith("❄️")?"#bfdbfe":f.seasonal.startsWith("🌸")?"#fbcfe8":"#fde68a"}`}}>{f.seasonal} 旬</span>}
                      <span style={{fontSize:13,fontWeight:600,color:TEXT,lineHeight:1.5}}>{f.name}</span>
                    </div>
                    {f.note&&!f.seasonal&&<div style={{fontSize:11,color:"#7a5000",background:WN_BG,borderRadius:5,padding:"2px 7px",marginTop:2,display:"inline-block"}}>{f.note}</div>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,flexShrink:0}}>
                    <span style={{fontSize:17,fontWeight:800,color:MAROON}}>約{f.kcal}</span>
                    <span style={{fontSize:10,color:MUTED2}}>kcal</span>
                  </div>
                </div>
                {(f.p!==undefined||f.f!==undefined||f.c!==undefined)&&(
                  <div style={{display:"flex",gap:6,marginTop:8}}>
                    {[{label:"P",val:f.p,color:MAROON,bg:MAROON_L},{label:"F",val:f.f,color:"#d97706",bg:"#fffbeb"},{label:"C",val:f.c,color:GREEN,bg:OK_BG}].map(({label,val,color,bg})=>
                      val!==undefined?(
                        <div key={label} style={{flex:1,background:bg,borderRadius:6,padding:"4px 6px",textAlign:"center",border:`1px solid ${color}30`}}>
                          <div style={{fontSize:9,fontWeight:700,color,marginBottom:1}}>{label}</div>
                          <div style={{fontSize:13,fontWeight:800,color,lineHeight:1}}>{val}<span style={{fontSize:9,fontWeight:400}}>g</span></div>
                        </div>
                      ):null
                    )}
                  </div>
                )}
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

// ---- Recomp Nutrition Guide ----
function RecompNutritionGuide({weight,maintenanceKcal}:{weight:number;maintenanceKcal:number}){
  const[open,setOpen]=useState(false);
  // PFC計算（体組成改善向け）
  const proteinG=Math.round(weight*2.0);        // タンパク質：2.0g/kg
  const proteinKcal=proteinG*4;
  const fatKcal=Math.round(maintenanceKcal*0.27); // 脂質：27%
  const fatG=Math.round(fatKcal/9);
  const carbKcal=Math.max(0,maintenanceKcal-proteinKcal-fatKcal);
  const carbG=Math.round(carbKcal/4);
  const RECOMP_FOODS=[
    {label:"🍗 鶏むね肉＋白飯（中）＋野菜",kcal:"550〜650",protein:"50〜60g",note:"毎食のベース。タンパク質を最優先に",type:"自炊" as const},
    {label:"🐟 サーモン・マグロ刺身定食",kcal:"600〜700",protein:"40〜50g",note:"良質な脂質（EPA・DHA）も補える",type:"外食" as const},
    {label:"🥚 ゆで卵（2個）＋オートミール＋豆腐",kcal:"400〜500",protein:"30〜40g",note:"朝食向け。消化よく筋合成を助ける",type:"自炊" as const},
    {label:"🥗 サラダチキン＋おにぎり（鮭）",kcal:"350〜450",protein:"30〜35g",note:"コンビニでも高タンパク・低脂質が実現",type:"コンビニ" as const},
    {label:"🫘 納豆2パック＋白飯＋味噌汁",kcal:"400〜480",protein:"25〜30g",note:"植物性タンパクとイソフラボンが体組成改善に有効",type:"自炊" as const},
  ];
  const RECOMP_PRE=[
    {label:"🍌 バナナ1本＋プロテインバー",kcal:"200〜280",protein:"15〜20g",note:"練習2時間前に。素早く使えるエネルギー",type:"コンビニ" as const},
    {label:"🍙 おにぎり（鮭・ツナ）×1",kcal:"180〜220",protein:"8〜12g",note:"炭水化物でグリコーゲンを補充しておく",type:"コンビニ" as const},
  ];
  const RECOMP_POST=[
    {label:"🥤 プロテインシェイク＋バナナ",kcal:"250〜350",protein:"20〜25g",note:"練習後30分以内に。筋合成のゴールデンタイム！",type:"自炊" as const},
    {label:"🐓 サラダチキン＋おにぎり",kcal:"350〜420",protein:"30〜35g",note:"コンビニで手軽に補給。糖質＋タンパク質のセット",type:"コンビニ" as const},
    {label:"🍳 卵3個のスクランブルエッグ＋食パン",kcal:"400〜500",protein:"25〜30g",note:"帰宅後の夕食前補食として。消化しやすい",type:"自炊" as const},
  ];
  const[tab,setTab]=useState<"main"|"pre"|"post">("main");
  const foods=tab==="main"?RECOMP_FOODS:tab==="pre"?RECOMP_PRE:RECOMP_POST;
  return(
    <div>
      {/* 体型改善メッセージ */}
      <div style={{background:"#f0f4ff",borderRadius:10,padding:"12px 14px",marginBottom:10,border:"1px solid #c0cce0"}}>
        <div style={{fontSize:14,fontWeight:700,color:"#2563EB",marginBottom:4}}>🔄 体重をキープして脂肪を減らし、筋肉を増やすフェーズ</div>
        <div style={{fontSize:12,color:MUTED,lineHeight:1.7}}>
          体重の数字より「体の質」を変える時期。<br/>
          カロリーは<strong style={{color:TEXT}}>維持量を守りながら</strong>、タンパク質を十分に摂ってトレーニングの質を上げることが大切です。
        </div>
      </div>
      {/* 折りたたみ：PFC＋食事ガイド */}
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",minHeight:52,padding:"14px 18px",borderRadius:12,background:open?"#2563EB":"#eff6ff",border:`1.5px solid ${open?"#2563EB":"#c0cce0"}`,color:open?"#fff":"#2563EB",fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:"inherit"}}>
        <span>📊 PFCバランス・食事ガイドを見る</span>
        <span style={{fontSize:18}}>{open?"▲":"▼"}</span>
      </button>
      {open&&(
        <div style={{marginTop:8}}>
          {/* PFC内訳 */}
          <div style={{background:"#f8faff",borderRadius:10,padding:"12px 14px",marginBottom:12,border:"1px solid #dce6f5"}}>
            <div style={{fontSize:12,fontWeight:700,color:MUTED,marginBottom:10,letterSpacing:"0.05em"}}>1日のPFCバランス目安（維持カロリー {maintenanceKcal.toLocaleString()} kcal基準）</div>
            <div style={{display:"flex",gap:8}}>
              {[
                {label:"P タンパク質",g:proteinG,kcal:proteinKcal,color:"#2563EB",bg:"#eff6ff",unit:"2.0g/kg"},
                {label:"F 脂質",g:fatG,kcal:fatKcal,color:"#d97706",bg:"#fffbeb",unit:"27%"},
                {label:"C 炭水化物",g:carbG,kcal:carbKcal,color:GREEN,bg:OK_BG,unit:"残り"},
              ].map(({label,g,kcal:k,color,bg,unit})=>(
                <div key={label} style={{flex:1,background:bg,borderRadius:8,padding:"10px 8px",textAlign:"center",border:`1px solid ${color}30`}}>
                  <div style={{fontSize:10,fontWeight:700,color,marginBottom:4}}>{label}</div>
                  <div style={{fontSize:20,fontWeight:900,color,lineHeight:1}}>{g}<span style={{fontSize:11,fontWeight:400}}>g</span></div>
                  <div style={{fontSize:10,color:MUTED,marginTop:2}}>{k} kcal</div>
                  <div style={{fontSize:9,color:MUTED2,marginTop:2}}>{unit}</div>
                </div>
              ))}
            </div>
            <div style={{fontSize:11,color:MUTED,marginTop:10,lineHeight:1.7,background:"#fff",borderRadius:8,padding:"8px 10px"}}>
              <div>💪 <strong>タンパク質（P）</strong>は筋肉の材料。毎食必ず意識して摂ること。</div>
              <div>🫒 <strong>脂質（F）</strong>はホルモン生成に不可欠。魚・オリーブ油・ナッツなど良質な脂質から。</div>
              <div>🍚 <strong>炭水化物（C）</strong>は練習のエネルギー源。練習前後に集中して摂るのが効果的。</div>
            </div>
          </div>
          {/* タブ：食事例 */}
          <div style={{display:"flex",gap:6,marginBottom:10}}>
            {([["main","🍗 メイン食"],["pre","🔋 練習前"],["post","💪 練習後"]] as const).map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)} style={{flex:1,minHeight:44,padding:"8px 4px",borderRadius:10,background:tab===id?"#2563EB":"transparent",border:`1.5px solid ${tab===id?"#2563EB":BORDER}`,color:tab===id?"#fff":MUTED,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{label}</button>
            ))}
          </div>
          {tab==="pre"&&<div style={{fontSize:11,color:"#7a5000",background:WN_BG,borderRadius:8,padding:"8px 12px",marginBottom:8,border:`1px solid ${WN_BRD}`}}>💡 練習2〜3時間前。脂質少なめ・炭水化物中心で素早くエネルギー補給</div>}
          {tab==="post"&&<div style={{fontSize:11,color:GREEN,background:OK_BG,borderRadius:8,padding:"8px 12px",marginBottom:8,border:`1px solid ${OK_BRD}`}}>💡 練習後30分以内がゴールデンタイム！タンパク質＋炭水化物をセットで</div>}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {foods.map((f,i)=>(
              <div key={i} style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1,marginRight:10}}>
                    <div style={{fontSize:13,fontWeight:600,color:TEXT,lineHeight:1.5}}>{f.label}</div>
                    <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}>
                      <span style={{fontSize:11,fontWeight:700,color:"#2563EB",background:"#eff6ff",borderRadius:5,padding:"2px 7px"}}>🥩 P: {f.protein}</span>
                    </div>
                    {f.note&&<div style={{fontSize:11,color:MUTED,marginTop:5,lineHeight:1.5}}>{f.note}</div>}
                  </div>
                  <div style={{flexShrink:0,textAlign:"right"}}>
                    <div style={{fontSize:17,fontWeight:800,color:"#2563EB"}}>{f.kcal}</div>
                    <div style={{fontSize:10,color:MUTED2}}>kcal</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{fontSize:11,color:MUTED2,textAlign:"center",marginTop:10}}>※数値は目安です。体重・体型の変化を見ながらスタッフと相談して調整を。</div>
        </div>
      )}
    </div>
  );
}

// ---- Shared UI ----
function Card({children,style}:{children:React.ReactNode;style?:React.CSSProperties}){return<div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:14,padding:"16px 18px",...style}}>{children}</div>;}
function Label({children,style}:{children:React.ReactNode;style?:React.CSSProperties}){return<div style={{fontSize:11,fontWeight:700,color:MUTED,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6,...style}}>{children}</div>;}
function TInput({value,onChange,placeholder,type="text",style}:{value:string;onChange:(v:string)=>void;placeholder?:string;type?:string;style?:React.CSSProperties}){
  return<input type={type} inputMode={type==="number"?"decimal":undefined} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)}
    style={{width:"100%",padding:"12px 14px",borderRadius:10,fontSize:16,border:`1.5px solid ${BORDER}`,outline:"none",fontFamily:"inherit",boxSizing:"border-box",color:TEXT,background:"#f8f5ef",...style}}/>;
}
function Btn({children,onClick,color=MAROON,disabled,small,fullWidth}:{children:React.ReactNode;onClick:()=>void;color?:string;disabled?:boolean;small?:boolean;fullWidth?:boolean}){
  return<button onClick={onClick} disabled={disabled} style={{padding:small?"9px 16px":"13px 24px",borderRadius:10,fontSize:small?13:15,fontWeight:700,background:disabled?"#ccc":color,color:"#fff",border:"none",cursor:disabled?"not-allowed":"pointer",fontFamily:"inherit",minHeight:small?40:50,width:fullWidth?"100%":undefined}}>{children}</button>;
}
function BackBtn({onClick}:{onClick:()=>void}){return<button onClick={onClick} style={{background:"none",border:"none",fontSize:24,cursor:"pointer",padding:"4px 8px",color:MUTED,minWidth:44,minHeight:44,display:"flex",alignItems:"center"}}>←</button>;}

// ---- Player Form ----
interface FormInit{name?:string;height?:string;birthDate?:string;position?:string[];constitution?:Constitution;}
function PlayerFormScreen({title,init,showWeight,onSave,onBack}:{
  title:string;init?:FormInit;showWeight:boolean;
  onSave:(d:{name:string;height:number;birthDate:string;position:string[];constitution:Constitution;weight?:number})=>void;
  onBack:()=>void;
}){
  const[name,setName]=useState(init?.name??"");
  const[height,setHeight]=useState(init?.height??"");
  const[birthDate,setBD]=useState(init?.birthDate??"");
  const[positions,setPositions]=useState<string[]>(init?.position??[]);
  const[weight,setWeight]=useState("");
  const[constitution,setConst]=useState<Constitution>(init?.constitution??{bodyType:3,appetite:3,digestion:3,sleep:3});
  const setMain=(pos:string)=>setPositions(prev=>{const subs=prev.slice(1).filter(p=>p!==pos);return prev[0]===pos?[...subs]:[pos,...subs];});
  const toggleSub=(pos:string)=>setPositions(prev=>prev.slice(1).includes(pos)?[prev[0],...prev.slice(1).filter(p=>p!==pos)]:[prev[0],...prev.slice(1),pos]);
  const canSave=name&&height&&birthDate&&(!showWeight||weight);
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
      {showWeight&&<Card><div style={{display:"flex",flexDirection:"column",gap:14}}><div><Label>現在の体重 (kg)</Label><TInput value={weight} onChange={setWeight} type="number" placeholder="75.0"/></div></div></Card>}
      {/* 体質チェック */}
      <Card>
        <Label>💪 体質チェック（任意）</Label>
        <div style={{fontSize:12,color:MUTED,marginBottom:14,lineHeight:1.6}}>回答することで増量ペースの目標・カロリー目安が調整されます。わからなければ3（ふつう）のままでOK。</div>
        {([
          {key:"bodyType" as const,label:"太りやすさ",min:"太れない",max:"太りやすい",minDesc:"ハードゲイナー",maxDesc:"イージーゲイナー"},
          {key:"appetite" as const,label:"食欲・食事量",min:"少食",max:"大食い",minDesc:"あまり食べられない",maxDesc:"たくさん食べられる"},
          {key:"digestion" as const,label:"胃腸の強さ",min:"弱い",max:"強い",minDesc:"お腹を壊しやすい",maxDesc:"何でも食べられる"},
          {key:"sleep" as const,label:"睡眠・回復力",min:"短い",max:"十分",minDesc:"5時間以下・浅い",maxDesc:"8時間以上ぐっすり"},
        ]).map(q=>(
          <div key={q.key} style={{marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{fontSize:13,fontWeight:700,color:TEXT}}>{q.label}</span>
              <span style={{fontSize:12,color:MUTED}}>{q.key==="bodyType"?q.minDesc:""}{constitution[q.key]===1?` ${q.minDesc}`:constitution[q.key]===5?` ${q.maxDesc}`:""}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:10,color:MUTED2,minWidth:32,textAlign:"right",lineHeight:1.3}}>{q.min}</span>
              <div style={{display:"flex",gap:6,flex:1,justifyContent:"center"}}>
                {[1,2,3,4,5].map(v=>{
                  const sel=constitution[q.key]===v;
                  return(
                    <button key={v} onClick={()=>setConst(c=>({...c,[q.key]:v}))}
                      style={{width:48,height:48,borderRadius:24,
                        border:`2px solid ${sel?MAROON:BORDER}`,
                        background:sel?MAROON:v===3?"#f8f5ef":"transparent",
                        color:sel?"#fff":v===3?MUTED:MUTED2,
                        fontSize:17,fontWeight:700,cursor:"pointer",fontFamily:"inherit",
                        transition:"all 0.12s"}}>
                      {v}
                    </button>
                  );
                })}
              </div>
              <span style={{fontSize:10,color:MUTED2,minWidth:32,lineHeight:1.3}}>{q.max}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:MUTED2,padding:"2px 38px 0"}}>
              <span>{q.minDesc}</span><span>{q.maxDesc}</span>
            </div>
          </div>
        ))}
        {/* 調整プレビュー */}
        {(()=>{
          const mult=constitutionMultiplier(constitution);
          const diff=Math.round((mult-1)*100);
          const avg=((constitution.bodyType+constitution.appetite+constitution.digestion+constitution.sleep)/4).toFixed(1);
          return(
            <div style={{background:diff>0?OK_BG:diff<0?MAROON_L:GOLD_L,border:`1px solid ${diff>0?OK_BRD:diff<0?NG_BRD:GOLD}`,borderRadius:10,padding:"12px 14px",marginTop:4}}>
              <div style={{fontSize:11,color:MUTED,marginBottom:2}}>体質スコア: {avg} / 5.0　→　月間増量ペース調整</div>
              <div style={{fontSize:18,fontWeight:900,color:diff>0?GREEN:diff<0?MAROON:"#8B5A00"}}>×{mult.toFixed(2)} <span style={{fontSize:13,fontWeight:600}}>（標準の{diff>=0?"+":""}{diff}%）</span></div>
              <div style={{fontSize:11,color:MUTED,marginTop:4}}>
                {diff<0?"消化・睡眠・体質を考慮してペースを抑えめに設定":diff>0?"食欲・体質が良好。積極的に増量できる設定":"標準的な増量ペースで設定"}
              </div>
            </div>
          );
        })()}
      </Card>
      <Btn fullWidth onClick={()=>{if(!canSave)return;onSave({name,height:parseFloat(height),birthDate,position:positions,constitution,...(showWeight?{weight:parseFloat(weight)}:{})});}} disabled={!canSave}>{showWeight?"登録する":"保存する"}</Btn>
    </div>
  );
}

// ---- Player List ----
function PlayerListScreen({players,onSelect,onNew,onBack,myPlayerId}:{players:Player[];onSelect:(p:Player)=>void;onNew:()=>void;onBack:()=>void;myPlayerId?:string;}){
  const[sortMode,setSortMode]=useState<"grade"|"team">("grade");
  const myPlayer=myPlayerId?players.find(p=>p.id===myPlayerId):null;
  const hasTeams=players.some(p=>p.team);
  const baseList=sortMode==="team"?sortByTeamAndGrade(players):sortByGrade(players);
  // マイ選手を先頭、残りをソート順
  const sorted=[...(myPlayer?[myPlayer]:[]),...baseList.filter(p=>p.id!==myPlayerId)];
  let lastGrade=-1;let lastTeam=-1;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
        <BackBtn onClick={onBack}/>
        <span style={{fontSize:18,fontWeight:800,color:TEXT,flex:1}}>選手を選ぶ</span>
        {hasTeams&&(
          <div style={{display:"flex",gap:4}}>
            {(["grade","team"] as const).map(m=>(
              <button key={m} onClick={()=>setSortMode(m)} style={{padding:"5px 10px",borderRadius:14,fontSize:11,fontWeight:sortMode===m?700:400,background:sortMode===m?(m==="team"?TEAM_COLORS[1].color:MAROON):"transparent",color:sortMode===m?"#fff":MUTED,border:`1px solid ${sortMode===m?(m==="team"?TEAM_COLORS[1].color:MAROON):BORDER}`,cursor:"pointer",fontFamily:"inherit"}}>
                {m==="grade"?"学年順":"チーム順"}
              </button>
            ))}
          </div>
        )}
      </div>
      {isThursday()&&<div style={{background:WN_BG,border:`1px solid ${WN_BRD}`,borderRadius:10,padding:"12px 16px",fontSize:14,color:"#7a5000",fontWeight:700}}>📅 今日は木曜日！体重を記録しましょう！</div>}
      {players.length===0
        ?<Card><div style={{textAlign:"center",color:MUTED,fontSize:14,padding:"20px 0"}}>まだ選手が登録されていません</div></Card>
        :sorted.map(p=>{
          const cw=latestWeight(p);
          const isMe=p.id===myPlayerId;
          const grade=calcGrade(p.birthDate);
          const teamNum=p.team??0;
          const pTeamC=p.team?TEAM_COLORS[p.team]:null;
          const thuUnmeasured=isThursdayUnmeasured(p);
          // ヘッダー表示
          const showGradeHeader=sortMode==="grade"&&!isMe&&grade!==lastGrade;
          const showTeamHeader=sortMode==="team"&&!isMe&&teamNum!==lastTeam;
          if(!isMe){
            if(sortMode==="grade")lastGrade=grade;
            else lastTeam=teamNum;
          }
          return(
          <div key={p.id}>
            {isMe&&<div style={{fontSize:11,fontWeight:800,color:MAROON,letterSpacing:"0.08em",padding:"4px 4px 0"}}>👤 マイページ</div>}
            {showGradeHeader&&<div style={{fontSize:12,fontWeight:800,color:MAROON,letterSpacing:"0.08em",padding:"4px 4px 0",marginTop:4}}>{grade}年生</div>}
            {showTeamHeader&&(
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,marginBottom:2}}>
                <div style={{height:2,flex:1,background:pTeamC?pTeamC.border:BORDER,borderRadius:1}}/>
                <span style={{fontSize:12,fontWeight:800,color:pTeamC?pTeamC.color:MUTED,padding:"0 6px",background:pTeamC?pTeamC.bg:"transparent",borderRadius:8,border:`1px solid ${pTeamC?pTeamC.border:BORDER}`}}>
                  {teamNum>0?`Team ${teamNum}`:"チーム未設定"}
                </span>
                <div style={{height:2,flex:1,background:pTeamC?pTeamC.border:BORDER,borderRadius:1}}/>
              </div>
            )}
            <button onClick={()=>onSelect(p)} style={{width:"100%",background:isMe?MAROON_L:pTeamC?pTeamC.bg:CARD,border:`${isMe?"2px solid":"1px solid"} ${isMe?MAROON:thuUnmeasured?"#d97706":pTeamC?pTeamC.border:BORDER}`,borderRadius:12,padding:"16px 18px",textAlign:"left",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",fontFamily:"inherit",minHeight:72}}>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:TEXT,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                  {p.name}
                  {isMe&&<span style={{fontSize:11,background:MAROON,color:"#fff",borderRadius:20,padding:"2px 8px",fontWeight:700}}>あなた</span>}
                  {pTeamC&&<span style={{fontSize:10,fontWeight:800,color:pTeamC.color,background:"#fff",border:`1px solid ${pTeamC.border}`,borderRadius:10,padding:"2px 7px"}}>Team {p.team}</span>}
                  {thuUnmeasured&&<span style={{fontSize:10,background:"#fef3c7",color:"#92400e",border:"1px solid #fcd34d",borderRadius:10,padding:"2px 7px",fontWeight:700}}>📅 木曜未計測</span>}
                </div>
                <div style={{fontSize:12,marginTop:3}}>
                  <span style={{color:MUTED,fontWeight:700}}>{p.position[0]||"未設定"}</span>
                  {p.position.slice(1).map(sp=><span key={sp} style={{color:MUTED2}}>{"・"+sp}</span>)}
                  <span style={{color:MUTED}}> ／ {cw!==null?`${cw} kg`:"未計測"}</span>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:22,color:MUTED2}}>›</span>
              </div>
            </button>
          </div>
        );})}
      <button onClick={onNew} style={{minHeight:52,padding:"14px",borderRadius:12,border:`2px dashed ${BORDER}`,background:"transparent",fontSize:14,color:MUTED,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>＋ 新しい選手を登録</button>
    </div>
  );
}

// ---- Player Detail ----
function PlayerDetailScreen({player,players,onBack,onEdit,onUpdate,isCoach,fromCoach,myPlayerId,onSetMyPlayer}:{
  player:Player;players:Player[];onBack:()=>void;onEdit:()=>void;onUpdate:(p:Player)=>void;isCoach:boolean;fromCoach?:boolean;
  myPlayerId?:string;onSetMyPlayer?:(id:string|null)=>void;
}){
  const cw=latestWeight(player)??0,pw=prevWeight(player);
  const goal=calcGoalInfo(player,cw),st=calcStatus(player,goal),sl=statusStyle(st,goal.goalType);
  const mot=getMotivation(player,goal,st);
  const consultAlert=getStaffConsultAlert(player,goal,cw);
  const kcal=calcDailyCalories(cw,player.height,player.birthDate,goal.monthlyNeeded);
  const[inp,setInp]=useState(""),[saved,setSaved]=useState(false);
  const[recordDate,setRecordDate]=useState(todayStr());
  const[showPosPicker,setShowPosPicker]=useState(false);
  const[showStatusDetail,setShowStatusDetail]=useState(false);
  // 直近8週間（28日以上）の実績ゲイン計算
  const recentGainKg=(()=>{
    const ms=[...player.measurements].sort((a,b)=>a.date.localeCompare(b.date));
    const co=new Date();co.setDate(co.getDate()-56);
    const cos=`${co.getFullYear()}-${String(co.getMonth()+1).padStart(2,"0")}-${String(co.getDate()).padStart(2,"0")}`;
    const rm=ms.filter(m=>m.date>=cos);
    if(rm.length<2)return null;
    const days=Math.max(1,Math.round((new Date(rm[rm.length-1].date).getTime()-new Date(rm[0].date).getTime())/86400000));
    if(days<28)return null;
    return Math.round((rm[rm.length-1].weight-rm[0].weight)/days*30*10)/10;
  })();
  // コーチ目標体重入力（ローカル状態で管理し、保存ボタンで確定）
  const[bulkTargetInp,setBulkTargetInp]=useState(player.goalBulkTarget?.toString()??"");
  const[cutTargetInp,setCutTargetInp]=useState(player.goalCutTarget?.toString()??"");
  const[goalSaved,setGoalSaved]=useState(false);
  const saveGoalTarget=()=>{
    const bulkV=parseFloat(bulkTargetInp);
    const cutV=parseFloat(cutTargetInp);
    const updated={
      ...player,
      goalBulkTarget:(player.goalType??"bulk")==="bulk"&&!isNaN(bulkV)?bulkV:player.goalBulkTarget,
      goalCutTarget:player.goalType==="cut"&&!isNaN(cutV)?cutV:player.goalCutTarget,
    };
    onUpdate(updated);
    setGoalSaved(true);
    setTimeout(()=>setGoalSaved(false),2500);
  };
  // マイページ設定バナー：初回のみ表示
  const myPagePromptKey=`owls_mypageprompt_${player.id}`;
  const isMyPage=myPlayerId===player.id;
  const[showMyPageBanner,setShowMyPageBanner]=useState(()=>{
    if(typeof window==="undefined")return false;
    return!isMyPage&&!localStorage.getItem(myPagePromptKey);
  });
  const dismissMyPageBanner=()=>{
    setShowMyPageBanner(false);
    localStorage.setItem(myPagePromptKey,"1");
  };
  const dateMeasured=player.measurements.some(m=>m.date===recordDate);
  // Last measurement info (#8)
  const sortedMeas=[...player.measurements].sort((a,b)=>b.date.localeCompare(a.date));
  const lastDate=sortedMeas[0]?.date;
  // ローカル日付文字列同士で比較（タイムゾーン起因のズレを防ぐ）
  const daysSinceLast=lastDate?Math.round((new Date(todayStr()+"T00:00:00").getTime()-new Date(lastDate+"T00:00:00").getTime())/86400000):null;
  // ポジショングループ・BMI
  const group=getPosGroup(player);
  const fresh=isFresh(player);
  const currentBMI=cw>0?calcCurrentBMI(cw,player.height):null;
  const[showOverwriteConfirm,setShowOverwriteConfirm]=useState(false);
  const[pendingWeight,setPendingWeight]=useState<number|null>(null);
  const existingWeight=player.measurements.find(m=>m.date===recordDate)?.weight??null;
  // 保存直後の体重を即時表示するためのローカル状態（prop更新のラグを補う）
  const[savedWeight,setSavedWeight]=useState<number|null>(null);
  const displayCw=savedWeight??cw;

  const doSave=(w:number)=>{
    const nm=dateMeasured
      ?player.measurements.map(m=>m.date===recordDate?{...m,weight:w}:m)
      :[...player.measurements,{date:recordDate,weight:w}].sort((a,b)=>a.date.localeCompare(b.date));
    onUpdate({...player,measurements:nm});setSaved(true);setInp("");
    setSavedWeight(w); // 即時表示を更新
    setShowOverwriteConfirm(false);setPendingWeight(null);
  };

  const save=()=>{
    const w=parseFloat(inp);if(isNaN(w)||w<30||w>200)return;
    if(dateMeasured){
      // 同日に記録済み → 確認ダイアログを表示
      setPendingWeight(w);setShowOverwriteConfirm(true);
    }else{
      doSave(w);
    }
  };
  const recent=[...player.measurements].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8).reverse();
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Header */}
      {(()=>{const dtc=player.team?TEAM_COLORS[player.team]:null;return(
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,borderRadius:12,padding:dtc?"10px 12px":"0",background:dtc?dtc.bg:"transparent",borderLeft:dtc?`4px solid ${dtc.color}`:"none"}}>
        <BackBtn onClick={onBack}/>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{fontSize:18,fontWeight:800,color:TEXT}}>{player.name}</span>
            {/* チームバッジ */}
            {dtc&&<span style={{fontSize:12,fontWeight:800,color:dtc.color,background:"#fff",border:`1.5px solid ${dtc.color}`,borderRadius:10,padding:"2px 10px"}}>Team {player.team}</span>}
            {/* ポジショングループバッジ */}
            {group&&<span style={{display:"inline-flex",alignItems:"center",background:group.name==="Bigs"?MAROON_L:group.name==="Mids"?GOLD_L:OK_BG,border:`1px solid ${group.name==="Bigs"?MAROON:group.name==="Mids"?GOLD:OK_BRD}`,borderRadius:10,padding:"3px 10px",fontSize:11,fontWeight:800,color:group.name==="Bigs"?MAROON:group.name==="Mids"?"#8B5A00":GREEN}}>{group.name}</span>}
            {fresh&&<span style={{display:"inline-flex",alignItems:"center",background:GOLD_L,border:`1px solid ${GOLD}`,borderRadius:10,padding:"3px 10px",fontSize:11,fontWeight:800,color:"#8B5A00"}}>Fresh</span>}
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
      );})()}

      {/* マイページ設定バナー（初回のみ・コーチ画面経由では非表示） */}
      {showMyPageBanner&&onSetMyPlayer&&!fromCoach&&(
        <div style={{background:MAROON,borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:24,flexShrink:0}}>⭐</span>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:800,color:"#fff",marginBottom:2}}>マイページに設定しよう！</div>
            <div style={{fontSize:12,color:"#FFB0BC",lineHeight:1.5}}>設定するとホームから一発でこのページが開けます</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
            <button onClick={()=>{onSetMyPlayer(player.id);dismissMyPageBanner();}} style={{padding:"8px 14px",borderRadius:8,background:GOLD,border:"none",color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>設定する</button>
            <button onClick={dismissMyPageBanner} style={{padding:"4px 14px",borderRadius:8,background:"transparent",border:"1px solid #fff4",color:"#fff8",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>後で</button>
          </div>
        </div>
      )}

      {/* 体重入力（モバイル最優先・最上部・コーチ画面経由では非表示） */}
      {!fromCoach&&(
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
        {dateMeasured&&!saved&&(
          <div style={{fontSize:12,color:"#92400e",background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:7,padding:"7px 12px",marginBottom:8,fontWeight:600}}>
            📋 {new Date(recordDate+"T00:00:00").toLocaleDateString("ja-JP",{month:"numeric",day:"numeric"})}の記録あり（{existingWeight} kg）　→ 新しい値を入力して「記録する」で上書き確認
          </div>
        )}
        {showOverwriteConfirm&&pendingWeight!==null&&(
          <div style={{background:WN_BG,border:`2px solid ${GOLD}`,borderRadius:12,padding:"14px 16px",marginBottom:8}}>
            <div style={{fontSize:14,fontWeight:700,color:"#7a3800",marginBottom:10}}>
              ⚠️ {new Date(recordDate+"T00:00:00").toLocaleDateString("ja-JP",{month:"numeric",day:"numeric"})}にすでに <strong>{existingWeight} kg</strong> の記録があります。<br/>
              <strong style={{color:MAROON}}>{pendingWeight} kg</strong> に上書きしますか？
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>doSave(pendingWeight)} style={{flex:1,padding:"11px",borderRadius:8,background:MAROON,color:"#fff",border:"none",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>上書きする</button>
              <button onClick={()=>{setShowOverwriteConfirm(false);setPendingWeight(null);}} style={{flex:1,padding:"11px",borderRadius:8,background:"#fff",color:MUTED,border:`1px solid ${BORDER}`,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>キャンセル</button>
            </div>
          </div>
        )}
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:12}}>
          <input type="number" inputMode="decimal" value={inp} placeholder="例：76.5" onChange={e=>{setInp(e.target.value);setSaved(false);setShowOverwriteConfirm(false);}} style={{flex:1,fontSize:32,textAlign:"center",padding:"14px 12px",height:68,borderRadius:12,border:`2px solid ${inp?MAROON:BORDER}`,outline:"none",fontFamily:"inherit",color:TEXT,background:"#fff",boxSizing:"border-box"}}/>
          <span style={{color:MUTED,fontSize:20,fontWeight:700,flexShrink:0}}>kg</span>
        </div>
        <button onClick={save} disabled={!inp||showOverwriteConfirm} style={{width:"100%",height:56,fontSize:18,fontWeight:800,borderRadius:12,background:inp&&!showOverwriteConfirm?MAROON:"#ccc",color:"#fff",border:"none",cursor:inp&&!showOverwriteConfirm?"pointer":"not-allowed",fontFamily:"inherit"}}>記録する</button>
        <div style={{fontSize:11,color:MUTED,marginTop:8,textAlign:"center",lineHeight:1.7}}>
          🏈 部活のある日は練習後に・部活がない日は家で記録しよう
        </div>
      </Card>
      )}

      {/* ステータス */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <Label>現在の体重</Label>
            {pw!==null&&displayCw>0?(
              <div style={{display:"flex",alignItems:"flex-end",gap:10}}>
                <div>
                  <div style={{fontSize:11,color:MUTED,marginBottom:2}}>前回</div>
                  <div style={{fontSize:20,fontWeight:700,color:MUTED2,lineHeight:1}}>{pw}<span style={{fontSize:11,marginLeft:2}}>kg</span></div>
                </div>
                <div style={{fontSize:20,color:MUTED2,paddingBottom:2}}>→</div>
                <div>
                  <div style={{fontSize:11,color:MUTED,marginBottom:2}}>今回</div>
                  <div style={{fontSize:40,fontWeight:900,color:TEXT,lineHeight:1}}>{displayCw}<span style={{fontSize:18,color:MUTED,marginLeft:4}}>kg</span></div>
                </div>
              </div>
            ):(
              <div style={{fontSize:40,fontWeight:900,color:TEXT,lineHeight:1}}>{displayCw>0?displayCw:"—"}<span style={{fontSize:18,color:MUTED,marginLeft:4}}>kg</span></div>
            )}
            {pw!==null&&displayCw>0&&<div style={{fontSize:13,color:displayCw>=pw?GREEN:RED,marginTop:6,fontWeight:700}}>{displayCw>=pw?"▲":"▼"} {Math.abs(Math.round((displayCw-pw)*10)/10)} kg（前回比）</div>}
          </div>
          <div style={{background:sl.bg,border:`1px solid ${sl.brd}`,borderRadius:10,padding:"10px 16px",fontSize:14,fontWeight:700,color:sl.color}}>{sl.text}</div>
        </div>
        {/* ステータス詳細（折りたたみ） */}
        <button onClick={()=>setShowStatusDetail(o=>!o)} style={{marginTop:10,width:"100%",padding:"8px 12px",borderRadius:8,background:"transparent",border:`1px solid ${BORDER}`,color:MUTED,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>📊 このステータスの判定根拠・改善ヒント</span>
          <span>{showStatusDetail?"▲":"▼"}</span>
        </button>
        {showStatusDetail&&(()=>{
          const needed=goal.weeklyNeeded;
          const actualWeekly=recentGainKg!==null?Math.round(recentGainKg/4.33*100)/100:null;
          const ratio=actualWeekly!==null&&needed>0?actualWeekly/needed:null;
          type StatusInfo={title:string;reason:string;tips:string[]};
          const info:StatusInfo=(():StatusInfo=>{
            if(goal.goalType==="recomp")return{
              title:"体型改善：体重の数字より質の変化を見る",
              reason:"体重を維持しながら脂肪を減らし筋肉を増やすフェーズです。体重が変わらなくても改善は進んでいます。",
              tips:["毎食タンパク質（P: 2.0g/kg）を意識して摂ろう","練習後30分以内にタンパク質＋炭水化物を補給","十分な睡眠（7〜8時間）で成長ホルモンを活かす"],
            };
            if(goal.goalType==="cut")return{
              title:"減量ペースの判定",
              reason:`目標: 週-${Math.abs(needed)}kg 以上の減量。${actualWeekly!==null?`直近の実績: 週${actualWeekly>=0?"+":""}${actualWeekly}kg`:"まだ4週間分のデータがありません"}`,
              tips:["急激な減量は筋肉量低下のリスクがあります","タンパク質を十分に摂りながら脂質・炭水化物を調整","スタッフと相談しながら安全に進めましょう"],
            };
            if(st==="start")return{
              title:"まだデータが少ない状態です",
              reason:"増量ペースを判定するには4週間分（木曜日4回分）の計測データが必要です。",
              tips:["毎週木曜日に体重を記録しよう","4週間後から増量ペースの判定が始まります","記録を続けることが体作りの第一歩です"],
            };
            if(st==="green")return{
              title:"順調：目標ペースで増量できています",
              reason:`必要ペース: 週+${needed}kg ／ ${actualWeekly!==null?`直近の実績: 週+${actualWeekly}kg（目標の${Math.round((ratio??0)*100)}%）`:"実績データ蓄積中"}`,
              tips:["この食事・睡眠・トレーニングのリズムを維持しよう","記録を続けてペースを保つことが大切","調子がいいからといって無理はしないこと"],
            };
            if(st==="yellow")return{
              title:"やや遅れ：ペースが少し足りていません",
              reason:`必要ペース: 週+${needed}kg ／ ${actualWeekly!==null?`直近の実績: 週+${actualWeekly}kg（目標の${Math.round((ratio??0)*100)}%）`:"実績データ蓄積中"}`,
              tips:["間食を1品追加してみよう（バナナ・おにぎり・プロテインなど）","練習後の補食を忘れずに（30分以内がベスト）","3食に加えて補食2回を意識してみよう","睡眠をしっかり取ることも増量に効果的"],
            };
            return{
              title:"遅れ：ペースが大きく不足しています",
              reason:`必要ペース: 週+${needed}kg ／ ${actualWeekly!==null?`直近の実績: 週${actualWeekly>=0?"+":""}${actualWeekly}kg（目標の${Math.round((ratio??0)*100)}%）`:"実績データ蓄積中"}`,
              tips:["まず3食しっかり食べることから始めよう","1日5食（3食＋補食2回）を目標にしてみよう","食事・睡眠・トレーニングで見直せることがないか考えよう","スタッフやトレーナーに相談してみよう"],
            };
          })();
          return(
            <div style={{marginTop:8,padding:"12px 14px",background:sl.bg,borderRadius:10,border:`1px solid ${sl.brd}`}}>
              <div style={{fontSize:13,fontWeight:700,color:sl.color,marginBottom:6}}>{info.title}</div>
              <div style={{fontSize:12,color:MUTED,marginBottom:8,lineHeight:1.6}}>{info.reason}</div>
              <div style={{fontSize:11,color:TEXT,lineHeight:1.8}}>
                {info.tips.map((t,i)=><div key={i}>💡 {t}</div>)}
              </div>
            </div>
          );
        })()}
      </Card>

      {/* やる気メッセージ（コーチ画面経由では非表示） */}
      {!fromCoach&&(
      <div style={{background:mot.color+"18",border:`1.5px solid ${mot.color}44`,borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:26,flexShrink:0}}>{mot.emoji}</span>
        <span style={{fontSize:14,fontWeight:600,color:mot.color,lineHeight:1.6}}>{mot.msg}</span>
      </div>
      )}

      {/* スタッフ相談アラート */}
      {consultAlert&&(consultAlert.type==="goal_cleared"?(
        // 目標クリア：ゴールド祝福カード
        <div style={{background:`linear-gradient(135deg,#FFF8DC,#FAF0B0)`,border:`2px solid ${GOLD}`,borderRadius:14,padding:"18px 20px"}}>
          <div style={{fontSize:22,fontWeight:900,color:"#7a5500",marginBottom:6}}>{consultAlert.title}</div>
          <div style={{fontSize:14,color:"#5a3d00",lineHeight:1.7}}>{consultAlert.msg}</div>
        </div>
      ):(
        // 停滞・ペース不足：警告カード
        <div style={{background:consultAlert.type==="stalled"?"#FDE8EE":"#FFF4E0",border:`1.5px solid ${consultAlert.type==="stalled"?NG_BRD:WN_BRD}`,borderRadius:12,padding:"14px 18px"}}>
          <div style={{fontSize:14,fontWeight:800,color:consultAlert.type==="stalled"?RED:"#8B5A00",marginBottom:6}}>{consultAlert.title}</div>
          <div style={{fontSize:13,color:consultAlert.type==="stalled"?"#7a0022":"#5a3d00",lineHeight:1.7}}>{consultAlert.msg}</div>
        </div>
      ))}

      {/* 目標（現フェーズ） */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
          <Label style={{margin:0}}>🎯 目標体重</Label>
          {goal.milestones&&goal.activePhase&&(
            <span style={{fontSize:10,background:MAROON,color:"#fff",borderRadius:6,padding:"2px 8px",fontWeight:700,flexShrink:0}}>
              フェーズ {goal.activePhase}/{goal.milestones.length}
            </span>
          )}
        </div>
        {/* 期限 */}
        {goal.target>0&&(()=>{
          const d=goal.goalDate;const mo=d.getMonth();const day=d.getDate();
          const icon=mo===3?"🌸":"🍂";
          const name=mo===3?"春大会":"秋大会";
          const label=goal.label.includes("3年最終")||mo===8?`${icon}${name} ${mo+1}/${day} まで`:`${icon}${name} ${mo+1}/${day} まで`;
          return<div style={{fontSize:13,color:MUTED,marginBottom:6}}>{label} ／ 残り <strong>{goal.daysLeft}</strong>日・<strong>{goal.weeksLeft}</strong>週</div>;
        })()}
        {/* 目標の根拠 */}
        {(()=>{
          const grp=getPosGroup(player);
          const cMult=constitutionMultiplier(player.constitution);
          const basisParts:string[]=[];
          if(grp)basisParts.push(`${grp.name}グループのBMI${grp.bmiMin}〜${grp.bmiMax}目標`);
          else if(isFresh(player))basisParts.push("Fresh（月+1kg目安）");
          if(player.constitution&&cMult!==1.0)basisParts.push(`体質係数×${cMult}`);
          return basisParts.length>0?(
            <div style={{fontSize:11,color:MUTED2,marginBottom:10,lineHeight:1.5}}>📐 {basisParts.join(" ／ ")} から算出</div>
          ):null;
        })()}
        {/* 目標体重 ／ あと何kg */}
        <div style={{display:"flex",gap:10,marginBottom:12}}>
          {goal.goalType==="recomp"?(
            // 体型改善：体重維持
            <div style={{flex:1,background:"#f0f4ff",borderRadius:10,padding:"10px 12px",textAlign:"center",border:"1px solid #c0cce0"}}>
              <div style={{fontSize:11,color:MUTED,marginBottom:2}}>目標体重（維持）</div>
              <div style={{fontSize:28,fontWeight:800,color:"#2563EB",lineHeight:1.1}}>{cw}<span style={{fontSize:13,fontWeight:400}}> kg</span></div>
              <div style={{fontSize:10,color:MUTED,marginTop:2}}>体組成改善を目指す</div>
            </div>
          ):goal.goalType==="cut"?(
            // 減量：目標体重 ＋ あと何kg減
            <>
              <div style={{flex:1,background:"#f8f5ef",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
                <div style={{fontSize:11,color:MUTED,marginBottom:2}}>目標体重</div>
                <div style={{fontSize:28,fontWeight:800,color:MAROON,lineHeight:1.1}}>{goal.target}<span style={{fontSize:13,fontWeight:400}}> kg</span></div>
              </div>
              {goal.gainNeeded<0?(
                <div style={{flex:1,background:"#fff0f0",borderRadius:10,padding:"10px 12px",textAlign:"center",border:`1px solid ${MAROON}30`}}>
                  <div style={{fontSize:11,color:MUTED,marginBottom:2}}>あと</div>
                  <div style={{fontSize:28,fontWeight:800,color:MAROON,lineHeight:1.1}}>{goal.gainNeeded}<span style={{fontSize:13,fontWeight:400}}> kg</span></div>
                  <div style={{fontSize:10,color:MUTED,marginTop:2}}>減量すると達成！</div>
                </div>
              ):(
                <div style={{flex:1,background:"#e8f5e9",borderRadius:10,padding:"10px 12px",textAlign:"center",border:"1px solid #a5d6a7"}}>
                  <div style={{fontSize:22,marginBottom:2}}>🏆</div>
                  <div style={{fontSize:13,fontWeight:700,color:GREEN}}>減量目標達成！</div>
                </div>
              )}
            </>
          ):(
            // 増量（デフォルト）
            <>
              <div style={{flex:1,background:"#f8f5ef",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
                <div style={{fontSize:11,color:MUTED,marginBottom:2}}>目標体重</div>
                <div style={{fontSize:28,fontWeight:800,color:MAROON,lineHeight:1.1}}>{goal.target}<span style={{fontSize:13,fontWeight:400}}> kg</span></div>
              </div>
              {goal.gainNeeded>0?(
                <div style={{flex:1,background:MAROON_L,borderRadius:10,padding:"10px 12px",textAlign:"center",border:`1px solid ${MAROON}30`}}>
                  <div style={{fontSize:11,color:MUTED,marginBottom:2}}>あと</div>
                  <div style={{fontSize:28,fontWeight:800,color:MAROON,lineHeight:1.1}}>+{goal.gainNeeded}<span style={{fontSize:13,fontWeight:400}}> kg</span></div>
                  <div style={{fontSize:10,color:MUTED,marginTop:2}}>増やすと達成！</div>
                </div>
              ):cw>0?(
                <div style={{flex:1,background:"#e8f5e9",borderRadius:10,padding:"10px 12px",textAlign:"center",border:"1px solid #a5d6a7"}}>
                  <div style={{fontSize:22,marginBottom:2}}>🏆</div>
                  <div style={{fontSize:13,fontWeight:700,color:GREEN}}>目標達成！</div>
                </div>
              ):null}
            </>
          )}
        </div>
        {/* 必要ペース */}
        <div style={{fontSize:13,color:MUTED,marginBottom:10}}>
          必要なペース <strong style={{color:TEXT}}>+{goal.weeklyNeeded} kg/週</strong>
          <span style={{marginLeft:6}}>（月間 +{goal.monthlyNeeded} kg・{goal.monthlyRate}%）</span>
        </div>
        {(()=>{const sn=seasonNote();return sn?(
          <div style={{fontSize:11,color:"#5a4000",background:"#FFF8E0",border:"1px solid #E8C840",borderRadius:6,padding:"5px 10px",marginBottom:8,lineHeight:1.5}}>
            {sn}
          </div>
        ):null;})()}
        {/* プログレスバー */}
        {cw>0&&goal.gainNeeded>0&&(()=>{
          const phaseStart=goal.phaseStartWeight??([...player.measurements].sort((a,b)=>a.date.localeCompare(b.date))[0]?.weight??cw);
          const pct=Math.min(100,Math.max(0,((cw-phaseStart)/(goal.target-phaseStart||1))*100));
          if(pct===0)return<div style={{fontSize:12,color:MUTED,textAlign:"center",padding:"6px 0"}}>📈 記録を続けると進捗が見えてきます</div>;
          return<div><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:MUTED,marginBottom:3}}><span>開始 {phaseStart} kg</span><span>目標 {goal.target} kg</span></div><div style={{height:10,background:BORDER,borderRadius:6,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:GREEN,borderRadius:6}}/></div><div style={{fontSize:11,color:MUTED,marginTop:2,textAlign:"right"}}>{Math.round(pct)}%</div></div>;
        })()}
      </Card>

      {/* 増量フェーズ一覧 */}
      {goal.milestones&&goal.milestones.length>0&&(
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <Label style={{margin:0}}>📈 増量フェーズ</Label>
            {goal.finalTarget&&<span style={{fontSize:11,color:MUTED}}>最終目標 <strong style={{color:MAROON}}>{goal.finalTarget} kg</strong>{cw>0?` (残り${Math.max(0,Math.round((goal.finalTarget-cw)*10)/10)}kg)`:""}</span>}
          </div>
          <div style={{display:"flex",flexDirection:"column"}}>
            {goal.milestones.map((m,i)=>{
              const achieved=cw>0&&cw>=m.targetWeight&&m.targetWeight>0;
              const isActive=goal.activePhase===m.phase;
              const isLast=i===goal.milestones!.length-1;
              const phasePct=m.targetWeight>m.phaseStartWeight?
                Math.min(100,Math.max(0,((cw-m.phaseStartWeight)/(m.targetWeight-m.phaseStartWeight))*100)):0;
              return(
                <div key={m.phase} style={{display:"flex",gap:10}}>
                  {/* ドット＋縦線 */}
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:22,flexShrink:0}}>
                    <div style={{width:22,height:22,borderRadius:11,flexShrink:0,
                      background:achieved?GREEN:isActive?MAROON:"transparent",
                      border:`2.5px solid ${achieved?GREEN:isActive?MAROON:BORDER}`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:11,color:achieved||isActive?"#fff":MUTED2,fontWeight:800}}>
                      {achieved?"✓":m.phase}
                    </div>
                    {!isLast&&<div style={{width:2,flex:1,minHeight:12,background:achieved?GREEN:BORDER,margin:"2px 0"}}/>}
                  </div>
                  {/* コンテンツ */}
                  <div style={{flex:1,paddingBottom:isLast?0:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}>
                          <span style={{fontSize:13,fontWeight:isActive?800:600,color:achieved?GREEN:isActive?TEXT:MUTED}}>
                            {m.label}
                          </span>
                          {isActive&&<span style={{fontSize:9,background:MAROON,color:"#fff",borderRadius:4,padding:"1px 5px",fontWeight:700}}>現在</span>}
                          {achieved&&<span style={{fontSize:9,background:GREEN,color:"#fff",borderRadius:4,padding:"1px 5px",fontWeight:700}}>達成✓</span>}
                        </div>
                        <div style={{fontSize:11,color:MUTED}}>
                          {m.targetDate.toLocaleDateString("ja-JP",{year:"numeric",month:"numeric"})}まで ／ 月間+{m.monthlyRate}kg目安
                        </div>
                      </div>
                      <span style={{fontSize:17,fontWeight:900,color:achieved?GREEN:isActive?MAROON:MUTED2,flexShrink:0,marginLeft:8}}>{m.targetWeight}kg</span>
                    </div>
                    {(isActive||achieved)&&m.targetWeight>m.phaseStartWeight&&(
                      <div style={{marginTop:5}}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:MUTED2,marginBottom:2}}>
                          <span>{m.phaseStartWeight}kg</span><span>{m.targetWeight}kg</span>
                        </div>
                        <div style={{height:5,background:BORDER,borderRadius:3,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${phasePct}%`,background:achieved?GREEN:MAROON,borderRadius:3}}/>
                        </div>
                        <div style={{fontSize:10,color:MUTED,marginTop:1,textAlign:"right"}}>{Math.round(phasePct)}%</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* グラフ */}
      <Card><Label>体重グラフ</Label><WeightChart player={player}/></Card>

      {/* 履歴（上に移動） */}
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

      {/* カロリーガイド + 食事レコメンド（下に移動・コーチ画面経由では非表示） */}
      {!fromCoach&&(
      <Card>
        <Label>{goal.goalType==="recomp"?"1日の維持カロリー目安（MET基準）":"1日の目安カロリー（MET基準）"}</Label>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12}}>
          <div style={{flex:1,minWidth:140,background:goal.goalType==="recomp"?"#eff6ff":MAROON_L,borderRadius:10,padding:"12px 14px",border:`1px solid ${goal.goalType==="recomp"?"#c0cce0":NG_BRD}`}}>
            <div style={{fontSize:11,color:MUTED,marginBottom:2}}>練習日（MET {PRACTICE_MET}×{PRACTICE_HOURS}h）</div>
            <div style={{fontSize:28,fontWeight:900,color:goal.goalType==="recomp"?"#2563EB":MAROON}}>{kcal.practiceDay.toLocaleString()}</div>
            <div style={{fontSize:11,color:MUTED}}>kcal（日常活動{goal.goalType!=="recomp"?"・増量余剰":"・維持"}含む）</div>
          </div>
          <div style={{flex:1,minWidth:140,background:GOLD_L,borderRadius:10,padding:"12px 14px",border:`1px solid ${GOLD}`}}>
            <div style={{fontSize:11,color:MUTED,marginBottom:2}}>オフ日・筋トレ（MET {STRENGTH_MET}×{STRENGTH_HOURS}h）</div>
            <div style={{fontSize:28,fontWeight:900,color:"#8B5A00"}}>{kcal.offDay.toLocaleString()}</div>
            <div style={{fontSize:11,color:MUTED}}>kcal（日常活動含む）</div>
          </div>
        </div>
        <div style={{fontSize:11,color:MUTED2,lineHeight:1.8,background:"#f8f5ef",borderRadius:8,padding:"10px 12px",marginBottom:14}}>
          {goal.goalType==="recomp"?(
            <div>BMR：{kcal.bmr.toLocaleString()} kcal ／ 練習消費：+{kcal.practiceExtra.toLocaleString()} kcal ／ 維持（余剰なし）</div>
          ):(
            <div>BMR：{kcal.bmr.toLocaleString()} kcal ／ 練習消費：+{kcal.practiceExtra.toLocaleString()} kcal ／ 増量余剰：+{kcal.surplus.toLocaleString()} kcal/日</div>
          )}
          <div>日常活動（通学・体育週2-3回・勉強）：+{kcal.activity} kcal</div>
        </div>
        {goal.goalType==="recomp"?(
          <RecompNutritionGuide weight={cw} maintenanceKcal={Math.round((kcal.practiceDay+kcal.offDay)/2)}/>
        ):(
          <FoodRecommendation practiceKcal={kcal.practiceDay} offKcal={kcal.offDay} weight={cw}/>
        )}
      </Card>
      )}

      {/* コーチ専用：チーム割り当て（コーチダッシュボードからのみ表示） */}
      {isCoach&&fromCoach&&(
        <Card style={{border:`2px solid ${MAROON}44`}}>
          <Label>🏈 チーム割り当て（コーチ専用）</Label>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {[1,2,3,4,5].map(n=>{
              const tc=TEAM_COLORS[n];
              const active=player.team===n;
              return(
                <button key={n} onClick={()=>onUpdate({...player,team:active?undefined:n})}
                  style={{flex:1,minWidth:50,padding:"8px 4px",borderRadius:10,
                    border:`2px solid ${active?tc.color:BORDER}`,
                    background:active?tc.bg:"#fff",
                    color:active?tc.color:MUTED,
                    fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",lineHeight:1.4}}>
                  Team {n}
                </button>
              );
            })}
            {player.team&&(
              <button onClick={()=>onUpdate({...player,team:undefined})}
                style={{padding:"8px 10px",borderRadius:10,border:`1px solid ${BORDER}`,background:"transparent",color:MUTED,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>
                解除
              </button>
            )}
          </div>
        </Card>
      )}

      {/* コーチ専用：目標タイプ設定（コーチ画面経由のときのみアクセス可） */}
      {isCoach&&fromCoach&&(
        <Card style={{border:`2px solid ${MAROON}44`}}>
          <Label>🎯 目標タイプ設定（コーチ専用）</Label>
          <div style={{display:"flex",gap:8,marginBottom:(player.goalType==="cut"||(player.goalType??"bulk")==="bulk")?12:0}}>
            {([["bulk","📈 増量","体重を増やす"],["recomp","🔄 体型改善","体重維持・体組成改善"],["cut","📉 減量","体重を絞る"]] as const).map(([type,label,desc])=>{
              const active=(player.goalType??"bulk")===type;
              return(
                <button key={type} onClick={()=>onUpdate({...player,goalType:type})}
                  style={{flex:1,padding:"10px 6px",borderRadius:10,border:`2px solid ${active?MAROON:BORDER}`,background:active?MAROON:"#fff",color:active?"#fff":MUTED,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",lineHeight:1.4}}>
                  <div>{label}</div>
                  <div style={{fontSize:10,fontWeight:400,opacity:0.8,marginTop:2}}>{desc}</div>
                </button>
              );
            })}
          </div>
          {(player.goalType??"bulk")==="bulk"&&(
            <div style={{marginTop:8}}>
              {player.goalBulkTarget&&(
                <div style={{fontSize:12,color:GREEN,background:OK_BG,border:`1px solid ${OK_BRD}`,borderRadius:7,padding:"5px 10px",marginBottom:6}}>
                  ✓ 現在の設定：目標体重 <strong>{player.goalBulkTarget} kg</strong>
                </div>
              )}
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:13,color:TEXT,whiteSpace:"nowrap"}}>増量目標体重：</span>
                <input type="number" inputMode="decimal"
                  value={bulkTargetInp} placeholder={`例：${cw>0?Math.round((cw+10)*10)/10:80}（空欄=BMI上限）`}
                  onChange={e=>{setBulkTargetInp(e.target.value);setGoalSaved(false);}}
                  style={{flex:1,padding:"10px 12px",borderRadius:8,fontSize:16,border:`1.5px solid ${BORDER}`,fontFamily:"inherit",color:TEXT,background:"#fff"}}/>
                <span style={{fontSize:13,color:MUTED}}>kg</span>
              </div>
              <button onClick={saveGoalTarget} style={{marginTop:8,width:"100%",padding:"11px",borderRadius:8,background:goalSaved?GREEN:MAROON,color:"#fff",border:"none",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>
                {goalSaved?"✓ 保存しました":"目標体重を保存する"}
              </button>
            </div>
          )}
          {player.goalType==="cut"&&(
            <div style={{marginTop:8}}>
              {player.goalCutTarget&&(
                <div style={{fontSize:12,color:GREEN,background:OK_BG,border:`1px solid ${OK_BRD}`,borderRadius:7,padding:"5px 10px",marginBottom:6}}>
                  ✓ 現在の設定：目標体重 <strong>{player.goalCutTarget} kg</strong>
                </div>
              )}
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:13,color:TEXT,whiteSpace:"nowrap"}}>減量目標体重：</span>
                <input type="number" inputMode="decimal"
                  value={cutTargetInp} placeholder={`例：${cw>0?Math.round((cw-5)*10)/10:70}`}
                  onChange={e=>{setCutTargetInp(e.target.value);setGoalSaved(false);}}
                  style={{flex:1,padding:"10px 12px",borderRadius:8,fontSize:16,border:`1.5px solid ${BORDER}`,fontFamily:"inherit",color:TEXT,background:"#fff"}}/>
                <span style={{fontSize:13,color:MUTED}}>kg</span>
              </div>
              <button onClick={saveGoalTarget} style={{marginTop:8,width:"100%",padding:"11px",borderRadius:8,background:goalSaved?GREEN:MAROON,color:"#fff",border:"none",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",minHeight:44}}>
                {goalSaved?"✓ 保存しました":"目標体重を保存する"}
              </button>
            </div>
          )}
        </Card>
      )}

      {/* ポジショングループ・BMI */}
      <Card>
        <Label>ポジショングループ・BMI</Label>
        {group&&(()=>{
          const bmiInRange=currentBMI!==null&&currentBMI>=group.bmiMin&&currentBMI<=group.bmiMax;
          return<>
            <div style={{display:"flex",gap:10,marginBottom:4}}>
              <div style={{flex:1,background:bmiInRange?OK_BG:MAROON_L,borderRadius:10,padding:"12px 14px",border:`1px solid ${bmiInRange?OK_BRD:NG_BRD}`}}>
                <div style={{fontSize:11,color:MUTED,marginBottom:2}}>現在のBMI</div>
                <div style={{fontSize:22,fontWeight:800,color:bmiInRange?GREEN:MAROON}}>{currentBMI??'—'}</div>
                {bmiInRange&&<div style={{fontSize:10,color:GREEN,fontWeight:700,marginTop:2}}>✓ 目標範囲内！</div>}
              </div>
              <div style={{flex:1,background:GOLD_L,borderRadius:10,padding:"12px 14px",border:`1px solid ${GOLD}`}}>
                <div style={{fontSize:11,color:MUTED,marginBottom:2}}>{group.name} 目標BMI</div>
                <div style={{fontSize:22,fontWeight:800,color:"#8B5A00"}}>{group.bmiMin}〜{group.bmiMax}</div>
                <div style={{fontSize:11,color:MUTED}}>目標体重 {calcBMITarget(group,player.height)} kg</div>
              </div>
            </div>
            {bmiInRange&&<div style={{fontSize:12,color:MUTED,background:"#f0f4ff",border:"1px solid #c0cce0",borderRadius:8,padding:"10px 12px",lineHeight:1.7}}>
              🤝 BMIは目標範囲内です。今後の方針（増量・維持・減量）はコーチやトレーナーと相談して決めましょう。
            </div>}
          </>;
        })()}
        {fresh&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{background:GOLD_L,borderRadius:10,padding:"12px 14px",border:`1px solid ${GOLD}`}}>
              <div style={{fontSize:11,color:MUTED,marginBottom:4}}>Freshの目標</div>
              <div style={{fontSize:15,fontWeight:800,color:"#8B5A00"}}>月間 +1.0 kg ペース</div>
              <div style={{fontSize:12,color:MUTED,marginTop:4}}>ポジション決定後は各グループの目標に切り替わります</div>
            </div>
            {!showPosPicker?(
              <button onClick={()=>setShowPosPicker(true)} style={{minHeight:52,borderRadius:12,border:`2px solid ${MAROON}`,background:MAROON_L,color:MAROON,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>🏈 ポジション決定</button>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{fontSize:13,color:TEXT,fontWeight:600}}>ポジションを選んでください：</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {FRESH_POS_OPTIONS.map(opt=>(
                    <button key={opt.label} onClick={()=>{onUpdate({...player,position:[opt.label]});setShowPosPicker(false);}}
                      style={{padding:"10px 16px",borderRadius:10,fontSize:15,minHeight:52,border:`2px solid ${MAROON}`,background:MAROON,color:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:700,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                      <span>{opt.label}</span>
                      <span style={{fontSize:10,fontWeight:400,opacity:0.8}}>{opt.group}</span>
                    </button>
                  ))}
                </div>
                <button onClick={()=>setShowPosPicker(false)} style={{minHeight:44,borderRadius:10,border:`1px solid ${BORDER}`,background:"transparent",color:MUTED,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>キャンセル</button>
              </div>
            )}
          </div>
        )}
        {!group&&!fresh&&(
          <div style={{fontSize:13,color:MUTED,textAlign:"center",padding:"12px 0"}}>
            {currentBMI&&<div style={{marginBottom:8}}>現在のBMI: <strong style={{color:MAROON}}>{currentBMI}</strong></div>}
            <div>ポジション決定後に目標が設定されます</div>
          </div>
        )}
        {/* 体質プロフィール */}
        {player.constitution&&(()=>{
          const c=player.constitution!;
          const mult=constitutionMultiplier(c);
          const diff=Math.round((mult-1)*100);
          const avg=((c.bodyType+c.appetite+c.digestion+c.sleep)/4).toFixed(1);
          const qs:[keyof Constitution,string][]=[["bodyType","太りやすさ"],["appetite","食欲"],["digestion","胃腸"],["sleep","睡眠"]];
          return(
            <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${BORDER}`}}>
              <Label>体質プロフィール</Label>
              <div style={{display:"flex",gap:6,marginBottom:8}}>
                {qs.map(([k,label])=>(
                  <div key={k} style={{flex:1,textAlign:"center",background:"#f8f5ef",borderRadius:8,padding:"8px 4px"}}>
                    <div style={{fontSize:9,color:MUTED,marginBottom:2}}>{label}</div>
                    <div style={{fontSize:20,fontWeight:900,color:MAROON,lineHeight:1}}>{c[k]}</div>
                    <div style={{height:3,background:BORDER,borderRadius:2,margin:"4px 4px 0"}}>
                      <div style={{height:"100%",width:`${c[k]*20}%`,background:MAROON,borderRadius:2}}/>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:12,color:diff>0?GREEN:diff<0?MAROON:"#8B5A00",background:diff>0?OK_BG:diff<0?MAROON_L:GOLD_L,border:`1px solid ${diff>0?OK_BRD:diff<0?NG_BRD:GOLD}`,borderRadius:8,padding:"8px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span>スコア {avg}/5.0　ペース調整</span>
                <strong style={{fontSize:15}}>×{mult.toFixed(2)} ({diff>=0?"+":""}{diff}%)</strong>
              </div>
            </div>
          );
        })()}
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

// ---- お祝い紙吹雪エフェクト ----
function Confetti(){
  const pieces=useRef(Array.from({length:70},(_,i)=>({
    left:Math.random()*100,
    delay:Math.random()*0.7,
    dur:2.4+Math.random()*1.8,
    color:[MAROON,GOLD,GREEN,"#2563EB","#B91C1C","#15803D","#92400E","#C9A227"][i%8],
    size:7+Math.random()*8,
    rot:Math.random()*360,
    drift:(Math.random()-0.5)*120,
  }))).current;
  return(
    <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:9999}}>
      <style>{`@keyframes owls-fall{0%{transform:translateY(-12vh) translateX(0) rotate(0deg);opacity:1}100%{transform:translateY(112vh) translateX(var(--drift,0px)) rotate(720deg);opacity:0.85}}`}</style>
      {pieces.map((p,i)=>(
        <div key={i} style={{position:"absolute",top:0,left:`${p.left}%`,width:p.size,height:p.size*0.55,background:p.color,borderRadius:2,["--drift" as any]:`${p.drift}px`,animation:`owls-fall ${p.dur}s ${p.delay}s ease-in forwards`}}/>
      ))}
    </div>
  );
}
const CELEBRATE_MSGS=["🎉 全員計測完了！ナイスワーク！","🦉 完璧です！チーム全員そろいました！","✨ お見事！全員分そろいました！","🏈 グッジョブ！全員の記録が完了！","🎊 全員コンプリート！おつかれさまです！"];

// ---- Manager Bulk ----
function ManagerBulkScreen({players,onSave,onBack}:{players:Player[];onSave:(u:Player[])=>void;onBack:()=>void;}){
  const today=todayStr();
  const[sortMode,setSortMode]=useState<"grade"|"team"|"thursday">("grade");
  // 表示・集計はテスト用選手を除外（保存ペイロードには温存）
  const roster=players.filter(p=>!isTestPlayer(p));
  const hasTeams=roster.some(p=>p.team);
  const thuUnmeasuredCount=roster.filter(p=>isThursdayUnmeasured(p)).length;
  const baseSorted=sortMode==="team"?sortByTeamAndGrade(roster):sortByGrade(roster);
  const sorted=sortMode==="thursday"
    ?[...roster].sort((a,b)=>{const ua=isThursdayUnmeasured(a)?0:1,ub=isThursdayUnmeasured(b)?0:1;if(ua!==ub)return ua-ub;const ga=calcGrade(a.birthDate),gb=calcGrade(b.birthDate);if(ga!==gb)return gb-ga;return a.name.localeCompare(b.name,"ja");})
    :baseSorted;
  const init=()=>{const m:Record<string,string>={};roster.forEach(p=>{const e=p.measurements.find(x=>x.date===today);if(e)m[p.id]=String(e.weight);});return m;};
  const[weights,setW]=useState<Record<string,string>>(init);
  const[savedCount,setSC]=useState<number|null>(null);
  const[allDone,setAllDone]=useState(false);
  const[celebrate,setCelebrate]=useState(false);
  const[celebrateMsg,setCelebrateMsg]=useState("");
  const filled=Object.values(weights).filter(w=>w&&!isNaN(parseFloat(w))).length;
  useEffect(()=>{
    if(!celebrate)return;
    const t=setTimeout(()=>setCelebrate(false),5000);
    return()=>clearTimeout(t);
  },[celebrate]);
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
    // 全員（テスト選手を除く）が本日分の記録を持っているか
    const updMap=new Map(upd.map(p=>[p.id,p]));
    const everyone=roster.length>0&&roster.every(p=>(updMap.get(p.id)??p).measurements.some(m=>m.date===today));
    setAllDone(everyone);
    if(everyone){setCelebrateMsg(CELEBRATE_MSGS[Math.floor(Math.random()*CELEBRATE_MSGS.length)]);setCelebrate(true);}
    // 結果（保存メッセージ／お祝い）が見えるよう、再描画後に最上部へスクロール
    if(typeof window!=="undefined")requestAnimationFrame(()=>window.scrollTo({top:0,behavior:"smooth"}));
  };
  let lastGrade=-1;let lastTeamM=-1;let lastThuSection:boolean|null=null;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
        <BackBtn onClick={onBack}/>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:800,color:TEXT}}>マネージャー：一括記録</div>
          <div style={{fontSize:12,color:MUTED}}>{today}（{isThursday()?"木曜・計測日":"通常日"}）</div>
        </div>
      </div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
        {([
          {key:"grade",label:"学年順",color:MAROON},
          ...(hasTeams?[{key:"team",label:"チーム順",color:TEAM_COLORS[1].color}]:[]),
          {key:"thursday",label:`📅 未計測順${thuUnmeasuredCount>0?` (${thuUnmeasuredCount}人)`:""}`,color:"#B45309"},
        ] as {key:string;label:string;color:string}[]).map(m=>(
          <button key={m.key} onClick={()=>setSortMode(m.key as any)} style={{padding:"5px 10px",borderRadius:14,fontSize:11,fontWeight:sortMode===m.key?700:400,background:sortMode===m.key?m.color:"transparent",color:sortMode===m.key?"#fff":MUTED,border:`1px solid ${sortMode===m.key?m.color:BORDER}`,cursor:"pointer",fontFamily:"inherit"}}>
            {m.label}
          </button>
        ))}
      </div>
      {celebrate&&<Confetti/>}
      {savedCount!==null&&(allDone?(
        <div style={{background:`linear-gradient(135deg,${MAROON} 0%,#6d1320 100%)`,border:`2px solid ${GOLD}`,borderRadius:14,padding:"18px 16px",textAlign:"center",boxShadow:"0 4px 16px rgba(139,26,42,0.25)"}}>
          <div style={{fontSize:18,fontWeight:800,color:"#fff",marginBottom:4}}>{celebrateMsg}</div>
          <div style={{fontSize:13,color:GOLD,fontWeight:700}}>✓ {savedCount}人分の体重を保存しました</div>
        </div>
      ):(
        <div style={{background:OK_BG,border:`1px solid ${OK_BRD}`,borderRadius:10,padding:"12px 16px",fontSize:14,color:GREEN,fontWeight:700}}>✓ {savedCount}人分の体重を保存しました！</div>
      ))}
      {isThursday()&&savedCount===null&&<div style={{background:WN_BG,border:`1px solid ${WN_BRD}`,borderRadius:10,padding:"12px 16px",fontSize:14,color:"#7a5000",fontWeight:700}}>📅 今日は計測日（木曜日）です！</div>}
      {roster.length===0?<Card><div style={{textAlign:"center",color:MUTED,fontSize:14,padding:"20px 0"}}>選手が登録されていません</div></Card>:(
        <Card style={{padding:"14px 16px"}}>
          <div style={{display:"flex",gap:8,fontSize:11,color:MUTED,fontWeight:700,paddingBottom:8,borderBottom:`1px solid ${BORDER}`,marginBottom:8}}>
            <div style={{flex:2}}>名前</div>
            <div style={{width:52}}>POS</div>
            <div style={{width:56,textAlign:"right"}}>先週</div>
            <div style={{width:108}}>今週の体重</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {sorted.map(p=>{
              const lwDate=lastWeekThursdayStr();
              const lastWeekW=p.measurements.find(m=>m.date===lwDate)?.weight??null;
              const lw=latestWeight(p); // プレースホルダー用
              const f=weights[p.id]&&!isNaN(parseFloat(weights[p.id]));
              const thisW=f?parseFloat(weights[p.id]):null;
              const diff=thisW!==null&&lastWeekW!==null?Math.round((thisW-lastWeekW)*10)/10:null;
              const grade=calcGrade(p.birthDate);
              const mgrTeamC=p.team?TEAM_COLORS[p.team]:null;
              const teamNum=p.team??0;
              const thuUnmeasuredRow=isThursdayUnmeasured(p);
              const showGradeHeader=sortMode==="grade"&&grade!==lastGrade;
              const showTeamHeader=sortMode==="team"&&teamNum!==lastTeamM;
              const showThuHeader=sortMode==="thursday"&&thuUnmeasuredRow!==lastThuSection;
              if(sortMode==="grade")lastGrade=grade;
              else if(sortMode==="team")lastTeamM=teamNum;
              else lastThuSection=thuUnmeasuredRow;
              const rowBg=thuUnmeasuredRow&&!mgrTeamC?"#FFF7ED":mgrTeamC?mgrTeamC.bg:"transparent";
              const rowBorderColor=thuUnmeasuredRow&&!mgrTeamC?"#F97316":mgrTeamC?mgrTeamC.color:"transparent";
              return(
              <div key={p.id}>
                {showGradeHeader&&(
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:grade<3?8:0,marginBottom:6}}>
                    <div style={{height:1,flex:1,background:BORDER}}/>
                    <span style={{fontSize:11,fontWeight:800,color:MAROON,letterSpacing:"0.1em",padding:"0 4px"}}>{grade}年生</span>
                    <div style={{height:1,flex:1,background:BORDER}}/>
                  </div>
                )}
                {showTeamHeader&&(
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,marginBottom:4}}>
                    <div style={{height:2,flex:1,background:mgrTeamC?mgrTeamC.border:BORDER,borderRadius:1}}/>
                    <span style={{fontSize:12,fontWeight:800,color:mgrTeamC?mgrTeamC.color:MUTED,padding:"2px 8px",background:mgrTeamC?mgrTeamC.bg:"transparent",borderRadius:8,border:`1px solid ${mgrTeamC?mgrTeamC.border:BORDER}`}}>
                      {teamNum>0?`Team ${teamNum}`:"チーム未設定"}
                    </span>
                    <div style={{height:2,flex:1,background:mgrTeamC?mgrTeamC.border:BORDER,borderRadius:1}}/>
                  </div>
                )}
                {showThuHeader&&(
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,marginBottom:4}}>
                    <div style={{height:1,flex:1,background:thuUnmeasuredRow?"#FED7AA":BORDER}}/>
                    <span style={{fontSize:11,fontWeight:800,color:thuUnmeasuredRow?"#B45309":GREEN,padding:"2px 8px",background:thuUnmeasuredRow?"#FFF7ED":"#F0FFF4",borderRadius:8,border:`1px solid ${thuUnmeasuredRow?"#FED7AA":"#BBF7D0"}`}}>
                      {thuUnmeasuredRow?"📅 未計測":"✓ 計測済み"}
                    </span>
                    <div style={{height:1,flex:1,background:thuUnmeasuredRow?"#FED7AA":BORDER}}/>
                  </div>
                )}
                <div style={{display:"flex",alignItems:"center",gap:8,borderRadius:8,padding:"4px 6px",background:rowBg,borderLeft:`3px solid ${rowBorderColor}`}}>
                  <div style={{flex:2,fontSize:14,fontWeight:600,color:TEXT,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",display:"flex",alignItems:"center",gap:4}}>
                    {thuUnmeasuredRow&&<span style={{fontSize:10,background:"#F97316",color:"#fff",borderRadius:4,padding:"1px 4px",fontWeight:800,flexShrink:0}}>未</span>}
                    {p.name}
                  </div>
                  <div style={{width:52,fontSize:11,color:MUTED,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{p.position[0]||"—"}{p.position.length>1&&<span style={{color:MUTED2}}>+{p.position.length-1}</span>}</div>
                  <div style={{width:56,textAlign:"right"}}>
                    <div style={{fontSize:13,color:MUTED2,fontWeight:600}}>{lastWeekW!==null?`${lastWeekW}`:"—"}</div>
                    {diff!==null&&<div style={{fontSize:10,fontWeight:700,color:diff>0?GREEN:diff<0?RED:MUTED2}}>{diff>0?`▲+${diff}`:diff<0?`▼${diff}`:"±0"}</div>}
                  </div>
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
// 2026年オフシーズンコンペティション チーム割り当てマップ
const COMP_TEAM_MAP:{name:string;team:number;grade?:number}[]=[
  // Team 1
  {name:"伊藤",team:1},{name:"八重樫",team:1},{name:"玉井",team:1},
  {name:"清家",team:1},{name:"佐々木",team:1},{name:"倉地",team:1},{name:"海老原",team:1},
  // Team 2
  {name:"野田",team:2},{name:"須江",team:2},{name:"岸",team:2},
  {name:"山口",team:2},{name:"長山",team:2},{name:"藤原",team:2},{name:"糠谷",team:2},
  // Team 3
  {name:"芥川",team:3},{name:"本田",team:3},{name:"舟根",team:3},
  {name:"金谷",team:3},{name:"慶田",team:3},{name:"宮原",team:3},{name:"谷口",team:3},
  // Team 4
  {name:"行方",team:4},{name:"小林",team:4,grade:3},{name:"松本",team:4},
  {name:"後藤",team:4},{name:"小坪",team:4},{name:"吉本",team:4},{name:"藤本",team:4},
  // Team 5
  {name:"山本",team:5},{name:"林",team:5},{name:"生田",team:5},
  {name:"小川",team:5},{name:"岩本",team:5},{name:"原",team:5},{name:"小林",team:5,grade:1},
];
function autoAssignTeam(p:Player):number|undefined{
  const last=p.name.split(/[\s　]/)[0]; // 姓（最初の単語）
  const grade=calcGrade(p.birthDate);
  // 同姓で学年指定あり → 学年で絞り込み
  const gradeSpecific=COMP_TEAM_MAP.filter(m=>last.startsWith(m.name)||m.name.startsWith(last)).filter(m=>m.grade!==undefined);
  if(gradeSpecific.length>0){
    const gm=gradeSpecific.find(m=>m.grade===grade);
    if(gm)return gm.team;
  }
  // 通常マッチ（学年指定なし）
  const match=COMP_TEAM_MAP.find(m=>m.grade===undefined&&(last.startsWith(m.name)||m.name.startsWith(last)));
  return match?.team;
}

function CoachScreen({players,onBack,onPlayerClick,onDelete,onBulkUpdate}:{players:Player[];onBack:()=>void;onPlayerClick:(p:Player)=>void;onDelete:(id:string)=>void;onBulkUpdate:(updated:Player[])=>void;}){
  const[sortKey,setSortKey]=useState<SortKey>("grade");
  const[sortDir,setSortDir]=useState<SortDir>("desc"); // 学年デフォルト：3年→1年
  const[delId,setDelId]=useState<string|null>(null);
  const[autoAssigned,setAutoAssigned]=useState(false);
  const handleSort=(key:SortKey)=>{if(key===sortKey)setSortDir(d=>d==="asc"?"desc":"asc");else{setSortKey(key);setSortDir("asc");}};
  const sorted=sortPlayers(players,sortKey,sortDir);
  const rkPos=(pos:string[])=>{if(!pos.length)return POS_ORDER.length;const idx=POS_ORDER.indexOf(pos[0]);return idx>=0?idx:POS_ORDER.length;};
  let lastPosGroup="";
  let lastGradeCoach=-1;
  let lastTeamCoach=-1;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
        <BackBtn onClick={onBack}/>
        <span style={{fontSize:18,fontWeight:800,color:TEXT,flex:1}}>コーチ：全選手一覧</span>
        {!autoAssigned&&(
          <button onClick={()=>{
            const updated=players.map(p=>({...p,team:autoAssignTeam(p)??p.team}));
            onBulkUpdate(updated);setAutoAssigned(true);
          }} style={{padding:"7px 12px",borderRadius:10,background:GOLD_L,border:`1px solid ${GOLD}`,color:"#7a5000",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
            🏈 チーム自動設定
          </button>
        )}
        {autoAssigned&&<span style={{fontSize:11,color:GREEN,fontWeight:700}}>✓ チーム設定済み</span>}
      </div>
      {/* 単独ソート */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {SORT_OPTIONS.filter(o=>!o.compound).map(opt=>{const ac=opt.key===sortKey;return(
          <button key={opt.key} onClick={()=>handleSort(opt.key)} style={{padding:"7px 13px",borderRadius:20,fontSize:12,fontWeight:ac?700:400,background:ac?MAROON:"transparent",color:ac?"#fff":MUTED,border:`1px solid ${ac?MAROON:BORDER}`,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",minHeight:40}}>
            {opt.label}{ac?(sortDir==="asc"?" ↑":" ↓"):""}
          </button>);})}
      </div>
      {/* 複合ソート */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:10,fontWeight:700,color:MUTED2,whiteSpace:"nowrap",letterSpacing:"0.05em"}}>複合</span>
        {SORT_OPTIONS.filter(o=>o.compound).map(opt=>{const ac=opt.key===sortKey;return(
          <button key={opt.key} onClick={()=>handleSort(opt.key)}
            style={{padding:"6px 11px",borderRadius:20,fontSize:11,fontWeight:ac?700:400,
              background:ac?"#2563EB":"transparent",color:ac?"#fff":MUTED,
              border:`1px solid ${ac?"#2563EB":BORDER}`,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",minHeight:36}}>
            {opt.label}{ac?(sortDir==="asc"?" ↑":" ↓"):""}
          </button>);})}
      </div>
      {sorted.length===0?<Card><div style={{textAlign:"center",color:MUTED,fontSize:14,padding:"20px 0"}}>選手が登録されていません</div></Card>:
        sorted.map(p=>{
          const cw=latestWeight(p)??0,g=calcGoalInfo(p,cw),sl=statusStyle(calcStatus(p,g));
          const lastDate=[...p.measurements].sort((a,b)=>b.date.localeCompare(a.date))[0]?.date;
          const daysSince=lastDate?Math.round((Date.now()-new Date(lastDate).getTime())/86400000):null;
          const isDeleting=delId===p.id;
          const thuUnmeasured=isThursdayUnmeasured(p);
          const tr=thursdayRate(p);
          // 実際の月間増加率（直近8週間のみ使用：古い誤入力の影響を排除）
          const ms=[...p.measurements].sort((a,b)=>a.date.localeCompare(b.date));
          const cutoffDate=new Date();cutoffDate.setDate(cutoffDate.getDate()-56);
          const cutoffStr=`${cutoffDate.getFullYear()}-${String(cutoffDate.getMonth()+1).padStart(2,"0")}-${String(cutoffDate.getDate()).padStart(2,"0")}`;
          const recentMs=ms.filter(m=>m.date>=cutoffStr);
          let actualGain:number|null=null;
          if(recentMs.length>=2){
            const days=Math.max(1,Math.round((new Date(recentMs[recentMs.length-1].date).getTime()-new Date(recentMs[0].date).getTime())/86400000));
            // 4週間（28日）以上のデータがある場合のみ表示
            if(days>=28)actualGain=Math.round((recentMs[recentMs.length-1].weight-recentMs[0].weight)/days*30*10)/10;
          }
          const gainColor=actualGain===null?MUTED:g.monthlyNeeded<=0?GREEN:actualGain>=g.monthlyNeeded?GREEN:actualGain>=g.monthlyNeeded*0.4?"#a07000":RED;
          // チーム情報
          const teamNum=p.team;
          const teamC=teamNum?TEAM_COLORS[teamNum]:null;
          // チーム区切り
          const showTeamHeader=sortKey==="team"&&teamNum!==lastTeamCoach;
          const lastTeamCoachBefore=lastTeamCoach;void lastTeamCoachBefore;
          lastTeamCoach=teamNum??-1;
          // ポジション区切り
          const posIdx=rkPos(p.position);
          const posGroup=posIdx<POS_ORDER.length?POS_ORDER[posIdx]:"未設定";
          const isPosPrimary=sortKey==="position"||sortKey==="position_weight"||sortKey==="position_status";
          const showPosHeader=isPosPrimary&&posGroup!==lastPosGroup;
          lastPosGroup=posGroup;
          // 学年区切り
          const grade=calcGrade(p.birthDate);
          const isGradePrimary=sortKey==="grade"||sortKey==="grade_weight"||sortKey==="grade_status"||sortKey==="grade_gain";
          const showGradeHeader=isGradePrimary&&grade!==lastGradeCoach;
          lastGradeCoach=grade;
          return(
            <div key={p.id}>
              {showTeamHeader&&(
                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,marginBottom:2}}>
                  <div style={{height:2,flex:1,background:teamC?.color??BORDER}}/>
                  <span style={{fontSize:11,fontWeight:800,color:teamC?.color??MUTED,letterSpacing:"0.1em",padding:"0 6px",background:teamC?.bg??"#fff",borderRadius:6,border:`1px solid ${teamC?.border??BORDER}`}}>
                    {teamNum?`Team ${teamNum}`:"チーム未設定"}
                  </span>
                  <div style={{height:2,flex:1,background:teamC?.color??BORDER}}/>
                </div>
              )}
              {showGradeHeader&&(
                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:lastGradeCoach===grade?0:8,marginBottom:2}}>
                  <div style={{height:1,flex:1,background:BORDER}}/>
                  <span style={{fontSize:11,fontWeight:800,color:MAROON,letterSpacing:"0.1em",padding:"0 4px"}}>{grade}年生</span>
                  <div style={{height:1,flex:1,background:BORDER}}/>
                </div>
              )}
              {showPosHeader&&(
                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,marginBottom:2}}>
                  <div style={{height:1,flex:1,background:BORDER}}/>
                  <span style={{fontSize:11,fontWeight:800,color:MAROON,letterSpacing:"0.1em",padding:"0 4px"}}>{posGroup}</span>
                  <div style={{height:1,flex:1,background:BORDER}}/>
                </div>
              )}
              <div style={{background:teamC?teamC.bg:CARD,border:`1px solid ${isDeleting?RED:thuUnmeasured?"#d97706":teamC?teamC.border:sl.brd}`,borderRadius:12,overflow:"hidden"}}>
                {thuUnmeasured&&(
                  <div style={{background:"#fffbeb",borderBottom:"1px solid #fcd34d",padding:"5px 14px",fontSize:11,fontWeight:700,color:"#92400e",display:"flex",alignItems:"center",gap:6}}>
                    📅 直近木曜（{lastThursdayStr().slice(5).replace("-","/")}）未計測
                  </div>
                )}
                <div style={{padding:"14px 16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <button onClick={()=>onPlayerClick(p)} style={{flex:1,background:"none",border:"none",textAlign:"left",cursor:"pointer",fontFamily:"inherit",padding:0}}>
                      <div style={{fontSize:15,fontWeight:700,color:TEXT,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                        {p.name}
                        {teamC&&<span style={{fontSize:10,fontWeight:800,color:teamC.color,background:teamC.bg,border:`1px solid ${teamC.border}`,borderRadius:8,padding:"1px 7px"}}>Team {teamNum}</span>}
                        <span style={{fontSize:12,fontWeight:400}}>
                          <span style={{color:MUTED,fontWeight:700}}>{p.position[0]||"未設定"}</span>
                          {p.position.slice(1).map(sp=><span key={sp} style={{color:MUTED2}}>{"・"+sp}</span>)}
                        </span>
                      </div>
                      <div style={{fontSize:13,color:TEXT,marginTop:3}}>現在 <strong>{cw||"未計測"}</strong>{cw?" kg":""}{cw>0&&<> → 目標 <strong style={{color:MAROON}}>{g.target} kg</strong>（{g.goalType==="recomp"?"体型改善中":g.goalType==="cut"?"減量中":"次の大会まで"}）</>}</div>
                      <div style={{fontSize:12,color:MUTED,marginTop:1}}>
                        {cw>0?<>
                          あと {g.gainNeeded} kg
                          {actualGain!==null&&<> ／ 実績 <strong style={{color:gainColor}}>{actualGain>=0?"+":""}{actualGain}kg/月</strong></>}
                          <span style={{marginLeft:6}}>（必要 +{g.monthlyNeeded}kg/月）</span>
                        </>:"体重未記録"}
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4,flexWrap:"wrap"}}>
                        {tr.total>0&&(
                          <span style={{fontSize:11,color:tr.rate>=80?GREEN:tr.rate>=50?"#a07000":RED,fontWeight:700,background:tr.rate>=80?OK_BG:tr.rate>=50?WN_BG:NG_BG,border:`1px solid ${tr.rate>=80?OK_BRD:tr.rate>=50?WN_BRD:NG_BRD}`,borderRadius:5,padding:"2px 7px"}}>
                            📊 計測率 {tr.rate}%（{tr.measured}/{tr.total}回）
                          </span>
                        )}
                        {daysSince!==null&&daysSince>14&&<span style={{fontSize:11,color:RED,fontWeight:600}}>⚠ {daysSince}日間未記録</span>}
                      </div>
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
// ---- Guide Screen ----
const GUIDE_STEPS=[
  {
    emoji:"🌐",
    title:"アクセス方法",
    lines:[
      "スマホのブラウザで以下のURLを開く",
      "sports-rehab-app.vercel.app/weight",
      "共通PINを入力してログイン（スタッフから通知されます）",
      "📌 ホーム画面に追加しておくと\n　次回からアイコン1タップで開ける",
    ],
    highlight:1, // 1-indexed: URL行をハイライト
  },
  {
    emoji:"👤",
    title:"自分を見つけてマイページ設定",
    lines:[
      "「選手として記録する」をタップ",
      "一覧から自分の名前を探してタップ",
      "⭐「マイページに設定」をタップ",
      "次回からホームに自分が最上部に表示される",
    ],
    highlight:2,
  },
  {
    emoji:"⚖️",
    title:"体重を毎週木曜日に記録",
    lines:[
      "木曜日に体重計で計測",
      "数字を入力して「記録する」をタップ",
      "計測し忘れても日付を変えて入力できる",
      "📅 木曜以外でも入力OK・複数回入力は上書き",
    ],
    highlight:0,
  },
  {
    emoji:"📈",
    title:"目標・グラフで進捗確認",
    lines:[
      "目標体重・残り日数・必要ペースが表示される",
      "グラフで1ヶ月〜最終目標まで推移を確認",
      "増量ペースが遅れると赤・黄・緑でお知らせ",
      "フェーズ目標（6ヶ月→1年→最終）で段階管理",
    ],
    highlight:0,
  },
  {
    emoji:"🍚",
    title:"食事の目安カロリーを参考に",
    lines:[
      "自分の目標ペースに合った摂取カロリーを表示",
      "練習日・オフ日それぞれ自動計算",
      "コンビニ・外食・自炊の具体的メニュー例あり",
      "練習前後の補食もセクション別に確認できる",
    ],
    highlight:0,
  },
];
function GuideScreen({onBack}:{onBack:()=>void}){
  const[step,setStep]=useState(0);
  const s=GUIDE_STEPS[step];
  const isLast=step===GUIDE_STEPS.length-1;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:0,minHeight:"70vh"}}>
      {/* ヘッダー */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
        <BackBtn onClick={onBack}/>
        <span style={{fontSize:18,fontWeight:800,color:TEXT}}>使い方ガイド</span>
        <span style={{marginLeft:"auto",fontSize:13,color:MUTED,fontWeight:600}}>{step+1} / {GUIDE_STEPS.length}</span>
      </div>
      {/* ステップインジケーター */}
      <div style={{display:"flex",gap:6,marginBottom:24}}>
        {GUIDE_STEPS.map((_,i)=>(
          <div key={i} onClick={()=>setStep(i)} style={{flex:1,height:4,borderRadius:2,background:i<=step?MAROON:BORDER,cursor:"pointer",transition:"background 0.2s"}}/>
        ))}
      </div>
      {/* メインカード */}
      <div style={{background:CARD,border:`2px solid ${MAROON}33`,borderRadius:20,padding:"32px 24px",flex:1,display:"flex",flexDirection:"column",gap:20,marginBottom:20}}>
        <div style={{textAlign:"center",fontSize:64,lineHeight:1}}>{s.emoji}</div>
        <div style={{fontSize:20,fontWeight:900,color:MAROON,textAlign:"center",lineHeight:1.3}}>{s.title}</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {s.lines.map((line,i)=>{
            const isHL=s.highlight>0&&i===s.highlight;
            return(
              <div key={i} style={{
                background:isHL?MAROON_L:"transparent",
                border:isHL?`1px solid ${MAROON}44`:"none",
                borderRadius:isHL?8:0,
                padding:isHL?"10px 14px":"0 2px",
                fontSize:isHL?15:14,
                fontWeight:isHL?800:500,
                color:isHL?MAROON:TEXT,
                lineHeight:1.6,
                letterSpacing:isHL?"0.04em":"normal",
                fontFamily:"monospace, sans-serif",
                whiteSpace:"pre-wrap",
              }}>
                {!isHL&&<span style={{color:MAROON,fontWeight:800,marginRight:6}}>{"·"}</span>}
                {line}
              </div>
            );
          })}
        </div>
      </div>
      {/* ナビゲーション */}
      <div style={{display:"flex",gap:10}}>
        {step>0&&(
          <button onClick={()=>setStep(step-1)} style={{flex:1,height:52,borderRadius:12,background:"#fff",border:`2px solid ${BORDER}`,fontSize:15,fontWeight:700,color:MUTED,cursor:"pointer",fontFamily:"inherit"}}>
            ← 前へ
          </button>
        )}
        {!isLast?(
          <button onClick={()=>setStep(step+1)} style={{flex:2,height:52,borderRadius:12,background:MAROON,border:"none",fontSize:16,fontWeight:800,color:"#fff",cursor:"pointer",fontFamily:"inherit"}}>
            次へ →
          </button>
        ):(
          <button onClick={onBack} style={{flex:2,height:52,borderRadius:12,background:GOLD,border:"none",fontSize:16,fontWeight:800,color:"#fff",cursor:"pointer",fontFamily:"inherit"}}>
            🦉 さあ始めよう！
          </button>
        )}
      </div>
    </div>
  );
}

function HomeScreen({onPlayer,onManager,onCoach,onDemo,onGuide,showDemo,myPlayer,onMyPage}:{
  onPlayer:()=>void;onManager:()=>void;onCoach:()=>void;onDemo:()=>void;onGuide:()=>void;showDemo:boolean;
  myPlayer?:Player;onMyPage?:()=>void;
}){
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
      {/* 使い方ガイド */}
      <button onClick={onGuide} style={{minHeight:52,borderRadius:12,background:"transparent",border:`1.5px solid ${MAROON}55`,fontSize:14,color:MAROON,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        <span style={{fontSize:20}}>📖</span>
        <span>使い方ガイド</span>
      </button>
      {showDemo&&(
        <button onClick={onDemo} style={{minHeight:52,borderRadius:12,background:"transparent",border:`2px dashed ${GOLD}`,fontSize:14,color:"#8B5A00",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
          🎮 デモデータ（30人）を読み込む
        </button>
      )}
      {/* 体重アップガイド（Notion） */}
      <a href="https://rumbling-kiss-534.notion.site/Weight-up-a278340a49c44a2784f6a98d0146e81b?source=copy_link" target="_blank" rel="noopener noreferrer"
        style={{minHeight:52,borderRadius:12,background:"transparent",border:`1.5px solid ${GOLD}`,fontSize:14,color:"#8B5A00",fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8,textDecoration:"none"}}>
        <span style={{fontSize:20}}>📈</span>
        <span>体重アップガイド（Notion）</span>
      </a>
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
  // キャッシュ警告（初回のみ）
  const[showCacheWarning,setShowCacheWarning]=useState(false);
  // クラウド同期状態
  const[cloudSyncing,setCloudSyncing]=useState(false);
  const txRef=useRef(0);
  const tyRef=useRef(0);
  // スクロール位置保存（画面ごと）
  const scrollSaveRef=useRef<Partial<Record<Screen,number>>>({});
  // 「戻る」ナビゲーションかどうかのフラグ
  const isBackNavRef=useRef(false);
  // 初回クラウド同期中にローカル編集したか。trueなら取得結果でローカルを上書きしない（編集消失防止）。
  const hasLocalEditsRef=useRef(false);

  useEffect(()=>{
    try{
      // 認証チェック
      const ok=localStorage.getItem("af_auth_ok");
      setAuthed(ok==="1");
      // まずローカルキャッシュを即時表示
      const raw=localStorage.getItem("af_weight_players");
      if(raw){
        const cached=(JSON.parse(raw) as any[]).map(migratePlayer);
        setPlayers(cached);
        // 差分保存の基準（この端末が認識するクラウド状態）をローカルキャッシュで初期化。
        // クラウド取得に失敗しても、触っていない選手を巻き戻さないために必要。
        cloudSeedSnapshot(cached);
      }
      const myId=localStorage.getItem("af_my_player");
      if(myId)setMyPlayerIdState(myId);
      // キャッシュ警告：初回ログイン時のみ表示（クラウド化後は警告不要だが念のため残す）
      if(!localStorage.getItem("owls_cache_warned")){
        setShowCacheWarning(isSupabaseEnabled?false:true);
        localStorage.setItem("owls_cache_warned","1");
      }
    }catch{setAuthed(false);}
    // クラウドから最新データを取得（ローカルより優先）
    if(isSupabaseEnabled){
      setCloudSyncing(true);
      cloudFetchPlayers().then(cloudData=>{
        // 同期中に手元で編集していたら、その編集を消さないよう取得結果で上書きしない
        if(cloudData!==null&&cloudData.length>0&&!hasLocalEditsRef.current){
          const migrated=cloudData.map(migratePlayer);
          setPlayers(migrated);
          // 差分保存の基準を最新クラウド状態で更新（以後はここからの変更分だけ書き込む）
          cloudSeedSnapshot(migrated);
          localStorage.setItem("af_weight_players",JSON.stringify(migrated));
        }
      }).catch(console.error).finally(()=>setCloudSyncing(false));
    }
    if(typeof window!=="undefined"&&"serviceWorker"in navigator){
      navigator.serviceWorker.register("/sw.js").then(reg=>{
        if(isThursday()&&"Notification"in window&&Notification.permission==="granted"){
          reg.showNotification("🦉 NISHI OWLS - 今日は計測日！",{body:"体重を記録しましょう！毎週木曜が計測日です。",tag:"thursday-reminder",icon:"/favicon.ico"});
        }
      }).catch(()=>{});
    }
  },[]);

  // 画面遷移時のスクロール制御
  // 「戻る」ナビゲーションのときは保存位置を復元、それ以外はトップへ
  useEffect(()=>{
    if(typeof window==="undefined")return;
    if(isBackNavRef.current){
      const saved=scrollSaveRef.current[screen];
      isBackNavRef.current=false;
      if(saved!==undefined){
        // 2フレーム待ってから復元（コンテンツのレンダリング完了を待つ）
        requestAnimationFrame(()=>requestAnimationFrame(()=>window.scrollTo(0,saved)));
        return;
      }
    }
    window.scrollTo(0,0);
  },[screen]);

  const save=(updated:Player[])=>{
    hasLocalEditsRef.current=true;
    setPlayers(updated);
    localStorage.setItem("af_weight_players",JSON.stringify(updated));
    // クラウドへバックグラウンド同期（デモ選手は除外）
    if(isSupabaseEnabled){
      const real=updated.filter(p=>!p.id.startsWith("demo_"));
      cloudSavePlayers(real).catch(console.error);
    }
  };
  const cur=(p:Player)=>players.find(x=>x.id===p.id)??p;
  const goDetail=(p:Player,from:Screen)=>{
    // 遷移前のスクロール位置を保存
    if(typeof window!=="undefined")scrollSaveRef.current[from]=window.scrollY;
    setSelected(p);setPrevScreen(from);setScreen("player_detail");
  };
  const loadDemo=()=>{save(buildDemoPlayers());setScreen("player_list");};
  const setMyPlayer=(id:string|null)=>{
    setMyPlayerIdState(id);
    if(id)localStorage.setItem("af_my_player",id);
    else localStorage.removeItem("af_my_player");
  };
  const myPlayer=players.find(p=>p.id===myPlayerId)??null;

  // 統合「戻る」ナビゲーション
  const goBack=()=>{
    isBackNavRef.current=true; // 戻るナビゲーションとしてマーク
    switch(screen){
      case"player_list":case"coach_pin":case"manager_bulk":case"guide":setScreen("home");break;
      case"player_new":setScreen("player_list");break;
      case"player_edit":setScreen("player_detail");break;
      case"player_detail":setScreen(prevScreen);break;
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
      {/* ☁ クラウド同期中インジケーター */}
      {cloudSyncing&&(
        <div style={{position:"fixed",top:12,right:12,zIndex:400,background:"rgba(0,0,0,0.65)",color:"#fff",borderRadius:20,padding:"5px 12px",fontSize:12,display:"flex",alignItems:"center",gap:6}}>
          <span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:GOLD,animation:"pulse 1s infinite"}}/>
          同期中…
        </div>
      )}
      {/* ⚠ キャッシュ警告（クラウド未設定時のみ） */}
      {showCacheWarning&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:CARD,borderRadius:18,padding:"24px 20px",maxWidth:380,width:"100%",boxShadow:"0 8px 40px #0004"}}>
            <div style={{fontSize:30,textAlign:"center",marginBottom:8}}>⚠️</div>
            <div style={{fontSize:17,fontWeight:900,color:MAROON,textAlign:"center",marginBottom:12}}>大事なお知らせ</div>
            <div style={{fontSize:14,color:TEXT,lineHeight:1.8,marginBottom:16}}>
              このアプリのデータはスマホのブラウザ内に保存されています。<br/>
              <strong style={{color:RED}}>「閲覧履歴の削除」や「キャッシュのクリア」を行うとデータが消えます。</strong><br/>
              ブラウザの閲覧データを削除するときは注意してください。
            </div>
            <div style={{fontSize:12,color:MUTED,background:"#f5f0ea",borderRadius:8,padding:"8px 12px",marginBottom:16,lineHeight:1.6}}>
              💡 ホーム画面に追加（ブックマーク）しておくと、誤って削除するリスクが減ります。
            </div>
            <button onClick={()=>setShowCacheWarning(false)} style={{width:"100%",height:48,borderRadius:12,background:MAROON,color:"#fff",border:"none",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
              わかった
            </button>
          </div>
        </div>
      )}
      <div style={{maxWidth:560,margin:"0 auto",padding:"16px 16px 100px"}}>
        {screen==="home"&&<HomeScreen onPlayer={()=>setScreen("player_list")} onManager={()=>setScreen("manager_bulk")} onCoach={()=>coachOK?setScreen("coach_dashboard"):setScreen("coach_pin")} onDemo={loadDemo} onGuide={()=>setScreen("guide")} showDemo={players.length===0} myPlayer={myPlayer??undefined} onMyPage={myPlayer?()=>goDetail(myPlayer,"home"):undefined}/>}
        {screen==="guide"&&<GuideScreen onBack={goBack}/>}
        {screen==="player_list"&&<PlayerListScreen players={players} onSelect={p=>goDetail(p,"player_list")} onNew={()=>setScreen("player_new")} onBack={goBack} myPlayerId={myPlayerId??undefined}/>}
        {screen==="player_new"&&(
          <PlayerFormScreen title="選手を登録" showWeight={true}
            onSave={d=>{const p:Player={id:Date.now().toString(),name:d.name,height:d.height,birthDate:d.birthDate,position:d.position,targetWeightSep:0,targetWeightApr:0,measurements:[{date:todayStr(),weight:d.weight??0}],constitution:d.constitution};const upd=[...players,p];save(upd);setSelected(p);setScreen("player_detail");}}
            onBack={goBack}/>
        )}
        {screen==="player_edit"&&selected&&(
          <PlayerFormScreen title="選手情報を編集" showWeight={false}
            init={{name:selected.name,height:String(selected.height),birthDate:selected.birthDate,position:selected.position,constitution:selected.constitution}}
            onSave={d=>{const upd=players.map(p=>p.id===selected.id?{...p,name:d.name,height:d.height,birthDate:d.birthDate,position:d.position,constitution:d.constitution}:p);save(upd);setSelected(upd.find(p=>p.id===selected.id)??selected);setScreen("player_detail");}}
            onBack={goBack}/>
        )}
        {screen==="player_detail"&&selected&&(
          <PlayerDetailScreen player={cur(selected)} players={players} isCoach={coachOK}
            fromCoach={prevScreen==="coach_dashboard"}
            onBack={goBack} onEdit={()=>setScreen("player_edit")}
            onUpdate={upd=>{save(players.map(p=>p.id===upd.id?upd:p));setSelected(upd);}}
            myPlayerId={myPlayerId??undefined} onSetMyPlayer={setMyPlayer}/>
        )}
        {screen==="coach_pin"&&<PinScreen title="コーチ確認" pinCheck={p=>p===COACH_PIN} onUnlock={()=>{setCoachOK(true);setScreen("coach_dashboard");}} onBack={goBack}/>}
        {screen==="coach_dashboard"&&(<CoachScreen players={players} onBack={goBack} onPlayerClick={p=>goDetail(p,"coach_dashboard")} onDelete={id=>{const upd=players.filter(p=>p.id!==id);save(upd);if(isSupabaseEnabled)cloudDeletePlayer(id).catch(console.error);}} onBulkUpdate={save}/>)}
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
