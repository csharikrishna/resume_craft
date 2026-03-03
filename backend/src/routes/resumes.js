const express = require('express');
const { randomUUID } = require('crypto');
const authMiddleware = require('../middleware/auth');
const {
  getById,
  createDoc,
  updateDoc,
  deleteDoc,
  findAllByField,
  findOneByField
} = require('../services/firestore');

const router = express.Router();

// All routes require auth
router.use(authMiddleware);

// Create resume
router.post('/', async (req, res) => {
  try {
    const { title, jobRole, resumeData, templateId } = req.body;
    const now = new Date().toISOString();
    const resume = await createDoc('resumes', {
      userId: req.user.id,
      title: title || 'Untitled Resume',
      jobRole: jobRole || '',
      resumeData: resumeData || {},
      templateId: templateId || 'ats-classic',
      atsScore: null,
      status: 'draft',
      versionNumber: 1,
      parentResumeId: null,
      isPublic: false,
      publicSlug: null,
      createdAt: now,
      updatedAt: now
    });
    res.status(201).json(resume);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create resume' });
  }
});

// List user's resumes
router.get('/', async (req, res) => {
  try {
    const resumes = await findAllByField('resumes', 'userId', req.user.id);
    resumes.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// Get single resume
router.get('/:id', async (req, res) => {
  try {
    const resume = await getById('resumes', req.params.id);
    if (!resume || resume.userId !== req.user.id) return res.status(404).json({ error: 'Resume not found' });

    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json(resume);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

// Update resume (auto-saves version)
router.put('/:id', async (req, res) => {
  try {
    const existing = await getById('resumes', req.params.id);
    if (!existing || existing.userId !== req.user.id) return res.status(404).json({ error: 'Resume not found' });

    if (!existing) return res.status(404).json({ error: 'Resume not found' });

    const { title, jobRole, resumeData, templateId, atsScore } = req.body;
    const nextVersion = (existing.versionNumber || 1) + 1;

    // Save version snapshot every 5 versions
    if ((existing.versionNumber || 1) % 5 === 0) {
      await createDoc('resumeVersions', {
        userId: req.user.id,
        resumeId: existing.id,
        data: existing.resumeData,
        version: existing.versionNumber || 1,
        createdAt: new Date().toISOString()
      });
    }

    const updated = await updateDoc('resumes', req.params.id, {
      title: title ?? existing.title,
      jobRole: jobRole ?? existing.jobRole,
      resumeData: resumeData ?? existing.resumeData,
      templateId: templateId ?? existing.templateId,
      atsScore: atsScore ?? existing.atsScore,
      versionNumber: nextVersion,
      updatedAt: new Date().toISOString()
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update resume' });
  }
});

// Delete resume
router.delete('/:id', async (req, res) => {
  try {
    const resume = await getById('resumes', req.params.id);
    if (!resume || resume.userId !== req.user.id) return res.status(404).json({ error: 'Resume not found' });

    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    await deleteDoc('resumes', req.params.id);
    res.json({ message: 'Resume deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

// Duplicate resume
router.post('/:id/duplicate', async (req, res) => {
  try {
    const original = await getById('resumes', req.params.id);
    if (!original || original.userId !== req.user.id) return res.status(404).json({ error: 'Resume not found' });

    if (!original) return res.status(404).json({ error: 'Resume not found' });

    const now = new Date().toISOString();
    const copy = await createDoc('resumes', {
      userId: req.user.id,
      title: `${original.title} (Copy)`,
      jobRole: original.jobRole,
      resumeData: original.resumeData,
      templateId: original.templateId,
      atsScore: null,
      status: 'draft',
      versionNumber: 1,
      parentResumeId: original.id,
      isPublic: false,
      publicSlug: null,
      createdAt: now,
      updatedAt: now
    });

    res.status(201).json(copy);
  } catch (err) {
    res.status(500).json({ error: 'Failed to duplicate resume' });
  }
});

// Get version history
router.get('/:id/versions', async (req, res) => {
  try {
    const resume = await getById('resumes', req.params.id);
    if (!resume || resume.userId !== req.user.id) return res.status(404).json({ error: 'Resume not found' });

    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    const versions = await findAllByField('resumeVersions', 'resumeId', req.params.id);
    versions.sort((a, b) => (b.version || 0) - (a.version || 0));
    res.json(versions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
});

// Generate public share link
router.post('/:id/share', async (req, res) => {
  try {
    const resume = await getById('resumes', req.params.id);
    if (!resume || resume.userId !== req.user.id) return res.status(404).json({ error: 'Resume not found' });

    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    const slug = randomUUID().split('-')[0];
    await updateDoc('resumes', req.params.id, {
      isPublic: true,
      publicSlug: slug,
      updatedAt: new Date().toISOString()
    });

    res.json({ shareUrl: `${process.env.FRONTEND_URL}/shared/${slug}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate share link' });
  }
});

// Get public resume by slug (no auth)
router.get('/public/:slug', async (req, res) => {
  try {
    const resume = await findOneByField('resumes', 'publicSlug', req.params.slug);
    if (!resume || !resume.isPublic) return res.status(404).json({ error: 'Resume not found' });

    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json(resume);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

module.exports = router;
