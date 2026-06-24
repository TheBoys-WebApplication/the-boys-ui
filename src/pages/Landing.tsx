import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../store/auth';
import Logo from '../components/Logo';

const ACTIVITIES = [
  { emoji: '🎯', label: 'Shooting Ranges', desc: 'Lock and load' },
  { emoji: '🎣', label: 'Fishing', desc: 'Early mornings, cold beers' },
  { emoji: '🏹', label: 'Hunting', desc: 'Into the wild' },
  { emoji: '🍺', label: 'Bar Crawls', desc: 'Hit every spot in town' },
  { emoji: '🍽️', label: 'Fine Dining', desc: 'Steaks and celebrations' },
  { emoji: '🎲', label: 'Vegas', desc: "What happens here..." },
];

const FEATURES = [
  {
    emoji: '📋',
    title: 'Plan Together',
    desc: 'Create trips, vote on activities, and keep everyone on the same page.',
  },
  {
    emoji: '💸',
    title: 'Split Expenses',
    desc: 'Track who paid what, divide costs fairly, and settle up instantly.',
  },
  {
    emoji: '🔍',
    title: 'Discover Activities',
    desc: 'Browse things to do near your destination and add them to the trip.',
  },
];

export default function Landing() {
  const { isAuthenticated, isInitialising } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitialising && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isInitialising, navigate]);

  if (isInitialising) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-950">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 text-gray-100">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 z-20 w-full border-b border-navy-700/40 bg-navy-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo height={36} />
          <div className="flex items-center gap-3">
            <Link
              to="/signup"
              className="text-sm font-medium text-gray-400 hover:text-gray-100 transition-colors"
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

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16 text-center">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[40%] h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/8 blur-[140px]" />
          <div className="absolute left-1/4 top-1/4 h-[300px] w-[300px] rounded-full bg-brand-800/10 blur-[100px]" />
          <div className="absolute right-1/4 bottom-1/4 h-[300px] w-[300px] rounded-full bg-brand-900/10 blur-[100px]" />
        </div>

        <div className="relative max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-navy-600 bg-navy-800/60 px-4 py-1.5 text-xs font-medium text-gray-400 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            The ultimate guys trip planner
          </div>

          <h1 className="text-5xl font-black leading-none tracking-tight sm:text-7xl">
            <span className="bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent">
              Epic Trips.
            </span>
            <br />
            <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 bg-clip-text text-transparent">
              Zero Drama.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-400">
            Coordinate activities, track shared expenses, and discover things to
            do — all in one place for the boys.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/signup"
              className="rounded-xl bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-900/40 transition-colors hover:bg-brand-700"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-navy-600 bg-navy-800/80 px-8 py-3.5 text-base font-semibold text-gray-200 backdrop-blur transition-colors hover:border-navy-500 hover:bg-navy-700"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* ── Activity grid ─────────────────────────────────────────────────── */}
        <div className="relative mt-20 grid w-full max-w-2xl grid-cols-3 gap-3 sm:gap-4">
          {ACTIVITIES.map((a) => (
            <div
              key={a.label}
              className="flex flex-col items-center gap-2 rounded-2xl border border-navy-700/50 bg-navy-800/40 p-5 backdrop-blur-sm transition-all hover:border-brand-600/40 hover:bg-navy-800/70 sm:p-6"
            >
              <span className="text-4xl sm:text-5xl">{a.emoji}</span>
              <span className="text-center text-sm font-semibold text-gray-100 sm:text-base">
                {a.label}
              </span>
              <span className="text-center text-xs text-gray-500">{a.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
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

      {/* ── Footer CTA ──────────────────────────────────────────────────────── */}
      <section className="border-t border-navy-800 bg-navy-950 px-6 py-20 text-center">
        <h2 className="mb-3 text-3xl font-bold text-gray-100">Ready to plan?</h2>
        <p className="mb-8 text-gray-500">Create your group and start planning in under a minute.</p>
        <Link
          to="/signup"
          className="inline-block rounded-xl bg-brand-600 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-brand-900/40 transition-colors hover:bg-brand-700"
        >
          Create Your Group
        </Link>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-navy-800 bg-navy-950 px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Logo height={28} className="opacity-50" />
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} The Boys. Make the memories.
          </p>
        </div>
      </footer>
    </div>
  );
}
