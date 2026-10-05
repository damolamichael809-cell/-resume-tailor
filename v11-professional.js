
(function(){
  const cleanLinkedIn = value => {
    if(!value) return '';
    return String(value).replace(/^https?:\/\/(www\.)?/i,'').replace(/\/$/,'');
  };
  const pdfSafe = text => String(text||'').replace(/\s+/g,' ').trim();

  async function professionalDownloadPdf(){
    const buttons=[document.querySelector('#downloadPdfBtn'),document.querySelector('#viewerDownload')].filter(Boolean);
    const original=buttons.map(b=>b.textContent);
    buttons.forEach(b=>{b.disabled=true;b.textContent='Downloading…';});
    try{
      if(!window.jspdf?.jsPDF) throw new Error('PDF engine did not load. Refresh the page and try again.');
      const {jsPDF}=window.jspdf;
      const doc=new jsPDF({unit:'pt',format:'letter',compress:true,putOnlyUsedFonts:true});
      const m=resumeModel();
      const p=state.profile;
      const W=612,H=792,left=48,right=564,width=516,bottom=42;
      const font='helvetica',bodySize=9.35,lineH=10.95,secSize=10.25,secGap=8.5;
      let y=43;
      const bodyColor=[42,42,42], sectionColor=rgb(d.sectionTitleColor||'#3e702c');
      const nameColor=rgb(d.nameColor||'#003800'), roleColor=rgb(d.roleColor||'#000000');
      const setColor=c=>doc.setTextColor(c[0],c[1],c[2]);
      const addPage=()=>{doc.addPage();y=43;};
      const ensure=h=>{if(y+h>H-bottom)addPage();};
      const wrap=(text,w)=>doc.splitTextToSize(pdfSafe(text),w);

      function sectionTitle(text){
        ensure(23);
        y+=secGap;
        doc.setFont(font,'bold');doc.setFontSize(secSize);setColor(sectionColor);
        const t=d.sectionTitleCaps!==false ? String(text).toUpperCase() : String(text);
        doc.text(t,left,y);
        y+=4;
        doc.setDrawColor(sectionColor[0],sectionColor[1],sectionColor[2]);
        doc.setLineWidth(.55);doc.line(left,y,right,y);
        y+=7;
      }

      function bodyLines(text){
        doc.setFont(font,'normal');doc.setFontSize(bodySize);setColor(bodyColor);
        for(const s of wrap(text,width)){ensure(lineH);doc.text(String(s),left,y);y+=lineH;}
      }

      function bullet(text){
        const arr=wrap(text,width-18);
        ensure(arr.length*lineH+3);
        doc.setFont(font,'normal');doc.setFontSize(bodySize);setColor(bodyColor);
        doc.text('•',left+4,y);
        for(const s of arr){doc.text(String(s),left+14,y);y+=lineH;}
        y+=1.2;
      }

      function drawHeader(){
        const center=W/2;
        doc.setFont(font,'bold');doc.setFontSize(21.5);setColor(nameColor);
        doc.text(pdfSafe(m.name),center,y,{align:'center'});y+=24;
        doc.setFont(font,'bold');doc.setFontSize(13.8);setColor(roleColor);
        doc.text(pdfSafe(m.role),center,y,{align:'center'});y+=17;

        const first=[p.email,p.phone,p.location].filter(Boolean).join('  |  ');
        const second=cleanLinkedIn(p.linkedin);
        doc.setFont(font,'normal');doc.setFontSize(8.1);doc.setTextColor(55,55,55);

        const firstLines=doc.splitTextToSize(first,width-18);
        for(const line of firstLines){doc.text(String(line),center,y,{align:'center'});y+=10;}
        if(second){
          const secondLines=doc.splitTextToSize(second,width-18);
          for(const line of secondLines){doc.text(String(line),center,y,{align:'center'});y+=10;}
        }
        y+=2;
      }

      drawHeader();

      if(d.sections.summary!==false && m.summary){
        sectionTitle('Professional Summary');
        bodyLines(m.summary);
      }

      if(d.sections.skills!==false && Array.isArray(m.skills) && m.skills.length){
        sectionTitle('Technical Skills');
        for(const group of m.skills){
          for(const [label,value] of Object.entries(group)){
            const val=Array.isArray(value)?value.join(', '):String(value||'');
            const prefix=`${label}: `;
            doc.setFont(font,'bold');doc.setFontSize(bodySize);
            const prefixW=doc.getTextWidth(prefix);
            const arr=doc.splitTextToSize(val,width-prefixW);
            ensure(Math.max(1,arr.length)*lineH);
            setColor(bodyColor);doc.text(prefix,left,y);doc.setFont(font,'normal');
            if(arr.length){
              doc.text(String(arr[0]),left+prefixW,y);y+=lineH;
              for(let i=1;i<arr.length;i++){ensure(lineH);doc.text(String(arr[i]),left,y);y+=lineH;}
            }
          }
        }
      }

      if(d.sections.experience!==false && Array.isArray(m.experience)){
        sectionTitle('Work Experience');
        m.experience.forEach((e,i)=>{
          const source=state.profile.work.find(w=>w.company===e.company)||state.profile.work[i]||{};
          const company=pdfSafe(e.company||source.company||'');
          const role=pdfSafe(e.title||source.role||'');
          const period=pdfSafe(e.period||source.period||'');
          const location=pdfSafe(e.location||source.location||'');
          const rightText=[period,location].filter(Boolean).join(' | ');
          const leftText=[company,role].filter(Boolean).join(' — ');
          const bullets=Array.isArray(e.sentences)?e.sentences:[];

          const firstBulletLines=bullets.length?wrap(bullets[0],width-18):[];
          ensure(lineH + firstBulletLines.length*lineH + 18);

          doc.setFont(font,'bold');doc.setFontSize(bodySize);setColor(bodyColor);
          const rightW=Math.min(180,doc.getTextWidth(rightText)+3);
          const leftW=Math.max(280,width-rightW-12);
          const lns=wrap(leftText,leftW);
          doc.text(String(lns[0]||''),left,y);

          doc.setFont(font,'normal');
          doc.text(rightText,right,y,{align:'right'});
          y+=lineH;

          if(lns.length>1){
            doc.setFont(font,'bold');
            for(let j=1;j<lns.length;j++){doc.text(String(lns[j]),left,y);y+=lineH;}
          }

          for(const b of bullets) bullet(b);
          y+=4;
        });
      }

      if(d.sections.education!==false && Array.isArray(m.education) && m.education.length){
        sectionTitle('Education');
        for(const e of m.education){
          if(!(e.degree||e.degreeMajor||e.institution||e.school)) continue;
          const leftText=[e.degree||e.degreeMajor||'',e.institution||e.school||''].filter(Boolean).join(' — ');
          const rightText=e.period||e.dates||'';
          ensure(lineH*2);
          doc.setFont(font,'bold');doc.setFontSize(bodySize);setColor(bodyColor);
          doc.text(pdfSafe(leftText),left,y);
          doc.setFont(font,'normal');doc.text(pdfSafe(rightText),right,y,{align:'right'});
          y+=lineH;
        }
      }

      if(d.sections.certifications!==false && Array.isArray(m.certifications) && m.certifications.length){
        sectionTitle('Certifications');
        for(const c of m.certifications){
          if(!(c.certification||c.institution)) continue;
          const leftText=[c.certification,c.institution].filter(Boolean).join(' — ');
          ensure(lineH*2);
          doc.setFont(font,'bold');doc.setFontSize(bodySize);setColor(bodyColor);
          doc.text(pdfSafe(leftText),left,y);
          doc.setFont(font,'normal');doc.text(pdfSafe(c.date||''),right,y,{align:'right'});
          y+=lineH;
        }
      }

      const n=(p.fullName||'resume').trim().replace(/[^a-z0-9]+/gi,'-').replace(/^-+|-+$/g,'');
      const c=(output?.company||'').trim().replace(/[^a-z0-9]+/gi,'-').replace(/^-+|-+$/g,'');
      doc.setProperties({title:`${m.name||'Resume'} - ${m.role||'Resume'}`,author:m.name||'',subject:'Professional Resume',creator:'Resume Tailor'});
      doc.save(`${n||'resume'}${c?'-'+c:''}-resume.pdf`);
    }catch(err){
      alert(err.message||'PDF download failed.');
    }finally{
      buttons.forEach((b,i)=>{b.disabled=false;b.textContent=original[i];});
    }
  }

  function polishPreview(){
    const page=document.querySelector('.resume-page');
    if(!page)return;
    const contact=page.querySelector('.contact-row');
    if(contact){
      const p=state.profile;
      contact.textContent=[p.email,p.phone,p.location,cleanLinkedIn(p.linkedin)].filter(Boolean).join(' | ');
    }
  }

  const target=document.querySelector('#pagesWrap');
  if(target){
    const observer=new MutationObserver(polishPreview);
    observer.observe(target,{childList:true,subtree:true});
  }
  polishPreview();

  const mainBtn=document.querySelector('#downloadPdfBtn');
  const viewerBtn=document.querySelector('#viewerDownload');
  if(mainBtn)mainBtn.onclick=professionalDownloadPdf;
  if(viewerBtn)viewerBtn.onclick=professionalDownloadPdf;
})();
