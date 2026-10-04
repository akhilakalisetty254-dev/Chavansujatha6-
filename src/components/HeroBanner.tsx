import React from 'react';
import { Sparkles, Shield, Leaf, RefreshCw, ArrowRight } from 'lucide-react';

interface HeroBannerProps {
  onFindClick: () => void;
  onShareClick: () => void;
  onAskAiClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onFindClick,
  onShareClick,
  onAskAiClick,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-xl mb-8 p-6 sm:p-8 md:p-10 border border-indigo-700/50">
      {/* Background ambient decorative circles */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-100 text-xs font-semibold mb-4">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Campus Circular Economy • Active Term 2026</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-3">
            Rent less. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-purple-200">Share more.</span>
          </h1>

          <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed mb-6 font-normal">
            Borrow calculators, cameras, sports equipment, and hostel essentials from verified batchmates.
            Stop buying things you only need for one exam, a weekend match, or a campus project.
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onFindClick}
              className="px-5 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-sm hover:bg-indigo-50 transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Items</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onShareClick}
              className="px-5 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-400/30 text-white font-bold text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer backdrop-blur-sm"
            >
              <span>+ List an Item</span>
            </button>

            <button
              onClick={onAskAiClick}
              className="px-4 py-2.5 rounded-xl bg-purple-500/30 hover:bg-purple-500/40 border border-purple-300/30 text-purple-100 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>Ask CampusBot</span>
            </button>
          </div>
        </div>

        {/* Impact stats card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 sm:p-6 w-full lg:w-80 shrink-0">
          <div className="text-xs uppercase font-extrabold tracking-wider text-indigo-200 mb-3 flex items-center justify-between">
            <span>Campus Impact</span>
            <Leaf className="w-4 h-4 text-emerald-300" />
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white">₹1,42,500+</div>
              <div className="text-xs text-indigo-200">Saved by college students on short rentals</div>
            </div>

            <div className="h-px bg-white/10" />

            <div className="grid grid-cols-2 gap-3 text-left">
              <div>
                <div className="text-lg font-bold text-white">480+</div>
                <div className="text-[11px] text-indigo-200">Active Peer Listings</div>
              </div>
              <div>
                <div className="text-lg font-bold text-emerald-300">1,280 kg</div>
                <div className="text-[11px] text-indigo-200">E-waste Avoided</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust bar pills */}
      <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-indigo-100/80">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>100% Student Verified</span>
        </div>
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-cyan-300 shrink-0" />
          <span>Zero Packaging Waste</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base">📍</span>
          <span>Library & Quad Handover</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base">🔒</span>
          <span>Refundable Deposit Shield</span>
        </div>
      </div>
    </div>
  );
};
