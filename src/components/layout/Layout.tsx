import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import NavBar from './NavBar';
import ConstellationBackground from '../common/ConstellationBackground';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  hideNav?: boolean;
}

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function Layout({ children, title, showBack = false, hideNav = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-navy relative">
      <ConstellationBackground />
      <Header title={title} showBack={showBack} />
      <motion.main
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative z-10"
      >
        <div className="max-w-2xl mx-auto px-4 pt-20 pb-28">
          {children}
        </div>
      </motion.main>
      {!hideNav && <NavBar />}
    </div>
  );
}
