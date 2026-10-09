// ===== EDIT ME: add live-demo URLs (demo:"") and certificate images (img:"") here =====
const PROFILE_IMG="images/profile.jpg"; // profile photo path
const GITHUB="https://github.com/himel-official";
const DOCS={award:{title:"DEAN'S AWARD — FALL 2025",img:"images/deans-award.jpg"},record:{title:"ACADEMIC RECORD — BUBT, B.Sc. CSE",img:"images/academic-record.jpg"}};
const projects=[
{id:"medalarm",num:"01",type:"FEATURED · ANDROID APP",title:"MEDALARM",when:"APR 2026 – PRESENT",xp:250,demo:"",desc:"Android medication reminder app that helps users track medication schedules and receive timely reminders. Firebase handles real-time data and PostgreSQL provides structured, persistent storage; the UI follows standard Android practices in Java and XML.",tags:["JAVA","XML","FIREBASE","POSTGRESQL","ANDROID STUDIO"]},
{id:"nids",num:"02",type:"MACHINE LEARNING",title:"NETWORK IDS",when:"AUG 2026 – PRESENT",xp:220,demo:"",desc:"A machine-learning pipeline that classifies network traffic and detects potential intrusions from traffic parameters. Compares Logistic Regression and Extra Trees classifiers, covering preprocessing, feature preparation, training and evaluation.",tags:["PYTHON","FLASK","SCIKIT-LEARN","LOGISTIC REGRESSION","EXTRA TREES","KAGGLE"]},
{id:"pethome",num:"03",type:"WEB APP",title:"PETHOME",when:"SEPT 2025",xp:180,demo:"",desc:"A pet adoption and care website concept with core backend logic and pages for browsing and managing listings.",tags:["PYTHON","MYSQL"]},
{id:"prescription",num:"04",type:"WEB APP",title:"SMART PRESCRIPTION",when:"JAN 2025",xp:160,demo:"",desc:"A web app to digitize and organize medical prescriptions for easier tracking and access, with Python backend logic for prescription data and basic user interactions.",tags:["PYTHON","MYSQL","WEB APP"]},
{id:"banking",num:"05",type:"CONSOLE APP",title:"CONSOLE BANKING",when:"JUNE 2024",xp:120,demo:"",desc:"A console banking system simulating account creation, deposits, withdrawals and balance inquiries, built with modular, structured C++ and file-based storage.",tags:["C++","FILE SYSTEM","CONSOLE APP"]}
];
const skills=[["01","PYTHON","Backend, data and ML scripting"],["02","C / C++","Structured programming and console apps"],["03","JAVA","Android development"],["04","SQL","MySQL and PostgreSQL databases"],["05","FLASK","Python web backends"],["06","ANDROID SDK","Native mobile apps"],["07","ARDUINO / ESP-IDF","Embedded and hardware experiments"],["08","ML TOOLKIT","NumPy · Pandas · Scikit-learn"]];
const $=s=>document.querySelector(s);
let visited=[];try{visited=JSON.parse(localStorage.getItem("himel-xp")||"[]")}catch(e){}
let xp=visited.length;
$("#projectGrid").innerHTML=projects.map(p=>`<article class="mission" data-id="${p.id}"><span class="number">${p.num}</span><span class="type">${p.type}</span><span class="xp">${parseInt(p.num)<3?"IN PROGRESS":"COMPLETED"}</span><h3>${p.title}</h3><span class="when">${p.when}</span><div class="tags">${p.tags.slice(0,3).map(t=>`<span>${t}</span>`).join("")}</div><span class="open">INSPECT ▸</span></article>`).join("");
$("#skills").innerHTML=skills.map(s=>`<div class="skill"><div class="skill-icon">// ${s[0]}</div><h4>${s[1]}</h4><p>${s[2]}</p></div>`).join("");
$("#xp").textContent=xp;
const show=h=>{$("#modalContent").innerHTML=h;$("#modal").classList.add("show")};
function closeModal(){$("#modal").classList.remove("show")}
function toast(t){const x=$("#toast");x.textContent=t;x.classList.add("show-toast");setTimeout(()=>x.classList.remove("show-toast"),1800)}
function modal(p){
 show(`<span class="kicker">${p.type} · ${p.when}</span><h2>${p.title}</h2><p>${p.desc}</p><span class="kicker">TOOLS USED</span><div class="modal-tags">${p.tags.map(t=>`<span>${t}</span>`).join("")}</div><div class="modal-actions">${p.demo?`<a class="btn primary" href="${p.demo}" target="_blank" rel="noopener">LIVE DEMO ↗</a>`:`<span class="btn off">LIVE DEMO · COMING SOON</span>`}<a class="btn" href="${GITHUB}" target="_blank" rel="noopener">GITHUB ↗</a></div>`);
 if(!visited.includes(p.id)){visited.push(p.id);try{localStorage.setItem("himel-xp",JSON.stringify(visited))}catch(e){}xp++;$("#xp").textContent=xp;toast("PROJECT VIEWED")}
}
function docModal(k){const d=DOCS[k];show(`<span class="kicker">VERIFIED RECORD</span><h2>${d.title}</h2>${d.img?`<img class="doc-img" src="${d.img}" alt="${d.title}">`:`<div class="doc-empty">IMAGE NOT UPLOADED YET<br>The official copy is available on request — email me.</div>`}`)}
document.querySelectorAll(".mission").forEach(el=>el.onclick=()=>modal(projects.find(p=>p.id===el.dataset.id)));
$("#recordPanel").onclick=()=>docModal("record");$("#awardBtn").onclick=()=>docModal("award");
$("#close").onclick=closeModal;$("#modal").onclick=e=>{if(e.target.id==="modal")closeModal()};
$("#randomMission").onclick=()=>{const p=projects[Math.floor(Math.random()*projects.length)];$("#projects").scrollIntoView();setTimeout(()=>modal(p),500)};
$("#menu").onclick=()=>{const n=$("nav");n.style.display=n.style.display==="flex"?"none":"flex";n.style.position="absolute";n.style.top="74px";n.style.right="0";n.style.background="#090b11";n.style.padding="20px";n.style.flexDirection="column";n.style.border="1px solid #272c39"};
// ===== AI terminal (calls the local/server-side backend) =====
const term=$("#terminalText");
function line(t,c){const p=document.createElement("p");p.className=c;p.textContent=t;term.appendChild(p);term.scrollTop=term.scrollHeight;return p}
let hist=[],busy=false;
async function ask(q){
 if(busy||!q.trim())return;
 const command=q.trim().toLowerCase();
 if(["clear chat","clear","/clear","clear history"].includes(command)){
  hist=[];
  term.replaceChildren();
  line("> Chat cleared. What would you like help with?","command");
  return;
 }
 busy=true;
 line("visitor@himel:~$ "+q,"user");
 const out=line("thinking...","ai");
 hist.push({role:"user",content:q});
 try{
  const response=await fetch("/api/chat",{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({messages:hist.slice(-10)})
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||"Request failed");
  if(typeof data.reply!=="string"||!data.reply)throw new Error("Empty AI response");
  out.textContent=data.reply;
  hist.push({role:"assistant",content:data.reply});
 }catch(e){
  hist.pop();
  out.textContent="> AI connection failed. Check that the backend is running and your Gemini API key is configured. ("+(e.message||"unknown error")+")";
 }
 busy=false;
 term.scrollTop=term.scrollHeight;
}
(async()=>{
 line("> booting HIMEL.exe AI companion","command");
 const l=line("> checking AI backend ...","command");
 try{
  const r=await fetch("/api/health");
  const data=await r.json();
  if(!r.ok||!data.aiOnline)throw new Error("Gemini API unavailable");
  l.textContent="> AI ONLINE";
  line("> Hi, I am Himu. Ask me anything.","command");
 }catch(e){
  l.textContent="> AI OFFLINE";
  l.style.color="var(--pink)";
  line("> The site server is running, but Gemini is not reachable. Check GEMINI_API_KEY and GEMINI_MODEL in .env, then restart the server.","command");
 }
})();
$("#termForm").onsubmit=e=>{e.preventDefault();const i=$("#termInput"),q=i.value.trim();i.value="";ask(q)};
document.querySelectorAll(".chips button").forEach(b=>b.onclick=()=>ask(b.textContent));

// ===== Interactive rings: drag to spin, release to fling =====
(()=>{
 const st=document.querySelector(".character-stage"),hint=document.querySelector("#dragHint");
 const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
 const rings=[{el:document.querySelector(".ring1"),a0:25,base:22.5,k:1},{el:document.querySelector(".ring2"),a0:-40,base:-15.65,k:-1.4}];
 let off=0,vel=0,drag=false,lastA=0,lastT=0,time=0,prev=performance.now();
 const ang=e=>{const b=st.getBoundingClientRect();return Math.atan2(e.clientY-b.top-b.height/2,e.clientX-b.left-b.width/2)*180/Math.PI};
 st.addEventListener("pointerdown",e=>{drag=true;vel=0;lastA=ang(e);lastT=performance.now();st.setPointerCapture(e.pointerId);st.classList.add("grab");hint.classList.add("gone")});
 st.addEventListener("pointermove",e=>{if(!drag)return;const a=ang(e),t=performance.now();let d=a-lastA;if(d>180)d-=360;if(d<-180)d+=360;off+=d;const dt=Math.max(t-lastT,1)/1000;vel=vel*.6+(d/dt)*.4;lastA=a;lastT=t});
 const end=()=>{drag=false;st.classList.remove("grab");if(performance.now()-lastT>80)vel=0};
 st.addEventListener("pointerup",end);st.addEventListener("pointercancel",end);
 (function frame(now){
  const dt=Math.min((now-prev)/1000,.05);prev=now;
  if(!reduce)time+=dt;
  if(!drag){off+=vel*dt;vel*=Math.exp(-2.2*dt)}
  rings.forEach(r=>{r.el.style.transform=`rotate(${r.a0+(reduce?0:r.base*time)+off*r.k}deg)`});
  requestAnimationFrame(frame);
 })(prev);
})();

if(PROFILE_IMG){const i=new Image();i.alt="Himel Mahmud";i.onload=()=>{$("#aboutPhoto").innerHTML="";$("#aboutPhoto").appendChild(i)};i.src=PROFILE_IMG}
