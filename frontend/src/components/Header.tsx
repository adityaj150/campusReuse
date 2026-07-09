import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getToken, logout } from '../services/auth'
import { useTheme } from '../contexts/ThemeContext'
import { motion } from 'motion/react'

type NavItem =
  | { label: string; to: string }
  | { label: string; href: string }

const navItems: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Listings', to: '/listings' },
  { label: 'Liked Items', to: '/liked' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Ride Share', to: '/rideshare' },
  { label: 'About', to: '/about' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const mobileNavLinkClass = (active = false) =>
    `rounded-lg px-3 py-2 transition ${active
      ? 'bg-accent text-white dark:bg-darkAccent dark:text-darkSurface'
      : 'text-textHeading hover:bg-accentSoft hover:text-accent dark:text-darkText dark:hover:bg-darkAccentSoft dark:hover:text-darkAccent'
    }`

  const desktopNavLinkClass = (active = false) =>
    `relative z-10 block rounded-lg px-3 py-2 transition-colors ${active
      ? 'text-accent dark:text-darkAccent font-semibold'
      : 'text-textHeading dark:text-darkText hover:text-accent dark:hover:text-white'
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
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-accentSoft text-base font-bold text-accent dark:bg-darkAccentSoft dark:text-darkAccent">
            <img
              src={theme === 'dark' ? "/logo.png" : "/logo_light.png"}
              alt="CampusReuse Logo"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-lg font-semibold text-textHeading dark:text-white">CampusReuse</p>
            <p className="hidden text-sm text-text dark:text-darkText sm:block">sharing made simple</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-4" aria-label="Primary navigation">
          <ul className="flex items-center gap-2 text-sm font-medium" onMouseLeave={() => setHoveredIndex(null)}>
            {navItems.map((item, index) => (
              <li
                key={item.label}
                className="relative"
                onMouseEnter={() => setHoveredIndex(index)}
              >
                {hoveredIndex === index && (
                  <motion.div
                    layoutId="nav-hover-pill"
                    className="absolute inset-0 -z-10 rounded-lg bg-accent/10 dark:bg-darkAccent/20"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                {'to' in item ? (
                  <Link
                    to={item.to}
                    className={desktopNavLinkClass(location.pathname === item.to)}
                    aria-current={location.pathname === item.to ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a href={item.href} className={desktopNavLinkClass()}>
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-textHeading hover:bg-accentSoft hover:text-accent dark:text-darkText dark:hover:bg-darkAccentSoft dark:hover:text-darkAccent"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'light' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              )}
            </button>
            {getToken() ? (
              <button
                type="button"
                onClick={() => { logout(); window.location.reload(); }}
                className={desktopNavLinkClass()}
              >
                Logout
              </button>
            ) : (
              <Link to="/login" className={desktopNavLinkClass()}>
                Login
              </Link>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          {getToken() ? (
            <button
              type="button"
              onClick={() => { logout(); window.location.reload(); }}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-textHeading transition-all hover:bg-accentSoft hover:text-accent active:scale-95 dark:text-darkText dark:hover:bg-darkAccentSoft dark:hover:text-darkAccent"
            >
              Logout
            </button>
          ) : (
            <Link 
              to="/login" 
              className="rounded-lg px-3 py-2 text-sm font-semibold text-accent transition-all hover:bg-accentSoft active:scale-95 dark:text-darkAccent dark:hover:bg-darkAccentSoft"
            >
              Login
            </Link>
          )}

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-textHeading transition hover:bg-accentSoft hover:text-accent dark:text-darkText dark:hover:bg-darkAccentSoft dark:hover:text-darkAccent"
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
      </div>

      {open && (
        <nav id="mobile-navigation" className="border-t border-border bg-surface px-4 py-3 dark:border-darkBorder dark:bg-darkSurface md:hidden" aria-label="Mobile navigation">
          <ul className="flex flex-col gap-2 text-sm font-medium">
            {navItems.map((item) => (
              <li key={item.label}>
                {'to' in item ? (
                  <Link
                    to={item.to}
                    className={`block ${mobileNavLinkClass(location.pathname === item.to)}`}
                    aria-current={location.pathname === item.to ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a href={item.href} className={`block ${mobileNavLinkClass()}`} onClick={() => setOpen(false)}>
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-3">
            <button
              onClick={toggleTheme}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-textHeading hover:bg-accentSoft hover:text-accent dark:text-darkText dark:hover:bg-darkAccentSoft dark:hover:text-darkAccent"
            >
              {theme === 'light' ? (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                  </svg>
                  Switch to Dark Mode
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                  Switch to Light Mode
                </>
              )}
            </button>
          </div>
        </nav>
      )}
    </header>
  )
}
