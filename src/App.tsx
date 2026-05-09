import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { Leaf, Menu, X, ChevronDown, Clock, Phone, Mail, Users, Shield, Copy, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode';
import { crearReserva } from './services/api';
import LanguageSelector from './components/LanguageSelector';
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
  const { t } = useTranslation();
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
        <h2>{t('ageGate.title')}</h2>
        <p>{t('ageGate.description')}</p>
        <div className="age-gate-buttons">
          <button onClick={handleConfirm} className="age-gate-confirm">{t('ageGate.confirm')}</button>
          <button onClick={() => window.location.href = 'https://google.com'} className="age-gate-exit">{t('ageGate.exit')}</button>
        </div>
        <p className="age-gate-disclaimer">{t('ageGate.disclaimer')}</p>
      </motion.div>
    </motion.div>
  );
}

function Navbar({ onReserve }: { onReserve: () => void }) {
  const { t } = useTranslation();
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
          <a href="#about">{t('navbar.about')}</a>
          <a href="#steps">{t('navbar.howToJoin')}</a>
          <a href="#gallery">{t('navbar.gallery')}</a>
          <a href="#location">{t('navbar.schedule')}</a>
          <a href="#faq">{t('navbar.faq')}</a>
          <button onClick={onReserve} className="btn-primary">{t('navbar.invitation')}</button>
          <LanguageSelector />
        </div>
        <button className="navbar-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>
      {mobileOpen && (
        <div className="navbar-mobile-menu open">
          <a href="#about">{t('navbar.about')}</a>
          <a href="#steps">{t('navbar.howToJoin')}</a>
          <a href="#gallery">{t('navbar.gallery')}</a>
          <a href="#location">{t('navbar.schedule')}</a>
          <a href="#faq">{t('navbar.faq')}</a>
          <button onClick={() => { onReserve(); setMobileOpen(false); }} className="btn-primary">{t('navbar.invitation')}</button>
          <LanguageSelector />
        </div>
      )}
    </motion.nav>
  );
}

