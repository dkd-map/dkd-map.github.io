import './globals.css'

export const metadata = {
  title: 'Dynamic DKDM — Parametric ODE Network Atlas',
  description: 'Interactive parametric ODE models for 24 DKD-relevant kidney cell types.',
}

/* ── Logos referenced from the main site (public assets, no copy needed) ── */
const LOGOS = [
  { name: 'RMRC', url: 'https://rmrc.mui.ac.ir/',          src: 'https://dkd-map.github.io/assets/logos/rmrc.png' },
  { name: 'Isfahan University', url: 'https://www.mui.ac.ir/en', src: 'https://dkd-map.github.io/assets/logos/isfahan.png' },
  { name: 'University of Luxembourg', url: 'https://www.uni.lu/lcsb-en/', src: 'https://dkd-map.github.io/assets/logos/luxembourg.png' },
]

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-top">
          {/* Brand */}
          <a className="brand" href="/">
            <span className="brand-mark">DKDM</span>
            <span>
              <div className="brand-title">Dynamic DKDM</div>
              <div className="brand-sub">Parametric ODE Network Atlas — Diabetic Kidney Disease</div>
            </span>
          </a>
          {/* Logos */}
          <div className="header-logos">
            {LOGOS.map(l => (
              <a key={l.name} href={l.url} target="_blank" rel="noopener" title={l.name}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.src} alt={l.name} />
              </a>
            ))}
          </div>
        </div>
        {/* Nav */}
        <div className="header-bottom">
          <ul className="site-nav">
            <li><a href="https://dkd-map.github.io/" className="back-link">← Main DKDM Site</a></li>
            <li><a href="/">Cell Browser</a></li>
            <li><a href="/network/all_data_combined/">All Cells Combined</a></li>
          </ul>
        </div>
      </div>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="footer-cite">
          Dynamic DKDM · Parametric ODE Interaction Maps · Part of the Diabetic Kidney Disease Map project
        </p>
        <nav className="footer-links">
          <a href="https://dkd-map.github.io/" target="_blank" rel="noopener">
            <span className="footer-dot" /> Main Site
          </a>
          <a href="https://fairdomhub.org/projects/505" target="_blank" rel="noopener">
            <span className="footer-dot" /> FAIRDOMHub
          </a>
          <a href="https://github.com/dkd-map/DynamicDKDM" target="_blank" rel="noopener">
            <span className="footer-dot" /> GitHub
          </a>
        </nav>
      </div>
    </footer>
  )
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {/* Offset fixed header + footer */}
        <div style={{ paddingTop: 'var(--header-h)', paddingBottom: 'var(--footer-h)', minHeight: '100vh' }}>
          {children}
        </div>
        <SiteFooter />
      </body>
    </html>
  )
}
