"use client";

/**
 * Verun Protocol — Landing Page v2
 * Design system: "Electric Onyx" (warm-black + electric violet + lime accents)
 * All styles in app/globals.css.
 */

import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  animate,
  AnimatePresence,
  type Variants,
  type MotionValue,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  type ReactNode,
} from "react";

/* ────────────────────────────────────────────────────────────
 * BRAND TOKENS (also in globals.css — kept here for inline JSX)
 * ──────────────────────────────────────────────────────────── */
const C = {
  bg: "#0A0A0F",
  surface: "#16141E",
  surface2: "#1F1B2C",
  border: "rgba(255,255,255,0.08)",
  text: "#F5F4F0",
  text2: "#B6B0C2",
  text3: "#6B6478",
  violet: "#9F6DFF",
  violetBright: "#C4A5FF",
  violetSoft: "rgba(159,109,255,0.18)",
  violetGlow: "rgba(159,109,255,0.45)",
  lime: "#D9F771",
  limeBright: "#E8FF8C",
  rose: "#FF6B9D",
  orange: "#FF8351",
  red: "#FF5470",
};

/* ────────────────────────────────────────────────────────────
 * CURSOR CONTEXT — page-wide mouse tracking for parallax/glow
 * ──────────────────────────────────────────────────────────── */
type CursorCtx = { x: MotionValue<number>; y: MotionValue<number> };
const CursorContext = createContext<CursorCtx | null>(null);

function CursorProvider({ children }: { children: ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [x, y]);
  return (
    <CursorContext.Provider value={{ x, y }}>{children}</CursorContext.Provider>
  );
}

function useCursor() {
  return useContext(CursorContext);
}

/* ────────────────────────────────────────────────────────────
 * MAGNETIC BUTTON — subtle pull toward cursor on hover
 * ──────────────────────────────────────────────────────────── */
function Magnetic({
  children,
  strength = 0.3,
  className,
  ...rest
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
  [k: string]: unknown;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 220, damping: 20 });
  const y = useSpring(0, { stiffness: 220, damping: 20 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x, y, display: "inline-flex" }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
 * NAV — shrinks on scroll
 * ──────────────────────────────────────────────────────────── */
function Nav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const unsub = scrollY.on("change", (v) => setScrolled(v > 24));
    return () => unsub();
  }, [scrollY]);

  return (
    <motion.nav
      className={`v-nav ${scrolled ? "v-nav-scrolled" : ""}`}
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <a href="#" className="v-logo">
        <span className="v-logo-mark">V</span>
        <span className="v-logo-word">VERUN</span>
        <span className="v-logo-tag">PROTOCOL</span>
      </a>
      <div className="v-nav-links">
        <a href="#modes">Modes</a>
        <a href="#architecture">Architecture</a>
        <a href="#compliance">Compliance</a>
        <a href="#team">Team</a>
        <a href="/docs.html">Docs</a>
      </div>
      <LiveBadge />
    </motion.nav>
  );
}

