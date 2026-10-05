import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  const onMap = useLocation().pathname === '/map'

  return (
    <div className="layout">
      <Link className="page-switch" to={onMap ? '/' : '/map'}>
        {onMap ? '← Rat Identification' : 'Rat Inspection Map →'}
      </Link>
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout
