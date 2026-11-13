
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import './AppLayout.css'

const navigation = [
  { label: 'Home', path: '/home', icon: '⌂' },
  { label: 'Dashboard', path: '/dashboard', icon: '▦' },
  { label: 'Farm Assessment', path: '/farm-assessment', icon: '⌖' },
  { label: 'Climate Insights', path: '/climate', icon: '☼' },
  { label: 'Crop Planner', path: '/crop-planner', icon: '♧' },
  { label: 'Reports', path: '/reports', icon: '▤' },
]

function AppLayout({ farmLocation, setFarmLocation }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [topbarAvatar, setTopbarAvatar] = useState('')

  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  // Load the farmer's saved profile picture
  useEffect(() => {
    let active = true

    async function loadTopbarAvatar() {
      if (!user || !profile?.avatar_url) {
        setTopbarAvatar('')
        return
      }

      const { data, error } = await supabase.storage
        .from('avatars')
        .createSignedUrl(profile.avatar_url, 3600)

      if (!active) return

      if (error) {
        console.error('Topbar avatar loading error:', error.message)
        setTopbarAvatar('')
        return
      }

      setTopbarAvatar(data.signedUrl)
    }

    loadTopbarAvatar()

    return () => {
      active = false
    }
  }, [user, profile?.avatar_url])

  function closeMenu() {
    setMenuOpen(false)
  }

  async function handleLogout() {
    const { error } = await signOut()

    if (error) {
      console.error('Logout error:', error.message)
      return
    }

    navigate('/login', { replace: true })
  }

  const displayName = profile?.full_name || 'Farmer'

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

  return (
    <div className="agro-app">
      {menuOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={closeMenu}
        />
      )}

      <aside className={`app-sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <img
            src="/images/logo.jpg"
            alt="AgroShift Logo"
            className="brand-logo"
          />

          <div>
            <h2>AgroShift</h2>
            <span>SMART AGRICULTURE</span>
          </div>
        </div>

        <div className="sidebar-section-label">
          WORKSPACE
        </div>

        <nav className="sidebar-navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/home'}
              onClick={closeMenu}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <NavLink
            to="/profile"
            onClick={closeMenu}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="sidebar-link-icon">♙</span>
            <span>My Profile</span>
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help-card">
            <span className="help-icon">?</span>
            <h3>Need assistance?</h3>
            <p>Explore climate information and crop planning tools.</p>
            <NavLink to="/crop-planner" onClick={closeMenu}>
              Open Crop Planner →
            </NavLink>
          </div>

          <div className="sidebar-version">
            <span className="status-dot" />
            AgroShift v1.0
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <button
            className="mobile-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            ☰
          </button>

          <div className="topbar-breadcrumb">
            <span>AgroShift</span>
            <span>/</span>
            <strong>Smart Agriculture Platform</strong>
          </div>

          <div className="topbar-right">
            <span className="topbar-status">
              <span className="status-dot" />
              Platform Active
            </span>

            <NavLink to="/profile" className="topbar-profile-link">
              <div className="topbar-avatar">
                {topbarAvatar ? (
                  <img
                    src={topbarAvatar}
                    alt="Profile"
                  />
                ) : (
                  initials || 'F'
                )}
              </div>

              <span>{displayName}</span>
            </NavLink>

            <button
              type="button"
              className="topbar-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="app-content">
          <Outlet context={{ farmLocation, setFarmLocation }} />
        </main>

        <footer className="app-footer">
          <span>© 2026 AgroShift</span>
          <span>Earth Data. Smarter Agriculture. Stronger Farms.</span>
        </footer>
      </div>
    </div>
  )
}

export default AppLayout
