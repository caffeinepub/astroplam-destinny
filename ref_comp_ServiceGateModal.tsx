interface ServiceGateModalProps {
  service: string;
  onClose: () => void;
}
export default function ServiceGateModal({ onClose }: ServiceGateModalProps) {
  onClose();
  return null;
}
