import ServiceGateModal from "@/components/ServiceGateModal";
import ServiceNavBar from "@/components/ServiceNavBar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import VedicNumerologyApp from "../components/VedicNumerologyApp";

export default function NumerologyPage() {
  const navigate = useNavigate();
  const handleClose = () => navigate({ to: "/" });
  const [showGate, setShowGate] = useState(false);

  return (
    <>
      <ServiceNavBar />
      <div className="min-h-screen">
        <div className="flex justify-end items-center px-4 pt-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/horoscope" })}
            data-ocid="numerology.link"
            className="text-xs rounded-full border-green-600 text-green-700 hover:bg-green-50"
          >
            \uD83D\uDD2E KP Horoscope
          </Button>
        </div>
        <VedicNumerologyApp
          onClose={handleClose}
          onGoToNadiCards={() => navigate({ to: "/nadi-cards" })}
          tier={3}
          onGateBlocked={() => setShowGate(true)}
        />
      </div>
      {showGate && (
        <ServiceGateModal
          service="numerology"
          onClose={() => setShowGate(false)}
        />
      )}
    </>
  );
}
