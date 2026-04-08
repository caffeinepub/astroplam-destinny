import { useState } from "react";

interface PredictionPanelProps {
  cellCounts: Record<number, number>;
  basicNumber: number;
  destinyNumber: number;
}

type Lang = "EN" | "HI";

interface NumberTraits {
  color: string;
  label: { EN: string; HI: string };
  single: { EN: string[]; HI: string[] };
  multiple: { EN: string[]; HI: string[] };
  multipleCondition: (count: number) => boolean;
}

const NUMBER_TRAITS: Record<number, NumberTraits> = {
  1: {
    color: "#ef4444",
    label: { EN: "Number 1", HI: "अंक 1" },
    single: {
      EN: [
        "Confident",
        "Leadership Quality",
        "Name & Fame",
        "Stubborn",
        "Dominating",
        "Strong Ego",
        "Short-Tempered",
        "Powerful & Wealthy",
        "Desire to Know & Speak",
      ],
      HI: [
        "आत्मविश्वासी",
        "नेतृत्व गुण",
        "नाम और शोहरत",
        "जिद्दी",
        "प्रभावशाली",
        "तेज अहंकार",
        "जल्दी गुस्सा",
        "शक्तिशाली और धनवान",
        "जानने की तीव्र इच्छा",
      ],
    },
    multiple: {
      EN: [
        "Over-Dominating",
        "Highly Egoistic",
        "Reduced Earning Potential",
        "Insecure Nature",
        "Lack of Confidence",
        "Highly Compliant",
      ],
      HI: [
        "अति प्रभावशाली",
        "अत्यधिक अहंकारी",
        "कम आय संभावना",
        "असुरक्षित स्वभाव",
        "आत्मविश्वास की कमी",
        "अत्यधिक अनुपालन",
      ],
    },
    multipleCondition: (c) => c > 1,
  },
  2: {
    color: "#f97316",
    label: { EN: "Number 2", HI: "अंक 2" },
    single: {
      EN: [
        "Motherly Nature",
        "Emotional",
        "Creative",
        "Soft-Spoken",
        "Needs Emotional Support",
        "Needs Pampering",
        "Needs Motivation",
        "Loves Selfies",
        "Photogenic",
      ],
      HI: [
        "मातृस्वभाव",
        "भावनात्मक",
        "रचनात्मक",
        "मृदुभाषी",
        "भावनात्मक समर्थन की आवश्यकता",
        "लाड़-प्यार की आवश्यकता",
        "प्रेरणा की आवश्यकता",
        "सेल्फी प्रिय",
        "फोटोजेनिक",
      ],
    },
    multiple: {
      EN: [
        "Over-Emotional",
        "Over-Creative",
        "Over-Soft-Spoken",
        "Needs More Motivation & Support",
        "Needs More Pampering",
        "Co-Dependent",
        "Possessive",
        "Cannot Keep Secrets",
        "Very Talkative",
        "Needs Partner's Attention",
      ],
      HI: [
        "अति भावनात्मक",
        "अति रचनात्मक",
        "अति मृदुभाषी",
        "अधिक समर्थन की आवश्यकता",
        "अत्यधिक लाड़",
        "परनिर्भर",
        "अधिकारी स्वभाव",
        "राज़ नहीं रख सकते",
        "बहुत बातूनी",
        "साथी का ध्यान ज़रूरी",
      ],
    },
    multipleCondition: (c) => c > 1,
  },
  3: {
    color: "#eab308",
    label: { EN: "Number 3", HI: "अंक 3" },
    single: {
      EN: [
        "Good Planner",
        "Good Decision Maker",
        "Hunger for Knowledge",
        "Resists Temptations",
        "Disciplined",
        "Good Counselor",
        "Clear Priorities",
        "Justice-Oriented Life",
        "Good Stress Management",
        "Family First",
        "Wise",
        "Consults Family Before Deciding",
      ],
      HI: [
        "अच्छे योजनाकार",
        "अच्छे निर्णयकर्ता",
        "ज्ञान की भूख",
        "प्रलोभन से दूर",
        "अनुशासित",
        "अच्छे सलाहकार",
        "प्राथमिकताएं स्पष्ट",
        "न्याय-आधारित जीवन",
        "तनाव प्रबंधन",
        "परिवार प्राथमिकता",
        "बुद्धिमान",
        "परिवार से परामर्श",
      ],
    },
    multiple: {
      EN: [
        "Shows Off Knowledge & Wisdom",
        "Pretends to Care for Family",
        "Selfish Thinker",
        "Opportunistic",
        "Easily Cheats for Profit",
        "Storyteller",
        "Manipulative",
        "Good at Sales",
      ],
      HI: [
        "ज्ञान का दिखावा",
        "परिवार की परवाह का नाटक",
        "स्वार्थी सोच",
        "अवसरवादी",
        "लाभ के लिए धोखा",
        "कहानीकार",
        "चालाकी से प्रभावित",
        "बिक्री में माहिर",
      ],
    },
    multipleCondition: (c) => c > 1,
  },
  4: {
    color: "#22c55e",
    label: { EN: "Number 4", HI: "अंक 4" },
    single: {
      EN: [
        "Mood Swings",
        "Sudden Life Problems",
        "Unstable Relationships",
        "Fruitless Expensive Travels",
        "Sudden Travel Problems",
        "Irregular Plans",
        "Poor Life Planning",
        "Unrealistic Goals",
        "Health Hazards & Accidents",
        "Party Lover",
        "Spendthrift",
        "Large But Unmaintained Social Circle",
        "IT / Research Depth",
      ],
      HI: [
        "मूड स्विंग्स",
        "अचानक जीवन समस्याएं",
        "अस्थिर रिश्ते",
        "व्यर्थ महंगी यात्राएं",
        "यात्रा में समस्याएं",
        "अनियमित योजनाएं",
        "जीवन नियोजन कमज़ोर",
        "अवास्तविक लक्ष्य",
        "स्वास्थ्य खतरे",
        "पार्टी प्रिय",
        "फिज़ूलखर्ची",
        "बड़ा पर अस्थिर सामाजिक दायरा",
        "आईटी / गहन शोध",
      ],
    },
    multiple: {
      EN: [
        "Reduced Negative Qualities",
        "Fruitful Planner",
        "Fruitful Travels",
        "Stable Relationships",
        "Good Planner",
        "Predictable & Reliable",
      ],
      HI: [
        "नकारात्मकता कम",
        "फलदायी योजनाकार",
        "फलदायी यात्राएं",
        "स्थिर रिश्ते",
        "अच्छे योजनाकार",
        "विश्वसनीय",
      ],
    },
    multipleCondition: (c) => c % 2 === 0,
  },
  5: {
    color: "#14b8a6",
    label: { EN: "Number 5", HI: "अंक 5" },
    single: {
      EN: [
        "Calculative Mind (Money-Focused)",
        "Good Speaker",
        "Excellent Negotiator",
        "Highly Money-Making Ideas",
        "Highly Routinized",
        "Straightforward",
        "Routine Follower",
      ],
      HI: [
        "पैसे के मामले में गणनात्मक",
        "अच्छे वक्ता",
        "उत्कृष्ट वार्ताकार",
        "धन कमाने के विचार",
        "दिनचर्या का पालन",
        "सीधे-साफ",
        "नियमित",
      ],
    },
    multiple: {
      EN: [
        "Anxiety from Birth",
        "Fast Brain",
        "Sleep Problems",
        "High Chances of Fraud (Victim or Perpetrator)",
        "Over-Thinking",
      ],
      HI: [
        "जन्मजात चिंता",
        "तेज़ दिमाग",
        "नींद की समस्या",
        "धोखाधड़ी की अधिक संभावना",
        "अति-विचार",
      ],
    },
    multipleCondition: (c) => c > 1,
  },
  6: {
    color: "#3b82f6",
    label: { EN: "Number 6", HI: "अंक 6" },
    single: {
      EN: [
        "Loves Good Food",
        "Cooking Aptitude",
        "Comfort First",
        "Large Friend Circle (Opposite Gender)",
        "Loves Materialistic Things",
        "Drawn to Outer Beauty",
        "Presentation-Focused",
        "Creative (Models, Fashion, Art)",
        "Attractive Aura",
        "Foodie",
      ],
      HI: [
        "अच्छे खाने का शौक",
        "खाना बनाने की क्षमता",
        "आराम प्राथमिकता",
        "बड़ा मित्र मंडल",
        "भौतिक चीज़ें पसंद",
        "बाहरी सौंदर्य आकर्षण",
        "प्रस्तुति पर ध्यान",
        "रचनात्मक",
        "आकर्षक व्यक्तित्व",
        "खाने के शौकीन",
      ],
    },
    multiple: {
      EN: [
        "Conflicts with Women",
        "Attracted to Different Genders",
        "Uses Harsh Words",
        "Fighter",
        "Less Attractive",
        "Less Creative",
        "Average Cooking Skills",
      ],
      HI: [
        "महिलाओं से झगड़े",
        "विभिन्न लिंगों की ओर आकर्षण",
        "कठोर शब्दों का प्रयोग",
        "लड़ाकू स्वभाव",
        "कम आकर्षक",
        "कम रचनात्मक",
        "साधारण खाना पकाने का कौशल",
      ],
    },
    multipleCondition: (c) => c > 1,
  },
  7: {
    color: "#6366f1",
    label: { EN: "Number 7", HI: "अंक 7" },
    single: {
      EN: [
        "Lucky",
        "Clear Vision of Goals",
        "Planned & Fruitful Travel",
        "Easy Visa to Developed Countries",
        "Stable Long-Term Relationships",
        "Good Reasoning",
        "Logic-Driven",
        "Researcher",
      ],
      HI: [
        "भाग्यशाली",
        "लक्ष्य की स्पष्ट दृष्टि",
        "फलदायी यात्राएं",
        "विकसित देशों का वीज़ा सुलभ",
        "स्थिर रिश्ते",
        "तर्कशील",
        "तर्क-प्रेरित",
        "शोधकर्ता",
      ],
    },
    multiple: {
      EN: [
        "Unstable Life",
        "Less Fruitful Travel",
        "Low PR/Foreign Settlement Chances",
        "Anxious Nature",
        "Meaningless Conversations",
        "Over-Questioning",
        "Depth Seeker",
      ],
      HI: [
        "अस्थिर जीवन",
        "कम फलदायी यात्राएं",
        "विदेश बसने की कम संभावना",
        "चिंतित स्वभाव",
        "अर्थहीन बातें",
        "अधिक प्रश्न करना",
        "गहराई खोजने वाले",
      ],
    },
    multipleCondition: (c) => c > 1,
  },
  8: {
    color: "#a855f7",
    label: { EN: "Number 8", HI: "अंक 8" },
    single: {
      EN: [
        "God Believer",
        "Prone to Depression (When Idle)",
        "Substance Risk",
        "Attractive Aura",
        "Life Struggles",
        "Disappointments",
        "Extreme Life Events",
        "Hard Worker",
        "Helpful",
        "Empathetic",
        "Delayed Results",
        "Fights for Justice",
        "Seeks Revenge When Hurt",
      ],
      HI: [
        "ईश्वर में विश्वास",
        "आलस्य में अवसाद की संभावना",
        "नशे का जोखिम",
        "आकर्षक व्यक्तित्व",
        "जीवन संघर्ष",
        "निराशाएं",
        "जीवन में चरम घटनाएं",
        "कठोर परिश्रमी",
        "सहायक",
        "सहानुभूतिशील",
        "देरी से परिणाम",
        "न्याय के लिए लड़ते हैं",
        "ठेस लगने पर बदला",
      ],
    },
    multiple: {
      EN: [
        "Good for Making Money",
        "Asset Building",
        "Management Skills",
        "God Believer",
        "Less Struggle",
        "Attractive Aura",
        "Sympathetic",
        "Family-Oriented",
        "Truth Seeker",
      ],
      HI: [
        "पैसे के लिए अच्छा",
        "संपत्ति निर्माण",
        "प्रबंधन कुशल",
        "ईश्वर में विश्वास",
        "कम संघर्ष",
        "आकर्षक व्यक्तित्व",
        "सहानुभूतिशील",
        "परिवार-उन्मुख",
        "सत्य प्रेमी",
      ],
    },
    multipleCondition: (c) => c % 2 === 0,
  },
  9: {
    color: "#ec4899",
    label: { EN: "Number 9", HI: "अंक 9" },
    single: {
      EN: [
        "Aggressive",
        "Bold",
        "Energetic",
        "Physical Activity Lover",
        "Courageous",
        "Determined",
        "Confident",
        "Argumentative",
        "Short-Tempered",
      ],
      HI: [
        "आक्रामक",
        "साहसी",
        "ऊर्जावान",
        "शारीरिक गतिविधि पसंद",
        "निर्भीक",
        "दृढ़निश्चयी",
        "आत्मविश्वासी",
        "तर्कशील",
        "जल्दी गुस्सा",
      ],
    },
    multiple: {
      EN: [
        "Less Courageous",
        "Less Aggression (But Uncontrollable Rage When Angry)",
        "Frustrated",
        "Harsh Words in Anger",
      ],
      HI: ["कम साहस", "कम आक्रामकता (गुस्से में बेकाबू)", "निराश", "क्रोध में कठोर बोल"],
    },
    multipleCondition: (c) => c > 1,
  },
};

