import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Edit, ArrowLeft, Eye, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import ResumePreview from '../components/ResumePreview';
import ATSScore from '../components/ATSScore/ATSScore';
import Navbar from '../components/Navbar';

export default function Preview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const resumePreviewRef = useRef(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recruiterView, setRecruiterView] = useState(null);
  const [recruiterLoading, setRecruiterLoading] = useState(false);
  const [exporting, setExporting] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    loadResume();
  }, [id]);

  const loadResume = async () => {
    try {
      const res = await api.get(`/api/resumes/${id}`);
      setResume(res.data);
    } catch (err) {
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handlePdfDownload = async () => {
    const element = resumePreviewRef.current;
    if (!element) {
      showToast('Resume preview not available');
      return;
    }
    setExporting('pdf');
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const fileName = resume?.title
        ? `${resume.title.replace(/[^a-z0-9]/gi, '_')}_resume.pdf`
        : 'resume.pdf';

      await html2pdf()
        .set({
          margin: [0.4, 0.4, 0.4, 0.4],
          filename: fileName,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            logging: false,
            windowWidth: 816,
            windowHeight: 1056
          },
          jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait', compress: true },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'], avoid: ['ul', 'li', '.experience-block', '.education-block', '.project-block'] }
        })
        .from(element)
        .save();

      showToast('PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF export error:', err);
      showToast('PDF export failed. Please try again.');
    } finally {
      setExporting('');
    }
  };

  const handleDocxDownload = async () => {
    setExporting('docx');
    try {
      const url = `${import.meta.env.VITE_API_URL}/api/export/${id}/docx`;
      const token = localStorage.getItem('token');
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

      if (!res.ok) {
        showToast('DOCX export failed. Please try again.');
        return;
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = resume?.title
        ? `${resume.title.replace(/[^a-z0-9]/gi, '_')}_resume.docx`
        : 'resume.docx';
      a.click();
      URL.revokeObjectURL(blobUrl);
      showToast('DOCX downloaded successfully!');
    } catch (err) {
      console.error('DOCX export error:', err);
      showToast('DOCX export failed. Please try again.');
    } finally {
      setExporting('');
    }
  };



  const handleRecruiterView = async () => {
    setRecruiterLoading(true);
    try {
      const res = await api.post('/api/ai/recruiter-view', { resumeData: resume.resumeData, resumeId: id });
      setRecruiterView(res.data);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to generate recruiter view');
    } finally {
      setRecruiterLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm z-50 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-400" /> {toast}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-xl font-bold text-gray-900 flex-1">{resume?.title}</h1>
          <button onClick={() => navigate(`/editor/${id}`)} className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-700">
            <Edit className="h-4 w-4" /> Edit
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resume Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 text-xs font-medium text-gray-600">Preview</div>
              <div className="p-4 overflow-auto" style={{ maxHeight: '80vh' }}>
                <div ref={resumePreviewRef}>
                  <ResumePreview resumeData={resume?.resumeData} templateId={resume?.templateId} />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Export options */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Download Resume</h3>

              {/* PDF Download */}
              <button
                onClick={handlePdfDownload}
                disabled={!!exporting}
                className="w-full bg-slate-700 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 mb-3 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {exporting === 'pdf' ? 'Generating PDF...' : 'Download PDF'}
              </button>

              <div className="border-t border-gray-100 pt-3 space-y-2">
                {/* DOCX */}
                <button onClick={handleDocxDownload} disabled={!!exporting} className="w-full border border-gray-200 text-gray-700 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-50">
                  <Download className="h-4 w-4" />
                  {exporting === 'docx' ? 'Generating DOCX...' : 'Download DOCX'}
                </button>
              </div>
            </div>

            {/* ATS Score */}
            <ATSScore resumeData={resume?.resumeData} jobRole={resume?.jobRole} resumeId={id} />

            {/* Recruiter View */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4 text-slate-600" /> Recruiter Simulation
              </h3>

              {!recruiterView ? (
                <>
                  <p className="text-gray-500 text-xs mb-3">See how an HR scans your resume in 6 seconds</p>
                  <button
                    onClick={handleRecruiterView}
                    disabled={recruiterLoading}
                    className="w-full bg-slate-700 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    {recruiterLoading ? 'Simulating...' : 'Show Recruiter View'}
                  </button>
                </>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1">FIRST IMPRESSION</p>
                    <p className="text-gray-700 text-xs">{recruiterView.firstImpression}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">RECRUITER READS IN ORDER</p>
                    {recruiterView.eyePath?.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 mb-1">
                        <span className="bg-amber-100 text-amber-700 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                        <span className="text-xs text-gray-600">{item}</span>
                      </div>
                    ))}
                  </div>

                  {recruiterView.greenFlags?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-600 mb-1">✅ GREEN FLAGS</p>
                      {recruiterView.greenFlags.map((f, i) => <p key={i} className="text-xs text-green-700 mb-0.5">• {f}</p>)}
                    </div>
                  )}

                  {recruiterView.redFlags?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-red-500 mb-1">🚩 RED FLAGS</p>
                      {recruiterView.redFlags.map((f, i) => <p key={i} className="text-xs text-red-600 mb-0.5">• {f}</p>)}
                    </div>
                  )}

                  <div className={`rounded-xl p-3 ${recruiterView.wouldInterview ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <p className={`text-sm font-bold ${recruiterView.wouldInterview ? 'text-green-700' : 'text-red-700'}`}>
                      {recruiterView.wouldInterview ? '✅ Would call for interview' : '❌ Would not call for interview'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{recruiterView.reason}</p>
                  </div>

                  <button onClick={() => setRecruiterView(null)} className="text-xs text-gray-400 hover:text-gray-600">Reset</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
