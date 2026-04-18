import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { Leaf, Menu, X, ChevronDown, Clock, Phone, Mail, Users, Shield, Copy, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { crearReserva } from './services/api';
import './App.css';

const IMAGES = {
  hero: '/hero.png',
  about: '/hero.png',
  menu: '/hero.png',
  games: '/hero.png',
  music: '/hero.png',
  events: '/hero.png',
  drinks: '/hero.png',
  wifi: '/hero.png',
  logo: '/logo.png',
  gallery: [
    '/gal1.png',
    '/gal2.png',
  ]
};

const faqs = [
  { question: 'Necesito ser socio para entrar?', answer: 'Si, todos los clubes cannábicos en España son asociaciones privadas. Necesitas ser socio y tener una invitación válida para acceder.' },
  { question: 'Cuál es la edad mínima?', answer: 'La edad mínima para acceder es de 18 años. Debes traer tu documento de identidad válido.' },
  { question: 'Puedo llevar cannabis fuera del club?', answer: 'No. El consumo está permitido exclusivamente dentro de las instalaciones del club. Portar cannabis en espacios públicos es ilegal.' },
  { question: 'Cuánto cuesta la membresía?', answer: 'La cuota anual es de 20€. Incluye acceso al lounge, menú completo y eventos privados.' },
];

const steps = [
  { title: 'Elige', desc: 'Escoge tu fecha y hora' },
  { title: 'Registra', desc: 'Completa tus datos' },
  { title: 'Visita', desc: 'Ven al club con tu invitación' },
  { title: 'Disfruta', desc: 'Accede al lounge y menú' },
];

// Componente con animation trigger cuando entra en viewport
function AnimatedSection({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Parallax Image
function ParallaxImage({ src, alt, className, speed = 0.5 }: { src: string, alt: string, className?: string, speed?: number }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 30}%`]);

  return (
    <div ref={ref} className={`parallax-container ${className || ''}`}>
      <motion.div style={{ y }} className="parallax-inner">
        <img src={src} alt={alt} />
      </motion.div>
    </div>
  );
}

// Floating leaf background element
function FloatingLeaf({ className, delay = 0 }: { className?: string, delay?: number }) {
  return (
    <motion.div
      className={`floating-leaf ${className || ''}`}
      initial={{ opacity: 0, y: 100, rotate: 0 }}
      animate={{ 
        opacity: [0, 0.15, 0.15, 0], 
        y: [100, -100],
        rotate: [0, 360]
      }}
      transition={{ 
        duration: 15, 
        delay,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <Leaf size={24} />
    </motion.div>
  );
}

function AgeGate({ onConfirm }: { onConfirm: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const confirmed = localStorage.getItem('ageVerified');
    if (confirmed === 'true') {
      setIsVisible(false);
      onConfirm();
    }
  }, [onConfirm]);

  const handleConfirm = () => {
    localStorage.setItem('ageVerified', 'true');
    setIsVisible(false);
    onConfirm();
  };

  if (!isVisible) return null;

  return (
    <motion.div 
      className="age-gate"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="age-gate-content"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Shield className="icon-neon" />
        <h2>Acceso Restringido</h2>
        <p>Este sitio es solo para adultos de 18 años o más. Debes tener la edad legal para continuar.</p>
        <div className="age-gate-buttons">
          <button onClick={handleConfirm} className="age-gate-confirm">Soy mayor de 18</button>
          <button onClick={() => window.location.href = 'https://google.com'} className="age-gate-exit">Salir</button>
        </div>
        <p className="age-gate-disclaimer">Sitio con fines informativos únicamente.</p>
      </motion.div>
    </motion.div>
  );
}

function Navbar({ onReserve }: { onReserve: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container navbar-content">
        <div className="navbar-logo">
          <img src={IMAGES.logo} alt="Logo" />
        </div>
        <div className="navbar-links">
          <a href="#about">Nosotros</a>
          <a href="#steps">Cómo Unirse</a>
          <a href="#gallery">Galería</a>
          <a href="#location">Horario</a>
          <a href="#faq">FAQ</a>
          <button onClick={onReserve} className="btn-primary">Invitación</button>
        </div>
        <button className="navbar-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>
      {mobileOpen && (
        <div className="navbar-mobile-menu open">
          <a href="#about">Nosotros</a>
          <a href="#steps">Cómo Unirse</a>
          <a href="#gallery">Galería</a>
          <a href="#location">Horario</a>
          <a href="#faq">FAQ</a>
          <button onClick={() => { onReserve(); setMobileOpen(false); }} className="btn-primary">Invitación</button>
        </div>
      )}
    </motion.nav>
  );
}

function Hero({ onReserve }: { onReserve: () => void }) {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const navigate = useNavigate();
  const [pressProgress, setPressProgress] = useState(0);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const LONG_PRESS_DURATION = 3000; // 3 segundos
  const PROGRESS_INTERVAL = 50; // Actualizar cada 50ms

  const clearPressTimers = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setPressProgress(0);
  }, []);

  const handlePressStart = useCallback(() => {
    clearPressTimers();
    
    let progress = 0;
    progressIntervalRef.current = setInterval(() => {
      progress += (PROGRESS_INTERVAL / LONG_PRESS_DURATION) * 100;
      setPressProgress(Math.min(progress, 100));
    }, PROGRESS_INTERVAL);

    pressTimerRef.current = setTimeout(() => {
      navigate('/admin/login');
      clearPressTimers();
    }, LONG_PRESS_DURATION);
  }, [navigate, clearPressTimers]);

  const handlePressEnd = useCallback(() => {
    clearPressTimers();
  }, [clearPressTimers]);

  useEffect(() => {
    return () => {
      clearPressTimers();
    };
  }, [clearPressTimers]);

  return (
    <section className="hero">
      <motion.div className="hero-bg" style={{ y: y1 }}>
        <img src={IMAGES.hero} alt="Club interior" />
      </motion.div>
      <motion.div className="hero-overlay" style={{ opacity }} />
      
      {/* Floating leaves */}
      <FloatingLeaf className="leaf-1" delay={0} />
      <FloatingLeaf className="leaf-2" delay={2} />
      <FloatingLeaf className="leaf-3" delay={4} />

      <div className="hero-content">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div 
            className="hero-badge admin-access-badge"
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            style={{ position: 'relative', cursor: 'pointer' }}
          >
            <Leaf size={16} />
            <span>Bernabeu, Madrid 📌</span>
            {pressProgress > 0 && (
              <div className="long-press-indicator">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path
                    className="circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="circle"
                    strokeDasharray={`${pressProgress}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
            )}
          </div>
        </motion.div>
        
        <motion.h1 
          className="hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <img src={IMAGES.logo} alt="District420" />
        </motion.h1>
        
        <motion.p 
          className="hero-subtitle"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Tu espacio privado para disfrutar de cannabis de forma legal y responsable. 
          Únete a la comunidad más exclusiva de Madrid.
        </motion.p>
        
        <motion.div 
          className="hero-buttons"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <button onClick={onReserve} className="btn-primary">Consigue tu Invitación</button>
          <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="btn-outline">
            Descubre más <ArrowRight size={18} />
          </button>
        </motion.div>
        
        <motion.div 
          className="hero-info"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="hero-info-item">
            <span className="dot"></span>
            <span>+21 Años</span>
          </div>
          <div className="hero-info-item">
            <span className="dot"></span>
            <span>Abierto 13:00 - 22:00</span>
          </div>
        </motion.div>
      </div>
      
      <motion.div 
        className="hero-scroll"
        style={{ opacity }}
      >
        <ChevronDown size={32} />
      </motion.div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="about">
      <FloatingLeaf className="leaf-about-1" delay={1} />
      <FloatingLeaf className="leaf-about-2" delay={3} />
      
      <div className="container">
        <div className="about-grid">
          <AnimatedSection className="about-image" delay={0.2}>
            <ParallaxImage src={IMAGES.about} alt="Nuestro club" className="parallax-image" speed={0.3} />
          </AnimatedSection>
          
          <AnimatedSection className="about-content" delay={0.4}>
            <h2 className="section-title">
              Sobre <span className="highlight">District420</span>
            </h2>
            <p>
              District420 es una asociación cannábica privada en el corazón de Madrid. 
              Fundamos este espacio para crear una comunidad donde los amantes del cannabis 
              puedan disfrutar de forma segura, legal y en buen ambiente.
            </p>
            <p>
              Nuestro objetivo es ofrecer un lugar tranquilo y exclusivo donde puedas 
              relajarte, conectar con otros y disfrutar de un buen ambiente.
            </p>
            <div className="about-features">
              <AnimatedSection delay={0.5} className="about-feature">
                <Shield className="icon-neon" />
                <div>
                  <h4>100% Legal</h4>
                  <p>Operamos bajo normativa</p>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={0.6} className="about-feature">
                <Users className="icon-neon" />
                <div>
                  <h4>Comunidad</h4>
                  <p>Ambiente acogedor</p>
                </div>
              </AnimatedSection>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

function Steps() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section id="steps" className="steps" ref={containerRef}>
      <div className="container">
        <AnimatedSection className="steps-header" delay={0.2}>
          <h2 className="section-title">
            Cómo <span className="highlight">Unirse</span>
          </h2>
          <p className="section-subtitle">
            En solo 4 pasos puedes formar parte de District420
          </p>
        </AnimatedSection>
        
        <div className="steps-container">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.15 }}
              className="step-card"
              whileHover={{ scale: 1.03, y: -5 }}
            >
              <motion.div 
                className="step-number"
                whileHover={{ scale: 1.1 }}
              >
                {index + 1}
              </motion.div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}



