
/* === Direct PDF Download v8 === */
function safePdfName(){
  const raw=(state.profile.fullName||'resume').trim().replace(/[^a-z0-9]+/gi,'-').replace(/^-+|-+$/g,'');
  const company=(output?.company||'').trim().replace(/[^a-z0-9]+/gi,'-').replace(/^-+|-+$/g,'');
  return `${raw||'resume'}${company?'-'+company:''}-resume.pdf`;
}

function hexToRgbArray(hex){
  const h=String(hex||'#000000').replace('#','');
  const s=h.length===3?h.split('').map(x=>x+x).join(''):h.padEnd(6,'0').slice(0,6);
  return [parseInt(s.slice(0,2),16)||0,parseInt(s.slice(2,4),16)||0,parseInt(s.slice(4,6),16)||0];
}

function jsPdfFontName(name){
  const n=String(name||'Helvetica').toLowerCase();
  if(n.includes('times')) return 'times';
  if(n.includes('courier')) return 'courier';
  return 'helvetica';
}

function textWidth(doc,text,size,font='helvetica',style='normal'){
  doc.setFont(font,style);doc.setFontSize(size);
  return doc.getTextWidth(String(text||''));
}

async function downloadResumePdf(){
  const btns=[$('#downloadPdfBtn'),$('#viewerDownload')].filter(Boolean);
  const old=btns.map(b=>b.textContent);
  btns.forEach(b=>{b.disabled=true;b.textContent='Downloading…'});
  try{
    if(!window.jspdf?.jsPDF) throw new Error('PDF engine failed to load. Refresh the page and try again.');
    const {jsPDF}=window.jspdf;
    const doc=new jsPDF({orientation:'portrait',unit:'pt',format:'letter',compress:true,putOnlyUsedFonts:true});
    const m=resumeModel();
    const W=612,H=792;
    const margin=Math.max(18,Math.min(90,Number(d.pageMargin||.75)*72));
    const left=margin,right=W-margin,maxW=right-left;
    const font=jsPdfFontName(d.fontFamily);
    const bodySize=Math.max(8,Math.min(14,Number(d.fontSize||10)));
    const lineH=bodySize*Math.max(1.0,Math.min(1.8,Number(d.lineSpacing||1.2)));
    const gap=Math.max(4,Math.min(28,Number(d.sectionGap||12)));
    const bodyColor=hexToRgbArray(d.fontColor||'#333333');
    const secColor=hexToRgbArray(d.sectionTitleColor||'#3e702c');
    let y=margin;
    let pageNo=1;

    function setColor(rgb){doc.setTextColor(rgb[0],rgb[1],rgb[2])}
    function newPage(){
      doc.addPage(); pageNo++; y=margin;
    }
    function ensure(h){
      if(y+h>H-margin){newPage();return true}
      return false;
    }
    function writeLines(lines,x,width,size=bodySize,style='normal',rgb=bodyColor,opts={}){
      doc.setFont(font,style);doc.setFontSize(size);setColor(rgb);
      const arr=Array.isArray(lines)?lines:doc.splitTextToSize(String(lines||''),width);
      const lh=opts.lineHeight||size*1.22;
      for(const line of arr){
        if(y+lh>H-margin)newPage();
        doc.text(String(line),x,y,{align:opts.align||'left'});
        y+=lh;
      }
      return arr;
    }
    function sectionTitle(title){
      ensure(gap+18);
      y+=gap;
      const size=Math.max(8,Math.min(24,Number(d.sectionTitleSize||12)));
      doc.setFont(font,d.sectionTitleBold?'bold':'normal');
      doc.setFontSize(size);setColor(secColor);
      const txt=d.sectionTitleCaps?String(title).toUpperCase():String(title);
      const align=d.sectionTitleAlign==='center'?'center':'left';
      doc.text(txt,align==='center'?W/2:left,y,{align});
      y+=size*0.45;
      if(d.sectionTitleBorder){
        doc.setDrawColor(secColor[0],secColor[1],secColor[2]);
        doc.setLineWidth(.6);doc.line(left,y,right,y);
      }
      y+=size*.55;
    }
    function bullet(text){
      const bulletX=left+9, textX=left+18;
      const wrapped=doc.splitTextToSize(String(text||''),maxW-18);
      ensure(wrapped.length*lineH+3);
      doc.setFont(font,'normal');doc.setFontSize(bodySize);setColor(bodyColor);
      doc.text('•',bulletX,y);
      wrapped.forEach((line,i)=>{
        if(y+lineH>H-margin)newPage();
        doc.text(String(line),textX,y);
        y+=lineH;
      });
      y+=2;
    }

    // Header
    const nameColor=hexToRgbArray(d.nameColor||'#003800');
    const roleColor=hexToRgbArray(d.roleColor||'#000000');
    const contactColor=hexToRgbArray(d.contactColor||'#0f0f0f');
    const nameSize=Math.max(12,Math.min(40,Number(d.nameFontSize||24)));
    const roleSize=Math.max(10,Math.min(30,Number(d.roleFontSize||18)));
    const align=d.headerAlign==='left'?'left':'center';
    const ax=align==='left'?left:W/2;

    if(d.titlePosition==='next'){
      doc.setFont(font,d.nameBold?'bold':'normal');doc.setFontSize(nameSize);setColor(nameColor);
      doc.text(String(m.name||''),left,y);
      doc.setFont(font,d.roleBold?'bold':'normal');doc.setFontSize(roleSize);setColor(roleColor);
      doc.text(String(m.role||''),right,y,{align:'right'});
      y+=Math.max(nameSize,roleSize)*1.15;
    }else{
      doc.setFont(font,d.nameBold?'bold':'normal');doc.setFontSize(nameSize);setColor(nameColor);
      doc.text(String(m.name||''),ax,y,{align});
      y+=nameSize*1.12;
      doc.setFont(font,d.roleBold?'bold':'normal');doc.setFontSize(roleSize);setColor(roleColor);
      doc.text(String(m.role||''),ax,y,{align});
      y+=roleSize*1.15;
    }
    if(d.showContact && m.contact){
      doc.setFont(font,'normal');doc.setFontSize(Math.max(8,bodySize-1));setColor(contactColor);
      const cLines=doc.splitTextToSize(String(m.contact),maxW);
      cLines.forEach(line=>{doc.text(String(line),ax,y,{align});y+=Math.max(9,bodySize*1.05)});
    }

    const blocks=[];
    if(d.sections.summary) blocks.push(['Professional Summary',()=>{
      writeLines(doc.splitTextToSize(String(m.summary||''),maxW),left,maxW,bodySize,'normal',bodyColor,{lineHeight:lineH});
    }]);
    if(d.sections.skills&&Array.isArray(m.skills)&&m.skills.length) blocks.push(['Technical Skills',()=>{
      for(const g of m.skills){
        for(const [k,v] of Object.entries(g)){
          const val=Array.isArray(v)?v.join(', '):String(v||'');
          const label=`${k}: `;
          const labelW=textWidth(doc,label,bodySize,font,'bold');
          ensure(lineH*2);
          doc.setFont(font,'bold');doc.setFontSize(bodySize);setColor(bodyColor);doc.text(label,left,y);
          doc.setFont(font,'normal');
          const lines=doc.splitTextToSize(val,maxW-labelW);
          if(lines.length){
            doc.text(String(lines[0]),left+labelW,y); y+=lineH;
            for(let i=1;i<lines.length;i++){ensure(lineH);doc.text(String(lines[i]),left,y);y+=lineH}
          }else y+=lineH;
        }
      }
    }]);
    if(d.sections.experience&&Array.isArray(m.experience)) blocks.push(['Work Experience',()=>{
      m.experience.forEach((e,i)=>{
        const source=state.profile.work.find(w=>w.company===e.company)||state.profile.work[i]||{};
        const title=e.title||source.role||'',company=e.company||source.company||'',period=e.period||source.period||'',loc=e.location||source.location||'';
        const leftHead=d.experienceLayout==='role'?`${title}${company?' — '+company:''}`:`${company}${title?' — '+title:''}`;
        const rightHead=[period,loc].filter(Boolean).join(' | ');
        ensure(28);
        doc.setFont(font,'bold');doc.setFontSize(bodySize);setColor(bodyColor);
        const rw=textWidth(doc,rightHead,bodySize,font,'normal');
        const leftLines=doc.splitTextToSize(leftHead,Math.max(160,maxW-rw-18));
        doc.text(String(leftLines[0]||''),left,y);
        doc.setFont(font,'normal');doc.text(String(rightHead),right,y,{align:'right'});
        y+=lineH;
        if(leftLines.length>1){
          leftLines.slice(1).forEach(line=>{ensure(lineH);doc.text(String(line),left,y);y+=lineH});
        }
        const sents=Array.isArray(e.sentences)?e.sentences:[];
        sents.forEach(bullet);
        y+=3;
      });
    }]);
    if(d.sections.education&&Array.isArray(m.education)&&m.education.length) blocks.push(['Education',()=>{
      m.education.filter(e=>e.degree||e.degreeMajor||e.institution||e.school).forEach(e=>{
        const degree=e.degree||e.degreeMajor||'', inst=e.institution||e.school||'', per=e.period||e.dates||'';
        const l=[degree,inst].filter(Boolean).join(' — ');
        ensure(lineH*2);
        doc.setFont(font,'bold');doc.setFontSize(bodySize);setColor(bodyColor);
        doc.text(String(l),left,y);doc.setFont(font,'normal');doc.text(String(per),right,y,{align:'right'});y+=lineH;
      });
    }]);
    if(d.sections.certifications&&Array.isArray(m.certifications)&&m.certifications.length) blocks.push(['Certifications',()=>{
      m.certifications.filter(c=>c.certification||c.institution).forEach(c=>{
        const l=[c.certification,c.institution].filter(Boolean).join(' — ');
        ensure(lineH*2);
        doc.setFont(font,'bold');doc.setFontSize(bodySize);setColor(bodyColor);
        doc.text(String(l),left,y);doc.setFont(font,'normal');doc.text(String(c.date||''),right,y,{align:'right'});y+=lineH;
      });
    }]);

    if(d.boostEducation){
      const ei=blocks.findIndex(x=>x[0]==='Education'),si=blocks.findIndex(x=>x[0]==='Technical Skills');
      if(ei>-1&&si>-1){const [b]=blocks.splice(ei,1);blocks.splice(si,0,b)}
    }
    for(const [title,render] of blocks){sectionTitle(title);render()}

    // Metadata & download
    doc.setProperties({
      title:`${m.name||'Resume'} - ${m.role||'Resume'}`,
      subject:'Professional Resume',
      author:m.name||'',
      creator:'Resume Tailor'
    });
    doc.save(safePdfName());
    if($('#runStatus')) $('#runStatus').textContent='PDF downloaded.';
  }catch(e){
    if($('#runStatus')) $('#runStatus').textContent=e.message||'PDF download failed.';
    else alert(e.message||'PDF download failed.');
  }finally{
    btns.forEach((b,i)=>{b.disabled=false;b.textContent=old[i]});
  }
}

if($('#downloadPdfBtn')) $('#downloadPdfBtn').onclick=downloadResumePdf;
if($('#viewerDownload')) $('#viewerDownload').onclick=downloadResumePdf;
/* === End Direct PDF Download v8 === */
