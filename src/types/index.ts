export interface ReservaRequest {
  nombre: string;
  email: string;
  telefono: string;
  fecha: string;
  hora: string;
  codigoSocioRecomendado: string;
}

export interface ReservaCreated {
  token: string;
  fecha: string;
  hora: string;
}

export interface ReservaDetalle {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  fecha: string;
  hora: string;
  token: string;
  qrUsado: boolean;
  cancelada: boolean;
  createdAt: string;
  usedAt: string | null;
  codigoSocioRecomendado: string;
}

export interface DashboardStats {
  totalReservas: number;
  reservasEscaneadas: number;
  tasaAsistencia: number;
  reservasHoy: number;
  reservasPorDia: Record<string, number>;
  horasMasReservadas: Record<string, number>;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export interface QRValidationResponse {
  estado: string;
  mensaje: string;
  reserva: ReservaDetalle | null;
}

export interface LoginResponse {
  token: string;
  type: string;
}