import Reveal from './Reveal.jsx'

/** 统一的区块标题：小标签 + 主标题 + 描述 */
export default function SectionHeading({ label, title, description, align = 'left' }) {
  return (
    <Reveal className={`section-heading section-heading--${align}`}>
      <span className="section-heading__label">{label}</span>
      <h2 className="section-heading__title">{title}</h2>
      {description && <p className="section-heading__desc">{description}</p>}
    </Reveal>
  )
}
