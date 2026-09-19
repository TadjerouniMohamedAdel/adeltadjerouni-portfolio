import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './styles.css';
import { Link, useLocation } from '@remix-run/react';
import { site } from '~/content';

const ThemeToggle: React.FC = () => {
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.classList.contains('light'));
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains('light');
    document.documentElement.classList.toggle('light', next);
    setLight(next);
    try {
      localStorage.setItem('theme', next ? 'light' : 'dark');
    } catch {
      setLight(next);
    }
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={light ? 'Switch to dark theme' : 'Switch to light theme'}
    >
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" stroke="none" />
      </svg>
    </button>
  );
};

const links = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/resume', label: 'Resume' },
  { to: '/about', label: 'About' },
];

const Navbar: React.FC = () => {
  const location = useLocation();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpenDrawer(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!openDrawer) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenDrawer(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openDrawer]);

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  const drawer = (
    <div className={`drawer-backdrop ${openDrawer ? 'open' : ''}`}>
      <button
        type="button"
        className="drawer-scrim"
        aria-label="Close menu"
        tabIndex={openDrawer ? 0 : -1}
        onClick={() => setOpenDrawer(false)}
      />
      <div className="drawer" role="dialog" aria-modal="true" aria-label="Menu">
        <div className="drawer__header">
          <span className="brand__name">Adel Tadjerouni</span>
          <button
            type="button"
            className="drawer__close"
            aria-label="Close menu"
            onClick={() => setOpenDrawer(false)}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
          </button>
        </div>
        <nav className="drawer__links">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              aria-current={isActive(link.to) ? 'page' : undefined}
              className={`drawer__link ${isActive(link.to) ? 'is-active' : ''}`}
              onClick={() => setOpenDrawer(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <a href={`mailto:${site.email}`} className="btn-ghost drawer__cta">
          Get in touch
        </a>
        <div className="drawer__social">
          <a href={`mailto:${site.email}`} aria-label="Email">
            <i className="bx bxl-gmail" />
          </a>
          <a
            href="https://www.linkedin.com/in/adel-mohamed-tadjerouni"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
          >
            <i className="bx bxl-linkedin" />
          </a>
          <a
            href="https://github.com/TadjerouniMohamedAdel"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <i className="bx bxl-github" />
          </a>
          <a
            href="https://twitter.com/TadjerouniAdel"
            target="_blank"
            rel="noreferrer"
            aria-label="Twitter"
          >
            <i className="bx bxl-twitter" />
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <header className="site-header">
      <div className="track site-header__inner">
        <Link to="/" className="brand">
          <span className="brand__mark">A</span>
          <span className="brand__name">Adel Tadjerouni</span>
        </Link>
        <div className="site-header__actions">
          <nav className="nav-links">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                aria-current={isActive(link.to) ? 'page' : undefined}
                className={`nav-link ${isActive(link.to) ? 'is-active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
            <a href={`mailto:${site.email}`} className="nav-cta">
              Get in touch
            </a>
          </nav>
          <ThemeToggle />
          <button
            type="button"
            className="nav-burger"
            aria-label="Open menu"
            onClick={() => setOpenDrawer(true)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </svg>
          </button>
        </div>
      </div>
      {mounted && createPortal(drawer, document.body)}
    </header>
  );
};

export default Navbar;
