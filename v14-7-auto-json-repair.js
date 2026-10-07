
/* Resume Tailor v14.7 — Automatic JSON Repair */
(function(){
  const $=s=>document.querySelector(s);
  if(typeof state==="undefined")return;

  const OUTPUT="resume-tailor:output:v9";
  let timer=null,lastClean="",lastObj=null;

  function extractJsonBlock(raw){
    let s=String(raw||"").trim();

    /* Remove markdown code fences */
    s=s.replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"");

    /* Remove ChatGPT/OpenAI citation/reference artifacts */
    s=s.replace(/:chatgpt-content-reference\{[^}]*\}/gi,"");
    s=s.replace(/[^]*/g,"");
    s=s.replace(/\[?chatgpt-content-reference[^\]\n]*\]?/gi,"");

    /* If text exists before/after JSON, keep outermost object */
    const first=s.indexOf("{");
    const last=s.lastIndexOf("}");
    if(first>=0 && last>first)s=s.slice(first,last+1);

    return s.trim();
  }

  function repairJson(raw){
    let s=extractJsonBlock(raw);

    /* Normalize smart quotes that sometimes appear around keys/values */
    s=s
      .replace(/[\u201C\u201D]/g,'"')
      .replace(/[\u2018\u2019]/g,"'");

    /* Remove trailing commas before object/array close */
    s=s.replace(/,\s*([}\]])/g,"$1");

    /* Remove zero-width / BOM chars */
    s=s.replace(/[\u200B-\u200D\uFEFF]/g,"");

    return s.trim();
  }

  function parse(showError=false){
    const area=$("#jsonResponse"),err=$("#jsonError");
    if(!area)return {ok:false};

    const clean=repairJson(area.value);
    if(!clean){
      if(showError&&err)err.textContent="Paste the tailored JSON first.";
      return {ok:false};
    }

    if(clean===lastClean&&lastObj){
      if(err)err.textContent="";
      return {ok:true,obj:lastObj,clean};
    }

    try{
      const obj=JSON.parse(clean);
      lastClean=clean;
      lastObj=obj;
      if(err)err.textContent="";
      return {ok:true,obj,clean};
    }catch(e){
      if(showError&&err){
        err.textContent="Could not auto-repair this JSON: "+e.message;
      }
      return {ok:false,error:e.message,clean};
    }
  }

  function apply(obj){
    output=obj;
    localStorage.setItem(OUTPUT,JSON.stringify(output));
    if(typeof renderResume==="function")renderResume();
  }

  const area=$("#jsonResponse");
  if(area){
    const onChange=()=>{
      clearTimeout(timer);
      timer=setTimeout(()=>{
        const p=parse(false);
        if(p.ok){
          /* Replace pasted text with repaired valid JSON silently */
          area.value=JSON.stringify(p.obj,null,2);
          apply(p.obj);
        }
      },60);
    };

    area.oninput=onChange;
    area.addEventListener("paste",()=>setTimeout(onChange,0));
  }

  /* Patch existing Download PDF button so latest paste is always repaired first */
  const currentPdf=typeof window.downloadResumePdf==="function"?window.downloadResumePdf:null;

  async function repairedDownload(){
    const p=parse(true);
    if(!p.ok)return;

    if(area)area.value=JSON.stringify(p.obj,null,2);
    apply(p.obj);

    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));

    if(currentPdf)return currentPdf();
    if(typeof window.downloadResumePdf==="function")return window.downloadResumePdf();

    const e=$("#jsonError");
    if(e)e.textContent="PDF engine unavailable. Refresh the page and try again.";
  }

  if($("#downloadPdfBtn"))$("#downloadPdfBtn").onclick=repairedDownload;
  if($("#viewerDownload"))$("#viewerDownload").onclick=repairedDownload;

  /* Small status hint */
  if(area && !$("#v147RepairHint")){
    const h=document.createElement("div");
    h.id="v147RepairHint";
    h.className="v147-repair-hint";
    h.textContent="Auto-repair ON: ChatGPT reference tags, code fences, smart quotes, and trailing commas are cleaned automatically.";
    area.insertAdjacentElement("beforebegin",h);
  }

  const css=document.createElement("style");
  css.textContent=`
    .v147-repair-hint{
      padding:8px 11px;
      font-size:10.5px;
      line-height:1.4;
      color:var(--muted);
      border-bottom:1px solid var(--border);
      background:var(--surface2);
    }
  `;
  document.head.appendChild(css);

  const first=parse(false);
  if(first.ok){
    if(area)area.value=JSON.stringify(first.obj,null,2);
    apply(first.obj);
  }
})();
