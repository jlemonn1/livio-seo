import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, LayoutDashboard, CalendarDays, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Admin.css';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/reservas', label: 'Reservas', icon: CalendarDays },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <div className="admin-layout">
      {/* Desktop sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-sidebar-brand">
            <Leaf className="admin-sidebar-brand-icon" />
            <div>
              <h1 className="admin-sidebar-brand-title">Club Cannabico</h1>
              <p className="admin-sidebar-brand-subtitle">Admin Panel</p>
            </div>
          </Link>
        </div>
        <nav className="admin-sidebar-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-sidebar-link ${isActive ? 'active' : ''}`}
              >
                <item.icon />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-footer">
          <button onClick={logout} className="admin-sidebar-logout">
            <LogOut />
            Cerrar sesion
          </button>
        </div>
      </aside>

      {/* Mobile overlay sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="admin-mobile-overlay"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="admin-mobile-sidebar"
            >
              <div className="admin-mobile-sidebar-header">
                <Link to="/" className="admin-sidebar-brand">
                  <Leaf className="admin-sidebar-brand-icon" />
                  <div>
                    <h1 className="admin-sidebar-brand-title">Club Cannabico</h1>
                    <p className="admin-sidebar-brand-subtitle">Admin Panel</p>
                  </div>
                </Link>
                <button onClick={() => setSidebarOpen(false)} className="admin-mobile-close">
                  <X />
                </button>
              </div>
              <nav className="admin-sidebar-nav">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`admin-sidebar-link ${isActive ? 'active' : ''}`}
                    >
                      <item.icon />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="admin-sidebar-footer">
                <button onClick={logout} className="admin-sidebar-logout">
                  <LogOut />
                  Cerrar sesion
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="admin-main">
        {/* Mobile header */}
        <header className="admin-mobile-header">
          <button onClick={() => setSidebarOpen(true)} className="admin-mobile-menu-btn">
            <Menu />
          </button>
          <div className="admin-mobile-brand">
            <Leaf />
            <span>Admin</span>
          </div>
          <button onClick={logout} className="admin-mobile-logout">
            <LogOut />
          </button>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
