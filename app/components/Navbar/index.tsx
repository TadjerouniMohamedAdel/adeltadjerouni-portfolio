/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';
import './styles.css';
import { Link, useLocation } from '@remix-run/react';
const Navbar: React.FC = () => {
  const location = useLocation();
  const [openDrawer, setOpenDrawer] = useState(false);
  return (
    <nav className={`${openDrawer ? 'open-drawer' : ''}`}>
      <div
        className={`backdrop ${openDrawer ? 'open' : 'closed'}`}
        onClick={() => setOpenDrawer(false)}
      >
        <div className="drawer" onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <h1>Adel Tadjerouni</h1>
            <button onClick={() => setOpenDrawer(false)}>
              <i className="bx bx-x" />
            </button>
          </div>
          <hr />
          <ul>
            <li className={location.pathname === '/' ? 'active' : ''}>
              <Link to="/">Home</Link>
            </li>
            <li
              className={
                location.pathname.includes('/projects') ? 'active' : ''
              }
            >
              <Link to="/projects">Projects</Link>
            </li>
            <li className={location.pathname === '/resume' ? 'active' : ''}>
              <Link to="/resume">Resume</Link>
            </li>
            <li className={location.pathname === '/about' ? 'active' : ''}>
              <Link to="/about">About me</Link>
            </li>
          </ul>
          <div className="links">
            <a
              rel="noreferrer"
              href="https://www.linkedin.com/in/adel-mohamed-tadjerouni"
              target="_blank"
            >
              <i className="bx bxl-linkedin" />
            </a>

            <a
              href="https://github.com/TadjerouniMohamedAdel"
              target="_blank"
              rel="noreferrer"
            >
              <i className="bx bxl-github" />
            </a>
            <a
              href="https://join.skype.com/invite/afq6nmhgxMgr"
              target="_blank"
              rel="noreferrer"
            >
              <i className="bx bxl-skype" />
            </a>
          </div>
          <span>v1.0.0</span>
        </div>
      </div>
      <h1>Adel Tedjerouni</h1>
      <ul>
        <li className={location.pathname === '/' ? 'active' : ''}>
          <Link to="/">Home</Link>
        </li>
        <li className={location.pathname.includes('/projects') ? 'active' : ''}>
          <Link to="/projects">Projects</Link>
        </li>
        <li className={location.pathname === '/resume' ? 'active' : ''}>
          <Link to="/resume">Resume</Link>
        </li>
        <li className={location.pathname === '/about' ? 'active' : ''}>
          <Link to="/about">About me</Link>
        </li>
      </ul>
      <button onClick={() => setOpenDrawer(true)}>
        <i className="bx bx-menu" />
      </button>
      <div />
    </nav>
  );
};

export default Navbar;
