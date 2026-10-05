
(function(){
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  if(typeof state==="undefined"||typeof d==="undefined")return;

  const defaults={headerStyle:"classic",headerGap:8,contactGap:7,contentTopGap:6,jobGap:8,bulletGap:2.5,skillGap:2,sectionRuleWidth:.6,contactFontSize:8.5};
  Object.entries(defaults).forEach(([k,v])=>{if(d[k]===undefined)d[k]=v;});

  if(!$("#v12-fonts")){
    const l=document.createElement("link");
    l.id="v12-fonts";l.rel="stylesheet";
    l.href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Lato:wght@400;700&family=Merriweather:wght@400;700&family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@400;600;700&family=Roboto:wght@400;500;700&family=Source+Sans+3:wght@400;500;600;700&display=swap";
    document.head.appendChild(l);
  }

  const fs=$("#fontFamily");
  if(fs){
    const fonts=["Helvetica Neue","Arial","Inter","Calibri","Aptos","Georgia","Times New Roman","Garamond","Source Sans 3","Roboto","Lato","Open Sans","IBM Plex Sans","Montserrat","Merriweather"];
    fs.innerHTML="";
    fonts.forEach(f=>{const o=document.createElement("option");o.value=f;o.textContent=f;fs.appendChild(o);});
    fs.value=d.fontFamily||"Helvetica Neue";
  }

  const details=[...document.querySelectorAll("#customizeDrawer details")];
  const byTitle=t=>details.find(x=>x.querySelector("summary")?.textContent.trim()===t);

  const h=byTitle("Header");
  if(h&&!$("#headerStyle")){
    const x=document.createElement("div");
    x.innerHTML=`
      <div class="subhead">Professional Header Styles</div>
      <label>Template<select id="headerStyle">
        <option value="classic">Classic Centered</option>
        <option value="executive">Executive Left</option>
        <option value="split">Split Name / Title</option>
        <option value="compact">Compact One-Line</option>
        <option value="minimal">Minimal Left</option>
        <option value="modern">Modern Centered</option>
      </select></label>
      <label>Header Bottom Space<div class="unit-row"><input id="headerGap" type="number" min="0" max="30" step="1"><span>pt</span></div></label>
      <label>Contact Font Size<div class="unit-row"><input id="contactFontSize" type="number" min="7" max="12" step=".25"><span>pt</span></div></label>
      <label>Contact Item Gap<div class="unit-row"><input id="contactGap" type="number" min="2" max="18" step="1"><span>pt</span></div></label>`;
    h.appendChild(x);
    [["headerStyle","headerStyle"],["headerGap","headerGap"],["contactFontSize","contactFontSize"],["contactGap","contactGap"]].forEach(([id,k])=>{
      const el=$("#"+id);el.value=d[k];el.oninput=()=>{d[k]=id==="headerStyle"?el.value:+el.value;save();};
    });
  }

  const p=byTitle("Page Layout");
  if(p&&!$("#contentTopGap")){
    const x=document.createElement("div");
    x.innerHTML=`
      <div class="subhead">Fine Spacing</div>
      <label>Header to Content<div class="unit-row"><input id="contentTopGap" type="number" min="0" max="30" step="1"><span>pt</span></div></label>
      <label>Skills Row Gap<div class="unit-row"><input id="skillGap" type="number" min="0" max="10" step=".5"><span>pt</span></div></label>
      <label>Section Rule Width<div class="unit-row"><input id="sectionRuleWidth" type="number" min="0" max="2" step=".1"><span>pt</span></div></label>`;
    p.appendChild(x);
    [["contentTopGap","contentTopGap"],["skillGap","skillGap"],["sectionRuleWidth","sectionRuleWidth"]].forEach(([id,k])=>{
      const el=$("#"+id);el.value=d[k];el.oninput=()=>{d[k]=+el.value;save();};
    });
  }

  const e=byTitle("Experience");
  if(e&&!$("#jobGap")){
    const x=document.createElement("div");
    x.innerHTML=`
      <div class="subhead">Experience Spacing</div>
      <label>Space Between Jobs<div class="unit-row"><input id="jobGap" type="number" min="2" max="24" step="1"><span>pt</span></div></label>
      <label>Space Between Bullets<div class="unit-row"><input id="bulletGap" type="number" min="0" max="8" step=".5"><span>pt</span></div></label>`;
    e.appendChild(x);
    [["jobGap","jobGap"],["bulletGap","bulletGap"]].forEach(([id,k])=>{
      const el=$("#"+id);el.value=d[k];el.oninput=()=>{d[k]=+el.value;save();};
    });
  }

  const css=document.createElement("style");
  css.textContent=`
  body{font-size:14px!important}.site-header{height:62px!important;padding:0 3vw!important}.brand{font-size:15px!important}
  .nav-btn,.theme-btn{font-size:13px!important;padding:8px 11px!important}.theme-btn{font-size:18px!important}
  .page{padding:24px 3vw!important}.page-title{font-size:28px!important}.hero-copy h1{font-size:48px!important}.hero-copy p{font-size:16px!important}
  .feature-card{padding:20px!important;min-height:145px!important}.feature-card h3{font-size:16px!important}.feature-card p{font-size:13px!important}
  .panel{padding:18px!important;margin-bottom:16px!important}.panel h2{font-size:16px!important;margin-bottom:14px!important}
  .panel label,.customize-drawer label{font-size:11px!important;margin-bottom:11px!important}
  .panel input,.panel select,.customize-drawer input,.customize-drawer select{padding:9px 10px!important;margin-top:6px!important;font-size:13px!important}
  .primary-btn,.secondary-btn,.tool-btn{padding:9px 14px!important;font-size:12px!important}.preview-topbar{height:52px!important}
  .viewer-toolbar{height:48px!important;font-size:12px!important}.ai-assistant{padding:12px!important}.ai-assistant h2{font-size:16px!important}
  .ai-card-title{padding:9px 10px!important;font-size:12px!important}.ai-card textarea{font-size:11px!important;min-height:165px!important}.json-area{min-height:210px!important}
  .customize-drawer{top:62px!important;width:390px!important;padding:13px!important}.customize-drawer details{padding:10px!important}.drawer-title h2{font-size:17px!important}
  footer{height:34px!important;font-size:10px!important}

  .resume-page{font-family:var(--resume-font,'Helvetica Neue',Arial,sans-serif)!important;font-size:var(--resume-size,10pt)!important;line-height:var(--line-spacing,1.2)!important;padding:var(--page-margin,.75in)!important}
  .resume-header{margin-bottom:calc(var(--header-gap,8)*1pt)!important}
  .contact-row{font-size:calc(var(--contact-size,8.5)*1pt)!important;display:flex!important;flex-wrap:wrap!important;justify-content:center!important;gap:3pt calc(var(--contact-gap,7)*1pt)!important;white-space:normal!important}
  .contact-row a{color:inherit!important;text-decoration:none!important}.contact-row a:hover{text-decoration:underline!important}
  .resume-section:first-of-type{margin-top:calc(var(--content-top-gap,6)*1pt)!important}
  .skill-row{margin-bottom:calc(var(--skill-gap,2)*1pt)!important}.job-block{margin-bottom:calc(var(--job-gap,8)*1pt)!important}.job-block li{margin-bottom:calc(var(--bullet-gap,2.5)*1pt)!important}
  .resume-section h3{border-bottom-width:calc(var(--section-rule-width,.6)*1pt)!important}

  .resume-header.header-classic{text-align:center!important}
  .resume-header.header-executive{text-align:left!important;border-bottom:1px solid #d7d7d7;padding-bottom:7pt!important}
  .resume-header.header-executive .contact-row,.resume-header.header-minimal .contact-row{justify-content:flex-start!important}
  .resume-header.header-split .header-main{display:flex!important;justify-content:space-between!important;align-items:flex-end!important;gap:20pt!important}
  .resume-header.header-split .resume-name{text-align:left!important}.resume-header.header-split .resume-role{text-align:right!important}
  .resume-header.header-compact .header-main{display:flex!important;justify-content:center!important;align-items:baseline!important;gap:10pt!important}
  .resume-header.header-minimal{text-align:left!important}.resume-header.header-minimal .resume-role{font-weight:500!important}
  .resume-header.header-modern{text-align:center!important;border-top:2px solid var(--section-title-color,#3e702c);padding-top:7pt!important}
  .resume-header.header-modern .resume-role{text-transform:uppercase!important;letter-spacing:.06em!important}
  @media(max-width:700px){.hero-copy h1{font-size:36px!important}.page{padding:18px 12px!important}.panel{padding:14px!important}}
  `;
  document.head.appendChild(css);

  const cleanUrl=u=>{if(!u)return"";u=String(u).trim();return /^https?:\/\//i.test(u)?u:"https://"+u;};
  const contactHTML=()=>{
    const p=state.profile,a=[];
    if(p.email)a.push(`<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>`);
    if(p.phone)a.push(`<a href="tel:${esc(String(p.phone).replace(/\s+/g,""))}">${esc(p.phone)}</a>`);
    if(p.location)a.push(`<span>${esc(p.location)}</span>`);
    if(p.linkedin)a.push(`<a href="${esc(cleanUrl(p.linkedin))}" target="_blank">LinkedIn</a>`);
    if(p.github)a.push(`<a href="${esc(cleanUrl(p.github))}" target="_blank">GitHub</a>`);
    if(p.website)a.push(`<a href="${esc(cleanUrl(p.website))}" target="_blank">Portfolio</a>`);
    return a.join('<span class="contact-sep">|</span>');
  };

  const originalRender=renderResume;
  window.renderResume=function(){
    originalRender();
    const page=$(".resume-page");if(!page)return;
    page.style.setProperty("--header-gap",d.headerGap);
    page.style.setProperty("--contact-size",d.contactFontSize);
    page.style.setProperty("--contact-gap",d.contactGap);
    page.style.setProperty("--content-top-gap",d.contentTopGap);
    page.style.setProperty("--job-gap",d.jobGap);
    page.style.setProperty("--bullet-gap",d.bulletGap);
    page.style.setProperty("--skill-gap",d.skillGap);
    page.style.setProperty("--section-rule-width",d.sectionRuleWidth);
    const header=page.querySelector(".resume-header");
    if(header){
      header.classList.add("header-"+(d.headerStyle||"classic"));
      const name=header.querySelector(".resume-name"),role=header.querySelector(".resume-role");
      if(name&&role&&!header.querySelector(".header-main")){
        const main=document.createElement("div");main.className="header-main";name.parentNode.insertBefore(main,name);main.append(name,role);
      }
      const c=header.querySelector(".contact-row");if(c)c.innerHTML=contactHTML();
    }
  };
  window.renderResume();

  /* Make PDF links clickable without changing the rest of your current PDF engine */
  const oldDownload=window.downloadResumePdf;
  if(typeof oldDownload==="function"){
    window.downloadResumePdf=oldDownload;
  }

  /* Override current download with a compact PDF engine that preserves links */
  async function v12pdf(){
    const buttons=[$("#downloadPdfBtn"),$("#viewerDownload")].filter(Boolean),labels=buttons.map(b=>b.textContent);
    buttons.forEach(b=>{b.disabled=true;b.textContent="Downloading…";});
    try{
      if(!window.jspdf?.jsPDF)throw new Error("PDF engine did not load. Refresh and try again.");
      const {jsPDF}=window.jspdf,doc=new jsPDF({unit:"pt",format:"letter",compress:true,putOnlyUsedFonts:true});
      const m=resumeModel(),p=state.profile,W=612,H=792,margin=Math.max(28,Math.min(80,(+d.pageMargin||.7)*72)),left=margin,right=W-margin,width=right-left,bottom=margin*.7;
      const pf=n=>/times|georgia|garamond|merriweather/i.test(n||"")?"times":"helvetica",font=pf(d.fontFamily),size=Math.max(8,Math.min(12,+d.fontSize||9.5)),line=size*Math.max(1.05,Math.min(1.55,+d.lineSpacing||1.18));
      const rgb=x=>{x=String(x||"#000").replace("#","");if(x.length===3)x=x.split("").map(c=>c+c).join("");return [parseInt(x.slice(0,2),16)||0,parseInt(x.slice(2,4),16)||0,parseInt(x.slice(4,6),16)||0];};
      const body=rgb(d.fontColor),sec=rgb(d.sectionTitleColor),nameC=rgb(d.nameColor),roleC=rgb(d.roleColor);let y=margin;
      const setc=c=>doc.setTextColor(...c),safe=s=>String(s||"").replace(/\s+/g," ").trim(),wrap=(t,w)=>doc.splitTextToSize(safe(t),w),newPage=()=>{doc.addPage();y=margin;},ensure=h=>{if(y+h>H-bottom)newPage();};

      const hs=d.headerStyle||"classic",ns=Math.max(14,Math.min(30,+d.nameFontSize||22)),rs=Math.max(10,Math.min(20,+d.roleFontSize||14)),center=W/2;
      if(hs==="split"){
        doc.setFont(font,d.nameBold?"bold":"normal");doc.setFontSize(ns);setc(nameC);doc.text(safe(m.name),left,y);
        doc.setFont(font,d.roleBold?"bold":"normal");doc.setFontSize(rs);setc(roleC);doc.text(safe(m.role),right,y,{align:"right"});y+=Math.max(ns,rs)*1.15;
      }else{
        const lefty=hs==="executive"||hs==="minimal",x=lefty?left:center,align=lefty?"left":"center";
        doc.setFont(font,d.nameBold?"bold":"normal");doc.setFontSize(ns);setc(nameC);doc.text(safe(m.name),x,y,{align});y+=ns*1.05;
        doc.setFont(font,hs==="minimal"?"normal":(d.roleBold?"bold":"normal"));doc.setFontSize(rs);setc(roleC);doc.text(hs==="modern"?safe(m.role).toUpperCase():safe(m.role),x,y,{align});y+=rs*1.05;
      }
      doc.setFont(font,"normal");doc.setFontSize(Math.max(7,Math.min(11,+d.contactFontSize||8.5)));doc.setTextColor(60,60,60);
      const items=[];
      if(p.email)items.push({t:safe(p.email),u:"mailto:"+p.email});
      if(p.phone)items.push({t:safe(p.phone),u:"tel:"+String(p.phone).replace(/\s+/g,"")});
      if(p.location)items.push({t:safe(p.location)});
      if(p.linkedin)items.push({t:"LinkedIn",u:cleanUrl(p.linkedin)});
      if(p.github)items.push({t:"GitHub",u:cleanUrl(p.github)});
      if(p.website)items.push({t:"Portfolio",u:cleanUrl(p.website)});
      const lefty=hs==="executive"||hs==="minimal",txt=items.map(i=>i.t).join(" | "),tw=doc.getTextWidth(txt);let cx=lefty?left:Math.max(left,(W-tw)/2);
      items.forEach((it,i)=>{it.u?doc.textWithLink(it.t,cx,y,{url:it.u}):doc.text(it.t,cx,y);cx+=doc.getTextWidth(it.t);if(i<items.length-1){doc.text(" | ",cx,y);cx+=doc.getTextWidth(" | ");}});
      y+=12+(+d.headerGap||8)+(+d.contentTopGap||0);

      function title(t){ensure(20);y+=Math.max(2,+d.sectionGap||10);const s=Math.max(8,Math.min(16,+d.sectionTitleSize||10.5));doc.setFont(font,d.sectionTitleBold?"bold":"normal");doc.setFontSize(s);setc(sec);doc.text(d.sectionTitleCaps?String(t).toUpperCase():String(t),left,y);y+=3.5;if(d.sectionTitleBorder){doc.setDrawColor(...sec);doc.setLineWidth(Math.max(.1,+d.sectionRuleWidth||.6));doc.line(left,y,right,y);}y+=s*.55;}
      function para(t){doc.setFont(font,"normal");doc.setFontSize(size);setc(body);for(const ln of wrap(t,width)){ensure(line);doc.text(String(ln),left,y);y+=line;}}
      function bullet(t){const a=wrap(t,width-18);ensure(a.length*line+3);doc.setFont(font,"normal");doc.setFontSize(size);setc(body);doc.text("•",left+4,y);a.forEach((ln,j)=>{doc.text(String(ln),left+14,y);y+=line+(j===a.length-1?(+d.bulletGap||0):0);});}

      if(d.sections.summary!==false&&m.summary){title("Professional Summary");para(m.summary);}
      if(d.sections.skills!==false&&Array.isArray(m.skills)&&m.skills.length){title("Technical Skills");for(const g of m.skills)for(const[k,v]of Object.entries(g)){para(`${k}: ${Array.isArray(v)?v.join(", "):v}`);y+=+d.skillGap||0;}}
      if(d.sections.experience!==false&&Array.isArray(m.experience)){title("Work Experience");m.experience.forEach((e,i)=>{const s=state.profile.work.find(w=>w.company===e.company)||state.profile.work[i]||{},l=[e.company||s.company,e.title||s.role].filter(Boolean).join(" — "),r=[e.period||s.period,e.location||s.location].filter(Boolean).join(" | ");ensure(line*2);doc.setFont(font,"bold");doc.setFontSize(size);setc(body);doc.text(safe(l),left,y);doc.setFont(font,"normal");doc.text(safe(r),right,y,{align:"right"});y+=line;(Array.isArray(e.sentences)?e.sentences:[]).forEach(bullet);y+=Math.max(2,+d.jobGap||8);});}
      if(d.sections.education!==false&&Array.isArray(m.education)&&m.education.length){title("Education");m.education.filter(e=>e.degree||e.institution||e.degreeMajor||e.school).forEach(e=>{const l=[e.degree||e.degreeMajor||"",e.institution||e.school||""].filter(Boolean).join(" — ");ensure(line);doc.setFont(font,"bold");doc.setFontSize(size);setc(body);doc.text(safe(l),left,y);doc.setFont(font,"normal");doc.text(safe(e.period||e.dates||""),right,y,{align:"right"});y+=line;});}
      if(d.sections.certifications!==false&&Array.isArray(m.certifications)&&m.certifications.length){title("Certifications");m.certifications.filter(c=>c.certification||c.institution).forEach(c=>{const l=[c.certification,c.institution].filter(Boolean).join(" — ");ensure(line);doc.setFont(font,"bold");doc.setFontSize(size);setc(body);doc.text(safe(l),left,y);doc.setFont(font,"normal");doc.text(safe(c.date||""),right,y,{align:"right"});y+=line;});}

      const n=(p.fullName||"resume").trim().replace(/[^a-z0-9]+/gi,"-").replace(/^-+|-+$/g,""),c=(output?.company||"").trim().replace(/[^a-z0-9]+/gi,"-").replace(/^-+|-+$/g,"");
      doc.save(`${n||"resume"}${c?"-"+c:""}-resume.pdf`);
    }catch(err){alert(err.message||"PDF download failed.");}
    finally{buttons.forEach((b,i)=>{b.disabled=false;b.textContent=labels[i];});}
  }
  if($("#downloadPdfBtn"))$("#downloadPdfBtn").onclick=v12pdf;
  if($("#viewerDownload"))$("#viewerDownload").onclick=v12pdf;
})();
