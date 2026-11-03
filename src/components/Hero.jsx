import { site } from '../data/site.js'
import MollyLogo from './MollyLogo.jsx'
import Reveal from './Reveal.jsx'

/** 首屏：主标题 + 副标题 + 简介 + 双 CTA + 轨道/星光装饰 */
export default function Hero({ dark }) {
  const { hero } = site

  return (
    <section className="hero" id="home">
      <div className="hero__glow hero__glow--a" aria-hidden="true" />
      <div className="hero__glow hero__glow--b" aria-hidden="true" />

      <div className="container hero__inner">
        <div className="hero__copy">
          <Reveal as="p" className="hero__eyebrow">
            {hero.eyebrow}
          </Reveal>

          <Reveal as="h1" className="hero__title" delay={60}>
            {hero.titleLead} <span className="hero__accent">{hero.titleAccent}</span>
          </Reveal>

          <Reveal as="p" className="hero__subtitle" delay={120}>
            {hero.subtitle}
          </Reveal>

          <Reveal as="p" className="hero__intro" delay={180}>
            {hero.intro}
          </Reveal>

          <Reveal className="hero__actions" delay={240}>
            <a className="btn btn--primary" href={hero.primaryCta.href}>
              {hero.primaryCta.label}
              <span aria-hidden="true">→</span>
            </a>
            <a className="btn btn--ghost" href={hero.secondaryCta.href}>
              {hero.secondaryCta.label}
            </a>
          </Reveal>

          <Reveal as="ul" className="hero__chips" delay={300}>
            {hero.chips.map((chip) => (
              <li key={chip}>{chip}</li>
            ))}
          </Reveal>
        </div>

        <Reveal className="hero__visual" delay={120}>
          <div className="orbit" aria-hidden="true">
            <span className="orbit__ring orbit__ring--1" />
            <span className="orbit__ring orbit__ring--2" />
            <span className="orbit__spark orbit__spark--1">✦</span>
            <span className="orbit__spark orbit__spark--2">✧</span>
          </div>
          <div className="hero__card">
            <MollyLogo dark={dark} width={340} />
            <p className="hero__card-status">{hero.status}</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
