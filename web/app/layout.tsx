import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verun Protocol — Accredited Agents for Regulated Finance",
  description:
    "An EU-aligned trust score layer (0–1000) for autonomous AI agents in regulated capital markets. Live on Algorand testnet. Built by BCP Partners GmbH.",
  metadataBase: new URL("https://verun-algorand-mvp.vercel.app"),
  openGraph: {
    title: "Verun Protocol — Accredited Agents for Regulated Finance",
    description:
      "EU AI Act + MiFID II-aligned trust score for autonomous agents. Live on Algorand testnet.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
