import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Loader2, MapPin, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useSubmitInquiry } from "../hooks/useQueries";

interface Course {
  id: number;
  name: string;
}
interface EnrollmentModalProps {
  course: Course | null;
  onClose: () => void;
}

export default function EnrollmentModal({
  course,
  onClose,
}: EnrollmentModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [tob, setTob] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submitMutation = useSubmitInquiry();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (course) {
      setFullName("");
      setEmail("");
      setDob("");
      setTob("");
      setCity("");
      setState("");
      setCountry("");
      setQuestion("");
      setSubmitted(false);
    }
  }, [course]);
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);
  useEffect(() => {
    if (course) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [course]);

  if (!course) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!dob) {
      toast.error("Please enter your date of birth.");
      return;
    }
    const combinedQuestion = email.trim()
      ? `[EMAIL:${email.trim()}]\n${question.trim()}`
      : question.trim();
    try {
      await submitMutation.mutateAsync({
        serviceId: BigInt(100 + course.id),
        visitorName: fullName.trim(),
        dob,
        tob,
        question: combinedQuestion,
        pastLifeNotes: "",
        handPictureFile: null,
        palmPhotoFiles: [],
        relationshipPerson2Name: null,
        relationshipPerson2Dob: null,
        relationshipPerson2Tob: null,
        city: city.trim() || null,
        state: state.trim() || null,
        birthCountry: country.trim() || null,
        seedNumber: null,
      });
      setSubmitted(true);
      setTimeout(() => onClose(), 2500);
    } catch {
      toast.error("Failed to submit enrollment. Please try again.");
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative"
        data-ocid="enrollment.dialog"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-charcoal/40 hover:text-charcoal transition-colors z-10 p-1 rounded-full hover:bg-charcoal/5"
          data-ocid="enrollment.close_button"
        >
          <X size={20} />
        </button>
        <div className="p-6">
          <div className="mb-6 pr-8">
            <p className="text-xs font-semibold text-sage uppercase tracking-widest mb-1">
              Course Enrollment
            </p>
            <h2 className="font-serif text-2xl font-bold text-charcoal leading-tight">
              Enroll in {course.name}
            </h2>
            <div className="h-px bg-gradient-to-r from-gold/40 via-gold/20 to-transparent mt-3" />
          </div>

          {submitted ? (
            <div
              className="flex flex-col items-center justify-center py-10 text-center"
              data-ocid="enrollment.success_state"
            >
              <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-sage" />
              </div>
              <p className="font-serif text-xl font-semibold text-charcoal mb-2">
                Thank You!
              </p>
              <p className="text-sm text-charcoal/60">
                Thank you for reaching out! We will connect with you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label
                    htmlFor="enroll-name"
                    className="text-xs text-charcoal/70 mb-1 block"
                  >
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="enroll-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    required
                    className="text-sm h-9 border-gold/20 focus:border-gold/50"
                    data-ocid="enrollment.name.input"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="enroll-email"
                    className="text-xs text-charcoal/70 mb-1 block"
                  >
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="enroll-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="text-sm h-9 border-gold/20 focus:border-gold/50"
                    data-ocid="enrollment.email.input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label
                    htmlFor="enroll-dob"
                    className="text-xs text-charcoal/70 mb-1 block"
                  >
                    Date of Birth <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="enroll-dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                    className="text-sm h-9 border-gold/20 focus:border-gold/50"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="enroll-tob"
                    className="text-xs text-charcoal/70 mb-1 block"
                  >
                    Time of Birth (24-hr)
                  </Label>
                  <Input
                    id="enroll-tob"
                    type="time"
                    value={tob}
                    onChange={(e) => setTob(e.target.value)}
                    className="text-sm h-9 border-gold/20 focus:border-gold/50"
                  />
                </div>
              </div>
              <div className="border border-gold/15 rounded-lg p-3 bg-amber-50/40 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={13} className="text-gold-dark" />
                  <span className="text-xs font-semibold text-charcoal/70 uppercase tracking-wide">
                    Place of Birth
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label
                      htmlFor="enroll-city"
                      className="text-xs text-charcoal/70 mb-1 block"
                    >
                      City
                    </Label>
                    <Input
                      id="enroll-city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="text-sm h-9 border-gold/20 focus:border-gold/50"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="enroll-state"
                      className="text-xs text-charcoal/70 mb-1 block"
                    >
                      State
                    </Label>
                    <Input
                      id="enroll-state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State"
                      className="text-sm h-9 border-gold/20 focus:border-gold/50"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="enroll-country"
                      className="text-xs text-charcoal/70 mb-1 block"
                    >
                      Country
                    </Label>
                    <Input
                      id="enroll-country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Country"
                      className="text-sm h-9 border-gold/20 focus:border-gold/50"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label
                  htmlFor="enroll-question"
                  className="text-xs text-charcoal/70 mb-1 block"
                >
                  Question / Query about the Course
                </Label>
                <Textarea
                  id="enroll-question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Any specific questions about the course, schedule, or content..."
                  rows={3}
                  className="text-sm border-gold/20 focus:border-gold/50 resize-none"
                  data-ocid="enrollment.question.textarea"
                />
              </div>
              <button
                type="submit"
                disabled={submitMutation.isPending}
                className="btn-sage w-full flex items-center justify-center gap-2 text-sm py-3"
                data-ocid="enrollment.submit.button"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Enrollment"
                )}
              </button>
              <p className="text-xs text-charcoal/40 text-center">
                We’ll review your enrollment and get back to you shortly.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
