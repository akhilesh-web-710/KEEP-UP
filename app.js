const $ = (s) => document.querySelector(s);
const today = new Date();
$("#todayLabel").textContent = today.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
let sport = "all", filter = "all";
const demoMatches = [
 {id:"c1",sport:"cricket",league:"International · T20",status:"live",a:"India",b:"Australia",ea:"🇮🇳",eb:"🇦🇺",sa:"182/5",sb:"96/2",da:"18.2 overs",db:"10.4 overs",note:"India need 36 runs from 10 balls"},
 {id:"f1",sport:"football",league:"Premier League",status:"live",a:"Arsenal",b:"Liverpool",ea:"🔴",eb:"🔺",sa:"2",sb:"1",da:"72′",db:"Live",note:"Second half"},
 {id:"c2",sport:"cricket",league:"Domestic · T20",status:"upcoming",a:"Kerala",b:"Mumbai",ea:"🟡",eb:"🔵",sa:"—",sb:"—",da:"Tomorrow · 2:00 PM",db:"",note:"T20 fixture"},
 {id:"f2",sport:"football",league:"UEFA Champions League",status:"upcoming",a:"Real Madrid",b:"Manchester City",ea:"⚪",eb:"🔵",sa:"—",sb:"—",da:"Tomorrow · 12:30 AM",db:"",note:"Match preview"},
 {id:"c3",sport:"cricket",league:"International · ODI",status:"finished",a:"South Africa",b:"New Zealand",ea:"🇿🇦",eb:"🇳🇿",sa:"274/8",sb:"276/6",da:"50 overs",db:"48.3 overs",note:"New Zealand won by 4 wickets"},
 {id:"f3",sport:"football",league:"La Liga",status:"finished",a:"Barcelona",b:"Atletico Madrid",ea:"🔵",eb:"🔴",sa:"3",sb:"2",da:"FT",db:"",note:"Full time"}
];
let matches = [...demoMatches];
let favorites = JSON.parse(localStorage.getItem("keepUpFavorites") || "[]");
const cricketKey = () => localStorage.getItem("keepUpCricketKey") || "";
const footballKey = () => localStorage.getItem("keepUpFootballKey") || "";
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function render(){
 const visible = matches.filter(m=>(sport==="all"||m.sport===sport)&&(filter==="all"||m.status===filter||(filter==="favorites"&&favorites.includes(m.id))));
 $("#matches").innerHTML = visible.length ? visible.map(m=>`
 <article class="match-card ${m.status}">
  <div class="match-top"><span class="league">${m.sport==="cricket"?"🏏":"⚽"} ${esc(m.league)}</span><span class="${m.status==="live"?"live-tag":""}">${m.status==="live"?"LIVE":m.status==="finished"?"FINISHED":"UPCOMING"}</span></div>
  <div class="teams">
   <div class="team"><div class="team-emoji">${m.ea||"🏳️"}</div><span class="team-name">${esc(m.a)}</span><div class="team-score">${esc(m.sa)}</div><div class="team-detail">${esc(m.da||"")}</div></div>
   <div class="versus">${m.status==="live"?"VS":"·"}</div>
   <div class="team"><div class="team-emoji">${m.eb||"🏳️"}</div><span class="team-name">${esc(m.b)}</span><div class="team-score">${esc(m.sb)}</div><div class="team-detail">${esc(m.db||"")}</div></div>
  </div>
  <div class="match-foot"><span>${esc(m.note||"Match centre")}</span><button class="save-match ${favorites.includes(m.id)?"saved":""}" data-save="${esc(m.id)}" aria-label="Save match">${favorites.includes(m.id)?"★":"☆"}</button></div>
 </article>`).join("") : `<div class="empty">No matches in this section yet.<br><br>Try another filter or refresh scores.</div>`;
 $("#statusLine").textContent = matches.some(m=>m.source) ? "Sports data loaded · Check provider timestamps" : "Demo matches shown · Connect API keys in Settings for provider data";
}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200);}
document.addEventListener("click",e=>{
 const tab=e.target.closest("[data-sport]"); if(tab){sport=tab.dataset.sport;document.querySelectorAll(".sport-tab").forEach(x=>x.classList.toggle("active",x===tab));$("#sectionTitle").textContent=sport==="all"?"The latest action":sport==="cricket"?"Cricket centre":"Football centre";render();}
 const chip=e.target.closest("[data-filter]");if(chip){filter=chip.dataset.filter;document.querySelectorAll(".filter-chip").forEach(x=>x.classList.toggle("selected",x===chip));render();}
 const save=e.target.closest("[data-save]");if(save){const id=save.dataset.save;favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];localStorage.setItem("keepUpFavorites",JSON.stringify(favorites));render();}
 const page=e.target.closest("[data-page]");if(page){if(page.dataset.page==="chat")openChat();else{filter=page.dataset.page==="saved"?"favorites":"all";document.querySelectorAll(".filter-chip").forEach(x=>x.classList.toggle("selected",x.dataset.filter===filter));render();document.querySelectorAll(".bottom-item").forEach(x=>x.classList.toggle("active",x===page));}}
});
$("#settingsBtn").addEventListener("click",()=>{$("#cricketKey").value=cricketKey();$("#footballKey").value=footballKey();$("#settingsDialog").showModal();});
$("#saveKeys").addEventListener("click",()=>{localStorage.setItem("keepUpCricketKey",$("#cricketKey").value.trim());localStorage.setItem("keepUpFootballKey",$("#footballKey").value.trim());$("#settingsDialog").close();toast("Keys saved on this device");refreshScores();});
$("#clearKeys").addEventListener("click",()=>{localStorage.removeItem("keepUpCricketKey");localStorage.removeItem("keepUpFootballKey");$("#cricketKey").value="";$("#footballKey").value="";toast("Saved keys removed");});
async function refreshScores(){
 $("#statusLine").textContent="Refreshing available sports data…";
 let loaded=0, errors=[];
 if(cricketKey()){
  try{
   const r=await fetch(`https://api.cricapi.com/v1/currentMatches?apikey=${encodeURIComponent(cricketKey())}&offset=0`);
   if(!r.ok)throw new Error(`Cricket API HTTP ${r.status}`);
   const j=await r.json();if(j.status!=="success")throw new Error(j.reason||"Cricket API error");
   const rows=(j.data||[]).map((x,i)=>({id:"cric-"+(x.id||i),sport:"cricket",league:x.series||x.name||"Cricket",status:x.matchStarted&&!x.matchEnded?"live":x.matchEnded?"finished":"upcoming",a:x.teams?.[0]||"Team 1",b:x.teams?.[1]||"Team 2",ea:"🏏",eb:"🏏",sa:x.score?.[0]?.r!=null?`${x.score[0].r}/${x.score[0].w}`:"—",sb:x.score?.[1]?.r!=null?`${x.score[1].r}/${x.score[1].w}`:"—",da:x.score?.[0]?.o!=null?`${x.score[0].o} overs`:"",db:x.score?.[1]?.o!=null?`${x.score[1].o} overs`:"",note:x.status||"Cricket match",source:true}));
   if(rows.length){matches=[...matches.filter(m=>m.sport!=="cricket"),...rows];loaded++;}
  }catch(e){errors.push("Cricket: "+e.message);}
 }
 if(footballKey()){
  try{
   const r=await fetch("https://v3.football.api-sports.io/fixtures?live=all",{headers:{"x-apisports-key":footballKey()}});
   if(!r.ok)throw new Error(`Football API HTTP ${r.status}`);
   const j=await r.json();if(j.errors&&Object.keys(j.errors).length)throw new Error(JSON.stringify(j.errors));
   const rows=(j.response||[]).map(x=>({id:"foot-"+x.fixture.id,sport:"football",league:x.league.name,status:["1H","HT","2H","ET","P","LIVE"].includes(x.fixture.status.short)?"live":["FT","AET","PEN"].includes(x.fixture.status.short)?"finished":"upcoming",a:x.teams.home.name,b:x.teams.away.name,ea:"⚽",eb:"⚽",sa:x.goals.home??"—",sb:x.goals.away??"—",da:x.fixture.status.elapsed?`${x.fixture.status.elapsed}′`:x.fixture.status.long,db:"",note:x.fixture.status.long,source:true}));
   matches=[...matches.filter(m=>m.sport!=="football"),...rows];loaded++;
  }catch(e){errors.push("Football: "+e.message);}
 }
 render();
 $("#statusLine").textContent=loaded?`Updated ${loaded} sport feed(s). Free API quotas apply.`:errors.length?errors.join(" · "):"No API keys connected · Showing sample matches";
 if(errors.length)toast(errors[0]);
}
$("#refreshBtn").addEventListener("click",refreshScores);
$("#openChat").addEventListener("click",openChat);
function openChat(){$("#chatDialog").showModal();$("#chatInput").focus();}
$("#closeChat").addEventListener("click",()=>$("#chatDialog").close());
function answer(q){
 const s=q.toLowerCase();
 if(s.includes("offside"))return "In football, a player is in an offside position if they are nearer to the opponents' goal line than both the ball and the second-last opponent when a teammate plays the ball to them. Being in that position alone isn't an offence; becoming involved in active play is what matters.";
 if(s.includes("dls")||s.includes("duckworth"))return "DLS (Duckworth–Lewis–Stern) is a mathematical method used in rain-affected limited-overs cricket to set a revised target. It considers the batting side's remaining overs and wickets, often described as resources.";
 if(s.includes("hat-trick")||s.includes("hat trick"))return "A hat-trick means achieving a feat three times. In cricket, a bowler takes wickets on three consecutive deliveries; in football, a player scores three goals in one match.";
 if(s.includes("lbw"))return "LBW means Leg Before Wicket. A batter can be out LBW when the ball hits their body rather than the bat and, subject to the law's pitching, impact and interception conditions, would have hit the stumps.";
 if(s.includes("offside")||s.includes("goal"))return "A goal counts when the whole ball crosses the goal line between the posts and beneath the crossbar, provided no offence has occurred.";
 if(s.includes("score")||s.includes("match")||s.includes("live"))return "The Scores tab shows the matches currently loaded. In this starter version, sample scores are clearly labelled as demo data. Add your own provider API keys in Settings to request live feeds.";
 if(s.includes("cricket"))return "Cricket is played between two teams. The batting team scores runs while the bowling and fielding team tries to dismiss batters and limit runs. Formats include Tests, ODIs and T20s.";
 if(s.includes("football"))return "Association football is played by two teams of 11. The aim is to score by getting the ball into the opponent's goal. A standard match lasts 90 minutes plus added time.";
 return "I can explain cricket and football rules, terminology, formats and the scores shown in KEEP UP. This is the offline starter assistant; connecting a genuine AI model requires a secure backend and an API service.";
}
$("#chatForm").addEventListener("submit",e=>{e.preventDefault();const input=$("#chatInput"),q=input.value.trim();if(!q)return;addBubble(q,"user");input.value="";setTimeout(()=>addBubble(answer(q),"assistant"),250);});
function addBubble(t,who){const d=document.createElement("div");d.className="bubble "+who;d.textContent=t;$("#chatMessages").appendChild(d);$("#chatMessages").scrollTop=$("#chatMessages").scrollHeight;}
document.querySelectorAll(".quick-prompts button").forEach(b=>b.addEventListener("click",()=>{$("#chatInput").value=b.textContent;$("#chatForm").requestSubmit();}));
if("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
render();
