import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8080);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-6-sol';
const MOCK_AI = process.env.MOCK_AI === '1';

const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store'
  });
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 2_000_000) throw new Error('Request is too large.');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

function cleanText(value, max = 200_000) {
  return String(value ?? '').trim().slice(0, max);
}

function sanitizeProfile(raw = {}) {
  const workExperiences = Array.isArray(raw.workExperiences) ? raw.workExperiences.slice(0, 15).map(x => ({
    company: cleanText(x?.company, 200), dates: cleanText(x?.dates, 120), title: cleanText(x?.title, 160),
    bulletPoints: Math.min(20, Math.max(1, Number(x?.bulletPoints) || 6))
  })) : [];
  const educations = Array.isArray(raw.educations) ? raw.educations.slice(0, 10).map(x => ({
    degreeMajor: cleanText(x?.degreeMajor, 250), school: cleanText(x?.school, 250), dates: cleanText(x?.dates, 120)
  })) : [];
  return {
    fullName: cleanText(raw.fullName, 200), jobTitle: cleanText(raw.jobTitle, 200), seniority: cleanText(raw.seniority, 100),
    preserveTitles: Boolean(raw.preserveTitles), workExperiences, educations
  };
}

function buildPrompt(profile, jobDescription, companyOverride = '') {
  const preserve = profile.preserveTitles;
  const work = profile.workExperiences.filter(e => e.company || e.dates).map(e =>
    `- ${e.company || 'Company'} , ${e.dates || 'Dates not specified'} , ${e.bulletPoints || 6} Bullet Points${preserve && e.title ? ` , Original Title: ${e.title}` : ''}`
  ).join('\n');
  const edu = profile.educations.filter(e => e.degreeMajor).map(e => `- ${e.degreeMajor}`).join('\n');
  const counts = profile.workExperiences.filter(e => e.company && e.bulletPoints).map(e => `- ${e.company}: exactly ${e.bulletPoints} sentences`).join('\n');
  const schema = preserve ? `{
  "company": "Company name from the job description",
  "summary": "",
  "skills": [{ "Category1": ["Skill1", "Skill2"] }],
  "experience": [{ "company": "", "sentences": ["Sentence 1"] }],
  "education": [{ "degree": "Degree and Major" }]
}` : `{
  "company": "Company name from the job description",
  "title": "",
  "summary": "",
  "skills": [{ "Category1": ["Skill1", "Skill2"] }],
  "experience": [{ "title": "", "company": "", "sentences": ["Sentence 1"] }],
  "education": [{ "degree": "Degree and Major" }]
}`;

  return `You are a resume generation engine.\nYour output MUST be exactly ONE valid JSON object and nothing else.\nDo NOT include explanations, comments, markdown fences, headers, or text outside the JSON.\nDo NOT ask questions.\n\n========================================\nCANDIDATE PROFILE\n========================================\n${preserve ? `Job Title: ${profile.jobTitle || 'Not specified'}` : `Seniority Level: ${profile.seniority || 'Not specified'}`}\nWork Experience:\n${work || '- No work experience provided'}\nEducation:\n${edu || '- No education provided'}\n\n========================================\nJOB DESCRIPTION HANDLING RULES\n========================================\nIf the job requires security clearance or requires on-site-only work, do not invent eligibility. Return valid JSON with an additional top-level field \"blockedReason\" explaining the issue, and leave summary, skills, experience, and education empty.\n\n========================================\nOUTPUT FORMAT\n========================================\nReturn ONE JSON object with the following structure:\n${schema}\n\n========================================\nCONTENT RULES\n========================================\nCOMPANY NAME\n- ${companyOverride ? `Use this company name: ${companyOverride}` : 'Use the company name from the job description.'}\n- If no company name is available, use \"Unknown\".\nSUMMARY\n- 3–4 concise, professional, ATS-optimized sentences directly aligned to the job description.\n${preserve ? '' : `JOB TITLES IN HEADER AND EACH COMPANY\n- 2–4 words.\n- Use common industry titles aligned with the target role and a logical career progression.\n`}SKILLS\n- 30–35 total skills, grouped into useful categories.\n- Include important technologies and competencies from the job description when supportable by the candidate profile.\n- Do not claim technologies that would be chronologically impossible for the listed experience periods.\nEDUCATION\n- Keep the supplied degree/major when relevant; only adapt the major when necessary to align with the role.\nEXPERIENCE – SENTENCE RULES (STRICT)\n- Do not use the candidate's name or third-person pronouns such as he/she.\n- Each sentence must be 150–250 characters, technically specific, achievement-oriented, ATS-friendly, and end with a period.\n- Avoid vague or generic statements.\n- No bullet symbols inside sentence strings.\n- Tailor responsibilities and technologies to the target role while keeping them plausible for each company and time period.\n- Do not invent certifications, employers, degrees, security clearances, or facts that materially change the candidate's background.\nSENTENCE COUNT PER COMPANY\n${counts || '- Use the configured sentence counts.'}\nEach sentence must be a separate string inside the sentences array.\n\n========================================\nFINAL VALIDATION\n========================================\nBefore responding, verify:\n- Important job-description keywords are represented naturally.\n- Sentence lengths and counts are satisfied.\n- The resume remains plausible and consistent with the supplied profile.\n- Output is valid JSON with no markdown fences.\n\n========================================\nJOB DESCRIPTION\n========================================\n${jobDescription}`;
}