function Location() {
  return (
    <section id="location" className="location">
      <div className="container">
        <AnimatedSection className="steps-header" delay={0.2}>
          <h2 className="section-title">
            Horario y <span className="highlight">Contacto</span>
          </h2>
        </AnimatedSection>
        
        <div className="location-grid">
          <AnimatedSection className="location-info" delay={0.3}>
            <motion.div className="location-item" whileHover={{ x: 5 }}>
              <Clock className="icon-neon" />
              <div>
                <h4>Horario</h4>
                <p>Lunes a Domingo: 13:00 - 22:00</p>
              </div>
            </motion.div>
            <motion.div className="location-item" whileHover={{ x: 5 }}>
              <Phone className="icon-neon" />
              <div>
                <h4>WhatsApp</h4>
                <p>
                  <a href="https://wa.me/34600000000" target="_blank" rel="noopener noreferrer">
                    +34 600 000 000
                  </a>
                </p>
              </div>
            </motion.div>
            <motion.div className="location-item" whileHover={{ x: 5 }}>
              <Mail className="icon-neon" />
              <div>
                <h4>Instagram</h4>
                <p>
                  <a href="https://instagram.com/thedistrictscs" target="_blank" rel="noopener noreferrer">
                    @thedistrictscs
                  </a>
                </p>
              </div>
            </motion.div>
          </AnimatedSection>
          
    
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current) {
      e.preventDefault();
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <section id="gallery" className="gallery">
      <div className="container">
        <AnimatedSection className="steps-header" delay={0.2}>
          <h2 className="section-title">
            Nuestra <span className="highlight">Galería</span>
          </h2>
          <p className="section-subtitle">
            Descubre el ambiente de District420
          </p>
        </AnimatedSection>
      </div>
      
      <div 
        className="gallery-scroll-container"
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
      >
        <div className="gallery-track">
          {IMAGES.gallery.map((img, index) => (
            <motion.div
              key={index}
              className="gallery-item"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <img src={img} alt={`Gallery ${index + 1}`} />
            </motion.div>
          ))}
        </div>
      </div>
      
      <p className="gallery-hint">
        Arrastra para explorar o usa el scroll
      </p>
    </section>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="faq">
      <div className="container">
        <AnimatedSection className="steps-header" delay={0.2}>
          <h2 className="section-title">
            Preguntas <span className="highlight">Frecuentes</span>
          </h2>
        </AnimatedSection>
        
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <AnimatedSection key={index} delay={0.1 * index}>
              <motion.div 
                className="faq-item"
                whileHover={{ scale: 1.01 }}
              >
                <button 
                  className={`faq-question ${openIndex === index ? 'active' : ''}`}
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  {faq.question}
                  <motion.span
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="faq-answer"
                    >
                      <p>{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <motion.footer 
      className="footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="container footer-content">
        <div className="footer-logo">
          <img src={IMAGES.logo} alt="Logo" />
        </div>
        <div className="footer-links">
          <a href="#about">Nosotros</a>
          <a href="#gallery">Galería</a>
          <a href="#location">Contacto</a>
        </div>
        <div className="footer-legal">
          <p>AVISO: Este sitio es solo para adultos de 21 años o más.</p>
          <p>Información con fines educativos. No promueve el consumo.</p>
          <p>© 2026 District420. Todos los derechos reservados.</p>
        </div>
      </div>
    </motion.footer>
  );
}

const DAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const;
const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'] as const;

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 13; h < 23; h++) {
    for (let m = 0; m < 60; m += 15) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
}
const TIME_SLOTS = generateTimeSlots();

function DatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [viewDate, setViewDate] = useState(() => {
    const d = value ? new Date(value + 'T00:00:00') : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  const handleSelect = (day: number) => {
    const sel = new Date(year, month, day);
    const y = sel.getFullYear();
    const m = String(sel.getMonth() + 1).padStart(2, '0');
    const d = String(sel.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
  };

  const cells: { day: number; cur: boolean; dis: boolean }[] = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ day: prevDays - i, cur: false, dis: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month, d);
    cells.push({ day: d, cur: true, dis: dt < today });
  }
  const rem = 42 - cells.length;
  for (let i = 1; i <= rem; i++) {
    cells.push({ day: i, cur: false, dis: true });
  }

  return (
    <div className="picker-calendar">
      <div className="picker-calendar-header">
        <button type="button" className="picker-nav-btn" onClick={() => setViewDate(new Date(year, month - 1, 1))}><ChevronLeft size={18} /></button>
        <span className="picker-calendar-title">{MONTHS_ES[month]} {year}</span>
        <button type="button" className="picker-nav-btn" onClick={() => setViewDate(new Date(year, month + 1, 1))}><ChevronRight size={18} /></button>
      </div>
      <div className="picker-calendar-weekdays">
        {DAYS_ES.map(d => <div key={d} className="picker-calendar-weekday">{d}</div>)}
      </div>
      <div className="picker-calendar-grid">
        {cells.map((c, i) => {
          const dateStr = c.cur ? `${year}-${String(month + 1).padStart(2, '0')}-${String(c.day).padStart(2, '0')}` : '';
          const selected = value === dateStr;
          const isToday = c.cur && c.day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          return (
            <button
              key={i}
              type="button"
              disabled={c.dis}
              className={`picker-calendar-cell ${!c.cur ? 'other' : ''} ${selected ? 'selected' : ''} ${isToday && !selected ? 'today' : ''}`}
              onClick={() => c.cur && handleSelect(c.day)}
            >
              {c.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, []);

  useEffect(() => {
    if (value && scrollRef.current) {
      const idx = TIME_SLOTS.indexOf(value);
      if (idx >= 0) {
        const el = scrollRef.current.children[idx] as HTMLElement;
        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [value]);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="picker-time">
      <button
        type="button"
        className={`picker-time-arrow picker-time-arrow-left ${canScrollLeft ? 'visible' : ''}`}
        onClick={() => scroll('left')}
        aria-label="Anterior"
      >
        <ChevronLeft size={20} />
      </button>
      <div className="picker-time-track" ref={scrollRef}>
        {TIME_SLOTS.map((slot) => {
          const selected = value === slot;
          return (
            <button
              key={slot}
              type="button"
              className={`picker-time-chip ${selected ? 'selected' : ''}`}
              onClick={() => onChange(slot)}
            >
              {slot}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className={`picker-time-arrow picker-time-arrow-right ${canScrollRight ? 'visible' : ''}`}
        onClick={() => scroll('right')}
        aria-label="Siguiente"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

function ReservationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', fecha: '', hora: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await crearReserva(form);
      setToken(data.token);
      setSuccess(true);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string> } } };
        if (axiosErr.response?.data?.errors) {
          const firstError = Object.values(axiosErr.response.data.errors)[0];
          setError(firstError || 'Error de validacion');
        } else {
          setError(axiosErr.response?.data?.message || 'Error al crear reserva');
        }
      } else {
        setError('Error al procesar la solicitud');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
  };

  if (!isOpen) return null;

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getDate()} de ${MONTHS_ES[d.getMonth()]}`;
  };

  return (
    <motion.div 
      className="modal-overlay" 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="modal" 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Reserva tu Visita</h3>
          <button className="modal-close" onClick={onClose}><X /></button>
        </div>
        <div className="modal-body">
          {success ? (
            <div className="form-success">
              <Leaf className="icon-neon" />
              <h4>¡Reserva Creada!</h4>
              <p>Tu invitación está lista. Guarda tu token:</p>
              <div className="token-display">
                <code>{token}</code>
                <button className="token-copy" onClick={copyToken}><Copy /></button>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#666' }}>Lo necesitarás para acceder al club.</p>
              <button onClick={onClose} className="btn-primary form-submit">Cerrar</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre completo</label>
                <input type="text" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Juan Pérez" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="juan@email.com" />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input type="tel" required value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="+34 600 000 000" />
              </div>
              <div className="form-group">
                <label>Fecha</label>
                <DatePicker value={form.fecha} onChange={(v) => setForm({ ...form, fecha: v })} />
                {form.fecha && <span className="picker-selected-value">{formatDisplayDate(form.fecha)}</span>}
                {!form.fecha && <span className="picker-hint">Selecciona una fecha</span>}
              </div>
              {form.fecha && (
                <div className="form-group">
                  <label>Hora</label>
                  <TimePicker value={form.hora} onChange={(v) => setForm({ ...form, hora: v })} />
                  {form.hora && <span className="picker-selected-value">{form.hora}</span>}
                </div>
              )}
              {error && <p style={{ color: '#ff4444', marginBottom: '1rem' }}>{error}</p>}
              <button type="submit" className="btn-primary form-submit" disabled={loading || !form.fecha || !form.hora}>
                {loading ? 'Enviando...' : 'Crear Reserva'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const [, setAgeConfirmed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="landing">
      <AgeGate onConfirm={() => setAgeConfirmed(true)} />
      <Navbar onReserve={() => setModalOpen(true)} />
      <Hero onReserve={() => setModalOpen(true)} />
      <About />
      <Steps />
      <Gallery />
      <Location />
      <FAQ />
      <Footer />
      <ReservationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
