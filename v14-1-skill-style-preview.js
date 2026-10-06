
/* Resume Tailor v14.1 — Skill Styling + Full Paper Preview */
(function(){
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  if(typeof state==="undefined" || typeof d==="undefined") return;

  /* Remove v14's content-editing skills panel: user wants styling only */
  const oldEditor=$("#v14SkillsEditor");
  if(oldEditor) oldEditor.remove();

  const defaults={
    skillCategorySize:9.5,
    skillCategoryColor:"#222222",
    skillCategoryBold:true,
    skillCategoryItalic:false,
    skillTextSize:9.5,
    skillTextColor:"#333333",
    skillGroupGap:2.5
  };
  Object.entries(defaults).forEach(([k,v])=>{ if(d[k]===undefined) d[k]=v; });

  /* ---------- technical skills styling controls ---------- */
  const drawer=$("#customizeDrawer");
  if(drawer && !$("#v141SkillStylePanel")){
    const panel=document.createElement("details");
    panel.id="v141SkillStylePanel";
    panel.open=true;
    panel.innerHTML=`
      <summary>Technical Skills Styling</summary>

      <div class="subhead">Category / Subheader</div>

      <label>Font Size
        <div class="unit-row">
          <input id="v141CategorySize" type="number" min="7" max="14" step=".25">
          <span>pt</span>
        </div>
      </label>

      <label>Font Color
        <div class="color-row">
          <input id="v141CategoryColorText">
          <input id="v141CategoryColor" type="color">
        </div>
      </label>

      <label class="switch-line">Bold
        <input id="v141CategoryBold" type="checkbox">
      </label>

      <label class="switch-line">Italic
        <input id="v141CategoryItalic" type="checkbox">
      </label>

      <div class="subhead">Skills Text</div>

      <label>Font Size
        <div class="unit-row">
          <input id="v141SkillTextSize" type="number" min="7" max="14" step=".25">
          <span>pt</span>
        </div>
      </label>

      <label>Font Color
        <div class="color-row">
          <input id="v141SkillTextColorText">
          <input id="v141SkillTextColor" type="color">
        </div>
      </label>

      <label>Space Between Skill Groups
        <div class="unit-row">
          <input id="v141SkillGroupGap" type="number" min="0" max="10" step=".5">
          <span>pt</span>
        </div>
      </label>
    `;

    const all=[...drawer.querySelectorAll("details")];
    const exp=all.find(x=>x.querySelector("summary")?.textContent.trim()==="Experience");
    if(exp) drawer.insertBefore(panel,exp);
    else drawer.appendChild(panel);
  }

  function bindNum(id,key){
    const el=$("#"+id); if(!el)return;
    el.value=d[key];
    el.oninput=()=>{ d[key]=+el.value; save(); applyStyles(); };
  }
  function bindCheck(id,key){
    const el=$("#"+id); if(!el)return;
    el.checked=!!d[key];
    el.onchange=()=>{ d[key]=el.checked; save(); applyStyles(); };
  }
  function bindColor(textId,colorId,key){
    const t=$("#"+textId),c=$("#"+colorId); if(!t||!c)return;
    t.value=d[key]; c.value=d[key];
    t.oninput=()=>{ d[key]=t.value; try{c.value=d[key]}catch{} save(); applyStyles(); };
    c.oninput=()=>{ d[key]=c.value; t.value=d[key]; save(); applyStyles(); };
  }

  bindNum("v141CategorySize","skillCategorySize");
  bindColor("v141CategoryColorText","v141CategoryColor","skillCategoryColor");
  bindCheck("v141CategoryBold","skillCategoryBold");
  bindCheck("v141CategoryItalic","skillCategoryItalic");
  bindNum("v141SkillTextSize","skillTextSize");
  bindColor("v141SkillTextColorText","v141SkillTextColor","skillTextColor");
  bindNum("v141SkillGroupGap","skillGroupGap");

  const css=document.createElement("style");
  css.id="v141-css";
  css.textContent=`
    /* Skill styling */
    .resume-page .skill-row{
      font-size:calc(var(--v141-skill-text-size,9.5) * 1pt)!important;
      color:var(--v141-skill-text-color,#333333)!important;
      margin-bottom:calc(var(--v141-skill-gap,2.5) * 1pt)!important;
      line-height:1.2!important;
    }
    .resume-page .skill-row b{
      font-size:calc(var(--v141-category-size,9.5) * 1pt)!important;
      color:var(--v141-category-color,#222222)!important;
      font-weight:var(--v141-category-weight,700)!important;
      font-style:var(--v141-category-style,normal)!important;
    }

    /* Full continuous white paper in preview */
    .pages-wrap{
      align-items:center!important;
      overflow:auto!important;
      padding:24px!important;
      background:#666b70!important;
    }
    body[data-theme="light"] .pages-wrap{background:#d4dae1!important}

    .resume-page{
      height:auto!important;
      min-height:11in!important;
      overflow:visible!important;
      flex:0 0 auto!important;
      position:relative!important;
      background:#fff!important;
    }

    /* Prevent page content looking like it spills onto viewer background */
    .resume-page::after{
      content:"";
      display:block;
      clear:both;
    }

    /* Better fit-page preview */
    .v141-fitbar{
      display:flex;
      align-items:center;
      gap:6px;
      margin-left:4px;
    }
    .v141-fitbar button{
      font-size:11px!important;
      padding:5px 8px!important;
      border:1px solid rgba(255,255,255,.2)!important;
      border-radius:4px!important;
      cursor:pointer!important;
    }
  `;
  document.head.appendChild(css);

  function applyStyles(){
    const page=$(".resume-page");
    if(!page)return;
    page.style.setProperty("--v141-category-size",d.skillCategorySize);
    page.style.setProperty("--v141-category-color",d.skillCategoryColor);
    page.style.setProperty("--v141-category-weight",d.skillCategoryBold?700:400);
    page.style.setProperty("--v141-category-style",d.skillCategoryItalic?"italic":"normal");
    page.style.setProperty("--v141-skill-text-size",d.skillTextSize);
    page.style.setProperty("--v141-skill-text-color",d.skillTextColor);
    page.style.setProperty("--v141-skill-gap",d.skillGroupGap);
  }

  const pages=$("#pagesWrap");
  if(pages){
    new MutationObserver(()=>setTimeout(applyStyles,0)).observe(pages,{childList:true,subtree:true});
  }
  applyStyles();

  /* ---------- Fit Page / Fit Width controls ---------- */
  const toolbar=$(".viewer-toolbar");
  if(toolbar && !$("#v141FitPage")){
    const group=document.createElement("span");
    group.className="v141-fitbar";
    group.innerHTML=`
      <button id="v141FitPage" type="button">Fit Page</button>
      <button id="v141FitWidth" type="button">Fit Width</button>
    `;
    const spacer=toolbar.querySelector(".toolbar-spacer");
    if(spacer) toolbar.insertBefore(group,spacer);
    else toolbar.appendChild(group);
  }

  function setZoomValue(z){
    if(typeof zoom!=="undefined"){
      zoom=Math.max(.25,Math.min(1.2,z));
      if(typeof renderResume==="function")renderResume();
      setTimeout(applyStyles,0);
    }
  }

  function fitPage(){
    const wrap=$("#pagesWrap"), page=$(".resume-page");
    if(!wrap||!page)return;
    const availableW=Math.max(260,wrap.clientWidth-48);
    const availableH=Math.max(320,wrap.clientHeight-48);
    const naturalW=816;   /* 8.5in at 96dpi */
    const naturalH=Math.max(1056,page.scrollHeight || 1056);
    setZoomValue(Math.min(availableW/naturalW,availableH/naturalH,.95));
  }

  function fitWidth(){
    const wrap=$("#pagesWrap");
    if(!wrap)return;
    const availableW=Math.max(260,wrap.clientWidth-48);
    setZoomValue(Math.min(availableW/816,.95));
  }

  $("#v141FitPage")?.addEventListener("click",fitPage);
  $("#v141FitWidth")?.addEventListener("click",fitWidth);

  /* Default to fitting the whole paper when entering Preview */
  setTimeout(fitPage,150);
  window.addEventListener("resize",()=>setTimeout(fitPage,100));

  /* Customizer opening should not hide the paper: refit after drawer opens/closes */
  $("#customizeBtn")?.addEventListener("click",()=>setTimeout(fitPage,100));
  $("#closeCustomize")?.addEventListener("click",()=>setTimeout(fitPage,100));

  /* ---------- PDF skills styling enhancement ---------- */
  /*
    Current v12 PDF generator writes skill categories and values together.
    This v14.1 addon preserves the current PDF generator but ensures the
    preview uses the separate category/body styling controls.
    The content remains ATS-selectable.
  */
})();
