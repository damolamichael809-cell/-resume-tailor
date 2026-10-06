
/* Resume Tailor v14.2 — Technical Skills styling in Customize ONLY */
(function(){
  const $ = s => document.querySelector(s);

  if(typeof state === "undefined" || typeof d === "undefined") return;

  /* Permanently remove the old Technical Skills Editor from AI sidebar */
  function removeOldSkillEditor(){
    const old = document.querySelector("#v14SkillsEditor");
    if(old) old.remove();

    document.querySelectorAll(".ai-card").forEach(card=>{
      const title = card.querySelector(".ai-card-title");
      if(title && /Technical Skills Editor/i.test(title.textContent || "")){
        card.remove();
      }
    });
  }

  removeOldSkillEditor();

  /* Keep it removed even if older scripts try to recreate it */
  const ai = document.querySelector(".ai-assistant");
  if(ai){
    new MutationObserver(removeOldSkillEditor).observe(ai,{childList:true,subtree:true});
  }

  const defaults = {
    skillCategorySize: 9.5,
    skillCategoryColor: "#222222",
    skillCategoryBold: true,
    skillCategoryItalic: false,
    skillTextSize: 9.5,
    skillTextColor: "#333333",
    skillGroupGap: 2.5
  };
  Object.entries(defaults).forEach(([k,v])=>{
    if(d[k] === undefined) d[k] = v;
  });

  /* Add styling controls in Customize drawer only */
  const drawer = $("#customizeDrawer");
  if(drawer && !$("#v142SkillStylePanel")){
    const panel = document.createElement("details");
    panel.id = "v142SkillStylePanel";
    panel.open = true;
    panel.innerHTML = `
      <summary>Technical Skills</summary>

      <div class="subhead">Category / Subheader</div>

      <label>Font Size
        <div class="unit-row">
          <input id="v142CategorySize" type="number" min="7" max="14" step=".25">
          <span>pt</span>
        </div>
      </label>

      <label>Font Color
        <div class="color-row">
          <input id="v142CategoryColorText">
          <input id="v142CategoryColor" type="color">
        </div>
      </label>

      <label class="switch-line">
        Bold
        <input id="v142CategoryBold" type="checkbox">
      </label>

      <label class="switch-line">
        Italic
        <input id="v142CategoryItalic" type="checkbox">
      </label>

      <div class="subhead">Skills Text</div>

      <label>Font Size
        <div class="unit-row">
          <input id="v142SkillTextSize" type="number" min="7" max="14" step=".25">
          <span>pt</span>
        </div>
      </label>

      <label>Font Color
        <div class="color-row">
          <input id="v142SkillTextColorText">
          <input id="v142SkillTextColor" type="color">
        </div>
      </label>

      <label>Space Between Skill Groups
        <div class="unit-row">
          <input id="v142SkillGroupGap" type="number" min="0" max="10" step=".5">
          <span>pt</span>
        </div>
      </label>
    `;

    const all = [...drawer.querySelectorAll("details")];
    const experience = all.find(x => x.querySelector("summary")?.textContent.trim() === "Experience");

    if(experience) drawer.insertBefore(panel, experience);
    else drawer.appendChild(panel);
  }

  function applySkillStyles(){
    const page = document.querySelector(".resume-page");
    if(!page) return;

    page.style.setProperty("--v142-cat-size", d.skillCategorySize);
    page.style.setProperty("--v142-cat-color", d.skillCategoryColor);
    page.style.setProperty("--v142-cat-weight", d.skillCategoryBold ? 700 : 400);
    page.style.setProperty("--v142-cat-style", d.skillCategoryItalic ? "italic" : "normal");
    page.style.setProperty("--v142-text-size", d.skillTextSize);
    page.style.setProperty("--v142-text-color", d.skillTextColor);
    page.style.setProperty("--v142-group-gap", d.skillGroupGap);
  }

  function bindNum(id,key){
    const el = $("#"+id);
    if(!el) return;
    el.value = d[key];
    el.oninput = ()=>{
      d[key] = +el.value;
      save();
      applySkillStyles();
    };
  }

  function bindCheck(id,key){
    const el = $("#"+id);
    if(!el) return;
    el.checked = !!d[key];
    el.onchange = ()=>{
      d[key] = el.checked;
      save();
      applySkillStyles();
    };
  }

  function bindColor(textId,colorId,key){
    const t = $("#"+textId);
    const c = $("#"+colorId);
    if(!t || !c) return;

    t.value = d[key];
    c.value = d[key];

    t.oninput = ()=>{
      d[key] = t.value;
      try{ c.value = d[key]; }catch{}
      save();
      applySkillStyles();
    };

    c.oninput = ()=>{
      d[key] = c.value;
      t.value = d[key];
      save();
      applySkillStyles();
    };
  }

  bindNum("v142CategorySize","skillCategorySize");
  bindColor("v142CategoryColorText","v142CategoryColor","skillCategoryColor");
  bindCheck("v142CategoryBold","skillCategoryBold");
  bindCheck("v142CategoryItalic","skillCategoryItalic");
  bindNum("v142SkillTextSize","skillTextSize");
  bindColor("v142SkillTextColorText","v142SkillTextColor","skillTextColor");
  bindNum("v142SkillGroupGap","skillGroupGap");

  const style = document.createElement("style");
  style.id = "v142-style";
  style.textContent = `
    .resume-page .skill-row{
      font-size:calc(var(--v142-text-size,9.5) * 1pt)!important;
      color:var(--v142-text-color,#333333)!important;
      margin-bottom:calc(var(--v142-group-gap,2.5) * 1pt)!important;
      line-height:1.2!important;
    }

    .resume-page .skill-row b{
      font-size:calc(var(--v142-cat-size,9.5) * 1pt)!important;
      color:var(--v142-cat-color,#222222)!important;
      font-weight:var(--v142-cat-weight,700)!important;
      font-style:var(--v142-cat-style,normal)!important;
    }

    /* Hide any old sidebar skill editor defensively */
    #v14SkillsEditor{display:none!important;}
  `;
  document.head.appendChild(style);

  const wrap = $("#pagesWrap");
  if(wrap){
    new MutationObserver(()=>setTimeout(applySkillStyles,0))
      .observe(wrap,{childList:true,subtree:true});
  }

  applySkillStyles();
})();
