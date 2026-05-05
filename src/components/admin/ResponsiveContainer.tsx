import type { ReactNode } from 'react';
import './ResponsiveContainer.css';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Componente contenedor que garantiza que el contenido no se desborde
 * Usa técnicas agresivas de contención de overflow
 */
export default function ResponsiveContainer({ 
  children, 
  className = ''
}: ResponsiveContainerProps) {
  return (
    <div className={`responsive-container ${className}`}>
      <div className="responsive-container__wrapper">
        <div className="responsive-container__content">
          {children}
        </div>
      </div>
    </div>
  );
}
