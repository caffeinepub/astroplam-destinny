import { useNavigate } from "@tanstack/react-router";
import NadiApp from "../components/NadiApp";

export default function NadiCardsPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <NadiApp
        onBackToHome={() => navigate({ to: "/" })}
        onGoToNumerology={() => navigate({ to: "/numerology" })}
      />
    </div>
  );
}
