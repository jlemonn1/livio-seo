import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Search, QrCode, X,
  Copy, Check, Loader2, AlertCircle, CheckCircle, XCircle,
  Download, Plus, User, Mail, Phone, RotateCcw
} from 'lucide-react';
import QRCode from 'qrcode';
import { Html5Qrcode } from 'html5-qrcode';
import { getReservas, editarReserva, cancelarReserva, validarQR, crearReserva } from '../../services/api';
import type { ReservaDetalle } from '../../types';
import ReservaStatusBadge from '../../components/admin/ReservaStatusBadge';
import ReservasList from '../../components/admin/ReservasList';
import ResponsiveContainer from '../../components/admin/ResponsiveContainer';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { toast } from '../../components/admin/Toast';
import { exportReservasCSV } from '../../utils/export';
import '../../styles/Admin.css';

type StatusFilter = 'all' | 'pendiente' | 'usado' | 'cancelada';

function ReservaDetalleModal({
  reserva,
  onClose,
  onValidar,
  onCancelar,
  onEditClick,
}: {
  reserva: ReservaDetalle;
  onClose: () => void;
  onValidar: (id: number) => void;
  onCancelar: (id: number) => void;
  onEditClick: (r: ReservaDetalle) => void;
}) {
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(reserva.token, { width: 200, margin: 2 })
      .then(setQrUrl)
      .catch(console.error);
  }, [reserva.token]);

  const copyToken = () => {
    navigator.clipboard.writeText(reserva.token);
    setCopied(true);
    toast('success', 'Token copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="admin-modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="admin-modal"
      >
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Detalle Reserva</h3>
          <button onClick={onClose} className="admin-modal-close">
            <X />
          </button>
        </div>

        <div className="admin-modal-body">
          {reserva.cancelada && (
            <div className="admin-modal-warning">
              <XCircle />
              <span>Reserva cancelada</span>
            </div>
          )}

            <div className="admin-modal-grid">
            <div className="admin-modal-field">
              <label>Nombre</label>
              <p className="admin-modal-field-value">{reserva.nombre}</p>
            </div>
            <div className="admin-modal-field">
              <label>Email</label>
              <p className="admin-modal-field-value">{reserva.email}</p>
            </div>
            <div className="admin-modal-field">
              <label>Telefono</label>
              <p className="admin-modal-field-value">{reserva.telefono}</p>
            </div>
            <div className="admin-modal-field">
              <label>Código Socio</label>
              <p className="admin-modal-field-value">{reserva.codigoSocioRecomendado}</p>
            </div>
            <div className="admin-modal-field">
              <label>Estado</label>
              <ReservaStatusBadge cancelada={reserva.cancelada} qrUsado={reserva.qrUsado} />
            </div>
            <div className="admin-modal-field">
              <label>Fecha</label>
              <p className="admin-modal-field-value">{reserva.fecha}</p>
            </div>
            <div className="admin-modal-field">
              <label>Hora</label>
              <p className="admin-modal-field-value">{reserva.hora}</p>
            </div>
          </div>

          <div className="admin-token-box">
            <p className="admin-token-label">Token de Acceso</p>
            <div className="admin-token-value">
              <code className="admin-token-code">{reserva.token}</code>
              <button onClick={copyToken} className="admin-token-copy">
                {copied ? <Check className="icon-neon" /> : <Copy />}
              </button>
            </div>
          </div>

          {qrUrl && (
            <div className="admin-qr-wrapper">
              <div className="admin-qr-code">
                <img src={qrUrl} alt="QR Code" />
              </div>
            </div>
          )}

          {reserva.createdAt && (
            <p className="admin-timestamp">
              Creada: {new Date(reserva.createdAt).toLocaleString('es-ES')}
              {reserva.usedAt && ` | Verificada: ${new Date(reserva.usedAt).toLocaleString('es-ES')}`}
            </p>
          )}

          <div className="admin-modal-grid admin-modal-grid-full" style={{ marginTop: '1rem' }}>
            {!reserva.cancelada && !reserva.qrUsado && (
              <>
                <button
                  onClick={() => onValidar(reserva.id)}
                  className="admin-btn admin-btn-primary"
                >
                  Marcar como Usado
                </button>
                <button
                  onClick={() => onEditClick(reserva)}
                  className="admin-btn admin-btn-secondary"
                >
                  Editar Reserva
                </button>
              </>
            )}
            {!reserva.cancelada && (
              <button
                onClick={() => onCancelar(reserva.id)}
                className="admin-btn admin-btn-danger"
              >
                Cancelar Reserva
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function EditReservaModal({
  reserva,
  onClose,
  onSaved,
}: {
  reserva: ReservaDetalle;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nombre, setNombre] = useState(reserva.nombre);
  const [email, setEmail] = useState(reserva.email);
  const [telefono, setTelefono] = useState(reserva.telefono);
  const [codigoSocioRecomendado, setCodigoSocioRecomendado] = useState(reserva.codigoSocioRecomendado);
  const [fecha, setFecha] = useState(reserva.fecha);
  const [hora, setHora] = useState(reserva.hora);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await editarReserva(reserva.id, { nombre, email, telefono, fecha, hora, codigoSocioRecomendado });
      toast('success', 'Reserva actualizada correctamente');
      onSaved();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Error al guardar';
      setError(msg || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="admin-modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="admin-modal admin-modal-sm"
      >
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Editar Reserva</h3>
          <button onClick={onClose} className="admin-modal-close">
            <X />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="admin-modal-body">
          {error && (
            <div className="admin-form-error">
              <AlertCircle />
              {error}
            </div>
          )}
          <div className="admin-form-group">
            <label>Nombre</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="admin-input"
            />
          </div>
          <div className="admin-form-group">
            <label>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-input"
            />
          </div>
          <div className="admin-form-group">
            <label>Telefono</label>
            <input
              type="text"
              required
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="admin-input"
            />
          </div>
          <div className="admin-form-group">
            <label>Código Socio Recomendado</label>
            <input
              type="text"
              required
              value={codigoSocioRecomendado}
              onChange={(e) => setCodigoSocioRecomendado(e.target.value)}
              className="admin-input"
            />
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Fecha</label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="admin-input"
              />
            </div>
            <div className="admin-form-group">
              <label>Hora</label>
              <input
                type="time"
                required
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="admin-input"
              />
            </div>
          </div>
          <div className="admin-form-row" style={{ marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="admin-btn admin-btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="admin-btn admin-btn-primary"
            >
              {saving ? <Loader2 className="admin-btn-icon spin" /> : null}
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function ValidarQRModal({
  isOpen,
  onClose,
  onResult,
}: {
  isOpen: boolean;
  onClose: () => void;
  onResult: () => void;
}) {
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanAreaId = useRef(`qr-scanner-${Math.random().toString(36).substr(2, 9)}`);
  const isProcessingRef = useRef(false);

  const stopScanning = useCallback(async () => {
    if (!scannerRef.current) return;

    const scanner = scannerRef.current;
    scannerRef.current = null;
    setScanning(false);

    try {
      if (scanner && typeof scanner.stop === 'function') {
        try {
          await scanner.stop();
        } catch (stopErr) {
          // Ignorar errores al detener
        }
      }
    } catch (err) {
      // Ignorar errores
    }
  }, []);

  const handleValidar = useCallback(async (token: string) => {
    if (!token.trim() || isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    setLoading(true);
    setResult(null);
    
    try {
      const data = await validarQR(token);
      const success = data.estado === 'VALIDO';
      setResult({ success, message: data.mensaje });
      if (success) {
        toast('success', 'QR validado correctamente');
        setTimeout(() => {
          onResult();
          onClose();
        }, 1500);
      }
    } catch {
      setResult({ success: false, message: 'Token inválido o error de conexión' });
    } finally {
      setLoading(false);
      isProcessingRef.current = false;
    }
  }, [onClose, onResult]);

  const startScanning = useCallback(async () => {
    if (scannerRef.current || !isOpen) return;

    try {
      const html5QrCode = new Html5Qrcode(scanAreaId.current);
      scannerRef.current = html5QrCode;

      setScanning(true);
      setCameraError(null);
      isProcessingRef.current = false;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          if (isProcessingRef.current) return;
          // Validar token y detener
          stopScanning();
          handleValidar(decodedText);
        },
        (_errorMessage) => {
          // Ignorar errores de escaneo continuo
        }
      );
    } catch (err) {
      console.error('Error al iniciar escáner:', err);
      setCameraError('No se pudo acceder a la cámara. Verifica los permisos.');
      setScanning(false);
    }
  }, [isOpen, handleValidar, stopScanning]);

  // Iniciar/detener escáner cuando se abre/cierra
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        startScanning();
      }, 300);
      
      return () => {
        clearTimeout(timer);
        stopScanning();
      };
    } else {
      stopScanning();
      setCameraError(null);
      isProcessingRef.current = false;
    }
  }, [isOpen, startScanning, stopScanning]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      stopScanning();
      setCameraError(null);
      isProcessingRef.current = false;
    };
  }, [stopScanning]);

  const handleClose = () => {
    stopScanning();
    setCameraError(null);
    isProcessingRef.current = false;
    onClose();
  };

  const handleRetry = () => {
    setResult(null);
    setCameraError(null);
    setScanning(false);
    setTimeout(() => {
      startScanning();
    }, 300);
  };

  if (!isOpen) return null;

  // Renderizar usando portal directamente en body
  return createPortal(
    <div className="qr-scanner-fullscreen" onClick={handleClose}>
      <div className="qr-scanner-fullscreen-content" onClick={(e) => e.stopPropagation()}>
        <div className="qr-scanner-fullscreen-header">
          <h2 className="qr-scanner-fullscreen-title">Validar QR</h2>
          <button
            type="button"
            className="qr-scanner-fullscreen-close"
            onClick={handleClose}
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <div className="qr-scanner-fullscreen-body">
          <p className="qr-scanner-fullscreen-instructions">
            Apunta la cámara hacia el código QR para validar la reserva automáticamente.
          </p>

          <div className="qr-scanner-fullscreen-container">
            <div id={scanAreaId.current} className="qr-scanner-fullscreen-area"></div>
            
            {!scanning && !cameraError && !result && !loading && (
              <div className="qr-scanner-fullscreen-placeholder">
                <Loader2 className="admin-spinner" style={{ width: 40, height: 40 }} />
                <p>Iniciando cámara...</p>
              </div>
            )}

            {cameraError && (
              <div className="qr-scanner-fullscreen-error">
                <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.7 }} />
                <p>{cameraError}</p>
                <button
                  type="button"
                  className="qr-scanner-fullscreen-retry"
                  onClick={handleRetry}
                >
                  <RotateCcw size={16} style={{ marginRight: '0.5rem' }} />
                  Reintentar
                </button>
              </div>
            )}

            {result && (
              <div className={`qr-scanner-fullscreen-result ${result.success ? 'success' : 'error'}`}>
                {result.success ? <CheckCircle size={48} /> : <AlertCircle size={48} />}
                <p style={{ marginTop: '1rem', fontWeight: 500 }}>{result.message}</p>
                {!result.success && (
                  <button
                    type="button"
                    className="qr-scanner-fullscreen-retry"
                    onClick={handleRetry}
                    style={{ marginTop: '1rem' }}
                  >
                    <RotateCcw size={16} style={{ marginRight: '0.5rem' }} />
                    Escanear de nuevo
                  </button>
                )}
              </div>
            )}

            {loading && (
              <div className="qr-scanner-fullscreen-placeholder">
                <Loader2 className="admin-spinner" style={{ width: 40, height: 40 }} />
                <p>Validando...</p>
              </div>
            )}
          </div>

          <div className="qr-scanner-fullscreen-actions">
            <button
              type="button"
              className="qr-scanner-fullscreen-close-button"
              onClick={handleClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function CrearReservaModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [codigoSocioRecomendado, setCodigoSocioRecomendado] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await crearReserva({ nombre, email, telefono, fecha, hora, codigoSocioRecomendado });
      toast('success', 'Reserva creada correctamente');
      onCreated();
      onClose();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string; errors?: Record<string, string> } } }).response?.data
        : null;
      if (msg?.errors) {
        setError(Object.values(msg.errors)[0] || 'Error de validacion');
      } else {
        setError(msg?.message || 'Error al crear la reserva');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="admin-modal-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="admin-modal admin-modal-sm"
          >
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Nueva Reserva</h3>
              <button onClick={onClose} className="admin-modal-close">
                <X />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal-body">
              {error && (
                <div className="admin-form-error">
                  <AlertCircle />
                  {error}
                </div>
              )}
              <div className="admin-input-icon-wrapper">
                <User className="admin-input-icon" />
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre completo"
                  className="admin-input admin-input-with-left-icon"
                />
              </div>
              <div className="admin-input-icon-wrapper">
                <Mail className="admin-input-icon" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="admin-input admin-input-with-left-icon"
                />
              </div>
              <div className="admin-input-icon-wrapper">
                <Phone className="admin-input-icon" />
                <input
                  type="tel"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Telefono (+34600000000)"
                  className="admin-input admin-input-with-left-icon"
                />
              </div>
              <div className="admin-input-icon-wrapper">
                <User className="admin-input-icon" />
                <input
                  type="text"
                  required
                  value={codigoSocioRecomendado}
                  onChange={(e) => setCodigoSocioRecomendado(e.target.value)}
                  placeholder="Código de Socio Recomendado"
                  className="admin-input admin-input-with-left-icon"
                />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.75rem' }}>Fecha</label>
                  <input
                    type="date"
                    required
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.75rem' }}>Hora</label>
                  <select
                    required
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className="admin-input"
                  >
                    <option value="">Seleccionar</option>
                    {[
                      '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
                      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
                      '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
                      '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
                    ].map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="admin-form-row" style={{ marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="admin-btn admin-btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="admin-btn admin-btn-primary"
                >
                  {saving ? <Loader2 className="admin-btn-icon spin" /> : <Plus className="admin-btn-icon" />}
                  {saving ? 'Creando...' : 'Crear Reserva'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function AdminReservas() {
  const [reservas, setReservas] = useState<ReservaDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<StatusFilter>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedReserva, setSelectedReserva] = useState<ReservaDetalle | null>(null);
  const [editingReserva, setEditingReserva] = useState<ReservaDetalle | null>(null);
  const [validarOpen, setValidarOpen] = useState(false);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [crearOpen, setCrearOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [fechaFiltro, currentPage]);

  const loadData = async () => {
    try {
      const data = await getReservas(fechaFiltro || undefined, currentPage, 20);
      setReservas(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      console.error('Error loading reservas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidarQR = async (id: number) => {
    const reserva = reservas.find((r) => r.id === id);
    if (!reserva) return;
    try {
      const result = await validarQR(reserva.token);
      if (result.estado === 'VALIDO') {
        toast('success', 'Reserva verificada correctamente');
        setSelectedReserva(null);
        loadData();
      }
    } catch {
      toast('error', 'Error al validar el QR');
    }
  };

  const handleCancelReserva = async (id: number) => {
    try {
      await cancelarReserva(id);
      toast('success', 'Reserva cancelada');
      setSelectedReserva(null);
      setCancelId(null);
      loadData();
    } catch {
      toast('error', 'Error al cancelar la reserva');
    }
  };

  const handleEditClick = (r: ReservaDetalle) => {
    setSelectedReserva(null);
    setEditingReserva(r);
  };

  const filteredReservas = reservas.filter((r) => {
    if (statusFiltro === 'pendiente' && (r.cancelada || r.qrUsado)) return false;
    if (statusFiltro === 'usado' && !r.qrUsado) return false;
    if (statusFiltro === 'cancelada' && !r.cancelada) return false;
    if (busqueda) {
      const q = busqueda.toLowerCase();
      return r.nombre.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.telefono.includes(q);
    }
    return true;
  });

  const statusCounts = {
    all: reservas.length,
    pendiente: reservas.filter((r) => !r.cancelada && !r.qrUsado).length,
    usado: reservas.filter((r) => r.qrUsado).length,
    cancelada: reservas.filter((r) => r.cancelada).length,
  };

  return (
    <div className="admin-space-y page-content">
      <div className="admin-page-header" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <div>
          <h2 className="admin-page-title">Reservas</h2>
          <p className="admin-page-subtitle">{totalElements} reservas en total</p>
        </div>
        <div className="admin-page-actions">
          <button onClick={() => setCrearOpen(true)} className="admin-btn admin-btn-primary">
            <Plus className="admin-btn-icon" />
            Nueva
          </button>
          <button
            onClick={() => {
              exportReservasCSV(filteredReservas);
              toast('success', `Exportadas ${filteredReservas.length} reservas`);
            }}
            className="admin-btn admin-btn-secondary"
          >
            <Download className="admin-btn-icon" />
            CSV
          </button>
          <button onClick={() => setValidarOpen(true)} className="admin-btn admin-btn-secondary">
            <QrCode className="admin-btn-icon" />
            Validar QR
          </button>
        </div>
      </div>

      <div className="admin-filters">
        <div className="admin-search-wrapper">
          <Search className="admin-search-icon" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, email o telefono..."
            className="admin-input admin-input-with-icon"
          />
        </div>
        <div className="admin-filter-group">
          <div className="admin-filter-date-wrapper">
            <Calendar className="admin-filter-date-icon" />
            <input
              type="date"
              value={fechaFiltro}
              onChange={(e) => { setFechaFiltro(e.target.value); setCurrentPage(0); }}
              className="admin-filter-date"
            />
          </div>
          {fechaFiltro && (
            <button
              onClick={() => { setFechaFiltro(''); setCurrentPage(0); }}
              className="admin-btn admin-btn-secondary admin-btn-sm"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="admin-status-tabs">
        {([['all', 'Todas'], ['pendiente', 'Pendientes'], ['usado', 'Verificadas'], ['cancelada', 'Canceladas']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setStatusFiltro(key as StatusFilter)}
            className={`admin-status-tab ${statusFiltro === key ? 'active' : ''}`}
          >
            {label} ({statusCounts[key as keyof typeof statusCounts]})
          </button>
        ))}
      </div>

      <ResponsiveContainer className="table-container">
        <ReservasList
          reservas={filteredReservas}
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          isLoading={loading}
          onPageChange={setCurrentPage}
          onView={setSelectedReserva}
          onEdit={setEditingReserva}
          onCancel={setCancelId}
          onUsar={handleValidarQR}
        />
      </ResponsiveContainer>

      <AnimatePresence>
        {selectedReserva && (
          <ReservaDetalleModal
            reserva={selectedReserva}
            onClose={() => setSelectedReserva(null)}
            onValidar={handleValidarQR}
            onCancelar={(id) => { setSelectedReserva(null); setCancelId(id); }}
            onEditClick={handleEditClick}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingReserva && (
          <EditReservaModal
            reserva={editingReserva}
            onClose={() => setEditingReserva(null)}
            onSaved={() => { setEditingReserva(null); loadData(); }}
          />
        )}
      </AnimatePresence>

      <ValidarQRModal
        isOpen={validarOpen}
        onClose={() => setValidarOpen(false)}
        onResult={loadData}
      />

      <CrearReservaModal
        isOpen={crearOpen}
        onClose={() => setCrearOpen(false)}
        onCreated={loadData}
      />

      <ConfirmDialog
        open={cancelId !== null}
        title="Cancelar Reserva"
        message="Esta accion no se puede deshacer. La reserva sera marcada como cancelada."
        confirmLabel="Cancelar Reserva"
        confirmColor="red"
        onConfirm={() => cancelId !== null && handleCancelReserva(cancelId)}
        onCancel={() => setCancelId(null)}
      />
    </div>
  );
}
