const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const KEY = 'resume-tailor:profile';
const OUT = 'resume-tailor:output';
const JOB = 'resume-tailor:job';

const defaultProfile = {
  fullName:'', jobTitle:'', email:'', phone:'', location:'', links:'', seniority:'',
  preserveTitles:false, showLinks:true,
  workExperiences:[{ company:'', dates:'', title:'', bulletPoints:6 }],
  educations:[{ degreeMajor:'', school:'', dates:'' }]
};

let profile = load(KEY, defaultProfile);
let output = load(OUT, null);
let jobState = load(JOB, { jobDescription:'', companyOverride:'' });

function clone(v){ return JSON.parse(JSON.stringify(v)); }
function load(k, fallback){
  try { return JSON.parse(localStorage.getItem(k)) || clone(fallback); }
  catch { return clone(fallback); }
}
function esc(s=''){
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}
function save(){
  localStorage.setItem(KEY, JSON.stringify(profile));
  const badge = $('#saveBadge');
  if (badge) {
    badge.textContent = 'Saved';
    setTimeout(() => { if ($('#saveBadge')) $('#saveBadge').textContent='Saved locally'; }, 900);
  }
  buildPrompt();
  renderPreview();
}
function saveJob(){
  jobState.jobDescription = $('#jobDescription').value;
  jobState.companyOverride = $('#companyOverride').value;
  localStorage.setItem(JOB, JSON.stringify(jobState));
  buildPrompt();
}
function bindField(id,key,type='value'){
  const el=$('#'+id); if(!el) return;
  if(type==='checked') el.checked=!!profile[key]; else el.value=profile[key]??'';
  el.addEventListener('input',()=>{ profile[key]=type==='checked'?el.checked:el.value; save(); });
}
['fullName','jobTitle','email','phone','location','links','seniority'].forEach(x=>bindField(x,x));
bindField('preserveTitles','preserveTitles','checked');
bindField('showLinks','showLinks','checked');

$('#jobDescription').value = jobState.jobDescription || '';
$('#companyOverride').value = jobState.companyOverride || '';
$('#jobDescription').addEventListener('input', saveJob);
$('#companyOverride').addEventListener('input', saveJob);

function renderExperiences(){
  const root=$('#experiences'); root.innerHTML='';
  profile.workExperiences.forEach((x,i)=>{
    const d=document.createElement('div'); d.className='experience-item';
    d.innerHTML=`<div class="exp-grid">
      <label>Company<input data-k="company" value="${esc(x.company)}" placeholder="Company" /></label>
      <label>Original title<input data-k="title" value="${esc(x.title||'')}" placeholder="Software Engineer" /></label>
      <label>Dates<input data-k="dates" value="${esc(x.dates)}" placeholder="Oct 2020 - Present" /></label>
      <label>Sentences<input data-k="bulletPoints" type="number" min="1" max="20" value="${x.bulletPoints||6}" /></label>
      <button class="remove-btn" title="Remove">×</button>
    </div>`;
    d.querySelectorAll('input').forEach(el=>el.addEventListener('input',()=>{
      x[el.dataset.k]=el.dataset.k==='bulletPoints'?Math.min(20,Math.max(1,+el.value||1)):el.value; save();
    }));
    d.querySelector('.remove-btn').onclick=()=>{ profile.workExperiences.splice(i,1); renderExperiences(); save(); };
    root.appendChild(d);
  });
}
function renderEducations(){
  const root=$('#educations'); root.innerHTML='';
  profile.educations.forEach((x,i)=>{
    const d=document.createElement('div'); d.className='education-item';
    d.innerHTML=`<div class="edu-grid">
      <label>Degree / Major<input data-k="degreeMajor" value="${esc(x.degreeMajor)}" placeholder="B.S. Computer Science" /></label>
      <label>School<input data-k="school" value="${esc(x.school||'')}" placeholder="University" /></label>
      <label>Dates<input data-k="dates" value="${esc(x.dates||'')}" placeholder="2012 - 2016" /></label>
      <button class="remove-btn" title="Remove">×</button>
    </div>`;
    d.querySelectorAll('input').forEach(el=>el.addEventListener('input',()=>{ x[el.dataset.k]=el.value; save(); }));
    d.querySelector('.remove-btn').onclick=()=>{ profile.educations.splice(i,1); renderEducations(); save(); };
    root.appendChild(d);
  });
}
$('#addExperienceBtn').onclick=()=>{ profile.workExperiences.push({company:'',dates:'',title:'',bulletPoints:6}); renderExperiences(); save(); };
$('#addEducationBtn').onclick=()=>{ profile.educations.push({degreeMajor:'',school:'',dates:''}); renderEducations(); save(); };
renderExperiences(); renderEducations();