function LiveBadge() {
  return (
    <div className="v-live-badge">
      <span className="v-live-dot" />
      <span>Algorand Testnet · Live</span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * HERO
 * ──────────────────────────────────────────────────────────── */
function Hero() {
  /* cursor-driven parallax */
  const cur = useCursor();
  const sectionRef = useRef<HTMLElement>(null);

  /* normalize cursor relative to hero center for parallax */
  const px = useSpring(0, { stiffness: 60, damping: 18 });
  const py = useSpring(0, { stiffness: 60, damping: 18 });

  useEffect(() => {
    if (!cur) return;
    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      px.set((cur.x.get() - cx) / rect.width);
      py.set((cur.y.get() - cy) / rect.height);
    };
    const unsubX = cur.x.on("change", update);
    const unsubY = cur.y.on("change", update);
    return () => {
      unsubX();
      unsubY();
    };
  }, [cur, px, py]);

  /* spotlight glow follows cursor */
  const glowX = useTransform(px, (v) => 50 + v * 30);
  const glowY = useTransform(py, (v) => 50 + v * 30);
  const glowBg = useTransform(
    [glowX, glowY] as unknown as MotionValue<number>[],
    (latest: unknown) => {
      const [gx, gy] = latest as [number, number];
      return `radial-gradient(ellipse 60% 50% at ${gx}% ${gy}%, ${C.violetSoft} 0%, transparent 60%)`;
    }
  );

  /* signature parallax — small tilt */
  const sigX = useTransform(px, [-0.5, 0.5], [-14, 14]);
  const sigY = useTransform(py, [-0.5, 0.5], [-10, 10]);

  /* headline reveal — split into words */
  const line1 = ["The", "Trust", "Layer"];
  const line2 = ["for", "Agentic", "Finance"];

  return (
    <header ref={sectionRef} className="v-hero">
      <motion.div className="v-hero-glow" style={{ background: glowBg }} aria-hidden />
      <div className="v-hero-grid" aria-hidden />
      <div className="v-hero-noise" aria-hidden />

      <LiveTicker />

      <div className="v-hero-inner v-container">
        <motion.div
          className="v-eyebrow"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="v-eyebrow-pulse" />
          The EU-Aligned Agent Trust Layer
        </motion.div>

        <h1 className="v-h1">
          <div className="v-h1-line">
            {line1.map((w, i) => (
              <motion.span
                key={w}
                className={i === 0 ? "v-h1-thin" : "v-h1-bold"}
                initial={{ y: "120%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.85,
                  delay: 0.25 + i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {w}
              </motion.span>
            ))}
          </div>
          <div className="v-h1-line">
            {line2.map((w, i) => (
              <motion.span
                key={w}
                className={w === "for" ? "v-h1-thin" : "v-h1-grad"}
                initial={{ y: "120%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.85,
                  delay: 0.45 + i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {w}
              </motion.span>
            ))}
          </div>
        </h1>

        <motion.p
          className="v-hero-sub"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.85 }}
        >
          Make your AI agent <strong>regulatory-ready</strong>. Plug into
          Europe&rsquo;s regulated finance rails.
        </motion.p>

        <TrustSignals />

        <motion.div
          className="v-hero-stage"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="v-hero-sig"
            style={{ x: sigX, y: sigY }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <SignatureMark />
          </motion.div>
        </motion.div>

        <motion.div
          className="v-hero-stats"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1, delayChildren: 2.4 } },
          }}
        >
          <StatCell value="5" unit="endpoints" label="Live on testnet" />
          <StatCell value="820" unit="/ 1000" label="Reference score" />
          <StatCell value="3.9" unit="s" label="Anchor finality" />
          <StatCell value="2-of-3" unit="" label="Consensus threshold" />
        </motion.div>

        <motion.div
          className="v-hero-cta"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.8 }}
        >
          <Magnetic>
            <a href="/docs.html" className="v-btn v-btn-primary">
              Read the Docs <Arrow />
            </a>
          </Magnetic>
          <Magnetic>
            <a
              href="https://github.com/Fahad00674/verun-algorand-mvp"
              className="v-btn v-btn-ghost"
              target="_blank"
              rel="noopener"
            >
              GitHub <ExternalIcon />
            </a>
          </Magnetic>
        </motion.div>

        <motion.div
          className="v-scroll-cue"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.3, duration: 0.8 }}
        >
          <span>Scroll</span>
          <motion.div
            className="v-scroll-line"
            animate={{ scaleY: [0.2, 1, 0.2] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </header>
  );
}

/* ────────────────────────────────────────────────────────────
 * SIGNATURE MARK — trust constellation
 * Central animated arc + 3 orbiting validator nodes + particle streams
 * ──────────────────────────────────────────────────────────── */
