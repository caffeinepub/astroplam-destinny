import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

export default function ProfileSetupModal() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const saveMutation = useSaveCallerUserProfile();
  const { identity } = useInternetIdentity();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    const principal = identity?.getPrincipal();
    if (!principal) {
      toast.error("Not authenticated.");
      return;
    }
    try {
      await saveMutation.mutateAsync({
        id: principal,
        name: name.trim(),
        email: email.trim(),
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
      });
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <Dialog open>
      <DialogContent
        className="max-w-md bg-cream-bg border-gold/20"
        onInteractOutside={(e) => e.preventDefault()}
        data-ocid="profile_setup.dialog"
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
              <User size={18} className="text-gold-dark" />
            </div>
            <DialogTitle className="font-serif text-2xl text-charcoal">
              Welcome!
            </DialogTitle>
          </div>
          <DialogDescription className="text-charcoal/60">
            Please set up your profile to continue. This helps us personalize
            your experience.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label
              htmlFor="profile-name"
              className="text-sm text-charcoal/70 mb-1"
            >
              Your Name *
            </Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="border-gold/20 focus:border-gold/50"
              data-ocid="profile_setup.name.input"
            />
          </div>
          <div>
            <Label
              htmlFor="profile-email"
              className="text-sm text-charcoal/70 mb-1"
            >
              Email (optional)
            </Label>
            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="border-gold/20 focus:border-gold/50"
              data-ocid="profile_setup.email.input"
            />
          </div>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="btn-gold w-full flex items-center justify-center gap-2"
            data-ocid="profile_setup.save.button"
          >
            {saveMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : null}
            {saveMutation.isPending ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