function buildPrompt(){
  const jd=$('#jobDescription').value.trim();
  const override=$('#companyOverride').value.trim();
  const preserve=profile.preserveTitles;
  const work=profile.workExperiences.filter(e=>e.company||e.dates).map(e=>
    `- ${e.company||'Company'} , ${e.dates||'Dates not specified'} , ${e.bulletPoints||6} Bullet Points${preserve&&e.title?` , Original Title: ${e.title}`:''}`
  ).join('\n');
  const edu=profile.educations.filter(e=>e.degreeMajor).map(e=>`- ${e.degreeMajor}`).join('\n');
  const counts=profile.workExperiences.filter(e=>e.company&&e.bulletPoints).map(e=>`- ${e.company}: exactly ${e.bulletPoints} sentences`).join('\n');
  const schema=preserve?`{
  "company": "Company name from the job description",
  "summary": "",
  "skills": [{ "Category1": ["Skill1", "Skill2"] }],
  "experience": [{ "company": "", "sentences": ["Sentence 1"] }],
  "education": [{ "degree": "Degree and Major" }]
}`:`{
  "company": "Company name from the job description",
  "title": "",
  "summary": "",
  "skills": [{ "Category1": ["Skill1", "Skill2"] }],
  "experience": [{ "title": "", "company": "", "sentences": ["Sentence 1"] }],
  "education": [{ "degree": "Degree and Major" }]
}`;

  const p=`You are a resume generation engine.
Your output MUST be exactly ONE valid JSON object and nothing else.
Do NOT include explanations, comments, markdown fences, headers, or text outside the JSON.
Do NOT ask questions.

========================================
CANDIDATE PROFILE
========================================
${preserve?`Job Title: ${profile.jobTitle||'Not specified'}`:`Seniority Level: ${profile.seniority||'Not specified'}`}
Work Experience:
${work||'- No work experience provided'}
Education:
${edu||'- No education provided'}

========================================
JOB DESCRIPTION HANDLING RULES
========================================
If the job requires security clearance or requires on-site-only work, do not invent eligibility. Return valid JSON with an additional top-level field "blockedReason" explaining the issue, and leave summary, skills, experience, and education empty.

========================================
OUTPUT FORMAT
========================================
Return ONE JSON object with the following structure:
${schema}

========================================
CONTENT RULES
========================================
COMPANY NAME
- ${override?`Use this company name: ${override}`:'Use the company name from the job description.'}
- If no company name is available, use "Unknown".
SUMMARY
- 3–4 concise, professional, ATS-optimized sentences directly aligned to the job description.
${preserve?'':`JOB TITLES IN HEADER AND EACH COMPANY
- 2–4 words.
- Use common industry titles aligned with the target role and a logical career progression.
`}SKILLS
- 30–35 total skills, grouped into useful categories.
- Include important technologies and competencies from the job description when supportable by the candidate profile.
- Do not claim technologies that would be chronologically impossible for the listed experience periods.
EDUCATION
- Keep the supplied degree/major when relevant; only adapt the major when necessary to align with the role.
EXPERIENCE – SENTENCE RULES (STRICT)
- Do not use the candidate's name or third-person pronouns such as he/she.
- Each sentence must be 150–250 characters, technically specific, achievement-oriented, ATS-friendly, and end with a period.
- Avoid vague or generic statements.
- No bullet symbols inside sentence strings.
- Tailor responsibilities and technologies to the target role while keeping them plausible for each company and time period.
- Do not invent certifications, employers, degrees, security clearances, or facts that materially change the candidate's background.
SENTENCE COUNT PER COMPANY
${counts||'- Use the configured sentence counts.'}
Each sentence must be a separate string inside the sentences array.

========================================
FINAL VALIDATION
========================================
Before responding, verify:
- Important job-description keywords are represented naturally.
- Sentence lengths and counts are satisfied.
- The resume remains plausible and consistent with the supplied profile.
- Output is valid JSON with no markdown fences.

========================================
JOB DESCRIPTION
========================================
${jd}`;
  $('#aiPrompt').value=p;
  return p;
}
$('#buildPromptBtn').onclick=buildPrompt;

