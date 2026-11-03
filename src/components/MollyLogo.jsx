import logo from '../assets/molly-logo.svg'
import logoLight from '../assets/molly-logo-light.svg'

/**
 * Molly 品牌 Logo（矢量）。
 * - 深色主题下自动切换为白色字版
 * - 通过 <img> 引入 SVG，缩放不失真、体积小
 */
export default function MollyLogo({ dark = false, className = '', width, alt = 'Molly' }) {
  return (
    <img
      className={`molly-logo ${className}`}
      src={dark ? logoLight : logo}
      alt={alt}
      width={width}
      decoding="async"
    />
  )
}
