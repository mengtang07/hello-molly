import { site } from '../data/site.js'
import SectionHeading from './SectionHeading.jsx'
import Reveal from './Reveal.jsx'

/** 最近笔记：列表式排版 */
export default function Notes() {
  return (
    <section className="section notes" id="notes">
      <div className="container">
        <SectionHeading
          label="Latest Notes"
          title="最近的笔记"
          description="关于设计、代码与 AI 工具的碎片思考。"
        />

        <div className="notes__list">
          {site.notes.map((note, i) => (
            <Reveal as="article" className="note-item" key={note.title} delay={i * 80}>
              <time className="note-item__date" dateTime={note.date}>
                {note.date}
              </time>
              <div className="note-item__body">
                <h3 className="note-item__title">{note.title}</h3>
                <p className="note-item__summary">{note.summary}</p>
              </div>
              <a className="note-item__more" href={note.href} aria-label={`阅读：${note.title}`}>
                阅读
                <span aria-hidden="true">→</span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
