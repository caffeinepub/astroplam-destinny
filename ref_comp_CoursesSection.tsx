import { BookOpen, ChevronDown, ChevronUp, Star } from "lucide-react";
import React, { useState } from "react";
import EnrollmentModal from "./EnrollmentModal";

interface CourseModule {
  title: string;
  topics: string[];
}

interface Course {
  id: number;
  name: string;
  fee: number;
  tagline: string;
  icon: string;
  moduleCount: number;
  bgClass: string;
  borderClass: string;
  modules: CourseModule[];
}

const courses: Course[] = [
  {
    id: 1,
    name: "Predictive Nadi Astrology",
    fee: 10000,
    tagline:
      "Master the ancient science of Nadi Astrology for precise life predictions",
    icon: "☿",
    moduleCount: 10,
    bgClass: "bg-amber-50",
    borderClass: "border-amber-200",
    modules: [
      {
        title: "Rules of Nadi Astrology",
        topics: [
          "Ayanamsa",
          "Nirayana Bhava Chalit",
          "Casting Nirayana Bhav Chalit",
          "Dasa & Sub lord",
          "Aspects & Conjunctions",
          "Position & Lordship of Planets",
          "How to Judge a Planet",
          "Strength of Planet",
          "Cusps",
          "Results of Planets",
          "Timing of an Event",
          "Transits of Planets",
          "Negation of an event",
        ],
      },
      {
        title: "Education",
        topics: [
          "Houses & Planets",
          "Combination",
          "No Education / No inclination",
          "Foreign Education",
          "Scholarships",
          "Success in Competition Exams & Interviews",
          "Field of Education",
          "Prizes or Awards",
          "Illustrations",
        ],
      },
      {
        title: "Litigation",
        topics: [
          "Houses & Planets",
          "Combinations & Timing",
          "Imprisonment & Causes",
          "Political confinement",
          "Going underground",
          "House arrest",
          "Kidnapping",
          "Winning in litigation",
          "Illustrations",
        ],
      },
      {
        title: "Property & Vehicle",
        topics: [
          "Purchase of property — Houses, Planets, Combination & Timing",
          "Transits & Purchase through Loan",
          "Location & Status of property",
          "Commercial & Construction of property",
          "Rental income, Loss, Partition, Sale",
          "Purchase of vehicles — Houses, Facilitator, Timing",
          "Colour, Luxury, Commercial vehicle",
          "Theft, Non-repayment, Sale of Vehicle",
        ],
      },
      {
        title: "Marriage",
        topics: [
          "Timing of marriage",
          "Plutonic love, Physical love, Scandalous love",
          "Love marriage & Extra marital affair",
          "Kundali Milan",
          "Divorce & Live-in relationships",
          "Manglik & Gun Milan",
        ],
      },
      {
        title: "Childbirth",
        topics: [
          "Timing of conceiving",
          "Pregnancy periods",
          "Twin Birth",
          "Adoption",
          "Custody of children",
          "Gender of child",
        ],
      },
      {
        title: "Health",
        topics: [
          "Timing of disease",
          "Good health and bad health combinations",
          "Chronic disease and surgery",
          "Improvement in health",
          "Type of disease",
        ],
      },
      {
        title: "Longevity & Travel",
        topics: [
          "Timing of Longevity",
          "Death at time of marriage and pilgrimage",
          "Getting visa — US, Europe, Canada, Australia, NZ",
          "Getting PR, Work Visa and Citizenship",
          "Long Travel & Return to motherland",
          "Purpose of Travel",
        ],
      },
      {
        title: "Professional Career",
        topics: [
          "Getting a job",
          "Change in job & Transfer",
          "Change to business and vice versa",
          "Type of job or business",
          "Job in foreign",
          "Ups and downs in job/business",
          "Getting a government job",
        ],
      },
      {
        title: "Prasna Jyotish, Remedies & Muhurat",
        topics: [
          "Answers to specific questions",
          "Same-day event answers",
          "Mundane questions",
          "Vastu, Name correction, Mantra, Tantra, Yantra",
          "Graphology, Meditation, Yoga, Fasting",
          "Daan, Pooja, Hawan, Pilgrimage",
          "Muhurat of marriage & Grah Pravesh",
          "Birth time correction",
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Advanced Numerology",
    fee: 17500,
    tagline:
      "Decode the hidden language of numbers for deep predictive insights",
    icon: "∞",
    moduleCount: 8,
    bgClass: "bg-purple-50",
    borderClass: "border-purple-200",
    modules: [
      {
        title: "Foundations",
        topics: [
          "Study of Numerology for predictive purpose",
          "Nature of a person — Anxiety, depression, sentimental",
          "Drug addict, drunkard, Frustrated, Overconfident",
          "Miser, Spendthrift, mismanaging funds, brand cautious",
        ],
      },
      {
        title: "Character Analysis",
        topics: [
          "Combination of a cheat and variety in it",
          "Combination of a Conman",
          "How to differentiate sex scandal and financial scandal",
          "Differentiating debts, bankruptcy, litigation combinations",
        ],
      },
      {
        title: "Hindu Dasa System",
        topics: [
          "Vimshottari Dasa",
          "Mahadasa & Antar Dasa",
          "Pratyantar Dasa",
          "Calculation of Dasa",
          "Examples & Exercises",
        ],
      },
      {
        title: "Name Correction & Combinations",
        topics: [
          "Name Correction techniques",
          "Combinations of Billionaires",
          "High-end Actors, Actresses, Stage performers",
          "Combinations of Leaders & Dictators",
          "Person who respects and serves parents after marriage",
        ],
      },
      {
        title: "Specialized Predictions",
        topics: [
          "Combinations of Builders & property buyers",
          "People who win in speculations, share market, casinos",
          "People good in management",
          "Successful and unsuccessful travels",
          "Timing to get Visas, PR, Green Card, foreign settlement",
        ],
      },
      {
        title: "Advanced Techniques",
        topics: [
          "True lover and Cheat in love",
          "Merging Numerology with Nadi Astrology",
          "Higher predictive techniques",
        ],
      },
    ],
  },
  {
    id: 3,
    name: "Mystery of Palmistry",
    fee: 15000,
    tagline: "Read the map of destiny written on your hands",
    icon: "✋",
    moduleCount: 9,
    bgClass: "bg-green-50",
    borderClass: "border-green-200",
    modules: [
      {
        title: "Foundations & Hand Shapes",
        topics: [
          "Palmistry predictive course",
          "Panchtattva and its application to Human evolution",
          "Shape of hands — Earth, Water, Fire and Air",
          "Fingers — Jupiter, Saturn, Sun, Mercury, Thumb (Space)",
        ],
      },
      {
        title: "Mounts & Fingerprints",
        topics: [
          "Mounts — Venus, Lower Mars, Upper Mars, Neptune, Moon, Sun, Saturn, Jupiter, Mercury",
          "Finger Prints — Earth, Water, Fire and Air",
          "Mix, Composite fingerprints",
        ],
      },
      {
        title: "Lines of the Hand",
        topics: [
          "Major Lines — Earth, Water, Fire and Air",
          "Girdle of Venus, Via Lasciva, Moon Line",
          "Ambition Line, Sun line, Passion Line",
          "Mercury Line, Mars line, Axe lines",
          "Vertical & Horizontal Lines on Venus and Mars",
          "Emotional Suffocation Lines",
          "Relationship & Children lines",
          "Medical Stigmata",
        ],
      },
      {
        title: "Signs & Patterns",
        topics: [
          "Predictive Techniques to calculate timing of event",
          "Nails — Shape, Colour, Signs, Thickness",
          "Signs — Star, Cross, Squares, Tridents, Triangle, Bars",
          "Black spots, Solomon Ring, Grill, Temple",
          "Skin Patterns — Raja loop, Seriousness Loops, Bee",
        ],
      },
      {
        title: "Career, Compatibility & Medical",
        topics: [
          "Career & Academics — Self Discovery and Career Counselling",
          "Compatibility — For Marriage & Friendship",
          "Medical Palmistry — Depression, BP, IBS, Diabetes",
          "Eye-Sight, Allergy, ENT, Lipid Profile, Metabolism",
          "Problems to Conceive, Lungs & Respiratory",
        ],
      },
      {
        title: "Life Events",
        topics: [
          "Travel and immigration",
          "Litigations and other problems",
          "Marriage, Compatibility, Divorce",
          "Children possibilities, Sexual Behaviour, Infertility",
          "Career — Business, Services, Jobs",
          "Financial analysis",
        ],
      },
      {
        title: "Palmistry Hand Diagram",
        topics: [
          "Planetary mounts — Jupiter, Saturn, Sun, Mercury, Venus, Mars",
          "Major lines — Life, Head, Heart, Fate",
          "Elements — Earth, Water, Fire, Air",
          "Finger analysis and their significance",
        ],
      },
    ],
  },
  {
    id: 4,
    name: "Nadi Cards",
    fee: 5000,
    tagline: "Unlock the secrets of Nadi cards for accurate life readings",
    icon: "🃏",
    moduleCount: 6,
    bgClass: "bg-rose-50",
    borderClass: "border-rose-200",
    modules: [
      {
        title: "Introduction to Nadi Cards",
        topics: [
          "Introduction to Nadi Cards (Red, Blue, Yellow)",
          "General interpretation of cards",
        ],
      },
      {
        title: "Life Events via Cards",
        topics: [
          "Timing of Marriage",
          "Type of in-laws — Greedy, wealthy, heredity disease",
          "Types of love affairs & Divorce",
          "Child birth",
          "Property purchase — Landed property, Construction",
        ],
      },
      {
        title: "Health, Career & More",
        topics: [
          "Education",
          "Health — Type of disease, Timing of disease and good health",
          "Timing of death",
          "Profession — Up and down, Getting a job, Promotion, Type of job and business",
        ],
      },
      {
        title: "Litigation, Travel & Miscellaneous",
        topics: [
          "Litigation — Win in litigation, Jail, Bail",
          "Travel — Getting Visa, PR, Citizenship, Timing of travel",
          "Miscellaneous — Win and loss in matches",
          "Speculation, Lost and found",
        ],
      },
    ],
  },
];

function CourseCard({
  course,
  onEnroll,
}: { course: Course; onEnroll: (course: Course) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [openModule, setOpenModule] = useState<number | null>(null);

  return (
    <div
      className={`card-hover rounded-2xl overflow-hidden border shadow-spiritual ${course.bgClass} ${course.borderClass}`}
    >
      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-2xl font-bold text-charcoal leading-tight mb-3">
              {course.name}
            </h3>
            <div className="flex items-start gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-white/90 border border-charcoal/15 flex items-center justify-center text-xl shrink-0 shadow-xs">
                {course.icon}
              </div>
              <p className="text-sm text-charcoal/65 leading-relaxed font-light">
                {course.tagline}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-serif text-2xl font-bold text-gold-dark">
              ₹{course.fee.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-charcoal/50 mt-0.5">Course Fee</div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border border-amber-300 bg-white/70 text-charcoal/75">
            <BookOpen size={11} className="text-gold-dark" />
            {course.moduleCount} Modules
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border border-green-300 bg-white/70 text-charcoal/75">
            <Star size={11} className="text-sage-dark" fill="currentColor" />
            Expert Level
          </span>
        </div>
      </div>

      <div className="px-6 pb-4">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-sm font-semibold text-sage-dark hover:text-sage transition-colors"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {expanded ? "Hide Syllabus" : "View Full Syllabus"}
        </button>

        {expanded && (
          <div className="mt-4 space-y-2 animate-fade-in">
            {course.modules.map((mod, idx) => (
              <div
                key={`${course.id}-mod-${idx}`}
                className="border border-charcoal/10 rounded-lg overflow-hidden bg-white/60"
              >
                <button
                  type="button"
                  onClick={() => setOpenModule(openModule === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gold/5 transition-colors"
                >
                  <span className="font-medium text-sm text-charcoal">
                    {mod.title}
                  </span>
                  {openModule === idx ? (
                    <ChevronUp size={14} className="text-gold shrink-0" />
                  ) : (
                    <ChevronDown size={14} className="text-gold shrink-0" />
                  )}
                </button>
                {openModule === idx && (
                  <div className="px-4 pb-3 border-t border-gold/10">
                    <ul className="mt-2 space-y-1">
                      {mod.topics.map((topic, tIdx) => (
                        <li
                          key={`${course.id}-mod-${idx}-topic-${tIdx}`}
                          className="flex items-start gap-2 text-sm text-charcoal/70"
                        >
                          <span className="text-gold mt-1 shrink-0">•</span>
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 pb-6">
        <button
          type="button"
          onClick={() => onEnroll(course)}
          className="btn-sage w-full text-sm"
          data-ocid={`courses.enroll_button.${course.id}`}
        >
          Enroll Now
        </button>
      </div>
    </div>
  );
}

export default function CoursesSection() {
  const [enrollingCourse, setEnrollingCourse] = useState<Course | null>(null);

  return (
    <>
      <div id="courses" className="py-20 px-4 bg-cream-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="celestial-divider w-12" />
              <Star size={14} className="text-gold" fill="currentColor" />
              <div className="celestial-divider w-12" />
            </div>
            <h2 className="section-heading">Our Courses</h2>
            <p className="section-subheading max-w-2xl mx-auto">
              Comprehensive programs in ancient predictive sciences, taught by
              expert practitioners
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={setEnrollingCourse}
              />
            ))}
          </div>
        </div>
      </div>

      <EnrollmentModal
        course={enrollingCourse}
        onClose={() => setEnrollingCourse(null)}
      />
    </>
  );
}
