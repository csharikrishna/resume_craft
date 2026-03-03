import { useState } from 'react';
import { X, Check, Star } from 'lucide-react';

const TEMPLATES = [
  {
    id: 'ats-classic',
    name: 'ATS Classic',
    description: 'Clean, ATS-friendly format. Maximum compatibility with applicant tracking systems.',
    badge: 'Most Popular',
    previewColors: { header: '#1f2937', accent: '#374151', bg: '#f9fafb', text: '#6b7280' },
  },
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    description: 'Contemporary design with blue accents. Perfect for tech and corporate roles.',
    badge: null,
    previewColors: { header: '#2563eb', accent: '#3b82f6', bg: '#eff6ff', text: '#93c5fd' },
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Elegant simplicity with generous whitespace. Great for any industry.',
    badge: null,
    previewColors: { header: '#9ca3af', accent: '#d1d5db', bg: '#ffffff', text: '#e5e7eb' },
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bold purple accents and artistic layout. Perfect for designers and creatives.',
    badge: null,
    previewColors: { header: '#7c3aed', accent: '#8b5cf6', bg: '#f5f3ff', text: '#c4b5fd' },
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Serif fonts with gold accents. Ideal for leadership and senior positions.',
    badge: 'Premium Feel',
    previewColors: { header: '#92400e', accent: '#b45309', bg: '#fffbeb', text: '#fde68a' },
  },
  {
    id: 'tech-focused',
    name: 'Tech Focused',
    description: 'Dark theme with green terminal accents. Built for developers and engineers.',
    badge: null,
    previewColors: { header: '#22c55e', accent: '#16a34a', bg: '#0f172a', text: '#334155' },
  },
  {
    id: 'two-column',
    name: 'Two Column',
    description: 'Classic sidebar layout with skills on the left and experience on the right.',
    badge: 'New',
    previewColors: { header: '#1f2937', accent: '#3b82f6', bg: '#ffffff', text: '#e5e7eb' },
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Dense single-column layout for experienced professionals with lots to showcase.',
    badge: 'New',
    previewColors: { header: '#111827', accent: '#3b82f6', bg: '#ffffff', text: '#f3f4f6' },
  },
];

function MiniPreview({ colors, isSelected }) {
  const isDark = colors.bg === '#0f172a';
  const barColor = isDark ? colors.text : '#e5e7eb';
  const textColor = isDark ? '#64748b' : '#d1d5db';

  return (
    <div
      style={{ background: colors.bg }}
      className={`h-56 p-3 rounded-t-xl transition-all duration-300 ${isSelected ? 'ring-2 ring-offset-2 ring-slate-700' : ''}`}
    >
      {/* Header bar */}
      <div style={{ background: colors.header }} className="rounded-md p-2.5 mb-2.5">
        <div className="rounded" style={{ background: 'rgba(255,255,255,0.9)', height: '7px', width: '60%' }} />
        <div className="rounded mt-1.5" style={{ background: 'rgba(255,255,255,0.4)', height: '4px', width: '45%' }} />
      </div>
      {/* Body lines */}
      <div className="space-y-1.5 mb-2.5">
        <div className="rounded" style={{ background: colors.header, height: '5px', width: '40%', opacity: 0.7 }} />
        <div className="rounded" style={{ background: barColor, height: '3px', width: '100%' }} />
        <div className="rounded" style={{ background: barColor, height: '3px', width: '85%' }} />
        <div className="rounded" style={{ background: barColor, height: '3px', width: '92%' }} />
      </div>
      {/* Section 2 */}
      <div className="space-y-1.5 mb-2.5">
        <div className="rounded" style={{ background: colors.header, height: '5px', width: '35%', opacity: 0.7 }} />
        <div style={{ borderTop: `1px solid ${colors.accent}30`, marginBottom: '4px' }} />
        <div className="rounded" style={{ background: barColor, height: '3px', width: '75%' }} />
        <div className="rounded" style={{ background: barColor, height: '3px', width: '90%' }} />
      </div>
      {/* Skill tags */}
      <div className="flex gap-1 flex-wrap">
        {[38, 50, 42, 35].map((w, i) => (
          <div key={i} className="rounded-full" style={{ background: `${colors.accent}25`, border: `1px solid ${colors.accent}40`, height: '6px', width: `${w}px` }} />
        ))}
      </div>
    </div>
  );
}

export default function TemplateSelector({ onClose, selectedTemplate, onSelectTemplate }) {
  const [hoveredTemplate, setHoveredTemplate] = useState(null);

  const handleSelectTemplate = (templateId) => {
    onSelectTemplate(templateId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Choose Resume Template</h2>
            <p className="text-sm text-gray-500 mt-1">Select a professional template that matches your style</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {TEMPLATES.map((template) => {
              const isSelected = selectedTemplate === template.id;
              const isHovered = hoveredTemplate === template.id;

              return (
                <div
                  key={template.id}
                  onMouseEnter={() => setHoveredTemplate(template.id)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                  onClick={() => handleSelectTemplate(template.id)}
                  className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${isSelected
                    ? 'ring-2 ring-slate-700 shadow-xl scale-[1.02]'
                    : 'border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg hover:scale-[1.01]'
                    }`}
                >
                  {/* Badge */}
                  {template.badge && (
                    <div className="absolute top-2 right-2 z-10 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="h-2.5 w-2.5" fill="currentColor" />
                      {template.badge}
                    </div>
                  )}

                  {/* Preview */}
                  <MiniPreview colors={template.previewColors} isSelected={isSelected} />

                  {/* Info */}
                  <div className="bg-white p-4 border-t border-gray-100">
                    <h3 className="font-semibold text-gray-800 text-sm">{template.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{template.description}</p>
                  </div>

                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute top-3 left-3 bg-slate-700 rounded-full p-1.5 shadow-lg">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}

                  {/* Hover Overlay */}
                  {isHovered && !isSelected && (
                    <div className="absolute inset-0 bg-slate-800/80 flex items-center justify-center rounded-xl transition-opacity">
                      <button className="bg-white text-slate-700 px-5 py-2 rounded-lg font-semibold text-sm hover:bg-slate-100 transition-colors shadow-lg">
                        Select Template
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between rounded-b-2xl">
          <p className="text-sm text-gray-600">
            Selected: <span className="font-semibold text-gray-800">{TEMPLATES.find(t => t.id === selectedTemplate)?.name || 'ATS Classic'}</span>
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}