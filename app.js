const $=id=>document.getElementById(id);
let bank=[], current=null, score=0, answered=0, seen=new Set(), timer=null, seconds=600;
const letters=["A","B","C","D"];
function shuffleOptions(q){
 const arr=q.options.map((text,i)=>({text,correct:i===q.answer}));
 for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}
 return arr;
}
function populateTopics(){
 const topics=[...new Set(bank.map(q=>q.topic))].sort();
 topics.forEach(t=>{const o=document.createElement("option");o.value=t;o.textContent=t;$("topic").appendChild(o);});
}
function eligible(){const t=$("topic").value;return bank.filter(q=>(t==="all"||q.topic===t)&&!seen.has(q.id));}
function newQuestion(){
 clearInterval(timer);seconds=600;
 let list=eligible();if(!list.length){seen.clear();list=eligible();}
 if(!list.length)return;
 current=list[Math.floor(Math.random()*list.length)];
 current.shuffled=shuffleOptions(current);
 $("qmeta").innerHTML=`<span class="pill">${current.topic}</span><span class="pill">${current.code}</span><span class="pill">${current.verified?"Title-level source checked":"Clause verification pending"}</span>`;
 $("qtext").textContent=current.question;$("options").innerHTML="";$("feedback").style.display="none";$("feedback").textContent="";
 current.shuffled.forEach((o,i)=>{const b=document.createElement("button");b.className="option";b.textContent=`${letters[i]}. ${o.text}`;b.onclick=()=>answer(i,b);$("options").appendChild(b);});
 $("counter").textContent=`${seen.size+1} / ${bank.length}`;$("score").textContent=`${score} correct`;$("progress").style.width=`${seen.size/bank.length*100}%`;
 if($("mode").value==="timer")startTimer();
}
function answer(index,button){
 if(!current||seen.has(current.id))return;
 const opts=[...$("options").children];opts.forEach((b,i)=>{b.disabled=true;if(current.shuffled[i].correct)b.classList.add("correct");});
 if(current.shuffled[index].correct){score++;button.classList.add("correct");$("feedback").innerHTML="<b>Correct!</b> ";}else{button.classList.add("wrong");$("feedback").innerHTML="<b>Incorrect.</b> ";} 
 answered++;seen.add(current.id);$("score").textContent=`${score} correct / ${answered} attempted`;
 $("feedback").innerHTML+=`${escapeHtml(current.explanation)}<br><br><b>Reference:</b> ${escapeHtml(current.reference)}<br><b>Verification:</b> ${current.verified?"Official publication title checked. Technical clause still requires the full applicable document where relevant.":"Edition/clause verification pending; check official publication and project documents."}`;
 $("feedback").style.display="block";$("progress").style.width=`${seen.size/bank.length*100}%`;clearInterval(timer);
}
function showExplanation(){if(!current)return;$("feedback").innerHTML=`<b>Explanation</b><br>${escapeHtml(current.explanation)}<br><br><b>Reference:</b> ${escapeHtml(current.reference)}`;$("feedback").style.display="block";}
function startTimer(){let remaining=600;clearInterval(timer);timer=setInterval(()=>{remaining--;if(remaining<=0){clearInterval(timer);newQuestion();} },1000);}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
$("next").onclick=newQuestion;$("another").onclick=newQuestion;$("skip").onclick=()=>{if(current)seen.add(current.id);newQuestion();};$("reveal").onclick=showExplanation;
$("topic").onchange=()=>{seen.clear();newQuestion();};$("mode").onchange=()=>{if(current&&$("mode").value==="timer")startTimer();else clearInterval(timer);};
$("showAll").onclick=()=>{const r=$("refs");r.style.display=r.style.display==="none"?"block":"none";r.innerHTML=bank.map(q=>`<p><b>${q.id} — ${escapeHtml(q.topic)}</b><br>${escapeHtml(q.code)}<br>${escapeHtml(q.reference)}</p>`).join("");};
fetch("questions.json").then(r=>{if(!r.ok)throw Error("questions.json not found");return r.json();}).then(data=>{bank=data;populateTopics();newQuestion();}).catch(()=>{$("qmeta").textContent="Question bank load error";$("qtext").textContent="यह package सीधे Files preview में नहीं चलेगा। ZIP extract करके सभी files HTTPS hosting (जैसे GitHub Pages) पर upload करें।";$("options").innerHTML="";});

if('serviceWorker' in navigator && location.protocol.startsWith('http')){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
