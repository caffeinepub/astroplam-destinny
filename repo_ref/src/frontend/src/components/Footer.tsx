import { Heart, Mail, Star } from "lucide-react";
import React from "react";

export default function Footer() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const year = new Date().getFullYear();
  const appId = encodeURIComponent(
    typeof window !== "undefined"
      ? window.location.hostname
      : "astroplam-desstiny",
  );

  return (
    <footer id="footer" className="bg-charcoal text-cream-bg/80">
      <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-600/30 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/assets/generated/trioracle-logo.dim_200x200.png"
                alt="Astroplam-Desstiny Logo"
                className="w-10 h-10 object-contain opacity-80"
              />
              <div>
                <div className="font-serif text-xl font-bold text-gold">
                  Astroplam
                </div>
                <div className="font-serif text-sm font-bold text-cream-bg/50">
                  -<em>Desstiny</em>
                </div>
                <div className="text-xs text-cream-bg/40 italic tracking-wide mt-0.5">
                  by Viku Kharb
                </div>
              </div>
            </div>
            <p className="text-sm text-cream-bg/50 leading-relaxed">
              Ancient wisdom meets modern insight. Discover your destiny through
              the sacred sciences of Astrology, Numerology, and Palmistry.
            </p>
            <div className="flex items-center gap-2 mt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={12}
                  className="text-gold/60"
                  fill="currentColor"
                />
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-serif text-base font-semibold text-gold mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { label: "Courses", id: "courses" },
                { label: "Services", id: "services" },
                { label: "Blog & Notice Board", id: "blog" },
                { label: "Contact", id: "footer" },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => scrollTo(link.id)}
                    className="text-sm text-cream-bg/50 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-serif text-base font-semibold text-gold mb-4">
              Our Services
            </h3>
            <ul className="space-y-2 text-sm text-cream-bg/50">
              <li>One Question &#8212; &#8377;500</li>
              <li>Matchmaking &#8212; &#8377;1,500</li>
              <li>Muhurat &#8212; &#8377;1,500</li>
              <li>Professional Advice &#8212; &#8377;1,100</li>
              <li>Phone Consultation &#8212; &#8377;2,500</li>
            </ul>
          </div>
          <div>
            <h3 className="font-serif text-base font-semibold text-gold mb-4">
              Contact Us
            </h3>
            <div className="flex items-start gap-2 text-sm text-cream-bg/50">
              <Mail size={15} className="text-gold/60 mt-0.5 shrink-0" />
              <a
                href="mailto:vikaskharb00007@gmail.com"
                className="hover:text-gold transition-colors break-all"
              >
                vikaskharb00007@gmail.com
              </a>
            </div>
            <p className="text-xs text-cream-bg/30 mt-3 leading-relaxed">
              Reach out for consultations, inquiries, or any questions about our
              services.
            </p>
          </div>
        </div>
        <div className="border-t border-cream-bg/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream-bg/30">
            &copy; {year}{" "}
            <strong className="font-bold text-cream-bg/40">
              Astroplam-<em>Desstiny</em>
            </strong>
            . All rights reserved.
          </p>
          <p className="text-xs text-cream-bg/30 flex items-center gap-1">
            Built with <Heart size={11} className="text-gold/60 fill-current" />{" "}
            using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold/60 hover:text-gold transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
