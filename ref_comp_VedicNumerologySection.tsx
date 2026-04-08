import { motion } from "motion/react";
import React from "react";

interface VedicNumerologySectionProps {
  onOpen: () => void;
}

export default function VedicNumerologySection({
  onOpen,
}: VedicNumerologySectionProps) {
  const gridPositions = [
    { num: 3, row: 0, col: 0 },
    { num: 1, row: 0, col: 1 },
    { num: 9, row: 0, col: 2 },
    { num: 6, row: 1, col: 0 },
    { num: 7, row: 1, col: 1 },
    { num: 5, row: 1, col: 2 },
    { num: 2, row: 2, col: 0 },
    { num: 8, row: 2, col: 1 },
    { num: 4, row: 2, col: 2 },
  ];

  return (
    <section
      id="numerology"
      className="py-20 px-4 bg-gradient-to-b from-cream-bg to-lavender/20"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left: Text Content */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-1.5 mb-5">
              <span className="text-gold-dark text-xs font-medium tracking-widest uppercase">
                Ancient Wisdom
              </span>
            </div>

            <h2 className="section-heading text-3xl sm:text-4xl lg:text-5xl mb-4 leading-tight">
              Numerology
              <br />
              <span className="text-charcoal/60 font-light italic text-2xl sm:text-3xl">
                Natal Chart Calculator
              </span>
            </h2>

            <div className="celestial-divider max-w-xs mx-auto lg:mx-0 mb-5" />

            <p className="text-charcoal/70 text-base sm:text-lg leading-relaxed mb-6 max-w-xl mx-auto lg:mx-0">
              Discover the cosmic blueprint of your life through numerology.
              Your birth date holds hidden patterns — your Basic Number, Destiny
              Number, Dasa cycles, and Annual Year vibrations all encoded in a
              sacred 3×3 grid.
            </p>

            <ul className="space-y-2 mb-8 text-sm text-charcoal/70 max-w-sm mx-auto lg:mx-0">
              {[
                "Natal Chart — your life's numeric blueprint",
                "Dasa Periods — 45-year karmic cycles",
                "Year Numbers — annual personal vibrations",
                "Save & compare multiple birth charts",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-gold text-base">✦</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <motion.button
              type="button"
              onClick={onOpen}
              className="btn-gold text-base px-8 py-3 inline-flex items-center gap-2 shadow-spiritual"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              data-ocid="numerology.primary_button"
            >
              <span>Explore Numerology</span>
              <span className="text-lg">🔢</span>
            </motion.button>
          </motion.div>

          {/* Right: Decorative Natal Chart Preview */}
          <motion.div
            className="flex-shrink-0"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gold/10 rounded-2xl blur-2xl scale-110" />

              <div className="relative bg-cream-bg border-2 border-gold/40 rounded-xl p-6 shadow-spiritual-lg">
                <div className="text-center mb-3">
                  <p className="text-xs font-medium tracking-widest text-gold-dark uppercase">
                    Natal Chart
                  </p>
                  <p className="text-xs text-charcoal/50 mt-0.5">
                    05 · 02 · 1998
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {gridPositions.map(({ num, row, col }) => {
                    const natCount: Record<number, number> = {
                      5: 2,
                      2: 1,
                      9: 1,
                      8: 1,
                      7: 1,
                    };
                    const count = natCount[num] || 0;
                    const isDasa = num === 9;
                    const isYear = num === 5;

                    return (
                      <motion.div
                        key={`${row}-${col}`}
                        className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-gold/50 bg-white/60 rounded-lg flex items-center justify-center relative overflow-hidden"
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: (row * 3 + col) * 0.05 + 0.3,
                          duration: 0.3,
                        }}
                      >
                        {count > 0 && (
                          <span className="text-xl sm:text-2xl font-bold font-serif text-charcoal absolute inset-0 flex items-center justify-center">
                            {String(num).repeat(count)}
                          </span>
                        )}
                        {isDasa && (
                          <span className="absolute top-1 right-1 text-xs font-bold text-white drop-shadow-sm">
                            {String(num).repeat(count > 0 ? 2 : 1)}
                          </span>
                        )}
                        {isYear && (
                          <span
                            className="absolute bottom-1 left-1 text-xs font-bold"
                            style={{ color: "#2a9d8f" }}
                          >
                            {num}
                          </span>
                        )}
                        {count === 0 && (
                          <span className="text-gold/20 text-2xl font-serif">
                            {num}
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-charcoal inline-block" />
                    Natal
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-white border border-charcoal/30 inline-block" />
                    Dasa
                  </span>
                  <span className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ background: "#2a9d8f" }}
                    />
                    Year
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
