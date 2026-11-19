import { useEffect, useState } from 'react'
import MollyLogo from './MollyLogo.jsx'
import { site } from '../data/site.js'

/** 顶部导航：Logo 在左，主导航在右，移动端折叠为下拉面板。 */
export default function Navbar({ dark, onToggleTheme }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('nav-open', open)
    return () => document.body.classList.remove('nav-open')
  }, [open])

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <div className="container navbar__inner">
        <div className="navbar__brand">
          <a className="navbar__brand-home" href="#home" onClick={() => setOpen(false)}>
            <MollyLogo dark={dark} width={132} />
            <span className="navbar__brand-text">Molly</span>
          </a>
          {site.brandLink && (
            <a
              className="navbar__brand-secret"
              href={site.brandLink.href}
              target="_blank"
              rel="noreferrer"
              aria-label={site.brandLink.label}
            >
              <span className="sr-only">{site.brandLink.label}</span>
            </a>
          )}
        </div>

        <nav className="navbar__links" aria-label="主导航">
          {site.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noreferrer' : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="navbar__theme"
          onClick={onToggleTheme}
          aria-label={dark ? '切换到浅色模式' : '切换到深色模式'}
        >
          {dark ? '☀️' : '🌙'}
        </button>

        <button
          type="button"
          className="navbar__toggle"
          aria-expanded={open}
          aria-label={open ? '关闭菜单' : '打开菜单'}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}
