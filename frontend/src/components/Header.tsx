import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getToken, logout } from '../services/auth'

type NavItem =
  | { label: string; to: string }
  | { label: string; href: string }

const navItems: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Listings', to: '/listings' },
  { label: 'Browse', href: '/#browse' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const navLinkClass = (active = false) =>
    `rounded-lg px-3 py-2 transition ${
      active
        ? 'bg-accent text-white dark:bg-darkAccent dark:text-darkSurface'
        : 'text-textHeading hover:bg-accentSoft hover:text-accent dark:text-darkText dark:hover:bg-darkAccentSoft dark:hover:text-darkAccent'
    }`

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-surface/95 shadow-sm backdrop-blur-md dark:border-darkBorder/80 dark:bg-darkSurface/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          aria-label="CampusReuse home"
          onClick={() => setOpen(false)}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accentSoft text-base font-bold text-accent dark:bg-darkAccentSoft dark:text-darkAccent">
            CR
          </div>
          <div>
            <p className="text-lg font-semibold text-textHeading dark:text-white">CampusReuse</p>
            <p className="hidden text-sm text-text dark:text-darkText sm:block">Campus sharing made simple</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-4" aria-label="Primary navigation">
          <ul className="flex items-center gap-2 text-sm font-medium">
            {navItems.map((item) => (
              <li key={item.label}>
                {'to' in item ? (
                  <Link
                    to={item.to}
                    className={navLinkClass(location.pathname === item.to)}
                    aria-current={location.pathname === item.to ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a href={item.href} className={navLinkClass()}>
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
          <div className="flex items-center">
            {getToken() ? (
              <button
                type="button"
                onClick={() => { logout(); window.location.reload(); }}
                className={navLinkClass()}
              >
                Logout
              </button>
            ) : (
              <Link to="/login" className={navLinkClass()}>
                Login
              </Link>
            )}
          </div>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-textHeading transition hover:bg-accentSoft hover:text-accent dark:text-darkText dark:hover:bg-darkAccentSoft dark:hover:text-darkAccent md:hidden"
          onClick={() => setOpen((current) => !current)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
      </div>

      {open && (
        <nav id="mobile-navigation" className="border-t border-border bg-surface px-4 py-3 dark:border-darkBorder dark:bg-darkSurface md:hidden" aria-label="Mobile navigation">
          <ul className="flex flex-col gap-2 text-sm font-medium">
            {navItems.map((item) => (
              <li key={item.label}>
                {'to' in item ? (
                  <Link
                    to={item.to}
                    className={`block ${navLinkClass(location.pathname === item.to)}`}
                    aria-current={location.pathname === item.to ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a href={item.href} className={`block ${navLinkClass()}`} onClick={() => setOpen(false)}>
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-3">
            {getToken() ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  window.location.reload();
                }}
                className={`w-full ${navLinkClass()}`}
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className={`block w-full ${navLinkClass()}`}
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
