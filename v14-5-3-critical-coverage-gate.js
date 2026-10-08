
/* Resume Tailor v14.5.3 — Critical Coverage Gate */
(function(){
  const $ = s => document.querySelector(s);
  if (typeof state === "undefined") return;

  const previousBuildPrompt =
    typeof window.buildPrompt === "function" ? window.buildPrompt : null;

  const gate = `

==================================================
MANDATORY CRITICAL-REQUIREMENT COVERAGE GATE
==================================================

DO NOT finalize the resume merely because it "sounds strong."

Before returning JSON, create a SILENT requirement coverage matrix from the job description.

For each requirement classify it as:
- CRITICAL
- HIGH
- MEDIUM
- LOW

For every CRITICAL requirement, identify:
1. where it appears in the resume
2. which company/role provides the evidence
3. whether the evidence is DIRECT or ADJACENT
4. whether it appears in Experience, not just Skills

For every HIGH requirement, perform the same check where reasonably supportable.

A CRITICAL requirement is considered adequately covered only if:
- it appears naturally in the resume
- it is supported by Experience when defensible
- the strongest evidence is placed prominently
- it is not merely dumped into the Skills section
- it is interview-defensible

If a CRITICAL requirement is missing but adjacent experience exists:
- map the underlying capability aggressively
- rewrite bullets to surface that capability
- use target-role terminology where defensible
- place the strongest relevant evidence in recent roles first

Examples:
Python -> C#/.NET backend engineering
AWS -> Azure/GCP cloud architecture
Kafka -> event streaming / messaging
PostgreSQL -> relational database engineering
React -> modern frontend architecture
Terraform -> infrastructure-as-code
Kubernetes -> container orchestration/platform engineering
Power BI/Tableau -> BI/dashboard/analytics delivery
LLM/AI agents -> AI-enabled analytical workflows, automation, model integration, retrieval/orchestration, decision-support systems, when adjacent experience supports it

DO NOT fabricate hard factual records or claim direct experience with a specific technology when only adjacent experience exists.
Instead, express the transferable capability credibly.

==================================================
MANDATORY REWRITE LOOP
==================================================

After the first draft, silently evaluate:

A. Critical Requirement Coverage — 30 points
B. High-Priority Requirement Coverage — 15 points
C. Experience Evidence Strength — 20 points
D. Recruiter 10-Second Relevance — 15 points
E. Hiring-Manager Technical/Domain Depth — 10 points
F. ATS Keyword Coverage and Natural Language — 5 points
G. Credibility and Consistency — 5 points

TOTAL = 100.

MINIMUM INTERNAL INTERVIEW-READINESS TARGET: 85/100.

IF BELOW 85:
DO NOT RETURN JSON YET.

Revise again by:
- replacing weak bullets
- strengthening recent-role bullets
- adding missing critical requirement evidence
- improving adjacent-skill mapping
- reordering bullets by JD importance
- rebuilding the summary
- rebuilding skills in JD priority order
- removing irrelevant material
- strengthening architecture/ownership/business-impact language where appropriate
- eliminating generic filler

Then audit again.

Repeat until:
- internal score is at least 85
OR
- no further truthful improvement is reasonably possible.

==================================================
FIRST-PAGE / FIRST-SCREEN RULE
==================================================

The first screen/page must communicate:
- target role relevance
- correct seniority
- top technologies/capabilities
- strongest 3-5 JD requirements
- ownership
- relevant domain context
- measurable or concrete impact where supportable

The recruiter should not need to search for the match.

==================================================
ANTI-REPHRASING RULE
==================================================

If a bullet is merely a cleaner version of a weak generic bullet, replace it.

Each bullet should answer at least one of:
- What important JD requirement does this prove?
- What technical capability does this prove?
- What ownership does this prove?
- What business/engineering outcome does this prove?
- Why should this person get a first-round call?

==================================================
OUTPUT VALIDATION
==================================================

Before final output, silently verify:

- Every CRITICAL requirement is covered where defensible.
- HIGH requirements are covered where supportable.
- Critical evidence appears in Experience, not only Skills.
- Most recent roles contain the strongest evidence.
- First 2-3 bullets of recent roles directly address top hiring priorities.
- Summary is role-specific.
- Skills are JD-prioritized.
- No generic filler remains.
- No unsupported hard credentials are introduced.
- No contradiction exists between summary, skills, and experience.
- Resume is interview-defensible.

Set targeting.tailoredMatchScore to the final internal audit score.
Do not automatically assign 90-100 without completing the coverage audit.
`;

  function buildPromptV1453() {
    let base = previousBuildPrompt ? previousBuildPrompt() : ($("#aiPrompt")?.value || "");
    if (!base) return "";

    if (base.includes("MANDATORY CRITICAL-REQUIREMENT COVERAGE GATE")) {
      const box = $("#aiPrompt");
      if (box) box.value = base;
      return base;
    }

    const marker = "==================================================\nJOB DESCRIPTION";
    const finalPrompt = base.includes(marker)
      ? base.replace(marker, gate + "\n" + marker)
      : base + gate;

    const box = $("#aiPrompt");
    if (box) box.value = finalPrompt;
    return finalPrompt;
  }

  window.buildPrompt = buildPromptV1453;

  const buildBtn = $("#buildPrompt");
  if (buildBtn) buildBtn.onclick = buildPromptV1453;

  const copyBtn = $("#copyPrompt");
  if (copyBtn) {
    copyBtn.onclick = async () => {
      const txt = buildPromptV1453();
      try {
        await navigator.clipboard.writeText(txt);
        const status = $("#copyStatus");
        if (status) {
          status.textContent = "Critical-coverage 85+ interview prompt copied.";
        }
      } catch {
        const box = $("#aiPrompt");
        if (box) {
          box.focus();
          box.select();
          document.execCommand("copy");
        }
      }
    };
  }

  buildPromptV1453();
})();