function SignatureMark() {
  const SIZE = 520;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const ARC_R = 168;
  const ORBIT_R = 234;
  const STROKE = 14;
  const ARC_DEG = 270;
  const START_DEG = 135;

  const score = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const firedRef = useRef(false);

  const arcLen = (Math.PI * 2 * ARC_R * ARC_DEG) / 360;
  const dashOffset = useTransform(score, [0, 1000], [arcLen, 0]);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    let cancelled = false;
    let breatheTimer: ReturnType<typeof setTimeout> | null = null;
    let breatheCtrl: { stop: () => void } | null = null;

    score.set(0);
    setDisplay(0);

    const onUpdate = (v: number) => setDisplay(Math.round(v));

    console.log("score sweep started", Date.now());
    const sweep = animate(score, 820, {
      duration: 3.5,
      delay: 0.4,
      ease: [0.33, 1, 0.68, 1],
      onUpdate,
      onComplete: () => {
        if (cancelled) return;
        console.log("score sweep complete", 820);
        const breathe = () => {
          if (cancelled) return;
          const offsets = [-2, -1, 1, 2];
          const target = 820 + offsets[Math.floor(Math.random() * offsets.length)];
          breatheCtrl = animate(score, target, {
            duration: 0.6,
            ease: "easeInOut",
            onUpdate,
            onComplete: () => {
              if (cancelled) return;
              breatheCtrl = animate(score, 820, {
                duration: 0.6,
                ease: "easeInOut",
                onUpdate,
                onComplete: () => {
                  if (cancelled) return;
                  breatheTimer = setTimeout(breathe, 5000);
                },
              });
            },
          });
        };
        breatheTimer = setTimeout(breathe, 5000);
      },
    });

    return () => {
      cancelled = true;
      sweep.stop();
      breatheCtrl?.stop();
      if (breatheTimer) clearTimeout(breatheTimer);
      firedRef.current = false;
    };
  }, [inView, score]);

  /* arc geometry */
  const polar = (deg: number, r: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
  };
  const start = polar(START_DEG, ARC_R);
  const end = polar(START_DEG + ARC_DEG, ARC_R);
  const arcPath = `M ${start.x} ${start.y} A ${ARC_R} ${ARC_R} 0 1 1 ${end.x} ${end.y}`;

  /* validator orbit positions (3 nodes evenly distributed on outer ring) */
  const validators = [
    { angle: 215, label: "BCP", color: C.violet },
    { angle: 305, label: "TKF", color: C.lime },
    { angle: 35, label: "TST", color: C.rose },
  ];

  const tier = display >= 700 ? "VERIFIED" : display >= 500 ? "TRUSTED" : display >= 300 ? "WATCH" : "—";
  const tierColor = display >= 700 ? C.lime : display >= 500 ? C.violet : C.orange;

  return (
    <div ref={ref} className="v-sig">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <defs>
          <linearGradient id="arc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={C.rose} />
            <stop offset="40%" stopColor={C.violet} />
            <stop offset="80%" stopColor={C.violetBright} />
            <stop offset="100%" stopColor={C.lime} />
          </linearGradient>
          <radialGradient id="core-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={C.violetGlow} />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <filter id="bloom" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* background bloom */}
        <circle cx={CX} cy={CY} r={ARC_R * 1.4} fill="url(#core-grad)" />

        {/* dashed outer orbit */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={ORBIT_R}
          fill="none"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="1"
          strokeDasharray="2 6"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        />

        {/* particle streams (validator → core) */}
        {validators.map((v, i) => {
          const from = polar(v.angle, ORBIT_R);
          return (
            <motion.line
              key={`stream-${i}`}
              x1={from.x}
              y1={from.y}
              x2={CX}
              y2={CY}
              stroke={v.color}
              strokeWidth="1"
              strokeDasharray="2 8"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0], strokeDashoffset: [0, -40] }}
              transition={{
                duration: 2.6,
                delay: 1.2 + i * 0.4,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          );
        })}

        {/* arc track */}
        <path
          d={arcPath}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={STROKE}
          strokeLinecap="round"
        />

        {/* arc fill */}
        <motion.path
          d={arcPath}
          fill="none"
          stroke="url(#arc-grad)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={arcLen}
          style={{ strokeDashoffset: dashOffset, filter: "url(#bloom)" }}
        />

        {/* tick marks */}
        {[0, 250, 500, 750, 1000].map((tick) => {
          const deg = START_DEG + (ARC_DEG * tick) / 1000;
          const inner = polar(deg, ARC_R - STROKE);
          const outer = polar(deg, ARC_R + STROKE / 2 + 6);
          return (
            <line
              key={tick}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1"
            />
          );
        })}

        {/* validator nodes */}
        {validators.map((v, i) => {
          const p = polar(v.angle, ORBIT_R);
          return (
            <motion.g
              key={v.label}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.4 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: `${p.x}px ${p.y}px` }}
            >
              <motion.circle
                cx={p.x}
                cy={p.y}
                r={26}
                fill={v.color}
                fillOpacity={0.16}
                stroke={v.color}
                strokeWidth="1.5"
                animate={{ r: [26, 32, 26], fillOpacity: [0.16, 0.3, 0.16] }}
                transition={{ duration: 3, delay: 1.6 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <circle cx={p.x} cy={p.y} r="6" fill={v.color} />
              <text
                x={p.x}
                y={p.y + 48}
                textAnchor="middle"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="600"
                letterSpacing="2"
                fill={v.color}
              >
                {v.label}
              </text>
            </motion.g>
          );
        })}
      </svg>

      <div className="v-sig-center">
        <motion.span className="v-sig-num">{display}</motion.span>
        <div className="v-sig-tier" style={{ color: tierColor }}>
          {tier}
        </div>
        <div className="v-sig-scale">/ 1000 · trust score</div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * LIVE TICKER — top of hero, animated counters
 * ──────────────────────────────────────────────────────────── */
function LiveTicker() {
  const [evals, setEvals] = useState(1247);
  const [lastAnchor, setLastAnchor] = useState(2);
  useEffect(() => {
    const a = setInterval(() => setEvals((v) => v + Math.floor(Math.random() * 3)), 2500);
    const b = setInterval(() => setLastAnchor((v) => (v >= 8 ? 1 : v + 1)), 1100);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, []);
  return (
    <motion.div
      className="v-ticker"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <div className="v-ticker-item">
        <span className="v-ticker-dot" />
        <span className="v-ticker-key">EVALS</span>
        <span className="v-ticker-val">{evals.toLocaleString()}</span>
      </div>
      <span className="v-ticker-sep">·</span>
      <div className="v-ticker-item">
        <span className="v-ticker-key">LAST ANCHOR</span>
        <span className="v-ticker-val">{lastAnchor}s ago</span>
      </div>
      <span className="v-ticker-sep">·</span>
      <div className="v-ticker-item">
        <span className="v-ticker-key">VALIDATORS</span>
        <span className="v-ticker-val">3 / 3 online</span>
      </div>
    </motion.div>
  );
}

function StatCell({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <motion.div
      className="v-stat"
      variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="v-stat-top">
        <span className="v-stat-num">{value}</span>
        {unit && <span className="v-stat-unit">{unit}</span>}
      </div>
      <div className="v-stat-label">{label}</div>
    </motion.div>
  );
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 7h8m-3-3 3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M4 2h6v6M10 2 4 8M3 6v4h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
 * TRUST SIGNALS — three-card row immediately under the hero
 * ──────────────────────────────────────────────────────────── */
function TrustSignals() {
  const items = [
    {
      icon: <ShieldCheckIcon />,
      title: "Agent Protection",
      desc: (
        <>
          Score-gated access. No agent transacts without crossing the trust
          threshold.
        </>
      ),
      href: "/docs.html#gates",
    },
    {
      icon: <BadgeCheckIcon />,
      title: "Trust Credential",
      desc: (
        <>
          Soulbound token issued on Algorand. Live: Asset{" "}
          <a
            href="https://testnet.algoexplorer.io/asset/759213121"
            target="_blank"
            rel="noopener"
          >
            759213121
          </a>
          .
        </>
      ),
      href: "/docs.html#sbt",
    },
    {
      icon: <ClockIcon />,
      title: "Live Audit Trail",
      desc: (
        <>
          Every verdict anchored on Algorand in ~3.9 seconds. Public +
          permanent.
        </>
      ),
      href: "/docs.html#anchor",
    },
  ];

  return (
    <section className="v-trust">
      <motion.div
        className="v-trust-row"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-15%" }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {items.map((it) => (
          <motion.a
            key={it.title}
            href={it.href}
            className="v-trust-card"
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
              },
            }}
            whileHover={{ y: -3, transition: { duration: 0.25 } }}
          >
            <div className="v-trust-icon">{it.icon}</div>
            <h3 className="v-trust-title">{it.title}</h3>
            <p className="v-trust-desc">{it.desc}</p>
            <span className="v-trust-link">Learn more →</span>
          </motion.a>
        ))}
      </motion.div>
    </section>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <path
        d="M18 4.5 7 9v6.75c0 6.75 4.5 12.4 11 14.6 6.5-2.2 11-7.85 11-14.6V9L18 4.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m12 17 4.5 4.5L24 13.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BadgeCheckIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <path
        d="M18 3.5 21.2 5.6l3.8-.4 1.6 3.5 3.5 1.6-.4 3.8L31.8 17l-2.1 3.2.4 3.8-3.5 1.6L25 28.8l-3.8-.4L18 31l-3.2-2.6-3.8.4-1.6-3.5L5.9 23.7l.4-3.8L4.2 17l2.1-3.2-.4-3.8L9.4 8.4 11 4.9l3.8.4L18 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m12.5 17.8 3.8 3.8L23.5 14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <circle cx="18" cy="18" r="13" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M18 10v8.4l5.4 3.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
 * ENDPOINTS MARQUEE — auto-scrolling strip
 * ──────────────────────────────────────────────────────────── */
