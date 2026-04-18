import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Lock, User, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './AdminLogin.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(username, password);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Credenciales incorrectas');
      } else {
        setError('Error al iniciar sesion');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-bg" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="admin-login-card"
      >
        <div className="admin-login-header">
          <div className="admin-login-icon">
            <Leaf style={{ width: 48, height: 48 }} />
          </div>
          <h1>Club Cannabico</h1>
          <p>Panel de Administracion</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label>Usuario</label>
            <div className="input-with-icon">
              <User className="input-icon" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contrasena</label>
            <div className="input-with-icon">
              <Lock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-btn"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="admin-login-error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary admin-login-submit"
          >
            {loading ? <Loader2 className="spin" size={18} /> : 'Iniciar Sesion'}
          </button>
        </form>

        <div className="admin-login-back">
          <Link to="/" className="back-link">
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>
        </div>
      </motion.div>
    </div>
  );
}