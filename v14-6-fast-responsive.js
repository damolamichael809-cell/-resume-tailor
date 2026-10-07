
(function(){
  const $=s=>document.querySelector(s);
  if(typeof state==="undefined")return;
  const OUTPUT="resume-tailor:output:v9";
  let timer=null,lastRaw="",lastObj=null;

  function clean(t){return String(t||"").trim().replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"");}
  function parse(show){
    const a=$("#jsonResponse"),e=$("#jsonError");
    if(!a)return {ok:false};
    const raw=clean(a.value);
    if(!raw){if(show&&e)e.textContent="Paste the tailored JSON first.";return {ok:false};}
    if(raw===lastRaw&&lastObj){if(e)e.textContent="";return {ok:true,obj:lastObj};}
    try{
      const obj=JSON.parse(raw);lastRaw=raw;lastObj=obj;if(e)e.textContent="";return {ok:true,obj};
    }catch(err){
      if(show&&e)e.textContent="JSON is incomplete or invalid: "+err.message;
      return {ok:false};
    }
  }
  function apply(obj){
    output=obj;
    localStorage.setItem(OUTPUT,JSON.stringify(output));
    if(typeof renderResume==="function")renderResume();
  }

  const area=$("#jsonResponse");
  if(area){
    area.oninput=()=>{
      clearTimeout(timer);
      timer=setTimeout(()=>{const p=parse(false);if(p.ok)apply(p.obj);},70);
    };
    area.addEventListener("paste",()=>setTimeout(()=>area.oninput(),0));
  }

  $(".json-actions")?.remove();
  const auto=$("#autoDownload");
  if(auto)auto.closest(".role-toggle")?.remove();

  if(area&&!$("#v146Hint")){
    const h=document.createElement("div");
    h.id="v146Hint";h.className="v146-hint";
    h.textContent="Paste JSON here. Preview updates automatically. Then click Download PDF.";
    area.insertAdjacentElement("beforebegin",h);
  }

  const pdf=typeof window.downloadResumePdf==="function"?window.downloadResumePdf:null;
  async function download(){
    const p=parse(true);if(!p.ok)return;
    apply(p.obj);
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    if(pdf)return pdf();
    if(typeof window.downloadResumePdf==="function")return window.downloadResumePdf();
    if($("#jsonError"))$("#jsonError").textContent="PDF engine unavailable. Refresh and try again.";
  }

  if($("#downloadPdfBtn"))$("#downloadPdfBtn").onclick=download;
  if($("#viewerDownload"))$("#viewerDownload").onclick=download;

  const css=document.createElement("style");
  css.textContent=`
    .v146-hint{padding:9px 11px;font-size:11px;color:var(--muted);border-bottom:1px solid var(--border);background:var(--surface2)}
    #jsonResponse{min-height:250px!important}
    .pages-wrap{scroll-behavior:auto!important}
    .customize-drawer input,.customize-drawer select,.customize-drawer button{touch-action:manipulation}
    #downloadPdfBtn{font-weight:800!important}
  `;
  document.head.appendChild(css);

  const first=parse(false);if(first.ok)apply(first.obj);
})();
