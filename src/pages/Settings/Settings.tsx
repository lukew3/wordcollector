import React from 'react'
import './Settings.css'
import { useAtom } from 'jotai'
import { historyAtom, bookmarksAtom } from '../../atoms'
import DatabaseSelector from '../../components/DatabaseSelector/DatabaseSelector'
import DatabaseManager from '../../components/DatabaseManager/DatabaseManager'

const Settings: React.FC = () => {
  const [_, setHistory] = useAtom(historyAtom)
  const [__, setBookmarks] = useAtom(bookmarksAtom)

  const handleClearHistory = () => {
    setHistory([])
    alert('Search history cleared.')
  }

  const handleClearBookmarks = () => {
    setBookmarks({})
    alert('Bookmarks cleared.')
  }

  

  return (
    <div className="settings">
      <h3>Settings</h3>
      
      <div className="settings-section">
        <h4>Data Management</h4>
        <div className="settings-options">
          <button onClick={handleClearHistory} className="settings-btn">
            Clear Search History
          </button>
          <button onClick={handleClearBookmarks} className="settings-btn">
            Clear Bookmarks
          </button>
        </div>
      </div>

      <DatabaseSelector />
      
      <DatabaseManager />
    </div>
  )
}

export default Settings