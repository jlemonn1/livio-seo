import { motion } from 'framer-motion';
import { Calendar, CheckCircle, TrendingUp, Clock, type LucideIcon } from 'lucide-react';
import type { DashboardStats } from '../../types';
import '../../styles/Admin.css';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: 'gold' | 'green' | 'red' | 'white';
  index: number;
}

const colorMap = {
  gold: {
    valueClass: 'admin-stat-value-gold',
    iconClass: 'admin-stat-icon-gold',
  },
  green: {
    valueClass: 'admin-stat-value-green',
    iconClass: 'admin-stat-icon-green',
  },
  red: {
    valueClass: 'admin-stat-value-red',
    iconClass: 'admin-stat-icon-red',
  },
  white: {
    valueClass: 'admin-stat-value-white',
    iconClass: 'admin-stat-icon-white',
  },
};

function StatCard({ label, value, icon: Icon, color, index }: StatCardProps) {
  const c = colorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="admin-stat-card"
    >
      <div className="admin-stat-header">
        <span className="admin-stat-label">{label}</span>
        <div className={`admin-stat-icon ${c.iconClass}`}>
          <Icon />
        </div>
      </div>
      <p className={`admin-stat-value ${c.valueClass}`}>{value}</p>
    </motion.div>
  );
}

export default function StatsCards({ stats }: { stats: DashboardStats }) {
  const cards: StatCardProps[] = [
    { label: 'Total Reservas', value: stats.totalReservas, icon: Calendar, color: 'gold', index: 0 },
    { label: 'Escaneadas', value: stats.reservasEscaneadas, icon: CheckCircle, color: 'green', index: 1 },
    { label: 'Tasa Asistencia', value: `${stats.tasaAsistencia.toFixed(1)}%`, icon: TrendingUp, color: 'gold', index: 2 },
    { label: 'Reservas Hoy', value: stats.reservasHoy, icon: Clock, color: 'white', index: 3 },
  ];

  return (
    <div className="admin-stats-grid">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
