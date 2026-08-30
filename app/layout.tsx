import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "SecureTest | Cyber-Defense Proctoring Platform",
  description: "Monitor. Detect. Review. Next-gen AI proctoring and candidate assessment suite.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <Providers>
          <div className="relative flex min-h-screen flex-col bg-cyber-grid">
            <Header />
            <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </main>
            <footer className="border-t border-slate-800/60 bg-slate-950/80 py-4 text-center text-xs text-slate-500 font-mono">
              SecureTest Security Operations Center &copy; {new Date().getFullYear()} — Encrypted & Verified
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
