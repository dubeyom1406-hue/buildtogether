import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Landing() {
  const navigate = useNavigate()
  const { currentUser } = useApp()

  const handleNavigation = (path) => {
    if (currentUser) {
      navigate(path)
    } else {
      navigate('/login')
    }
  }

  // Preload fonts
  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    return () => {
      document.head.removeChild(link)
    }
  }, [])

  const featuredPitches = []

  return (
    <div className="landing-root-wrapper">
      <style>{`
        /* =============================================
           RESET & BASE
           ============================================= */
        .landing-root-wrapper {
          --orange: #FF6600;
          --orange-light: #FF8533;
          --orange-pale: #FFF3EB;
          --orange-dim: #CC5200;
          --dark: #111111;
          --text: #1A1A1A;
          --muted: #6B7280;
          --border: #E5E7EB;
          --bg: #FFFFFF;
          --bg2: #F8F8F8;
          --success: #22C55E;
          --radius: 12px;
          --radius-md: 8px;
          --radius-xl: 20px;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
          --shadow-md: 0 4px 16px rgba(0,0,0,0.08);
          --shadow-lg: 0 12px 32px rgba(0,0,0,0.1);
          
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
          background: var(--bg);
          overflow-x: hidden;
          font-size: 15px;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          width: 100%;
          min-height: 100vh;
        }

        .landing-root-wrapper h1, 
        .landing-root-wrapper h2, 
        .landing-root-wrapper h3, 
        .landing-root-wrapper h4, 
        .landing-root-wrapper h5, 
        .landing-root-wrapper .brand { 
          font-family: 'Syne', sans-serif; 
        }

        /* =============================================
           NAVIGATION
           ============================================= */
        .landing-root-wrapper nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
          padding: 0 2rem;
        }

        .landing-root-wrapper .nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
          gap: 2rem;
        }

        .landing-root-wrapper .brand {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--dark);
          letter-spacing: -0.5px;
          cursor: pointer;
          flex-shrink: 0;
        }
        .landing-root-wrapper .brand span { color: var(--orange); }

        .landing-root-wrapper .nav-links {
          display: flex;
          gap: 0.25rem;
          list-style: none;
          flex: 1;
          justify-content: center;
        }

        .landing-root-wrapper .nav-links a {
          display: inline-block;
          padding: 6px 14px;
          border-radius: var(--radius-md);
          color: var(--muted);
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          cursor: pointer;
        }

        .landing-root-wrapper .nav-links a:hover { color: var(--dark); background: var(--bg2); }
        .landing-root-wrapper .nav-links a.active { color: var(--dark); background: var(--bg2); font-weight: 600; }

        .landing-root-wrapper .nav-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }

        /* =============================================
           BUTTONS
           ============================================= */
        .landing-root-wrapper .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 20px;
          border-radius: var(--radius-md);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: 1.5px solid transparent;
          white-space: nowrap;
        }

        .landing-root-wrapper .btn:active { transform: scale(0.98); }

        .landing-root-wrapper .btn-ghost {
          background: transparent;
          border-color: var(--border);
          color: var(--text);
        }
        .landing-root-wrapper .btn-ghost:hover { border-color: var(--orange); color: var(--orange); background: var(--orange-pale); }

        .landing-root-wrapper .btn-primary {
          background: var(--orange);
          color: #fff;
          border-color: var(--orange);
        }
        .landing-root-wrapper .btn-primary:hover { background: var(--orange-dim); border-color: var(--orange-dim); }

        .landing-root-wrapper .btn-outline {
          background: transparent;
          border-color: var(--dark);
          color: var(--dark);
        }
        .landing-root-wrapper .btn-outline:hover { background: var(--dark); color: #fff; }

        .landing-root-wrapper .btn-sm { padding: 6px 14px; font-size: 13px; }
        .landing-root-wrapper .btn-lg { padding: 13px 30px; font-size: 15px; border-radius: var(--radius); }
        .landing-root-wrapper .btn-xl { padding: 15px 36px; font-size: 16px; border-radius: var(--radius); }

        /* =============================================
           CATEGORY BADGES
           ============================================= */
        .landing-root-wrapper .cat-badge {
          display: inline-block;
          padding: 4px 11px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2px;
          width: fit-content;
        }
        .landing-root-wrapper .cat-startup   { background: #FFF3EB; color: #CC5200; }
        .landing-root-wrapper .cat-hackathon { background: #EEF2FF; color: #4338CA; }
        .landing-root-wrapper .cat-research  { background: #F0FDF4; color: #15803D; }
        .landing-root-wrapper .cat-opensource{ background: #FDF4FF; color: #7E22CE; }

        /* =============================================
           SKILL TAGS
           ============================================= */
        .landing-root-wrapper .skill-tag {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 3px 10px;
          font-size: 11px;
          color: var(--muted);
          font-weight: 500;
        }

        .landing-root-wrapper .skills-row {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        /* =============================================
           IDEA CARD
           ============================================= */
        .landing-root-wrapper .idea-card {
          background: var(--bg);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.25s;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .landing-root-wrapper .idea-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--orange);
          transform: scaleX(0);
          transition: transform 0.3s;
          transform-origin: left;
        }

        .landing-root-wrapper .idea-card:hover {
          border-color: rgba(255,102,0,0.35);
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(255,102,0,0.1);
        }

        .landing-root-wrapper .idea-card:hover::before { transform: scaleX(1); }

        .landing-root-wrapper .idea-card h3 {
          font-size: 1rem;
          font-weight: 700;
          color: var(--dark);
          margin: 10px 0 8px;
          line-height: 1.4;
          flex: 1;
        }

        .landing-root-wrapper .idea-card p {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.65;
          margin-bottom: 1rem;
        }

        .landing-root-wrapper .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
          margin-top: auto;
        }

        .landing-root-wrapper .creator-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .landing-root-wrapper .mini-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
          font-family: 'Syne', sans-serif;
        }

        .landing-root-wrapper .creator-name { font-size: 12px; font-weight: 500; color: var(--muted); }
        .landing-root-wrapper .posted-date  { font-size: 11px; color: var(--muted); }

        /* =============================================
           SECTION BASE
           ============================================= */
        .landing-root-wrapper .section { padding: 5rem 2rem; }

        .landing-root-wrapper .section-inner { max-width: 1200px; margin: 0 auto; }

        .landing-root-wrapper .section-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          color: var(--orange);
          text-transform: uppercase;
          margin-bottom: 1rem;
        }

        .landing-root-wrapper .section h2 {
          font-size: clamp(1.8rem, 3vw, 2.8rem);
          font-weight: 800;
          letter-spacing: -1px;
          color: var(--dark);
          margin-bottom: 0.75rem;
          line-height: 1.15;
        }

        .landing-root-wrapper .section-sub {
          font-size: 1rem;
          color: var(--muted);
          max-width: 480px;
          line-height: 1.7;
          font-weight: 300;
          margin-bottom: 2rem;
        }

        .landing-root-wrapper .bg2 { background: var(--bg2); }

        /* =============================================
           GRID HELPERS
           ============================================= */
        .landing-root-wrapper .ideas-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-top: 2.5rem;
        }

        /* =============================================
           HOME — HERO
           ============================================= */
        .landing-root-wrapper .hero {
          background: var(--bg);
          padding: 6rem 2rem 5rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .landing-root-wrapper .hero::before {
          content: '';
          position: absolute;
          top: -300px; left: 50%;
          transform: translateX(-50%);
          width: 900px; height: 900px;
          background: radial-gradient(circle, rgba(255,102,0,0.07) 0%, transparent 70%);
          pointer-events: none;
        }

        .landing-root-wrapper .hero::after {
          content: '';
          position: absolute;
          bottom: -100px; right: -100px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(255,102,0,0.04) 0%, transparent 70%);
          pointer-events: none;
        }

        .landing-root-wrapper .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--orange-pale);
          color: var(--orange-dim);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.4px;
          padding: 5px 16px;
          border-radius: 20px;
          margin: 0 auto 1.75rem;
          border: 1px solid rgba(255,102,0,0.2);
          width: fit-content;
        }

        .landing-root-wrapper .hero h1 {
          font-size: clamp(3rem, 5.5vw, 5rem);
          font-weight: 800;
          line-height: 1.06;
          letter-spacing: -2.5px;
          color: var(--dark);
          max-width: 820px;
          margin: 0 auto 1.5rem;
        }

        .landing-root-wrapper .hero h1 em {
          color: var(--orange);
          font-style: normal;
          position: relative;
        }

        .landing-root-wrapper .hero > p {
          font-size: 1.125rem;
          color: var(--muted);
          max-width: 500px;
          margin: 0 auto 2.75rem;
          line-height: 1.75;
          font-weight: 300;
        }

        .landing-root-wrapper .hero-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 4rem;
        }

        /* Collab illustration */
        .landing-root-wrapper .hero-collab {
          max-width: 720px;
          margin: 0 auto;
        }

        .landing-root-wrapper .collab-card {
          background: var(--bg);
          border: 1.5px solid var(--border);
          border-radius: 24px;
          padding: 2.25rem 2rem;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 1.25rem;
          align-items: center;
          box-shadow: var(--shadow-md);
        }

        .landing-root-wrapper .collab-node {
          background: var(--bg2);
          border-radius: var(--radius);
          padding: 1.25rem 1rem;
          text-align: center;
          border: 1px solid var(--border);
        }

        .landing-root-wrapper .collab-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 17px;
          color: #fff;
          margin: 0 auto 10px;
        }

        .landing-root-wrapper .collab-node h4 { font-size: 13px; font-weight: 700; color: var(--dark); margin-bottom: 2px; }
        .landing-root-wrapper .collab-node p  { font-size: 11px; color: var(--muted); }

        .landing-root-wrapper .collab-connector {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .landing-root-wrapper .collab-center {
          background: var(--orange-pale);
          border: 2px solid var(--orange);
          border-radius: var(--radius);
          padding: 1.25rem 1.5rem;
          text-align: center;
          min-width: 140px;
        }

        .landing-root-wrapper .collab-icon {
          width: 44px;
          height: 44px;
          background: var(--orange);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          margin: 0 auto 10px;
        }

        .landing-root-wrapper .collab-center .c-brand {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 14px;
          color: var(--orange-dim);
        }

        .landing-root-wrapper .collab-center .c-sub { font-size: 11px; color: var(--orange); margin-top: 3px; }

        .landing-root-wrapper .arrow-sym { font-size: 1.5rem; color: var(--orange); line-height: 1; }

        /* =============================================
           HOME — HOW IT WORKS
           ============================================= */
        .landing-root-wrapper .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-top: 3rem;
        }

        .landing-root-wrapper .step-card {
          padding: 2.25rem 2rem;
          background: var(--bg);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-xl);
          transition: all 0.25s;
          position: relative;
          text-align: left;
        }

        .landing-root-wrapper .step-card:hover { border-color: var(--orange); transform: translateY(-4px); box-shadow: var(--shadow-md); }

        .landing-root-wrapper .step-num {
          font-family: 'Syne', sans-serif;
          font-size: 4rem;
          font-weight: 800;
          color: var(--orange-pale);
          line-height: 1;
          margin-bottom: 1.25rem;
        }

        .landing-root-wrapper .step-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          margin-bottom: 1rem;
        }

        .landing-root-wrapper .step-card h3 { font-size: 1.125rem; font-weight: 700; color: var(--dark); margin-bottom: 0.6rem; }
        .landing-root-wrapper .step-card p  { font-size: 14px; color: var(--muted); line-height: 1.7; }

        /* =============================================
           HOME — STATS
           ============================================= */
        .landing-root-wrapper .stats-section {
          padding: 5rem 2rem;
          background: var(--dark);
          position: relative;
          overflow: hidden;
        }

        .landing-root-wrapper .stats-section::before {
          content: '';
          position: absolute;
          top: -200px; left: -200px;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(255,102,0,0.12) 0%, transparent 70%);
        }

        .landing-root-wrapper .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .landing-root-wrapper .stat-item h3 {
          font-family: 'Syne', sans-serif;
          font-size: 3rem;
          font-weight: 800;
          color: var(--orange);
          line-height: 1;
          margin-bottom: 8px;
        }

        .landing-root-wrapper .stat-item p { font-size: 13px; color: rgba(255,255,255,0.55); font-weight: 300; }

        /* =============================================
           HOME — TESTIMONIALS
           ============================================= */
        .landing-root-wrapper .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-top: 3rem;
        }

        .landing-root-wrapper .testimonial-card {
          background: var(--bg);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 2rem;
          transition: all 0.2s;
          text-align: left;
        }

        .landing-root-wrapper .testimonial-card:hover { border-color: rgba(255,102,0,0.3); box-shadow: var(--shadow-md); }

        .landing-root-wrapper .stars { color: var(--orange); font-size: 14px; margin-bottom: 1rem; letter-spacing: 2px; }

        .landing-root-wrapper .testimonial-card > p {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.75;
          margin-bottom: 1.5rem;
          font-weight: 300;
          font-style: italic;
        }

        .landing-root-wrapper .t-author { display: flex; align-items: center; gap: 10px; }
        .landing-root-wrapper .t-author-info h4 { font-size: 13px; font-weight: 600; color: var(--dark); }
        .landing-root-wrapper .t-author-info p  { font-size: 12px; color: var(--muted); }

        /* =============================================
           CTA BANNER
           ============================================= */
        .landing-root-wrapper .cta-section {
          padding: 5rem 2rem;
          background: var(--orange);
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .landing-root-wrapper .cta-section::before {
          content: '';
          position: absolute;
          top: -100px; right: -100px;
          width: 400px; height: 400px;
          background: rgba(255,255,255,0.07);
          border-radius: 50%;
        }

        .landing-root-wrapper .cta-section h2 {
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 800;
          color: #fff;
          letter-spacing: -1px;
          margin-bottom: 1rem;
          position: relative;
        }

        .landing-root-wrapper .cta-section p {
          font-size: 1rem;
          color: rgba(255,255,255,0.8);
          margin-bottom: 2.5rem;
          font-weight: 300;
          position: relative;
        }

        .landing-root-wrapper .cta-section .btn-cta {
          background: #fff;
          color: var(--orange);
          border: none;
          font-weight: 700;
          position: relative;
        }

        .landing-root-wrapper .cta-section .btn-cta:hover { background: var(--orange-pale); }

        /* =============================================
           FOOTER
           ============================================= */
        .landing-root-wrapper footer {
          background: var(--dark);
          color: rgba(255,255,255,0.65);
          padding: 4rem 2rem 2rem;
          text-align: left;
        }

        .landing-root-wrapper .footer-inner { max-width: 1200px; margin: 0 auto; }

        .landing-root-wrapper .footer-top {
          display: grid;
          grid-template-columns: 2.5fr 1fr 1fr 1fr;
          gap: 3rem;
          margin-bottom: 3rem;
          padding-bottom: 3rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .landing-root-wrapper .footer-brand .brand { color: #fff; font-size: 1.4rem; display: block; margin-bottom: 0.9rem; }

        .landing-root-wrapper .footer-brand p {
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          line-height: 1.7;
          max-width: 260px;
          margin-bottom: 1.5rem;
          font-weight: 300;
        }

        .landing-root-wrapper .footer-social { display: flex; gap: 8px; }

        .landing-root-wrapper .social-btn {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          border: 1px solid rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          color: rgba(255,255,255,0.5);
        }

        .landing-root-wrapper .social-btn:hover { border-color: var(--orange); color: var(--orange); }

        .landing-root-wrapper .footer-col h4 {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 1.25rem;
          letter-spacing: 0.3px;
        }

        .landing-root-wrapper .footer-col a {
          display: block;
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          margin-bottom: 10px;
          cursor: pointer;
          transition: color 0.2s;
          font-weight: 300;
        }

        .landing-root-wrapper .footer-col a:hover { color: var(--orange); }

        .landing-root-wrapper .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .landing-root-wrapper .footer-bottom p { font-size: 12px; color: rgba(255,255,255,0.3); }

        /* =============================================
           RESPONSIVE — TABLET
           ============================================= */
        @media (max-width: 960px) {
          .landing-root-wrapper .nav-links { display: none; }
          .landing-root-wrapper .ideas-grid { grid-template-columns: repeat(2, 1fr); }
          .landing-root-wrapper .steps-grid { grid-template-columns: 1fr; gap: 1rem; }
          .landing-root-wrapper .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 2rem; }
          .landing-root-wrapper .testimonials-grid { grid-template-columns: 1fr; }
          .landing-root-wrapper .footer-top { grid-template-columns: 1fr 1fr; }
          .landing-root-wrapper .collab-card { padding: 1.5rem 1rem; }
        }

        /* =============================================
           RESPONSIVE — MOBILE
           ============================================= */
        @media (max-width: 600px) {
          .landing-root-wrapper nav { padding: 0 1rem; }
          .landing-root-wrapper .brand { font-size: 1.1rem; }
          .landing-root-wrapper .nav-actions .btn-ghost { display: none; }

          .landing-root-wrapper .hero { padding: 4rem 1rem 3rem; }
          .landing-root-wrapper .hero h1 { font-size: 2.4rem; letter-spacing: -1.5px; }

          .landing-root-wrapper .ideas-grid { grid-template-columns: 1fr; }

          .landing-root-wrapper .section { padding: 3.5rem 1rem; }
          .landing-root-wrapper .hero-actions .btn-lg { padding: 12px 20px; font-size: 14px; }

          .landing-root-wrapper .collab-card { grid-template-columns: 1fr; gap: 0.75rem; }
          .landing-root-wrapper .arrow-sym { transform: rotate(90deg); }

          .landing-root-wrapper .stats-grid { grid-template-columns: 1fr 1fr; }
          .landing-root-wrapper .stat-item h3 { font-size: 2.2rem; }

          .landing-root-wrapper .footer-top { grid-template-columns: 1fr; gap: 2rem; }
          .landing-root-wrapper .footer-bottom { flex-direction: column; text-align: center; }
        }
      `}</style>

      {/* NAVIGATION */}
      <nav>
        <div className="nav-inner">
          <div className="brand" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo_icon.png" alt="Built 2gether Logo" style={{ height: '32px', objectFit: 'contain' }} />
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0E1C33', fontFamily: 'Syne, sans-serif' }}>
              BUILT <span style={{ color: '#F18D58' }}>2</span>GETHER
            </span>
          </div>
          <ul className="nav-links">
            <li><a className="active" onClick={() => navigate('/')}>Home</a></li>
            <li><a onClick={() => handleNavigation('/dashboard')}>Explore Ideas</a></li>
            <li><a onClick={() => handleNavigation('/dashboard')}>Post Idea</a></li>
            <li><a onClick={() => handleNavigation('/profile')}>Profile</a></li>
          </ul>
          <div className="nav-actions">
            <button className="btn btn-ghost" onClick={() => navigate('/login')}>Log In</button>
            <button className="btn btn-primary" onClick={() => navigate('/login')}>Get Started →</button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-badge">✦ Open to builders worldwide</div>
        <h1>Turn <em>Ideas</em> Into<br />Real Projects</h1>
        <p>Share your ideas, discover talented teammates, and build amazing projects together.</p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-xl" onClick={() => handleNavigation('/dashboard')}>
            Explore Ideas →
          </button>
          <button className="btn btn-outline btn-xl" onClick={() => handleNavigation('/dashboard')}>
            Post an Idea
          </button>
        </div>
        <div className="hero-collab">
          <div className="collab-card">
            <div className="collab-node">
              <div className="collab-avatar" style={{ background: '#FF6600' }}>AR</div>
              <h4>Arjun R.</h4>
              <p>Full-Stack Dev</p>
            </div>
            <div className="collab-connector">
              <span className="arrow-sym">⟶</span>
              <div className="collab-center">
                <div className="collab-icon">🚀</div>
                <div className="c-brand">BuildTogether</div>
                <div className="c-sub">Connecting builders</div>
              </div>
              <span className="arrow-sym">⟶</span>
            </div>
            <div className="collab-node">
              <div className="collab-avatar" style={{ background: '#4338CA' }}>PS</div>
              <h4>Priya S.</h4>
              <p>UI/UX Designer</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="section-inner">
          <div className="section-label">How It Works</div>
          <h2>Three steps to your dream team</h2>
          <p className="section-sub">From idea to execution — find the right people to build with you.</p>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-num">01</div>
              <div className="step-icon" style={{ background: '#FFF3EB' }}>💡</div>
              <h3>Post an Idea</h3>
              <p>Share your vision with the world. Describe the problem, your solution, and what kind of builders you need.</p>
            </div>
            <div className="step-card">
              <div className="step-num">02</div>
              <div className="step-icon" style={{ background: '#EEF2FF' }}>🔍</div>
              <h3>Discover Builders</h3>
              <p>Browse a diverse community of developers, designers, researchers, and founders ready to collaborate.</p>
            </div>
            <div className="step-card">
              <div className="step-num">03</div>
              <div className="step-icon" style={{ background: '#F0FDF4' }}>🤝</div>
              <h3>Build Together</h3>
              <p>Connect, align on goals, and start building. From hackathon wins to funded startups — it starts here.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED IDEAS */}
      <section className="section bg2">
        <div className="section-inner">
          <div className="section-label">Featured Ideas</div>
          <h2>Trending this week</h2>
          <p className="section-sub">Discover ideas across startups, hackathons, research and open source.</p>
          
          <div className="ideas-grid">
            {featuredPitches.map((idea) => (
              <div 
                key={idea.id} 
                className="idea-card"
                onClick={() => handleNavigation('/dashboard')}
              >
                <span className={`cat-badge cat-${idea.category}`}>
                  {idea.categoryLabel}
                </span>
                <h3>{idea.title}</h3>
                <p>{idea.description}</p>
                <div className="skills-row" style={{ marginBottom: '1.25rem' }}>
                  {idea.skills.map((s, idx) => (
                    <span key={idx} className="skill-tag">{s}</span>
                  ))}
                </div>
                <div className="card-footer">
                  <div className="creator-row">
                    <div className="mini-avatar" style={{ background: idea.avatarBg }}>
                      {idea.avatar}
                    </div>
                    <span className="creator-name">{idea.founder}</span>
                  </div>
                  <span className="posted-date">{idea.date}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button className="btn btn-ghost btn-lg" onClick={() => handleNavigation('/dashboard')}>
              View All Ideas →
            </button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <h3>2,400+</h3>
            <p>Ideas Shared</p>
          </div>
          <div className="stat-item">
            <h3>890+</h3>
            <p>Projects Built</p>
          </div>
          <div className="stat-item">
            <h3>340+</h3>
            <p>Teams Formed</p>
          </div>
          <div className="stat-item">
            <h3>6,200+</h3>
            <p>Students Connected</p>
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <section className="section">
        <div className="section-inner">
          <div className="section-label">Testimonials</div>
          <h2>Builders love it</h2>
          <p className="section-sub">Real stories from real builders who found their dream teams.</p>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p>"I had an idea for an AI tutoring app but no technical co-founder. Found my dream team on BuildTogether in just 3 days. We won our college hackathon!"</p>
              <div className="t-author">
                <div className="mini-avatar" style={{ background: '#FF6600', width: '40px', height: '40px', fontSize: '13px' }}>RK</div>
                <div className="t-author-info">
                  <h4>Rahul K.</h4>
                  <p>Startup Founder, IIT Delhi</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p>"As a designer looking for meaningful projects, BuildTogether was exactly what I needed. Connected with an amazing startup team and learned so much."</p>
              <div className="t-author">
                <div className="mini-avatar" style={{ background: '#4338CA', width: '40px', height: '40px', fontSize: '13px' }}>SM</div>
                <div className="t-author-info">
                  <h4>Sara M.</h4>
                  <p>UI/UX Designer, NID Ahmedabad</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p>"Our research on affordable healthcare needed engineers who cared. BuildTogether helped us find exactly the right people. Our paper got accepted at NeurIPS!"</p>
              <div className="t-author">
                <div className="mini-avatar" style={{ background: '#15803D', width: '40px', height: '40px', fontSize: '13px' }}>AP</div>
                <div className="t-author-info">
                  <h4>Anika P.</h4>
                  <p>Researcher, AIIMS Delhi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-section">
        <h2>Ready to build something great?</h2>
        <p>Join thousands of student builders already on the platform.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
          <button className="btn btn-cta btn-xl" onClick={() => handleNavigation('/dashboard')}>
            Post Your Idea →
          </button>
          <button 
            className="btn btn-xl" 
            style={{ background: 'transparent', border: '2px solid rgba(255,255,255,0.5)', color: '#fff' }} 
            onClick={() => handleNavigation('/dashboard')}
          >
            Explore Ideas
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <img src="/logo_icon.png" alt="Built 2gether Logo" style={{ height: '32px', objectFit: 'contain' }} />
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0E1C33', fontFamily: 'Syne, sans-serif' }}>
                  BUILT <span style={{ color: '#F18D58' }}>2</span>GETHER
                </span>
              </div>
              <p>Find ideas. Find teammates. Build together. The platform for student builders worldwide.</p>
              <div className="footer-social">
                <div className="social-btn" title="Twitter">𝕏</div>
                <div className="social-btn" title="LinkedIn">in</div>
                <div className="social-btn" title="GitHub">⌥</div>
                <div className="social-btn" title="Discord">◎</div>
              </div>
            </div>
            <div className="footer-col">
              <h4>Platform</h4>
              <a onClick={() => handleNavigation('/dashboard')}>Explore Ideas</a>
              <a onClick={() => handleNavigation('/dashboard')}>Post an Idea</a>
              <a onClick={() => handleNavigation('/profile')}>My Profile</a>
              <a>Leaderboard</a>
            </div>
            <div className="footer-col">
              <h4>Community</h4>
              <a>Hackathons</a>
              <a>Startups</a>
              <a>Research</a>
              <a>Open Source</a>
              <a>Events</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a>About Us</a>
              <a>Careers</a>
              <a>Blog</a>
              <a>Contact</a>
              <a>Privacy Policy</a>
              <a>Terms of Service</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Built 2gether. All rights reserved.</p>
            <p>Made with ❤️ for student builders everywhere</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