function Hero({ onReserve }: { onReserve: () => void }) {
  const { t } = useTranslation();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const navigate = useNavigate();
  const [pressProgress, setPressProgress] = useState(0);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const LONG_PRESS_DURATION = 3000;
  const PROGRESS_INTERVAL = 50;

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
            <span>{t('hero.badge')}</span>
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
          {t('hero.subtitle')}
        </motion.p>
        
        <motion.div 
          className="hero-buttons"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <button onClick={onReserve} className="btn-primary">{t('hero.ctaPrimary')}</button>
          <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="btn-outline">
            {t('hero.ctaSecondary')} <ArrowRight size={18} />
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
            <span>{t('hero.age')}</span>
          </div>
          <div className="hero-info-item">
            <span className="dot"></span>
            <span>{t('hero.hours')}</span>
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
  const { t } = useTranslation();
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
              {t('about.title')}
            </h2>
            <p>{t('about.paragraph1')}</p>
            <p>{t('about.paragraph2')}</p>
            <div className="about-features">
              <AnimatedSection delay={0.5} className="about-feature">
                <Shield className="icon-neon" />
                <div>
                  <h4>{t('about.featureLegal')}</h4>
                  <p>{t('about.featureLegalDesc')}</p>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={0.6} className="about-feature">
                <Users className="icon-neon" />
                <div>
                  <h4>{t('about.featureCommunity')}</h4>
                  <p>{t('about.featureCommunityDesc')}</p>
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
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const stepsList = [
    { title: t('steps.step1'), desc: t('steps.step1Desc') },
    { title: t('steps.step2'), desc: t('steps.step2Desc') },
    { title: t('steps.step3'), desc: t('steps.step3Desc') },
    { title: t('steps.step4'), desc: t('steps.step4Desc') },
  ];

  return (
    <section id="steps" className="steps" ref={containerRef}>
      <div className="container">
        <AnimatedSection className="steps-header" delay={0.2}>
          <h2 className="section-title">
            {t('steps.title')}
          </h2>
          <p className="section-subtitle">
            {t('steps.subtitle')}
          </p>
        </AnimatedSection>
        
        <div className="steps-container">
          {stepsList.map((step, index) => (
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
  const { t } = useTranslation();
  return (
    <section id="location" className="location">
      <div className="container">
        <AnimatedSection className="steps-header" delay={0.2}>
          <h2 className="section-title">
            {t('location.title')}
          </h2>
        </AnimatedSection>
        
        <div className="location-grid">
          <AnimatedSection className="location-info" delay={0.3}>
            <motion.div className="location-item" whileHover={{ x: 5 }}>
              <Clock className="icon-neon" />
              <div>
                <h4>{t('location.schedule')}</h4>
                <p>{t('location.scheduleValue')}</p>
              </div>
            </motion.div>
            <motion.div className="location-item" whileHover={{ x: 5 }}>
              <Phone className="icon-neon" />
              <div>
                <h4>{t('location.whatsapp')}</h4>
                <p>
                  <a href="https://wa.me/31617041293" target="_blank" rel="noopener noreferrer">
                    +31 6 17041293
                  </a>
                </p>
              </div>
            </motion.div>
            <motion.div className="location-item" whileHover={{ x: 5 }}>
              <Mail className="icon-neon" />
              <div>
                <h4>{t('location.instagram')}</h4>
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
  const { t } = useTranslation();
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
            {t('gallery.title')}
          </h2>
          <p className="section-subtitle">
            {t('gallery.subtitle')}
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
      
      <p className="gallery-hint">{t('gallery.hint')}</p>
    </section>
  );
}

function FAQ() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = t('faq.items', { returnObjects: true }) as Array<{ question: string; answer: string }>;

  return (
    <section id="faq" className="faq">
      <div className="container">
        <AnimatedSection className="steps-header" delay={0.2}>
          <h2 className="section-title">
            {t('faq.title')}
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
                      <pre>{faq.answer}</pre>
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
  const { t } = useTranslation();
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
          <a href="#about">{t('footer.about')}</a>
          <a href="#gallery">{t('footer.gallery')}</a>
          <a href="#location">{t('footer.contact')}</a>
        </div>
        <div className="footer-legal">
          <p>{t('footer.notice')}</p>
          <p>{t('footer.info')}</p>
          <p>{t('footer.rights')}</p>
        </div>
      </div>
    </motion.footer>
  );
}

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 13; h <= 21; h++) {
    const maxMinutes = h === 21 ? 30 : 45;
    for (let m = 0; m <= maxMinutes; m += 15) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
}
const TIME_SLOTS = generateTimeSlots();

function DatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation();
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

  const handleSelect = (day: number) => {
    const sel = new Date(year, month, day);
    const y = sel.getFullYear();
    const m = String(sel.getMonth() + 1).padStart(2, '0');
    const d = String(sel.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
  };

  const cells: { day: number; dis: boolean; isFirst: boolean; gridColumn?: number }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month, d);
    cells.push({ 
      day: d, 
      dis: dt < today,
      isFirst: d === 1,
      gridColumn: d === 1 ? startOffset + 1 : undefined
    });
  }

  return (
    <div className="picker-calendar">
      <div className="picker-calendar-header">
        <button type="button" className="picker-nav-btn" onClick={() => setViewDate(new Date(year, month - 1, 1))}><ChevronLeft size={18} /></button>
        <span className="picker-calendar-title">{(t('months', { returnObjects: true }) as string[])[month]} {year}</span>
        <button type="button" className="picker-nav-btn" onClick={() => setViewDate(new Date(year, month + 1, 1))}><ChevronRight size={18} /></button>
      </div>
      <div className="picker-calendar-weekdays">
        {(t('days', { returnObjects: true }) as string[]).map(d => <div key={d} className="picker-calendar-weekday">{d}</div>)}
      </div>
      <div className="picker-calendar-grid">
        {cells.map((c, i) => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(c.day).padStart(2, '0')}`;
          const selected = value === dateStr;
          const isToday = c.day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          return (
            <button
              key={i}
              type="button"
              disabled={c.dis}
              className={`picker-calendar-cell ${selected ? 'selected' : ''} ${isToday && !selected ? 'today' : ''}`}
              style={c.gridColumn ? { gridColumnStart: c.gridColumn } : undefined}
              onClick={() => handleSelect(c.day)}
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
  const { t } = useTranslation();
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
        aria-label={t('timePicker.previous')}
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
        aria-label={t('timePicker.next')}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

function ReservationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', fecha: '', hora: '', codigoSocioRecomendado: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [qrUrl, setQrUrl] = useState('');

  // Generar QR cuando se obtiene el token
  useEffect(() => {
    if (token) {
      QRCode.toDataURL(token, { width: 200, margin: 2 })
        .then(setQrUrl)
        .catch(console.error);
    }
  }, [token]);

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
          setError(firstError || t('reservation.validationError'));
        } else {
          setError(axiosErr.response?.data?.message || t('reservation.createError'));
        }
      } else {
        setError(t('reservation.processingError'));
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
    const months = t('months', { returnObjects: true }) as string[];
    return `${d.getDate()} de ${months[d.getMonth()]}`;
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
          <h3>{t('reservation.title')}</h3>
          <button className="modal-close" onClick={onClose}><X /></button>
        </div>
        <div className="modal-body">
          {success ? (
            <div className="form-success">
              <Leaf className="icon-neon" />
              <h4>{t('reservation.success')}</h4>
              <p>{t('reservation.successDesc')}</p>
              <div className="qr-display">
                {qrUrl && (
                  <div className="qr-code-container">
                    <img src={qrUrl} alt="QR Code de la reserva" className="qr-code-image" />
                  </div>
                )}
                <div className="token-text">
                  <code>{token}</code>
                  <button className="token-copy" onClick={copyToken} title="Copiar token"><Copy /></button>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#666' }}>{t('reservation.successNote')}</p>
              <button onClick={onClose} className="btn-primary form-submit">{t('reservation.close')}</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t('reservation.fullName')}</label>
                <input type="text" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder={t('reservation.fullNamePlaceholder')} />
              </div>
              <div className="form-group">
                <label>{t('reservation.email')}</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={t('reservation.emailPlaceholder')} />
              </div>
              <div className="form-group">
                <label>{t('reservation.phone')}</label>
                <input type="tel" required value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder={t('reservation.phonePlaceholder')} />
              </div>
              <div className="form-group">
                <label>{t('reservation.referralCode')}</label>
                <input type="text" value={form.codigoSocioRecomendado} onChange={(e) => setForm({ ...form, codigoSocioRecomendado: e.target.value })} placeholder={t('reservation.referralCodePlaceholder')} />
              </div>
              <div className="form-group">
                <label>{t('reservation.date')}</label>
                <DatePicker value={form.fecha} onChange={(v) => setForm({ ...form, fecha: v })} />
                {form.fecha && <span className="picker-selected-value">{formatDisplayDate(form.fecha)}</span>}
                {!form.fecha && <span className="picker-hint">{t('reservation.selectDate')}</span>}
              </div>
              {form.fecha && (
                <div className="form-group">
                  <label>{t('reservation.time')}</label>
                  <TimePicker value={form.hora} onChange={(v) => setForm({ ...form, hora: v })} />
                  {form.hora && <span className="picker-selected-value">{form.hora}</span>}
                </div>
              )}
              {error && <p style={{ color: '#ff4444', marginBottom: '1rem' }}>{error}</p>}
              <button type="submit" className="btn-primary form-submit" disabled={loading || !form.fecha || !form.hora}>
                {loading ? t('reservation.submitting') : t('reservation.submit')}
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
