import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import StatsCards from '../../components/admin/StatCard';
import { getDashboard } from '../../services/api';
import type { DashboardStats } from '../../types';
import '../../styles/Admin.css';

function ReservasChart({ stats }: { stats: DashboardStats }) {
  const days = Object.keys(stats.reservasPorDia).slice(-7);
  const values = Object.values(stats.reservasPorDia).slice(-7);
  const maxValue = Math.max(...values, 1);

  const dayLabels = days.map((d) => {
    const parts = d.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
    return d.slice(-5);
  });

  return (
    <div className="admin-chart">
      <h3 className="admin-chart-title">Reservas por Dia</h3>
      {!days.length ? (
        <p className="admin-chart-empty">Sin datos</p>
      ) : (
        <div className="admin-bar-chart">
          {days.map((day, index) => {
            const height = (values[index] / maxValue) * 100;
            return (
              <div key={day} className="admin-bar-item">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                  className="admin-bar"
                >
                  <div className="admin-bar-tooltip">{values[index]}</div>
                </motion.div>
                <span className="admin-bar-label">{dayLabels[index]}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HorasPopulares({ horas }: { horas: Record<string, number> }) {
  const sorted = Object.entries(horas)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  const maxCount = sorted.length > 0 ? sorted[0][1] : 1;

  return (
    <div className="admin-chart">
      <h3 className="admin-chart-title">Horas Populares</h3>
      {!sorted.length ? (
        <p className="admin-chart-empty">Sin datos</p>
      ) : (
        <div className="admin-progress-list">
          {sorted.map(([hora, count], index) => (
            <div key={hora} className="admin-progress-item">
              <span className="admin-progress-rank">{index + 1}</span>
              <div className="admin-progress-content">
                <div className="admin-progress-header">
                  <span className="admin-progress-label">{hora}</span>
                  <span className="admin-progress-value">{count}</span>
                </div>
                <div className="admin-progress-bar">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxCount) * 100}%` }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    className="admin-progress-fill"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getDashboard();
      setStats(data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="admin-error-state">
        <p>Error al cargar los datos del dashboard</p>
        <button onClick={handleRefresh} className="btn-primary">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="admin-space-y">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Dashboard</h2>
          <p className="admin-page-subtitle">Resumen general de la actividad</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="admin-btn admin-btn-secondary"
        >
          <RefreshCw className={`admin-btn-icon ${refreshing ? 'spin' : ''}`} />
          <span className="admin-hidden-mobile">Refrescar</span>
        </button>
      </div>

      <StatsCards stats={stats} />

      <div className="admin-grid-2">
        <ReservasChart stats={stats} />
        <HorasPopulares horas={stats.horasMasReservadas} />
      </div>
    </div>
  );
}
