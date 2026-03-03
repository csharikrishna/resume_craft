const { HfInference } = require('@huggingface/inference');
const { createDoc } = require('./firestore');

const hf = new HfInference(process.env.HF_TOKEN);
// Llama 3.3 70B — excellent for extraction and reasoning
const MODEL = process.env.HF_MODEL || 'meta-llama/Llama-3.3-70B-Instruct';

async function callAI(systemPrompt, userContent, logData = {}, retries = 1) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await hf.chatCompletion({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt + '\n\nIMPORTANT: Respond with ONLY raw JSON. No markdown, no code blocks, no explanation. Start with { and end with }.' },
          { role: "user", content: userContent }
        ],
        max_tokens: 4000,
        temperature: 0.1,
      });

      const content = result.choices[0].message.content;

      // Log usage
      if (logData.userId) {
        try {
          const estimatedInputTokens = Math.ceil((systemPrompt.length + userContent.length) / 4);
          const estimatedOutputTokens = Math.ceil(content.length / 4);

          await createDoc('aiLogs', {
            userId: logData.userId,
            resumeId: logData.resumeId || null,
            actionType: logData.actionType || 'general',
            inputTokens: estimatedInputTokens,
            outputTokens: estimatedOutputTokens,
            costPaise: 0,
            createdAt: new Date().toISOString()
          });
        } catch (e) { /* non-fatal */ }
      }

      return content;
    } catch (err) {
      lastError = err;
      console.error(`AI call attempt ${attempt + 1} failed:`, err.message);
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  }

  throw lastError;
}

function extractJSON(text) {
  try {
    // Remove markdown code blocks
    let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Find JSON object if wrapped in text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    // Clean up any trailing commas or invalid escapes
    cleaned = cleaned.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

    return JSON.parse(cleaned);
  } catch (e) {
    console.error('JSON extraction failed:', e.message);
    console.error('Full response text:', text.substring(0, 500) + '...');
    throw new Error(`Invalid JSON response from AI: ${e.message}`);
  }
}

// ── A: Parse text → resume JSON ───────────────────────────────────────────────
async function parseTextToResume(rawText, userId) {
  const sys = `You are a senior HR analyst. Extract resume data from raw text and return ONLY valid JSON.

Use this exact structure:
{
  "personal": {"name": "", "email": "", "phone": "", "location": "", "linkedin": "", "portfolio": ""},
  "summary": "",
  "experience": [{"title": "", "company": "", "location": "", "start": "", "end": "", "current": false, "bullets": []}],
  "education": [{"degree": "", "institution": "", "year": "", "gpa": ""}],
  "skills": {"technical": [], "soft": [], "tools": []},
  "certifications": [{"name": "", "issuer": "", "year": ""}],
  "projects": [{"name": "", "description": "", "link": "", "tech": []}],
  "achievements": [],
  "languages": []
}

CRITICAL RULES:
1. Extract ONLY information present in the text
2. Do NOT invent or hallucinate data
3. If a field is missing, use empty string "" or empty array []
4. Return ONLY the JSON object — no markdown, no explanation`;

  try {
    const result = await callAI(sys, rawText, { userId, actionType: 'parse_text' });
    console.log('Raw AI response (first 300):', result.substring(0, 300));
    return extractJSON(result);
  } catch (err) {
    console.error('Parse error:', err.message);
    throw new Error(`Failed to parse resume from text: ${err.message}`);
  }
}

// ── B: Optimize for role — ONLY add missing skills, never rewrite content ─────
async function optimizeForRole(resumeData, jobRole, userId, resumeId) {
  const sys = `You are an expert ATS specialist. Your job is to enhance the resume for the specified job role.

CRITICAL RULES — READ CAREFULLY:
1. DO NOT rewrite, rephrase, or modify ANY existing text (summary, experience bullets, project descriptions, personal info, education, achievements, certifications)
2. ONLY add new relevant skills to the skills arrays (technical, tools, soft) that are missing but relevant for the target job role
3. DO NOT remove any existing skills
4. DO NOT change experience bullets, titles, company names, dates, or any other existing data
5. Return the COMPLETE resume data with the original content intact plus any new skills added
6. In "changes", list only the new skills you added
7. In "missingSkills", list skills the candidate should learn but doesn't have experience with
8. In "suggestions", give brief tips for improving the resume (but do NOT apply them)

Return JSON: {"resumeData":{...full resume with same content, only skills arrays may have additions...},"suggestions":[],"missingSkills":[],"changes":[]}`;

  const result = await callAI(sys,
    `Job Role: ${jobRole}\nResume:\n${JSON.stringify(resumeData, null, 2)}`,
    { userId, resumeId, actionType: 'optimize' }
  );
  return extractJSON(result);
}

// ── C: Match JD ───────────────────────────────────────────────────────────────
async function matchToJobDescription(resumeData, jobDescription, userId, resumeId) {
  const sys = `You are an ATS expert. Compare the resume to the job description.
Return JSON: {"matchScore":0-100,"matchedKeywords":[],"missingKeywords":[],"sectionsToStrengthen":[],"suggestions":[],"optimizedResume":{...full resume...}}`;

  const result = await callAI(sys,
    `Resume:\n${JSON.stringify(resumeData, null, 2)}\n\nJob Description:\n${jobDescription}`,
    { userId, resumeId, actionType: 'match_jd' }
  );
  return extractJSON(result);
}

// ── D: ATS Score ──────────────────────────────────────────────────────────────
async function calculateATSScore(resumeData, jobRole, userId, resumeId) {
  const sys = `You are an ATS system. Score this resume out of 100.
Return JSON: {"total":0-100,"breakdown":{"keywords":{"score":0,"max":30,"feedback":""},"headings":{"score":0,"max":20,"feedback":""},"formatting":{"score":0,"max":15,"feedback":""},"actionVerbs":{"score":0,"max":15,"feedback":""},"metrics":{"score":0,"max":10,"feedback":""},"contact":{"score":0,"max":10,"feedback":""}},"missingKeywords":[],"topIssues":[],"quickWins":[]}`;

  const result = await callAI(sys,
    `Job Role: ${jobRole || 'General'}\nResume:\n${JSON.stringify(resumeData, null, 2)}`,
    { userId, resumeId, actionType: 'ats_score' }
  );
  return extractJSON(result);
}

// ── E: Chat — stateless ──────────────────────────────────────────────────────
async function chatAssistant(message, resumeData, _ignored, userId, resumeId) {
  const sys = `You are an expert resume coach. The user has 3 free AI chats per day so be concise and impactful.
You can see their resume. When asked to make changes, return the updated field.
Return JSON: {"message":"your reply","action":"update|none","field":"summary|experience|skills|achievements|personal|education|projects|certifications|null","value":null,"resumeData":null}
If action is "update", set resumeData to the full updated resume object.`;

  const result = await callAI(sys,
    `Resume: ${JSON.stringify(resumeData)}\nUser: ${message}`,
    { userId, resumeId, actionType: 'chat' }
  );

  return extractJSON(result);
}

// ── F: Recruiter view ─────────────────────────────────────────────────────────
async function recruiterView(resumeData, userId, resumeId) {
  const sys = `Simulate a recruiter doing a 6-second resume scan.
Return JSON: {"firstImpression":"","eyePath":["1st","2nd","3rd","4th"],"greenFlags":[],"redFlags":[],"wouldInterview":true,"interviewProbability":0-100,"reason":"","improvementPriority":[],"standoutElements":[]}`;

  const result = await callAI(sys, JSON.stringify(resumeData, null, 2), { userId, resumeId, actionType: 'recruiter_view' });
  return extractJSON(result);
}

// ── G: Suggest templates ──────────────────────────────────────────────────────
async function suggestTemplates(resumeData, jobRole, userId) {
  const sys = `You are a resume design expert. Recommend templates from: ats-classic, modern-blue, minimalist, creative, executive, tech-focused, two-column, compact.
Return JSON: {"recommendations":[{"templateId":"","rank":1,"reason":"","score":0-100}]}`;

  const result = await callAI(sys,
    `Job: ${jobRole || 'General'}, Experience: ${resumeData.experience?.length || 0} jobs`,
    { userId, actionType: 'suggest_templates' }
  );
  return extractJSON(result);
}

// ── H: Cover letter (paid) ────────────────────────────────────────────────────
async function generateCoverLetter(resumeData, jobRole, jobDescription, userId, resumeId) {
  const sys = `Write a professional cover letter. Return JSON: {"coverLetter":"full text","subject":"email subject line"}`;
  const result = await callAI(sys,
    `Resume: ${JSON.stringify(resumeData)}\nJob Role: ${jobRole}\nJob Description: ${jobDescription || 'Not provided'}`,
    { userId, resumeId, actionType: 'cover_letter' }
  );
  return extractJSON(result);
}

module.exports = {
  parseTextToResume, optimizeForRole, matchToJobDescription,
  calculateATSScore, chatAssistant, recruiterView,
  suggestTemplates, generateCoverLetter
};
