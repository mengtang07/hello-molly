import { useEffect, useState } from 'react'
import './App.css'

const FACTS = [
  { k: '框架', v: 'Vite + React 19' },
  { k: '构建产物', v: '纯静态 HTML / CSS / JS' },
  { k: '托管', v: 'Apache · mymolly.online' },
]

function App() {
  const [count, setCount] = useState(0)
  const [dark, setDark] = useState(false)
  const [now, setNow] = useState('')

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])

  useEffect(() => {
    const tick = () =>
      setNow(new Date().toLocaleTimeString('zh-CN', { hour12: false }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="page">
      <button
        className="theme"
        onClick={() => setDark((d) => !d)}
        aria-label="切换深色模式"
      >
        {dark ? '☀️' : '🌙'}
      </button>

      <main className="card">
        <p className="eyebrow">Vite + React</p>

        <h1 className="hello">
          Hello, <span className="name">Molly</span>
        </h1>

        <p className="sub">
          这是一个用 React 写的简单页面，构建成静态文件后由 Apache 直接托管。
        </p>

        <div className="actions">
          <button className="btn" onClick={() => setCount((c) => c + 1)}>
            点击次数 <strong>{count}</strong>
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => setCount(0)}
            disabled={count === 0}
          >
            重置
          </button>
        </div>

        <dl className="facts">
          {FACTS.map((f) => (
            <div className="fact" key={f.k}>
              <dt>{f.k}</dt>
              <dd>{f.v}</dd>
            </div>
          ))}
        </dl>

        <footer className="foot">
          <span>构建于 {now}</span>
          <span>·</span>
          <a href="https://mymolly.online/">mymolly.online</a>
        </footer>
      </main>
    </div>
  )
}

export default App
