import { Moon, Star } from "lucide-react";
import React from "react";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-20 pb-6 md:pb-8 w-full"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.975 0.008 85) 0%, oklch(0.96 0.015 80) 40%, oklch(0.93 0.018 280) 100%)",
      }}
    >
      <div className="absolute top-6 left-8 opacity-20 text-gold animate-pulse">
        <Star size={24} fill="currentColor" />
      </div>
      <div
        className="absolute top-12 right-12 opacity-15 text-gold animate-pulse"
        style={{ animationDelay: "1s" }}
      >
        <Star size={16} fill="currentColor" />
      </div>
      <div
        className="absolute bottom-4 left-16 opacity-15 text-gold animate-pulse"
        style={{ animationDelay: "2s" }}
      >
        <Moon size={20} />
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-5 pointer-events-none">
        <svg
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <title>Celestial mandala decoration</title>
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="oklch(0.72 0.1 75)"
            strokeWidth="0.5"
          />
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="oklch(0.72 0.1 75)"
            strokeWidth="0.5"
          />
          <circle
            cx="100"
            cy="100"
            r="50"
            fill="none"
            stroke="oklch(0.72 0.1 75)"
            strokeWidth="0.5"
          />
          <circle
            cx="100"
            cy="100"
            r="30"
            fill="none"
            stroke="oklch(0.72 0.1 75)"
            strokeWidth="0.5"
          />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
            (angle) => (
              <line
                key={angle}
                x1="100"
                y1="10"
                x2="100"
                y2="190"
                stroke="oklch(0.72 0.1 75)"
                strokeWidth="0.3"
                transform={`rotate(${angle} 100 100)`}
              />
            ),
          )}
        </svg>
      </div>

      <div className="relative z-10 text-center px-4 w-full max-w-5xl mx-auto overflow-hidden">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="celestial-divider w-12 md:w-20" />
          <Star size={12} className="text-gold" fill="currentColor" />
          <div className="celestial-divider w-12 md:w-20" />
        </div>

        <div className="flex items-center justify-center gap-3 sm:gap-5 mb-2">
          <Star
            size={32}
            className="text-gold shrink-0 hidden sm:block"
            fill="currentColor"
            style={{
              filter: "drop-shadow(0 2px 6px oklch(0.72 0.1 75 / 0.4))",
            }}
          />
          <div className="text-center">
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-charcoal leading-tight break-words">
              <span className="text-gold-dark">Astroplam</span>
              <span className="text-charcoal/40 mx-2 sm:mx-3 font-bold">-</span>
              <span className="italic">Desstiny</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-charcoal/50 font-medium italic tracking-widest mt-1">
              by Viku Kharb
            </p>
          </div>
        </div>

        <p className="font-serif text-base sm:text-lg md:text-xl lg:text-2xl text-charcoal/60 font-light italic mb-3 break-words">
          Where the Stars, Numbers &amp; Palmistry Reveal Your Destiny
        </p>

        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="celestial-divider w-12 md:w-20" />
          <Moon size={14} className="text-gold-dark/70" />
          <div className="celestial-divider w-12 md:w-20" />
        </div>

        <p className="text-charcoal/70 text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed px-2">
          Unlock the ancient wisdom of Nadi Astrology, Numerology, and
          Palmistry. Explore our expert-led courses, personalized services, and
          transformative insights to navigate life&apos;s journey with clarity
          and purpose.
        </p>
      </div>
    </section>
  );
}
