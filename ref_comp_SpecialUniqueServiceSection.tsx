import { useNavigate } from "@tanstack/react-router";
import { FileText, Hand, Sparkles, Star, Video } from "lucide-react";
import type React from "react";
import { useState } from "react";
import SpecialServiceBookingForm, {
  VIDEO_PREDICTION_SERVICE_ID,
  WRITTEN_PREDICTION_SERVICE_ID,
} from "./SpecialServiceBookingForm";

type ServiceType = "Video Prediction" | "Written Prediction";

interface SpecialService {
  id: number;
  type: ServiceType;
  icon: React.ReactNode;
  title: string;
  shortDesc: string;
  fee: number;
}

const specialServices: SpecialService[] = [
  {
    id: VIDEO_PREDICTION_SERVICE_ID,
    type: "Video Prediction",
    icon: <Video size={26} />,
    title: "Video Prediction",
    shortDesc:
      "Receive a personalised video reading covering your full nature prediction, 10-year career advice, and guidance on relationship difficulties \u2014 our expert analyses your palm lines and numerology to deliver deep, life-changing insights directly to you.",
    fee: 2500,
  },
  {
    id: WRITTEN_PREDICTION_SERVICE_ID,
    type: "Written Prediction",
    icon: <FileText size={26} />,
    title: "Written Prediction",
    shortDesc:
      "Get a comprehensive written report with your full nature prediction, a detailed 10-year career roadmap, and in-depth guidance on relationship difficulties \u2014 covering financials, family, and every key dimension of your life in rich, actionable detail.",
    fee: 2500,
  },
];

const includedFeatures = [
  "Full nature & personality prediction",
  "10-year career advice & roadmap",
  "Relationship difficulty guidance",
  "Financial & family outlook",
  "Palmistry + Numerology combined",
];

export default function SpecialUniqueServiceSection() {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<{
    type: ServiceType;
    id: number;
  } | null>(null);
  return (
    <div
      id="special-services"
      className="py-20 px-4 relative overflow-hidden bg-amber-50/40"
    >
      <div className="relative z-10 max-w-7xl mx-auto mb-4">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          data-ocid="special_services.link"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all"
          style={{
            background: "#f5e9c4",
            color: "#7a5c00",
            border: "1.5px solid #d4af37",
          }}
        >
          ← Back to Home
        </button>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="celestial-divider w-12" />
            <Sparkles size={14} className="text-gold" fill="currentColor" />
            <div className="celestial-divider w-12" />
          </div>
          <h2 className="section-heading">Unique Way to Prediction</h2>
          <div className="max-w-3xl mx-auto mt-6 space-y-3">
            <p className="leading-relaxed text-base text-center text-charcoal/70">
              Through the ancient sciences of{" "}
              <span className="font-bold text-gold-dark">Palmistry</span> and{" "}
              <span className="font-bold text-gold-dark">Numerology</span>, we
              reveal the deepest truths of your nature \u2014 your strengths,
              hidden patterns, and the unique blueprint of your soul.
            </p>
            <p className="leading-relaxed text-base text-center text-charcoal/60">
              Beyond understanding who you are, we predict and advise on the
              future challenges and opportunities across every dimension of your
              life:{" "}
              <span className="font-semibold text-charcoal/80">
                Finances &amp; Wealth
              </span>
              ,{" "}
              <span className="font-semibold text-charcoal/80">
                Relationships &amp; Love
              </span>
              , and{" "}
              <span className="font-semibold text-charcoal/80">
                Family &amp; Home
              </span>
              .
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Hand size={15} className="text-gold/70" />
              <p className="text-sm italic text-charcoal/50">
                Share your palm photos, birth details, and your deepest
                questions \u2014 we'll do the rest.
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {specialServices.map((service, i) => (
            <div
              key={service.id}
              className="card-hover rounded-2xl border-2 border-gold/30 p-7 flex flex-col shadow-spiritual bg-white"
              data-ocid={`special_services.item.${i + 1}`}
            >
              <div className="mb-5">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border border-gold/30 bg-amber-50 text-gold-dark">
                  {service.type}
                </span>
              </div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm bg-amber-50 border border-gold/30 text-gold-dark">
                  {service.icon}
                </div>
                <div className="text-right">
                  <div className="font-serif text-3xl font-bold text-gold-dark">
                    &#8377;{service.fee.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs mt-0.5 text-charcoal/50">
                    per session
                  </div>
                </div>
              </div>
              <h3 className="font-serif text-2xl font-semibold mb-3 text-charcoal">
                {service.title}
              </h3>
              <p className="text-sm leading-relaxed mb-5 text-charcoal/65">
                {service.shortDesc}
              </p>
              <ul className="space-y-2 mb-6 flex-1">
                {includedFeatures.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-charcoal/70"
                  >
                    <Star
                      size={12}
                      className="text-gold shrink-0"
                      fill="currentColor"
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() =>
                  setActiveModal({ type: service.type, id: service.id })
                }
                className="btn-gold text-sm w-full py-3"
                data-ocid={`special_services.book_button.${i + 1}`}
              >
                Book / Inquire
              </button>
            </div>
          ))}
        </div>
      </div>
      {activeModal && (
        <SpecialServiceBookingForm
          open={!!activeModal}
          onClose={() => setActiveModal(null)}
          serviceType={activeModal.type}
          serviceId={activeModal.id}
        />
      )}
    </div>
  );
}
