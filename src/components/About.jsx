import { site } from '../data/site.js'
import SectionHeading from './SectionHeading.jsx'
import Reveal from './Reveal.jsx'

/** 关于我：左侧文案 + 右侧信息卡 */
export default function About() {
  const { about } = site
  return (
    <section className="section about" id="about">
      <div className="container about__inner">
        <div className="about__copy">
          <SectionHeading label={about.label} title={about.title} description={about.lead} />
          {about.paragraphs.map((text, i) => (
            <Reveal as="p" className="about__paragraph" key={i} delay={i * 80}>
              {text}
            </Reveal>
          ))}
        </div>

        <Reveal className="about__facts" delay={120}>
          <ul className="fact-grid">
            {about.facts.map((fact) => (
              <li className="fact-card" key={fact.label}>
                <span className="fact-card__label">{fact.label}</span>
                <span className="fact-card__value">{fact.value}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
