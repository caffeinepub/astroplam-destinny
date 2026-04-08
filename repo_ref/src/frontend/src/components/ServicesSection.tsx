import {
  Briefcase,
  Clock,
  Gem,
  Heart,
  HelpCircle,
  Phone,
  Star,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import BookingForm from "./BookingForm";

interface ServiceInfo {
  id: number;
  name: string;
  description: string;
  fee: number;
  icon: React.ReactNode;
  color: string;
  features: string[];
}

const servicesList: ServiceInfo[] = [
  {
    id: 1,
    name: "One Question",
    description:
      "Get a precise answer to one specific question about your life — career, love, health, or any concern.",
    fee: 500,
    icon: <HelpCircle size={24} />,
    color: "border-amber-200 bg-amber-50/60",
    features: [
      "Precise answer to your specific question",
      "Career, love, health, or any concern",
      "Guided by astrology & numerology",
    ],
  },
  {
    id: 2,
    name: "Matchmaking",
    description:
      "Kundali Milan using our new Numerology & Astrology method — accurate compatibility analysis for a harmonious union.",
    fee: 1500,
    icon: <Heart size={24} />,
    color: "border-rose-200 bg-rose-50/60",
    features: [
      "Kundali Milan analysis",
      "Numerology & Astrology method",
      "Compatibility deep-dive",
    ],
  },
  {
    id: 3,
    name: "Muhurat",
    description:
      "Find the most auspicious time for your important events — marriage, Grah Pravesh, business launch, and more.",
    fee: 1500,
    icon: <Clock size={24} />,
    color: "border-purple-200 bg-purple-50/60",
    features: [
      "Most auspicious timing",
      "Marriage, Grah Pravesh & more",
      "Vedic precision",
    ],
  },
  {
    id: 4,
    name: "Professional Advice",
    description:
      "Expert guidance on career choices, business decisions, job changes, and professional growth strategies.",
    fee: 1100,
    icon: <Briefcase size={24} />,
    color: "border-green-200 bg-green-50/60",
    features: [
      "Career & business guidance",
      "Job change analysis",
      "Growth strategies",
    ],
  },
  {
    id: 5,
    name: "Personal Phone Consultation",
    description:
      "In-depth one-on-one 20-minute phone consultation for comprehensive life analysis and personalized guidance.",
    fee: 2500,
    icon: <Phone size={24} />,
    color: "border-blue-200 bg-blue-50/60",
    features: [
      "20-minute personal session",
      "Comprehensive life analysis",
      "Personalized guidance",
    ],
  },
  {
    id: 6,
    name: "Gemstone Consultation",
    description:
      "Discover the right gemstones aligned with your birth chart to enhance positive energies and balance planetary influences.",
    fee: 500,
    icon: <Gem size={24} />,
    color: "border-teal-200 bg-teal-50/60",
    features: [
      "Birth chart aligned gems",
      "Positive energy enhancement",
      "Planetary balance",
    ],
  },
];

export default function ServicesSection() {
  const [activeService, setActiveService] = useState<number | null>(null);

  return (
    <div
      id="services"
      className="py-20 px-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.93 0.018 280) 0%, oklch(0.975 0.008 85) 100%)",
      }}
    >
      <div className="absolute inset-0 z-0 opacity-10">
        <img
          src="/assets/generated/hero-banner.dim_1400x500.png"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="celestial-divider w-12" />
            <Star size={14} className="text-gold" fill="currentColor" />
            <div className="celestial-divider w-12" />
          </div>
          <h2 className="section-heading">Our Services</h2>
          <p className="section-subheading max-w-2xl mx-auto">
            Personalized consultations and readings tailored to your unique life
            journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesList.map((service, i) => (
            <div
              key={service.id}
              className={`card-hover rounded-xl border ${service.color} p-6 flex flex-col`}
              data-ocid={`services.item.${i + 1}`}
            >
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                  {service.name}
                </span>
              </div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-white/80 border border-gold/20 flex items-center justify-center text-gold-dark">
                  {service.icon}
                </div>
                <div className="text-right">
                  <div className="font-serif text-2xl font-semibold text-gold-dark">
                    ₹{service.fee.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-charcoal/50">per session</div>
                </div>
              </div>
              <h3 className="font-serif text-xl font-semibold text-charcoal mb-2">
                {service.name}
              </h3>
              <p className="text-sm text-charcoal/65 leading-relaxed mb-4">
                {service.description}
              </p>
              <ul className="space-y-1.5 mb-5 flex-1">
                {service.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-xs text-charcoal/70"
                  >
                    <Star
                      size={10}
                      className="text-gold shrink-0"
                      fill="currentColor"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() =>
                  setActiveService(
                    activeService === service.id ? null : service.id,
                  )
                }
                className="btn-sage text-sm w-full"
                data-ocid={`services.book_button.${i + 1}`}
              >
                {activeService === service.id ? "Close Form" : "Book / Inquire"}
              </button>
              {activeService === service.id && (
                <div className="mt-4 animate-fade-in">
                  <BookingForm
                    serviceId={service.id}
                    serviceName={service.name}
                    onSuccess={() => setActiveService(null)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
