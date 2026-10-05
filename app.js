const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const STORAGE='resume-tailor:details:v9', OUTPUT='resume-tailor:output:v9';

const def={
  profile:{
    fullName:'',email:'',phone:'',location:'',linkedin:'',github:'',website:'',
    seniority:'',roleBased:false,webhookMode:'none',webhookUrl:'',
    work:[{enabled:true,company:'',period:'',location:'',role:'',bulletPoints:6}],
    education:[{institution:'',degree:'',period:''}],
    certifications:[{institution:'',certification:'',date:''}]
  },
  design:{
    fontFamily:'Helvetica Neue',fontSize:10,fontColor:'#333333',pageMargin:.75,lineSpacing:1.2,sectionGap:12,
    headerName:'',headerRole:'',showContact:true,nameFontSize:24,nameColor:'#003800',nameBold:true,
    roleFontSize:18,roleColor:'#000000',roleBold:true,contactColor:'#0f0f0f',
    headerAlign:'center',titlePosition:'below',
    sectionTitleSize:12,sectionTitleColor:'#3e702c',sectionTitleBold:true,sectionTitleCaps:true,
    sectionTitleBorder:true,sectionTitleAlign:'left',experienceLayout:'single',boostEducation:false,
    sections:{summary:true,skills:true,experience:true,education:true,certifications:true}
  },
  autoDownload:false
};

const clone=o=>JSON.parse(JSON.stringify(o));
function deepMerge(a,b){
  if(!b||typeof b!=='object')return a;
  for(const k of Object.keys(b)){
    if(b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])&&a[k]&&typeof a[k]==='object'&&!Array.isArray(a[k])) deepMerge(a[k],b[k]);
    else a[k]=b[k];
  }
  return a;
}
let state=deepMerge(clone(def),JSON.parse(localStorage.getItem(STORAGE)||'{}'));
let output=JSON.parse(localStorage.getItem(OUTPUT)||'null');
let zoom=.69;
const esc=s=>String(s??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));

function save(){localStorage.setItem(STORAGE,JSON.stringify(state));buildPrompt();renderResume();}
function gotoPage(p){
  $$('.page').forEach(x=>x.classList.remove('active'));
  $$('.nav-btn').forEach(x=>x.classList.toggle('active',x.dataset.page===p));
  $('#page-'+p).classList.add('active');
  if(p==='preview'){buildPrompt();renderResume();}
}
$$('.nav-btn').forEach(b=>b.onclick=()=>gotoPage(b.dataset.page));
$$('[data-go]').forEach(b=>b.onclick=()=>gotoPage(b.dataset.go));

const THEME_KEY='resume-tailor:theme';
function applyTheme(theme){
  const safe=theme==='light'?'light':'dark';
  document.body.dataset.theme=safe;
  localStorage.setItem(THEME_KEY,safe);
  const b=$('#themeBtn');
  if(b){b.textContent=safe==='dark'?'☀':'☾';b.title=safe==='dark'?'Switch to light mode':'Switch to dark mode';}
}
applyTheme(localStorage.getItem(THEME_KEY)||'dark');
$('#themeBtn').onclick=()=>applyTheme(document.body.dataset.theme==='dark'?'light':'dark');

function bind(id,obj,key,type='value'){
  const el=$('#'+id); if(!el)return;
  el[type]=obj[key]??(type==='checked'?false:'');
  el.addEventListener(type==='checked'?'change':'input',()=>{obj[key]=type==='checked'?el.checked:el.value;save();});
}
['fullName','email','phone','location','linkedin','github','website','seniority'].forEach(k=>bind(k,state.profile,k));
bind('roleBased',state.profile,'roleBased','checked');
bind('webhookMode',state.profile,'webhookMode');
bind('webhookUrl',state.profile,'webhookUrl');

$('#webhookMode').onchange=()=>{
  state.profile.webhookMode=$('#webhookMode').value;
  $('#webhookUrl').classList.toggle('hidden',state.profile.webhookMode!=='metadata');
  save();
};
$('#webhookUrl').classList.toggle('hidden',state.profile.webhookMode!=='metadata');

