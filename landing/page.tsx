"use client";

/**
 * Verun Protocol — Landing Page (Next.js App Router)
 *
 * Drop this file at:  app/page.tsx
 * Requires:           framer-motion, React 18+
 *
 * Self-contained — all styles inline in <style jsx global>.
 * No Tailwind, no design-token import. Brand tokens live at the top.
 *
 * Author: BCP Partners GmbH · 2026
 */

import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
  type Variants,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────
 * BRAND TOKENS — shared with existing index.html for continuity
 * ──────────────────────────────────────────────────────────── */
const T = {
  bg: "#07111F",
  bg2: "#0D1B2E",
  card: "#0F2035",
  card2: "#132540",
  teal: "#00D4AA",
  tealBright: "#00F0C4",
  tealDim: "rgba(0,212,170,0.10)",
  tealBorder: "rgba(0,212,170,0.22)",
  purple: "#7B61FF",
  purpleDim: "rgba(123,97,255,0.10)",
  green: "#00C986",
  amber: "#FFB020",
  red: "#FF4D6A",
  text: "#F0F4FF",
  text2: "#8BA3BE",
  text3: "#4A6580",
  border: "rgba(255,255,255,0.07)",
};

/* ────────────────────────────────────────────────────────────
 * MOTION HELPERS
 * ──────────────────────────────────────────────────────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

/* ────────────────────────────────────────────────────────────
 * NAV
 * ──────────────────────────────────────────────────────────── */
function Nav() {
  return (
    <nav className="v-nav">
      <a href="#" className="v-logo">
        <span className="v-logo-mark">V</span>
        <span>VERUN</span>
        <span className="v-logo-tag">BETA</span>
      </a>
      <div className="v-nav-links">
        <a href="#modes">Modes</a>
        <a href="#architecture">Architecture</a>
        <a href="#compliance">Compliance</a>
        <a href="#team">Team</a>
        <a href="/docs.html">Docs</a>
      </div>
      <LiveBadge />
    </nav>
  );
}

function LiveBadge() {
  return (
    <div className="v-live-badge">
      <span className="v-live-dot" />
      <span>Live · Algorand Testnet</span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * HERO + TRUST METER
 * ──────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <header className="v-hero">
      <div className="v-hero-grid" aria-hidden />
      <div className="v-hero-glow" aria-hidden />

      <motion.div
        className="v-hero-inner v-container"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="v-eyebrow" variants={fadeUp}>
          <span className="v-eyebrow-dot" />
          EU-Aligned Agent Trust Layer
        </motion.div>

        <motion.h1 className="v-h1" variants={fadeUp} custom={1}>
          Accredited Agents for{" "}
          <span className="v-h1-accent">Regulated Finance</span>
        </motion.h1>

        <motion.p className="v-hero-sub" variants={fadeUp} custom={2}>
          A unified <strong>0–1000 trust score</strong> for autonomous AI agents
          operating in EU capital markets. Aggregates KYA signals from
          Mastercard, Visa x402, on-chain history, and validator consensus —
          settled on Algorand, gated by tokenforge, anchored to EU AI Act &
          MiFID II.
        </motion.p>

        <motion.div className="v-hero-meter" variants={fadeUp} custom={3}>
          <TrustMeter target={820} />
        </motion.div>

        <motion.div className="v-hero-stats" variants={fadeUp} custom={4}>
          <StatCell value="5" unit="endpoints" label="Live on testnet" />
          <StatCell value="820" unit="/ 1000" label="Reference score" />
          <StatCell value="~3.9s" unit="" label="Anchor finality" />
        </motion.div>

        <motion.div className="v-hero-cta" variants={fadeUp} custom={5}>
          <a href="/docs.html" className="v-btn v-btn-primary">
            Read the Docs <Arrow />
          </a>
          <a
            href="https://github.com/Fahad00674/verun-algorand-mvp"
            className="v-btn v-btn-ghost"
            target="_blank"
            rel="noopener"
          >
            View on GitHub
          </a>
        </motion.div>
      </motion.div>
    </header>
  );
}