function normalizeJsonText(txt){ return txt.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''); }
function parseOutput(txt){
  try{
    const obj=JSON.parse(normalizeJsonText(txt));
    if(!obj||typeof obj!=='object'||Array.isArray(obj)) throw Error('Response must be a JSON object.');
    if(obj.blockedReason) return {ok:true,obj};
    if(!Array.isArray(obj.skills)||!Array.isArray(obj.experience)||!Array.isArray(obj.education)) throw Error('JSON must contain skills, experience, and education arrays.');
    return {ok:true,obj};
  }catch(e){ return {ok:false,error:e.message}; }
}
function applyJson(){
  const txt=$('#jsonResponse').value;
  if(!txt.trim()){
    output=null; localStorage.removeItem(OUT); $('#jsonError').textContent='';
    $('#jsonStatus').className='status neutral'; $('#jsonStatus').textContent='Waiting for JSON'; renderPreview(); return;
  }
  const p=parseOutput(txt);
  if(!p.ok){ $('#jsonError').textContent=p.error; $('#jsonStatus').className='status bad'; $('#jsonStatus').textContent='Invalid JSON'; return; }
  output=p.obj; localStorage.setItem(OUT,JSON.stringify(output)); $('#jsonError').textContent='';
  $('#jsonStatus').className=output.blockedReason?'status bad':'status good';
  $('#jsonStatus').textContent=output.blockedReason?'Role blocked':'Ready';
  renderPreview();
}
$('#jsonResponse').addEventListener('input',applyJson);
$('#formatJsonBtn').onclick=()=>{ const p=parseOutput($('#jsonResponse').value); if(p.ok){ $('#jsonResponse').value=JSON.stringify(p.obj,null,2); applyJson(); } };
$('#copyPromptBtn').onclick=async()=>{
  try { await navigator.clipboard.writeText(buildPrompt()); const b=$('#copyPromptBtn'); b.textContent='Copied'; setTimeout(()=>b.textContent='Copy',1300); }
  catch { $('#jsonError').textContent='Clipboard permission was denied.'; }
};
$('#pasteJsonBtn').onclick=async()=>{
  try{ $('#jsonResponse').value=await navigator.clipboard.readText(); applyJson(); if($('#autoDownload').checked&&output&&!output.blockedReason)setTimeout(()=>window.print(),200); }
  catch{ $('#jsonError').textContent='Clipboard permission was denied. Paste manually.'; }
};

function setRunStatus(message, type='neutral'){
  const el=$('#aiRunStatus'); el.textContent=message; el.className=`run-status ${type}`;
}
async function tailorResume(){
  const button=$('#tailorResumeBtn');
  const jd=$('#jobDescription').value.trim();
  if(jd.length<40){ setRunStatus('Paste a complete job description first.','bad'); $('#jobDescription').focus(); return; }
  if(!profile.workExperiences.some(e=>e.company||e.dates)){ setRunStatus('Add your work experience in Profile first.','bad'); return; }
  button.disabled=true; button.dataset.label=button.textContent; button.textContent='Tailoring…';
  setRunStatus('Analyzing the job description and generating your tailored resume…','working');
  $('#jsonError').textContent='';
  try{
    const response=await fetch('/api/tailor',{
      method:'POST', headers:{'content-type':'application/json'},
      body:JSON.stringify({ profile, jobDescription:jd, companyOverride:$('#companyOverride').value.trim() })
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(data.error||`Request failed (${response.status}).`);
    if(!data.resume) throw new Error('The server did not return a resume.');
    $('#jsonResponse').value=JSON.stringify(data.resume,null,2); applyJson();
    if(data.model) $('#modelBadge').textContent=data.mock?'Mock mode':data.model;
    if(data.resume.blockedReason){ setRunStatus(data.resume.blockedReason,'bad'); }
    else {
      setRunStatus('Tailored resume generated successfully. Review it before applying.','good');
      if($('#autoDownload').checked) setTimeout(()=>window.print(),250);
    }
  }catch(e){
    setRunStatus(e.message||'Tailoring failed.','bad');
    $('#jsonError').textContent=e.message||'Tailoring failed.';
  }finally{
    button.disabled=false; button.textContent=button.dataset.label||'Tailor Resume';
  }
}
$('#tailorResumeBtn').onclick=tailorResume;

function download(name,text,type='application/json'){
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([text],{type})); a.download=name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),500);
}
$('#downloadJsonBtn').onclick=()=>{ if(output) download(`${safeName(output.company||'tailored-resume')}.json`,JSON.stringify(output,null,2)); };
function safeName(s){ return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'resume'; }

