import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";

const services = [
  {
    label: "Astro Chart",
    icon: "\uD83D\uDD2E",
    to: "/horoscope",
    ocid: "service.astro_chart.button",
  },
  {
    label: "Numero Chart",
    icon: "\uD83D\uDD22",
    to: "/numerology",
    ocid: "service.numero_chart.button",
  },
  {
    label: "Courses",
    icon: "\uD83D\uDCDA",
    to: "/courses",
    ocid: "service.courses.button",
  },
  {
    label: "Special Services",
    icon: "\u2B50",
    to: "/special-services",
    ocid: "service.special_services.button",
  },
];

export default function ServiceGrid() {
  const navigate = useNavigate();
  return (
    <section className="py-14 px-4 bg-white">
      <div className="max-w-2xl mx-auto">
        <motion.h2
          className="text-2xl md:text-3xl font-serif font-bold text-center text-charcoal mb-8"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Our Services
        </motion.h2>
        <div className="grid grid-cols-2 gap-3">
          {services.map((svc, i) => (
            <motion.button
              key={svc.label}
              type="button"
              data-ocid={svc.ocid}
              onClick={() => navigate({ to: svc.to as "/" })}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 rounded-2xl px-4 py-5 text-left transition-colors cursor-pointer bg-white border border-gold/30 hover:border-gold/60 hover:bg-amber-50/50 shadow-sm"
            >
              <span className="text-2xl shrink-0">{svc.icon}</span>
              <span className="font-semibold text-sm leading-tight text-charcoal">
                {svc.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
