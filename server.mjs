import http from 'node:http';import {readFile,stat} from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
const __dirname=path.dirname(fileURLToPath(import.meta.url));const PORT=Number(process.env.PORT||8080);const KEY=process.env.OPENAI_API_KEY||'';const MODEL=process.env.OPENAI_MODEL||'gpt-6-sol';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};
const clean=(v,n=200000)=>String(v??'').trim().slice(0,n);function send(res,s,d){const b=JSON.stringify(d);res.writeHead(s,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(b)}
async function body(req){const a=[];let n=0;for await(const c of req){n+=c.length;if(n>2500000)throw Error('Request too large');a.push(c)}return JSON.parse(Buffer.concat(a).toString()||'{}')}

function prompt(p,jd){
  const work=(p.workExperiences||[]).map((e,i)=>`- ROLE ${i+1}: ${clean(e.company,200)} | ${clean(e.title,160)} | ${clean(e.dates,100)} | ${clean(e.location,120)} | ${Math.max(1,Math.min(20,+e.bulletPoints||6))} Bullet Points`).join('\n');
  const edu=(p.educations||[]).map(e=>`- ${clean(e.degreeMajor,240)} | ${clean(e.school,240)} | ${clean(e.dates,100)}`).join('\n');
  const cert=(p.certifications||[]).map(c=>`- ${clean(c.certification,240)} | ${clean(c.institution,240)} | ${clean(c.date,100)}`).join('\n');

  return `You are an elite resume optimization engine whose objective is to maximize interview conversion for a qualified candidate.

Your output MUST be exactly ONE valid JSON object and nothing else.
Do NOT include markdown fences, explanations, comments, or prose outside JSON.

========================================
PRIMARY OBJECTIVE
========================================
Create the strongest credible, ATS-optimized, recruiter-convincing resume possible for the supplied job description.

Optimize simultaneously for:
1. ATS keyword coverage.
2. Recruiter 10-second skim.
3. Hiring-manager relevance.
4. Technical credibility.
5. Strong role-to-role narrative.
6. Clear business impact.
7. Interview conversion.

Think through the job description silently before writing. Identify:
- target title and seniority,
- must-have requirements,
- preferred requirements,
- core technologies,
- domain language,
- business outcomes,
- leadership expectations,
- architecture/system-design expectations,
- operational/reliability expectations,
- collaboration expectations,
- industry-specific vocabulary.

Then aggressively align the resume to those signals.

========================================
CANDIDATE PROFILE
========================================
Seniority Level: ${clean(p.seniority,120)||'Not specified'}

Work Experience:
${work||'- None'}

Education:
${edu||'- None'}

Certifications:
${cert||'- None'}

========================================
OUTPUT JSON SCHEMA
========================================
{
  "company":"",
  "title":"",
  "summary":"",
  "skills":[{"Category":["Skill"]}],
  "experience":[
    {
      "company":"",
      "title":"",
      "location":"",
      "period":"",
      "sentences":["..."]
    }
  ],
  "education":[{"institution":"","degree":"","period":""}],
  "certifications":[{"institution":"","certification":"","date":""}],
  "targeting":{
    "matchScore":0,
    "priorityKeywords":[],
    "missingRequirements":[],
    "positioningNotes":[]
  }
}

========================================
MAX-INTERVIEW TAILORING RULES
========================================
- Tailor VERY aggressively to the job description.
- Use exact terminology from the job description wherever natural and defensible.
- Front-load the highest-value keywords in the summary, skills, and recent experience.
- Make the first 2-3 bullets of each recent role directly relevant to the target position.
- Rewrite weak/general responsibilities into strong accomplishment-oriented bullets.
- Use strong verbs such as Designed, Built, Led, Architected, Optimized, Automated, Delivered, Implemented, Scaled, Hardened, Migrated, Integrated, Reduced, Improved, Accelerated, and Owned where appropriate.
- Prefer impact language: reliability, performance, scale, latency, cost, conversion, throughput, developer productivity, security, availability, customer experience, delivery speed, operational efficiency, and revenue impact.
- If exact metrics are not supplied, DO NOT invent precise percentages, dollar values, user counts, or fabricated measurements. Use strong non-numeric scale/impact language instead.
- You MAY infer reasonable responsibilities, tools, adjacent skills, architectural involvement, and scope that are consistent with the candidate's role, seniority, employer context, and target job, but do not create claims that would be obviously inconsistent with the candidate's background.
- Reframe adjacent experience to match the target role as strongly as possible.
- Emphasize transferable experience even if the exact job-title wording differs.
- Use the target role's preferred vocabulary rather than generic synonyms.
- Remove low-value or irrelevant language when higher-value target-aligned content can replace it.
- Avoid generic AI phrases such as "results-driven", "passionate professional", "dynamic", "seasoned", "proven track record", and "leveraged" unless truly useful.
- Keep bullets concise, specific, technical, and interview-ready.
- Each bullet must end with a period.
- Keep the configured bullet count for every supplied work entry EXACTLY.
- Preserve actual company names, dates/periods, education, and certifications.
- Do not invent employers, degrees, certifications, licenses, security clearances, employment dates, or job locations.
- Historical role titles should stay materially faithful to the candidate's real role. You may normalize wording slightly when it remains equivalent and defensible.
- The output "title" field should be the target job title or the closest defensible market-facing title.
- Skills should be grouped into useful ATS categories and prioritize the technologies and concepts in the job description.
- Include skills that are directly supported or reasonably adjacent to the candidate's background and that the candidate could credibly discuss.
- Summary should be approximately 55-90 words, dense with relevant value, seniority, domain, architecture/technical depth, and job-specific keywords.
- For senior/staff/lead roles, emphasize ownership, system design, technical leadership, cross-functional influence, mentoring, reliability, architecture, and end-to-end delivery when applicable.
- For product roles, emphasize roadmap ownership, customer problems, metrics, execution, stakeholder alignment, GTM, platform/API fluency, and regulated/domain context when applicable.
- For data/AI roles, emphasize modeling, experimentation, data pipelines, productionization, measurable business impact, stakeholder communication, and relevant ML/LLM tooling when applicable.
- For security roles, emphasize offensive/defensive depth, threat modeling, vulnerability classes, secure SDLC, detection quality, automation, cloud/container context, and reduction of false positives when applicable.
- For infrastructure/SRE/platform roles, emphasize distributed systems, cloud, Kubernetes, observability, incident response, automation, reliability, scalability, networking, IaC, and operational ownership when applicable.
- For each job, prioritize relevance over chronology within the bullets while preserving company order.
- Avoid keyword stuffing that reads unnaturally.
- Do not repeat the same achievement pattern across roles.
- Make the resume sound like a strong human candidate, not an AI-generated document.
- The final resume should feel intentionally written for THIS job, not adapted from a generic template.

========================================
TARGETING METADATA RULES
========================================
- matchScore: 0-100 estimate of how closely the tailored resume aligns to the job description after optimization.
- priorityKeywords: 8-20 highest-value JD terms actually represented in the resume.
- missingRequirements: only meaningful requirements that cannot be credibly represented from the candidate profile.
- positioningNotes: short internal notes explaining the strongest positioning choices. These notes are not rendered on the resume.

========================================
JOB DESCRIPTION
========================================
${clean(jd,180000)}`;
}

function extract(x){if(typeof x?.output_text==='string')return x.output_text;let s='';for(const i of x?.output||[])for(const c of i?.content||[])if(c?.type==='output_text')s+=c.text||'';return s.trim()}

async function tailor(req,res){
  let x;try{x=await body(req)}catch(e){return send(res,400,{error:e.message})}
  if(!KEY)return send(res,503,{error:'OPENAI_API_KEY is not configured on the server.'});
  if(clean(x.jobDescription).length<40)return send(res,400,{error:'Paste a complete job description first.'});
  let r;
  try{
    r=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{authorization:`Bearer ${KEY}`,'content-type':'application/json'},
      body:JSON.stringify({
        model:MODEL,
        input:prompt(x.profile||{},x.jobDescription),
        max_output_tokens:18000
      })
    })
  }catch(e){return send(res,502,{error:e.message})}
  const raw=await r.json().catch(()=>({}));
  if(!r.ok)return send(res,400,{error:raw?.error?.message||'AI request failed'});
  try{
    const obj=JSON.parse(extract(raw).replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''));
    return send(res,200,{resume:obj,model:raw.model||MODEL})
  }catch(e){return send(res,502,{error:'The AI returned invalid JSON: '+e.message})}
}

async function staticFile(req,res){
  let u=new URL(req.url,`http://${req.headers.host||'localhost'}`).pathname;
  if(u==='/')u='/index.html';
  const f=path.resolve(__dirname,'.'+decodeURIComponent(u));
  if(!f.startsWith(__dirname+path.sep)){res.writeHead(403);return res.end('Forbidden')}
  try{
    const st=await stat(f);const q=st.isDirectory()?path.join(f,'index.html'):f;
    const data=await readFile(q);
    res.writeHead(200,{'content-type':mime[path.extname(q)]||'application/octet-stream'});
    res.end(data)
  }catch{res.writeHead(404);res.end('Not found')}
}

http.createServer((req,res)=>{
  if(req.method==='POST'&&req.url?.split('?')[0]==='/api/tailor')return tailor(req,res);
  if(req.method==='GET')return staticFile(req,res);
  res.writeHead(405);res.end('Method not allowed')
}).listen(PORT,'0.0.0.0',()=>console.log(`Resume Tailor running on ${PORT}`));
