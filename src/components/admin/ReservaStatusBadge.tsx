import { CheckCircle, XCircle } from 'lucide-react';
import '../../styles/Admin.css';

type Status = 'pendiente' | 'usado' | 'cancelada';

function getStatus(cancelada: boolean, qrUsado: boolean): Status {
  if (cancelada) return 'cancelada';
  if (qrUsado) return 'usado';
  return 'pendiente';
}

const statusConfig: Record<Status, { label: string; icon: typeof CheckCircle; className: string }> = {
  pendiente: {
    label: 'Pendiente',
    icon: CheckCircle,
    className: 'admin-badge-pending',
  },
  usado: {
    label: 'Verificado',
    icon: CheckCircle,
    className: 'admin-badge-success',
  },
  cancelada: {
    label: 'Cancelada',
    icon: XCircle,
    className: 'admin-badge-cancelled',
  },
};

export default function ReservaStatusBadge({ cancelada, qrUsado }: { cancelada: boolean; qrUsado: boolean }) {
  const status = getStatus(cancelada, qrUsado);
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`admin-badge ${config.className}`}>
      <Icon />
      {config.label}
    </span>
  );
}

export { getStatus };
export type { Status };
