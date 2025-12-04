import React from 'react'
import './Settings.css'
import { clearAllBookmarks } from '../../bookmarkUtils'

const Settings: React.FC = () => {
  const handleClearHistory = () => {
    if ((window as any).clearSearchHistory) {
      (window as any).clearSearchHistory()
      alert('Search history cleared.')
    }
  }

  const handleClearBookmarks = () => {
    clearAllBookmarks()
    alert('Bookmarks cleared.')
  }

  return (
    <div className="settings">
      <h3>Settings</h3>
      <div className="settings-options">
        <button onClick={handleClearHistory} className="settings-btn">
          Clear Search History
        </button>
        <button onClick={handleClearBookmarks} className="settings-btn">
          Clear Bookmarks
        </button>
      </div>
    </div>
  )
}

export default Settings