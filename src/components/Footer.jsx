import { site } from '../data/site.js'
import logoLight from '../assets/molly-logo-light.svg'

/** 页脚：品牌标识 + 社交入口 + 版权（深色底，始终使用白色字版 Logo） */
export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container footer__inner">
        <div className="footer__brand">
          <img className="molly-logo" src={logoLight} alt="Molly" width={148} decoding="async" />
          <p className="footer__tagline">{site.footer.tagline}</p>
        </div>

        <nav className="footer__links" aria-label="社交链接">
          {site.footer.socials.map((social) => (
            <a key={social.label} href={social.href}>
              {social.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="container footer__bottom">
        <span>{site.footer.copyright}</span>
        <span className="footer__dot" aria-hidden="true">·</span>
        <span>{site.role}</span>
      </div>
    </footer>
  )
}
