import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import logoFull from '../assets/images/logo-full.png';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/members', label: 'Members' },
  { to: '/events', label: 'Events' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-sand-50/95 shadow-[0_1px_0_0_rgba(15,61,64,0.08)] backdrop-blur' : 'bg-transparent'
      }`}
    >
      <nav className="container-ktma flex items-center justify-between py-3">
        <NavLink to="/" className="flex items-center gap-3">
          <img src={logoFull} alt="KTMA logo" className="h-12 w-auto md:h-14" />
        </NavLink>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-teal-900 text-sand-50'
                    : 'text-ink-700 hover:bg-teal-900/8 hover:text-teal-900'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `ml-2 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                isActive
                  ? 'border-gold-500 bg-gold-500 text-teal-950 shadow-sm font-bold'
                  : 'border-teal-950/15 bg-white/80 text-teal-950 hover:border-gold-500 hover:bg-gold-500/15'
              }`
            }
          >
            <svg className="h-3 w-3 text-clay-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 016 0v2h2V7a5 5 0 00-5-5z"
                clipRule="evenodd"
              />
            </svg>
            <span>Admin</span>
          </NavLink>
        </div>

        <button
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-teal-900/15 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className={`h-0.5 w-5 bg-teal-900 transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`h-0.5 w-5 bg-teal-900 transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`h-0.5 w-5 bg-teal-900 transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </nav>

      {open && (
        <div className="border-t border-teal-900/10 bg-sand-50 md:hidden">
          <div className="container-ktma flex flex-col gap-1 py-3">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 text-sm font-semibold ${
                    isActive ? 'bg-teal-900 text-sand-50' : 'text-ink-700'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/admin"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `mt-2 flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'border-gold-500 bg-gold-500 text-teal-950 shadow-sm font-bold'
                    : 'border-teal-950/15 bg-white text-teal-950 hover:bg-sand-100'
                }`
              }
            >
              <svg className="h-3.5 w-3.5 text-clay-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 016 0v2h2V7a5 5 0 00-5-5z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Admin Login</span>
            </NavLink>
          </div>
        </div>
      )}
    </header>
  );
}
