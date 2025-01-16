'use client';

import React, { Suspense } from 'react';
import { Disc, Sparkles, TrendingUp, Radio, Heart, Crown, Headphones, Home, Github } from 'lucide-react';
import MusicFeatured from '@/components/TrendingSection';
import MusicDiscovery from '@/components/MusicDiscovery';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50/50 to-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-100/50 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <img 
                src="/logo.png"
                alt="Serenade"
                className="h-8"
              />
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-teal-600 transition-colors"
                >
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative pt-24">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center gap-3 px-6 py-2 rounded-full bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-100/50 mb-6">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-teal-400 animate-pulse"></div>
              <span className="text-slate-600 text-sm font-medium">AI-Powered Recommendations</span>
            </div>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-teal-600 text-transparent bg-clip-text pb-2">
              Your Music Universe
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Discover new sounds tailored just for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            {[
              { icon: Radio, label: "Listening Minutes", value: "142K" },
              { icon: Heart, label: "Liked Songs", value: "486" },
              { icon: Crown, label: "Top Genre", value: "Jazz" },
              { icon: Headphones, label: "Daily Streak", value: "12 Days" }
            ].map((stat) => (
              <div key={stat.label} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-teal-100 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="relative bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-teal-50">
                      <stat.icon className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-16">
            <section className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-teal-50 rounded-3xl blur-xl opacity-60"></div>
              <div className="relative backdrop-blur-sm">
                <div className="bg-white/80 rounded-3xl border border-slate-100 shadow-xl">
                  <div className="p-10">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-teal-50">
                        <Sparkles className="w-6 h-6 text-teal-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800">For You</h2>
                        <p className="text-slate-500">Personalized picks based on your taste</p>
                      </div>
                    </div>
                    <MusicDiscovery />
                  </div>
                </div>
              </div>
            </section>

            <section className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-blue-50 rounded-3xl blur-xl opacity-60"></div>
              <div className="relative backdrop-blur-sm">
                <div className="bg-white/80 rounded-3xl border border-slate-100 shadow-xl">
                  <div className="p-10">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-teal-50">
                        <TrendingUp className="w-6 h-6 text-teal-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800">Featured & Trending</h2>
                        <p className="text-slate-500">What&apos;s hot in your area</p>
                      </div>
                    </div>
                    <Suspense fallback={
                      <div className="flex items-center justify-center min-h-[300px]">
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative">
                            <Disc className="w-12 h-12 text-teal-500 animate-spin-slow" />
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-500 blur-xl opacity-40 animate-pulse"></div>
                          </div>
                          <p className="text-slate-600 animate-pulse font-medium">Personalizing your recommendations...</p>
                        </div>
                      </div>
                    }>
                      <MusicFeatured />
                    </Suspense>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <footer className="relative py-16 mt-24 border-t border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-4">
              <img 
                src="/logo.png"
                alt="Serenade"
                className="h-6"
              />
              <a 
                href="https://github.com/hridaya423/serenade"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-slate-600 transition-colors duration-300"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
            
            <p className="text-slate-400 text-sm">
              © 2025 Serenade. MIT LICENSE
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}