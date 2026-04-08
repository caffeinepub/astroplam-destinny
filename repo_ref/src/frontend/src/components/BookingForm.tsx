import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  Hash,
  Loader2,
  MapPin,
  Upload,
  User,
  Users,
  X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useSubmitInquiry } from "../hooks/useQueries";

interface BookingFormProps {
  serviceId: number;
  serviceName: string;
  onSuccess: () => void;
}

const MATCHMAKING_SERVICE_ID = 2;
const ONE_QUESTION_SERVICE_ID = 1;

interface PersonFields {
  name: string;
  email: string;
  dob: string;
  tob: string;
}
interface PlaceOfBirthFields {
  state: string;
  country: string;
  city: string;
}

function PlaceOfBirthSection({
  prefix,
  fields,
  onChange,
}: {
  prefix: string;
  fields: PlaceOfBirthFields;
  onChange: (u: PlaceOfBirthFields) => void;
}) {
  return (
    <div className="border border-gold/15 rounded-lg p-3 bg-white/40 space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <MapPin size={13} className="text-gold-dark" />
        <span className="text-xs font-semibold text-charcoal/70 uppercase tracking-wide">
          Place of Birth
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(["city", "state", "country"] as const).map((field) => (
          <div key={field}>
            <Label
              htmlFor={`${prefix}-${field}`}
              className="text-xs text-charcoal/70 mb-1"
            >
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </Label>
            <Input
              id={`${prefix}-${field}`}
              value={fields[field]}
              onChange={(e) => onChange({ ...fields, [field]: e.target.value })}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className="text-sm h-9 border-gold/20 focus:border-gold/50"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function PersonSection({
  label,
  prefix,
  fields,
  onChange,
  required,
}: {
  label: string;
  prefix: string;
  fields: PersonFields;
  onChange: (u: PersonFields) => void;
  required?: boolean;
}) {
  return (
    <div className="border border-gold/20 rounded-lg p-4 bg-white/50 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <User size={14} className="text-gold-dark" />
        <span className="text-sm font-semibold text-charcoal font-serif">
          {label}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label
            htmlFor={`${prefix}-name`}
            className="text-xs text-charcoal/70 mb-1"
          >
            Full Name {required && "*"}
          </Label>
          <Input
            id={`${prefix}-name`}
            value={fields.name}
            onChange={(e) => onChange({ ...fields, name: e.target.value })}
            placeholder="Full name"
            required={required}
            className="text-sm h-9 border-gold/20 focus:border-gold/50"
          />
        </div>
        <div>
          <Label
            htmlFor={`${prefix}-email`}
            className="text-xs text-charcoal/70 mb-1"
          >
            Email
          </Label>
          <Input
            id={`${prefix}-email`}
            type="email"
            value={fields.email}
            onChange={(e) => onChange({ ...fields, email: e.target.value })}
            placeholder="your@email.com"
            className="text-sm h-9 border-gold/20 focus:border-gold/50"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label
            htmlFor={`${prefix}-dob`}
            className="text-xs text-charcoal/70 mb-1"
          >
            Date of Birth {required && "*"}
          </Label>
          <Input
            id={`${prefix}-dob`}
            type="date"
            value={fields.dob}
            onChange={(e) => onChange({ ...fields, dob: e.target.value })}
            required={required}
            className="text-sm h-9 border-gold/20 focus:border-gold/50"
          />
        </div>
        <div>
          <Label
            htmlFor={`${prefix}-tob`}
            className="text-xs text-charcoal/70 mb-1"
          >
            Time of Birth (24-hr)
          </Label>
          <Input
            id={`${prefix}-tob`}
            type="time"
            value={fields.tob}
            onChange={(e) => onChange({ ...fields, tob: e.target.value })}
            className="text-sm h-9 border-gold/20 focus:border-gold/50"
          />
        </div>
      </div>
    </div>
  );
}

export default function BookingForm({
  serviceId,
  serviceName,
  onSuccess,
}: BookingFormProps) {
  const isMatchmaking = serviceId === MATCHMAKING_SERVICE_ID;
  const isOneQuestion = serviceId === ONE_QUESTION_SERVICE_ID;

  const [person1, setPerson1] = useState<PersonFields>({
    name: "",
    email: "",
    dob: "",
    tob: "",
  });
  const [person2, setPerson2] = useState<PersonFields>({
    name: "",
    email: "",
    dob: "",
    tob: "",
  });
  const [placeOfBirth, setPlaceOfBirth] = useState<PlaceOfBirthFields>({
    state: "",
    country: "",
    city: "",
  });
  const [question, setQuestion] = useState("");
  const [pastLifeNotes, setPastLifeNotes] = useState("");
  const [handPicture, setHandPicture] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [seedNumber, setSeedNumber] = useState("");
  const [seedNumberError, setSeedNumberError] = useState("");

  const submitMutation = useSubmitInquiry();

  const handleSeedNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw !== "" && !/^\d+$/.test(raw)) return;
    setSeedNumber(raw);
    if (raw === "") {
      setSeedNumberError("");
      return;
    }
    const num = Number.parseInt(raw, 10);
    setSeedNumberError(
      num < 1 || num > 249 ? "Seed number must be between 1 and 249." : "",
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!person1.name.trim() || !person1.dob) {
      toast.error("Please fill in your name and date of birth.");
      return;
    }
    if (isMatchmaking && (!person2.name.trim() || !person2.dob)) {
      toast.error("Please fill in Person 2's name and date of birth.");
      return;
    }
    if (isOneQuestion) {
      if (!seedNumber.trim()) {
        toast.error("Please enter a seed number between 1 and 249.");
        return;
      }
      const num = Number.parseInt(seedNumber, 10);
      if (Number.isNaN(num) || num < 1 || num > 249) {
        toast.error("Seed number must be between 1 and 249.");
        return;
      }
    }

    const parsedSeedNumber =
      isOneQuestion && seedNumber.trim()
        ? BigInt(Number.parseInt(seedNumber, 10))
        : null;
    const emailPrefix = person1.email.trim()
      ? `[EMAIL:${person1.email.trim()}]\n`
      : "";
    let finalQuestion = emailPrefix + question.trim();
    if (isMatchmaking) {
      const p2email = person2.email.trim()
        ? ` | P2 Email: ${person2.email.trim()}`
        : "";
      finalQuestion = emailPrefix + question.trim() + p2email;
    }

    try {
      await submitMutation.mutateAsync({
        serviceId: BigInt(serviceId),
        visitorName: person1.name.trim(),
        dob: person1.dob,
        tob: person1.tob,
        question: finalQuestion,
        pastLifeNotes: pastLifeNotes.trim(),
        handPictureFile: handPicture,
        onProgress: setUploadProgress,
        relationshipPerson2Name: isMatchmaking
          ? person2.name.trim() || null
          : null,
        relationshipPerson2Dob: isMatchmaking ? person2.dob || null : null,
        relationshipPerson2Tob: isMatchmaking ? person2.tob || null : null,
        state: placeOfBirth.state.trim() || null,
        birthCountry: placeOfBirth.country.trim() || null,
        city: placeOfBirth.city.trim() || null,
        seedNumber: parsedSeedNumber,
      });
      setSubmitted(true);
      toast.success("Your inquiry has been submitted successfully!");
      setTimeout(() => onSuccess(), 2000);
    } catch {
      toast.error("Failed to submit inquiry. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <CheckCircle size={40} className="text-sage mb-3" />
        <p className="font-serif text-lg font-semibold text-charcoal">
          Thank You!
        </p>
        <p className="text-sm text-charcoal/60 mt-1">
          Thank you for reaching out! We will connect with you soon.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white/70 rounded-lg p-4 border border-gold/15"
    >
      <p className="text-xs font-medium text-charcoal/50 uppercase tracking-wide">
        Booking: {serviceName}
      </p>

      {isMatchmaking ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-charcoal/60">
            <Users size={15} className="text-gold-dark" />
            <span>Please fill in details for both persons</span>
          </div>
          <PersonSection
            label="Person 1"
            prefix={`p1-${serviceId}`}
            fields={person1}
            onChange={setPerson1}
            required
          />
          <PlaceOfBirthSection
            prefix={`p1-pob-${serviceId}`}
            fields={placeOfBirth}
            onChange={setPlaceOfBirth}
          />
          <PersonSection
            label="Person 2"
            prefix={`p2-${serviceId}`}
            fields={person2}
            onChange={setPerson2}
            required
          />
          <div>
            <Label
              htmlFor={`question-${serviceId}`}
              className="text-xs text-charcoal/70 mb-1"
            >
              Additional Details / Question
            </Label>
            <Textarea
              id={`question-${serviceId}`}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Any specific questions or details about the matchmaking..."
              rows={3}
              className="text-sm border-gold/20 focus:border-gold/50 resize-none"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label
                htmlFor={`name-${serviceId}`}
                className="text-xs text-charcoal/70 mb-1"
              >
                Your Name *
              </Label>
              <Input
                id={`name-${serviceId}`}
                value={person1.name}
                onChange={(e) =>
                  setPerson1({ ...person1, name: e.target.value })
                }
                placeholder="Full name"
                required
                className="text-sm h-9 border-gold/20 focus:border-gold/50"
                data-ocid="booking.name.input"
              />
            </div>
            <div>
              <Label
                htmlFor={`email-${serviceId}`}
                className="text-xs text-charcoal/70 mb-1"
              >
                Email *
              </Label>
              <Input
                id={`email-${serviceId}`}
                type="email"
                value={person1.email}
                onChange={(e) =>
                  setPerson1({ ...person1, email: e.target.value })
                }
                placeholder="your@email.com"
                required
                className="text-sm h-9 border-gold/20 focus:border-gold/50"
                data-ocid="booking.email.input"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label
                htmlFor={`dob-${serviceId}`}
                className="text-xs text-charcoal/70 mb-1"
              >
                Date of Birth *
              </Label>
              <Input
                id={`dob-${serviceId}`}
                type="date"
                value={person1.dob}
                onChange={(e) =>
                  setPerson1({ ...person1, dob: e.target.value })
                }
                required
                className="text-sm h-9 border-gold/20 focus:border-gold/50"
              />
            </div>
            <div>
              <Label
                htmlFor={`tob-${serviceId}`}
                className="text-xs text-charcoal/70 mb-1"
              >
                Time of Birth (24-hr)
              </Label>
              <Input
                id={`tob-${serviceId}`}
                type="time"
                value={person1.tob}
                onChange={(e) =>
                  setPerson1({ ...person1, tob: e.target.value })
                }
                className="text-sm h-9 border-gold/20 focus:border-gold/50"
              />
            </div>
          </div>
          <PlaceOfBirthSection
            prefix={`pob-${serviceId}`}
            fields={placeOfBirth}
            onChange={setPlaceOfBirth}
          />

          {isOneQuestion && (
            <div className="border border-gold/15 rounded-lg p-3 bg-white/40 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Hash size={13} className="text-gold-dark" />
                <span className="text-xs font-semibold text-charcoal/70 uppercase tracking-wide">
                  Seed Number
                </span>
              </div>
              <div>
                <Label
                  htmlFor={`seed-${serviceId}`}
                  className="text-xs text-charcoal/70 mb-1"
                >
                  Enter a number between 1 and 249 *
                </Label>
                <Input
                  id={`seed-${serviceId}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={seedNumber}
                  onChange={handleSeedNumberChange}
                  placeholder="e.g. 137"
                  className={`text-sm h-9 border-gold/20 focus:border-gold/50 w-full sm:w-40 ${seedNumberError ? "border-destructive" : ""}`}
                  data-ocid="booking.seed.input"
                />
                {seedNumberError && (
                  <p className="text-xs text-destructive mt-1">
                    {seedNumberError}
                  </p>
                )}
                {!seedNumberError && seedNumber && (
                  <p className="text-xs text-sage mt-1">✓ Valid seed number</p>
                )}
              </div>
            </div>
          )}

          <div>
            <Label
              htmlFor={`question-${serviceId}`}
              className="text-xs text-charcoal/70 mb-1"
            >
              Your Question / Details
            </Label>
            <Textarea
              id={`question-${serviceId}`}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Describe your question or what you'd like guidance on..."
              rows={3}
              className="text-sm border-gold/20 focus:border-gold/50 resize-none"
              data-ocid="booking.question.textarea"
            />
          </div>
          <div>
            <Label
              htmlFor={`notes-${serviceId}`}
              className="text-xs text-charcoal/70 mb-1"
            >
              Past Life Event Notes
            </Label>
            <Textarea
              id={`notes-${serviceId}`}
              value={pastLifeNotes}
              onChange={(e) => setPastLifeNotes(e.target.value)}
              placeholder="Share any significant past life events..."
              rows={2}
              className="text-sm border-gold/20 focus:border-gold/50 resize-none"
            />
          </div>
          <div>
            <Label className="text-xs text-charcoal/70 mb-1">
              Hand Picture (Optional)
            </Label>
            <label
              htmlFor={`hand-pic-${serviceId}`}
              className="flex items-center gap-2 cursor-pointer border border-dashed border-gold/30 rounded-lg p-3 hover:border-gold/60 hover:bg-gold/5 transition-colors"
            >
              <Upload size={16} className="text-gold/60" />
              <span className="text-sm text-charcoal/50">
                {handPicture
                  ? handPicture.name
                  : "Upload hand picture (JPG, PNG)"}
              </span>
              {handPicture && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setHandPicture(null);
                  }}
                  className="ml-auto text-charcoal/40 hover:text-destructive"
                >
                  <X size={14} />
                </button>
              )}
            </label>
            <input
              id={`hand-pic-${serviceId}`}
              type="file"
              accept="image/*"
              onChange={(e) => setHandPicture(e.target.files?.[0] || null)}
              className="sr-only"
            />
            {submitMutation.isPending && handPicture && uploadProgress > 0 && (
              <div className="mt-1">
                <div className="h-1 bg-gold/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-charcoal/50 mt-0.5">
                  Uploading: {uploadProgress}%
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={submitMutation.isPending}
        className="btn-gold w-full flex items-center justify-center gap-2 text-sm"
        data-ocid="booking.submit.button"
      >
        {submitMutation.isPending ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Inquiry"
        )}
      </button>
    </form>
  );
}