function renderWork(){
  const r=$('#workList');r.innerHTML='';
  state.profile.work.forEach((w,i)=>{
    const item=document.createElement('div');
    item.className='repeat-item '+(state.profile.roleBased?'role-on':'role-off');

    const baseFields=state.profile.roleBased
      ? `<div class="repeat-grid work-grid role-mode-on">
          <label>Company Name<input data-k="company" value="${esc(w.company)}"></label>
          <label>Period<input data-k="period" value="${esc(w.period)}"></label>
          <label>Location<input data-k="location" value="${esc(w.location)}"></label>
          <label>Bullet Points<input data-k="bulletPoints" type="number" min="1" max="20" value="${w.bulletPoints||6}"></label>
          <button class="remove-btn">×</button>
        </div>
        <div class="role-input-row">
          <label>Role / Job Title<input data-k="role" value="${esc(w.role)}" placeholder="Enter the role that must be preserved"></label>
          <label class="include-role">Include this role <input data-k="enabled" type="checkbox" ${w.enabled!==false?'checked':''}></label>
        </div>`
      : `<div class="repeat-grid work-grid role-mode-off">
          <label>Company Name<input data-k="company" value="${esc(w.company)}"></label>
          <label>Period<input data-k="period" value="${esc(w.period)}"></label>
          <label>Location<input data-k="location" value="${esc(w.location)}"></label>
          <button class="remove-btn">×</button>
        </div>
        <div class="role-mode-note">Role will be selected from the target job description when you tailor the resume.</div>`;

    item.innerHTML=baseFields;

    item.querySelectorAll('input').forEach(el=>el.oninput=()=>{
      w[el.dataset.k]=el.type==='checkbox'
        ? el.checked
        : el.dataset.k==='bulletPoints'
          ? Math.max(1,Math.min(20,+el.value||1))
          : el.value;
      save();
    });
    item.querySelector('.remove-btn').onclick=()=>{state.profile.work.splice(i,1);renderWork();save();};
    r.appendChild(item);
  });
}
function renderEducation(){
  const r=$('#educationList');r.innerHTML='';
  state.profile.education.forEach((e,i)=>{
    const d=document.createElement('div');d.className='repeat-item';
    d.innerHTML=`<div class="repeat-grid education">
      <label>Institution<input data-k="institution" value="${esc(e.institution)}"></label>
      <label>Degree and Major<input data-k="degree" value="${esc(e.degree)}"></label>
      <label>Period<input data-k="period" value="${esc(e.period)}"></label>
      <button class="remove-btn">×</button>
    </div>`;
    d.querySelectorAll('input').forEach(el=>el.oninput=()=>{e[el.dataset.k]=el.value;save();});
    d.querySelector('.remove-btn').onclick=()=>{state.profile.education.splice(i,1);renderEducation();save();};
    r.appendChild(d);
  });
}
function renderCerts(){
  const r=$('#certificationList');r.innerHTML='';
  state.profile.certifications.forEach((e,i)=>{
    const d=document.createElement('div');d.className='repeat-item';
    d.innerHTML=`<div class="repeat-grid certification">
      <label>Institution<input data-k="institution" value="${esc(e.institution)}"></label>
      <label>Certification<input data-k="certification" value="${esc(e.certification)}"></label>
      <label>Date<input data-k="date" value="${esc(e.date)}"></label>
      <button class="remove-btn">×</button>
    </div>`;
    d.querySelectorAll('input').forEach(el=>el.oninput=()=>{e[el.dataset.k]=el.value;save();});
    d.querySelector('.remove-btn').onclick=()=>{state.profile.certifications.splice(i,1);renderCerts();save();};
    r.appendChild(d);
  });
}

$('#addWork').onclick=()=>{state.profile.work.push({enabled:true,company:'',period:'',location:'',role:'',bulletPoints:6});renderWork();save();};
$('#addEducation').onclick=()=>{state.profile.education.push({institution:'',degree:'',period:''});renderEducation();save();};
$('#addCertification').onclick=()=>{state.profile.certifications.push({institution:'',certification:'',date:''});renderCerts();save();};
$('#roleBased').onchange=()=>{state.profile.roleBased=$('#roleBased').checked;renderWork();save();};
renderWork();renderEducation();renderCerts();

