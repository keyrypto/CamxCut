import {
  Info,
  Heart,
  Code,
  Users,
  ArrowLeft,
  Crown,
  Send,
  Sparkles,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  Target,
  Lock,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { useRouter } from '../router';
import SEO from './SEO';

const differentiators = [
  {
    icon: Heart,
    title: 'Free forever',
    description: 'No subscriptions, no watermarks, and no hidden fees — ever.',
  },
  {
    icon: Code,
    title: 'No signup required',
    description: 'Open the editor and start creating immediately. Zero friction.',
  },
  {
    icon: Users,
    title: 'Built for creators',
    description: 'Every feature is tuned for short-form content that hooks viewers.',
  },
];

const principles = [
  {
    icon: Lock,
    title: 'Private by default',
    description: 'Videos are processed locally in your browser. Your files never leave your device.',
  },
  {
    icon: Zap,
    title: 'Fast by design',
    description: 'Pick, trim, style, and export in seconds — no waiting on cloud servers.',
  },
  {
    icon: Globe,
    title: 'Works everywhere',
    description: 'A installable PWA that runs in any modern browser, on desktop or mobile.',
  },
  {
    icon: Shield,
    title: 'No lock-in',
    description: 'Export your clips in standard formats and post anywhere you want.',
  },
];

const highlights = [
  'Frame-accurate trimming for tight 3–6 second hooks',
  'Six bold text styles built for Shorts, Reels, and TikTok',
  'Real-time preview with instant in-browser rendering',
  'Local export — no watermarks, no uploads required',
];

export default function About() {
  const { navigate } = useRouter();

  return (
    <>
      <SEO
        title="About - CamCut | camcut.fun"
        description="Learn about CamCut, the free short-form video editor for creating viral clips in seconds."
        keywords="about camcut, video editor, short-form video creator"
        url="https://camcut.fun/about"
      />

      <div className="min-h-screen bg-primary">
        {/* Hero */}
        <section className="relative pt-16 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20 overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(800px,100%)] h-64 bg-[var(--accent-main)] opacity-[0.06] blur-3xl rounded-full" />
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-tertiary opacity-40 blur-3xl rounded-full" />
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-secondary hover:text-primary mb-8 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Back to home</span>
            </button>

            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-secondary border border-theme rounded-full px-3 py-1.5 text-sm font-medium text-primary shadow-theme-sm mb-5">
                <Info className="w-4 h-4 text-[var(--accent-main)]" />
                <span>About CamCut</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-primary font-outfit mb-5 leading-[1.1]">
                Making video editing{' '}
                <span className="text-[var(--accent-main)]">simple</span>{' '}
                for everyone
              </h1>

              <p className="text-base sm:text-lg text-secondary leading-relaxed mb-6 max-w-2xl">
                CamCut is a free, browser-based video editor designed for creators who want to
                make viral short-form content quickly — without signups, installs, or watermarks.
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-secondary">
                {[
                  'Free & open to use',
                  'No account needed',
                  'Local-first privacy',
                ].map((item, idx) => (
                  <span key={item} className="flex items-center gap-1.5">
                    {idx > 0 && (
                      <span className="hidden sm:inline text-tertiary opacity-50 mr-2">·</span>
                    )}
                    <CheckCircle2 className="w-4 h-4 text-[var(--accent-main)] flex-shrink-0" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-10 sm:py-14 border-t border-theme bg-secondary">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-tertiary border border-theme text-primary px-2.5 py-1.5 rounded-md text-xs font-medium mb-4">
                  <Target className="w-3.5 h-3.5 text-[var(--accent-main)]" />
                  <span>Our mission</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-primary font-outfit mb-4">
                  Short-form video shouldn&apos;t require a production studio
                </h2>
                <p className="text-secondary text-sm sm:text-base leading-relaxed mb-4">
                  Most built-in tools weren&apos;t made for creators shipping daily content. CamCut
                  fills that gap — a focused editor that does one thing exceptionally well: turn
                  raw footage into scroll-stopping clips in seconds.
                </p>
                <p className="text-secondary text-sm sm:text-base leading-relaxed">
                  We believe great tools should be accessible, respect your privacy, and get out of
                  your way so you can focus on creating.
                </p>
              </div>

              <div className="rounded-2xl border border-theme bg-primary p-6 sm:p-8 shadow-theme-md">
                <h3 className="text-sm font-semibold text-tertiary uppercase tracking-wider mb-4">
                  What you can do
                </h3>
                <ul className="space-y-3">
                  {highlights.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-secondary">
                      <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-tertiary border border-theme">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent-main)]" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Differentiators */}
        <section className="py-10 sm:py-14 border-t border-theme bg-primary">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-xl sm:text-2xl font-black text-primary font-outfit mb-2">
                What makes us different
              </h2>
              <p className="text-secondary text-sm sm:text-base max-w-xl mx-auto">
                CamCut is built on a simple promise: powerful editing without the usual barriers.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
              {differentiators.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-theme bg-secondary p-5 sm:p-6 shadow-theme-sm hover:shadow-theme-md hover:border-[var(--accent-main)]/30 transition-all duration-200"
                  >
                    <div className="w-11 h-11 rounded-xl bg-tertiary border border-theme flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 text-[var(--accent-main)]" />
                    </div>
                    <h3 className="text-base font-bold text-primary font-outfit mb-2">
                      {item.title}
                    </h3>
                    <p className="text-secondary text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
 

        {/* Creator */}
        <section className="py-10 sm:py-14 border-t border-theme bg-primary">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-xl sm:text-2xl font-black text-primary font-outfit mb-2">
                Meet the Guy Who Created This
              </h2> 
            </div>

            <div className="relative max-w-4xl mx-auto">
              <div
                aria-hidden
                className="absolute -inset-1 bg-gradient-to-br from-[var(--accent-main)]/10 via-transparent to-tertiary/30 rounded-3xl blur-xl opacity-70"
              />

              <div className="relative rounded-2xl sm:rounded-3xl border border-theme bg-secondary overflow-hidden shadow-theme-lg">
                <div className="h-1.5 bg-gradient-to-r from-[var(--accent-main)] via-[var(--accent-main)]/60 to-transparent" />

                <div className="p-6 sm:p-8 lg:p-10">
                  <div className="grid lg:grid-cols-5 gap-8 lg:gap-10 items-center">
                    <div className="lg:col-span-2 text-center lg:text-left">
                      <div className="relative inline-block mb-5">
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-[var(--accent-main)] to-[var(--accent-main)]/40 blur-sm opacity-60" />
                        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full mx-auto lg:mx-0 bg-gradient-to-br from-[var(--accent-main)] to-secondary flex items-center justify-center shadow-theme-md border-2 border-theme overflow-hidden">
                          <img
                            src="/dev/alihd.jpg"
                            className="w-full h-full object-cover"
                            alt="Ali HD (Ali Heydari) - Founder of CamCut"
                            title="Ali HD (Ali Heydari) - CEO"
                            loading="lazy"
                          />
                        </div>
                      </div>

                      <h3 className="text-2xl font-black text-primary font-outfit mb-1">
                        Ali HD
                      </h3>
                      <p className="text-[var(--accent-main)] text-sm font-semibold mb-1">
                        Creator By Day , Zorro By Night
                      </p>
                      <p className="text-secondary text-sm mb-5">
                        Building tools that personally would actually want to use.
                      </p>

                      <div className="flex flex-wrap justify-center lg:justify-start gap-2.5">
                        <a
                          href="https://t.me/lifelongcoder"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-theme bg-primary px-4 py-2.5 text-sm font-semibold text-primary shadow-theme-sm hover:shadow-theme-md hover:border-[var(--accent-main)]/40 transition-all"
                        >
                          <Send className="w-4 h-4 text-[var(--accent-main)]" />
                          Telegram
                        </a>
                        <a
                          href="https://alihd.ir"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-theme bg-primary px-4 py-2.5 text-sm font-semibold text-primary shadow-theme-sm hover:shadow-theme-md hover:border-[var(--accent-main)]/40 transition-all"
                        >
                          <Crown className="w-4 h-4 text-[var(--accent-main)]" />
                          My Website
                        </a>
                      </div>
                    </div>

                    <div className="lg:col-span-3">
                      <div className="rounded-xl border border-theme bg-primary p-5 sm:p-6">
                        <h4 className="text-base sm:text-lg font-bold text-primary font-outfit mb-3 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-[var(--accent-main)]" />
                          About the creator
                        </h4>
                        <p className="text-secondary text-sm sm:text-base leading-relaxed mb-4">
                          Created This Thing Because After Installing Windows 10 , I Could not even trim a short clip with microsoft and their monopoly :)
                        </p> 
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-10 sm:py-14 border-t border-theme bg-secondary pb-safe">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-2xl border border-theme bg-primary px-6 sm:px-10 py-8 sm:py-10 text-center shadow-theme-md overflow-hidden">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--accent-main)]/[0.04] to-transparent"
              />

              <div className="relative">
                <h2 className="text-xl sm:text-2xl font-black font-outfit mb-2 text-primary">
                  Ready to create?
                </h2>
                <p className="text-secondary text-sm sm:text-base mb-7 max-w-lg mx-auto">
                  Start making viral clips in seconds. No signup, no watermarks — just open the
                  editor and go.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => navigate('/studio')}
                    className="group inline-flex items-center gap-2 text-[var(--accent-contrast)] px-5 py-2.5 rounded-xl font-semibold bg-[var(--accent-main)] hover:opacity-95 shadow-theme-md transition-all duration-200 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] focus-visible:ring-offset-2"
                  >
                    <span>Open editor</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-primary border border-theme bg-secondary hover:bg-tertiary shadow-theme-sm transition-all duration-200 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)] focus-visible:ring-offset-2"
                  >
                    Back to home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