function TrustMeter({ target }: { target: number }) {
  /* SVG arc that animates 0 → target over 1.8s */
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  const score = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  /* arc geometry */
  const SIZE = 280;
  const STROKE = 14;
  const R = (SIZE - STROKE) / 2 - 6;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const ARC_DEG = 270; // 3/4 circle
  const START_DEG = 135;
  const ARC_LEN = (Math.PI * 2 * R * ARC_DEG) / 360;

  /* dash offset = (1 - score/1000) * ARC_LEN */
  const dashOffset = useTransform(score, [0, 1000], [ARC_LEN, 0]);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(score, target, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return controls.stop;
  }, [inView, score, target]);

  /* arc start/end coords */
  const polar = (deg: number) => {
    const r = (deg * Math.PI) / 180;
    return { x: CX + R * Math.cos(r), y: CY + R * Math.sin(r) };
  };
  const start = polar(START_DEG);
  const end = polar(START_DEG + ARC_DEG);

  const arcPath = `M ${start.x} ${start.y} A ${R} ${R} 0 1 1 ${end.x} ${end.y}`;

  /* tier label based on display */
  const tier =
    display >= 700
      ? "VERIFIED"
      : display >= 500
      ? "TRUSTED"
      : display >= 300
      ? "WATCH"
      : "UNRATED";

  const tierColor =
    display >= 700
      ? T.teal
      : display >= 500
      ? T.green
      : display >= 300
      ? T.amber
      : T.red;

  return (
    <div ref={ref} className="v-meter">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <defs>
          <linearGradient id="meter-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={T.red} />
            <stop offset="35%" stopColor={T.amber} />
            <stop offset="65%" stopColor={T.green} />
            <stop offset="100%" stopColor={T.tealBright} />
          </linearGradient>
          <filter id="meter-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* track */}
        <path
          d={arcPath}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={STROKE}
          strokeLinecap="round"
        />

        {/* fill */}
        <motion.path
          d={arcPath}
          fill="none"
          stroke="url(#meter-grad)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={ARC_LEN}
          style={{ strokeDashoffset: dashOffset, filter: "url(#meter-glow)" }}
        />

        {/* tick marks */}
        {[0, 250, 500, 750, 1000].map((tick) => {
          const deg = START_DEG + (ARC_DEG * tick) / 1000;
          const inner = polar(deg);
          const r2 = (deg * Math.PI) / 180;
          const outer = {
            x: CX + (R + 12) * Math.cos(r2),
            y: CY + (R + 12) * Math.sin(r2),
          };
          return (
            <line
              key={tick}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.5"
            />
          );
        })}
      </svg>

      <div className="v-meter-center">
        <div className="v-meter-num">{display}</div>
        <div className="v-meter-tier" style={{ color: tierColor }}>
          {tier}
        </div>
        <div className="v-meter-scale">/ 1000</div>
      </div>
    </div>
  );
}