const d=state.design;
['fontFamily','fontSize','fontColorText','pageMargin','lineSpacing','sectionGap'].forEach(id=>{
  const key=id==='fontColorText'?'fontColor':id, el=$('#'+id); el.value=d[key];
  el.oninput=()=>{
    d[key]=['fontSize','pageMargin','lineSpacing','sectionGap'].includes(id)?+el.value:el.value;
    if(id==='fontColorText')$('#fontColor').value=d.fontColor;
    save();
  };
});
function bindNum(id,key){const el=$('#'+id);el.value=d[key];el.oninput=()=>{d[key]=+el.value;save();};}
function bindCheck(id,key){const el=$('#'+id);el.checked=!!d[key];el.onchange=()=>{d[key]=el.checked;save();};}
function bindColor(textId,colorId,key){
  $('#'+textId).value=d[key];$('#'+colorId).value=d[key];
  $('#'+textId).oninput=()=>{d[key]=$('#'+textId).value;try{$('#'+colorId).value=d[key];}catch{}save();};
  $('#'+colorId).oninput=()=>{d[key]=$('#'+colorId).value;$('#'+textId).value=d[key];save();};
}
$('#fontColor').value=d.fontColor;
$('#fontColor').oninput=()=>{d.fontColor=$('#fontColor').value;$('#fontColorText').value=d.fontColor;save();};

bindNum('nameFontSize','nameFontSize');bindColor('nameColorText','nameColor','nameColor');bindCheck('nameBold','nameBold');
bindNum('roleFontSize','roleFontSize');bindColor('roleColorText','roleColor','roleColor');bindCheck('roleBold','roleBold');
bindColor('contactColorText','contactColor','contactColor');bindCheck('showContact','showContact');
bindNum('sectionTitleSize','sectionTitleSize');bindColor('sectionTitleColorText','sectionTitleColor','sectionTitleColor');
bindCheck('sectionTitleBold','sectionTitleBold');bindCheck('sectionTitleCaps','sectionTitleCaps');
bindCheck('sectionTitleBorder','sectionTitleBorder');bindCheck('boostEducation','boostEducation');

function activeButtons(sel,key,valAttr){
  $$(sel).forEach(b=>{
    b.classList.toggle('active',b.dataset[valAttr]===d[key]);
    b.onclick=()=>{d[key]=b.dataset[valAttr];activeButtons(sel,key,valAttr);save();};
  });
}
activeButtons('[data-header-align]','headerAlign','headerAlign');
activeButtons('[data-title-position]','titlePosition','titlePosition');
activeButtons('[data-section-align]','sectionTitleAlign','sectionAlign');
activeButtons('[data-exp-layout]','experienceLayout','expLayout');

$$('[data-section-toggle]').forEach(el=>{
  el.checked=d.sections[el.dataset.sectionToggle]!==false;
  el.onchange=()=>{d.sections[el.dataset.sectionToggle]=el.checked;save();};
});
$('#customizeBtn').onclick=()=>$('#customizeDrawer').classList.toggle('hidden');
$('#closeCustomize').onclick=()=>$('#customizeDrawer').classList.add('hidden');

$('#autoDownload').checked=state.autoDownload;
$('#autoDownload').onchange=()=>{state.autoDownload=$('#autoDownload').checked;save();};

