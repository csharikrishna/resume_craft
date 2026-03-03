import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Feather, LayoutDashboard, LogOut, LogIn, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-md bg-opacity-95 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-slate-700 rounded-xl p-2 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
              <Feather className="h-5 w-5 text-white" />
            </div>
            <span className="font-black text-xl text-gray-900 tracking-tight">
              Resume<span className="text-amber-600">Craft</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/templates" className="text-gray-700 hover:text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-slate-50">
              Templates
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all hover:bg-slate-50">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <Link to="/builder" className="bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 hover:shadow-lg transition-all duration-300 ml-2 shadow-md">
                  + New Resume
                </Link>
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all hover:bg-red-50 ml-2">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all hover:bg-slate-50">
                  <LogIn className="h-4 w-4" /> Login
                </Link>
                <Link to="/register" className="bg-slate-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 hover:shadow-lg transition-all duration-300 ml-2 shadow-md">
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2 shadow-lg">
          <Link to="/templates" className="block text-gray-700 hover:bg-slate-50 hover:text-slate-700 text-sm font-semibold py-2.5 px-3 rounded-lg transition-all" onClick={() => setMenuOpen(false)}>
            Templates
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="block text-gray-700 hover:bg-slate-50 hover:text-slate-700 text-sm font-semibold py-2.5 px-3 rounded-lg transition-all" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/builder" className="block bg-slate-700 text-white px-4 py-3 rounded-xl text-sm text-center font-bold shadow-md hover:bg-slate-800" onClick={() => setMenuOpen(false)}>
                + New Resume
              </Link>
              <button onClick={handleLogout} className="block text-red-500 hover:bg-red-50 text-sm font-semibold py-2.5 px-3 rounded-lg w-full text-left transition-all">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-gray-700 hover:bg-slate-50 hover:text-slate-700 text-sm font-semibold py-2.5 px-3 rounded-lg transition-all" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="block bg-slate-700 text-white px-4 py-3 rounded-xl text-sm text-center font-bold shadow-md hover:bg-slate-800" onClick={() => setMenuOpen(false)}>
                Get Started Free
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
