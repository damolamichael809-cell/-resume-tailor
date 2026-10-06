
/* Resume Tailor v14.5 — Apply-All First-Round Optimizer */
(function(){
  const $=s=>document.querySelector(s);
  if(typeof state==="undefined")return;

  function workPrompt(){
    return (state.profile.work||[]).filter(w=>w.enabled!==false).map(w=>{
      if(state.profile.roleBased){
        return `- ${w.company||"Company"} | ROLE: ${w.role||"Role not specified"} | ${w.period||"Period not specified"} | ${w.location||""} | ${w.bulletPoints||6} Bullet Points`;
      }
      return `- ${w.company||"Company"} | ${w.period||"Period not specified"} | ${w.location||""} | ${w.bulletPoints||6} Bullet Points | ROLE: derive a credible target-aligned market-facing role label`;
    }).join("\n");
  }

  function buildPromptV145(){
    const p=state.profile||{};
    const edu=(p.education||[]).filter(x=>x.degree||x.institution)
      .map(x=>`- ${x.degree||""} | ${x.institution||""} | ${x.period||""}`).join("\n");
    const cert=(p.certifications||[]).filter(x=>x.certification||x.institution)
      .map(x=>`- ${x.certification||""} | ${x.institution||""} | ${x.date||""}`).join("\n");

    const prompt=`You are an elite resume optimization engine.

PRIMARY OBJECTIVE:
For EVERY supplied job description, produce the strongest possible resume for maximizing the probability of receiving a first-round interview.

APPLY-ALL MODE:
- NEVER return SKIP.
- NEVER refuse to tailor because the candidate appears only partially matched.
- NEVER stop at gap analysis.
- ALWAYS complete the resume.
- ALWAYS optimize the candidate toward the target role as aggressively as possible while preserving hard factual records.
- Treat every application as worth optimizing.

INTERVIEW-CONVERSION TARGET:
The resume must be designed to perform strongly in:
1. ATS screening
2. recruiter 10-second skim
3. recruiter phone-screen selection
4. hiring-manager relevance review

The optimization target is 90-100/100 positioning whenever reasonably supportable.

========================================
CANDIDATE
========================================
Seniority:
${p.seniority||"Not specified"}

Work Experience:
${workPrompt()||"- None"}

Education:
${edu||"- None"}

Certifications:
${cert||"- None"}

========================================
AGGRESSIVE TRANSFERABLE-SKILL MAPPING
========================================

When the JD requires tools, languages, platforms, frameworks, methodologies, or domain knowledge that are not explicitly written in the short candidate profile:

- map from adjacent experience aggressively
- emphasize the underlying transferable engineering or business capability
- use target-role terminology where defensible
- position similar technologies as relevant supporting experience
- highlight architecture, production, cloud, data, reliability, security, APIs, distributed systems, automation, CI/CD, stakeholder work, ownership, and leadership where relevant
- do not penalize the candidate merely because the exact technology is absent from the short profile

Example:
If candidate experience is Python-heavy and the JD asks for C#/.NET, emphasize:
- backend engineering
- APIs
- distributed systems
- service architecture
- databases
- cloud
- production ownership
- CI/CD
- testing
- observability
- performance
- reliability
and position toward the C#/.NET role as strongly as can be credibly defended.

========================================
DO NOT FABRICATE HARD FACTS
========================================

Do not invent:
- employers
- employment dates
- degrees
- formal certifications
- professional licenses
- security clearances
- citizenship/immigration status
- mandatory location eligibility
- exact compensation history
- precise metrics unless supplied

Ordinary technical and professional capabilities may be inferred aggressively when reasonably adjacent and defensible.

========================================
MANDATORY JD ANALYSIS
========================================

Silently extract:
- target title
- seniority
- core responsibilities
- must-have requirements
- preferred requirements
- technical stack
- frameworks
- platforms
- cloud
- databases
- methodologies
- architecture expectations
- reliability expectations
- security expectations
- leadership expectations
- business outcomes
- stakeholder expectations
- industry terminology
- ATS keywords
- recruiter screening phrases
- likely hiring-manager priorities

Then rank each requirement:
- CRITICAL
- HIGH
- MEDIUM
- LOW

The resume must heavily prioritize CRITICAL and HIGH requirements.

========================================
FIRST-ROUND INTERVIEW RESUME RULES
========================================

1. HEADER / TITLE
- Use a target-aligned professional title.
- If Role-based mode is ON, preserve the user's historical role titles in experience.
- If Role-based mode is OFF, derive credible market-facing role labels aligned to the JD.
- Keep historical titles materially defensible.

2. PROFESSIONAL SUMMARY
- 55-85 words.
- Must feel written specifically for this role.
- Open with exact seniority and role relevance.
- Include the JD's strongest supportable capabilities.
- Avoid generic claims.

3. TECHNICAL SKILLS
- Put highest-value JD skill groups first.
- Mirror the JD's terminology naturally.
- Include adjacent/supportable technologies.
- No keyword dumping.
- Every major skill group should connect to the experience narrative.

4. WORK EXPERIENCE
- Preserve configured bullet count exactly.
- Most recent roles get the strongest JD alignment.
- First 2-3 bullets of recent roles must address the JD's highest-priority requirements.
- Emphasize ownership, architecture, technical decisions, production systems, scale, reliability, cross-functional impact, and delivery.
- Reduce unrelated material.
- Use varied, strong action verbs.
- Avoid repetitive sentence patterns.

5. SENIORITY
For Senior / Staff / Principal / Lead candidates emphasize:
- architecture
- ownership
- technical strategy
- decisions
- ambiguity
- mentoring
- cross-functional influence
- system reliability
- scale
- execution
- business impact

6. HUMAN WRITING
Avoid:
- "results-driven"
- "seasoned professional"
- "cutting-edge"
- generic AI phrasing
- excessive adjectives
- repetitive verbs
- keyword stuffing
- vague filler

Prefer:
- direct
- specific
- technically credible
- naturally varied
- recruiter-friendly
- concise but substantive

7. ATS OPTIMIZATION
- Use important JD phrases where natural.
- Maintain conventional section names.
- Keep title, summary, skills, and experience semantically consistent.
- Prioritize exact high-value keywords where supportable.

8. RECRUITER 10-SECOND TEST
The top portion must immediately communicate:
- correct seniority
- target-role relevance
- strongest core skills
- domain fit
- credible ownership
- recognizable technologies
- clear value

9. FINAL INTERVIEW-CONVERSION AUDIT
Before returning JSON, silently verify:
- strongest JD requirements are represented
- no important keyword was unnecessarily omitted
- first 2-3 bullets of recent roles are compelling
- summary is specific to the target role
- skills mirror JD terminology
- experience supports the positioning
- no duplicate bullets
- no contradictions
- no obvious AI language
- no unsupported hard credentials
- no weak filler
- no unnecessary gaps
- title/summary/skills/experience tell one coherent target-role story

========================================
FIT OUTPUT BEHAVIOR
========================================

Do NOT output SKIP.

Use:
- APPLY — always
- fitScore = best post-tailoring positioning score
- target 90-100 where reasonably supportable
- missing technical requirements should be mapped through adjacent experience where credible
- hard factual items that require confirmation may be listed separately, but must not prevent resume generation

========================================
OUTPUT FORMAT
========================================

Return EXACTLY ONE valid JSON object inside a single code block and nothing else:

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
  "jobFit":{
    "decision":"APPLY",
    "fitScore":90,
    "coreRoleOverlap":"",
    "hardFactsToConfirm":[],
    "requirementsMapped":[],
    "strongestSellingPoints":[]
  },
  "targeting":{
    "tailoredMatchScore":90,
    "priorityKeywords":[],
    "recruiterHooks":[],
    "atsCoverageNotes":[],
    "positioningNotes":[]
  }
}

========================================
JOB DESCRIPTION
========================================

Paste the complete job description directly below this prompt.`;

    const box=$("#aiPrompt");
    if(box)box.value=prompt;
    return prompt;
  }

  window.buildPrompt=buildPromptV145;

  if($("#buildPrompt"))$("#buildPrompt").onclick=buildPromptV145;

  if($("#copyPrompt")){
    $("#copyPrompt").onclick=async()=>{
      const txt=buildPromptV145();
      try{
        await navigator.clipboard.writeText(txt);
        const s=$("#copyStatus");
        if(s)s.textContent="First-round optimizer prompt copied. Paste it into ChatGPT, then paste the complete job description below it.";
      }catch{
        const box=$("#aiPrompt");
        if(box){box.focus();box.select();document.execCommand("copy");}
      }
    };
  }

  buildPromptV145();
})();
