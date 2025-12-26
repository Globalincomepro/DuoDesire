import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.pageYOffset > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : '';
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <div className="splash-page">
      <Head>
        <title>DuoDesire™ | Reignite Desire. Rekindle Passion.</title>
        <meta name="description" content="A breakthrough couples intimacy formula designed to elevate connection, arousal, and unforgettable nights—together." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      {/* Navigation */}
      <nav className={`splash-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="splash-nav-container">
          <Link href="/" className="splash-logo">
            <span className="splash-logo-duo">Duo</span>
            <span className="splash-logo-desire">Desire</span>
            <span className="splash-logo-tm">™</span>
          </Link>
          <div className="splash-nav-links">
            <a href="#powerful">The Formula</a>
            <a href="#science">The Science</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#stories">Stories</a>
            <Link href="/assessment" className="splash-nav-cta">Start Assessment</Link>
            <Link href="/physician/login" className="splash-nav-physician">Physician Login</Link>
          </div>
          <button 
            className={`splash-mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`splash-mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <a href="#powerful" onClick={closeMobileMenu}>The Formula</a>
        <a href="#science" onClick={closeMobileMenu}>The Science</a>
        <a href="#how-it-works" onClick={closeMobileMenu}>How It Works</a>
        <a href="#stories" onClick={closeMobileMenu}>Stories</a>
        <Link href="/assessment" className="splash-nav-cta" onClick={closeMobileMenu}>Start Assessment</Link>
        <Link href="/physician/login" className="splash-nav-physician" onClick={closeMobileMenu}>Physician Login</Link>
      </div>

      {/* Hero Section */}
      <section className="splash-hero" id="hero">
        <div className="splash-hero-bg">
          <div className="splash-hero-gradient"></div>
          <div className="splash-hero-particles"></div>
        </div>
        <div className="splash-hero-image">
          <img src="/images/hero-couple.jpg" alt="Romantic couple silhouette" loading="eager" />
        </div>
        <div className="splash-hero-content">
          <div className="splash-hero-badge">
            <span className="splash-badge-dot"></span>
            Physician-Guided Couples Intimacy
          </div>
          <h1 className="splash-hero-headline">
            <span className="splash-headline-line">Reignite Desire.</span>
            <span className="splash-headline-line">Rekindle Passion.</span>
            <span className="splash-headline-line accent">Rediscover Each Other.</span>
          </h1>
          <p className="splash-hero-subheadline">
            A breakthrough couples intimacy formula designed to elevate connection, arousal, and unforgettable nights—together.
          </p>
          <div className="splash-hero-ctas">
            <Link href="/assessment" className="splash-btn splash-btn-primary">
              <span>Start Your Couples Chemistry Assessment</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <a href="#how-it-works" className="splash-btn splash-btn-secondary">
              <span>How DuoDesire Works</span>
            </a>
          </div>
          <div className="splash-hero-trust">
            <div className="splash-trust-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/>
              </svg>
              <span>HIPAA Compliant</span>
            </div>
            <div className="splash-trust-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>Physician Supervised</span>
            </div>
            <div className="splash-trust-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
              <span>Discreet Delivery</span>
            </div>
          </div>
        </div>
        <div className="splash-hero-scroll-indicator">
          <span>Discover More</span>
          <div className="splash-scroll-arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </div>
        </div>
      </section>

      {/* What Makes It Powerful Section */}
      <section className="splash-powerful-section" id="powerful">
        <div className="splash-powerful-container">
          <div className="splash-powerful-content">
            <h2 className="splash-powerful-title">What makes them <em>Powerful</em></h2>
            
            <div className="splash-ingredient">
              <div className="splash-ingredient-header">
                <span className="splash-ingredient-icon blood">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </span>
                <h3 className="splash-ingredient-name">TADALAFIL</h3>
              </div>
              <ul className="splash-ingredient-list">
                <li><strong>For Him:</strong> Enhances blood flow for stronger, longer-lasting erections and improved physical readiness.</li>
                <li><strong>For Her:</strong> Increases blood flow to intimate areas, heightening sensitivity and natural arousal response.</li>
                <li>Long-lasting effects up to 36 hours for spontaneous intimacy.</li>
              </ul>
            </div>
            
            <div className="splash-ingredient">
              <div className="splash-ingredient-header">
                <span className="splash-ingredient-icon brain">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </span>
                <h3 className="splash-ingredient-name">PT-141 (Bremelanotide)</h3>
              </div>
              <ul className="splash-ingredient-list">
                <li><strong>For Him:</strong> Activates the brain&apos;s desire pathways, reigniting mental arousal and sexual motivation.</li>
                <li><strong>For Her:</strong> FDA-approved for low desire—works directly on the nervous system to naturally boost libido.</li>
                <li>The only treatment that targets desire at its source: the brain.</li>
              </ul>
            </div>
            
            <div className="splash-ingredient">
              <div className="splash-ingredient-header">
                <span className="splash-ingredient-icon bond">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/>
                  </svg>
                </span>
                <h3 className="splash-ingredient-name">OXYTOCIN</h3>
              </div>
              <ul className="splash-ingredient-list">
                <li><strong>For Him:</strong> Deepens emotional connection and trust, making intimacy more meaningful and fulfilling.</li>
                <li><strong>For Her:</strong> Enhances bonding, relaxation, and emotional closeness during intimate moments.</li>
                <li>Known as the &quot;love hormone&quot;—transforms physical intimacy into profound connection.</li>
              </ul>
            </div>
          </div>
          
          <div className="splash-powerful-visual">
            <img src="/images/powerful-couple.jpg" alt="Cosmic couple silhouette" className="splash-powerful-image" />
          </div>
        </div>
      </section>

      {/* Science Section */}
      <section className="splash-science" id="science">
        <div className="splash-container">
          <div className="splash-section-header">
            <span className="splash-section-tag">The Science</span>
            <h2 className="splash-section-title">The Science of Connection</h2>
            <p className="splash-section-subtitle">Our proprietary formula works on three distinct pathways to create a complete intimacy experience.</p>
          </div>
          <div className="splash-science-grid">
            <div className="splash-science-card">
              <div className="splash-science-card-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2"/>
                  <path d="M24 14v10l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="24" cy="24" r="3" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="splash-science-card-title">Physical Readiness</h3>
              <p className="splash-science-card-subtitle">Blood Flow & Sensitivity</p>
              <p className="splash-science-card-description">
                Enhanced circulation promotes natural physical responsiveness, ensuring both partners feel ready and present in the moment.
              </p>
              <div className="splash-science-card-line"></div>
            </div>
            <div className="splash-science-card featured">
              <div className="splash-science-card-badge">Core Pathway</div>
              <div className="splash-science-card-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M24 14c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="24" cy="24" r="4" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="splash-science-card-title">Neurological Desire</h3>
              <p className="splash-science-card-subtitle">Brain-Based Arousal</p>
              <p className="splash-science-card-description">
                Activates the brain&apos;s natural desire pathways, rekindling the mental spark and anticipation that makes intimacy exciting again.
              </p>
              <div className="splash-science-card-line"></div>
            </div>
            <div className="splash-science-card">
              <div className="splash-science-card-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4 4 12.954 4 24s8.954 20 20 20z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M17 24c0-3.866 3.134-7 7-7s7 3.134 7 7-3.134 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M24 17v-3M24 34v-3M31 24h3M14 24h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="splash-science-card-title">Emotional Bonding</h3>
              <p className="splash-science-card-subtitle">Connection & Attachment</p>
              <p className="splash-science-card-description">
                Deepens the emotional connection between partners, transforming physical intimacy into a profound bonding experience.
              </p>
              <div className="splash-science-card-line"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="splash-how-it-works" id="how-it-works">
        <div className="splash-container">
          <div className="splash-section-header">
            <span className="splash-section-tag">The Process</span>
            <h2 className="splash-section-title">How DuoDesire Works</h2>
            <p className="splash-section-subtitle">A simple, physician-guided journey to renewed intimacy.</p>
          </div>
          <div className="splash-steps-container">
            <div className="splash-steps-line"></div>
            <div className="splash-step">
              <div className="splash-step-number">01</div>
              <div className="splash-step-content">
                <div className="splash-step-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect x="4" y="4" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M10 16l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="splash-step-title">Take the Couples Chemistry Assessment</h3>
                <p className="splash-step-description">
                  Complete our comprehensive yet discreet medical intake together. We&apos;ll learn about your health history, relationship goals, and intimacy needs.
                </p>
              </div>
            </div>
            <div className="splash-step">
              <div className="splash-step-number">02</div>
              <div className="splash-step-content">
                <div className="splash-step-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="10" r="6" stroke="currentColor" strokeWidth="2"/>
                    <path d="M6 28c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M22 14l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="splash-step-title">Our Physicians Review & Approve</h3>
                <p className="splash-step-description">
                  A licensed physician carefully reviews your assessment, ensures safety, and customizes your DuoDesire formula for optimal results.
                </p>
              </div>
            </div>
            <div className="splash-step">
              <div className="splash-step-number">03</div>
              <div className="splash-step-content">
                <div className="splash-step-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect x="6" y="8" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M6 12h20M10 20h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="22" cy="20" r="2" fill="currentColor"/>
                  </svg>
                </div>
                <h3 className="splash-step-title">Your Custom Formula Ships Discreetly</h3>
                <p className="splash-step-description">
                  Your personalized DuoDesire formula is prepared at our U.S. licensed pharmacy and delivered in elegant, unmarked packaging right to your door.
                </p>
              </div>
            </div>
          </div>
          <div className="splash-how-cta">
            <Link href="/assessment" className="splash-btn splash-btn-primary">
              <span>Begin Your Assessment</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="splash-testimonials" id="stories">
        <div className="splash-container">
          <div className="splash-section-header">
            <span className="splash-section-tag">Real Stories</span>
            <h2 className="splash-section-title">Couples Rediscovering Connection</h2>
            <p className="splash-section-subtitle">Hear from partners who&apos;ve transformed their intimacy.</p>
          </div>
          <div className="splash-testimonials-grid">
            <div className="splash-testimonial-card">
              <div className="splash-testimonial-quote">&ldquo;</div>
              <p className="splash-testimonial-text">We feel like newlyweds again. After 15 years together, I didn&apos;t think it was possible to feel this excited about each other.</p>
              <div className="splash-testimonial-author">
                <div className="splash-author-avatar">S & M</div>
                <div className="splash-author-info">
                  <span className="splash-author-name">Sarah & Michael</span>
                  <span className="splash-author-detail">Together 15 years</span>
                </div>
              </div>
              <div className="splash-testimonial-stars">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
            </div>
            <div className="splash-testimonial-card featured">
              <div className="splash-testimonial-quote">&ldquo;</div>
              <p className="splash-testimonial-text">Our connection is deeper than it&apos;s ever been. DuoDesire helped us break through walls we didn&apos;t even know were there.</p>
              <div className="splash-testimonial-author">
                <div className="splash-author-avatar">J & R</div>
                <div className="splash-author-info">
                  <span className="splash-author-name">Jennifer & Robert</span>
                  <span className="splash-author-detail">Married 8 years</span>
                </div>
              </div>
              <div className="splash-testimonial-stars">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
            </div>
            <div className="splash-testimonial-card">
              <div className="splash-testimonial-quote">&ldquo;</div>
              <p className="splash-testimonial-text">It&apos;s not just about sex—it&apos;s about us. We communicate better, we&apos;re more affectionate, and our whole relationship has improved.</p>
              <div className="splash-testimonial-author">
                <div className="splash-author-avatar">D & L</div>
                <div className="splash-author-info">
                  <span className="splash-author-name">David & Lisa</span>
                  <span className="splash-author-detail">Partners 12 years</span>
                </div>
              </div>
              <div className="splash-testimonial-stars">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="splash-trust" id="trust">
        <div className="splash-container">
          <div className="splash-trust-grid">
            <div className="splash-trust-card">
              <div className="splash-trust-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M20 4L6 10v10c0 9.25 6.4 17.9 14 20 7.6-2.1 14-10.75 14-20V10L20 4z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M14 20l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h4 className="splash-trust-title">Physician Supervised</h4>
              <p className="splash-trust-description">Every prescription reviewed and approved by licensed physicians</p>
            </div>
            <div className="splash-trust-card">
              <div className="splash-trust-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect x="6" y="10" width="28" height="22" rx="3" stroke="currentColor" strokeWidth="2"/>
                  <path d="M6 16h28M12 24h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="28" cy="24" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h4 className="splash-trust-title">HIPAA Compliant</h4>
              <p className="splash-trust-description">Your health information protected with enterprise-grade security</p>
            </div>
            <div className="splash-trust-card">
              <div className="splash-trust-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect x="8" y="6" width="24" height="28" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M14 14h12M14 20h12M14 26h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h4 className="splash-trust-title">U.S. Licensed Pharmacy</h4>
              <p className="splash-trust-description">Compounded at state-licensed facilities with quality assurance</p>
            </div>
            <div className="splash-trust-card">
              <div className="splash-trust-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect x="6" y="12" width="28" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M6 18h28" stroke="currentColor" strokeWidth="2"/>
                  <path d="M20 8v4M14 10v2M26 10v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h4 className="splash-trust-title">Discreet Packaging</h4>
              <p className="splash-trust-description">Unmarked, elegant packaging with no indication of contents</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="splash-final-cta" id="assessment">
        <div className="splash-final-cta-bg">
          <div className="splash-cta-gradient"></div>
          <div className="splash-cta-pattern"></div>
        </div>
        <div className="splash-container">
          <div className="splash-final-cta-content">
            <span className="splash-section-tag light">Begin Your Journey</span>
            <h2 className="splash-final-cta-title">Ready to Rediscover Your Connection?</h2>
            <p className="splash-final-cta-subtitle">
              Take the first step toward deeper intimacy, renewed desire, and unforgettable moments together.
            </p>
            <Link href="/assessment" className="splash-btn splash-btn-primary splash-btn-large">
              <span>Begin Your DuoDesire Experience</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <div className="splash-final-cta-guarantee">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
              </svg>
              <span>Private. Secure. Physician-Guided.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="splash-footer">
        <div className="splash-container">
          <div className="splash-footer-content">
            <div className="splash-footer-brand">
              <Link href="/" className="splash-logo">
                <span className="splash-logo-duo">Duo</span>
                <span className="splash-logo-desire">Desire</span>
                <span className="splash-logo-tm">™</span>
              </Link>
              <p className="splash-footer-tagline">One formula. One connection.<br/>One unforgettable experience—together.</p>
            </div>
            <div className="splash-footer-links">
              <div className="splash-footer-column">
                <h5>Company</h5>
                <a href="#">About Us</a>
                <a href="#">Our Science</a>
                <a href="#">Physicians</a>
                <a href="#">Contact</a>
              </div>
              <div className="splash-footer-column">
                <h5>Support</h5>
                <a href="#">FAQ</a>
                <a href="#">Shipping</a>
                <a href="#">Returns</a>
                <a href="#">Help Center</a>
              </div>
              <div className="splash-footer-column">
                <h5>Legal</h5>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">HIPAA Notice</a>
                <a href="#">Telehealth Consent</a>
              </div>
            </div>
          </div>
          <div className="splash-footer-bottom">
            <p>&copy; 2024 DuoDesire™. All rights reserved.</p>
            <p className="splash-footer-disclaimer">DuoDesire™ products require a prescription and physician approval. Results may vary. This website does not provide medical advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
