import type { Metadata } from "next";
import "./globals.css";

const favicon =
  "data:image/svg+xml;base64," +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#B87352"/><text x="16" y="22" font-family="Georgia,serif" font-style="italic" font-size="20" fill="#FBF6EF" text-anchor="middle" font-weight="500">n</text></svg>`
  ).toString("base64");

export const metadata: Metadata = {
  title: "Nora Comply · Compliance for European AI teams",
  description:
    "Track every AI system, evidence every obligation, generate the dossier auditors actually want. Built around the EU AI Act and Irish GDPR.",
  metadataBase: new URL("https://demo-nora-comply.vercel.app"),
  openGraph: {
    title: "Nora Comply · Compliance for European AI teams",
    description:
      "Track every AI system, evidence every obligation, generate audit-ready dossiers.",
    url: "https://demo-nora-comply.vercel.app",
    siteName: "Nora Comply",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nora Comply",
    description: "Compliance for European AI teams.",
  },
  icons: {
    icon: [{ url: favicon }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
