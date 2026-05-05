import { Eye, Edit2, Trash2, CheckCircle } from 'lucide-react';
import type { ReservaDetalle } from '../../types';
import ReservaStatusBadge from './ReservaStatusBadge';

interface ReservaCardProps {
  reserva: ReservaDetalle;
  onView: (reserva: ReservaDetalle) => void;
  onEdit: (reserva: ReservaDetalle) => void;
  onCancel: (id: number) => void;
  onUsar?: (id: number) => void;
}

export default function ReservaCard({ 
  reserva, 
  onView, 
  onEdit, 
  onCancel, 
  onUsar 
}: ReservaCardProps) {
  
  const isPendiente = !reserva.cancelada && !reserva.qrUsado;
  const isUsado = reserva.qrUsado;
  const isCancelada = reserva.cancelada;

  return (
    <div 
      className={`
        reserva-card 
        ${isUsado ? 'reserva-card--used' : ''} 
        ${isCancelada ? 'reserva-card--cancelled' : ''}
      `}
    >
      {/* Header: Nombre + Estado */}
      <div className="reserva-card__header">
        <div className="reserva-card__identity">
          <h4 className="reserva-card__name">
            {reserva.nombre}
          </h4>
          <span className="reserva-card__email">
            {reserva.email}
          </span>
        </div>
        <div className="reserva-card__badge">
          <ReservaStatusBadge cancelada={reserva.cancelada} qrUsado={reserva.qrUsado} />
        </div>
      </div>
      
      {/* Info compacta - Flex wrap */}
      <div className="reserva-card__info">
        <div className="reserva-card__info-row">
          <span className="reserva-card__info-date">{reserva.fecha}</span>
          <span className="reserva-card__info-time">{reserva.hora}</span>
        </div>
        <span className="reserva-card__info-phone">{reserva.telefono}</span>
      </div>

      {/* Código de socio */}
      {reserva.codigoSocioRecomendado && (
        <div className="reserva-card__ref">
          Ref: {reserva.codigoSocioRecomendado}
        </div>
      )}
      
      {/* Acciones compactas */}
      <div className="reserva-card__actions">
        <button
          onClick={() => onView(reserva)}
          className="reserva-card__btn reserva-card__btn--view"
          title="Ver"
          aria-label="Ver detalle"
        >
          <Eye size={16} />
        </button>

        {isPendiente && onUsar && (
          <button
            onClick={() => onUsar(reserva.id)}
            className="reserva-card__btn reserva-card__btn--primary"
            title="Usar"
            aria-label="Marcar como usado"
          >
            <CheckCircle size={16} />
            <span>Usar</span>
          </button>
        )}

        {isPendiente && (
          <button
            onClick={() => onEdit(reserva)}
            className="reserva-card__btn reserva-card__btn--secondary"
            title="Editar"
            aria-label="Editar"
          >
            <Edit2 size={16} />
          </button>
        )}

        {!isCancelada && (
          <button
            onClick={() => onCancel(reserva.id)}
            className="reserva-card__btn reserva-card__btn--danger"
            title="Cancelar"
            aria-label="Cancelar"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
