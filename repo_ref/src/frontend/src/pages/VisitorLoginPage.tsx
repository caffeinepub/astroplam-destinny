import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
export default function VisitorLoginPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/" });
  }, [navigate]);
  return null;
}
