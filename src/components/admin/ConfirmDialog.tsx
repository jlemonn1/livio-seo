import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import '../../styles/Admin.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmColor?: 'red' | 'gold';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  confirmColor = 'red',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="admin-modal-overlay"
          style={{ zIndex: 60 }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="admin-modal admin-modal-sm"
          >
            <div className="admin-modal-alert">
              <div className="admin-modal-alert-icon">
                <AlertTriangle />
              </div>
              <div className="admin-modal-alert-content">
                <h4>{title}</h4>
                <p>{message}</p>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button onClick={onCancel} className="admin-btn admin-btn-secondary">
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className={`admin-btn ${confirmColor === 'red' ? 'admin-btn-danger' : 'admin-btn-primary'}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
