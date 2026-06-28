import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../store/auth';
import Logo from '../components/Logo';

const SLIDES = [
  { src: '/landingpage/atv.jpg',      label: 'Off-Road Adventures' },
  { src: '/landingpage/hunting.jpg',  label: 'Hunting Trips' },
  { src: '/landingpage/camping.jpg',  label: 'Camping Getaways' },
  { src: '/landingpage/drinking.jpg', label: 'Bar Crawls' },
  { src: '/landingpage/slots.jpg',    label: 'Vegas Runs' },
  { src: '/landingpage/car.jpg',      label: 'Road Trips' },
];

// 3 Ken Burns variants cycled across slides (defined in <style> below)
const KB_ANIMATIONS = ['kb0', 'kb1', 'kb2'];

const FEATURES = [
  {
    emoji: '📋',
    title: 'Plan Together',
    desc: 'Create trips, coordinate activities, and keep the whole crew aligned.',
  },
  {
    emoji: '💸',
    title: 'Split Expenses',
    desc: 'Track who paid what, divide costs fairly, and settle up with one tap.',
  },
  {
    emoji: '🔍',
    title: 'Discover Activities',
    desc: 'Browse things to do near your destination and add them instantly.',
  },
];

const SLIDE_DURATION_MS = 5000;
const CROSSFADE_MS = 1200;

export default function Landing() {
  const { isAuthenticated, isInitialising } = useAuthContext();
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (!isInitialising && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isInitialising, navigate]);

  useEffect(() => {
    const id = setInterval(
      () => setCurrentIdx((i) => (i + 1) % SLIDES.length),
      SLIDE_DURATION_MS,
    );
    return () => clearInterval(id);
  }, []);

  if (isInitialising) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-950">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {/* Ken Burns keyframes — injected once */}
      <style>{`
        @keyframes kb0 {
          from { transform: scale(1.06) translate(0%, 0%); }
          to   { transform: scale(1.18) translate(-2%, -1.5%); }
        }
        @keyframes kb1 {
          from { transform: scale(1.06) translate(-1%, 0.5%); }
          to   { transform: scale(1.18) translate(2%, -1%); }
        }
        @keyframes kb2 {
          from { transform: scale(1.08) translate(1%, 1%); }
          to   { transform: scale(1.2)  translate(-1%, -1%); }
        }
      `}</style>

      <div className="min-h-screen bg-navy-950 text-gray-100">
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <header className="fixed top-0 z-20 w-full border-b border-white/5 bg-black/30 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Logo height={36} />
            <div className="flex items-center gap-3">
              <Link
                to="/signup"
                className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
              >
                Create Account
              </Link>
              <Link
                to="/login"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Sign In
              </Link>
            </div>
          </div>
        </header>

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
          {/* Slideshow */}
          {SLIDES.map(({ src }, i) => (
            <div
              key={src}
              className="absolute inset-0"
              style={{
                opacity: i === currentIdx ? 1 : 0,
                transition: `opacity ${CROSSFADE_MS}ms ease-in-out`,
              }}
            >
              {/* key change on activate forces remount → restarts KB animation */}
              <img
                key={i === currentIdx ? `${i}-active-${currentIdx}` : `${i}-idle`}
                src={src}
                alt=""
                className="h-full w-full object-cover"
                style={
                  i === currentIdx
                    ? { animation: `${KB_ANIMATIONS[i % 3]} 6s ease-in-out forwards` }
                    : undefined
                }
              />
            </div>
          ))}

          {/* Overlay — dark gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/35" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center px-6 pt-24 pb-24 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-1.5 text-xs font-medium text-gray-300 backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
              The ultimate guys trip planner
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-none tracking-tight sm:text-7xl">
              <span className="bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent">
                Epic Trips.
              </span>
              <br />
              <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-brand-500 bg-clip-text text-transparent">
                Zero Drama.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-300">
              Coordinate activities, track shared expenses, and discover what to
              do — all in one place for the boys.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/signup"
                className="rounded-xl bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-black/40 transition-colors hover:bg-brand-700"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-white/20 bg-white/10 px-8 py-3.5 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                Sign In
              </Link>
            </div>

            {/* Slide label */}
            <p className="mt-16 text-xs font-medium uppercase tracking-widest text-gray-400">
              {SLIDES[currentIdx].label}
            </p>

            {/* Dot indicators */}
            <div className="mt-3 flex items-center gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === currentIdx ? '24px' : '6px',
                    background: i === currentIdx ? 'rgb(99 102 241 / 1)' : 'rgb(255 255 255 / 0.3)',
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────────────── */}
        <section className="border-t border-navy-800 bg-navy-900 px-6 py-24">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-3 text-center text-3xl font-bold text-gray-100">
              Everything the trip needs
            </h2>
            <p className="mb-14 text-center text-gray-500">
              From first idea to last round, we've got it covered.
            </p>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="flex flex-col gap-4 rounded-2xl border border-navy-700 bg-navy-800 p-7"
                >
                  <span className="text-4xl">{f.emoji}</span>
                  <div>
                    <h3 className="mb-1 font-bold text-gray-100">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-400">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer CTA ────────────────────────────────────────────────────── */}
        <section className="border-t border-navy-800 bg-navy-950 px-6 py-20 text-center">
          <h2 className="mb-3 text-3xl font-bold text-gray-100">Ready to plan?</h2>
          <p className="mb-8 text-gray-500">
            Create your group and start planning in under a minute.
          </p>
          <Link
            to="/signup"
            className="inline-block rounded-xl bg-brand-600 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-brand-900/40 transition-colors hover:bg-brand-700"
          >
            Create Your Group
          </Link>
        </section>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <footer className="border-t border-navy-800 bg-navy-950 px-6 py-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <Logo height={28} className="opacity-50" />
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} The Boys. Make the memories.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
