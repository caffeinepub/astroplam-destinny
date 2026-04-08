// All services are freely accessible — no gate needed.
interface VisitorGateProps {
  service: string;
  children: React.ReactNode;
}

export default function VisitorGate({ children }: VisitorGateProps) {
  return <>{children}</>;
}
