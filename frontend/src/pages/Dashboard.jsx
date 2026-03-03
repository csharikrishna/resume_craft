import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Copy, Download, Eye, FileText, Target } from 'lucide-react';
import api from '../utils/api';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/api/resumes');
      setResumes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this resume? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.delete(`/api/resumes/${id}`);
      setResumes(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert('Failed to delete resume');
    } finally {
      setDeleting(null);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await api.post(`/api/resumes/${id}/duplicate`);
      setResumes(prev => [res.data, ...prev]);
    } catch (err) {
      alert('Failed to duplicate resume');
    }
  };

  const getScoreColor = (score) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-500';
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-600',
      paid: 'bg-emerald-100 text-emerald-700',
      exported: 'bg-amber-100 text-amber-700'
    };
    return badges[status] || badges.draft;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-1">My Resumes</h1>
            <p className="text-gray-600 text-lg">{resumes.length} {resumes.length === 1 ? 'resume' : 'resumes'} created</p>
          </div>
          <Link to="/builder" className="group bg-slate-700 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-slate-800 hover:shadow-lg transition-all duration-300 flex items-center gap-2 shadow-md w-fit">
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" /> Create New Resume
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg font-medium">Loading your resumes...</p>
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="bg-slate-700 rounded-3xl w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FileText className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-3">No resumes yet</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">Create your first AI-powered resume in minutes and start landing interviews</p>
            <Link to="/builder" className="group bg-slate-700 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2 shadow-md">
              <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" /> Build My First Resume
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div key={resume.id} className="group bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-amber-300 transition-all duration-300 hover:-translate-y-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-lg text-gray-900 truncate group-hover:text-amber-600 transition-colors">{resume.title}</h3>
                    {resume.jobRole && (
                      <p className="text-amber-600 text-sm font-semibold mt-1">{resume.jobRole}</p>
                    )}
                  </div>
                  <span className={`text-xs px-3 py-1.5 rounded-full font-bold ml-3 flex-shrink-0 ${getStatusBadge(resume.status)}`}>
                    {resume.status}
                  </span>
                </div>

                {/* ATS Score */}
                <div className="flex items-center gap-2 mb-4 bg-gray-50 rounded-xl p-3">
                  <Target className="h-5 w-5 text-gray-400" />
                  {resume.atsScore ? (
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-700">ATS Score</span>
                        <span className={`text-lg font-black ${getScoreColor(resume.atsScore)}`}>
                          {resume.atsScore}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all ${
                          resume.atsScore >= 80 ? 'bg-green-500' : resume.atsScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} style={{ width: `${resume.atsScore}%` }}></div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm font-medium">ATS not checked yet</span>
                  )}
                </div>

                {/* Date */}
                <p className="text-gray-500 text-xs mb-5">
                  Last edited: {new Date(resume.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/editor/${resume.id}`)}
                    className="flex-1 bg-slate-700 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1.5"
                  >
                    <Edit className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => navigate(`/preview/${resume.id}`)}
                    className="px-4 py-2.5 border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-amber-300 transition-all"
                    title="Preview"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(resume.id)}
                    className="px-4 py-2.5 border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-amber-300 transition-all"
                    title="Duplicate"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    disabled={deleting === resume.id}
                    className="px-4 py-2.5 border-2 border-red-100 rounded-xl text-red-500 hover:bg-red-50 hover:border-red-300 disabled:opacity-50 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