function extractOutputText(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
  const texts = [];
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === 'output_text' && typeof content.text === 'string') texts.push(content.text);
    }
  }
  return texts.join('\n').trim();
}

function stripFences(text) {
  return String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}

function validateResume(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('AI response was not a JSON object.');
  if (obj.blockedReason) return obj;
  for (const key of ['skills', 'experience', 'education']) {
    if (!Array.isArray(obj[key])) throw new Error(`AI response is missing the ${key} array.`);
  }
  if (typeof obj.summary !== 'string') throw new Error('AI response is missing a summary.');
  return obj;
}

function mockResume(profile) {
  return {
    company: 'Example Company',
    title: profile.jobTitle || 'Senior Software Engineer',
    summary: 'Experienced software engineer delivering scalable cloud applications, APIs, and distributed systems. Strong background in production reliability, automation, and cross-functional delivery. Applies pragmatic engineering practices to improve performance, maintainability, and customer outcomes.',
    skills: [
      { 'Languages': ['JavaScript', 'TypeScript', 'Python', 'SQL'] },
      { 'Backend & APIs': ['Node.js', 'REST APIs', 'Microservices', 'Event-Driven Architecture'] },
      { 'Cloud & DevOps': ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'] },
      { 'Data & Reliability': ['PostgreSQL', 'Redis', 'Observability', 'Monitoring', 'Performance Tuning'] }
    ],
    experience: profile.workExperiences.map((e, i) => ({
      title: e.title || profile.jobTitle || 'Software Engineer', company: e.company || `Company ${i + 1}`,
      sentences: Array.from({ length: e.bulletPoints || 6 }, (_, n) => `Delivered production software improvements across backend services, APIs, cloud infrastructure, and automated delivery workflows, strengthening reliability, maintainability, and measurable engineering outcomes for business-critical systems ${n + 1}.`)
    })),
    education: profile.educations.map(e => ({ degree: e.degreeMajor || 'Degree' }))
  };
}

async function tailor(req, res) {
  let body;
  try { body = await readBody(req); } catch (e) { return sendJson(res, 400, { error: e.message || 'Invalid JSON request.' }); }
  const jobDescription = cleanText(body.jobDescription, 180_000);
  const companyOverride = cleanText(body.companyOverride, 200);
  const profile = sanitizeProfile(body.profile);
  if (jobDescription.length < 40) return sendJson(res, 400, { error: 'Paste a complete job description before tailoring.' });
  if (!profile.workExperiences.length) return sendJson(res, 400, { error: 'Add at least one work-experience entry in Profile.' });

  if (MOCK_AI) return sendJson(res, 200, { resume: mockResume(profile), model: 'mock', mock: true });
  if (!OPENAI_API_KEY) return sendJson(res, 503, { error: 'OPENAI_API_KEY is not configured on the server.' });

  const prompt = buildPrompt(profile, jobDescription, companyOverride);
  let apiResponse;
  try {
    apiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'authorization': `Bearer ${OPENAI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: OPENAI_MODEL, input: [{ role: 'user', content: prompt }], max_output_tokens: 12000 })
    });
  } catch (e) {
    return sendJson(res, 502, { error: `Could not reach the AI service: ${e.message}` });
  }

  const raw = await apiResponse.json().catch(() => ({}));
  if (!apiResponse.ok) {
    const message = raw?.error?.message || `AI service returned HTTP ${apiResponse.status}.`;
    return sendJson(res, apiResponse.status >= 500 ? 502 : 400, { error: message });
  }

  try {
    const text = stripFences(extractOutputText(raw));
    const resume = validateResume(JSON.parse(text));
    return sendJson(res, 200, { resume, model: raw.model || OPENAI_MODEL, usage: raw.usage || null });
  } catch (e) {
    return sendJson(res, 502, { error: `The AI returned an invalid resume format: ${e.message}` });
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  const target = path.resolve(__dirname, '.' + pathname);
  if (!target.startsWith(__dirname + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
  try {
    const info = await stat(target);
    const file = info.isDirectory() ? path.join(target, 'index.html') : target;
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url?.split('?')[0] === '/api/tailor') return tailor(req, res);
  if (req.method === 'GET') return serveStatic(req, res);
  res.writeHead(405, { allow: 'GET, POST' });
  res.end('Method not allowed');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Resume Tailor running at http://localhost:${PORT}`);
  console.log(`AI model: ${MOCK_AI ? 'mock' : OPENAI_MODEL}`);
});
