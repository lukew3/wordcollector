import React, { useState, useEffect } from 'react'
import './Settings.css'
import { useAtom } from 'jotai'
import { historyAtom, bookmarksAtom } from '../../atoms'
import { clearDatabaseCache, getDatabaseCacheInfo, forceRefreshDatabase } from '../../cacheUtils'

const Settings: React.FC = () => {
  const [_, setHistory] = useAtom(historyAtom)
  const [__, setBookmarks] = useAtom(bookmarksAtom)
  const [cacheInfo, setCacheInfo] = useState<{ cached: boolean; size?: number }>({ cached: false })
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const checkCache = async () => {
      const info = await getDatabaseCacheInfo()
      setCacheInfo(info)
    }
    checkCache()
  }, [])

  const handleClearHistory = () => {
    setHistory([])
    alert('Search history cleared.')
  }

  const handleClearBookmarks = () => {
    setBookmarks({})
    alert('Bookmarks cleared.')
  }

  const handleClearDatabaseCache = async () => {
    try {
      await clearDatabaseCache()
      setCacheInfo({ cached: false })
      alert('Database cache cleared. The database will be downloaded again on next load.')
    } catch (error) {
      alert('Error clearing database cache. Please try again.')
    }
  }

  const handleRefreshDatabase = async () => {
    try {
      setIsRefreshing(true)
      await forceRefreshDatabase()
      const info = await getDatabaseCacheInfo()
      setCacheInfo(info)
      alert('Database cache refreshed successfully.')
    } catch (error) {
      alert('Error refreshing database cache. Please check your connection.')
    } finally {
      setIsRefreshing(false)
    }
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
        
        <div className="cache-section">
          <h4>Database Cache</h4>
          <div className="cache-info">
            {cacheInfo.cached ? (
              <p>Database cached ({cacheInfo.size ? `${(cacheInfo.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'})</p>
            ) : (
              <p>Database not cached</p>
            )}
          </div>
          <button 
            onClick={handleClearDatabaseCache} 
            className="settings-btn"
            disabled={!cacheInfo.cached}
          >
            Clear Database Cache
          </button>
          <button 
            onClick={handleRefreshDatabase} 
            className="settings-btn"
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Database'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings