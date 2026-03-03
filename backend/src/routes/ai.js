const express  = require('express');
const multer   = require('multer');
const pdfParse = require('pdf-parse');
const mammoth  = require('mammoth');
const authMiddleware = require('../middleware/auth');
const { aiRateLimit } = require('../middleware/rateLimit');
const aiService = require('../services/openai');
const { updateDoc, findAllByField } = require('../services/firestore');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(authMiddleware);
router.use(aiRateLimit);

// ─── Chat limit: 3 free chats per day, resets at midnight ────────────────────
async function checkChatLimit(user) {
  const now   = new Date();
  const reset = new Date(user.lastAiReset || now.toISOString());

  // Reset if it's a new calendar day
  const sameDay =
    reset.getFullYear() === now.getFullYear() &&
    reset.getMonth()    === now.getMonth()    &&
    reset.getDate()     === now.getDate();

  if (!sameDay) {
    // New day → reset to 3
    await updateDoc('users', user.id, { aiMessages: 3, lastAiReset: now.toISOString(), updatedAt: now.toISOString() });
    return { allowed: true, remaining: 2 };   // used 1, 2 left
  }

  if (user.aiMessages <= 0) {
    return { allowed: false, remaining: 0 };
  }

  const nextCount = Math.max((user.aiMessages || 0) - 1, 0);
  await updateDoc('users', user.id, { aiMessages: nextCount, updatedAt: now.toISOString() });

  return { allowed: true, remaining: nextCount };
}

// ── Parse text ────────────────────────────────────────────────────────────────
router.post('/parse-text', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length < 10)
      return res.status(400).json({ error: 'Please provide more text' });

    const resumeData = await aiService.parseTextToResume(text, req.user.id);
    res.json({ resumeData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to parse text' });
  }
});

// ── Upload file → parse ───────────────────────────────────────────────────────
router.post('/parse-upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    let text = '';
    const { mimetype, originalname } = req.file;

    console.log(`Processing file: ${originalname}, MIME: ${mimetype}`);

    if (mimetype === 'application/pdf') {
      try {
        const data = await pdfParse(req.file.buffer);
        text = data.text;
      } catch (pdfErr) {
        console.error('PDF parse error:', pdfErr.message);
        return res.status(400).json({ error: 'Failed to read PDF. Make sure it\'s a valid PDF file.' });
      }
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword'
    ) {
      try {
        const r = await mammoth.extractRawText({ buffer: req.file.buffer });
        text = r.value;
      } catch (docErr) {
        console.error('DOCX parse error:', docErr.message);
        return res.status(400).json({ error: 'Failed to read Word document. Try exporting as PDF.' });
      }
    } else {
      return res.status(400).json({ error: 'Only PDF or DOCX files are supported. Make sure you\'re uploading a resume file.' });
    }

    if (!text || text.trim().length < 30) {
      return res.status(400).json({ error: 'File appears to be empty or unreadable. Please try another file.' });
    }

    console.log(`Extracted ${text.length} characters from file`);

    try {
      const resumeData = await aiService.parseTextToResume(text, req.user.id);
      res.json({ resumeData });
    } catch (parseErr) {
      console.error('Resume parse error:', parseErr.message);
      return res.status(400).json({ error: 'AI could not parse the resume. Try pasting the text manually instead.' });
    }
  } catch (err) {
    console.error('Upload handler error:', err);
    res.status(500).json({ error: 'Server error processing file. Please try again.' });
  }
});

// ── Optimize ──────────────────────────────────────────────────────────────────
router.post('/optimize', async (req, res) => {
  try {
    const { resumeData, jobRole, resumeId } = req.body;
    if (!resumeData || !jobRole)
      return res.status(400).json({ error: 'Resume data and job role required' });

    const result = await aiService.optimizeForRole(resumeData, jobRole, req.user.id, resumeId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to optimize resume' });
  }
});

// ── Match JD ─────────────────────────────────────────────────────────────────
router.post('/match-jd', async (req, res) => {
  try {
    const { resumeData, jobDescription, resumeId } = req.body;
    if (!resumeData || !jobDescription)
      return res.status(400).json({ error: 'Resume data and job description required' });

    const result = await aiService.matchToJobDescription(resumeData, jobDescription, req.user.id, resumeId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to match job description' });
  }
});

// ── ATS Score ─────────────────────────────────────────────────────────────────
router.post('/ats-score', async (req, res) => {
  try {
    const { resumeData, jobRole, resumeId } = req.body;
    if (!resumeData) return res.status(400).json({ error: 'Resume data required' });

    const result = await aiService.calculateATSScore(resumeData, jobRole, req.user.id, resumeId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to calculate ATS score' });
  }
});

// ── Chat — 3 per day, NO history stored ──────────────────────────────────────
router.post('/chat', async (req, res) => {
  try {
    const { message, resumeData, resumeId } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const limit = await checkChatLimit(req.user);
    if (!limit.allowed) {
      return res.status(429).json({
        error: 'You have used all 3 free AI chats for today. Resets at midnight.',
        remaining: 0
      });
    }

    // No conversationHistory — each chat is stateless to save tokens
    const result = await aiService.chatAssistant(
      message, resumeData || {}, [], req.user.id, resumeId
    );

    res.json({ ...result, remaining: limit.remaining });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chat failed' });
  }
});

// ── Recruiter view ────────────────────────────────────────────────────────────
router.post('/recruiter-view', async (req, res) => {
  try {
    const { resumeData, resumeId } = req.body;
    if (!resumeData) return res.status(400).json({ error: 'Resume data required' });

    const result = await aiService.recruiterView(resumeData, req.user.id, resumeId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate recruiter view' });
  }
});

// ── Suggest templates ─────────────────────────────────────────────────────────
router.post('/suggest-templates', async (req, res) => {
  try {
    const { resumeData, jobRole } = req.body;
    const result = await aiService.suggestTemplates(resumeData || {}, jobRole, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to suggest templates' });
  }
});

// ── Cover letter (paid) ───────────────────────────────────────────────────────
router.post('/cover-letter', async (req, res) => {
  try {
    const { resumeData, jobRole, jobDescription, resumeId } = req.body;

    const userPayments = await findAllByField('payments', 'userId', req.user.id);
    const payment = userPayments.find(
      p => p.resumeId === resumeId && p.actionType === 'cover_letter' && p.status === 'success'
    );
    if (!payment) {
      return res.status(402).json({ error: 'Payment required for cover letter', requiresPayment: true });
    }

    const result = await aiService.generateCoverLetter(resumeData, jobRole, jobDescription, req.user.id, resumeId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate cover letter' });
  }
});

module.exports = router;
