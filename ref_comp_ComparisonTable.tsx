import { Star } from "lucide-react";
import React from "react";

const tableData = [
  {
    aspect: "Marriage",
    astrology: "Timing, Love Affairs, Divorce",
    numerology: "Cheating, Multiple Affairs, Family Dynamics",
    palmistry: "Instincts, LGBTQ, Relationship Dynamics",
  },
  {
    aspect: "Property",
    astrology: "Sale/Purchase, Loss, Natural Disasters",
    numerology: "Cheating, Legal Issues, Documentation",
    palmistry: "Timing of Purchase",
  },
  {
    aspect: "Travel",
    astrology: "Long Distance",
    numerology: "Visa, Settlement, Return",
    palmistry: "Settlement Abroad",
  },
  {
    aspect: "Health",
    astrology: "Chronic Diseases, Surgery",
    numerology: "Minor Issues, Timing of Ailments",
    palmistry: "Health Indicators",
  },
  {
    aspect: "Childbirth",
    astrology: "Conception, Pregnancy, Delivery",
    numerology: "Abortions",
    palmistry: "Childlessness",
  },
  {
    aspect: "Education",
    astrology: "Type, Marks",
    numerology: "Type",
    palmistry: "Learning Abilities",
  },
  {
    aspect: "Career",
    astrology: "Type, Success/Failure",
    numerology: "Career Fluctuations",
    palmistry: "Skill Assessment",
  },
  {
    aspect: "Litigation",
    astrology: "Timing, Outcome",
    numerology: "Legal Issues, Support for Outcomes",
    palmistry: "Indicators for Legal Troubles",
  },
];

const columns = [
  {
    key: "astrology",
    label: "\u263f Astrology",
    color: "text-amber-700",
    bg: "bg-amber-50",
  },
  {
    key: "numerology",
    label: "\u221e Numerology",
    color: "text-purple-700",
    bg: "bg-purple-50",
  },
  {
    key: "palmistry",
    label: "\u270b Palmistry",
    color: "text-green-700",
    bg: "bg-green-50",
  },
];

export default function ComparisonTable() {
  return (
    <div
      className="py-8 px-4 pb-4"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.975 0.008 85) 0%, oklch(0.96 0.015 80) 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="celestial-divider w-12" />
            <Star size={14} className="text-gold" fill="currentColor" />
            <div className="celestial-divider w-12" />
          </div>
          <h2 className="section-heading">How We Read Your Life</h2>
          <p className="section-subheading max-w-2xl mx-auto">
            Three ancient sciences, each revealing a unique dimension of your
            destiny
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-hidden rounded-xl border border-gold/20 shadow-spiritual">
          <table className="w-full">
            <thead>
              <tr className="bg-gold/15">
                <th className="px-6 py-4 text-left font-serif text-base font-semibold text-charcoal w-32">
                  Life Aspect
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-6 py-4 text-left font-serif text-base font-semibold ${col.color}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, idx) => (
                <tr
                  key={row.aspect}
                  className={`border-t border-gold/10 transition-colors hover:bg-gold/5 ${idx % 2 === 0 ? "bg-white/60" : "bg-cream-bg/60"}`}
                >
                  <td className="px-6 py-4">
                    <span className="font-serif font-semibold text-charcoal text-sm">
                      {row.aspect}
                    </span>
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-6 py-4 text-sm text-charcoal/70 leading-relaxed"
                    >
                      {row[col.key as keyof typeof row]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {tableData.map((row) => (
            <div
              key={row.aspect}
              className="rounded-xl border border-gold/20 overflow-hidden shadow-xs"
            >
              <div className="bg-gold/15 px-4 py-3">
                <h3 className="font-serif font-semibold text-charcoal">
                  {row.aspect}
                </h3>
              </div>
              <div className="divide-y divide-gold/10">
                {columns.map((col) => (
                  <div key={col.key} className={`px-4 py-3 ${col.bg}/40`}>
                    <div className={`text-xs font-semibold ${col.color} mb-1`}>
                      {col.label}
                    </div>
                    <div className="text-sm text-charcoal/70">
                      {row[col.key as keyof typeof row]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
