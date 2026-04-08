import { Heart, Sparkles, Star } from "lucide-react";
import React from "react";

interface MatrimonialBannerProps {
  onNavigate: () => void;
}

export default function MatrimonialBanner({
  onNavigate,
}: MatrimonialBannerProps) {
  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.97 0.012 80) 0%, oklch(0.95 0.02 75) 40%, oklch(0.93 0.025 85) 100%)",
        }}
      />
      {/* Subtle mandala decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -right-24 top-1/2 -translate-y-1/2 w-64 h-64 opacity-5">
          <svg
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <title>Decorative mandala</title>
            {[40, 60, 80].map((r) => (
              <circle
                key={r}
                cx="100"
                cy="100"
                r={r}
                fill="none"
                stroke="oklch(0.62 0.09 75)"
                strokeWidth="0.8"
              />
            ))}
            {[0, 45, 90, 135].map((angle) => (
              <line
                key={angle}
                x1="100"
                y1="20"
                x2="100"
                y2="180"
                stroke="oklch(0.62 0.09 75)"
                strokeWidth="0.5"
                transform={`rotate(${angle} 100 100)`}
              />
            ))}
          </svg>
        </div>
        <div className="absolute -left-16 top-1/2 -translate-y-1/2 w-48 h-48 opacity-5">
          <svg
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <title>Decorative mandala</title>
            {[40, 60, 80].map((r) => (
              <circle
                key={r}
                cx="100"
                cy="100"
                r={r}
                fill="none"
                stroke="oklch(0.62 0.09 75)"
                strokeWidth="0.8"
              />
            ))}
          </svg>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Top accent */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="celestial-divider w-16" />
          <Star size={14} className="text-gold" fill="currentColor" />
          <div className="celestial-divider w-16" />
        </div>

        {/* Icon cluster */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <Sparkles size={22} className="text-gold/60" />
          <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center border border-gold/25 shadow-inner">
            <Heart size={22} className="text-gold-dark" fill="currentColor" />
          </div>
          <Sparkles size={22} className="text-gold/60" />
        </div>

        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal mb-3">
          Find Your <span className="text-gold-dark">Life Partner</span>
        </h2>

        <p className="text-charcoal/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
          Connect with spiritually compatible souls guided by Vedic astrology,
          numerology, and palmistry insights. Our matrimonial platform blends
          ancient wisdom with modern matchmaking.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onNavigate}
            data-ocid="matrimonial.primary_button"
            className="btn-gold text-base px-8 py-3 flex items-center gap-2"
          >
            <Heart size={16} fill="currentColor" />
            Explore Matrimonial Profiles
          </button>
          <div className="text-sm text-charcoal/40 italic">
            Join hundreds of spiritually aligned seekers
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
          {[
            { value: "Vedic", label: "Astrology Guided" },
            { value: "Free", label: "Basic Profiles" },
            { value: "Secure", label: "Contact Sharing" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-serif text-xl font-semibold text-gold-dark">
                {stat.value}
              </div>
              <div className="text-xs text-charcoal/45 mt-0.5 tracking-wide uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom divider */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <div className="celestial-divider w-16" />
          <Star size={12} className="text-gold/60" fill="currentColor" />
          <div className="celestial-divider w-16" />
        </div>
      </div>
    </section>
  );
}
