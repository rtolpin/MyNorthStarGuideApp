import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NorthStarLogo from '../common/NorthStarLogo';
import { useAppSelector } from '../../store';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

export default function Header({ title, showBack = false }: HeaderProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const profile = useAppSelector((s) => s.userProfile.profile);
  const northStarScore = useAppSelector((s) => s.insights.northStarScore);

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      <div className="max-w-2xl mx-auto">
        <div className="bg-navy-dark/90 backdrop-blur-md border-b border-gold/10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              {showBack ? (
                <button
                  onClick={() => navigate(-1)}
                  className="text-starlight/50 hover:text-gold transition-colors"
                  aria-label="Go back"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              ) : (
                <NorthStarLogo size={28} />
              )}
              <div>
                {title ? (
                  <h1 className="font-heading text-lg text-cream leading-none">{title}</h1>
                ) : (
                  <div>
                    <h1 className="font-heading text-lg text-cream leading-none">MyNorthStarGuide</h1>
                    <p className="text-xs text-starlight/30 leading-none mt-0.5">Always pointing you toward your best life.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {northStarScore > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5 bg-gold/10 border border-gold/20 rounded-full px-3 py-1"
                >
                  <svg className="w-3.5 h-3.5 text-gold" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
                  </svg>
                  <span className="text-gold text-xs font-semibold">{northStarScore}</span>
                </motion.div>
              )}
              <button
                onClick={() => navigate('/settings')}
                className="w-8 h-8 rounded-full bg-navy-light border border-gold/15 flex items-center justify-center text-starlight/50 hover:text-gold hover:border-gold/30 transition-colors"
                aria-label="Settings"
              >
                {profile?.avatar ? (
                  <span className="text-sm">{profile.avatar}</span>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => signOut()}
                className="w-8 h-8 rounded-full bg-navy-light border border-gold/15 flex items-center justify-center text-starlight/50 hover:text-red-400 hover:border-red-400/30 transition-colors"
                aria-label="Sign out"
                title="Sign out"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
