import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useSubmitVisitorQuery } from "../hooks/useQueries";

export default function VisitorQueryForm() {
  const [name, setName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submitQuery = useSubmitVisitorQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contactInfo.trim() || !message.trim()) return;
    try {
      await submitQuery.mutateAsync({
        name: name.trim(),
        contactInfo: contactInfo.trim(),
        message: message.trim(),
      });
      setSubmitted(true);
      setName("");
      setContactInfo("");
      setMessage("");
    } catch {
      // error handled below
    }
  };

  if (submitted) {
    return (
      <div
        data-ocid="visitor_query.success_state"
        className="flex flex-col items-center gap-3 py-8 px-6 text-center rounded-xl border border-green-200 bg-green-50"
      >
        <CheckCircle2 size={36} className="text-green-500" />
        <p className="font-semibold text-green-800 text-base">
          Your query has been submitted successfully!
        </p>
        <p className="text-sm text-green-700">We will contact you soon.</p>
        <Button
          variant="outline"
          className="mt-2 border-green-300 text-green-700 hover:bg-green-100"
          onClick={() => setSubmitted(false)}
        >
          Send Another Query
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="vqf-name" className="text-sm font-medium text-gray-700">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="vqf-name"
          data-ocid="visitor_query.input"
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border-gray-300 focus:border-primary bg-white"
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="vqf-contact"
          className="text-sm font-medium text-gray-700"
        >
          Contact Info (Phone or Email) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="vqf-contact"
          data-ocid="visitor_query.search_input"
          placeholder="Phone number or email address"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          required
          className="border-gray-300 focus:border-primary bg-white"
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="vqf-message"
          className="text-sm font-medium text-gray-700"
        >
          Message / Question <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="vqf-message"
          data-ocid="visitor_query.textarea"
          placeholder="Write your question or message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
          className="border-gray-300 focus:border-primary bg-white resize-none"
        />
      </div>

      {submitQuery.isError && (
        <p
          data-ocid="visitor_query.error_state"
          className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2"
        >
          Something went wrong. Please try again.
        </p>
      )}

      <Button
        type="submit"
        data-ocid="visitor_query.submit_button"
        disabled={
          submitQuery.isPending ||
          !name.trim() ||
          !contactInfo.trim() ||
          !message.trim()
        }
        className="w-full font-semibold gap-2"
      >
        {submitQuery.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {submitQuery.isPending ? "Submitting..." : "Send Query"}
      </Button>
    </form>
  );
}
