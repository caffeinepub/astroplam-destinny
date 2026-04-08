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
  Camera,
  ChevronDown,
  ChevronUp,
  Crown,
  Heart,
  Mail,
  MapPin,
  Trash2,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  MatrimonialInterest,
  MatrimonialProfile,
} from "./MatrimonialPage";

// ─── localStorage helpers (mirrors MatrimonialPage) ──────────────────────────

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

// ─── Delete Profile Button ────────────────────────────────────────────────────

function DeleteProfileButton({
  profileId,
  onDeleted,
  rowIndex,
}: {
  profileId: string;
  onDeleted: () => void;
  rowIndex: number;
}) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    const updated = loadProfiles().filter((p) => p.id !== profileId);
    saveProfiles(updated);
    const updatedInterests = loadInterests().filter(
      (i) => i.toProfileId !== profileId,
    );
    saveInterests(updatedInterests);
    toast.success("Profile deleted successfully.");
    setOpen(false);
    onDeleted();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-ocid={`matrimonial.delete_button.${rowIndex}`}
        className="inline-flex items-center gap-1 p-1.5 rounded-md text-charcoal/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
        title="Delete profile"
      >
        <Trash2 size={14} />
      </button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent data-ocid="matrimonial.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this profile?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the matrimonial profile and all
              associated interest data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="matrimonial.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="matrimonial.confirm_button"
              onClick={handleConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Interests Expander ───────────────────────────────────────────────────────

function InterestsCell({ profileId }: { profileId: string }) {
  const [expanded, setExpanded] = useState(false);
  const interests = loadInterests().filter((i) => i.toProfileId === profileId);

  if (interests.length === 0) {
    return <span className="text-xs text-charcoal/30 italic">None</span>;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1 text-xs text-gold-dark hover:text-gold transition-colors font-medium"
        data-ocid="matrimonial.toggle"
      >
        <Heart size={10} />
        {interests.length} interest{interests.length !== 1 ? "s" : ""}
        {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>

      {expanded && (
        <div className="mt-1.5 space-y-1">
          {interests.map((interest) => (
            <div
              key={interest.id}
              className={`text-xs px-2 py-1 rounded-md ${
                interest.status === "accepted"
                  ? "bg-green-50 text-green-700 border border-green-200/60"
                  : "bg-gold/5 text-charcoal/60 border border-gold/15"
              }`}
            >
              <p className="font-medium">{interest.fromName}</p>
              <p className="break-all">{interest.fromEmail}</p>
              <p className="capitalize text-[10px] mt-0.5 font-semibold">
                {interest.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export default function MatrimonialTab() {
  const [profiles, setProfiles] = useState<MatrimonialProfile[]>([]);

  const reload = () => setProfiles(loadProfiles());

  useEffect(() => {
    setProfiles(loadProfiles());
  }, []);

  const togglePaidStatus = (profileId: string, currentStatus: boolean) => {
    const updated = loadProfiles().map((p) =>
      p.id === profileId ? { ...p, isPaid: !currentStatus } : p,
    );
    saveProfiles(updated);
    setProfiles(updated);
    toast.success(
      `Profile set to ${!currentStatus ? "Premium" : "Basic"} status.`,
    );
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  if (profiles.length === 0) {
    return (
      <div className="text-center py-16" data-ocid="matrimonial.empty_state">
        <User size={48} className="text-gold/30 mx-auto mb-4" />
        <p className="font-serif text-xl text-charcoal/40">
          No matrimonial profiles yet
        </p>
        <p className="text-sm text-charcoal/30 mt-1">
          Profiles created by visitors will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-charcoal/50">
        {profiles.length} profile{profiles.length !== 1 ? "s" : ""} registered
      </p>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-hidden rounded-xl border border-gold/20 shadow-spiritual">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gold/10 border-b border-gold/20">
              {[
                "#",
                "Name",
                "Age",
                "Email",
                "Occupation",
                "Place",
                "Photos",
                "Status",
                "Interests",
                "Joined",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-semibold text-charcoal/70 text-xs uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile, idx) => (
              <tr
                key={profile.id}
                data-ocid="matrimonial.row"
                className={`border-t border-gold/10 hover:bg-gold/5 ${idx % 2 === 0 ? "bg-white/60" : "bg-cream-bg/60"}`}
              >
                <td className="px-4 py-3 text-charcoal/50">{idx + 1}</td>
                <td className="px-4 py-3 font-medium text-charcoal">
                  {profile.name}
                </td>
                <td className="px-4 py-3 text-charcoal/60">{profile.age}</td>
                <td className="px-4 py-3">
                  <a
                    href={`mailto:${profile.email}`}
                    className="text-xs text-gold-dark hover:text-gold underline underline-offset-2 break-all flex items-center gap-1"
                  >
                    <Mail size={10} className="shrink-0" />
                    {profile.email}
                  </a>
                </td>
                <td className="px-4 py-3 text-charcoal/60 text-xs">
                  {profile.occupation || (
                    <span className="text-charcoal/30 italic">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {profile.placeCity ||
                  profile.placeState ||
                  profile.placeCountry ? (
                    <div className="flex items-center gap-1 text-xs text-charcoal/60">
                      <MapPin size={10} className="text-gold/50 shrink-0" />
                      {[
                        profile.placeCity,
                        profile.placeState,
                        profile.placeCountry,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  ) : (
                    <span className="text-xs text-charcoal/30 italic">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {profile.photoDataUrls.length > 0 ? (
                    <div className="flex items-center gap-1">
                      <Camera size={12} className="text-gold/60" />
                      <span className="text-xs text-charcoal/60">
                        {profile.photoDataUrls.length} photo
                        {profile.photoDataUrls.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-charcoal/30 italic">
                      None
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => togglePaidStatus(profile.id, profile.isPaid)}
                    data-ocid="matrimonial.toggle"
                    title={
                      profile.isPaid
                        ? "Click to set Basic"
                        : "Click to set Premium"
                    }
                  >
                    {profile.isPaid ? (
                      <Badge className="bg-gold/20 text-gold-dark border border-gold/30 cursor-pointer hover:bg-gold/30 transition-colors flex items-center gap-1">
                        <Crown size={9} />
                        Premium
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-gold/10 transition-colors"
                      >
                        Basic
                      </Badge>
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <InterestsCell profileId={profile.id} />
                </td>
                <td className="px-4 py-3 text-charcoal/50 text-xs whitespace-nowrap">
                  {formatDate(profile.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <DeleteProfileButton
                    profileId={profile.id}
                    onDeleted={reload}
                    rowIndex={idx + 1}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {profiles.map((profile, idx) => (
          <div
            key={profile.id}
            data-ocid={`matrimonial.item.${idx + 1}`}
            className={`rounded-xl border p-4 space-y-2 ${profile.isPaid ? "border-gold/30 bg-white/70" : "border-gold/15 bg-white/50"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-charcoal">
                  {profile.name}
                </span>
                <span className="text-charcoal/50 text-xs ml-2">
                  {profile.age} yrs
                </span>
              </div>
              <button
                type="button"
                onClick={() => togglePaidStatus(profile.id, profile.isPaid)}
                data-ocid="matrimonial.toggle"
              >
                {profile.isPaid ? (
                  <Badge className="bg-gold/20 text-gold-dark border border-gold/30 cursor-pointer flex items-center gap-1">
                    <Crown size={9} />
                    Premium
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="cursor-pointer">
                    Basic
                  </Badge>
                )}
              </button>
            </div>

            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-1 text-xs text-gold-dark hover:text-gold underline underline-offset-2 break-all"
            >
              <Mail size={10} className="shrink-0" />
              {profile.email}
            </a>

            {profile.occupation && (
              <p className="text-xs text-charcoal/60">{profile.occupation}</p>
            )}

            {(profile.placeCity ||
              profile.placeState ||
              profile.placeCountry) && (
              <div className="flex items-center gap-1 text-xs text-charcoal/50">
                <MapPin size={10} className="text-gold/50 shrink-0" />
                {[profile.placeCity, profile.placeState, profile.placeCountry]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            )}

            {profile.photoDataUrls.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-charcoal/50">
                <Camera size={10} />
                {profile.photoDataUrls.length} photo
                {profile.photoDataUrls.length !== 1 ? "s" : ""} uploaded
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-gold/10">
              <InterestsCell profileId={profile.id} />
              <DeleteProfileButton
                profileId={profile.id}
                onDeleted={reload}
                rowIndex={idx + 1}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
