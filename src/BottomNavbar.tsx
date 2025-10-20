import React, { useState } from 'react'
import './BottomNavbar.css'

interface BottomNavbarProps {
  onNavItemClick?: (item: string) => void
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({ onNavItemClick }) => {
  const [activeTab, setActiveTab] = useState<string>('history')

  const handleNavClick = (item: string) => {
    setActiveTab(item)
    if (onNavItemClick) {
      onNavItemClick(item)
    }
  }

  return (
    <nav className="bottom-navbar">
      <div
        className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
        onClick={() => handleNavClick('favorites')}
      >
        <div className="nav-icon">
          <i className="fas fa-star"></i>
        </div>
        <div className="nav-label">Favorites</div>
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