function workPrompt(){
  return state.profile.work.filter(w=>w.enabled!==false).map(w=>{
    if(state.profile.roleBased){
      return `- ${w.company||'Company'} | ROLE: ${w.role||'Role not specified'} | ${w.period||'Period not specified'} | ${w.location||''} | ${w.bulletPoints||6} Bullet Points`;
    }
    return `- ${w.company||'Company'} | ${w.period||'Period not specified'} | ${w.location||''} | ${w.bulletPoints||6} Bullet Points | ROLE: derive a credible target-aligned role label from the job description`;
  }).join('
');
}
function buildPrompt(){
  const p=state.profile;
  const certs=p.certifications.filter(x=>x.certification||x.institution)
    .map(x=>`- ${x.certification||'Certification'} | ${x.institution||''} | ${x.date||''}`).join('\n');
  const edu=p.education.filter(x=>x.degree||x.institution)
    .map(x=>`- ${x.degree||'Degree'} | ${x.institution||''} | ${x.period||''}`).join('\n');

  const prompt=`You are a resume generation engine.
Your goal is to maximize first-round interview conversion for a candidate who is genuinely qualified for the target role.

Your output MUST be exactly ONE valid JSON object inside a single code block.
Do NOT include explanations, comments, headers, or text outside the JSON.
Do NOT ask questions.

========================================
CANDIDATE PROFILE
========================================
Seniority Level: ${p.seniority||'Not specified'}

Work Experience:
${workPrompt()||'- None'}

Education:
${edu||'- None'}

Certifications:
${certs||'- None'}

========================================
TAILORING OBJECTIVE
========================================
- Analyze the job description for target title, seniority, must-have requirements, preferred requirements, core technologies, domain language, business outcomes, leadership, architecture, reliability, and collaboration expectations.
- Tailor aggressively for ATS keyword coverage, recruiter 10-second skim, hiring-manager relevance, technical credibility, and a coherent role narrative.
- Front-load the most relevant keywords and capabilities.
- Make the first 2-3 bullets of recent roles especially relevant.
- Use strong action verbs and credible impact language.
- Keep claims defensible from the candidate's background.
- You may infer reasonable responsibilities, adjacent tools, architecture scope, and domain terminology consistent with the role and seniority.
- Do NOT invent employers, employment dates, degrees, certifications, licenses, security clearances, or locations.
- Do NOT invent precise percentages, dollar values, user counts, or measurements unless supplied.
- Avoid generic AI wording and obvious keyword stuffing.
- Preserve the configured bullet count for every enabled role exactly.
- ROLE-BASED MODE RULE:
  - If Role-based is OFF, no fixed role title is supplied. Derive a concise, target-aligned role label for each experience from the job description and the candidate's credible responsibilities. Do not falsely claim a materially different formal position.
  - If Role-based is ON, preserve the user-entered role/job title for each experience and tailor the bullets within that role. Do not replace it with the target job title.
- If role-based mode is enabled, omit roles marked disabled.
- Summary should be approximately 55-90 words.

========================================
OUTPUT FORMAT
========================================
{
  "company": "",
  "title": "",
  "summary": "",
  "skills": [{"Category": ["Skill"]}],
  "experience": [{"company":"","title":"","location":"","period":"","sentences":["..."]}],
  "education": [{"institution":"","degree":"","period":""}],
  "certifications": [{"institution":"","certification":"","date":""}],
  "targeting": {
    "matchScore": 0,
    "priorityKeywords": [],
    "missingRequirements": [],
    "positioningNotes": []
  }
}

========================================
JOB DESCRIPTION
========================================
Paste the complete job description directly below this prompt in ChatGPT.`;

  $('#aiPrompt').value=prompt;
  return prompt;
}
$('#buildPrompt').onclick=buildPrompt;
$('#copyPrompt').onclick=async()=>{
  const txt=buildPrompt();
  try{
    await navigator.clipboard.writeText(txt);
    $('#copyStatus').textContent='Prompt copied. Paste it into ChatGPT, then paste the job description underneath it.';
  }catch{
    $('#aiPrompt').focus();$('#aiPrompt').select();document.execCommand('copy');
    $('#copyStatus').textContent='Prompt copied.';
  }
};
buildPrompt();

function normalize(txt){return txt.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');}
function parseJson(){try{return {ok:true,obj:JSON.parse(normalize($('#jsonResponse').value))};}catch(e){return {ok:false,error:e.message};}}
function applyJson(){
  const p=parseJson();
  if(!p.ok){$('#jsonError').textContent=p.error;return;}
  output=p.obj;
  localStorage.setItem(OUTPUT,JSON.stringify(output));
  $('#jsonError').textContent='';
  renderResume();
  if(state.autoDownload)setTimeout(downloadResumePdf,250);
}
$('#applyJson').onclick=applyJson;
$('#jsonResponse').oninput=()=>{
  const p=parseJson();
  if(p.ok){output=p.obj;localStorage.setItem(OUTPUT,JSON.stringify(output));renderResume();}
};
$('#formatJson').onclick=()=>{const p=parseJson();if(p.ok){$('#jsonResponse').value=JSON.stringify(p.obj,null,2);applyJson();}};

function download(name,text,type='application/json'){
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([text],{type}));
  a.download=name;a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),500);
}
$('#downloadJson').onclick=()=>{if(output)download('tailored-resume.json',JSON.stringify(output,null,2));};

