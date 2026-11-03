import { useEffect, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Projects from './components/Projects.jsx'
import Notes from './components/Notes.jsx'
import Footer from './components/Footer.jsx'

function App() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])

  return (
    <div className="page">
      <Navbar dark={dark} onToggleTheme={() => setDark((d) => !d)} />

      <main>
        <Hero dark={dark} />
        <About />
        <Projects />
        <Notes />
      </main>

      <Footer />
    </div>
  )
}

export default App
