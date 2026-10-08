
(function(){
  const $=s=>document.querySelector(s);
  if(typeof state==="undefined") return;

  const previousBuildPrompt = typeof window.buildPrompt==="function" ? window.buildPrompt : null;

  const gate = `

==================================================
MANDATORY 85+ FIRST-ROUND QUALITY GATE
==================================================

Before returning the final JSON, perform a SILENT resume-screening audit.

Score the completed resume from 0-100 using:

1. Target-role / JD alignment — 25
2. Experience evidence — 25
3. Technical/domain keyword coverage — 15
4. Recruiter 10-second skim — 15
5. Hiring-manager depth — 10
6. Credibility / consistency — 10

MINIMUM ACCEPTABLE INTERNAL SCORE: 85/100.

IF THE SCORE IS BELOW 85:
DO NOT RETURN THE RESUME YET.

Silently revise it again by:
- strengthening the summary
- strengthening the first 2-3 bullets of recent roles
- replacing generic bullets
- improving critical requirement coverage
- reordering bullets by hiring importance
- improving skill prioritization
- strengthening recruiter hooks
- improving hiring-manager relevance
- removing filler and duplication

Repeat the audit until the resume reaches at least 85/100 internally OR no further truthful improvement is reasonably possible.

Do not fabricate hard facts such as employers, dates, degrees, certifications, licenses, clearances, citizenship, work authorization, or unsupported exact metrics.

The 85+ threshold is a quality-control target, not permission to invent facts.

Set targeting.tailoredMatchScore to the final internal audit score rather than automatically writing 90 or 100.
`;

  function buildPromptV1452(){
    let base = previousBuildPrompt ? previousBuildPrompt() : ($("#aiPrompt")?.value || "");
    if(!base) return "";

    if(base.includes("MANDATORY 85+ FIRST-ROUND QUALITY GATE")){
      const box=$("#aiPrompt");
      if(box) box.value=base;
      return base;
    }

    const marker="==================================================\nJOB DESCRIPTION";
    const finalPrompt = base.includes(marker) ? base.replace(marker, gate+"\n"+marker) : base+gate;

    const box=$("#aiPrompt");
    if(box) box.value=finalPrompt;
    return finalPrompt;
  }

  window.buildPrompt=buildPromptV1452;

  if($("#buildPrompt")) $("#buildPrompt").onclick=buildPromptV1452;

  if($("#copyPrompt")){
    $("#copyPrompt").onclick=async()=>{
      const txt=buildPromptV1452();
      try{
        await navigator.clipboard.writeText(txt);
        const s=$("#copyStatus");
        if(s) s.textContent="85+ quality-gated tailoring prompt copied.";
      }catch{
        const box=$("#aiPrompt");
        if(box){ box.focus(); box.select(); document.execCommand("copy"); }
      }
    };
  }

  buildPromptV1452();
})();
