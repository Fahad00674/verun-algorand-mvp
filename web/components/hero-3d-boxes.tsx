"use client";

/**
 * Hero3DBoxes — Spline-powered 3D boxes background for the hero.
 * Tuned to Electric Onyx (warm-black + electric violet).
 * Lazy-loaded so SSR doesn't try to mount the WebGL canvas.
 */

import dynamic from "next/dynamic";
import { Suspense } from "react";

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => null,
});

const SCENE = "https://prod.spline.design/dJqTIQ-tE3ULUPMi/scene.splinecode";

export function Hero3DBoxes() {
  return (
    <div
      aria-hidden
      className="v-hero-3d"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* Spline cubes — base layer (z-index 0) */}
      <Suspense fallback={null}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "auto",
          }}
        >
          <Spline
            scene={SCENE}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </Suspense>

      {/* Brand-tinted scrim — capped at 0.25 opacity so cubes stay clearly visible.
          Sits above cubes (z-index 1), below validator orbs + score meter (z-index 3). */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background: `
            radial-gradient(ellipse 60% 55% at 50% 50%, rgba(159,109,255,0.12) 0%, transparent 65%),
            linear-gradient(to bottom, rgba(11,9,17,0.18) 0%, rgba(11,9,17,0.00) 40%, rgba(11,9,17,0.25) 100%),
            linear-gradient(to right, rgba(11,9,17,0.22) 0%, transparent 20%, transparent 80%, rgba(11,9,17,0.22) 100%)
          `,
        }}
      />
    </div>
  );
}