function renderPreview(){
  const d=output||{};
  if(d.blockedReason){
    $('#resumePreview').innerHTML=`<div class="resume-name">${esc(profile.fullName||'Your Name')}</div><section class="resume-section blocked"><h3>Resume not generated</h3><p class="resume-summary">${esc(d.blockedReason)}</p></section>`;
    return;
  }
  const exps=Array.isArray(d.experience)?d.experience:[];
  const edus=Array.isArray(d.education)?d.education:[];
  const skills=Array.isArray(d.skills)?d.skills:[];
  const contact=[profile.email,profile.phone,profile.location,profile.showLinks?profile.links:''].filter(Boolean).join(' • ');
  const title=profile.preserveTitles?(profile.jobTitle||d.title||'Professional Resume'):(d.title||profile.jobTitle||'Professional Resume');
  let html=`<div class="resume-name">${esc(profile.fullName||'Your Name')}</div><div class="resume-title">${esc(title)}</div><div class="resume-contact">${esc(contact)}</div>`;
  if(d.summary) html+=`<section class="resume-section"><h3>Professional Summary</h3><p class="resume-summary">${esc(d.summary)}</p></section>`;
  if(skills.length){
    html+=`<section class="resume-section"><h3>Technical Skills</h3>`+skills.map(s=>{
      const k=Object.keys(s||{})[0]; const vals=k?s[k]:[];
      return `<div class="skill-line"><strong>${esc(k||'Skills')}:</strong> ${esc(Array.isArray(vals)?vals.join(', '):vals)}</div>`;
    }).join('')+`</section>`;
  }
  if(exps.length||profile.workExperiences.some(x=>x.company)){
    html+=`<section class="resume-section"><h3>Professional Experience</h3>`;
    const src=exps.length?exps:profile.workExperiences.map(x=>({company:x.company,title:x.title,sentences:[]}));
    src.forEach((x,i)=>{
      const base=profile.workExperiences[i]||{};
      html+=`<div class="job"><div class="job-head"><div><div class="job-title">${esc(x.title||base.title||title)}</div><div class="job-meta">${esc(x.company||base.company||'Company')}</div></div><div class="job-meta">${esc(base.dates||'')}</div></div>${Array.isArray(x.sentences)&&x.sentences.length?`<ul>${x.sentences.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>`:''}</div>`;
    });
    html+=`</section>`;
  }
  if(edus.length||profile.educations.some(x=>x.degreeMajor)){
    html+=`<section class="resume-section"><h3>Education</h3>`;
    const src=edus.length?edus:profile.educations.map(x=>({degree:x.degreeMajor}));
    src.forEach((x,i)=>{
      const base=profile.educations[i]||{};
      html+=`<div class="edu-row"><div><strong>${esc(x.degree||base.degreeMajor||'')}</strong>${base.school?` — ${esc(base.school)}`:''}</div><div>${esc(base.dates||'')}</div></div>`;
    });
    html+=`</section>`;
  }
  if(!d.summary&&!skills.length&&!exps.length){
    html+=`<section class="resume-section"><h3>Getting Started</h3><p class="resume-summary">Complete your Profile, paste a job description, then click Tailor Resume. The finished ATS-tailored resume will render here automatically.</p></section>`;
  }
  $('#resumePreview').innerHTML=html;
}

$('#resetResumeBtn').onclick=()=>{ $('#jsonResponse').value=''; output=null; localStorage.removeItem(OUT); applyJson(); setRunStatus(''); };
$('#printBtn').onclick=()=>window.print();
$('#exportBtn').onclick=()=>download('resume-tailor-profile.json',JSON.stringify({profile,output,jobDescription:$('#jobDescription').value,companyOverride:$('#companyOverride').value},null,2));
$('#importBtn').onclick=()=>$('#importFile').click();
$('#importFile').addEventListener('change',async e=>{
  const f=e.target.files[0]; if(!f)return;
  try{
    const j=JSON.parse(await f.text());
    profile={...clone(defaultProfile),...(j.profile||j)}; output=j.output||null;
    jobState={jobDescription:j.jobDescription||'',companyOverride:j.companyOverride||''};
    localStorage.setItem(KEY,JSON.stringify(profile)); localStorage.setItem(JOB,JSON.stringify(jobState));
    if(output)localStorage.setItem(OUT,JSON.stringify(output)); else localStorage.removeItem(OUT);
    location.reload();
  }catch{ alert('Invalid profile JSON file.'); }
});
$$('.tab').forEach(b=>b.onclick=()=>{
  $$('.tab').forEach(x=>x.classList.toggle('active',x===b));
  $('#resumeTab').classList.toggle('active',b.dataset.tab==='resume');
  $('#profileTab').classList.toggle('active',b.dataset.tab==='profile');
});

if(output){ $('#jsonResponse').value=JSON.stringify(output,null,2); applyJson(); } else renderPreview();
buildPrompt();
