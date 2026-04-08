import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  CheckCircle,
  Clock,
  Hand,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Upload,
  User,
  X,
} from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useSubmitInquiry } from "../hooks/useQueries";

export const VIDEO_PREDICTION_SERVICE_ID = 7;
export const WRITTEN_PREDICTION_SERVICE_ID = 8;

interface SpecialServiceBookingFormProps {
  open: boolean;
  onClose: () => void;
  serviceType: "Video Prediction" | "Written Prediction";
  serviceId: number;
}

const MAX_PALM_PHOTOS = 5;

export default function SpecialServiceBookingForm({
  open,
  onClose,
  serviceType,
  serviceId,
}: SpecialServiceBookingFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [tob, setTob] = useState("");
  const [birthState, setBirthState] = useState("");
  const [birthCountry, setBirthCountry] = useState("");
  const [birthCity, setBirthCity] = useState("");
  const [palmPhotos, setPalmPhotos] = useState<File[]>([]);
  const [specialQuestion, setSpecialQuestion] = useState("");
  const [pastLifeEvents, setPastLifeEvents] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitMutation = useSubmitInquiry();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_PALM_PHOTOS - palmPhotos.length;
    const toAdd = files.slice(0, remaining);
    if (files.length > remaining)
      toast.warning(
        `Max ${MAX_PALM_PHOTOS} photos. Only first ${remaining} added.`,
      );
    setPalmPhotos((prev) => [...prev, ...toAdd]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (index: number) =>
    setPalmPhotos((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!dob) {
      toast.error("Please enter your date of birth.");
      return;
    }
    const emailPrefix = email.trim() ? `[EMAIL:${email.trim()}]\n` : "";
    const finalQuestion = emailPrefix + specialQuestion.trim();
    try {
      await submitMutation.mutateAsync({
        serviceId: BigInt(serviceId),
        visitorName: name.trim(),
        dob,
        tob,
        question: finalQuestion,
        pastLifeNotes: pastLifeEvents.trim(),
        handPictureFile: null,
        palmPhotoFiles: palmPhotos,
        onProgress: setUploadProgress,
        relationshipPerson2Name: null,
        relationshipPerson2Dob: null,
        relationshipPerson2Tob: null,
        state: birthState.trim() || null,
        birthCountry: birthCountry.trim() || null,
        city: birthCity.trim() || null,
      });
      setSubmitted(true);
      toast.success("Your inquiry has been submitted successfully!");
    } catch {
      toast.error("Failed to submit inquiry. Please try again.");
    }
  };

  const handleClose = () => {
    if (!submitMutation.isPending) {
      setName("");
      setEmail("");
      setDob("");
      setTob("");
      setBirthState("");
      setBirthCountry("");
      setBirthCity("");
      setPalmPhotos([]);
      setSpecialQuestion("");
      setPastLifeEvents("");
      setSubmitted(false);
      setUploadProgress(0);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto bg-cream-bg border-gold/20"
        data-ocid="special_booking.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-charcoal flex items-center gap-2">
            {serviceType === "Video Prediction" ? "🎥" : "📝"} Book{" "}
            {serviceType}
          </DialogTitle>
          <DialogDescription className="text-charcoal/60 text-sm">
            Fill in your details below. Fee:{" "}
            <span className="font-semibold text-gold-dark">₹2,500</span>
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <CheckCircle size={48} className="text-sage mb-4" />
            <p className="font-serif text-xl font-semibold text-charcoal mb-2">
              Thank You!
            </p>
            <p className="text-sm text-charcoal/60 mb-6">
              Thank you for reaching out! We will connect with you soon.
            </p>
            <Button type="button" onClick={handleClose} className="btn-sage">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <User size={14} className="text-gold-dark" />
                <span className="text-xs font-semibold text-charcoal/70 uppercase tracking-wide">
                  Personal Information
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label
                    htmlFor="sus-name"
                    className="text-xs text-charcoal/70 mb-1 flex items-center gap-1"
                  >
                    <User size={11} /> Full Name *
                  </Label>
                  <Input
                    id="sus-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                    className="text-sm h-9 border-gold/20 focus:border-gold/50 bg-white/70"
                    data-ocid="special_booking.name.input"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="sus-email"
                    className="text-xs text-charcoal/70 mb-1 flex items-center gap-1"
                  >
                    <Mail size={11} /> Email *
                  </Label>
                  <Input
                    id="sus-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="text-sm h-9 border-gold/20 focus:border-gold/50 bg-white/70"
                    data-ocid="special_booking.email.input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label
                    htmlFor="sus-dob"
                    className="text-xs text-charcoal/70 mb-1 flex items-center gap-1"
                  >
                    <Calendar size={11} /> Date of Birth *
                  </Label>
                  <Input
                    id="sus-dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                    className="text-sm h-9 border-gold/20 focus:border-gold/50 bg-white/70"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="sus-tob"
                    className="text-xs text-charcoal/70 mb-1 flex items-center gap-1"
                  >
                    <Clock size={11} /> Time of Birth (24-hr)
                  </Label>
                  <Input
                    id="sus-tob"
                    type="time"
                    value={tob}
                    onChange={(e) => setTob(e.target.value)}
                    className="text-sm h-9 border-gold/20 focus:border-gold/50 bg-white/70"
                  />
                </div>
              </div>
            </div>

            <div className="border border-gold/15 rounded-lg p-3 bg-white/40 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={13} className="text-gold-dark" />
                <span className="text-xs font-semibold text-charcoal/70 uppercase tracking-wide">
                  Place of Birth
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label
                    htmlFor="sus-city"
                    className="text-xs text-charcoal/70 mb-1"
                  >
                    City
                  </Label>
                  <Input
                    id="sus-city"
                    value={birthCity}
                    onChange={(e) => setBirthCity(e.target.value)}
                    placeholder="City"
                    className="text-sm h-9 border-gold/20 focus:border-gold/50 bg-white/70"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="sus-state"
                    className="text-xs text-charcoal/70 mb-1"
                  >
                    State
                  </Label>
                  <Input
                    id="sus-state"
                    value={birthState}
                    onChange={(e) => setBirthState(e.target.value)}
                    placeholder="State"
                    className="text-sm h-9 border-gold/20 focus:border-gold/50 bg-white/70"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="sus-country"
                    className="text-xs text-charcoal/70 mb-1"
                  >
                    Country
                  </Label>
                  <Input
                    id="sus-country"
                    value={birthCountry}
                    onChange={(e) => setBirthCountry(e.target.value)}
                    placeholder="Country"
                    className="text-sm h-9 border-gold/20 focus:border-gold/50 bg-white/70"
                  />
                </div>
              </div>
            </div>

            <div className="border border-gold/15 rounded-lg p-3 bg-white/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hand size={13} className="text-gold-dark" />
                  <span className="text-xs font-semibold text-charcoal/70 uppercase tracking-wide">
                    Palm Photos (up to {MAX_PALM_PHOTOS})
                  </span>
                </div>
                <span className="text-xs text-charcoal/40">
                  {palmPhotos.length}/{MAX_PALM_PHOTOS}
                </span>
              </div>
              {palmPhotos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {palmPhotos.map((file, idx) => (
                    <div
                      key={`palm-${file.name}-${idx}`}
                      className="relative group"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Hand ${idx + 1}`}
                        className="w-16 h-16 object-cover rounded-lg border border-gold/20"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute -top-1.5 -right-1.5 bg-white rounded-full p-0.5 shadow border border-gold/20 text-charcoal/60 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {palmPhotos.length < MAX_PALM_PHOTOS && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="sus-palm-photos"
                  />
                  <label
                    htmlFor="sus-palm-photos"
                    className="flex items-center gap-2 cursor-pointer border border-dashed border-gold/30 rounded-lg p-3 text-sm text-charcoal/60 hover:border-gold/60 hover:text-charcoal/80 transition-colors bg-white/30"
                    data-ocid="special_booking.upload_button"
                  >
                    <Upload size={14} className="text-gold-dark" />
                    <span>
                      Click to upload palm photos (
                      {MAX_PALM_PHOTOS - palmPhotos.length} remaining)
                    </span>
                  </label>
                </div>
              )}
              {submitMutation.isPending && uploadProgress > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-charcoal/50">
                    <span>Uploading photos…</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gold/10 rounded-full h-1.5">
                    <div
                      className="bg-gold h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label
                htmlFor="sus-question"
                className="text-xs text-charcoal/70 mb-1 flex items-center gap-1"
              >
                <MessageSquare size={11} className="text-gold-dark" />
                Special Question — What do you want to know more about yourself?
              </Label>
              <Textarea
                id="sus-question"
                value={specialQuestion}
                onChange={(e) => setSpecialQuestion(e.target.value)}
                placeholder="e.g. Will I have financial stability? What are my relationship patterns?"
                rows={3}
                className="text-sm border-gold/20 focus:border-gold/50 resize-none bg-white/70"
                data-ocid="special_booking.question.textarea"
              />
            </div>
            <div>
              <Label
                htmlFor="sus-past-life"
                className="text-xs text-charcoal/70 mb-1"
              >
                Past Life Events / Important Life Events (Optional)
              </Label>
              <Textarea
                id="sus-past-life"
                value={pastLifeEvents}
                onChange={(e) => setPastLifeEvents(e.target.value)}
                placeholder="Share any significant past events..."
                rows={3}
                className="text-sm border-gold/20 focus:border-gold/50 resize-none bg-white/70"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gold/10">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={submitMutation.isPending}
                className="text-charcoal/60 hover:text-charcoal"
                data-ocid="special_booking.cancel.button"
              >
                Cancel
              </Button>
              <button
                type="submit"
                disabled={submitMutation.isPending}
                className="btn-sage flex items-center gap-2 px-6 py-2 text-sm"
                data-ocid="special_booking.submit.button"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Submit Inquiry"
                )}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
