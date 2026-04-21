"use client";

import { useAuth } from "@clerk/nextjs";
import {
  ArrowRight,
  Zap,
  Lock,
  Cloud,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white relative overflow-hidden">

      {/* Glow Background */}
      <div className="absolute inset-0">
        <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-pink-600/20 blur-[120px]" />
      </div>

      {/* NAV */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <Link href="/" className="text-2xl font-bold tracking-tight">
            drop<span className="text-purple-500">ly</span>.
          </Link>

          
           {isSignedIn ? (
             <Link
    href="/dashboard"
    className="px-5 py-2 mr-6 rounded-xl bg-purple-600 hover:bg-purple-500 transition text-sm font-medium"
  >
    Dashboard
  </Link>
           ) : (
               <div >
            <Link
            href="/sign-up"
            className="px-5 py-2 mr-6 rounded-xl bg-purple-600 hover:bg-purple-500 transition text-sm font-medium"
          >
            Get Started
          </Link>
            <Link
            href="/sign-in"
            className="px-5 py-2 mr-6 rounded-xl bg-purple-600 hover:bg-purple-500 transition text-sm font-medium"
          >
            Login
          </Link>
          
          </div>
           )}
          
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-24 md:pt-32 pb-20">

        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 text-purple-300 text-xs mb-8 bg-white/5">
            <span className="w-2 h-2 bg-purple-500 rounded-full" />
            Secure Cloud Storage
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Store your files
            <br />
            with <span className="text-purple-500">simplicity.</span>
          </h1>

          <p className="text-white/60 text-lg mt-6 max-w-xl">
            Cloud storage that just works. Upload, organize, and access files from anywhere with speed and security.
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              href="/sign-in"
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 flex items-center gap-2"
            >
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20">

        <h2 className="text-3xl md:text-5xl font-bold mb-12">
          Everything you need for <span className="text-purple-500">storage</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          {features.map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition"
            >
              <div className="mb-4 text-purple-400">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-white/60 text-sm">{f.description}</p>
            </div>
          ))}

        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="relative z-10 max-w-7xl mx-auto px-6 py-20">

        <div className="grid md:grid-cols-2 gap-10 items-center">

          <div>
            <h2 className="text-4xl font-bold mb-4">
              Built for modern <span className="text-purple-500">teams</span>
            </h2>
            <p className="text-white/60 leading-relaxed">
              Droply removes friction from file management. Secure, fast, and invisible storage infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">

            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <Cloud className="w-5 h-5 text-purple-400 mb-2" />
              Cloud First
            </div>

            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <Lock className="w-5 h-5 text-purple-400 mb-2" />
              Secure
            </div>

            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <Zap className="w-5 h-5 text-purple-400 mb-2" />
              Fast
            </div>

          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 py-10 text-center text-white/50">
        © 2026 Droply. All rights reserved.
      </footer>

    </div>
  );
}

const features = [
  {
    icon: <Cloud />,
    title: "Cloud Storage",
    description: "Store and access files anywhere securely.",
  },
  {
    icon: <Zap />,
    title: "Fast Uploads",
    description: "Lightning-fast upload and sync system.",
  },
  {
    icon: <Lock />,
    title: "Privacy First",
    description: "End-to-end secure encrypted storage.",
  },
];