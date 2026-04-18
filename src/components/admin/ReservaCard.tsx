import { Eye, Edit2, Trash2 } from 'lucide-react';
import type { ReservaDetalle } from '../../types';
import ReservaStatusBadge from './ReservaStatusBadge';

interface ReservaCardProps {
  reserva: ReservaDetalle;
  onView: (reserva: ReservaDetalle) => void;
  onEdit: (reserva: ReservaDetalle) => void;
  onCancel: (id: number) => void;
}

export default function ReservaCard({ reserva, onView, onEdit, onCancel }: ReservaCardProps) {
  return (
    <div className="admin-reserva-card">
      <div className="admin-reserva-card-header">
        <div className="admin-reserva-card-info">
          <h4 className="admin-reserva-card-name">{reserva.nombre}</h4>
          <p className="admin-reserva-card-email">{reserva.email}</p>
        </div>
        <ReservaStatusBadge cancelada={reserva.cancelada} qrUsado={reserva.qrUsado} />
      </div>
      
      <div className="admin-reserva-card-details">
        <div className="admin-reserva-card-detail">
          <span className="admin-reserva-card-label">Fecha</span>
          <span className="admin-reserva-card-value">{reserva.fecha}</span>
        </div>
        <div className="admin-reserva-card-detail">
          <span className="admin-reserva-card-label">Hora</span>
          <span className="admin-reserva-card-value">{reserva.hora}</span>
        </div>
        <div className="admin-reserva-card-detail">
          <span className="admin-reserva-card-label">Teléfono</span>
          <span className="admin-reserva-card-value">{reserva.telefono}</span>
        </div>
      </div>
      
      <div className="admin-reserva-card-actions">
        <button
          onClick={() => onView(reserva)}
          className="admin-reserva-card-btn"
          title="Ver detalle"
        >
          <Eye />
          <span>Ver</span>
        </button>
        {!reserva.cancelada && !reserva.qrUsado && (
          <button
            onClick={() => onEdit(reserva)}
            className="admin-reserva-card-btn"
            title="Editar"
          >
            <Edit2 />
            <span>Editar</span>
          </button>
        )}
        {!reserva.cancelada && (
          <button
            onClick={() => onCancel(reserva.id)}
            className="admin-reserva-card-btn admin-reserva-card-btn-danger"
            title="Cancelar"
          >
            <Trash2 />
            <span>Cancelar</span>
          </button>
        )}
      </div>
    </div>
  );
}
