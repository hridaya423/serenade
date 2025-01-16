import React from 'react';
import { TrendingUp, Sparkles, Calendar, ArrowRight, Github, Music, Headphones, Radio } from 'lucide-react';

export default function SerenadeHome() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="container mx-auto px-8 py-6 flex justify-between items-center">
          <img 
            src="/logo.png"
            alt="Serenade"
            className="w-44"
          />
          <a href="/dashboard">
            <button className="group relative px-8 py-4 rounded-full font-medium text-lg transition-all duration-300">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 opacity-90 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative flex items-center gap-3 text-white">
                Start Listening
              </div>
            </button>
          </a>
        </div>
      </nav>

      <div className="relative pt-24">
        <div className="container mx-auto px-8 pt-24 pb-40">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-blue-50 to-teal-50 text-teal-600 text-base mb-10">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-teal-400 animate-pulse"></span>
              Now Available • Start Discovering
            </div>
            
            <h1 className="text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
                Music Discovery
              </span>
              <br />
              At Your Fingertips
            </h1>

            <p className="text-2xl text-slate-600 mb-16 max-w-4xl mx-auto leading-relaxed">
              Experience personalized music recommendations powered by advanced AI
              and millions of listener insights.
            </p>

            <a href="/dashboard">
              <button className="group relative px-8 py-4 rounded-full font-medium text-lg transition-all duration-300 mb-20">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 opacity-90 group-hover:opacity-100 transition-all duration-300"></div>
                <div className="relative flex items-center gap-3 text-white">
                  Start Discovering
                  <ArrowRight className="w-6 h-6" />
                </div>
              </button>
            </a>

            <div className="flex justify-center gap-16">
              {[
                { Icon: TrendingUp, text: "Trending Analysis" },
                { Icon: Sparkles, text: "AI-Powered" },
                { Icon: Calendar, text: "Daily Updates" }
              ].map(({ Icon, text }, index) => (
                <div key={index} className="flex items-center gap-4 text-slate-500">
                  <div className="p-3 rounded-full bg-gradient-to-r from-blue-50 to-teal-50">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xl">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 py-32">
        <div className="container mx-auto px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-6">
                Discover Your Next Favorite Artist
              </h2>
              <p className="text-xl text-slate-500">
                Stay ahead of the curve with our comprehensive music discovery features
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  icon: Music,
                  title: "New Releases",
                  description: "Be the first to know about new tracks and albums from your favorite artists and similar musicians."
                },
                {
                  icon: Headphones,
                  title: "AI Recommendations",
                  description: "Get personalized music suggestions based on your listening history and preferences."
                },
                {
                  icon: Radio,
                  title: "Trending Artists",
                  description: "Stay updated with real-time insights on trending artists and tracks across different genres."
                }
              ].map(({ icon: Icon, title, description }, index) => (
                <div key={index} className="group relative bg-white rounded-3xl p-10 transition-all duration-300 hover:shadow-xl border border-slate-100">
                  <div className="mb-8 inline-block">
                    <div className="relative h-20 w-20">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-teal-100 rounded-xl blur-lg opacity-80 group-hover:opacity-100 transition-all duration-300"></div>
                      <div className="relative h-full w-full bg-white rounded-xl p-5 flex items-center justify-center">
                        <Icon className="w-10 h-10 stroke-blue-500" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                    {title}
                  </h3>
                  <p className="text-lg text-slate-500 leading-relaxed">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <footer className="bg-white border-t border-slate-100">
        <div className="container mx-auto px-8 py-16">
          <div className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-5">
              <img 
                src="/logo.png"
                alt="Serenade"
                className="h-8"
              />
              <a 
                href="https://github.com/hridaya423/serenade"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-slate-600 transition-colors duration-300"
              >
                <Github className="w-6 h-6" />
              </a>
            </div>
            <p className="text-slate-400 text-base">
              © 2025 Serenade. MIT LICENSE
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}