const PLACEHOLDER_VALUES = new Set([
  'n/a',
  'na',
  'null',
  'undefined',
  'loading',
  'lorem ipsum',
  'tbd'
]);

const PROFANITY_RE = /\b(fuck|shit|bitch|asshole|bastard|dick|fucker|motherfucker)\b/i;

function cleanText(value) {
  if (typeof value !== 'string') return '';
  const text = value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return '';

  const lowered = text.toLowerCase();
  if (PLACEHOLDER_VALUES.has(lowered)) return '';
  if (PROFANITY_RE.test(lowered)) return '';

  return text;
}

function cleanStringArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(cleanText).filter(Boolean);
}

function cleanExperienceItem(item) {
  const exp = item && typeof item === 'object' ? item : {};
  return {
    title: cleanText(exp.title),
    company: cleanText(exp.company),
    location: cleanText(exp.location),
    start: cleanText(exp.start),
    end: cleanText(exp.end),
    current: !!exp.current,
    bullets: cleanStringArray(exp.bullets)
  };
}

function cleanEducationItem(item) {
  const edu = item && typeof item === 'object' ? item : {};
  return {
    degree: cleanText(edu.degree),
    institution: cleanText(edu.institution),
    year: cleanText(edu.year),
    gpa: cleanText(edu.gpa)
  };
}

function cleanCertificationItem(item) {
  const cert = item && typeof item === 'object' ? item : {};
  return {
    name: cleanText(cert.name),
    issuer: cleanText(cert.issuer),
    year: cleanText(cert.year)
  };
}

function cleanProjectItem(item) {
  const project = item && typeof item === 'object' ? item : {};
  return {
    name: cleanText(project.name),
    description: cleanText(project.description),
    link: cleanText(project.link),
    tech: cleanStringArray(project.tech)
  };
}

function cleanLanguageItem(item) {
  if (typeof item === 'string') {
    const value = cleanText(item);
    return value ? { language: value, proficiency: '' } : null;
  }

  const lang = item && typeof item === 'object' ? item : {};
  const language = cleanText(lang.language);
  if (!language) return null;

  return {
    language,
    proficiency: cleanText(lang.proficiency)
  };
}

function hasMeaningfulExperience(item) {
  return !!(item.title || item.company || item.location || item.start || item.end || item.bullets.length);
}

function hasMeaningfulEducation(item) {
  return !!(item.degree || item.institution || item.year || item.gpa);
}

function hasMeaningfulProject(item) {
  return !!(item.name || item.description || item.link || item.tech.length);
}

function hasMeaningfulCertification(item) {
  return !!(item.name || item.issuer || item.year);
}

export function sanitizeResumeData(data) {
  const src = data && typeof data === 'object' ? data : {};
  const personal = src.personal && typeof src.personal === 'object' ? src.personal : {};
  const skills = src.skills && typeof src.skills === 'object' ? src.skills : {};

  const experience = (Array.isArray(src.experience) ? src.experience : [])
    .map(cleanExperienceItem)
    .filter(hasMeaningfulExperience);

  const education = (Array.isArray(src.education) ? src.education : [])
    .map(cleanEducationItem)
    .filter(hasMeaningfulEducation);

  const projects = (Array.isArray(src.projects) ? src.projects : [])
    .map(cleanProjectItem)
    .filter(hasMeaningfulProject);

  const certifications = (Array.isArray(src.certifications) ? src.certifications : [])
    .map(cleanCertificationItem)
    .filter(hasMeaningfulCertification);

  const languages = (Array.isArray(src.languages) ? src.languages : [])
    .map(cleanLanguageItem)
    .filter(Boolean);

  return {
    personal: {
      name: cleanText(personal.name),
      email: cleanText(personal.email),
      phone: cleanText(personal.phone),
      location: cleanText(personal.location),
      linkedin: cleanText(personal.linkedin),
      portfolio: cleanText(personal.portfolio)
    },
    summary: cleanText(src.summary),
    experience,
    education,
    skills: {
      technical: cleanStringArray(skills.technical),
      soft: cleanStringArray(skills.soft),
      tools: cleanStringArray(skills.tools)
    },
    certifications,
    projects,
    achievements: cleanStringArray(src.achievements),
    languages,
    jobRole: cleanText(src.jobRole)
  };
}
