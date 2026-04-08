import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Camera,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Crown,
  Heart,
  Lock,
  Mail,
  MapPin,
  Sparkles,
  Star,
  Trash2,
  User,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MatrimonialProfile {
  id: string;
  name: string;
  age: number;
  email: string;
  dob: string;
  timeOfBirth: string;
  placeCity: string;
  placeState: string;
  placeCountry: string;
  occupation: string;
  aboutSelf: string;
  photoDataUrls: string[];
  isPaid: boolean;
  createdAt: string;
}

export interface MatrimonialInterest {
  id: string;
  fromName: string;
  fromEmail: string;
  toProfileId: string;
  status: "pending" | "accepted";
  createdAt: string;
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

const PROFILES_KEY = "matrimonial_profiles";
const INTERESTS_KEY = "matrimonial_interests";

function loadProfiles(): MatrimonialProfile[] {
  try {
    return JSON.parse(localStorage.getItem(PROFILES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveProfiles(profiles: MatrimonialProfile[]) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

function loadInterests(): MatrimonialInterest[] {
  try {
    return JSON.parse(localStorage.getItem(INTERESTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveInterests(interests: MatrimonialInterest[]) {
  localStorage.setItem(INTERESTS_KEY, JSON.stringify(interests));
}

// ─── Send Interest Modal ──────────────────────────────────────────────────────

function SendInterestModal({
  profile,
  onClose,
}: {
  profile: MatrimonialProfile;
  onClose: () => void;
}) {
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromName.trim() || !fromEmail.trim()) return;

    const interests = loadInterests();
    // Check if already sent
    const alreadySent = interests.find(
      (i) =>
        i.toProfileId === profile.id &&
        i.fromEmail.toLowerCase() === fromEmail.toLowerCase(),
    );
    if (alreadySent) {
      toast.error("You have already sent an interest to this profile.");
      return;
    }

    const newInterest: MatrimonialInterest = {
      id: Date.now().toString(),
      fromName: fromName.trim(),
      fromEmail: fromEmail.trim(),
      toProfileId: profile.id,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    saveInterests([...interests, newInterest]);
    setSubmitted(true);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-ocid="interest.dialog">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-charcoal">
            Send Your Interest
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center" data-ocid="interest.success_state">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-500" />
            </div>
            <h3 className="font-serif text-lg text-charcoal mb-2">
              Your Interest Has Been Sent!
            </h3>
            <p className="text-sm text-charcoal/55 mb-6">
              We've recorded your interest in{" "}
              <span className="font-semibold text-gold-dark">
                {profile.name}'s
              </span>{" "}
              profile. They will be notified and can choose to connect with you.
            </p>
            <button
              type="button"
              onClick={onClose}
              data-ocid="interest.close_button"
              className="btn-gold px-6 py-2"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <p className="text-sm text-charcoal/55">
              Introduce yourself to{" "}
              <span className="font-semibold text-charcoal">
                {profile.name}
              </span>
              . If they accept, you'll both be able to see each other's contact
              details.
            </p>

            <div className="space-y-1.5">
              <Label
                htmlFor="interest-name"
                className="text-sm font-medium text-charcoal/70"
              >
                Your Full Name *
              </Label>
              <Input
                id="interest-name"
                data-ocid="interest.input"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="Your name"
                required
                className="border-gold/30 focus:border-gold"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="interest-email"
                className="text-sm font-medium text-charcoal/70"
              >
                Your Email Address *
              </Label>
              <Input
                id="interest-email"
                data-ocid="interest.input"
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="border-gold/30 focus:border-gold"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                data-ocid="interest.submit_button"
                disabled={!fromName.trim() || !fromEmail.trim()}
                className="btn-gold flex items-center gap-2 flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Heart size={15} fill="currentColor" />
                Send Interest
              </button>
              <button
                type="button"
                data-ocid="interest.cancel_button"
                onClick={onClose}
                className="btn-outline-gold flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Accept Interest Panel ────────────────────────────────────────────────────

function AcceptInterestPanel({
  profile,
  currentUserEmail,
}: {
  profile: MatrimonialProfile;
  currentUserEmail: string;
}) {
  const [interests, setInterests] = useState<MatrimonialInterest[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const all = loadInterests().filter((i) => i.toProfileId === profile.id);
    setInterests(all);
  }, [profile.id]);

  const isOwner =
    currentUserEmail.toLowerCase() === profile.email.toLowerCase();
  if (!isOwner || interests.length === 0) return null;

  const handleAccept = (interestId: string) => {
    const updated = loadInterests().map((i) =>
      i.id === interestId ? { ...i, status: "accepted" as const } : i,
    );
    saveInterests(updated);
    setInterests(updated.filter((i) => i.toProfileId === profile.id));
    toast.success("Interest accepted! You can now see each other's email.");
  };

  const pendingInterests = interests.filter((i) => i.status === "pending");
  const acceptedInterests = interests.filter((i) => i.status === "accepted");

  return (
    <div className="mt-3 border-t border-gold/15 pt-3">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-2 text-xs font-medium text-gold-dark hover:text-gold transition-colors"
        data-ocid="matrimonial.toggle"
      >
        <Heart size={12} />
        {pendingInterests.length > 0
          ? `${pendingInterests.length} pending interest(s)`
          : "View connections"}
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {pendingInterests.map((interest) => (
            <div
              key={interest.id}
              className="flex items-center justify-between bg-gold/5 rounded-lg px-3 py-2"
            >
              <div>
                <p className="text-xs font-semibold text-charcoal">
                  {interest.fromName}
                </p>
                <p className="text-xs text-charcoal/50">{interest.fromEmail}</p>
              </div>
              <button
                type="button"
                onClick={() => handleAccept(interest.id)}
                data-ocid="matrimonial.primary_button"
                className="text-xs bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-md font-medium transition-colors"
              >
                Accept
              </button>
            </div>
          ))}

          {acceptedInterests.map((interest) => (
            <div
              key={interest.id}
              className="flex items-center gap-2 bg-green-50/60 border border-green-200/60 rounded-lg px-3 py-2"
            >
              <CheckCircle size={12} className="text-green-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-charcoal">
                  {interest.fromName}
                </p>
                <a
                  href={`mailto:${interest.fromEmail}`}
                  className="text-xs text-green-700 underline underline-offset-1 break-all"
                >
                  {interest.fromEmail}
                </a>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">
                Matched
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Profile Card ─────────────────────────────────────────────────────────────

function ProfileCard({
  profile,
  index,
  currentUserEmail,
  onDeleteRequest,
}: {
  profile: MatrimonialProfile;
  index: number;
  currentUserEmail: string;
  onDeleteRequest: (id: string) => void;
}) {
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isOwner =
    currentUserEmail.toLowerCase() === profile.email.toLowerCase();

  return (
    <>
      <div
        className="bg-white/80 rounded-2xl border border-gold/20 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
        data-ocid={`matrimonial.item.${index + 1}`}
      >
        {/* Photo / Locked area */}
        <div className="relative h-48 bg-gradient-to-br from-cream-bg to-gold/10 overflow-hidden">
          {profile.isPaid && profile.photoDataUrls.length > 0 ? (
            <img
              src={profile.photoDataUrls[0]}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <div className="w-16 h-16 rounded-full bg-gold/15 border-2 border-gold/25 flex items-center justify-center">
                <User size={28} className="text-gold/60" />
              </div>
              {!profile.isPaid && (
                <div className="flex items-center gap-1 text-xs text-charcoal/40">
                  <Lock size={10} />
                  <span>Photos unlocked for premium</span>
                </div>
              )}
            </div>
          )}

          {/* Status badge */}
          <div className="absolute top-3 right-3">
            {profile.isPaid ? (
              <Badge className="bg-gold text-white border-0 text-[10px] font-semibold flex items-center gap-1 shadow">
                <Crown size={9} />
                Premium
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-white/80 text-charcoal/60 border border-gold/20 text-[10px]"
              >
                Basic
              </Badge>
            )}
          </div>

          {/* Owner controls */}
          {isOwner && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              data-ocid={`matrimonial.delete_button.${index + 1}`}
              className="absolute top-3 left-3 p-1.5 rounded-full bg-white/80 hover:bg-red-50 text-charcoal/40 hover:text-red-500 transition-colors shadow"
              title="Delete my profile"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-serif text-lg font-semibold text-charcoal">
              {profile.name}
            </h3>
            <span className="text-sm text-charcoal/50 ml-2 shrink-0">
              {profile.age} yrs
            </span>
          </div>

          {profile.occupation && (
            <p className="text-xs text-gold-dark font-medium mb-1">
              {profile.occupation}
            </p>
          )}

          {profile.isPaid && (
            <div className="flex items-center gap-1 text-xs text-charcoal/50 mb-2">
              <MapPin size={10} className="shrink-0" />
              <span>
                {[profile.placeCity, profile.placeState, profile.placeCountry]
                  .filter(Boolean)
                  .join(", ") || "Location not specified"}
              </span>
            </div>
          )}

          {profile.aboutSelf && (
            <p className="text-xs text-charcoal/65 leading-relaxed line-clamp-3 flex-1 mb-3">
              {profile.aboutSelf}
            </p>
          )}

          {!profile.isPaid && (
            <div className="flex items-center gap-1.5 py-2 px-3 bg-gold/5 rounded-lg border border-gold/15 mb-3">
              <Lock size={11} className="text-gold/60 shrink-0" />
              <p className="text-xs text-charcoal/50 italic">
                Full profile visible to premium members
              </p>
            </div>
          )}

          {/* Accepted mutual match — email shown */}
          {profile.isPaid &&
            currentUserEmail &&
            !isOwner &&
            (() => {
              const myAcceptedInterest = loadInterests().find(
                (i) =>
                  i.toProfileId === profile.id &&
                  i.fromEmail.toLowerCase() ===
                    currentUserEmail.toLowerCase() &&
                  i.status === "accepted",
              );
              if (!myAcceptedInterest) return null;
              return (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200/70 rounded-lg px-3 py-2 mb-3">
                  <CheckCircle size={14} className="text-green-500 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-green-700">
                      Mutual Match! 🎉
                    </p>
                    <a
                      href={`mailto:${profile.email}`}
                      className="text-xs text-green-600 underline underline-offset-1"
                    >
                      {profile.email}
                    </a>
                  </div>
                </div>
              );
            })()}

          {/* Send Interest button — only for paid profiles, not own profile */}
          {profile.isPaid &&
            !isOwner &&
            (() => {
              const alreadySent = loadInterests().some(
                (i) =>
                  i.toProfileId === profile.id &&
                  i.fromEmail.toLowerCase() === currentUserEmail.toLowerCase(),
              );
              return alreadySent ? (
                <div className="flex items-center gap-1.5 text-xs text-charcoal/50 italic mt-auto">
                  <CheckCircle size={12} className="text-green-400" />
                  Interest sent
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowInterestModal(true)}
                  data-ocid="matrimonial.primary_button"
                  className="btn-gold w-full flex items-center justify-center gap-2 text-sm mt-auto"
                >
                  <Heart size={14} fill="currentColor" />
                  Send Interest
                </button>
              );
            })()}

          {/* Owner: view interests panel */}
          {isOwner && (
            <AcceptInterestPanel
              profile={profile}
              currentUserEmail={currentUserEmail}
            />
          )}
        </div>
      </div>

      {showInterestModal && (
        <SendInterestModal
          profile={profile}
          onClose={() => setShowInterestModal(false)}
        />
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent data-ocid="matrimonial.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Your Profile?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove your matrimonial profile and all
              associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="matrimonial.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="matrimonial.confirm_button"
              onClick={() => {
                setShowDeleteConfirm(false);
                onDeleteRequest(profile.id);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Create Profile Modal ─────────────────────────────────────────────────────

function CreateProfileModal({
  onClose,
  onCreated,
}: { onClose: () => void; onCreated: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "",
    age: "",
    email: "",
    dob: "",
    timeOfBirth: "",
    placeCity: "",
    placeState: "",
    placeCountry: "",
    occupation: "",
    aboutSelf: "",
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 6 - photos.length;
    const toProcess = files.slice(0, remaining);

    for (const file of toProcess) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setPhotos((prev) => [...prev, dataUrl]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.age) return;

    setIsSubmitting(true);
    const newProfile: MatrimonialProfile = {
      id: Date.now().toString(),
      name: form.name.trim(),
      age: Number(form.age),
      email: form.email.trim(),
      dob: form.dob,
      timeOfBirth: form.timeOfBirth,
      placeCity: form.placeCity.trim(),
      placeState: form.placeState.trim(),
      placeCountry: form.placeCountry.trim(),
      occupation: form.occupation.trim(),
      aboutSelf: form.aboutSelf.trim(),
      photoDataUrls: photos,
      isPaid: false,
      createdAt: new Date().toISOString(),
    };

    const existing = loadProfiles();
    saveProfiles([...existing, newProfile]);
    setIsSubmitting(false);
    toast.success("Your profile has been created!");
    onCreated();
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        data-ocid="matrimonial.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-charcoal flex items-center gap-2">
            <Heart size={18} className="text-gold-dark" fill="currentColor" />
            Create Your Profile
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Name + Age */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-charcoal/70">
                Full Name *
              </Label>
              <Input
                data-ocid="matrimonial.input"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Your full name"
                required
                className="border-gold/30 focus:border-gold"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-charcoal/70">
                Age *
              </Label>
              <Input
                data-ocid="matrimonial.input"
                type="number"
                value={form.age}
                onChange={(e) => handleChange("age", e.target.value)}
                placeholder="Your age"
                min={18}
                max={80}
                required
                className="border-gold/30 focus:border-gold"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-charcoal/70">
              Email Address *{" "}
              <span className="text-xs text-charcoal/40 font-normal">
                (shown only to mutual matches)
              </span>
            </Label>
            <Input
              data-ocid="matrimonial.input"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="your@email.com"
              required
              className="border-gold/30 focus:border-gold"
            />
          </div>

          {/* DOB + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-charcoal/70">
                Date of Birth
              </Label>
              <Input
                data-ocid="matrimonial.input"
                type="date"
                value={form.dob}
                onChange={(e) => handleChange("dob", e.target.value)}
                className="border-gold/30 focus:border-gold"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-charcoal/70">
                Time of Birth (24hr)
              </Label>
              <Input
                data-ocid="matrimonial.input"
                type="time"
                value={form.timeOfBirth}
                onChange={(e) => handleChange("timeOfBirth", e.target.value)}
                className="border-gold/30 focus:border-gold"
              />
            </div>
          </div>

          {/* Place of Birth */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-charcoal/70">
              Place of Birth
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                data-ocid="matrimonial.input"
                value={form.placeCity}
                onChange={(e) => handleChange("placeCity", e.target.value)}
                placeholder="City"
                className="border-gold/30 focus:border-gold"
              />
              <Input
                data-ocid="matrimonial.input"
                value={form.placeState}
                onChange={(e) => handleChange("placeState", e.target.value)}
                placeholder="State"
                className="border-gold/30 focus:border-gold"
              />
              <Input
                data-ocid="matrimonial.input"
                value={form.placeCountry}
                onChange={(e) => handleChange("placeCountry", e.target.value)}
                placeholder="Country"
                className="border-gold/30 focus:border-gold"
              />
            </div>
          </div>

          {/* Occupation */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-charcoal/70">
              Occupation
            </Label>
            <Input
              data-ocid="matrimonial.input"
              value={form.occupation}
              onChange={(e) => handleChange("occupation", e.target.value)}
              placeholder="e.g. Engineer, Teacher, Doctor..."
              className="border-gold/30 focus:border-gold"
            />
          </div>

          {/* About */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-charcoal/70">
              About Yourself
            </Label>
            <Textarea
              data-ocid="matrimonial.textarea"
              value={form.aboutSelf}
              onChange={(e) => handleChange("aboutSelf", e.target.value)}
              placeholder="Share something about yourself, your values, what you're looking for..."
              rows={4}
              className="border-gold/30 focus:border-gold resize-none"
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-charcoal/70">
              Your Photos{" "}
              <span className="text-xs text-charcoal/40 font-normal">
                (up to 6 photos)
              </span>
            </Label>
            {photos.length < 6 && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  data-ocid="matrimonial.upload_button"
                  className="w-full border-2 border-dashed border-gold/30 hover:border-gold/60 rounded-xl py-4 flex flex-col items-center gap-2 text-charcoal/50 hover:text-charcoal/70 transition-colors"
                >
                  <Camera size={24} />
                  <span className="text-sm">Click to upload photos</span>
                  <span className="text-xs">
                    JPEG, PNG supported · {6 - photos.length} more allowed
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotos}
                  className="hidden"
                  data-ocid="matrimonial.dropzone"
                />
              </>
            )}
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {photos.map((url, idx) => (
                  <div
                    key={url.substring(0, 30)}
                    className="relative w-16 h-16 group"
                  >
                    <img
                      src={url}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-gold/20"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Note about paid */}
          <div className="flex items-start gap-2 bg-gold/5 rounded-xl p-3 border border-gold/15">
            <Crown size={14} className="text-gold shrink-0 mt-0.5" />
            <p className="text-xs text-charcoal/60 leading-relaxed">
              <span className="font-semibold text-charcoal/70">
                Premium profiles
              </span>{" "}
              show full details including photos, location, and the "Send
              Interest" button. Basic profiles are visible with name, age, and
              about section only. Premium status is granted by the admin.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              data-ocid="matrimonial.submit_button"
              disabled={
                isSubmitting ||
                !form.name.trim() ||
                !form.email.trim() ||
                !form.age
              }
              className="btn-gold flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <User size={15} />
              {isSubmitting ? "Creating..." : "Create Profile"}
            </button>
            <button
              type="button"
              data-ocid="matrimonial.cancel_button"
              onClick={onClose}
              className="btn-outline-gold flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

interface MatrimonialPageProps {
  onBack: () => void;
}

export default function MatrimonialPage({ onBack }: MatrimonialPageProps) {
  const [profiles, setProfiles] = useState<MatrimonialProfile[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewerEmail, setViewerEmail] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [filter, setFilter] = useState<"all" | "premium">("all");

  const loadData = () => setProfiles(loadProfiles());

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setProfiles(loadProfiles());
  }, []);

  const handleDelete = (profileId: string) => {
    const updated = loadProfiles().filter((p) => p.id !== profileId);
    saveProfiles(updated);
    // Also remove related interests
    const updatedInterests = loadInterests().filter(
      (i) => i.toProfileId !== profileId,
    );
    saveInterests(updatedInterests);
    setProfiles(updated);
    toast.success("Profile deleted.");
  };

  const filteredProfiles =
    filter === "premium" ? profiles.filter((p) => p.isPaid) : profiles;

  return (
    <div className="min-h-screen bg-cream-bg pt-20">
      {/* Page Header */}
      <div
        className="relative py-16 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.975 0.008 85) 0%, oklch(0.965 0.018 80) 50%, oklch(0.945 0.022 280) 100%)",
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-6 left-8 opacity-15 text-gold animate-pulse">
          <Star size={24} fill="currentColor" />
        </div>
        <div
          className="absolute top-10 right-12 opacity-10 text-gold animate-pulse"
          style={{ animationDelay: "1s" }}
        >
          <Star size={18} fill="currentColor" />
        </div>
        <div
          className="absolute bottom-6 left-1/4 opacity-10 text-gold animate-pulse"
          style={{ animationDelay: "2s" }}
        >
          <Sparkles size={20} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <button
            type="button"
            onClick={onBack}
            data-ocid="matrimonial.link"
            className="absolute left-4 top-0 flex items-center gap-1.5 text-sm text-charcoal/60 hover:text-gold-dark transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Home
          </button>

          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="celestial-divider w-12" />
            <Star size={12} className="text-gold" fill="currentColor" />
            <div className="celestial-divider w-12" />
          </div>

          <div className="w-14 h-14 rounded-full bg-gold/15 border-2 border-gold/25 flex items-center justify-center mx-auto mb-4">
            <Heart size={24} className="text-gold-dark" fill="currentColor" />
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold text-charcoal mb-3">
            Find Your <span className="text-gold-dark">Life Partner</span>
          </h1>
          <p className="text-charcoal/60 text-lg max-w-xl mx-auto leading-relaxed mb-8">
            Connect with spiritually compatible souls guided by Vedic astrology.
            Create your profile and discover meaningful connections.
          </p>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            data-ocid="matrimonial.open_modal_button"
            className="btn-gold text-base px-8 py-3 flex items-center gap-2 mx-auto"
          >
            <User size={16} />
            Create My Profile
          </button>
        </div>
      </div>

      {/* Viewer Identity — enter your email to see accepted interests */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white/70 border border-gold/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-2 shrink-0">
            <Mail size={15} className="text-gold-dark" />
            <span className="text-sm font-medium text-charcoal/70">
              Your Email:
            </span>
          </div>
          <div className="flex flex-1 gap-2 w-full">
            <Input
              data-ocid="matrimonial.input"
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter your email to manage your profile & see accepted interests"
              className="border-gold/30 focus:border-gold text-sm flex-1"
            />
            <button
              type="button"
              onClick={() => setViewerEmail(emailInput.trim())}
              data-ocid="matrimonial.secondary_button"
              className="btn-outline-gold text-sm px-4 py-2 shrink-0"
            >
              Set
            </button>
            {viewerEmail && (
              <button
                type="button"
                onClick={() => {
                  setViewerEmail("");
                  setEmailInput("");
                }}
                data-ocid="matrimonial.secondary_button"
                className="text-sm text-charcoal/40 hover:text-charcoal/70 px-2 transition-colors shrink-0"
              >
                <X size={15} />
              </button>
            )}
          </div>
          {viewerEmail && (
            <span className="text-xs text-green-600 font-medium shrink-0">
              ✓ Viewing as {viewerEmail}
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-semibold text-charcoal">
            {filteredProfiles.length} Profile
            {filteredProfiles.length !== 1 ? "s" : ""}
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              data-ocid="matrimonial.tab"
              className={`text-sm px-4 py-1.5 rounded-full border font-medium transition-colors ${
                filter === "all"
                  ? "bg-gold text-white border-gold"
                  : "bg-white/60 border-gold/20 text-charcoal/60 hover:border-gold/40"
              }`}
            >
              All Profiles
            </button>
            <button
              type="button"
              onClick={() => setFilter("premium")}
              data-ocid="matrimonial.tab"
              className={`text-sm px-4 py-1.5 rounded-full border font-medium transition-colors flex items-center gap-1.5 ${
                filter === "premium"
                  ? "bg-gold text-white border-gold"
                  : "bg-white/60 border-gold/20 text-charcoal/60 hover:border-gold/40"
              }`}
            >
              <Crown size={12} />
              Premium Only
            </button>
          </div>
        </div>

        {/* Profiles Grid */}
        {filteredProfiles.length === 0 ? (
          <div
            className="text-center py-20"
            data-ocid="matrimonial.empty_state"
          >
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
              <Heart size={28} className="text-gold/40" />
            </div>
            <p className="font-serif text-xl text-charcoal/40 mb-2">
              {filter === "premium"
                ? "No premium profiles yet"
                : "No profiles yet"}
            </p>
            <p className="text-sm text-charcoal/30 mb-6">
              Be the first to create a profile and start your journey.
            </p>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              data-ocid="matrimonial.primary_button"
              className="btn-gold px-6 py-2 flex items-center gap-2 mx-auto"
            >
              <User size={15} />
              Create My Profile
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProfiles.map((profile, index) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                index={index}
                currentUserEmail={viewerEmail}
                onDeleteRequest={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Profile Modal */}
      {showCreateModal && (
        <CreateProfileModal
          onClose={() => setShowCreateModal(false)}
          onCreated={loadData}
        />
      )}
    </div>
  );
}
