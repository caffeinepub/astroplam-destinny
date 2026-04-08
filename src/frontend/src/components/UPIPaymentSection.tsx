import { Check, Copy, CreditCard } from "lucide-react";
import { useState } from "react";

const UPI_ID = "vikaskharb50@okaxis";
const PAYEE_NAME = "Vikas Kharb";

interface UPIPaymentSectionProps {
  amount: number;
  serviceLabel?: string;
}

export default function UPIPaymentSection({
  amount,
  serviceLabel,
}: UPIPaymentSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = UPI_ID;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-xl border border-gold/25 bg-gradient-to-b from-amber-50/70 to-white/80 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div className="flex items-center gap-1.5 px-3">
          <CreditCard size={13} className="text-gold-dark" />
          <span className="text-xs font-semibold text-gold-dark uppercase tracking-widest">
            Complete Your Payment
          </span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      </div>

      <div className="text-center space-y-0.5">
        {serviceLabel && (
          <p className="text-xs text-charcoal/50 uppercase tracking-wide">
            {serviceLabel}
          </p>
        )}
        <p className="font-serif text-2xl font-semibold text-gold-dark">
          ₹{amount.toLocaleString("en-IN")}
        </p>
        <p className="text-xs text-charcoal/50">
          Pay before submitting inquiry
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-5">
        <div className="flex-shrink-0">
          <div className="rounded-xl border-2 border-gold/30 p-2 bg-white shadow-sm">
            <img
              src="/assets/uploads/GooglePay_QR.png"
              alt="Google Pay QR Code"
              className="w-40 h-40 object-contain rounded-lg"
            />
          </div>
          <p className="text-center text-[10px] text-charcoal/40 mt-1.5">
            Scan with any UPI app
          </p>
        </div>

        <div className="flex-1 space-y-3 w-full">
          <div>
            <p className="text-xs text-charcoal/50 uppercase tracking-wide mb-1">
              UPI ID
            </p>
            <div className="flex items-center gap-2 bg-white/70 border border-gold/20 rounded-lg px-3 py-2">
              <span className="font-mono text-sm font-semibold text-charcoal flex-1 select-all">
                {UPI_ID}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-all duration-200 border ${copied ? "bg-sage/10 border-sage/30 text-sage" : "bg-gold/8 border-gold/20 text-gold-dark hover:bg-gold/15"}`}
                data-ocid="upi.copy.button"
              >
                {copied ? (
                  <>
                    <Check size={11} />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={11} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs text-charcoal/50 uppercase tracking-wide mb-1">
              Pay to
            </p>
            <p className="text-sm font-semibold text-charcoal font-serif">
              {PAYEE_NAME}
            </p>
          </div>
          <ul className="text-xs text-charcoal/55 space-y-1 leading-relaxed">
            <li className="flex items-start gap-1.5">
              <span className="text-gold-dark mt-0.5">❖</span>Open Google Pay,
              PhonePe, Paytm or any UPI app
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-gold-dark mt-0.5">❖</span>Scan the QR code
              or enter the UPI ID manually
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-gold-dark mt-0.5">❖</span>Complete payment,
              then submit this inquiry form
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
