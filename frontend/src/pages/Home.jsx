import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Target, FileText, Star, CheckCircle, Feather, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';

const FEATURES = [
  { icon: Zap, title: 'AI-Powered Parsing', desc: 'Upload any resume format or paste text. AI extracts and restructures everything intelligently.' },
  { icon: Target, title: 'ATS Score 90+', desc: 'Every resume is optimized for Applicant Tracking Systems with real-time scoring.' },
  { icon: FileText, title: 'Smart Rewriting', desc: 'AI rewrites weak content, adds power verbs, quantifies achievements automatically.' },
  { icon: Star, title: 'Chat Coach', desc: 'Natural language editing - just tell AI what you want changed in plain English.' }
];

const STEPS = [
  { step: '01', title: 'Paste or Upload', desc: 'Add your details in any format — messy text, old PDF, or fill the form manually.' },
  { step: '02', title: 'AI Rebuilds It', desc: 'AI analyzes like an HR expert and creates a professional, ATS-optimized resume.' },
  { step: '03', title: 'Edit & Refine', desc: 'Tweak everything in the editor or use the AI chat coach. Free AI assistance included.' },
  { step: '04', title: 'Download & Apply', desc: 'Export your polished resume in PDF format. 100% FREE. No payment required.' }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-white via-white to-slate-50 py-20 px-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-slate-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-slate-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm font-medium mb-6 animate-bounce-subtle border border-amber-200">
            <Zap className="h-3.5 w-3.5" /> AI-Powered Resume Builder
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
            Build resumes that get
            <span className="block mt-2 text-amber-700">interviews, not rejections</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Upload any resume or paste text. <span className="font-semibold text-gray-900">AI rebuilds it professionally</span> in 30 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/builder" className="group bg-slate-700 text-white px-10 py-4 rounded-xl font-bold hover:bg-slate-800 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md">
              Build My Resume Free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/templates" className="bg-white text-slate-700 px-10 py-4 rounded-xl font-semibold border-2 border-slate-200 hover:bg-slate-50 hover:shadow-lg transition-all duration-300">
              View Templates
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500 flex-wrap">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-500" />
              100% Free Forever
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-500" />
              No Credit Card
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-500" />
              No Hidden Fees
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Why top candidates choose us</h2>
            <p className="text-gray-600 text-lg">AI that thinks like an HR expert, built for job seekers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((f, i) => (
              <div key={i} className="group bg-white border border-gray-200 rounded-2xl p-8 hover:border-amber-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="bg-slate-100 rounded-2xl p-4 w-fit mb-5 group-hover:scale-110 transition-transform">
                  <f.icon className="h-7 w-7 text-slate-700" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center text-gray-900 mb-4">Get hired in 4 simple steps</h2>
          <p className="text-center text-gray-600 mb-16 text-lg">From upload to offer letter in minutes, not days</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {STEPS.map((s, i) => (
              <div key={i} className="relative bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-3xl p-8 hover:border-amber-300 hover:shadow-lg transition-all duration-300 group">
                <div className="absolute -top-5 -left-5 bg-slate-700 text-white rounded-2xl p-4 shadow-lg group-hover:scale-110 transition-transform">
                  <div className="text-3xl font-black leading-none">{s.step}</div>
                </div>
                <div className="ml-8 mt-2">
                  <h3 className="font-bold text-xl text-gray-900 mb-3">{s.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{s.desc}</p>
                </div>
                {i< STEPS.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2">
                    <ArrowRight className="h-8 w-8 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Pricing Banner */}
      <section className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-50 via-white to-blue-50 border-2 border-emerald-200 rounded-3xl p-12 md:p-16 text-center shadow-xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-30 -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-30 -ml-32 -mb-32"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-full text-sm font-bold mb-6 shadow-lg">
                <CheckCircle className="h-5 w-5" /> Currently 100% FREE
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 leading-tight">
                Everything is <span className="text-emerald-600">FREE</span>
              </h2>
              
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Build unlimited resumes. Use AI features. Download PDFs. Zero cost, zero catches.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                  { icon: Zap, title: 'Unlimited Resumes', desc: 'Create as many as you need' },
                  { icon: Sparkles, title: 'AI Features', desc: 'Full AI optimization & chat' },
                  { icon: FileText, title: 'PDF Download', desc: 'Export professional PDFs' }
                ].map((f, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
                    <div className="bg-emerald-100 rounded-xl p-3 w-fit mx-auto mb-4">
                      <f.icon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{f.title}</h3>
                    <p className="text-gray-600 text-sm">{f.desc}</p>
                  </div>
                ))}
              </div>

              <Link 
                to="/builder" 
                className="inline-flex items-center gap-2 bg-slate-700 text-white px-10 py-4 rounded-xl font-bold hover:bg-slate-800 hover:shadow-lg transition-all duration-300 shadow-md"
              >
                Start Building Now — FREE
                <ArrowRight className="h-5 w-5" />
              </Link>

              <p className="text-gray-500 mt-6 text-sm">
                No payment method required • No trial period • No gotchas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-700 py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNiI+PHBhdGggZD0iTTM2IDE0YzAtMy4zMTQgMi42ODYtNiA2LTZzNiAyLjY4NiA2IDYtMi42ODYgNi02IDYtNi0yLjY4Ni02LTZ6TTAgMjBjMC0zLjMxNCAyLjY4Ni02IDYtNnM2IDIuNjg2IDYgNi0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Ready to land your dream job?
          </h2>
          <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-2xl mx-auto">
            Join thousands who got hired faster with professional resumes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/builder" className="group bg-white text-slate-700 px-10 py-4 rounded-xl font-bold hover:bg-amber-50 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md">
              Start Building Free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/templates" className="bg-slate-600 text-white px-10 py-4 rounded-xl font-semibold hover:bg-slate-500 transition-all duration-300">
              Browse Templates
            </Link>
          </div>
          <p className="text-slate-300 mt-8 text-sm">Takes less than 5 minutes • No subscription required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-slate-700 rounded-lg p-2">
                  <Feather className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-black text-white">Resume<span className="text-amber-500">Craft</span></span>
              </div>
              <p className="text-gray-500 leading-relaxed max-w-md">
                AI-powered resume builder trusted by job seekers worldwide. Build professional resumes in minutes, not hours.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/builder" className="hover:text-amber-400 transition-colors">Resume Builder</Link></li>
                <li><Link to="/templates" className="hover:text-amber-400 transition-colors">Templates</Link></li>
                <li><Link to="/dashboard" className="hover:text-amber-400 transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Account</h4>
              <ul className="space-y-2">
                <li><Link to="/login" className="hover:text-amber-400 transition-colors">Login</Link></li>
                <li><Link to="/register" className="hover:text-amber-400 transition-colors">Register</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} ResumeCraft. Built with ❤️ for job seekers.
            </p>
            <div className="flex gap-4 text-sm">
              <a href="#" className="hover:text-amber-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-amber-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-amber-400 transition-colors">Refund Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