$('#saveDetailsBtn').onclick=()=>download('resume-tailor-details.json',JSON.stringify({version:9,...state,output},null,2));
$('#loadDetailsBtn').onclick=()=>$('#loadDetailsInput').click();
$('#loadDetailsInput').onchange=async e=>{
  const f=e.target.files[0];if(!f)return;
  try{
    const j=JSON.parse(await f.text());
    state=deepMerge(clone(def),j);output=j.output||null;
    localStorage.setItem(STORAGE,JSON.stringify(state));
    localStorage.setItem(OUTPUT,JSON.stringify(output));
    location.reload();
  }catch{alert('Invalid details JSON');}
};

function resumeModel(){
  const p=state.profile,o=output||{};
  return {
    name:d.headerName||p.fullName||'Your Name',
    role:d.headerRole||o.title||(state.profile.roleBased?state.profile.work.find(w=>w.enabled!==false)?.role:'')||'Professional',
    summary:o.summary||'Complete your profile and paste tailored JSON from ChatGPT to populate this section.',
    skills:Array.isArray(o.skills)?o.skills:[],
    experience:Array.isArray(o.experience)&&o.experience.length?o.experience:
      state.profile.work.filter(w=>w.enabled!==false).map(w=>({company:w.company,title:state.profile.roleBased?w.role:'',period:w.period,location:w.location,sentences:[]})),
    education:Array.isArray(o.education)&&o.education.length?o.education:state.profile.education,
    certifications:Array.isArray(o.certifications)&&o.certifications.length?o.certifications:state.profile.certifications,
    contact:[p.email,p.phone,p.linkedin,p.location].filter(Boolean).join(' | ')
  };
}
function section(title,body){return `<section class="resume-section"><h3>${title}</h3>${body}</section>`;}

