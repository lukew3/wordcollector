import React from 'react'
import './BottomNavbar.css'

interface BottomNavbarProps {
  activeTab?: string
  onNavItemClick: (item: string) => void
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({ activeTab = 'history', onNavItemClick }) => {
  const handleNavClick = (item: string) => {
    if (onNavItemClick) {
      onNavItemClick(item)
    }
  }

  return (
    <nav className="bottom-navbar">
      <div
        className={`nav-item ${activeTab === 'bookmarks' ? 'active' : ''}`}
        onClick={() => handleNavClick('bookmarks')}
      >
        <div className="nav-icon">
          <i className="fas fa-bookmark"></i>
        </div>
        <div className="nav-label">Bookmarks</div>
      </div>
      <div
        className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => handleNavClick('history')}
      >
        <div className="nav-icon">
          <i className="fas fa-clock-rotate-left"></i>
        </div>
        <div className="nav-label">History</div>
      </div>
      <div
        className={`nav-item ${activeTab === 'study' ? 'active' : ''}`}
        onClick={() => handleNavClick('study')}
      >
        <div className="nav-icon">
          <i className="fas fa-book"></i>
        </div>
        <div className="nav-label">Study</div>
      </div>
    </nav>
  )
}

export default BottomNavbar