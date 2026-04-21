import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from './store';
import { usePersistence } from './hooks/usePersistence';
import { useAuth } from './context/AuthContext';
import { setNorthStarScore, setCorrelations, setInflectionPoints } from './store/slices/insightsSlice';
import { computeNorthStarScore, computeCorrelations, detectInflectionPoints } from './utils/patternAnalysis';

import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Habits from './pages/Habits';
import Goals from './pages/Goals';
import Predictions from './pages/Predictions';
import VisionBoard from './pages/VisionBoard';
import Coping from './pages/Coping';
import Insights from './pages/Insights';

function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const profile = useAppSelector((s) => s.userProfile.profile);
  if (!profile) return null;
  if (!profile.onboardingCompleted) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function AuthenticatedApp({ uid }: { uid: string }) {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const profile = useAppSelector((s) => s.userProfile.profile);
  const checkIns = useAppSelector((s) => s.dailyCheckIn.history);
  const habits = useAppSelector((s) => s.habits.habits);
  const completions = useAppSelector((s) => s.habits.completions);
  const goals = useAppSelector((s) => s.goals.goals);

  usePersistence(uid);

  useEffect(() => {
    if (checkIns.length === 0) return;
    const score = computeNorthStarScore({
      checkIns, completions, habits,
      goalCount: goals.length,
      completedGoalCount: goals.filter((g) => g.status === 'completed').length,
    });
    dispatch(setNorthStarScore(score));
    dispatch(setCorrelations(computeCorrelations(checkIns, completions, habits)));
    dispatch(setInflectionPoints(detectInflectionPoints(checkIns, completions, habits)));
  }, [checkIns, completions, habits, goals, dispatch]);

  if (!profile) return null;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/" element={<RequireOnboarding><Home /></RequireOnboarding>} />
        <Route path="/habits" element={<RequireOnboarding><Habits /></RequireOnboarding>} />
        <Route path="/goals" element={<RequireOnboarding><Goals /></RequireOnboarding>} />
        <Route path="/predictions" element={<RequireOnboarding><Predictions /></RequireOnboarding>} />
        <Route path="/vision" element={<RequireOnboarding><VisionBoard /></RequireOnboarding>} />
        <Route path="/coping" element={<RequireOnboarding><Coping /></RequireOnboarding>} />
        <Route path="/insights" element={<RequireOnboarding><Insights /></RequireOnboarding>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="*" element={<Auth />} />
        </Routes>
      </AnimatePresence>
    );
  }

  return <AuthenticatedApp uid={user.uid} />;
}
