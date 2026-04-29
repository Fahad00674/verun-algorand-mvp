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
  useId,
  useLayoutEffect,
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
        <a href="#validators">Validators</a>
        <a href="#compliance">Compliance</a>
        <a href="#team">Team</a>
        <a href="https://verun-algorand-mvp.vercel.app/docs.html" target="_blank" rel="noopener">Docs</a>
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

      <div className="v-hero-inner v-container">
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
          Make your AI agent <strong>regulatory-ready</strong>. Designed to
          plug into Europe&rsquo;s regulated finance rails.
        </motion.p>

        <motion.div
          className="v-hero-stage"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
        >
          <AgentFlow />
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
          className="v-hero-tagline"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.4 }}
        >
          <p>Trust scoring for any AI agent. Any LLM. Any custom stack.</p>
          <a href="#modes" className="v-hero-scrolldown">
            ↓ See how it works
          </a>
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
  return (
    <motion.div
      className="v-ticker"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <div className="v-ticker-item">
        <span className="v-ticker-dot" />
        <span className="v-ticker-key">5 LIVE ENDPOINTS</span>
      </div>
      <span className="v-ticker-sep">·</span>
      <div className="v-ticker-item">
        <span className="v-ticker-key">ASSET</span>
        <span className="v-ticker-val">759213121</span>
      </div>
      <span className="v-ticker-sep">·</span>
      <div className="v-ticker-item">
        <span className="v-ticker-key">2-OF-3 CONSENSUS</span>
      </div>
      <span className="v-ticker-sep">·</span>
      <div className="v-ticker-item">
        <span className="v-ticker-key">Q3 2026 MAINNET</span>
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

/* ────────────────────────────────────────────────────────────
 * AGENT FLOW — animated agents converging on the score meter
 * ──────────────────────────────────────────────────────────── */
type AgentCard = {
  uid: number;
  label: string;
  score: number;
  spawn: { x: string; y: string };
};

const AGENT_IDS = [
  "agt_4f2",
  "agt_a91",
  "agt_x7c",
  "agt_b3e",
  "agt_d50",
  "agt_q7k",
  "agt_p2n",
  "agt_m8a",
  "agt_v1z",
  "agt_h6j",
];
const AGENT_SCORES = [620, 740, 820, 680, 910, 760, 850, 690, 800, 730];

function pickSpawnPoint(): { x: string; y: string } {
  const edge = Math.floor(Math.random() * 3);
  if (edge === 0) {
    return { x: "-8%", y: `${15 + Math.random() * 70}%` };
  }
  if (edge === 1) {
    return { x: "108%", y: `${15 + Math.random() * 70}%` };
  }
  return { x: `${15 + Math.random() * 70}%`, y: "-8%" };
}

function AgentFlow() {
  const [agents, setAgents] = useState<AgentCard[]>([]);
  const [paused, setPaused] = useState(false);
  const idRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setPaused(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused) return;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 900;
    const spawnRate = isMobile ? 2000 : 1500;
    const maxInFlight = isMobile ? 3 : 5;

    const spawn = () => {
      setAgents((prev) => {
        if (prev.length >= maxInFlight) return prev;
        const id = idRef.current++;
        return [
          ...prev,
          {
            uid: id,
            label: AGENT_IDS[Math.floor(Math.random() * AGENT_IDS.length)],
            score:
              AGENT_SCORES[Math.floor(Math.random() * AGENT_SCORES.length)],
            spawn: pickSpawnPoint(),
          },
        ];
      });
    };

    spawn();
    const t = setInterval(spawn, spawnRate);
    return () => clearInterval(t);
  }, [paused]);

  const handleComplete = (uid: number) => {
    setAgents((prev) => prev.filter((a) => a.uid !== uid));
  };

  return (
    <div ref={containerRef} className="v-agent-flow" aria-hidden>
      <AnimatePresence>
        {agents.map((a) => (
          <AgentCardItem
            key={a.uid}
            agent={a}
            onComplete={() => handleComplete(a.uid)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function AgentCardItem({
  agent,
  onComplete,
}: {
  agent: AgentCard;
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<"flying" | "verified" | "exiting">("flying");
  const [scoreVisible, setScoreVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase("verified");
      setScoreVisible(true);
    }, 4200);
    const t2 = setTimeout(() => setScoreVisible(false), 4900);
    const t3 = setTimeout(() => setPhase("exiting"), 5300);
    const t4 = setTimeout(onComplete, 6500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  const sx = parseFloat(agent.spawn.x);
  const sy = parseFloat(agent.spawn.y);
  const exitX = `${50 + (sx - 50) * 1.1}%`;
  const exitY = `${50 + (sy - 50) * 1.1}%`;

  const baseShadow = "0 0 20px rgba(159,109,255,0.5)";
  const burstShadow = "0 0 40px rgba(232,255,140,0.8)";

  return (
    <motion.div
      className="v-agent-card"
      initial={{
        left: agent.spawn.x,
        top: agent.spawn.y,
        opacity: 0,
        scale: 0.55,
        boxShadow: baseShadow,
      }}
      animate={
        phase === "flying"
          ? {
              left: "50%",
              top: "50%",
              opacity: 1,
              scale: 1,
              boxShadow: baseShadow,
            }
          : phase === "verified"
            ? {
                left: "50%",
                top: "50%",
                opacity: 1,
                scale: [1, 1.3, 1],
                boxShadow: [baseShadow, burstShadow, baseShadow],
              }
            : {
                left: exitX,
                top: exitY,
                opacity: 0,
                scale: 0.6,
                boxShadow: baseShadow,
              }
      }
      transition={{
        duration:
          phase === "flying" ? 4.2 : phase === "verified" ? 0.45 : 1.2,
        ease:
          phase === "flying"
            ? [0.22, 1, 0.36, 1]
            : phase === "verified"
              ? "easeOut"
              : [0.4, 0, 0.6, 1],
      }}
    >
      <span className="v-agent-label">{agent.label}</span>
      <AnimatePresence>
        {scoreVisible && (
          <motion.span
            className="v-agent-score"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: -22 }}
            exit={{ opacity: 0, y: -28 }}
            transition={{ duration: 0.3 }}
          >
            +{agent.score}
          </motion.span>
        )}
      </AnimatePresence>
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

function LinkedinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.37V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"
        fill="currentColor"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 11v5" />
      <circle cx="12" cy="8" r="0.6" fill="currentColor" />
    </svg>
  );
}

function CursorIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 2.5 L3 17 L7.5 13.2 L10.7 21 L13.5 19.8 L10.3 12.3 L17 12 Z"
        fill="#ffffff"
        stroke="rgba(0,0,0,0.55)"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
 * MODAL — generic dialog with backdrop, focus trap, ESC close
 * ──────────────────────────────────────────────────────────── */
function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = setTimeout(() => {
      const firstField = panelRef.current?.querySelector<HTMLElement>(
        "input, textarea, select"
      );
      firstField?.focus();
    }, 80);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      clearTimeout(focusTimer);
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="v-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            ref={panelRef}
            className="v-modal"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <button
              type="button"
              className="v-modal-close"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <CloseIcon />
            </button>
            <h2 id={titleId} className="v-modal-title">
              {title}
            </h2>
            {subtitle && <p className="v-modal-sub">{subtitle}</p>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

type ToastState = {
  variant: "success" | "error";
  message: ReactNode;
} | null;

function Toast({ toast }: { toast: ToastState }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          className={`v-modal-toast v-modal-toast-${toast.variant}`}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <span className="v-modal-toast-icon">
            {toast.variant === "success" ? <CheckIcon /> : <CloseIcon />}
          </span>
          <span className="v-modal-toast-msg">{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const WEB3FORMS_ACCESS_KEY = "ecb3f63a-2104-4b56-a78a-f8326660cc1e";
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

const SUCCESS_MESSAGE = "Message sent! We'll be in touch within 24 hours.";
const ERROR_MESSAGE: ReactNode = (
  <>
    Failed to send. Please try again or email us at{" "}
    <a href="mailto:fahad@bcpp.io">fahad@bcpp.io</a>
  </>
);

async function submitWeb3Form(fields: Record<string, string>): Promise<boolean> {
  const formData = new FormData();
  formData.append("access_key", WEB3FORMS_ACCESS_KEY);
  for (const [k, v] of Object.entries(fields)) {
    if (v) formData.append(k, v);
  }
  try {
    const res = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      body: formData,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

function ContactModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const dismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = () => {
    setName("");
    setEmail("");
    setCompany("");
    setMessage("");
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
    reset();
  };

  const scheduleDismiss = (ms: number) => {
    if (dismissRef.current) clearTimeout(dismissRef.current);
    dismissRef.current = setTimeout(() => setToast(null), ms);
  };

  useEffect(() => {
    return () => {
      if (dismissRef.current) clearTimeout(dismissRef.current);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const ok = await submitWeb3Form({
      subject: `Verun Inquiry - ${name}`,
      name,
      email,
      company,
      message,
    });

    if (ok) {
      setToast({ variant: "success", message: SUCCESS_MESSAGE });
      reset();
      setTimeout(() => onClose(), 1500);
      scheduleDismiss(4000);
    } else {
      setToast({ variant: "error", message: ERROR_MESSAGE });
      scheduleDismiss(4000);
    }
    setSubmitting(false);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Get in touch"
        subtitle="Tell us about your interest in Verun. We respond within two business days."
      >
        <form className="v-modal-form" onSubmit={handleSubmit}>
          <label className="v-modal-field">
            <span>
              Name <em>*</em>
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              disabled={submitting}
            />
          </label>
          <label className="v-modal-field">
            <span>
              Email <em>*</em>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={submitting}
            />
          </label>
          <label className="v-modal-field">
            <span>Company / Organization</span>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              autoComplete="organization"
              disabled={submitting}
            />
          </label>
          <label className="v-modal-field">
            <span>
              Message <em>*</em>
            </span>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={submitting}
            />
          </label>
          <button
            type="submit"
            className="v-modal-submit"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? "Sending..." : "Send Message"}
          </button>
          <button
            type="button"
            className="v-modal-cancel"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </button>
        </form>
      </Modal>
      <Toast toast={toast} />
    </>
  );
}

function ValidatorInquiryModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [institution, setInstitution] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("Bank");
  const [country, setCountry] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const dismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = () => {
    setInstitution("");
    setContactName("");
    setEmail("");
    setType("Bank");
    setCountry("");
    setMessage("");
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
    reset();
  };

  const scheduleDismiss = (ms: number) => {
    if (dismissRef.current) clearTimeout(dismissRef.current);
    dismissRef.current = setTimeout(() => setToast(null), ms);
  };

  useEffect(() => {
    return () => {
      if (dismissRef.current) clearTimeout(dismissRef.current);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const ok = await submitWeb3Form({
      subject: `Verun Validator Slot Inquiry - ${institution}`,
      institution,
      contact_name: contactName,
      email,
      institution_type: type,
      country,
      message,
    });

    if (ok) {
      setToast({ variant: "success", message: SUCCESS_MESSAGE });
      reset();
      setTimeout(() => onClose(), 1500);
      scheduleDismiss(4000);
    } else {
      setToast({ variant: "error", message: ERROR_MESSAGE });
      scheduleDismiss(4000);
    }
    setSubmitting(false);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Validator slot inquiry"
        subtitle="Open to European banks, custodians, asset managers, and regulated compliance partners."
      >
        <form className="v-modal-form" onSubmit={handleSubmit}>
          <label className="v-modal-field">
            <span>
              Institution Name <em>*</em>
            </span>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              required
              autoComplete="organization"
              disabled={submitting}
            />
          </label>
          <label className="v-modal-field">
            <span>
              Contact Name <em>*</em>
            </span>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
              autoComplete="name"
              disabled={submitting}
            />
          </label>
          <label className="v-modal-field">
            <span>
              Email <em>*</em>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={submitting}
            />
          </label>
          <label className="v-modal-field">
            <span>
              Institution Type <em>*</em>
            </span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              disabled={submitting}
            >
              <option>Bank</option>
              <option>Custodian</option>
              <option>Compliance Partner</option>
              <option>Asset Manager</option>
              <option>Other</option>
            </select>
          </label>
          <label className="v-modal-field">
            <span>
              Country <em>*</em>
            </span>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              autoComplete="country-name"
              disabled={submitting}
            />
          </label>
          <label className="v-modal-field">
            <span>
              Message <em>*</em>
            </span>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              placeholder="Tell us about your institution and validator interest..."
              disabled={submitting}
            />
          </label>
          <button
            type="submit"
            className="v-modal-submit"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? "Sending..." : "Submit Inquiry"}
          </button>
          <button
            type="button"
            className="v-modal-cancel"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </button>
        </form>
      </Modal>
      <Toast toast={toast} />
    </>
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
      desc: <>Only verified agents transact. No exceptions.</>,
      href: "https://verun-algorand-mvp.vercel.app/docs.html#api",
    },
    {
      icon: <BadgeCheckIcon />,
      title: "Trust Credential",
      desc: (
        <>
          Non-transferable credential, on-chain. Asset{" "}
          <a
            href="https://lora.algokit.io/testnet/asset/759213121"
            target="_blank"
            rel="noopener"
          >
            759213121
          </a>
          .
        </>
      ),
      href: "https://verun-algorand-mvp.vercel.app/docs.html#sbt",
    },
    {
      icon: <ClockIcon />,
      title: "Live Audit Trail",
      desc: <>Every decision permanently anchored on-chain.</>,
      href: "https://verun-algorand-mvp.vercel.app/docs.html#anchor",
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
            target="_blank"
            rel="noopener"
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
  eyebrow?: string;
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
      {eyebrow && (
        <motion.span
          className="v-section-eyebrow"
          variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
        >
          {eyebrow}
        </motion.span>
      )}
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
 * MODES — single supervised dashboard + try-it-live panel
 * ──────────────────────────────────────────────────────────── */
function Modes() {
  return (
    <section id="modes" className="v-section">
      <div className="v-container">
        <SectionHead
          eyebrow="OPERATING MODE"
          title={<>How agents <span className="v-grad">use Verun.</span></>}
          sub="Submit an agent's intent. Get a real consensus decision. Anchored on Algorand."
        />

        <motion.div
          className="v-laptop"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="v-laptop-bezel">
            <span className="v-laptop-notch" aria-hidden />
            <div className="v-laptop-screen">
              <div className="v-laptop-header">
                <span className="v-laptop-mode-label">SUPERVISED MODE</span>
              </div>
              <div className="v-laptop-content">
                <SupervisedDemo />
              </div>
            </div>
          </div>
          <div className="v-laptop-base" aria-hidden />
        </motion.div>

        <TryItLive />
      </div>
    </section>
  );
}

function SupervisedDemo() {
  const [state, setState] = useState<"idle" | "approved" | "declined">("idle");
  const [userTouched, setUserTouched] = useState(false);
  const [validatorPhase, setValidatorPhase] = useState(0);
  const [cursorActive, setCursorActive] = useState(false);
  const [cursorAt, setCursorAt] = useState<"home" | "approve">("home");
  const [pulseClick, setPulseClick] = useState(false);

  const demoRef = useRef<HTMLDivElement>(null);
  const approveBtnRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({
    home: { x: 320, y: 280 },
    approve: { x: 280, y: 220 },
  });

  useLayoutEffect(() => {
    const measure = () => {
      if (!demoRef.current) return;
      const demoRect = demoRef.current.getBoundingClientRect();
      const home = {
        x: demoRect.width * 0.78 - 12,
        y: demoRect.height * 0.86 - 12,
      };
      let approve = {
        x: demoRect.width * 0.62 - 12,
        y: demoRect.height * 0.62 - 12,
      };
      if (approveBtnRef.current) {
        const btn = approveBtnRef.current.getBoundingClientRect();
        approve = {
          x: btn.left - demoRect.left + btn.width * 0.7 - 4,
          y: btn.top - demoRect.top + btn.height * 0.5 - 4,
        };
      }
      setCoords({ home, approve });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [state]);

  useEffect(() => {
    if (state !== "idle") {
      setValidatorPhase(3);
      return;
    }
    setValidatorPhase(0);
    const t1 = setTimeout(() => setValidatorPhase(1), 400);
    const t2 = setTimeout(() => setValidatorPhase(2), 550);
    const t3 = setTimeout(() => setValidatorPhase(3), 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [state]);

  useEffect(() => {
    if (!userTouched) return;
    if (state === "approved") {
      const t = setTimeout(() => setState("idle"), 3000);
      return () => clearTimeout(t);
    }
    if (state === "declined") {
      const t = setTimeout(() => setState("idle"), 700);
      return () => clearTimeout(t);
    }
  }, [state, userTouched]);

  useEffect(() => {
    if (userTouched) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const sched = (ms: number, fn: () => void) => {
      const t = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timers.push(t);
    };

    const run = () => {
      if (cancelled) return;
      setState("idle");
      setCursorActive(false);
      setCursorAt("home");
      setPulseClick(false);

      sched(1500, () => setCursorActive(true));
      sched(1750, () => setCursorAt("approve"));
      sched(2550, () => setPulseClick(true));
      sched(2750, () => {
        setState("approved");
        setPulseClick(false);
      });
      sched(5750, () => setCursorActive(false));
      sched(6200, () => setState("idle"));
      sched(7700, run);
    };

    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [userTouched]);

  const handleApprove = () => {
    setUserTouched(true);
    setCursorActive(false);
    setPulseClick(false);
    setState("approved");
  };
  const handleDecline = () => {
    setUserTouched(true);
    setCursorActive(false);
    setPulseClick(false);
    setState("declined");
  };

  const validators = [
    { id: "BCP", label: "BCP" },
    { id: "tokenforge", label: "tokenforge" },
    { id: "Test", label: "Test" },
  ];

  return (
    <motion.div
      ref={demoRef}
      className="v-demo v-demo-supervised"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="v-sup-validators">
        {validators.map((v, i) => (
          <span
            key={v.id}
            className={`v-sup-vchip${validatorPhase > i ? " v-sup-vchip-on" : ""}`}
          >
            <span className="v-sup-vlabel">{v.label}</span>
            <motion.span
              className="v-sup-vcheck"
              initial={false}
              animate={
                validatorPhase > i
                  ? { scale: 1, opacity: 1 }
                  : { scale: 0, opacity: 0 }
              }
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              ✓
            </motion.span>
          </span>
        ))}
      </div>
      <motion.div
        className="v-sup-consensus"
        initial={false}
        animate={{ opacity: validatorPhase >= 3 ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        2-of-3 consensus reached
      </motion.div>

      <div className="v-sup-card-wrap">
        <AnimatePresence mode="wait">
          {state === "approved" ? (
            <motion.div
              key="success"
              className="v-rec-success"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="v-rec-success-icon">
                <CheckIcon />
              </div>
              <div className="v-rec-success-text">
                <div className="v-rec-success-line">
                  ✓ Approved · anchored on Algorand
                </div>
                <div className="v-rec-success-line v-rec-success-sbt">
                  Soulbound credential issued · Asset{" "}
                  <a
                    href="https://lora.algokit.io/testnet/asset/759213121"
                    target="_blank"
                    rel="noopener"
                    className="v-rec-success-asset"
                  >
                    759213121
                  </a>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="card"
              className="v-rec-card"
              initial={{ opacity: 0, x: 32 }}
              animate={
                state === "declined"
                  ? { opacity: 1, x: [0, -10, 10, -8, 8, 0] }
                  : { opacity: 1, x: 0 }
              }
              exit={{ opacity: 0, x: -32 }}
              transition={{
                duration: state === "declined" ? 0.5 : 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="v-rec-title">
                Agent <code>agt_demo</code> · Score 820
              </div>
              <div className="v-rec-body">
                Wants to <strong>transfer 5,000 EURC</strong> to tokenforge
              </div>
              <div className="v-rec-chips">
                <span className="v-rec-chip">Validators 3/3 ✓</span>
                <span className="v-rec-chip">EU AI Act ✓</span>
                <span className="v-rec-chip">Operation: transfer</span>
              </div>
              <div className="v-rec-actions">
                <button
                  type="button"
                  className="v-rec-decline"
                  onClick={handleDecline}
                >
                  Decline
                </button>
                <motion.button
                  ref={approveBtnRef}
                  type="button"
                  className="v-rec-approve"
                  onClick={handleApprove}
                  animate={{
                    scale: pulseClick ? [1, 0.96, 1] : 1,
                    boxShadow: [
                      "0 0 0 0 rgba(159,109,255,0)",
                      "0 0 0 8px rgba(159,109,255,0.28)",
                      "0 0 0 0 rgba(159,109,255,0)",
                    ],
                  }}
                  transition={{
                    scale: { duration: 0.22, ease: [0.4, 0, 0.6, 1] },
                    boxShadow: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
                  }}
                >
                  Approve <Arrow />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="v-sup-steps">
        <div className="v-sup-step v-sup-step-done">1. Agent scored ✓</div>
        <div
          className={`v-sup-step ${
            validatorPhase >= 3 ? "v-sup-step-done" : "v-sup-step-active"
          }`}
        >
          {validatorPhase >= 3 ? "2. Validators voted ✓" : "2. Validators voting…"}
        </div>
        <div
          className={`v-sup-step ${
            state === "approved" ? "v-sup-step-done" : "v-sup-step-active"
          }`}
        >
          {state === "approved"
            ? "3. Approved · credential issued ✓"
            : "3. Awaiting human approval"}
        </div>
      </div>

      <motion.div
        className="v-cursor"
        initial={false}
        animate={{
          opacity: cursorActive ? 1 : 0,
          x: cursorActive ? coords[cursorAt].x : coords.home.x,
          y: cursorActive ? coords[cursorAt].y : coords.home.y,
        }}
        transition={{
          opacity: { duration: 0.4 },
          x: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
          y: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
        }}
        aria-hidden
      >
        <CursorIcon />
      </motion.div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
 * TRY-IT-LIVE — fires a real /api/evaluate request and shows the response
 * ──────────────────────────────────────────────────────────── */
const TRYIT_ENDPOINT = "/api/evaluate";
const TRYIT_PAYLOAD = {
  agentId: "agt_demo",
  score: 820,
  operation: "transfer",
};
const TRYIT_CURL =
  "curl -X POST https://verun-algorand-mvp.vercel.app/api/evaluate \\\n" +
  "  -H \"Content-Type: application/json\" \\\n" +
  "  -d '{\n" +
  "    \"agentId\": \"agt_demo\",\n" +
  "    \"score\": 820,\n" +
  "    \"operation\": \"transfer\"\n" +
  "  }'";

type TryItResult =
  | {
      ok: true;
      permitted: boolean;
      consensus: string;
      txid: string | null;
    }
  | { ok: false; error: string };

function truncateTxid(txid: string): string {
  if (txid.length <= 12) return txid;
  return `${txid.slice(0, 8)}…${txid.slice(-4)}`;
}

function TryItLive() {
  const [running, setRunning] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [result, setResult] = useState<TryItResult | null>(null);

  const handleRun = async () => {
    if (disabled || running) return;
    setRunning(true);
    setDisabled(true);
    setResult(null);

    try {
      const res = await fetch(TRYIT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(TRYIT_PAYLOAD),
      });

      if (!res.ok) {
        let message = `Request failed (status: ${res.status})`;
        try {
          const errBody = (await res.json()) as Record<string, unknown>;
          const detail =
            (typeof errBody.error === "string" && errBody.error) ||
            (typeof errBody.detail === "string" && errBody.detail) ||
            (typeof errBody.message === "string" && errBody.message) ||
            null;
          if (detail) message = detail;
        } catch {
          /* non-JSON body — fall back to status code */
        }
        setResult({ ok: false, error: message });
        setRunning(false);
        setTimeout(() => setDisabled(false), 5000);
        return;
      }

      const data = (await res.json()) as Record<string, unknown>;

      const permitted =
        typeof data.permitted === "boolean" ? data.permitted : true;
      const consensus =
        typeof data.consensus === "string" ? data.consensus : "2-of-3";
      const txidRaw =
        (data.txid as string | undefined) ??
        (data.txId as string | undefined) ??
        (data.transactionId as string | undefined) ??
        null;

      setResult({ ok: true, permitted, consensus, txid: txidRaw });
      setRunning(false);
      setTimeout(() => setDisabled(false), 5000);
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? `Request failed — ${err.message}`
          : "Request failed — try again";
      setResult({ ok: false, error: message });
      setRunning(false);
      setTimeout(() => setDisabled(false), 5000);
    }
  };

  return (
    <div className="v-tryit">
      <div className="v-curl-head">
        <span className="v-curl-label">SUPERVISED · /api/evaluate</span>
      </div>
      <div className="v-curl-codewrap">
        <pre className="v-curl-code">
          <code>{TRYIT_CURL}</code>
        </pre>
      </div>

      <p className="v-tryit-helper">
        Click below to fire a real <code>/api/evaluate</code> request. The
        response is anchored on Algorand testnet and verifiable on Lora
        explorer.
      </p>

      <div className="v-tryit-actionbar">
        <button
          type="button"
          className="v-tryit-run"
          onClick={handleRun}
          disabled={disabled}
          aria-busy={running}
        >
          {running ? (
            <>
              <span className="v-tryit-spinner" aria-hidden /> Anchoring on
              testnet…
            </>
          ) : (
            <>▶ Run on Algorand Testnet</>
          )}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            key={result.ok ? "ok" : "err"}
            className={`v-tryit-result${
              result.ok ? " v-tryit-result-ok" : " v-tryit-result-err"
            }`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            role="status"
            aria-live="polite"
          >
            {result.ok ? (
              <>
                <div className="v-tryit-row">
                  <span className="v-tryit-check">✓</span> permitted:{" "}
                  <strong>{String(result.permitted)}</strong>
                </div>
                <div className="v-tryit-row">
                  consensus: <strong>{result.consensus}</strong>
                </div>
                {result.txid && (
                  <div className="v-tryit-row v-tryit-row-tx">
                    <span>txid:</span>
                    <a
                      href={`https://lora.algokit.io/testnet/tx/${result.txid}`}
                      target="_blank"
                      rel="noopener"
                      className="v-tryit-txid"
                    >
                      {truncateTxid(result.txid)}
                    </a>
                    <a
                      href={`https://lora.algokit.io/testnet/tx/${result.txid}`}
                      target="_blank"
                      rel="noopener"
                      className="v-tryit-verify"
                    >
                      Verify on Lora →
                    </a>
                  </div>
                )}
              </>
            ) : (
              <div className="v-tryit-error">{result.error}</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
  const [validatorModalOpen, setValidatorModalOpen] = useState(false);

  const validators: Array<{
    name: string;
    tag: string;
    tagColor: string;
    tagAction?: () => void;
    stat?: string;
    desc: string;
    tags: string[];
  }> = [
    {
      name: "tokenforge",
      tag: "Founding Validator",
      tagColor: C.lime,
      desc:
        "White-label Security Token platform (TokenSuite). eWpG-compliant, BaFin-relevant, MiFID II-ready. Integrates with Cashlink (regulated crypto securities registrar). Chain API gates programmatic agent access.",
      tags: ["eWpG", "BaFin", "MiFID II", "Genesis"],
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
      tagAction: () => setValidatorModalOpen(true),
      desc:
        "Open slot reserved for an institutional validator. Custodians and regulated compliance partners welcome.",
      tags: ["Banks", "Custodians", "Institutional"],
    },
  ];

  return (
    <section id="validators" className="v-section">
      <div className="v-container">
        <SectionHead
          title={
            <>
              Three validators. <span className="v-grad">One consensus.</span>
            </>
          }
          sub="Two founding validators + one open slot for institutional partners."
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
                {v.tagAction ? (
                  <button
                    type="button"
                    onClick={v.tagAction}
                    className="v-vcard-tag v-vcard-tag-link"
                    style={{ color: v.tagColor, borderColor: v.tagColor + "55" }}
                  >
                    {v.tag}
                  </button>
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
      <ValidatorInquiryModal
        isOpen={validatorModalOpen}
        onClose={() => setValidatorModalOpen(false)}
      />
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * LIVE SBT — spotlight card
 * ──────────────────────────────────────────────────────────── */
function LiveSBT() {
  const ASSET = "759213121";
  const explorers = [
    { name: "Lora", url: `https://lora.algokit.io/testnet/asset/${ASSET}` },
    { name: "Pera", url: `https://explorer.perawallet.app/assets/${ASSET}/?network=testnet` },
    { name: "Allo", url: `https://allo.info/asset/${ASSET}` },
  ];
  return (
    <section id="sbt" className="v-section">
      <div className="v-container">
        <SectionHead
          eyebrow="VERIFIABLE ON-CHAIN"
          title={<>The Soulbound Accreditation Token <span className="v-grad">is already live.</span></>}
          sub="A non-transferable ASA bound to each accredited agent. Manager-immutable, clawback-revocable."
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
      role: "Primary frame for autonomous agents in high-risk domains.",
      accent: C.violet,
    },
    {
      name: "MiFID II",
      cite: "Art. 17 · RTS 6",
      scope: "Algorithmic trading safeguards, kill-switch, pre-trade controls.",
      role: "Applies when agents route orders for regulated instruments.",
      accent: C.lime,
    },
  ];
  return (
    <section id="compliance" className="v-section">
      <div className="v-container">
        <SectionHead
          eyebrow="EU REGULATORY ANCHORS"
          title={<>Primary <span className="v-grad">regulatory anchors.</span></>}
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
          style={{
            background: "rgba(255,255,255,0.02)",
            borderColor: "var(--border-strong)",
          }}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div
            className="v-comp-audit-tag"
            style={{
              color: "var(--text-3)",
              background: "rgba(255,255,255,0.04)",
              borderColor: "var(--border-strong)",
            }}
          >
            DISCLOSURE
          </div>
          <div>
            This page reflects the team&rsquo;s design intent. Independent legal review is planned. Nothing here constitutes certified compliance or legal advice.
          </div>
        </motion.div>
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
      badges: ["Deutsche Bank · EVO Payments", "U.S. Bank · Elavon", "DASH DAO"],
      linkedin: "https://www.linkedin.com/in/rafaelschultz/",
    },
    {
      name: "Nils Engeln",
      role: "Project Partner",
      badges: ["w3.fund", "Blockscape Finance AG"],
      linkedin: "https://www.linkedin.com/in/nils-engeln-ab9629106/",
    },
    {
      name: "Carina Couillard",
      role: "Marketing — DeFi",
      badges: ["UNICX Network", "HANDL Pay"],
      linkedin: "https://www.linkedin.com/in/carina-couillard/",
    },
    {
      name: "Fahad Farooq",
      role: "Project Assistant Manager",
      badges: ["BCP Labs"],
      linkedin: "https://www.linkedin.com/in/fahadfaroooq/",
    },
  ];
  return (
    <section id="team" className="v-section">
      <div className="v-container">
        <SectionHead
          eyebrow="TEAM"
          title={<>Built by <span className="v-grad">operators.</span></>}
          sub="BCP Partners GmbH · Berlin · founded by senior banking and payments engineers."
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
              <div className="v-tcard-namerow">
                <div className="v-tcard-name">{p.name}</div>
                <a
                  className="v-tcard-linkedin"
                  href={p.linkedin}
                  target="_blank"
                  rel="noopener"
                  aria-label={`${p.name} on LinkedIn`}
                >
                  <LinkedinIcon />
                </a>
              </div>
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
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const openContact = () => setContactModalOpen(true);
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
              <a
                href="https://lora.algokit.io/testnet/asset/759213121"
                className="v-btn v-btn-primary"
                target="_blank"
                rel="noopener"
              >
                Verify on Lora <Arrow />
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="https://verun-algorand-mvp.vercel.app/docs.html"
                className="v-btn v-btn-ghost"
                target="_blank"
                rel="noopener"
              >
                Read the Docs <ExternalIcon />
              </a>
            </Magnetic>
            <Magnetic>
              <button
                type="button"
                onClick={openContact}
                className="v-btn v-btn-ghost"
              >
                Contact
              </button>
            </Magnetic>
          </motion.div>
        </div>
      </section>

      <aside className="v-disclaimer" role="note" aria-label="Legal and beta notice">
        <div className="v-disclaimer-inner">
          <span className="v-disclaimer-icon" aria-hidden>
            <InfoIcon />
          </span>
          <p>
            <strong>Beta · Testnet preview.</strong> The Verun Protocol is currently deployed on Algorand testnet for demonstration purposes. Features, on-chain parameters, design, and integrations may change before mainnet release (planned Q3 2026). Nothing on this site constitutes financial, legal, or investment advice.
          </p>
        </div>
      </aside>

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
              <a href="#validators">Validators</a>
              <a href="#compliance">Compliance</a>
              <a href="https://verun-algorand-mvp.vercel.app/docs.html" target="_blank" rel="noopener">Docs</a>
            </div>
            <div className="v-footer-col">
              <div className="v-footer-h">RESOURCES</div>
              <a href="https://verun-algorand-mvp.vercel.app/docs.html" target="_blank" rel="noopener">Docs</a>
              <a href="https://github.com/Fahad00674/verun-algorand-mvp" target="_blank" rel="noopener">GitHub</a>
              <a href="https://lora.algokit.io/testnet/asset/759213121" target="_blank" rel="noopener">Soulbound Token</a>
            </div>
            <div className="v-footer-col">
              <div className="v-footer-h">CONTACT</div>
              <button type="button" className="v-footer-contact" onClick={openContact}>
                Contact
              </button>
              <a href="https://www.bcpp.io" target="_blank" rel="noopener">bcpp.io</a>
            </div>
          </div>
        </div>
      </footer>
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />
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
        <Modes />
        <ValidatorNetwork />
        <Compliance />
        <Team />
        <CTAFooter />
      </main>
    </CursorProvider>
  );
}
