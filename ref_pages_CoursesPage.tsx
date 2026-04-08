import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitInquiry } from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Loader2,
  Star,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

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

function CourseEnrollForm({ course }: { course: Course }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submitInquiry = useSubmitInquiry();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      const combinedQuestion = email.trim()
        ? `[EMAIL:${email.trim()}] [PHONE:${phone.trim()}]\n${message.trim()}`
        : `[PHONE:${phone.trim()}]\n${message.trim()}`;
      await submitInquiry.mutateAsync({
        serviceId: BigInt(100 + course.id),
        visitorName: fullName.trim(),
        dob: "",
        tob: "",
        question: combinedQuestion,
        pastLifeNotes: `Course Enrollment: ${course.name}`,
        handPictureFile: null,
        palmPhotoFiles: [],
        relationshipPerson2Name: null,
        relationshipPerson2Dob: null,
        relationshipPerson2Tob: null,
        city: null,
        state: null,
        birthCountry: null,
        seedNumber: null,
      });
      setSubmitted(true);
      toast.success("Enrollment request submitted! We'll contact you soon.");
    } catch {
      toast.error("Failed to submit enrollment. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div data-ocid="enrollment.success_state" className="text-center py-6">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
          <Star className="w-6 h-6 text-green-600" fill="currentColor" />
        </div>
        <h4 className="font-semibold text-green-800 mb-1">
          Enrollment Request Submitted!
        </h4>
        <p className="text-sm text-green-700">
          We will contact you at {email} shortly.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3"
      data-ocid="enrollment.modal"
    >
      <h4 className="font-semibold text-sm text-foreground mb-4">
        Enroll in {course.name}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor={`name-${course.id}`} className="text-xs">
            Full Name *
          </Label>
          <Input
            id={`name-${course.id}`}
            data-ocid="enrollment.input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`email-${course.id}`} className="text-xs">
            Email *
          </Label>
          <Input
            id={`email-${course.id}`}
            data-ocid="enrollment.input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor={`phone-${course.id}`} className="text-xs">
            Phone *
          </Label>
          <Input
            id={`phone-${course.id}`}
            data-ocid="enrollment.input"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 99999 99999"
            required
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor={`msg-${course.id}`} className="text-xs">
            Your Question / Message
          </Label>
          <Textarea
            id={`msg-${course.id}`}
            data-ocid="enrollment.textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask your questions or add any information..."
            rows={3}
          />
        </div>
      </div>
      <Button
        type="submit"
        data-ocid="enrollment.submit_button"
        disabled={submitInquiry.isPending}
        className="w-full font-semibold"
        style={{ background: "#2E8B57", color: "white" }}
      >
        {submitInquiry.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          `Enroll Now — ₹${course.fee.toLocaleString("en-IN")}`
        )}
      </Button>
    </form>
  );
}

function SyllabusItem({
  mod,
  idx,
  courseId,
}: { mod: CourseModule; idx: number; courseId: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      key={`${courseId}-mod-${idx}`}
      className="border border-gray-200 rounded-lg overflow-hidden bg-white/60"
      data-ocid={`courses.item.${idx + 1}`}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-amber-50 transition-colors"
      >
        <span className="font-medium text-sm text-gray-800">{mod.title}</span>
        {open ? (
          <ChevronUp size={14} className="text-amber-600 shrink-0" />
        ) : (
          <ChevronDown size={14} className="text-amber-600 shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-3 border-t border-amber-100">
          <ul className="mt-2 space-y-1">
            {mod.topics.map((topic, _tIdx) => (
              <li
                key={`${courseId}-mod-${idx}-topic-${topic.slice(0, 10)}`}
                className="flex items-start gap-2 text-sm text-gray-600"
              >
                <span className="text-amber-500 mt-1 shrink-0">•</span>
                {topic}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  const [showEnroll, setShowEnroll] = useState(false);
  const [showSyllabus, setShowSyllabus] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`rounded-2xl overflow-hidden border shadow-md ${course.bgClass} ${course.borderClass}`}
    >
      {/* Header */}
      <div className="p-5 md:p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-xl md:text-2xl font-bold text-gray-800 leading-tight mb-2">
              {course.name}
            </h3>
            <div className="flex items-start gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center text-lg shrink-0">
                {course.icon}
              </div>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                {course.tagline}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xl md:text-2xl font-bold text-amber-700">
              ₹{course.fee.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Course Fee</div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border border-amber-300 bg-white/70 text-gray-700">
            <BookOpen size={11} className="text-amber-600" />
            {course.moduleCount} Modules
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border border-green-300 bg-white/70 text-gray-700">
            <Star size={11} className="text-green-600" fill="currentColor" />
            Expert Level
          </span>
        </div>
      </div>

      {/* Syllabus toggle button */}
      <div className="px-5 md:px-6 pb-3">
        <button
          type="button"
          data-ocid="courses.toggle"
          onClick={() => setShowSyllabus((v) => !v)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-sm transition-colors"
        >
          {showSyllabus ? (
            <>
              <ChevronUp size={15} />
              Hide Syllabus
            </>
          ) : (
            <>
              <BookOpen size={15} />📖 View Full Syllabus
            </>
          )}
        </button>
      </div>

      {/* Collapsible syllabus accordion */}
      <AnimatePresence initial={false}>
        {showSyllabus && (
          <motion.div
            key="syllabus"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 md:px-6 pb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <BookOpen size={14} className="text-amber-600" />
                Full Syllabus
              </h4>
              <div className="space-y-2">
                {course.modules.map((mod, idx) => (
                  <SyllabusItem
                    key={`${course.id}-mod-${idx}`}
                    mod={mod}
                    idx={idx}
                    courseId={course.id}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enroll Now toggle */}
      <div className="px-5 md:px-6 pb-5 md:pb-6">
        {!showEnroll ? (
          <Button
            type="button"
            data-ocid="enrollment.open_modal_button"
            onClick={() => setShowEnroll(true)}
            className="w-full font-semibold text-sm md:text-base"
            style={{ background: "#2E8B57", color: "white" }}
          >
            Enroll Now — ₹{course.fee.toLocaleString("en-IN")}
          </Button>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white/70 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">
                Enrollment Form
              </span>
              <button
                type="button"
                onClick={() => setShowEnroll(false)}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                ✕ Close
              </button>
            </div>
            <CourseEnrollForm course={course} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function CoursesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            data-ocid="courses.back_button"
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </button>
          <div className="flex-1 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <span className="font-display font-bold text-lg text-foreground">
              Our Courses
            </span>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:block">
            Expert Astrology Programs
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-gray-800 mb-3">
            Astrology &amp; Palmistry Courses
          </h1>
          <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto">
            Comprehensive programs in ancient predictive sciences, taught by
            expert practitioners. Click &quot;Enroll Now&quot; on any course to
            register.
          </p>
        </div>

        <div className="space-y-8 md:space-y-10" data-ocid="courses.list">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </main>

      <footer className="border-t border-border/50 mt-8 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with{" "}
        <span className="text-red-500">♥</span> using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors underline underline-offset-2"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