function StatCell({
  value,
  unit,
  label,
}: {
  value: string;
  unit: string;
  label: string;
}) {
  return (
    <div className="v-stat">
      <div className="v-stat-top">
        <span className="v-stat-num">{value}</span>
        {unit && <span className="v-stat-unit">{unit}</span>}
      </div>
      <div className="v-stat-label">{label}</div>
    </div>
  );
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M3 7h8m-3-3 3 3-3 3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
 * TRUST STRIP — live endpoints
 * ──────────────────────────────────────────────────────────── */
function TrustStrip() {
  const items = [
    { method: "GET", path: "/api/health" },
    { method: "POST", path: "/api/evaluate" },
    { method: "POST", path: "/api/mint-sbt" },
    { method: "GET", path: "/api/funding-status" },
    { method: "ASA", path: "759213121" },
  ];
  return (
    <motion.div
      className="v-strip"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="v-container v-strip-inner">
        <span className="v-strip-label">LIVE ON TESTNET</span>
        <div className="v-strip-items">
          {items.map((it) => (
            <div key={it.path} className="v-strip-item">
              <span className={`v-method v-method-${it.method.toLowerCase()}`}>
                {it.method}
              </span>
              <code>{it.path}</code>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
 * SECTION SHELL
 * ──────────────────────────────────────────────────────────── */
function Section({
  id,
  eyebrow,
  title,
  sub,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="v-section">
      <div className="v-container">
        <motion.div
          className="v-section-head"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          variants={stagger}
        >
          <motion.span className="v-section-eyebrow" variants={fadeUp}>
            {eyebrow}
          </motion.span>
          <motion.h2 className="v-section-title" variants={fadeUp} custom={1}>
            {title}
          </motion.h2>
          {sub && (
            <motion.p className="v-section-sub" variants={fadeUp} custom={2}>
              {sub}
            </motion.p>
          )}
        </motion.div>
        {children}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 * 3 MODES
 * ──────────────────────────────────────────────────────────── */
function Modes() {
  const modes = [
    {
      step: "01",
      icon: "🔍",
      title: "Discovery",
      copy:
        "Agent scans validated platforms, finds tokenforge, sends a structured recommendation to the operator.",
      color: T.teal,
    },
    {
      step: "02",
      icon: "👤",
      title: "Supervised",
      copy:
        "Human gets the structured recommendation, reviews provenance and score, approves with a single click.",
      color: T.purple,
    },
    {
      step: "03",
      icon: "⚡",
      title: "Autonomous",
      copy:
        "After human approval, the agent executes end-to-end. Every action is anchored on Algorand.",
      color: T.tealBright,
    },
  ];

  return (
    <Section
      id="modes"
      eyebrow="OPERATING MODES"
      title="Discovery → Supervised → Autonomous"
      sub="A progressive trust ladder. Score gates determine which mode an agent qualifies for."
    >
      <motion.div
        className="v-modes"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10%" }}
        variants={stagger}
      >
        {modes.map((m, i) => (
          <motion.div
            key={m.title}
            className="v-mode"
            variants={fadeUp}
            custom={i}
            whileHover={{ y: -6, transition: { duration: 0.25 } }}
          >
            <div className="v-mode-step">{m.step}</div>
            <div className="v-mode-icon">{m.icon}</div>
            <h3 className="v-mode-title">{m.title}</h3>
            <p className="v-mode-copy">{m.copy}</p>
            <div
              className="v-mode-bar"
              style={{
                background: `linear-gradient(90deg, ${m.color}, transparent)`,
              }}
            />
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────
 * SCORE GATES
 * ──────────────────────────────────────────────────────────── */
function ScoreGates() {
  const gates = [
    { op: "read", min: 300, color: T.amber },
    { op: "transfer", min: 500, color: T.green },
    { op: "mint", min: 500, color: T.green },
    { op: "order", min: 600, color: T.teal },
  ];
  return (
    <Section
      id="gates"
      eyebrow="TOKENFORGE CHAIN API"
      title="Score Gates"
      sub="Minimum trust score required to invoke each operation. Gates are enforced by tokenforge before any settlement."
    >
      <div className="v-gates">
        {gates.map((g, i) => (
          <motion.div
            key={g.op}
            className="v-gate"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
          >
            <div className="v-gate-head">
              <code className="v-gate-op">{g.op}</code>
              <span className="v-gate-min">≥ {g.min}</span>
            </div>
            <div className="v-gate-track">
              <motion.div
                className="v-gate-fill"
                style={{ background: g.color }}
                initial={{ width: 0 }}
                whileInView={{ width: `${(g.min / 1000) * 100}%` }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
              <div className="v-gate-scale">
                <span>0</span>
                <span>500</span>
                <span>1000</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────
 * ARCHITECTURE
 * ──────────────────────────────────────────────────────────── */
function Architecture() {
  const chains = [
    {
      tag: "TRUST",
      name: "Algorand",
      role: "Agentic Trust Layer",
      points: ["KYA Score (0–1000)", "Soulbound Token (ASA)", "x402 Payment Gate", "Bazaar Discovery"],
      accent: T.teal,
    },
    {
      tag: "GATE",
      name: "tokenforge",
      role: "Regulated Gate",
      points: ["Chain API · ERC-1400", "eWpG-compliant Custody", "MiFID II-ready", "Auction Engine"],
      accent: T.purple,
    },
    {
      tag: "SETTLE",
      name: "Stellar",
      role: "Asset Settlement",
      points: ["eWpG Mint", "ISIN Anchoring", "EURC Stablecoin", "Path Payments"],
      accent: T.tealBright,
    },
  ];

  return (
    <Section
      id="architecture"
      eyebrow="ARCHITECTURE"
      title="Three chains. One agent flow."
      sub="Complementary, not competitive. Each chain owns one concern."
    >
      <motion.div
        className="v-chains"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
      >
        {chains.map((c, i) => (
          <motion.div
            key={c.name}
            className="v-chain"
            variants={fadeUp}
            custom={i}
            whileHover={{ y: -4 }}
          >
            <span
              className="v-chain-tag"
              style={{ color: c.accent, borderColor: c.accent + "40" }}
            >
              {c.tag}
            </span>
            <div className="v-chain-name">{c.name}</div>
            <div className="v-chain-role">{c.role}</div>
            <ul className="v-chain-points">
              {c.points.map((p) => (
                <li key={p}>
                  <span className="v-chain-bullet" style={{ background: c.accent }} />
                  {p}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────
 * LIVE SBT
 * ──────────────────────────────────────────────────────────── */
function LiveSBT() {
  const ASSET = "759213121";
  const explorers = [
    { name: "AlgoExplorer", url: `https://testnet.algoexplorer.io/asset/${ASSET}` },
    { name: "Pera", url: `https://explorer.perawallet.app/assets/${ASSET}/?network=testnet` },
    { name: "Allo", url: `https://allo.info/asset/${ASSET}` },
  ];

  return (
    <Section
      id="sbt"
      eyebrow="VERIFIABLE ON TESTNET"
      title="Soulbound Accreditation Token"
      sub="A non-transferable Algorand Standard Asset (ASA) bound to each accredited agent. Frozen at birth, clawback-revocable, manager-immutable."
    >
      <motion.div
        className="v-sbt"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="v-sbt-left">
          <div className="v-sbt-tag">ASA · Algorand Testnet</div>
          <div className="v-sbt-id-label">Asset ID</div>
          <div className="v-sbt-id">{ASSET}</div>
          <div className="v-sbt-explorers">
            {explorers.map((e) => (
              <a
                key={e.name}
                href={e.url}
                target="_blank"
                rel="noopener"
                className="v-sbt-explorer"
              >
                {e.name} <Arrow />
              </a>
            ))}
          </div>
        </div>
        <div className="v-sbt-right">
          <div className="v-sbt-spec">
            <div className="v-sbt-spec-row"><span>total</span><code>1</code></div>
            <div className="v-sbt-spec-row"><span>decimals</span><code>0</code></div>
            <div className="v-sbt-spec-row"><span>defaultFrozen</span><code>true</code></div>
            <div className="v-sbt-spec-row"><span>manager</span><code>"" (immutable)</code></div>
            <div className="v-sbt-spec-row"><span>freeze</span><code>"" (no unfreeze)</code></div>
            <div className="v-sbt-spec-row"><span>clawback</span><code>VERUN_ADDR</code></div>
          </div>
          <div className="v-sbt-note">
            Wallet binding: Ed25519 challenge-response via AVM
            <code> ed25519verify</code> opcode. Roadmap: Smart ASA (ARC-20) with
            score + tier in AVM Box Storage.
          </div>
        </div>
      </motion.div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────
 * COMPLIANCE — EU AI Act primary, MiCA footnoted
 * ──────────────────────────────────────────────────────────── */
function Compliance() {
  const anchors = [
    {
      name: "EU AI Act",
      cite: "Reg. 2024/1689",
      scope: "Risk classification, transparency (Art. 12), human oversight (Art. 14).",
      role: "Primary frame for autonomous agent operation in high-risk domains.",
    },
    {
      name: "MiFID II",
      cite: "Art. 17 + RTS 6",
      scope: "Algorithmic trading safeguards, kill-switch, pre-trade controls.",
      role: "Applies when agents originate or route orders for regulated instruments.",
    },
    {
      name: "eIDAS 2.0 / EUDI",
      cite: "Reg. 2024/1183",
      scope: "Attribute attestations, qualified electronic signatures, EUDI Wallet.",
      role: "Verun SBT acts as a credential — interoperable with EUDI architecture.",
    },
    {
      name: "DORA",
      cite: "Reg. 2022/2554",
      scope: "Operational resilience, ICT risk management, third-party oversight.",
      role: "Validator consensus + on-chain anchoring map directly to DORA requirements.",
    },
  ];

  return (
    <Section
      id="compliance"
      eyebrow="EU REGULATORY ANCHORS"
      title="Built around the agentic regulatory stack."
      sub="Verun is not a crypto-asset. The SBT is a non-tradeable credential. Primary regulatory anchors below."
    >
      <motion.div
        className="v-comp-grid"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
      >
        {anchors.map((a, i) => (
          <motion.div
            key={a.name}
            className="v-comp"
            variants={fadeUp}
            custom={i}
            whileHover={{ y: -4 }}
          >
            <div className="v-comp-head">
              <div className="v-comp-name">{a.name}</div>
              <code className="v-comp-cite">{a.cite}</code>
            </div>
            <div className="v-comp-scope">{a.scope}</div>
            <div className="v-comp-role">{a.role}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="v-comp-audit">
        <div className="v-comp-audit-tag">AUDIT</div>
        <div>
          <strong>PwC-grade legal audit</strong> scheduled for Q3 2026, funded
          by Algorand Foundation xGov Grant Milestone 1. Public legal opinion to
          follow.
        </div>
      </div>

      <div className="v-comp-mica">
        <em>Note on MiCA:</em> potential on-chain features at the tokenforge
        integration boundary, pre-audit. Verun itself is not a crypto-asset
        and the SBT is a non-tradeable credential, so MiCA is not Verun's
        primary regulatory frame.
      </div>
    </Section>
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
      tagColor: T.teal,
      badges: ["Deutsche Bank (EVO Payments)", "U.S. Bank (Elavon)", "DASH DAO"],
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
      tagColor: T.purple,
      badges: ["BCP Labs"],
    },
  ];

  return (
    <Section
      id="team"
      eyebrow="TEAM"
      title="Built by operators."
      sub="BCP Partners GmbH · Berlin · founded by senior banking & payments practitioners."
    >
      <motion.div
        className="v-team"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
      >
        {team.map((p, i) => (
          <motion.div
            key={p.name}
            className="v-tcard"
            variants={fadeUp}
            custom={i}
            whileHover={{ y: -3 }}
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
                <span key={b} className="v-tcard-badge">{b}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

/* ────────────────────────────────────────────────────────────
 * CTA + FOOTER
 * ──────────────────────────────────────────────────────────── */
function CTAFooter() {
  return (
    <>
      <section className="v-cta">
        <div className="v-container v-cta-inner">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            See it on Algorand Testnet.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Real endpoints. Real ASA. Real transactions you can verify in three
            different explorers.
          </motion.p>
          <motion.div
            className="v-cta-btns"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <a href="/docs.html" className="v-btn v-btn-primary">
              Read the Docs <Arrow />
            </a>
            <a
              href="https://github.com/Fahad00674/verun-algorand-mvp"
              className="v-btn v-btn-ghost"
              target="_blank"
              rel="noopener"
            >
              View on GitHub
            </a>
            <a href="mailto:fahad@bcpp.io" className="v-btn v-btn-ghost">
              Contact
            </a>
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
            <div className="v-footer-tag">
              Accredited Agents for Regulated Finance.
            </div>
            <div className="v-footer-corp">
              © 2026 BCP Partners GmbH · Rheinsberger Str. 76/77 · 10115 Berlin · HRB 987654
            </div>
          </div>
          <div className="v-footer-right">
            <div className="v-footer-col">
              <div className="v-footer-h">Protocol</div>
              <a href="#modes">Modes</a>
              <a href="#architecture">Architecture</a>
              <a href="#compliance">Compliance</a>
            </div>
            <div className="v-footer-col">
              <div className="v-footer-h">Resources</div>
              <a href="/docs.html">Docs</a>
              <a href="https://github.com/Fahad00674/verun-algorand-mvp" target="_blank" rel="noopener">GitHub</a>
              <a href="https://verun-stellar-demo.vercel.app" target="_blank" rel="noopener">Stellar Demo</a>
            </div>
            <div className="v-footer-col">
              <div className="v-footer-h">Contact</div>
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
    <>
      <Styles />
      <main className="v-root">
        <Nav />
        <Hero />
        <TrustStrip />
        <Modes />
        <ScoreGates />
        <Architecture />
        <LiveSBT />
        <Compliance />
        <Team />
        <CTAFooter />
      </main>
    </>
  );
}

/* ────────────────────────────────────────────────────────────
 * STYLES — single source of truth
 * ──────────────────────────────────────────────────────────── */
function Styles() {
  return (
    <style jsx global>{`
      @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap");

      :root {
        --bg: ${T.bg};
        --bg2: ${T.bg2};
        --card: ${T.card};
        --card2: ${T.card2};
        --teal: ${T.teal};
        --teal-bright: ${T.tealBright};
        --teal-dim: ${T.tealDim};
        --teal-border: ${T.tealBorder};
        --purple: ${T.purple};
        --green: ${T.green};
        --amber: ${T.amber};
        --red: ${T.red};
        --text: ${T.text};
        --text2: ${T.text2};
        --text3: ${T.text3};
        --border: ${T.border};
        --radius: 14px;
        --mono: "IBM Plex Mono", ui-monospace, monospace;
        --sans: "Inter", system-ui, sans-serif;
      }

      *,
      *::before,
      *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body {
        font-family: var(--sans);
        background: var(--bg);
        color: var(--text);
        line-height: 1.6;
        font-size: 15px;
        overflow-x: hidden;
        -webkit-font-smoothing: antialiased;
      }
      a { color: var(--teal); text-decoration: none; }
      code { font-family: var(--mono); font-size: 0.9em; }

      .v-root { background: var(--bg); }
      .v-container { max-width: 1140px; margin: 0 auto; padding: 0 24px; }

      /* NAV */
      .v-nav {
        position: sticky; top: 0; z-index: 100;
        height: 64px; padding: 0 24px;
        display: flex; align-items: center; justify-content: space-between;
        background: rgba(7,17,31,0.86);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border-bottom: 1px solid var(--border);
      }
      .v-logo {
        display: flex; align-items: center; gap: 10px;
        font-weight: 800; font-size: 16px; color: var(--text); letter-spacing: 0.02em;
      }
      .v-logo-mark {
        display: inline-flex; align-items: center; justify-content: center;
        width: 26px; height: 26px; border-radius: 7px;
        background: linear-gradient(135deg, var(--teal), var(--teal-bright));
        color: var(--bg); font-weight: 800; font-size: 14px;
      }
      .v-logo-tag {
        font-size: 9px; font-weight: 800; letter-spacing: 0.12em;
        background: var(--teal); color: var(--bg);
        padding: 2px 7px; border-radius: 4px;
      }
      .v-nav-links { display: flex; gap: 28px; }
      .v-nav-links a {
        font-size: 13px; font-weight: 500; color: var(--text2);
        transition: color 0.2s;
      }
      .v-nav-links a:hover { color: var(--teal); }
      @media (max-width: 760px) { .v-nav-links { display: none; } }

      .v-live-badge {
        display: inline-flex; align-items: center; gap: 8px;
        font-size: 11px; font-weight: 600; color: var(--teal);
        background: var(--teal-dim); border: 1px solid var(--teal-border);
        padding: 5px 12px; border-radius: 999px; font-family: var(--mono);
      }
      .v-live-dot {
        width: 7px; height: 7px; border-radius: 50%; background: var(--teal);
        box-shadow: 0 0 0 0 var(--teal);
        animation: v-pulse 2s infinite;
      }
      @keyframes v-pulse {
        0% { box-shadow: 0 0 0 0 rgba(0,212,170,0.6); }
        70% { box-shadow: 0 0 0 8px rgba(0,212,170,0); }
        100% { box-shadow: 0 0 0 0 rgba(0,212,170,0); }
      }

      /* HERO */
      .v-hero { position: relative; padding: 100px 0 56px; overflow: hidden; }
      .v-hero-grid {
        position: absolute; inset: 0;
        background-image:
          linear-gradient(rgba(0,212,170,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,170,0.04) 1px, transparent 1px);
        background-size: 52px 52px;
        mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent);
        -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent);
      }
      .v-hero-glow {
        position: absolute; top: -120px; left: 50%; transform: translateX(-50%);
        width: 900px; height: 500px;
        background: radial-gradient(ellipse, rgba(0,212,170,0.08) 0%, transparent 70%);
        pointer-events: none;
      }
      .v-hero-inner { position: relative; text-align: center; }
      .v-eyebrow {
        display: inline-flex; align-items: center; gap: 8px;
        font-size: 11px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase;
        color: var(--teal); background: var(--teal-dim);
        border: 1px solid var(--teal-border);
        padding: 6px 14px; border-radius: 999px;
        margin-bottom: 28px;
      }
      .v-eyebrow-dot {
        width: 5px; height: 5px; border-radius: 50%; background: var(--teal);
      }
      .v-h1 {
        font-size: clamp(36px, 5.6vw, 68px);
        font-weight: 800; line-height: 1.05;
        letter-spacing: -0.025em;
        margin-bottom: 22px;
      }
      .v-h1-accent {
        background: linear-gradient(120deg, var(--teal) 0%, var(--teal-bright) 60%, #B0FFE7 100%);
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .v-hero-sub {
        font-size: 17px; color: var(--text2);
        max-width: 680px; margin: 0 auto 40px; line-height: 1.7;
      }
      .v-hero-sub strong { color: var(--text); font-weight: 600; }

      .v-hero-meter { display: flex; justify-content: center; margin: 8px 0 36px; }

      .v-hero-stats {
        display: grid; grid-template-columns: repeat(3, 1fr);
        gap: 12px; max-width: 640px; margin: 0 auto 32px;
      }
      @media (max-width: 640px) {
        .v-hero-stats { grid-template-columns: 1fr; }
      }
      .v-stat {
        background: var(--card); border: 1px solid var(--border);
        border-radius: var(--radius); padding: 16px 18px; text-align: left;
      }
      .v-stat-top { display: flex; align-items: baseline; gap: 6px; }
      .v-stat-num { font-family: var(--mono); font-size: 22px; font-weight: 600; color: var(--text); }
      .v-stat-unit { font-family: var(--mono); font-size: 12px; color: var(--text3); }
      .v-stat-label { font-size: 12px; color: var(--text2); margin-top: 4px; }

      .v-hero-cta { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
      .v-btn {
        display: inline-flex; align-items: center; gap: 8px;
        font-family: var(--sans); font-size: 14px; font-weight: 600;
        cursor: pointer; border: none; border-radius: 10px;
        padding: 13px 24px; transition: all 0.22s ease;
      }
      .v-btn-primary {
        background: var(--teal); color: var(--bg);
        box-shadow: 0 0 0 0 rgba(0,212,170,0);
      }
      .v-btn-primary:hover {
        background: var(--teal-bright);
        box-shadow: 0 0 24px rgba(0,212,170,0.35);
        transform: translateY(-1px);
      }
      .v-btn-ghost {
        background: transparent; color: var(--text);
        border: 1px solid var(--border);
      }
      .v-btn-ghost:hover { border-color: var(--teal-border); color: var(--teal); }

      /* TRUST METER */
      .v-meter { position: relative; width: 280px; height: 280px; }
      .v-meter-center {
        position: absolute; inset: 0;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
      }
      .v-meter-num {
        font-family: var(--mono); font-size: 72px; font-weight: 600; color: var(--text);
        letter-spacing: -0.03em; line-height: 1;
        font-variant-numeric: tabular-nums;
      }
      .v-meter-tier {
        font-size: 11px; font-weight: 700; letter-spacing: 0.18em;
        margin-top: 6px;
      }
      .v-meter-scale {
        font-family: var(--mono); font-size: 11px; color: var(--text3);
        margin-top: 2px;
      }

      /* TRUST STRIP */
      .v-strip {
        border-top: 1px solid var(--border);
        border-bottom: 1px solid var(--border);
        background: linear-gradient(180deg, var(--bg), var(--bg2));
        padding: 18px 0;
      }
      .v-strip-inner {
        display: flex; align-items: center; gap: 24px; flex-wrap: wrap;
      }
      .v-strip-label {
        font-family: var(--mono); font-size: 11px; font-weight: 600;
        letter-spacing: 0.18em; color: var(--teal);
      }
      .v-strip-items {
        display: flex; gap: 14px; flex-wrap: wrap; align-items: center;
      }
      .v-strip-item {
        display: inline-flex; align-items: center; gap: 8px;
        font-family: var(--mono); font-size: 12px; color: var(--text2);
      }
      .v-method {
        font-size: 10px; font-weight: 700; letter-spacing: 0.05em;
        padding: 2px 7px; border-radius: 4px;
      }
      .v-method-get { background: rgba(0,212,170,0.14); color: var(--teal); }
      .v-method-post { background: rgba(123,97,255,0.16); color: var(--purple); }
      .v-method-asa { background: rgba(255,176,32,0.14); color: var(--amber); }

      /* SECTION */
      .v-section { padding: 88px 0; position: relative; }
      .v-section-head { text-align: center; margin-bottom: 52px; }
      .v-section-eyebrow {
        display: inline-block;
        font-family: var(--mono); font-size: 11px; font-weight: 600;
        letter-spacing: 0.18em; color: var(--teal);
        margin-bottom: 14px;
      }
      .v-section-title {
        font-size: clamp(28px, 3.4vw, 40px); font-weight: 700;
        letter-spacing: -0.02em; line-height: 1.15;
        max-width: 780px; margin: 0 auto;
      }
      .v-section-sub {
        font-size: 16px; color: var(--text2);
        max-width: 620px; margin: 14px auto 0; line-height: 1.65;
      }

      /* MODES */
      .v-modes {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px;
      }
      @media (max-width: 880px) { .v-modes { grid-template-columns: 1fr; } }
      .v-mode {
        position: relative; overflow: hidden;
        background: var(--card); border: 1px solid var(--border);
        border-radius: var(--radius); padding: 28px 24px 32px;
        transition: border-color 0.25s, background 0.25s;
      }
      .v-mode:hover {
        border-color: var(--teal-border);
        background: var(--card2);
      }
      .v-mode-step {
        font-family: var(--mono); font-size: 12px; color: var(--text3);
        letter-spacing: 0.1em; margin-bottom: 18px;
      }
      .v-mode-icon { font-size: 28px; margin-bottom: 14px; }
      .v-mode-title {
        font-size: 22px; font-weight: 700; letter-spacing: -0.01em; margin-bottom: 10px;
      }
      .v-mode-copy { font-size: 14px; color: var(--text2); line-height: 1.65; }
      .v-mode-bar {
        position: absolute; left: 0; bottom: 0;
        width: 100%; height: 2px;
        opacity: 0.5;
      }

      /* GATES */
      .v-gates { display: flex; flex-direction: column; gap: 16px; max-width: 760px; margin: 0 auto; }
      .v-gate {
        background: var(--card); border: 1px solid var(--border);
        border-radius: var(--radius); padding: 18px 22px;
      }
      .v-gate-head {
        display: flex; align-items: baseline; justify-content: space-between;
        margin-bottom: 10px;
      }
      .v-gate-op {
        font-family: var(--mono); font-size: 14px; font-weight: 600; color: var(--text);
      }
      .v-gate-min { font-family: var(--mono); font-size: 13px; color: var(--text2); }
      .v-gate-track {
        position: relative;
        background: rgba(255,255,255,0.04); height: 8px; border-radius: 999px;
        overflow: hidden;
      }
      .v-gate-fill { height: 100%; border-radius: 999px; }
      .v-gate-scale {
        position: absolute; left: 0; right: 0; bottom: -18px;
        display: flex; justify-content: space-between;
        font-family: var(--mono); font-size: 10px; color: var(--text3);
      }

      /* CHAINS */
      .v-chains { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
      @media (max-width: 880px) { .v-chains { grid-template-columns: 1fr; } }
      .v-chain {
        background: var(--card); border: 1px solid var(--border);
        border-radius: var(--radius); padding: 28px 24px;
        transition: border-color 0.25s;
      }
      .v-chain:hover { border-color: var(--teal-border); }
      .v-chain-tag {
        display: inline-block;
        font-family: var(--mono); font-size: 10px; font-weight: 700; letter-spacing: 0.16em;
        padding: 3px 9px; border-radius: 4px;
        border: 1px solid; margin-bottom: 18px;
      }
      .v-chain-name {
        font-size: 26px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 4px;
      }
      .v-chain-role {
        font-size: 13px; color: var(--text2); margin-bottom: 18px;
      }
      .v-chain-points { list-style: none; display: flex; flex-direction: column; gap: 8px; }
      .v-chain-points li {
        display: flex; align-items: center; gap: 10px;
        font-size: 13px; color: var(--text);
      }
      .v-chain-bullet {
        width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
      }

      /* SBT */
      .v-sbt {
        display: grid; grid-template-columns: 1fr 1fr; gap: 0;
        background: linear-gradient(135deg, var(--card) 0%, var(--card2) 100%);
        border: 1px solid var(--teal-border);
        border-radius: var(--radius); overflow: hidden;
        position: relative;
      }
      .v-sbt::before {
        content: "";
        position: absolute; top: -50%; right: -10%;
        width: 400px; height: 400px;
        background: radial-gradient(circle, rgba(0,212,170,0.10) 0%, transparent 60%);
        pointer-events: none;
      }
      @media (max-width: 760px) { .v-sbt { grid-template-columns: 1fr; } }
      .v-sbt-left, .v-sbt-right { padding: 36px 36px; position: relative; }
      .v-sbt-right { border-left: 1px solid var(--border); }
      @media (max-width: 760px) { .v-sbt-right { border-left: none; border-top: 1px solid var(--border); } }
      .v-sbt-tag {
        display: inline-block;
        font-family: var(--mono); font-size: 10px; font-weight: 700; letter-spacing: 0.16em;
        color: var(--teal); background: var(--teal-dim);
        border: 1px solid var(--teal-border);
        padding: 4px 10px; border-radius: 4px; margin-bottom: 22px;
      }
      .v-sbt-id-label {
        font-family: var(--mono); font-size: 11px; color: var(--text3);
        letter-spacing: 0.1em; margin-bottom: 8px;
      }
      .v-sbt-id {
        font-family: var(--mono); font-size: 36px; font-weight: 600;
        color: var(--text); letter-spacing: -0.01em; margin-bottom: 22px;
        font-variant-numeric: tabular-nums;
      }
      .v-sbt-explorers { display: flex; gap: 10px; flex-wrap: wrap; }
      .v-sbt-explorer {
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 12px; font-weight: 600;
        background: rgba(255,255,255,0.04); border: 1px solid var(--border);
        color: var(--text); padding: 8px 14px; border-radius: 8px;
        transition: all 0.2s;
      }
      .v-sbt-explorer:hover {
        border-color: var(--teal-border); color: var(--teal);
        background: var(--teal-dim);
      }

      .v-sbt-spec {
        background: rgba(7,17,31,0.5); border: 1px solid var(--border);
        border-radius: 10px; padding: 16px 18px; margin-bottom: 16px;
      }
      .v-sbt-spec-row {
        display: flex; justify-content: space-between; align-items: baseline;
        padding: 6px 0; font-size: 13px;
        border-bottom: 1px dashed rgba(255,255,255,0.04);
      }
      .v-sbt-spec-row:last-child { border-bottom: none; }
      .v-sbt-spec-row span { color: var(--text2); font-family: var(--mono); }
      .v-sbt-spec-row code { color: var(--teal); }
      .v-sbt-note {
        font-size: 12px; color: var(--text2); line-height: 1.6;
      }
      .v-sbt-note code { color: var(--text); background: rgba(255,255,255,0.04); padding: 1px 5px; border-radius: 3px; }

      /* COMPLIANCE */
      .v-comp-grid {
        display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;
      }
      @media (max-width: 760px) { .v-comp-grid { grid-template-columns: 1fr; } }
      .v-comp {
        background: var(--card); border: 1px solid var(--border);
        border-radius: var(--radius); padding: 24px 26px;
        transition: border-color 0.25s, background 0.25s;
      }
      .v-comp:hover { border-color: var(--teal-border); }
      .v-comp-head {
        display: flex; align-items: baseline; justify-content: space-between;
        gap: 12px; margin-bottom: 12px;
      }
      .v-comp-name {
        font-size: 18px; font-weight: 700; color: var(--text); letter-spacing: -0.01em;
      }
      .v-comp-cite {
        font-family: var(--mono); font-size: 11px; font-weight: 500;
        color: var(--teal); background: var(--teal-dim);
        padding: 3px 8px; border-radius: 4px; flex-shrink: 0;
      }
      .v-comp-scope {
        font-size: 13.5px; color: var(--text); margin-bottom: 8px; line-height: 1.6;
      }
      .v-comp-role {
        font-size: 12.5px; color: var(--text2); line-height: 1.6;
      }

      .v-comp-audit {
        margin-top: 28px; padding: 18px 22px;
        background: linear-gradient(90deg, rgba(0,212,170,0.06), transparent);
        border: 1px solid var(--teal-border); border-radius: var(--radius);
        display: flex; align-items: center; gap: 14px;
        font-size: 14px; color: var(--text);
      }
      .v-comp-audit-tag {
        font-family: var(--mono); font-size: 10px; font-weight: 700; letter-spacing: 0.18em;
        color: var(--teal); background: var(--teal-dim);
        padding: 4px 9px; border-radius: 4px;
        flex-shrink: 0;
      }
      .v-comp-audit strong { color: var(--text); font-weight: 600; }

      .v-comp-mica {
        margin-top: 16px; padding: 12px 18px;
        font-size: 12px; color: var(--text3); font-style: italic;
        line-height: 1.65; text-align: center;
        max-width: 720px; margin-left: auto; margin-right: auto;
      }
      .v-comp-mica em { color: var(--text2); font-style: normal; font-weight: 600; margin-right: 4px; }

      /* TEAM */
      .v-team { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      @media (max-width: 880px) { .v-team { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 560px) { .v-team { grid-template-columns: 1fr; } }
      .v-tcard {
        position: relative;
        background: var(--card); border: 1px solid var(--border);
        border-radius: var(--radius); padding: 22px 22px 20px;
        transition: border-color 0.25s, background 0.25s;
      }
      .v-tcard:hover { border-color: var(--teal-border); background: var(--card2); }
      .v-tcard-tag {
        position: absolute; top: 14px; right: 14px;
        font-family: var(--mono); font-size: 9px; font-weight: 700;
        letter-spacing: 0.16em;
        padding: 3px 8px; border-radius: 4px;
        border: 1px solid; background: rgba(7,17,31,0.6);
      }
      .v-tcard-name {
        font-size: 17px; font-weight: 700; color: var(--text);
        letter-spacing: -0.01em; margin-bottom: 4px;
      }
      .v-tcard-role { font-size: 13px; color: var(--text2); margin-bottom: 14px; }
      .v-tcard-badges { display: flex; gap: 6px; flex-wrap: wrap; }
      .v-tcard-badge {
        font-size: 10.5px; font-weight: 500;
        background: rgba(255,255,255,0.04); border: 1px solid var(--border);
        color: var(--text); padding: 3px 8px; border-radius: 999px;
      }

      /* CTA */
      .v-cta {
        padding: 96px 0 88px;
        background: radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,212,170,0.08), transparent);
        text-align: center;
        border-top: 1px solid var(--border);
      }
      .v-cta-inner h2 {
        font-size: clamp(32px, 4vw, 48px); font-weight: 700;
        letter-spacing: -0.025em; line-height: 1.1; margin-bottom: 14px;
      }
      .v-cta-inner p {
        font-size: 16px; color: var(--text2); max-width: 580px; margin: 0 auto 30px;
      }
      .v-cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

      /* FOOTER */
      .v-footer {
        background: var(--bg);
        border-top: 1px solid var(--border);
        padding: 56px 0 40px;
      }
      .v-footer-inner {
        display: grid; grid-template-columns: 1fr 2fr; gap: 48px;
      }
      @media (max-width: 760px) {
        .v-footer-inner { grid-template-columns: 1fr; gap: 32px; }
      }
      .v-footer-logo {
        display: flex; align-items: center; gap: 10px;
        font-weight: 800; font-size: 16px; color: var(--text);
        margin-bottom: 12px;
      }
      .v-footer-tag { font-size: 13px; color: var(--text2); margin-bottom: 16px; }
      .v-footer-corp { font-size: 12px; color: var(--text3); line-height: 1.65; }
      .v-footer-right {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
      }
      @media (max-width: 560px) {
        .v-footer-right { grid-template-columns: repeat(2, 1fr); }
      }
      .v-footer-col { display: flex; flex-direction: column; gap: 8px; }
      .v-footer-h {
        font-family: var(--mono); font-size: 11px; font-weight: 600;
        letter-spacing: 0.14em; color: var(--text3); margin-bottom: 4px;
      }
      .v-footer-col a { font-size: 13px; color: var(--text); transition: color 0.2s; }
      .v-footer-col a:hover { color: var(--teal); }
    `}</style>
  );
}