function EndpointsMarquee() {
  const items = [
    { method: "GET", path: "/api/health" },
    { method: "POST", path: "/api/evaluate" },
    { method: "POST", path: "/api/mint-sbt" },
    { method: "GET", path: "/api/funding-status" },
    { method: "POST", path: "/api/score" },
    { method: "ASA", path: "759213121" },
    { method: "TX", path: "ALGO testnet · 2-of-3 consensus" },
    { method: "GET", path: "/api/validators" },
  ];
  const repeated = [...items, ...items];
  return (
    <div className="v-marquee">
      <div className="v-marquee-track">
        {repeated.map((it, i) => (
          <div key={i} className="v-marquee-item">
            <span className={`v-method v-method-${it.method.toLowerCase()}`}>
              {it.method}
            </span>
            <code>{it.path}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * SECTION HEADER
 * ──────────────────────────────────────────────────────────── */
function SectionHead({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <motion.div
      className="v-section-head"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-15%" }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
    >
      <motion.span
        className="v-section-eyebrow"
        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
      >
        {eyebrow}
      </motion.span>
      <motion.h2
        className="v-section-title"
        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
      >
        {title}
      </motion.h2>
      {sub && (
        <motion.p
          className="v-section-sub"
          variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
        >
          {sub}
        </motion.p>
      )}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
 * MODES — large interactive cards
 * ──────────────────────────────────────────────────────────── */
function Modes() {
  const modes = [
    {
      step: "01",
      title: "Discovery",
      subtitle: "Agent scans, finds, recommends.",
      copy:
        "Agent discovers tokenforge through the Bazaar registry, evaluates listed assets, and prepares a structured recommendation with provenance.",
      accent: C.violet,
      icon: <DiscoveryIcon />,
    },
    {
      step: "02",
      title: "Supervised",
      subtitle: "Human reviews, approves with a click.",
      copy:
        "Operator gets the recommendation with full evaluation trail. One signed approval moves it forward — no blind delegation, full audit trail.",
      accent: C.lime,
      icon: <SupervisedIcon />,
    },
    {
      step: "03",
      title: "Autonomous",
      subtitle: "Agent executes end-to-end.",
      copy:
        "After the first human green-light, agent runs the flow autonomously within its score envelope. Every action is anchored on Algorand.",
      accent: C.rose,
      icon: <AutonomousIcon />,
    },
  ];

  return (
    <section id="modes" className="v-section">
      <div className="v-container">
        <SectionHead
          eyebrow="OPERATING MODES"
          title={
            <>
              Discovery <ArrowSep /> Supervised <ArrowSep /> Autonomous
            </>
          }
          sub="A progressive trust ladder. Score gates determine which mode the agent qualifies for."
        />

        <motion.div
          className="v-modes"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
        >
          {modes.map((m) => (
            <motion.article
              key={m.title}
              className="v-mode"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
              }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              style={{ "--mode-accent": m.accent } as React.CSSProperties}
            >
              <div className="v-mode-step">{m.step}</div>
              <div className="v-mode-icon" style={{ color: m.accent }}>
                {m.icon}
              </div>
              <h3 className="v-mode-title">{m.title}</h3>
              <div className="v-mode-sub">{m.subtitle}</div>
              <p className="v-mode-copy">{m.copy}</p>
              <div className="v-mode-line" style={{ background: m.accent }} />
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          className="v-modes-gates"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="v-modes-gates-label">
            tokenforge Chain API · operation thresholds
          </div>
          <div className="v-modes-gates-row">
            <span className="v-modes-gate" style={{ borderColor: C.orange + "55" }}>
              <code>read</code>
              <span style={{ color: C.orange }}>≥ 300</span>
            </span>
            <span className="v-modes-gate" style={{ borderColor: C.violet + "55" }}>
              <code>transfer</code>
              <span style={{ color: C.violet }}>≥ 500</span>
            </span>
            <span className="v-modes-gate" style={{ borderColor: C.violet + "55" }}>
              <code>mint</code>
              <span style={{ color: C.violet }}>≥ 500</span>
            </span>
            <span className="v-modes-gate" style={{ borderColor: C.lime + "55" }}>
              <code>order</code>
              <span style={{ color: C.lime }}>≥ 600</span>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ArrowSep() {
  return <span className="v-arrow-sep">→</span>;
}

function DiscoveryIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="14" cy="14" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="m20.5 20.5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="14" cy="14" r="3" fill="currentColor" />
    </svg>
  );
}
function SupervisedIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 4 6 9v6c0 6 4 11 10 13 6-2 10-7 10-13V9l-10-5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m11 15 4 4 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function AutonomousIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M14 4 6 18h7l-1 10 10-14h-7l1-10Z" fill="currentColor" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
 * SCORE GATES
 * ──────────────────────────────────────────────────────────── */
function ScoreGates() {
  const gates = [
    { op: "read", min: 300, color: C.orange, copy: "Public KYA score introspection." },
    { op: "transfer", min: 500, color: C.violet, copy: "Move tokenforge-issued assets between accredited holders." },
    { op: "mint", min: 500, color: C.violet, copy: "Originate new on-chain securities under tokenforge custody." },
    { op: "order", min: 600, color: C.lime, copy: "Submit primary or secondary market orders. MiFID II Art. 17 controls apply." },
  ];
  return (
    <section id="gates" className="v-section">
      <div className="v-container">
        <SectionHead
          eyebrow="TOKENFORGE CHAIN API"
          title={<>Score gates, <span className="v-grad">enforced before settlement.</span></>}
          sub="Every privileged operation requires a minimum trust score. Below threshold, the call is rejected by tokenforge — never reaches custody."
        />
        <div className="v-gates">
          {gates.map((g, i) => (
            <motion.div
              key={g.op}
              className="v-gate"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="v-gate-head">
                <code className="v-gate-op">{g.op}()</code>
                <span className="v-gate-copy">{g.copy}</span>
                <span className="v-gate-min" style={{ color: g.color }}>≥ {g.min}</span>
              </div>
              <div className="v-gate-track">
                <motion.div
                  className="v-gate-fill"
                  style={{ background: `linear-gradient(90deg, ${g.color}, ${g.color}aa)` }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(g.min / 1000) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, delay: 0.3 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * ARCHITECTURE — bento grid (3 chains, asymmetric)
 * ──────────────────────────────────────────────────────────── */
function Architecture() {
  return (
    <section id="architecture" className="v-section v-section-arch">
      <div className="v-container">
        <SectionHead
          eyebrow="ARCHITECTURE"
          title={
            <>
              Three chains. <span className="v-grad">One agent flow.</span>
            </>
          }
          sub="Complementary, not competitive. Each layer owns one concern."
        />

        <motion.div
          className="v-bento"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.13 } } }}
        >
          {/* Algorand — wide */}
          <motion.div
            className="v-bento-cell v-bento-algorand"
            variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } }}
            whileHover={{ y: -4 }}
          >
            <div className="v-bento-tag" style={{ color: C.violet, borderColor: C.violet + "55" }}>
              TRUST LAYER
            </div>
            <div className="v-bento-name">Algorand</div>
            <div className="v-bento-role">Agentic accreditation, on-chain.</div>
            <ul className="v-bento-list">
              <li><Dot c={C.violet} /> KYA Score (0–1000)</li>
              <li><Dot c={C.violet} /> Soulbound Token (ASA, frozen, clawback-revocable)</li>
              <li><Dot c={C.violet} /> Validator consensus + Note-TX anchors</li>
              <li><Dot c={C.violet} /> x402 payment gate · Bazaar discovery</li>
            </ul>
            <div className="v-bento-glow" style={{ background: `radial-gradient(circle at 80% 20%, ${C.violetSoft}, transparent 60%)` }} />
          </motion.div>

          {/* tokenforge — square */}
          <motion.div
            className="v-bento-cell v-bento-forge"
            variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } }}
            whileHover={{ y: -4 }}
          >
            <div className="v-bento-tag" style={{ color: C.lime, borderColor: C.lime + "55" }}>
              GATE
            </div>
            <div className="v-bento-name">tokenforge</div>
            <div className="v-bento-role">Regulated chain API.</div>
            <ul className="v-bento-list">
              <li><Dot c={C.lime} /> ERC-1400 + eWpG custody</li>
              <li><Dot c={C.lime} /> MiFID II Art. 17 safeguards</li>
              <li><Dot c={C.lime} /> IDnow KYC · Tangany / NYALA custody</li>
            </ul>
            <div className="v-bento-glow" style={{ background: `radial-gradient(circle at 20% 80%, rgba(217,247,113,0.16), transparent 60%)` }} />
          </motion.div>

          {/* Stellar — square */}
          <motion.div
            className="v-bento-cell v-bento-stellar"
            variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } }}
            whileHover={{ y: -4 }}
          >
            <div className="v-bento-tag" style={{ color: C.rose, borderColor: C.rose + "55" }}>
              SETTLEMENT
            </div>
            <div className="v-bento-name">Stellar</div>
            <div className="v-bento-role">Asset settlement.</div>
            <ul className="v-bento-list">
              <li><Dot c={C.rose} /> eWpG mint · ISIN anchor</li>
              <li><Dot c={C.rose} /> EURC stablecoin rails</li>
              <li><Dot c={C.rose} /> Path payments · cross-asset</li>
            </ul>
            <div className="v-bento-glow" style={{ background: `radial-gradient(circle at 80% 80%, rgba(255,107,157,0.18), transparent 60%)` }} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Dot({ c }: { c: string }) {
  return <span className="v-dot" style={{ background: c }} />;
}

/* ────────────────────────────────────────────────────────────
 * VALIDATOR NETWORK — three validators, 2-of-3 consensus
 * ──────────────────────────────────────────────────────────── */
function ValidatorNetwork() {
  const validators: Array<{
    name: string;
    tag: string;
    tagColor: string;
    tagHref?: string;
    stat?: string;
    desc: string;
    tags: string[];
  }> = [
    {
      name: "tokenforge",
      tag: "Founding Validator",
      tagColor: C.lime,
      stat: "920",
      desc:
        "White-label Security Token platform (TokenSuite). eWpG-compliant, BaFin-relevant, MiFID II-ready. Cashlink-registered crypto securities registrar. Chain API gates programmatic agent access.",
      tags: ["eWpG", "BaFin", "MiFID II", "Cashlink", "ERC-1400"],
    },
    {
      name: "BCP Partners",
      tag: "Founding Validator",
      tagColor: C.lime,
      desc:
        "Regulated EU advisory firm and venture builder. Founding validator stakes institutional reputation on every agent evaluation. Berlin-based German GmbH.",
      tags: ["Genesis", "EU Regulated", "Advisory", "Berlin GmbH"],
    },
    {
      name: "Open Slot",
      tag: "Apply →",
      tagColor: C.lime,
      tagHref: "mailto:rafael@bcpp.io?subject=Verun%20Validator%20Inquiry",
      desc:
        "Institutional validator slot open for European banks, custodians, and regulated compliance partners. Extends the 2-of-3 consensus to institutional scale. Currently filled by an internal Test Validator on testnet — replaced by an institutional partner on Algorand mainnet (Q3 2026, grant Milestone 3).",
      tags: ["Banks", "Custodians", "Institutional"],
    },
  ];

  return (
    <section id="validators" className="v-section">
      <div className="v-container">
        <SectionHead
          eyebrow="VALIDATOR NETWORK"
          title={
            <>
              Three validators. <span className="v-grad">One consensus.</span>
            </>
          }
          sub="Two founding validators + one open slot for institutional partners. Test Validator on testnet (Q3 2026 mainnet replacement)."
        />
        <motion.div
          className="v-vnet"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
        >
          {validators.map((v) => (
            <motion.article
              key={v.name}
              className="v-vcard"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
            >
              <div className="v-vcard-head">
                {v.tagHref ? (
                  <a
                    href={v.tagHref}
                    className="v-vcard-tag v-vcard-tag-link"
                    style={{ color: v.tagColor, borderColor: v.tagColor + "55" }}
                  >
                    {v.tag}
                  </a>
                ) : (
                  <span
                    className="v-vcard-tag"
                    style={{ color: v.tagColor, borderColor: v.tagColor + "55" }}
                  >
                    {v.tag}
                  </span>
                )}
                {v.stat && (
                  <span className="v-vcard-stat" style={{ color: v.tagColor }}>
                    {v.stat}
                  </span>
                )}
              </div>
              <h3 className="v-vcard-name">{v.name}</h3>
              <p className="v-vcard-desc">{v.desc}</p>
              <div className="v-vcard-tags">
                {v.tags.map((t) => (
                  <span key={t} className="v-vcard-chip">
                    {t}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * LIVE SBT — spotlight card
 * ──────────────────────────────────────────────────────────── */
function LiveSBT() {
  const ASSET = "759213121";
  const explorers = [
    { name: "AlgoExplorer", url: `https://testnet.algoexplorer.io/asset/${ASSET}` },
    { name: "Pera", url: `https://explorer.perawallet.app/assets/${ASSET}/?network=testnet` },
    { name: "Allo", url: `https://allo.info/asset/${ASSET}` },
  ];
  return (
    <section id="sbt" className="v-section">
      <div className="v-container">
        <SectionHead
          eyebrow="VERIFIABLE ON-CHAIN"
          title={<>The Soulbound Accreditation Token <span className="v-grad">is already live.</span></>}
          sub="A non-transferable Algorand Standard Asset bound to each accredited agent. Frozen at birth, manager-immutable, clawback-revocable by Verun."
        />

        <motion.div
          className="v-sbt"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="v-sbt-mesh" aria-hidden />
          <div className="v-sbt-left">
            <div className="v-sbt-tag">ASA · ALGORAND TESTNET</div>
            <div className="v-sbt-id-label">Asset ID</div>
            <motion.div
              className="v-sbt-id"
              initial={{ opacity: 0, letterSpacing: "0.2em" }}
              whileInView={{ opacity: 1, letterSpacing: "-0.01em" }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, delay: 0.3 }}
            >
              {ASSET}
            </motion.div>
            <div className="v-sbt-explorers">
              {explorers.map((e) => (
                <Magnetic key={e.name}>
                  <a href={e.url} target="_blank" rel="noopener" className="v-sbt-explorer">
                    {e.name} <ExternalIcon />
                  </a>
                </Magnetic>
              ))}
            </div>
          </div>
          <div className="v-sbt-right">
            <div className="v-sbt-spec">
              <SpecRow k="total" v="1" />
              <SpecRow k="decimals" v="0" />
              <SpecRow k="defaultFrozen" v="true" hi />
              <SpecRow k="manager" v={'"" (immutable)'} />
              <SpecRow k="freeze" v={'"" (no unfreeze)'} />
              <SpecRow k="clawback" v="VERUN_ADDR" hi />
            </div>
            <div className="v-sbt-note">
              Wallet binding via Ed25519 challenge-response (AVM <code>ed25519verify</code> opcode).
              Roadmap: Smart ASA (ARC-20) with score + tier in AVM Box Storage.
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
function SpecRow({ k, v, hi }: { k: string; v: string; hi?: boolean }) {
  return (
    <div className="v-sbt-spec-row">
      <span>{k}</span>
      <code style={hi ? { color: C.lime } : {}}>{v}</code>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * COMPLIANCE
 * ──────────────────────────────────────────────────────────── */
function Compliance() {
  const anchors = [
    {
      name: "EU AI Act",
      cite: "Reg. 2024/1689",
      scope: "Risk classification, transparency (Art. 12), human oversight (Art. 14).",
      role: "Primary frame for autonomous agent operation in high-risk domains.",
      accent: C.violet,
    },
    {
      name: "MiFID II",
      cite: "Art. 17 · RTS 6",
      scope: "Algorithmic trading safeguards, kill-switch, pre-trade controls.",
      role: "Applies when agents originate or route orders for regulated instruments.",
      accent: C.lime,
    },
    {
      name: "eIDAS 2.0 / EUDI",
      cite: "Reg. 2024/1183",
      scope: "Attribute attestations, qualified signatures, EUDI Wallet.",
      role: "Verun SBT acts as a credential — interoperable with EUDI architecture.",
      accent: C.rose,
    },
    {
      name: "DORA",
      cite: "Reg. 2022/2554",
      scope: "Operational resilience, ICT risk management, third-party oversight.",
      role: "Validator consensus + on-chain anchoring map directly to DORA requirements.",
      accent: C.orange,
    },
  ];
  return (
    <section id="compliance" className="v-section">
      <div className="v-container">
        <SectionHead
          eyebrow="EU REGULATORY ANCHORS"
          title={<>Built around the <span className="v-grad">agentic regulatory stack.</span></>}
          sub="Verun is not a crypto-asset. The SBT is a non-tradeable credential. Primary regulatory anchors below."
        />
        <motion.div
          className="v-comp-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }}
        >
          {anchors.map((a) => (
            <motion.div
              key={a.name}
              className="v-comp"
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
              whileHover={{ y: -4 }}
            >
              <div className="v-comp-bar" style={{ background: a.accent }} />
              <div className="v-comp-head">
                <div className="v-comp-name">{a.name}</div>
                <code className="v-comp-cite" style={{ color: a.accent, borderColor: a.accent + "44" }}>
                  {a.cite}
                </code>
              </div>
              <div className="v-comp-scope">{a.scope}</div>
              <div className="v-comp-role">{a.role}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="v-comp-audit"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="v-comp-audit-tag">AUDIT</div>
          <div>
            <strong>PwC-grade legal audit</strong> · Q3 2026 · funded by Algorand Foundation xGov Grant Milestone 1.
            Public legal opinion to follow.
          </div>
        </motion.div>

        <div className="v-comp-mica">
          <em>Note on MiCA:</em> aspirational on-chain features at the tokenforge integration boundary, pre-audit.
          Verun itself is not a crypto-asset and the SBT is a non-tradeable credential, so MiCA is not Verun's primary regulatory frame.
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * TEAM
 * ──────────────────────────────────────────────────────────── */
function Team() {
  const team = [
    {
      name: "Rafael Schultz",
      role: "Managing Partner",
      tag: "SIGNATORY",
      tagColor: C.lime,
      badges: ["Deutsche Bank · EVO Payments", "U.S. Bank · Elavon", "DASH DAO"],
    },
    {
      name: "Robert Pietzka",
      role: "Partner — Regulation & ETF",
      badges: ["J.P. Morgan", "CACEIS"],
    },
    {
      name: "Christoph Iwaniez",
      role: "Advisor — Banking & Fintech",
      badges: ["Forge Europe", "Nuri", "Bitwala"],
    },
    {
      name: "Jan Hodok",
      role: "Partner — Strategy & PR",
      badges: ["British American Tobacco", "Belendorf AG"],
    },
    {
      name: "Carina Couillard",
      role: "Marketing — DeFi",
      badges: ["UNICX Network", "HANDL Pay"],
    },
    {
      name: "Fahad Farooq",
      role: "Project Assistant Manager",
      tag: "TECHNICAL CONTACT",
      tagColor: C.violet,
      badges: ["BCP Labs"],
    },
  ];
  return (
    <section id="team" className="v-section">
      <div className="v-container">
        <SectionHead
          eyebrow="TEAM"
          title={<>Built by <span className="v-grad">operators.</span></>}
          sub="BCP Partners GmbH · Berlin · founded by senior banking and payments practitioners."
        />
        <motion.div
          className="v-team"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
        >
          {team.map((p) => (
            <motion.div
              key={p.name}
              className="v-tcard"
              variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
              whileHover={{ y: -4 }}
            >
              {p.tag && (
                <span
                  className="v-tcard-tag"
                  style={{ color: p.tagColor, borderColor: (p.tagColor || "") + "55" }}
                >
                  {p.tag}
                </span>
              )}
              <div className="v-tcard-name">{p.name}</div>
              <div className="v-tcard-role">{p.role}</div>
              <div className="v-tcard-badges">
                {p.badges.map((b) => (
                  <span key={b} className="v-tcard-badge">
                    {b}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * CTA + FOOTER
 * ──────────────────────────────────────────────────────────── */
function CTAFooter() {
  return (
    <>
      <section className="v-cta">
        <div className="v-cta-bg" aria-hidden />
        <div className="v-container v-cta-inner">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            Verify it on Algorand testnet.
            <br />
            <span className="v-grad">Then build with us.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Real endpoints. Real ASA. Three explorers. The whole protocol — testable in five minutes.
          </motion.p>
          <motion.div
            className="v-cta-btns"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Magnetic>
              <a href="/docs.html" className="v-btn v-btn-primary">
                Read the Docs <Arrow />
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="https://github.com/Fahad00674/verun-algorand-mvp"
                className="v-btn v-btn-ghost"
                target="_blank"
                rel="noopener"
              >
                GitHub <ExternalIcon />
              </a>
            </Magnetic>
            <Magnetic>
              <a href="mailto:fahad@bcpp.io" className="v-btn v-btn-ghost">
                Contact
              </a>
            </Magnetic>
          </motion.div>
        </div>
      </section>

      <footer className="v-footer">
        <div className="v-container v-footer-inner">
          <div className="v-footer-left">
            <div className="v-footer-logo">
              <span className="v-logo-mark">V</span>
              <span>VERUN</span>
            </div>
            <div className="v-footer-tag">Accredited Agents for Regulated Finance.</div>
            <div className="v-footer-corp">
              © 2026 BCP Partners GmbH · Rheinsberger Str. 76/77 · 10115 Berlin · HRB 987654
            </div>
          </div>
          <div className="v-footer-right">
            <div className="v-footer-col">
              <div className="v-footer-h">PROTOCOL</div>
              <a href="#modes">Modes</a>
              <a href="#architecture">Architecture</a>
              <a href="#compliance">Compliance</a>
            </div>
            <div className="v-footer-col">
              <div className="v-footer-h">RESOURCES</div>
              <a href="/docs.html">Docs</a>
              <a href="https://github.com/Fahad00674/verun-algorand-mvp" target="_blank" rel="noopener">GitHub</a>
              <a href="https://verun-stellar-demo.vercel.app" target="_blank" rel="noopener">Stellar Demo</a>
            </div>
            <div className="v-footer-col">
              <div className="v-footer-h">CONTACT</div>
              <a href="mailto:fahad@bcpp.io">fahad@bcpp.io</a>
              <a href="https://bcpp.io" target="_blank" rel="noopener">bcpp.io</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ────────────────────────────────────────────────────────────
 * PAGE
 * ──────────────────────────────────────────────────────────── */
export default function Page() {
  return (
    <CursorProvider>
      <main className="v-root">
        <Nav />
        <Hero />
        <LiveSBT />
        <Modes />
        <ValidatorNetwork />
        <Compliance />
        <Team />
        <CTAFooter />
      </main>
    </CursorProvider>
  );
}
