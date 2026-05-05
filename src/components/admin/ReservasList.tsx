import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Filter, Loader2 } from 'lucide-react';
import type { ReservaDetalle } from '../../types';
import ReservaCard from './ReservaCard';
import ReservaStatusBadge from './ReservaStatusBadge';
import './ReservasList.css';

interface ReservasListProps {
  reservas: ReservaDetalle[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onView: (reserva: ReservaDetalle) => void;
  onEdit: (reserva: ReservaDetalle) => void;
  onCancel: (id: number) => void;
  onUsar?: (id: number) => void;
}

// Hook personalizado para detectar si es móvil
function useIsMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}

// Componente de paginación extraído
function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalElements 
}: { 
  currentPage: number; 
  totalPages: number; 
  totalElements: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const startItem = currentPage * 20 + 1;
  const endItem = Math.min((currentPage + 1) * 20, totalElements);

  return (
    <div className="reservas-list-pagination">
      <div className="reservas-list-pagination-info">
        <span className="reservas-list-pagination-range">
          {startItem}-{endItem} de {totalElements}
        </span>
        <span className="reservas-list-pagination-pages">
          Pág. {currentPage + 1}/{totalPages}
        </span>
      </div>
      <div className="reservas-list-pagination-actions">
        <button
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="reservas-list-pagination-btn"
          aria-label="Página anterior"
        >
          <ChevronLeft size={18} />
        </button>
        
        {/* Números de página visibles */}
        <div className="reservas-list-pagination-numbers">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i;
            } else if (currentPage < 2) {
              pageNum = i;
            } else if (currentPage > totalPages - 3) {
              pageNum = totalPages - 5 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`reservas-list-pagination-number ${currentPage === pageNum ? 'active' : ''}`}
              >
                {pageNum + 1}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage >= totalPages - 1}
          className="reservas-list-pagination-btn"
          aria-label="Página siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

// Vista Desktop: Tabla
function DesktopView({ 
  reservas, 
  onView, 
  onEdit, 
  onCancel 
}: { 
  reservas: ReservaDetalle[];
  onView: (r: ReservaDetalle) => void;
  onEdit: (r: ReservaDetalle) => void;
  onCancel: (id: number) => void;
}) {
  return (
    <div className="reservas-list-desktop">
      <div className="reservas-list-table-wrapper">
        <table className="reservas-list-table">
          <thead>
            <tr>
              <th className="col-fecha">Fecha</th>
              <th className="col-hora">Hora</th>
              <th className="col-nombre">Nombre</th>
              <th className="col-email">Email</th>
              <th className="col-codigo">Ref.</th>
              <th className="col-estado">Estado</th>
              <th className="col-acciones">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva) => {
              const isPendiente = !reserva.cancelada && !reserva.qrUsado;
              
              return (
                <tr 
                  key={reserva.id} 
                  className={`${reserva.qrUsado ? 'row-used' : ''} ${reserva.cancelada ? 'row-cancelled' : ''}`}
                >
                  <td className="col-fecha">{reserva.fecha}</td>
                  <td className="col-hora">{reserva.hora}</td>
                  <td className="col-nombre">
                    <div className="cell-nombre" title={reserva.nombre}>
                      {reserva.nombre}
                    </div>
                  </td>
                  <td className="col-email">
                    <div className="cell-email" title={reserva.email}>
                      {reserva.email}
                    </div>
                  </td>
                  <td className="col-codigo">
                    {reserva.codigoSocioRecomendado && (
                      <span className="cell-codigo">{reserva.codigoSocioRecomendado}</span>
                    )}
                  </td>
                  <td className="col-estado">
                    <ReservaStatusBadge cancelada={reserva.cancelada} qrUsado={reserva.qrUsado} />
                  </td>
                  <td className="col-acciones">
                    <div className="reservas-list-table-actions">
                      <button
                        onClick={() => onView(reserva)}
                        className="action-btn action-btn-view"
                        title="Ver detalle"
                      >
                        👁
                      </button>
                      {isPendiente && (
                        <button
                          onClick={() => onEdit(reserva)}
                          className="action-btn action-btn-edit"
                          title="Editar"
                        >
                          ✏️
                        </button>
                      )}
                      {!reserva.cancelada && (
                        <button
                          onClick={() => onCancel(reserva.id)}
                          className="action-btn action-btn-cancel"
                          title="Cancelar"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Vista Mobile: Cards
function MobileView({ 
  reservas, 
  onView, 
  onEdit, 
  onCancel, 
  onUsar 
}: { 
  reservas: ReservaDetalle[];
  onView: (r: ReservaDetalle) => void;
  onEdit: (r: ReservaDetalle) => void;
  onCancel: (id: number) => void;
  onUsar?: (id: number) => void;
}) {
  return (
    <div className="reservas-list-mobile">
      <div className="reservas-list-cards">
        {reservas.map((reserva) => (
          <ReservaCard
            key={reserva.id}
            reserva={reserva}
            onView={onView}
            onEdit={onEdit}
            onCancel={onCancel}
            onUsar={onUsar}
          />
        ))}
      </div>
    </div>
  );
}

// Estado vacío
function EmptyState() {
  return (
    <div className="reservas-list-empty">
      <Filter className="reservas-list-empty-icon" />
      <p className="reservas-list-empty-title">No se encontraron reservas</p>
      <p className="reservas-list-empty-subtitle">Prueba ajustando los filtros</p>
    </div>
  );
}

// Estado de carga
function LoadingState() {
  return (
    <div className="reservas-list-loading">
      <Loader2 className="reservas-list-loading-spinner" />
      <p>Cargando reservas...</p>
    </div>
  );
}

// Componente principal
export default function ReservasList({
  reservas,
  currentPage,
  totalPages,
  totalElements,
  isLoading = false,
  onPageChange,
  onView,
  onEdit,
  onCancel,
  onUsar,
}: ReservasListProps) {
  const isMobile = useIsMobile(768);

  if (isLoading) {
    return <LoadingState />;
  }

  if (reservas.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="reservas-list-container">
      {isMobile ? (
        <MobileView 
          reservas={reservas} 
          onView={onView} 
          onEdit={onEdit} 
          onCancel={onCancel}
          onUsar={onUsar}
        />
      ) : (
        <DesktopView 
          reservas={reservas} 
          onView={onView} 
          onEdit={onEdit} 
          onCancel={onCancel}
        />
      )}
      
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={onPageChange}
      />
    </div>
  );
}

export { useIsMobile };