function getCountLabel(count: number, lang: Lang): string {
  const symbols = ["×1", "×2", "×3", "×4", "×5"];
  const sym = symbols[Math.min(count - 1, 4)] ?? `×${count}`;
  if (lang === "HI") return `${sym} ${count === 1 ? "एकल" : "बहुल"}`;
  return `${sym} ${count === 1 ? "Single" : "Multiple"}`;
}

function NumberCard({
  num,
  count,
  lang,
}: { num: number; count: number; lang: Lang }) {
  const traitData = NUMBER_TRAITS[num];
  const isMultiple = traitData.multipleCondition(count);
  const traitsList = isMultiple
    ? traitData.multiple[lang]
    : traitData.single[lang];
  const countLabel = getCountLabel(count, lang);

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{
        background: "oklch(var(--card))",
        border: `1px solid ${traitData.color}40`,
        boxShadow: `0 2px 12px ${traitData.color}15`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-white flex-shrink-0"
          style={{ background: traitData.color }}
        >
          {num}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="font-semibold text-sm"
            style={{ color: traitData.color }}
          >
            {traitData.label[lang]}
          </div>
          <div
            className="text-xs mt-0.5 inline-block px-2 py-0.5 rounded-full font-medium"
            style={{
              background: `${traitData.color}20`,
              color: traitData.color,
            }}
          >
            {countLabel}
          </div>
        </div>
        {isMultiple && (
          <div
            className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{
              background: "oklch(var(--destructive) / 0.12)",
              color: "oklch(var(--destructive))",
            }}
          >
            {lang === "EN" ? "Amplified" : "प्रबलित"}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {traitsList.map((t) => (
          <span
            key={t}
            className="text-xs px-2 py-1 rounded-md"
            style={{
              background: "oklch(var(--muted))",
              color: "oklch(var(--foreground))",
              border: "1px solid oklch(var(--border))",
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function RelationshipSection({
  cellCounts,
  basicNumber,
  destinyNumber,
  lang,
}: {
  cellCounts: Record<number, number>;
  basicNumber: number;
  destinyNumber: number;
  lang: Lang;
}) {
  const has3 = (cellCounts[3] ?? 0) > 0;
  if (!has3 && basicNumber !== 3 && destinyNumber !== 3) return null;

  const count3 = cellCounts[3] ?? 0;
  const isBasic3 = basicNumber === 3;
  const isDestiny3 = destinyNumber === 3;
  const has33 = count3 >= 2;
  const insights: { EN: string; HI: string }[] = [];

  if (isBasic3)
    insights.push({
      EN: "Your Basic Number is 3 — you prioritize family over your life partner. Dates 3 or 30 carry stronger influence; dates 12 or 21 carry this in lesser degree.",
      HI: "आपका मूल अंक 3 है — आप जीवनसाथी से अधिक परिवार को प्राथमिकता देते हैं।",
    });
  if (isDestiny3)
    insights.push({
      EN: "Your Destiny Number is 3 — you prioritize your life partner above all, favoring your spouse in decisions.",
      HI: "आपका भाग्यांक 3 है — आप सभी निर्णयों में अपने जीवनसाथी को प्राथमिकता देते हैं।",
    });
  if (has33)
    insights.push({
      EN: "33 appears in your chart — family life is disturbed.",
      HI: "आपके चार्ट में 33 है — पारिवारिक जीवन में अशांति।",
    });

  if (insights.length === 0) return null;

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{
        background: "oklch(var(--card))",
        border: "1px solid #eab30840",
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
          style={{ background: "#eab30820", color: "#eab308" }}
        >
          💑
        </div>
        <h3
          className="font-semibold text-sm"
          style={{ color: "oklch(var(--foreground))" }}
        >
          {lang === "EN"
            ? "Relationship & Family Insights"
            : "संबंध और परिवार अंतर्दृष्टि"}
        </h3>
      </div>
      <div className="space-y-2">
        {insights.map((item) => (
          <div
            key={item.EN}
            className="text-sm p-3 rounded-lg leading-relaxed"
            style={{
              background: "oklch(var(--muted))",
              color: "oklch(var(--foreground))",
            }}
          >
            {item[lang]}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PredictionPanel({
  cellCounts,
  basicNumber,
  destinyNumber,
}: PredictionPanelProps) {
  const [lang, setLang] = useState<Lang>("EN");
  const [viewMode, setViewMode] = useState<"cards" | "combined">("cards");
  const presentNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
    (n) => (cellCounts[n] ?? 0) > 0,
  );
  const hasAnyNumbers = presentNumbers.length > 0;

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            className="font-display text-xl font-bold"
            style={{ color: "oklch(var(--primary))" }}
          >
            {lang === "EN" ? "Nature Prediction" : "स्वभाव भविष्यवाणी"}
          </h2>
          <p
            className="text-xs mt-1 leading-snug"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            {lang === "EN"
              ? "Complete personality analysis based on your natal chart"
              : "आपके जन्म चार्ट के आधार पर पूर्ण व्यक्तित्व विश्लेषण"}
          </p>
        </div>
        <div
          className="flex rounded-lg overflow-hidden flex-shrink-0"
          style={{ border: "1px solid oklch(var(--border))" }}
        >
          <button
            type="button"
            data-ocid="predict.toggle"
            onClick={() => setLang("EN")}
            className="px-3 py-1.5 text-xs font-semibold transition-colors"
            style={{
              background:
                lang === "EN" ? "oklch(var(--primary))" : "oklch(var(--card))",
              color:
                lang === "EN"
                  ? "oklch(var(--primary-foreground))"
                  : "oklch(var(--muted-foreground))",
            }}
          >
            EN
          </button>
          <button
            type="button"
            data-ocid="predict.toggle"
            onClick={() => setLang("HI")}
            className="px-3 py-1.5 text-xs font-semibold transition-colors"
            style={{
              background:
                lang === "HI" ? "oklch(var(--primary))" : "oklch(var(--card))",
              color:
                lang === "HI"
                  ? "oklch(var(--primary-foreground))"
                  : "oklch(var(--muted-foreground))",
              borderLeft: "1px solid oklch(var(--border))",
            }}
          >
            HI
          </button>
        </div>
      </div>

      {/* View mode toggle */}
      {hasAnyNumbers && (
        <div
          className="flex rounded-lg overflow-hidden self-start"
          style={{ border: "1px solid oklch(var(--border))" }}
        >
          <button
            type="button"
            data-ocid="predict.tab"
            onClick={() => setViewMode("cards")}
            className="px-3 py-1.5 text-xs font-semibold transition-colors"
            style={{
              background:
                viewMode === "cards"
                  ? "oklch(var(--primary))"
                  : "oklch(var(--card))",
              color:
                viewMode === "cards"
                  ? "oklch(var(--primary-foreground))"
                  : "oklch(var(--muted-foreground))",
            }}
          >
            Separate Cards
          </button>
          <button
            type="button"
            data-ocid="predict.tab"
            onClick={() => setViewMode("combined")}
            className="px-3 py-1.5 text-xs font-semibold transition-colors"
            style={{
              background:
                viewMode === "combined"
                  ? "oklch(var(--primary))"
                  : "oklch(var(--card))",
              color:
                viewMode === "combined"
                  ? "oklch(var(--primary-foreground))"
                  : "oklch(var(--muted-foreground))",
              borderLeft: "1px solid oklch(var(--border))",
            }}
          >
            Combined Paragraph
          </button>
        </div>
      )}

      {hasAnyNumbers && (
        <div className="flex flex-wrap gap-2">
          <span
            className="text-xs px-3 py-1 rounded-full font-medium"
            style={{
              background: "#ef444420",
              color: "#ef4444",
              border: "1px solid #ef444430",
            }}
          >
            {lang === "EN" ? "Basic" : "मूल"} #{basicNumber}
          </span>
          <span
            className="text-xs px-3 py-1 rounded-full font-medium"
            style={{
              background: "#eab30820",
              color: "#eab308",
              border: "1px solid #eab30830",
            }}
          >
            {lang === "EN" ? "Destiny" : "भाग्यांक"} #{destinyNumber}
          </span>
        </div>
      )}

      {!hasAnyNumbers && (
        <div
          data-ocid="predictions.empty_state"
          className="rounded-xl p-8 text-center space-y-2"
          style={{
            background: "oklch(var(--card))",
            border: "1px solid oklch(var(--border))",
          }}
        >
          <div className="text-3xl">🔢</div>
          <p
            className="text-sm font-medium"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            {lang === "EN"
              ? "Please generate your natal chart first from the New Chart tab."
              : "कृपया पहले नया चार्ट टैब से अपना जन्म चार्ट बनाएं।"}
          </p>
        </div>
      )}

      {viewMode === "cards" &&
        presentNumbers.map((n) => (
          <NumberCard key={n} num={n} count={cellCounts[n] ?? 1} lang={lang} />
        ))}

      {viewMode === "combined" && hasAnyNumbers && (
        <div
          className="rounded-xl p-5 space-y-3"
          style={{
            background: "oklch(var(--card))",
            border: "1px solid oklch(var(--border))",
          }}
        >
          <h3
            className="font-semibold text-sm"
            style={{ color: "oklch(var(--primary))" }}
          >
            {lang === "EN"
              ? "Combined Personality Profile"
              : "संयुक्त व्यक्तित्व प्रोफ़ाइल"}
          </h3>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "oklch(var(--foreground))" }}
          >
            {presentNumbers
              .map((n) => {
                const traitData = NUMBER_TRAITS[n];
                const count = cellCounts[n] ?? 1;
                const isMultiple = traitData.multipleCondition(count);
                const traits = isMultiple
                  ? traitData.multiple[lang]
                  : traitData.single[lang];
                return `${traitData.label[lang]}: ${traits.join(", ")}.`;
              })
              .join(" ")}
          </p>
        </div>
      )}

      <RelationshipSection
        cellCounts={cellCounts}
        basicNumber={basicNumber}
        destinyNumber={destinyNumber}
        lang={lang}
      />
    </div>
  );
}
