import { useMemo } from 'react';
import { sanitizeResumeData } from '../utils/resumeSanitizer';

// ── Shared helpers ──────────────────────────────────────────────────────────
function ContactLine({ parts, style }) {
  if (!parts || parts.filter(Boolean).length === 0) return null;
  return <p style={style}>{parts.filter(Boolean).join('  |  ')}</p>;
}

function SectionTitle({ children, style }) {
  return <div style={style}>{children}</div>;
}

function ExperienceBlock({ exp, titleStyle, bodyStyle, dateColor }) {
  return (
    <div className="experience-block" style={{ marginBottom: '10px', pageBreakInside: 'avoid' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={titleStyle}>{exp.title}</span>
          {exp.company && <span style={{ fontStyle: 'italic', ...bodyStyle }}> — {exp.company}</span>}
          {exp.location && <span style={{ fontSize: '10px', color: dateColor }}>, {exp.location}</span>}
        </div>
        <span style={{ fontSize: '10px', color: dateColor, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {exp.start}{exp.end ? ` – ${exp.end}` : exp.current ? ' – Present' : ''}
        </span>
      </div>
      {exp.bullets?.length > 0 && (
        <ul style={{ paddingLeft: '16px', marginTop: '4px', pageBreakInside: 'avoid' }}>
          {exp.bullets.filter(Boolean).map((b, j) => (
            <li key={j} style={{ ...bodyStyle, marginBottom: '2px' }}>{b}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EducationBlock({ edu, bodyStyle, dateColor }) {
  return (
    <div className="education-block" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', pageBreakInside: 'avoid' }}>
      <div>
        <strong style={{ fontSize: '11px' }}>{edu.degree}</strong>
        {edu.institution && <span style={bodyStyle}> — {edu.institution}</span>}
        {edu.gpa && <span style={{ fontSize: '10px', color: dateColor }}> | GPA: {edu.gpa}</span>}
      </div>
      <span style={{ fontSize: '10px', color: dateColor }}>{edu.year}</span>
    </div>
  );
}

function ProjectBlock({ proj, bodyStyle, linkColor, dateColor }) {
  return (
    <div className="project-block" style={{ marginBottom: '8px', pageBreakInside: 'avoid' }}>
      <strong style={{ fontSize: '11px' }}>{proj.name}</strong>
      {proj.tech?.length > 0 && <span style={{ fontSize: '10px', color: dateColor }}> | {proj.tech.join(', ')}</span>}
      {proj.description && <p style={{ ...bodyStyle, marginTop: '2px' }}>{proj.description}</p>}
      {proj.link && <p style={{ fontSize: '9px', color: linkColor, marginTop: '1px' }}>{proj.link}</p>}
    </div>
  );
}

function SkillTags({ skills, tagStyle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
      {skills.map((skill, i) => <span key={i} style={tagStyle}>{skill}</span>)}
    </div>
  );
}

function SkillsInline({ skills, style, separator = ' · ' }) {
  return <p style={style}>{skills.join(separator)}</p>;
}

function CertBlock({ cert, bodyStyle }) {
  return (
    <div style={{ ...bodyStyle, marginBottom: '3px' }}>
      <strong>{cert.name}</strong>{cert.issuer ? ` — ${cert.issuer}` : ''}{cert.year ? `, ${cert.year}` : ''}
    </div>
  );
}

function LanguageTags({ languages, tagStyle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {languages.map((lang, i) => (
        <span key={i} style={tagStyle}>
          {typeof lang === 'string' ? lang : `${lang.language}${lang.proficiency ? ` (${lang.proficiency})` : ''}`}
        </span>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE: ATS Classic — Clean single-column, maximum ATS compatibility
// ══════════════════════════════════════════════════════════════════════════════
function ATSClassicTemplate({ d, personal, contactParts, linkParts, allSkills }) {
  const body = { fontSize: '10px', color: '#333', lineHeight: '1.35' };
  const st = { fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid #999', paddingBottom: '2px', marginBottom: '6px', color: '#222' };
  const jt = { fontWeight: 'bold', fontSize: '10.5px', color: '#111' };
  const tag = { background: '#f3f4f6', padding: '1px 6px', borderRadius: '3px', fontSize: '9px', color: '#374151', border: '1px solid #e5e7eb' };
  const section = { marginBottom: '10px', pageBreakInside: 'avoid' };

  return (
    <div style={{ padding: '24px 28px', fontFamily: 'Arial, Helvetica, sans-serif', color: '#333', lineHeight: '1.35' }}>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #1f2937', paddingBottom: '10px', marginBottom: '12px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111', letterSpacing: '0.5px', margin: 0 }}>{personal.name || 'Your Name'}</h1>
        <ContactLine parts={contactParts} style={{ fontSize: '9.5px', color: '#555', marginTop: '4px' }} />
        <ContactLine parts={linkParts} style={{ fontSize: '9.5px', color: '#555', marginTop: '2px' }} />
      </div>

      {d.summary && <div style={section}><SectionTitle style={st}>Professional Summary</SectionTitle><p style={{ ...body, lineHeight: '1.5' }}>{d.summary}</p></div>}
      {d.experience?.length > 0 && <div style={section}><SectionTitle style={st}>Work Experience</SectionTitle>{d.experience.map((exp, i) => <ExperienceBlock key={i} exp={exp} titleStyle={jt} bodyStyle={body} dateColor="#666" />)}</div>}
      {d.education?.length > 0 && <div style={section}><SectionTitle style={st}>Education</SectionTitle>{d.education.map((edu, i) => <EducationBlock key={i} edu={edu} bodyStyle={body} dateColor="#666" />)}</div>}
      {allSkills.length > 0 && <div style={section}><SectionTitle style={st}>Skills</SectionTitle><SkillTags skills={allSkills} tagStyle={tag} /></div>}
      {d.projects?.length > 0 && <div style={section}><SectionTitle style={st}>Projects</SectionTitle>{d.projects.map((p, i) => <ProjectBlock key={i} proj={p} bodyStyle={body} linkColor="#2563eb" dateColor="#555" />)}</div>}
      {d.achievements?.length > 0 && <div style={section}><SectionTitle style={st}>Achievements</SectionTitle><ul style={{ paddingLeft: '16px' }}>{d.achievements.filter(Boolean).map((a, i) => <li key={i} style={{ ...body, marginBottom: '2px' }}>{a}</li>)}</ul></div>}
      {d.certifications?.length > 0 && <div style={section}><SectionTitle style={st}>Certifications</SectionTitle>{d.certifications.map((c, i) => <CertBlock key={i} cert={c} bodyStyle={body} />)}</div>}
      {d.languages?.length > 0 && <div style={section}><SectionTitle style={st}>Languages</SectionTitle><LanguageTags languages={d.languages} tagStyle={tag} /></div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE: Modern Blue — Left sidebar for contact/skills, main content right
// ══════════════════════════════════════════════════════════════════════════════
function ModernBlueTemplate({ d, personal, contactParts, linkParts, allSkills }) {
  const body = { fontSize: '10.5px', color: '#1e293b' };
  const st = { fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#2563eb', borderBottom: '2px solid #bfdbfe', paddingBottom: '4px', marginBottom: '8px' };
  const stSidebar = { ...st, color: '#ffffff', borderBottom: '2px solid rgba(255,255,255,0.3)' };
  const jt = { fontWeight: '600', fontSize: '11px', color: '#1e40af' };
  const tag = { background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '12px', fontSize: '9px', color: '#ffffff', display: 'inline-block', marginBottom: '4px', marginRight: '4px' };

  return (
    <div style={{ display: 'flex', fontFamily: "'Segoe UI', Roboto, sans-serif", lineHeight: '1.5', minHeight: '100%' }}>
      {/* Left sidebar */}
      <div style={{ width: '35%', background: 'linear-gradient(180deg, #1e40af, #2563eb)', color: '#ffffff', padding: '24px 16px', flexShrink: 0 }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '4px', lineHeight: '1.2' }}>{personal.name || 'Your Name'}</h1>
        <div style={{ fontSize: '9px', color: '#bfdbfe', marginBottom: '20px', lineHeight: '1.6' }}>
          {personal.email && <div>✉ {personal.email}</div>}
          {personal.phone && <div>☎ {personal.phone}</div>}
          {personal.location && <div>📍 {personal.location}</div>}
          {personal.linkedin && <div style={{ wordBreak: 'break-all' }}>🔗 {personal.linkedin}</div>}
          {personal.portfolio && <div style={{ wordBreak: 'break-all' }}>🌐 {personal.portfolio}</div>}
        </div>

        {allSkills.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <SectionTitle style={stSidebar}>Skills</SectionTitle>
            <div>{allSkills.map((s, i) => <span key={i} style={tag}>{s}</span>)}</div>
          </div>
        )}

        {d.certifications?.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <SectionTitle style={stSidebar}>Certifications</SectionTitle>
            {d.certifications.map((c, i) => (
              <div key={i} style={{ fontSize: '9px', color: '#dbeafe', marginBottom: '4px' }}>
                <strong style={{ color: '#fff' }}>{c.name}</strong>
                {c.issuer && <div>{c.issuer}</div>}
              </div>
            ))}
          </div>
        )}

        {d.languages?.length > 0 && (
          <div>
            <SectionTitle style={stSidebar}>Languages</SectionTitle>
            {d.languages.map((lang, i) => (
              <div key={i} style={{ fontSize: '9px', color: '#dbeafe', marginBottom: '3px' }}>
                {typeof lang === 'string' ? lang : `${lang.language} — ${lang.proficiency || ''}`}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right main content */}
      <div style={{ flex: 1, padding: '24px 20px', color: '#1e293b' }}>
        {d.summary && <div style={{ marginBottom: '16px' }}><SectionTitle style={st}>Professional Summary</SectionTitle><p style={{ ...body, lineHeight: '1.6' }}>{d.summary}</p></div>}
        {d.experience?.length > 0 && <div style={{ marginBottom: '16px' }}><SectionTitle style={st}>Work Experience</SectionTitle>{d.experience.map((exp, i) => <ExperienceBlock key={i} exp={exp} titleStyle={jt} bodyStyle={body} dateColor="#3b82f6" />)}</div>}
        {d.education?.length > 0 && <div style={{ marginBottom: '16px' }}><SectionTitle style={st}>Education</SectionTitle>{d.education.map((edu, i) => <EducationBlock key={i} edu={edu} bodyStyle={body} dateColor="#3b82f6" />)}</div>}
        {d.projects?.length > 0 && <div style={{ marginBottom: '16px' }}><SectionTitle style={st}>Projects</SectionTitle>{d.projects.map((p, i) => <ProjectBlock key={i} proj={p} bodyStyle={body} linkColor="#2563eb" dateColor="#64748b" />)}</div>}
        {d.achievements?.length > 0 && <div style={{ marginBottom: '16px' }}><SectionTitle style={st}>Achievements</SectionTitle><ul style={{ paddingLeft: '16px' }}>{d.achievements.filter(Boolean).map((a, i) => <li key={i} style={{ ...body, marginBottom: '2px' }}>{a}</li>)}</ul></div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE: Minimalist — Two-column header, inline skills, generous whitespace
// ══════════════════════════════════════════════════════════════════════════════
function MinimalistTemplate({ d, personal, contactParts, linkParts, allSkills }) {
  const body = { fontSize: '10.5px', color: '#4b5563' };
  const st = { fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '2px', color: '#6b7280', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '10px' };
  const jt = { fontWeight: '500', fontSize: '11px', color: '#111' };

  return (
    <div style={{ padding: '35px', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: '#333', lineHeight: '1.55' }}>
      {/* Two-column header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #d1d5db', paddingBottom: '16px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '300', color: '#111', letterSpacing: '3px', textTransform: 'uppercase', margin: 0 }}>{personal.name || 'Your Name'}</h1>
        </div>
        <div style={{ textAlign: 'right', fontSize: '9px', color: '#9ca3af', lineHeight: '1.8', letterSpacing: '0.5px' }}>
          {personal.email && <div>{personal.email}</div>}
          {personal.phone && <div>{personal.phone}</div>}
          {personal.location && <div>{personal.location}</div>}
          {personal.linkedin && <div>{personal.linkedin}</div>}
        </div>
      </div>

      {d.summary && <div style={{ marginBottom: '18px' }}><SectionTitle style={st}>Summary</SectionTitle><p style={{ ...body, lineHeight: '1.7' }}>{d.summary}</p></div>}
      {d.experience?.length > 0 && <div style={{ marginBottom: '18px' }}><SectionTitle style={st}>Experience</SectionTitle>{d.experience.map((exp, i) => <ExperienceBlock key={i} exp={exp} titleStyle={jt} bodyStyle={body} dateColor="#9ca3af" />)}</div>}
      {d.education?.length > 0 && <div style={{ marginBottom: '18px' }}><SectionTitle style={st}>Education</SectionTitle>{d.education.map((edu, i) => <EducationBlock key={i} edu={edu} bodyStyle={body} dateColor="#9ca3af" />)}</div>}
      {allSkills.length > 0 && <div style={{ marginBottom: '18px' }}><SectionTitle style={st}>Skills</SectionTitle><SkillsInline skills={allSkills} style={{ ...body, color: '#6b7280' }} /></div>}
      {d.projects?.length > 0 && <div style={{ marginBottom: '18px' }}><SectionTitle style={st}>Projects</SectionTitle>{d.projects.map((p, i) => <ProjectBlock key={i} proj={p} bodyStyle={body} linkColor="#6b7280" dateColor="#9ca3af" />)}</div>}
      {d.achievements?.length > 0 && <div style={{ marginBottom: '18px' }}><SectionTitle style={st}>Achievements</SectionTitle><ul style={{ paddingLeft: '16px' }}>{d.achievements.filter(Boolean).map((a, i) => <li key={i} style={{ ...body, marginBottom: '3px' }}>{a}</li>)}</ul></div>}
      {d.certifications?.length > 0 && <div style={{ marginBottom: '18px' }}><SectionTitle style={st}>Certifications</SectionTitle>{d.certifications.map((c, i) => <CertBlock key={i} cert={c} bodyStyle={body} />)}</div>}
      {d.languages?.length > 0 && <div style={{ marginBottom: '18px' }}><SectionTitle style={st}>Languages</SectionTitle><SkillsInline skills={d.languages.map(l => typeof l === 'string' ? l : `${l.language} (${l.proficiency || ''})`)} style={body} /></div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE: Creative — Bold header, two-column body (sidebar + main)
// ══════════════════════════════════════════════════════════════════════════════
function CreativeTemplate({ d, personal, contactParts, linkParts, allSkills }) {
  const body = { fontSize: '10.5px', color: '#1e1b4b' };
  const st = { fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#7c3aed', borderBottom: '2px solid #ddd6fe', paddingBottom: '3px', marginBottom: '8px' };
  const stSidebar = { ...st, color: '#7c3aed', fontSize: '11px' };
  const jt = { fontWeight: '700', fontSize: '11px', color: '#5b21b6' };
  const tag = { background: '#ede9fe', padding: '3px 10px', borderRadius: '6px', fontSize: '10px', color: '#6d28d9', border: '1px solid #ddd6fe', display: 'inline-block', marginBottom: '4px', marginRight: '4px' };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", lineHeight: '1.5' }}>
      {/* Full-width colored header */}
      <div style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)', padding: '24px 28px', color: '#fff' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>{personal.name || 'Your Name'}</h1>
        <div style={{ fontSize: '10px', color: '#c4b5fd', marginTop: '6px' }}>
          {contactParts.filter(Boolean).join('  ·  ')}
        </div>
        {linkParts.length > 0 && <div style={{ fontSize: '10px', color: '#c4b5fd', marginTop: '2px' }}>{linkParts.join('  ·  ')}</div>}
      </div>

      {/* Two-column body */}
      <div style={{ display: 'flex', padding: '0' }}>
        {/* Left sidebar */}
        <div style={{ width: '32%', padding: '20px 16px', background: '#faf5ff', borderRight: '1px solid #ede9fe', flexShrink: 0 }}>
          {allSkills.length > 0 && <div style={{ marginBottom: '16px' }}><SectionTitle style={stSidebar}>Skills</SectionTitle><div>{allSkills.map((s, i) => <span key={i} style={tag}>{s}</span>)}</div></div>}
          {d.certifications?.length > 0 && <div style={{ marginBottom: '16px' }}><SectionTitle style={stSidebar}>Certifications</SectionTitle>{d.certifications.map((c, i) => <div key={i} style={{ fontSize: '9px', color: '#5b21b6', marginBottom: '5px' }}><strong>{c.name}</strong>{c.issuer && <div style={{ color: '#7c3aed' }}>{c.issuer}</div>}</div>)}</div>}
          {d.languages?.length > 0 && <div style={{ marginBottom: '16px' }}><SectionTitle style={stSidebar}>Languages</SectionTitle>{d.languages.map((l, i) => <div key={i} style={{ fontSize: '9px', color: '#5b21b6', marginBottom: '3px' }}>{typeof l === 'string' ? l : `${l.language} — ${l.proficiency || ''}`}</div>)}</div>}
          {d.achievements?.length > 0 && <div><SectionTitle style={stSidebar}>Awards</SectionTitle><ul style={{ paddingLeft: '14px' }}>{d.achievements.filter(Boolean).map((a, i) => <li key={i} style={{ fontSize: '9px', color: '#5b21b6', marginBottom: '3px' }}>{a}</li>)}</ul></div>}
        </div>

        {/* Right main */}
        <div style={{ flex: 1, padding: '20px' }}>
          {d.summary && <div style={{ marginBottom: '16px' }}><SectionTitle style={st}>Summary</SectionTitle><p style={{ ...body, lineHeight: '1.6' }}>{d.summary}</p></div>}
          {d.experience?.length > 0 && <div style={{ marginBottom: '16px' }}><SectionTitle style={st}>Experience</SectionTitle>{d.experience.map((exp, i) => <ExperienceBlock key={i} exp={exp} titleStyle={jt} bodyStyle={body} dateColor="#a78bfa" />)}</div>}
          {d.education?.length > 0 && <div style={{ marginBottom: '16px' }}><SectionTitle style={st}>Education</SectionTitle>{d.education.map((edu, i) => <EducationBlock key={i} edu={edu} bodyStyle={body} dateColor="#a78bfa" />)}</div>}
          {d.projects?.length > 0 && <div style={{ marginBottom: '16px' }}><SectionTitle style={st}>Projects</SectionTitle>{d.projects.map((p, i) => <ProjectBlock key={i} proj={p} bodyStyle={body} linkColor="#7c3aed" dateColor="#a78bfa" />)}</div>}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE: Executive — Serif, double-ruled sections, formal layout
// ══════════════════════════════════════════════════════════════════════════════
function ExecutiveTemplate({ d, personal, contactParts, linkParts, allSkills }) {
  const body = { fontSize: '10.5px', color: '#44403c' };
  const st = { fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', color: '#92400e', borderTop: '1px solid #d6d3d1', borderBottom: '1px solid #d6d3d1', paddingTop: '4px', paddingBottom: '4px', marginBottom: '10px', marginTop: '4px' };
  const jt = { fontWeight: 'bold', fontSize: '11px', color: '#78350f' };
  const tag = { background: '#fef3c7', padding: '2px 10px', borderRadius: '2px', fontSize: '10px', color: '#92400e', border: '1px solid #fde68a' };

  return (
    <div style={{ padding: '35px', fontFamily: "Georgia, 'Times New Roman', serif", color: '#292524', lineHeight: '1.55' }}>
      <div style={{ textAlign: 'center', borderBottom: '3px double #92400e', paddingBottom: '16px', marginBottom: '18px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'normal', color: '#78350f', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>{personal.name || 'Your Name'}</h1>
        <ContactLine parts={contactParts} style={{ fontSize: '10px', color: '#a16207', marginTop: '6px', letterSpacing: '0.5px' }} />
        <ContactLine parts={linkParts} style={{ fontSize: '10px', color: '#a16207', marginTop: '2px' }} />
      </div>

      {d.summary && <div style={{ marginBottom: '18px' }}><SectionTitle style={st}>Executive Summary</SectionTitle><p style={{ ...body, lineHeight: '1.7', fontStyle: 'italic' }}>{d.summary}</p></div>}
      {d.experience?.length > 0 && <div style={{ marginBottom: '18px' }}><SectionTitle style={st}>Professional Experience</SectionTitle>{d.experience.map((exp, i) => <ExperienceBlock key={i} exp={exp} titleStyle={jt} bodyStyle={body} dateColor="#a16207" />)}</div>}
      {d.education?.length > 0 && <div style={{ marginBottom: '18px' }}><SectionTitle style={st}>Education</SectionTitle>{d.education.map((edu, i) => <EducationBlock key={i} edu={edu} bodyStyle={body} dateColor="#a16207" />)}</div>}
      {d.certifications?.length > 0 && <div style={{ marginBottom: '18px' }}><SectionTitle style={st}>Certifications & Credentials</SectionTitle>{d.certifications.map((c, i) => <CertBlock key={i} cert={c} bodyStyle={body} />)}</div>}
      {allSkills.length > 0 && <div style={{ marginBottom: '18px' }}><SectionTitle style={st}>Core Competencies</SectionTitle><SkillTags skills={allSkills} tagStyle={tag} /></div>}
      {d.projects?.length > 0 && <div style={{ marginBottom: '18px' }}><SectionTitle style={st}>Key Projects</SectionTitle>{d.projects.map((p, i) => <ProjectBlock key={i} proj={p} bodyStyle={body} linkColor="#92400e" dateColor="#a16207" />)}</div>}
      {d.achievements?.length > 0 && <div style={{ marginBottom: '18px' }}><SectionTitle style={st}>Honors & Awards</SectionTitle><ul style={{ paddingLeft: '16px' }}>{d.achievements.filter(Boolean).map((a, i) => <li key={i} style={{ ...body, marginBottom: '3px' }}>{a}</li>)}</ul></div>}
      {d.languages?.length > 0 && <div style={{ marginBottom: '18px' }}><SectionTitle style={st}>Languages</SectionTitle><LanguageTags languages={d.languages} tagStyle={tag} /></div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE: Tech Focused — Dark theme, sidebar for skills/tools
// ══════════════════════════════════════════════════════════════════════════════
function TechFocusedTemplate({ d, personal, contactParts, linkParts, allSkills }) {
  const body = { fontSize: '10.5px', color: '#e2e8f0' };
  const st = { fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#22c55e', borderBottom: '1px solid #334155', paddingBottom: '3px', marginBottom: '8px' };
  const stSidebar = { ...st, fontSize: '11px', color: '#4ade80' };
  const jt = { fontWeight: 'bold', fontSize: '11px', color: '#86efac' };
  const tag = { background: '#1e293b', padding: '3px 8px', borderRadius: '4px', fontSize: '9px', color: '#22c55e', border: '1px solid #334155', display: 'inline-block', marginBottom: '4px', marginRight: '4px', fontFamily: "'Consolas', monospace" };

  return (
    <div style={{ display: 'flex', fontFamily: "'Consolas', 'Fira Code', monospace", lineHeight: '1.5', background: '#0f172a', minHeight: '100%' }}>
      {/* Left sidebar */}
      <div style={{ width: '35%', padding: '24px 14px', background: '#020617', borderRight: '1px solid #1e293b', flexShrink: 0 }}>
        <div style={{ fontSize: '10px', color: '#334155', marginBottom: '10px', fontFamily: 'monospace' }}>{'// contact.info'}</div>
        <div style={{ fontSize: '9px', color: '#94a3b8', lineHeight: '1.8', marginBottom: '20px' }}>
          {personal.email && <div><span style={{ color: '#22c55e' }}>email:</span> {personal.email}</div>}
          {personal.phone && <div><span style={{ color: '#22c55e' }}>phone:</span> {personal.phone}</div>}
          {personal.location && <div><span style={{ color: '#22c55e' }}>loc:</span> {personal.location}</div>}
          {personal.linkedin && <div style={{ wordBreak: 'break-all' }}><span style={{ color: '#22c55e' }}>in:</span> {personal.linkedin}</div>}
          {personal.portfolio && <div style={{ wordBreak: 'break-all' }}><span style={{ color: '#22c55e' }}>web:</span> {personal.portfolio}</div>}
        </div>

        {allSkills.length > 0 && <div style={{ marginBottom: '16px' }}><SectionTitle style={stSidebar}>{'// tech_stack'}</SectionTitle><div>{allSkills.map((s, i) => <span key={i} style={tag}>{s}</span>)}</div></div>}
        {d.certifications?.length > 0 && <div style={{ marginBottom: '16px' }}><SectionTitle style={stSidebar}>{'// certs'}</SectionTitle>{d.certifications.map((c, i) => <div key={i} style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '4px' }}><span style={{ color: '#86efac' }}>{c.name}</span>{c.issuer && <div style={{ color: '#64748b' }}>{c.issuer}</div>}</div>)}</div>}
        {d.languages?.length > 0 && <div><SectionTitle style={stSidebar}>{'// languages'}</SectionTitle>{d.languages.map((l, i) => <div key={i} style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '3px' }}>{typeof l === 'string' ? l : `${l.language} (${l.proficiency || ''})`}</div>)}</div>}
      </div>

      {/* Right main */}
      <div style={{ flex: 1, padding: '24px 20px', color: '#e2e8f0' }}>
        <div style={{ borderBottom: '2px solid #22c55e', paddingBottom: '14px', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e', letterSpacing: '1px', margin: 0 }}>{personal.name || 'Your Name'}</h1>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>{'> '}{d.summary ? d.summary.substring(0, 80) + '...' : 'Software Developer'}</div>
        </div>

        {d.summary && <div style={{ marginBottom: '14px' }}><SectionTitle style={st}>{'// about'}</SectionTitle><p style={{ ...body, lineHeight: '1.6' }}>{d.summary}</p></div>}
        {d.experience?.length > 0 && <div style={{ marginBottom: '14px' }}><SectionTitle style={st}>{'// experience'}</SectionTitle>{d.experience.map((exp, i) => <ExperienceBlock key={i} exp={exp} titleStyle={jt} bodyStyle={body} dateColor="#64748b" />)}</div>}
        {d.education?.length > 0 && <div style={{ marginBottom: '14px' }}><SectionTitle style={st}>{'// education'}</SectionTitle>{d.education.map((edu, i) => <EducationBlock key={i} edu={edu} bodyStyle={body} dateColor="#64748b" />)}</div>}
        {d.projects?.length > 0 && <div style={{ marginBottom: '14px' }}><SectionTitle style={st}>{'// projects'}</SectionTitle>{d.projects.map((p, i) => <ProjectBlock key={i} proj={p} bodyStyle={body} linkColor="#22c55e" dateColor="#64748b" />)}</div>}
        {d.achievements?.length > 0 && <div style={{ marginBottom: '14px' }}><SectionTitle style={st}>{'// achievements'}</SectionTitle><ul style={{ paddingLeft: '16px' }}>{d.achievements.filter(Boolean).map((a, i) => <li key={i} style={{ ...body, marginBottom: '2px' }}>{a}</li>)}</ul></div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE: Two Column — Classic sidebar resume layout
// ══════════════════════════════════════════════════════════════════════════════
function TwoColumnTemplate({ d, personal, contactParts, linkParts, allSkills }) {
  const body = { fontSize: '10.5px', color: '#374151' };
  const st = { fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '3px', marginBottom: '8px' };
  const stSidebar = { ...st, color: '#ffffff', borderBottom: '2px solid rgba(255,255,255,0.2)' };
  const jt = { fontWeight: '600', fontSize: '11px', color: '#111827' };
  const tag = { background: 'rgba(255,255,255,0.15)', padding: '3px 8px', borderRadius: '4px', fontSize: '9px', color: '#fff', display: 'inline-block', marginBottom: '4px', marginRight: '4px' };

  const technicalSkills = d.skills?.technical || [];
  const toolSkills = d.skills?.tools || [];
  const softSkills = d.skills?.soft || [];

  return (
    <div style={{ display: 'flex', fontFamily: "'Segoe UI', Arial, sans-serif", lineHeight: '1.5', minHeight: '100%' }}>
      {/* Left sidebar */}
      <div style={{ width: '33%', background: '#1f2937', color: '#fff', padding: '24px 16px', flexShrink: 0 }}>
        <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '4px', lineHeight: '1.2' }}>{personal.name || 'Your Name'}</h1>
        <div style={{ width: '40px', height: '3px', background: '#3b82f6', marginBottom: '16px', marginTop: '8px' }}></div>

        <div style={{ fontSize: '9px', color: '#d1d5db', lineHeight: '1.8', marginBottom: '20px' }}>
          {personal.email && <div>{personal.email}</div>}
          {personal.phone && <div>{personal.phone}</div>}
          {personal.location && <div>{personal.location}</div>}
          {personal.linkedin && <div style={{ wordBreak: 'break-all' }}>{personal.linkedin}</div>}
          {personal.portfolio && <div style={{ wordBreak: 'break-all' }}>{personal.portfolio}</div>}
        </div>

        {technicalSkills.length > 0 && <div style={{ marginBottom: '14px' }}><SectionTitle style={stSidebar}>Technical Skills</SectionTitle><div>{technicalSkills.map((s, i) => <span key={i} style={tag}>{s}</span>)}</div></div>}
        {toolSkills.length > 0 && <div style={{ marginBottom: '14px' }}><SectionTitle style={stSidebar}>Tools</SectionTitle><div>{toolSkills.map((s, i) => <span key={i} style={tag}>{s}</span>)}</div></div>}
        {softSkills.length > 0 && <div style={{ marginBottom: '14px' }}><SectionTitle style={stSidebar}>Soft Skills</SectionTitle><div>{softSkills.map((s, i) => <span key={i} style={tag}>{s}</span>)}</div></div>}

        {d.certifications?.length > 0 && <div style={{ marginBottom: '14px' }}><SectionTitle style={stSidebar}>Certifications</SectionTitle>{d.certifications.map((c, i) => <div key={i} style={{ fontSize: '9px', color: '#d1d5db', marginBottom: '5px' }}><strong style={{ color: '#fff' }}>{c.name}</strong>{c.issuer && <div>{c.issuer}</div>}</div>)}</div>}
        {d.languages?.length > 0 && <div><SectionTitle style={stSidebar}>Languages</SectionTitle>{d.languages.map((l, i) => <div key={i} style={{ fontSize: '9px', color: '#d1d5db', marginBottom: '3px' }}>{typeof l === 'string' ? l : `${l.language} — ${l.proficiency || ''}`}</div>)}</div>}
      </div>

      {/* Right main */}
      <div style={{ flex: 1, padding: '24px 20px' }}>
        {d.summary && <div style={{ marginBottom: '16px' }}><SectionTitle style={st}>Profile</SectionTitle><p style={{ ...body, lineHeight: '1.6' }}>{d.summary}</p></div>}
        {d.experience?.length > 0 && <div style={{ marginBottom: '16px' }}><SectionTitle style={st}>Experience</SectionTitle>{d.experience.map((exp, i) => <ExperienceBlock key={i} exp={exp} titleStyle={jt} bodyStyle={body} dateColor="#6b7280" />)}</div>}
        {d.education?.length > 0 && <div style={{ marginBottom: '16px' }}><SectionTitle style={st}>Education</SectionTitle>{d.education.map((edu, i) => <EducationBlock key={i} edu={edu} bodyStyle={body} dateColor="#6b7280" />)}</div>}
        {d.projects?.length > 0 && <div style={{ marginBottom: '16px' }}><SectionTitle style={st}>Projects</SectionTitle>{d.projects.map((p, i) => <ProjectBlock key={i} proj={p} bodyStyle={body} linkColor="#3b82f6" dateColor="#6b7280" />)}</div>}
        {d.achievements?.length > 0 && <div style={{ marginBottom: '16px' }}><SectionTitle style={st}>Achievements</SectionTitle><ul style={{ paddingLeft: '16px' }}>{d.achievements.filter(Boolean).map((a, i) => <li key={i} style={{ ...body, marginBottom: '2px' }}>{a}</li>)}</ul></div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE: Compact — Dense single-column for experienced professionals
// ══════════════════════════════════════════════════════════════════════════════
function CompactTemplate({ d, personal, contactParts, linkParts, allSkills }) {
  const body = { fontSize: '10px', color: '#374151' };
  const st = { fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#111827', background: '#f3f4f6', padding: '3px 8px', marginBottom: '6px', borderLeft: '3px solid #3b82f6' };
  const jt = { fontWeight: '600', fontSize: '10px', color: '#111827' };
  const tag = { background: '#f3f4f6', padding: '1px 6px', borderRadius: '2px', fontSize: '9px', color: '#374151' };

  return (
    <div style={{ padding: '20px 24px', fontFamily: "Arial, Helvetica, sans-serif", color: '#333', lineHeight: '1.4' }}>
      {/* Compact header */}
      <div style={{ borderBottom: '2px solid #111827', paddingBottom: '8px', marginBottom: '10px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111', margin: 0 }}>{personal.name || 'Your Name'}</h1>
        <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '3px' }}>
          {[...contactParts, ...linkParts].filter(Boolean).join('  ·  ')}
        </div>
      </div>

      {d.summary && <div style={{ marginBottom: '8px' }}><SectionTitle style={st}>Summary</SectionTitle><p style={{ ...body, lineHeight: '1.5' }}>{d.summary}</p></div>}

      {/* Skills in multi-column grid */}
      {allSkills.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <SectionTitle style={st}>Skills</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3px' }}>
            {allSkills.map((s, i) => <span key={i} style={tag}>{s}</span>)}
          </div>
        </div>
      )}

      {d.experience?.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <SectionTitle style={st}>Experience</SectionTitle>
          {d.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <span style={jt}>{exp.title}</span>
                  {exp.company && <span style={{ ...body, fontStyle: 'italic' }}> — {exp.company}</span>}
                </div>
                <span style={{ fontSize: '9px', color: '#9ca3af', whiteSpace: 'nowrap' }}>{exp.start}{exp.end ? `–${exp.end}` : exp.current ? '–Present' : ''}</span>
              </div>
              {exp.bullets?.length > 0 && <ul style={{ paddingLeft: '14px', marginTop: '2px' }}>{exp.bullets.filter(Boolean).map((b, j) => <li key={j} style={{ ...body, marginBottom: '1px' }}>{b}</li>)}</ul>}
            </div>
          ))}
        </div>
      )}

      {d.education?.length > 0 && <div style={{ marginBottom: '8px' }}><SectionTitle style={st}>Education</SectionTitle>{d.education.map((edu, i) => <EducationBlock key={i} edu={edu} bodyStyle={body} dateColor="#9ca3af" />)}</div>}
      {d.projects?.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <SectionTitle style={st}>Projects</SectionTitle>
          {d.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: '5px' }}>
              <strong style={{ fontSize: '10px' }}>{p.name}</strong>
              {p.tech?.length > 0 && <span style={{ fontSize: '9px', color: '#6b7280' }}> [{p.tech.join(', ')}]</span>}
              {p.description && <span style={{ ...body }}> — {p.description}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Bottom row: achievements + certs side by side */}
      <div style={{ display: 'flex', gap: '16px' }}>
        {d.achievements?.length > 0 && <div style={{ flex: 1, marginBottom: '8px' }}><SectionTitle style={st}>Achievements</SectionTitle><ul style={{ paddingLeft: '14px' }}>{d.achievements.filter(Boolean).map((a, i) => <li key={i} style={{ ...body, marginBottom: '1px' }}>{a}</li>)}</ul></div>}
        {d.certifications?.length > 0 && <div style={{ flex: 1, marginBottom: '8px' }}><SectionTitle style={st}>Certifications</SectionTitle>{d.certifications.map((c, i) => <div key={i} style={{ ...body, marginBottom: '2px' }}><strong>{c.name}</strong>{c.issuer ? ` — ${c.issuer}` : ''}</div>)}</div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE ROUTER
// ══════════════════════════════════════════════════════════════════════════════
const TEMPLATE_MAP = {
  'ats-classic': ATSClassicTemplate,
  'modern-blue': ModernBlueTemplate,
  'minimalist': MinimalistTemplate,
  'creative': CreativeTemplate,
  'executive': ExecutiveTemplate,
  'tech-focused': TechFocusedTemplate,
  'two-column': TwoColumnTemplate,
  'compact': CompactTemplate,
};

export default function ResumePreview({ resumeData, templateId = 'ats-classic', scale = 1 }) {
  const d = useMemo(() => sanitizeResumeData(resumeData || {}), [resumeData]);
  const personal = d.personal || {};

  const contactParts = [personal.email, personal.phone, personal.location].filter(Boolean);
  const linkParts = [personal.linkedin, personal.portfolio].filter(Boolean);
  const allSkills = [...(d.skills?.technical || []), ...(d.skills?.tools || []), ...(d.skills?.soft || [])];

  const TemplateComponent = TEMPLATE_MAP[templateId] || ATSClassicTemplate;

  return (
    <div
      className="resume-preview"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${100 / scale}%`,
        background: templateId === 'tech-focused' ? '#0f172a' : '#ffffff',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}
    >
      <TemplateComponent
        d={d}
        personal={personal}
        contactParts={contactParts}
        linkParts={linkParts}
        allSkills={allSkills}
      />
    </div>
  );
}
