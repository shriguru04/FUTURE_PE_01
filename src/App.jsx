import { lazy, Suspense, useEffect, useRef } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { WorkspaceProvider } from './context/WorkspaceContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import { PageFallback } from './components/Skeleton.jsx';

const Home = lazy(() => import('./pages/Home.jsx'));
const Generator = lazy(() => import('./pages/Generator.jsx'));
const Templates = lazy(() => import('./pages/Templates.jsx'));
const Features = lazy(() => import('./pages/Features.jsx'));
const HowItWorks = lazy(() => import('./pages/HowItWorks.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

// On route change: scroll to top and move focus to <main> so keyboard and screen-reader users land on the new page.
function RouteEffects({ mainRef }) {
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    window.scrollTo(0, 0);
    if (first.current) { first.current = false; return; }
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname, mainRef]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <Suspense fallback={<PageFallback />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/generator" element={<Generator />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/features" element={<Features />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const mainRef = useRef(null);
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <ToastProvider>
          <WorkspaceProvider>
            <BrowserRouter>
              <RouteEffects mainRef={mainRef} />
              <a href="#main" className="sr-only z-[80] rounded-control bg-surface px-4 py-3 font-semibold shadow-lift focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
              <Navbar />
              <main id="main" ref={mainRef} tabIndex={-1} className="min-h-[70vh] outline-none">
                <AnimatedRoutes />
              </main>
              <Footer />
            </BrowserRouter>
          </WorkspaceProvider>
        </ToastProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
