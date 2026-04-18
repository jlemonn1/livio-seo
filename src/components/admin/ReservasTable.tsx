import { ChevronLeft, ChevronRight, Filter, Eye, Edit2, Trash2 } from 'lucide-react';
import type { ReservaDetalle } from '../../types';
import ReservaCard from './ReservaCard';
import ReservaStatusBadge from './ReservaStatusBadge';

interface ReservasTableProps {
  reservas: ReservaDetalle[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (reserva: ReservaDetalle) => void;
  onEdit: (reserva: ReservaDetalle) => void;
  onCancel: (id: number) => void;
}

export default function ReservasTable({
  reservas,
  currentPage,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onCancel,
}: ReservasTableProps) {
  if (reservas.length === 0) {
    return (
      <div className="admin-table-empty-container">
        <Filter className="admin-table-empty-icon" />
        <p>No se encontraron reservas</p>
      </div>
    );
  }

  return (
    <>
      {/* Vista de tabla para desktop */}
      <div className="admin-table-desktop">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Nombre</th>
                <th className="admin-hidden-sm">Email</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((reserva) => (
                <tr key={reserva.id}>
                  <td className="admin-table-cell-white">{reserva.fecha}</td>
                  <td className="admin-table-cell-gray">{reserva.hora}</td>
                  <td className="admin-table-cell-medium">{reserva.nombre}</td>
                  <td className="admin-table-cell-gray admin-hidden-sm">{reserva.email}</td>
                  <td>
                    <ReservaStatusBadge cancelada={reserva.cancelada} qrUsado={reserva.qrUsado} />
                  </td>
                    <td>
                    <div className="admin-table-actions">
                      <button
                        onClick={() => onView(reserva)}
                        className="admin-table-action-btn"
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>
                      {!reserva.cancelada && !reserva.qrUsado && (
                        <button
                          onClick={() => onEdit(reserva)}
                          className="admin-table-action-btn"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      {!reserva.cancelada && (
                        <button
                          onClick={() => onCancel(reserva.id)}
                          className="admin-table-action-btn danger"
                          title="Cancelar"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista de cards para móvil */}
      <div className="admin-table-mobile">
        <div className="admin-reserva-cards">
          {reservas.map((reserva) => (
            <ReservaCard
              key={reserva.id}
              reserva={reserva}
              onView={onView}
              onEdit={onEdit}
              onCancel={onCancel}
            />
          ))}
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="admin-table-pagination">
          <p className="admin-table-pagination-info">
            Página {currentPage + 1} de {totalPages}
          </p>
          <div className="admin-table-pagination-actions">
            <button
              onClick={() => onPageChange(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="admin-pagination-btn"
              aria-label="Página anterior"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
              className="admin-pagination-btn"
              aria-label="Página siguiente"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