function renderResume(){
  const m=resumeModel(),root=$('#pagesWrap');root.innerHTML='';
  const page=document.createElement('div');page.className='resume-page';
  page.style.setProperty('--resume-font',`'${d.fontFamily}',Arial,sans-serif`);
  page.style.setProperty('--resume-size',`${d.fontSize}pt`);
  page.style.setProperty('--page-margin',`${d.pageMargin}in`);
  page.style.setProperty('--line-spacing',d.lineSpacing);
  page.style.setProperty('--section-gap',`${d.sectionGap}pt`);
  page.style.color=d.fontColor;

  const headerStyle=`--name-size:${d.nameFontSize}pt;--name-color:${d.nameColor};--name-weight:${d.nameBold?700:400};
  --role-size:${d.roleFontSize}pt;--role-color:${d.roleColor};--role-weight:${d.roleBold?700:400};
  --contact-color:${d.contactColor};--header-align:${d.headerAlign==='left'?'left':'center'};
  --section-title-size:${d.sectionTitleSize}pt;--section-title-color:${d.sectionTitleColor};
  --section-title-weight:${d.sectionTitleBold?700:400};--section-title-transform:${d.sectionTitleCaps?'uppercase':'none'};
  --section-title-border:${d.sectionTitleBorder?'1px solid '+d.sectionTitleColor:'none'};
  --section-title-align:${d.sectionTitleAlign};`;
  page.setAttribute('style',(page.getAttribute('style')||'')+headerStyle);

  let header=d.titlePosition==='next'
    ?`<div class="header-next"><div class="resume-name">${esc(m.name)}</div><div class="resume-role">${esc(m.role)}</div></div>`
    :`<div class="resume-name">${esc(m.name)}</div><div class="resume-role">${esc(m.role)}</div>`;

  let html=`<div class="resume-header ${d.headerAlign}">${header}${d.showContact?`<div class="contact-row">${esc(m.contact)}</div>`:''}</div>`;
  const blocks=[];

  if(d.sections.summary)blocks.push({k:'summary',html:section('Professional Summary',`<p>${esc(m.summary)}</p>`)});

  if(d.sections.skills&&m.skills.length){
    const sk=m.skills.map(g=>Object.entries(g).map(([k,v])=>`<div class="skill-row"><b>${esc(k)}:</b> ${esc(Array.isArray(v)?v.join(', '):v)}</div>`).join('')).join('');
    blocks.push({k:'skills',html:section('Technical Skills',sk)});
  }

  if(d.sections.experience){
    let ex='';
    m.experience.forEach((e,i)=>{
      const source=state.profile.work.find(w=>w.company===e.company)||state.profile.work[i]||{};
      const title=e.title||source.role||'',company=e.company||source.company||'',period=e.period||source.period||'',loc=e.location||source.location||'';
      let head='';
      if(d.experienceLayout==='company')
        head=`<div class="job-two"><span><b>${esc(company)}</b><small>${esc(title)}</small></span><span>${esc(loc)}<small>${esc(period)}</small></span></div>`;
      else if(d.experienceLayout==='role')
        head=`<div class="job-two"><span><b>${esc(title)}</b><small>${esc(company)}</small></span><span>${esc(period)}<small>${esc(loc)}</small></span></div>`;
      else
        head=`<div class="job-header"><span><b>${esc(company)}</b> – ${esc(title)}</span><span>${esc(period)}${loc?' | '+esc(loc):''}</span></div>`;
      ex+=`<div class="job-block">${head}${Array.isArray(e.sentences)&&e.sentences.length?`<ul>${e.sentences.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}</div>`;
    });
    blocks.push({k:'experience',html:section('Work Experience',ex)});
  }

  if(d.sections.education&&m.education.length){
    const ed=m.education.filter(e=>e.degree||e.institution||e.degreeMajor||e.school)
      .map(e=>`<div class="edu-line"><span><b>${esc(e.degree||e.degreeMajor||'')}</b>${(e.institution||e.school)?` — ${esc(e.institution||e.school)}`:''}</span><span>${esc(e.period||e.dates||'')}</span></div>`).join('');
    if(ed)blocks.push({k:'education',html:section('Education',ed)});
  }

  if(d.sections.certifications&&m.certifications.length){
    const ce=m.certifications.filter(c=>c.certification||c.institution)
      .map(c=>`<div class="cert-line"><span><b>${esc(c.certification||'')}</b>${c.institution?` — ${esc(c.institution)}`:''}</span><span>${esc(c.date||'')}</span></div>`).join('');
    if(ce)blocks.push({k:'certifications',html:section('Certifications',ce)});
  }

  if(d.boostEducation){
    const ei=blocks.findIndex(x=>x.k==='education'),si=blocks.findIndex(x=>x.k==='skills');
    if(ei>-1&&si>-1){const [b]=blocks.splice(ei,1);const nsi=blocks.findIndex(x=>x.k==='skills');blocks.splice(nsi,0,b);}
  }

  html+=blocks.map(x=>x.html).join('');
  page.innerHTML=html;
  page.style.transform=`scale(${zoom})`;
  root.appendChild(page);
  $('#pageTotal').textContent='1';
  $('#docId').textContent=(output?.company||'resume').slice(0,18);
  $('#thumbs').innerHTML='<div class="thumb active" data-page="1"></div>';
  $('#zoomLabel').textContent=Math.round(zoom*100)+'%';
}

$('#zoomIn').onclick=()=>{zoom=Math.min(1.2,zoom+.05);renderResume();};
$('#zoomOut').onclick=()=>{zoom=Math.max(.4,zoom-.05);renderResume();};

function safePdfName(){
  const n=(state.profile.fullName||'resume').trim().replace(/[^a-z0-9]+/gi,'-').replace(/^-+|-+$/g,'');
  const c=(output?.company||'').trim().replace(/[^a-z0-9]+/gi,'-').replace(/^-+|-+$/g,'');
  return `${n||'resume'}${c?'-'+c:''}-resume.pdf`;
}
function rgb(hex){
  const h=String(hex||'#000000').replace('#','');
  const s=h.length===3?h.split('').map(x=>x+x).join(''):h.padEnd(6,'0').slice(0,6);
  return [parseInt(s.slice(0,2),16)||0,parseInt(s.slice(2,4),16)||0,parseInt(s.slice(4,6),16)||0];
}
function pdfFont(name){
  const n=String(name||'').toLowerCase();
  if(n.includes('times')||n.includes('georgia'))return'times';
  return'helvetica';
}

async function downloadResumePdf(){
  const buttons=[$('#downloadPdfBtn'),$('#viewerDownload')].filter(Boolean);
  const labels=buttons.map(b=>b.textContent);
  buttons.forEach(b=>{b.disabled=true;b.textContent='Downloading…';});

  try{
    if(!window.jspdf?.jsPDF)throw new Error('PDF engine did not load. Refresh the page and try again.');
    const {jsPDF}=window.jspdf;
    const doc=new jsPDF({unit:'pt',format:'letter',compress:true,putOnlyUsedFonts:true});
    const m=resumeModel(),W=612,H=792;
    const margin=Math.max(18,Math.min(90,Number(d.pageMargin||.75)*72));
    const left=margin,right=W-margin,width=right-left;
    const font=pdfFont(d.fontFamily),size=Math.max(8,Math.min(14,+d.fontSize||10));
    const line=size*Math.max(1,Math.min(1.8,+d.lineSpacing||1.2));
    const body=rgb(d.fontColor),sec=rgb(d.sectionTitleColor);
    let y=margin;

    const setc=c=>doc.setTextColor(...c);
    const newPage=()=>{doc.addPage();y=margin;};
    const ensure=h=>{if(y+h>H-margin)newPage();};

    function lines(text,w=width){
      return doc.splitTextToSize(String(text||''),w);
    }
    function write(text,x=left,w=width,bold=false,c=body){
      doc.setFont(font,bold?'bold':'normal');doc.setFontSize(size);setc(c);
      for(const s of lines(text,w)){ensure(line);doc.text(String(s),x,y);y+=line;}
    }
    function title(text){
      const ts=Math.max(8,Math.min(24,+d.sectionTitleSize||12));
      y+=Math.max(4,+d.sectionGap||12);ensure(ts*2);
      doc.setFont(font,d.sectionTitleBold?'bold':'normal');doc.setFontSize(ts);setc(sec);
      const t=d.sectionTitleCaps?String(text).toUpperCase():String(text);
      const center=d.sectionTitleAlign==='center';
      doc.text(t,center?W/2:left,y,{align:center?'center':'left'});
      y+=ts*.5;
      if(d.sectionTitleBorder){doc.setDrawColor(...sec);doc.setLineWidth(.6);doc.line(left,y,right,y);}
      y+=ts*.65;
    }
    function bullet(text){
      const arr=lines(text,width-20);ensure(arr.length*line+2);
      doc.setFont(font,'normal');doc.setFontSize(size);setc(body);doc.text('•',left+7,y);
      for(const s of arr){doc.text(String(s),left+18,y);y+=line;}
      y+=2;
    }

    const nc=rgb(d.nameColor),rc=rgb(d.roleColor),cc=rgb(d.contactColor);
    const ns=Math.max(12,Math.min(40,+d.nameFontSize||24)),rs=Math.max(10,Math.min(30,+d.roleFontSize||18));
    const align=d.headerAlign==='left'?'left':'center',x=align==='left'?left:W/2;

    if(d.titlePosition==='next'){
      doc.setFont(font,d.nameBold?'bold':'normal');doc.setFontSize(ns);setc(nc);doc.text(String(m.name||''),left,y);
      doc.setFont(font,d.roleBold?'bold':'normal');doc.setFontSize(rs);setc(rc);doc.text(String(m.role||''),right,y,{align:'right'});
      y+=Math.max(ns,rs)*1.2;
    }else{
      doc.setFont(font,d.nameBold?'bold':'normal');doc.setFontSize(ns);setc(nc);doc.text(String(m.name||''),x,y,{align});
      y+=ns*1.15;
      doc.setFont(font,d.roleBold?'bold':'normal');doc.setFontSize(rs);setc(rc);doc.text(String(m.role||''),x,y,{align});
      y+=rs*1.15;
    }

    if(d.showContact&&m.contact){
      doc.setFont(font,'normal');doc.setFontSize(Math.max(8,size-1));setc(cc);
      for(const s of lines(m.contact,width)){doc.text(String(s),x,y,{align});y+=Math.max(9,size);}
    }

    const blocks=[];
    if(d.sections.summary)blocks.push(['Professional Summary',()=>write(m.summary)]);
    if(d.sections.skills&&m.skills.length)blocks.push(['Technical Skills',()=>{
      for(const g of m.skills)for(const[k,v]of Object.entries(g))write(`${k}: ${Array.isArray(v)?v.join(', '):v}`);
    }]);
    if(d.sections.experience)blocks.push(['Work Experience',()=>{
      m.experience.forEach((e,i)=>{
        const s=state.profile.work.find(w=>w.company===e.company)||state.profile.work[i]||{};
        const company=e.company||s.company||'',role=e.title||s.role||'',period=e.period||s.period||'',loc=e.location||s.location||'';
        ensure(line*2);
        doc.setFont(font,'bold');doc.setFontSize(size);setc(body);
        doc.text(`${company}${role?' — '+role:''}`,left,y);
        doc.setFont(font,'normal');doc.text([period,loc].filter(Boolean).join(' | '),right,y,{align:'right'});
        y+=line;
        (Array.isArray(e.sentences)?e.sentences:[]).forEach(bullet);
        y+=3;
      });
    }]);
    if(d.sections.education&&m.education.length)blocks.push(['Education',()=>{
      m.education.filter(e=>e.degree||e.degreeMajor||e.institution||e.school).forEach(e=>{
        ensure(line*2);
        doc.setFont(font,'bold');doc.setFontSize(size);setc(body);
        doc.text([e.degree||e.degreeMajor||'',e.institution||e.school||''].filter(Boolean).join(' — '),left,y);
        doc.setFont(font,'normal');doc.text(String(e.period||e.dates||''),right,y,{align:'right'});y+=line;
      });
    }]);
    if(d.sections.certifications&&m.certifications.length)blocks.push(['Certifications',()=>{
      m.certifications.filter(c=>c.certification||c.institution).forEach(c=>{
        ensure(line*2);
        doc.setFont(font,'bold');doc.setFontSize(size);setc(body);
        doc.text([c.certification,c.institution].filter(Boolean).join(' — '),left,y);
        doc.setFont(font,'normal');doc.text(String(c.date||''),right,y,{align:'right'});y+=line;
      });
    }]);

    if(d.boostEducation){
      const ei=blocks.findIndex(x=>x[0]==='Education'),si=blocks.findIndex(x=>x[0]==='Technical Skills');
      if(ei>-1&&si>-1){const[b]=blocks.splice(ei,1);blocks.splice(si,0,b);}
    }
    for(const[t,fn]of blocks){title(t);fn();}

    doc.setProperties({title:`${m.name||'Resume'} - ${m.role||'Resume'}`,author:m.name||'',subject:'Professional Resume',creator:'Resume Tailor'});
    doc.save(safePdfName());
  }catch(e){
    alert(e.message||'PDF download failed.');
  }finally{
    buttons.forEach((b,i)=>{b.disabled=false;b.textContent=labels[i];});
  }
}

$('#downloadPdfBtn').onclick=downloadResumePdf;
$('#viewerDownload').onclick=downloadResumePdf;

renderResume();
if(output)$('#jsonResponse').value=JSON.stringify(output,null,2);
