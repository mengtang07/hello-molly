import { site } from '../data/site.js'
import SectionHeading from './SectionHeading.jsx'
import Reveal from './Reveal.jsx'

/** 精选项目：3 张卡片 */
export default function Projects() {
  return (
    <section className="section projects" id="projects">
      <div className="container">
        <SectionHeading
          label="Featured Projects"
          title="精选项目"
          description="一些我做过或正在做的实验，每一张都还在持续迭代。"
        />

        <div className="projects__grid">
          {site.projects.map((project, i) => (
            <Reveal as="article" className="project-card" key={project.name} delay={i * 90}>
              <span className="project-card__index">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="project-card__name">{project.name}</h3>
              <p className="project-card__summary">{project.summary}</p>
              <ul className="project-card__tags">
                {project.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              <div className="project-card__links">
                {project.links.map((link) => (
                  <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                    {link.label}
                    <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
