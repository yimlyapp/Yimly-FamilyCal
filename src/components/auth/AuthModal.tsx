import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Lock, Mail, User, Users, Heart, ArrowRight, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  const [familyName, setFamilyName] = useState('Hort Family');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthday, setBirthday] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        if (!familyName.trim() || !name.trim()) {
          throw new Error('Family name and your name are required.');
        }
        await register({
          familyName: familyName.trim(),
          name: name.trim(),
          email: email.trim(),
          password,
          birthday: birthday || undefined,
        });
      } else {
        await login(email.trim(), password);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0D13]/95 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md bg-[#121620] border border-[#242C3D] rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#1A202C] border border-[#242C3D] flex items-center justify-center mb-3 shadow-lg shadow-[#FF4FA3]/15">
            <div className="relative">
              <Calendar className="w-7 h-7 text-[#FF4FA3]" />
              <Heart className="w-3.5 h-3.5 text-white fill-white absolute -bottom-1 -right-1" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-serif">
            Yimly FamilyCal
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">
            {isRegisterMode
              ? 'Set up your self-hosted household calendar and organizer.'
              : 'Sign in to access your family schedules and tasks.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisterMode && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#FF4FA3]" /> Household Name *
                </label>
                <input
                  id="auth-family-name"
                  type="text"
                  required
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="e.g. Hort Family"
                  className="w-full bg-[#1A202C] border border-[#242C3D] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF4FA3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#FF4FA3]" /> Your Name (Admin) *
                </label>
                <input
                  id="auth-user-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Robin"
                  className="w-full bg-[#1A202C] border border-[#242C3D] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF4FA3]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-[#FF4FA3]" /> Email Address *
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="family@example.com"
              className="w-full bg-[#1A202C] border border-[#242C3D] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF4FA3]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-[#FF4FA3]" /> Password *
            </label>
            <input
              id="auth-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#1A202C] border border-[#242C3D] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF4FA3]"
            />
          </div>

          {isRegisterMode && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Your Birthday (Optional)
              </label>
              <input
                id="auth-birthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full bg-[#1A202C] border border-[#242C3D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#FF4FA3]"
              />
            </div>
          )}

          <button
            type="submit"
            id="auth-submit-btn"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-[#FF4FA3] hover:bg-[#e63e90] text-white text-xs font-bold transition-all shadow-lg shadow-[#FF4FA3]/25 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Processing...' : isRegisterMode ? 'Create Household' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 pt-4 border-t border-[#242C3D]/60 flex flex-col items-center gap-2.5 text-center">
          <button
            id="auth-toggle-mode-btn"
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError(null);
            }}
            className="text-xs font-semibold text-[#FF4FA3] hover:underline cursor-pointer"
          >
            {isRegisterMode
              ? 'Already have an account? Sign in here'
              : 'New to Yimly FamilyCal? Set up a new household'}
          </button>

          {!isRegisterMode && (
            <button
              type="button"
              id="fill-demo-credentials-btn"
              onClick={() => {
                setEmail('admin@yimly.local');
                setPassword('yimly123');
              }}
              className="text-[11px] text-gray-400 hover:text-white px-2.5 py-1 rounded-lg bg-[#1A202C] hover:bg-[#242C3D] border border-[#242C3D] transition-colors cursor-pointer"
            >
              Autofill Sample Family Admin (admin@yimly.local)
            </button>
          )}
        </div>

        {/* Self-hosted privacy badge */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Self-Hosted & Private SQLite Database</span>
        </div>
      </div>
    </div>
  );
};
