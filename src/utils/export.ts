import type { ReservaDetalle } from '../types';

export function exportReservasCSV(reservas: ReservaDetalle[], filename = 'reservas.csv') {
  const headers = ['ID', 'Nombre', 'Email', 'Telefono', 'Fecha', 'Hora', 'Token', 'Estado', 'Cancelada', 'Creada', 'Verificada', 'Codigo Socio'];
  const statusLabel = (r: ReservaDetalle) => {
    if (r.cancelada) return 'Cancelada';
    if (r.qrUsado) return 'Verificada';
    return 'Pendiente';
  };

  const escape = (val: string | number | boolean | null | undefined) => {
    const s = val == null ? '' : String(val);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const rows = reservas.map((r) => [
    escape(r.id),
    escape(r.nombre),
    escape(r.email),
    escape(r.telefono),
    escape(r.fecha),
    escape(r.hora),
    escape(r.token),
    escape(statusLabel(r)),
    escape(r.cancelada ? 'Si' : 'No'),
    escape(r.createdAt ? new Date(r.createdAt).toLocaleString('es-ES') : ''),
    escape(r.usedAt ? new Date(r.usedAt).toLocaleString('es-ES') : ''),
    escape(r.codigoSocioRecomendado),
  ].join(','));

  const csv = [headers.join(','), rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}