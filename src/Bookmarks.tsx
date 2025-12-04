import React, { useCallback } from 'react'
import './Bookmarks.css'
import { BookmarkedDefinition, BookmarksProps } from './interfaces'

const Bookmarks: React.FC<BookmarksProps> = ({ onWordClick }) => {
  const [bookmarks, setBookmarks] = React.useState<BookmarkedDefinition[]>([])

  React.useEffect(() => {
    loadBookmarks()
  }, [])

  // Listen for storage changes to update bookmarks when they're modified elsewhere
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'definitionBookmarks' || e.key === null) {
        loadBookmarks()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const loadBookmarks = (): void => {
    try {
      const stored = localStorage.getItem('definitionBookmarks')
      if (stored) {
        const parsedBookmarks = JSON.parse(stored) as BookmarkedDefinition[]
        // Sort by timestamp descending (most recent first)
        const sortedBookmarks = parsedBookmarks.sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        setBookmarks(sortedBookmarks)
      } else {
        setBookmarks([])
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error)
      setBookmarks([])
    }
  }

  const addToBookmarks = (word: string, pos: string, definition: string): void => {
    try {
      const newItem: BookmarkedDefinition = {
        word: word.toLowerCase(),
        pos,
        definition,
        timestamp: new Date().toISOString()
      }

      const stored = localStorage.getItem('definitionBookmarks')
      let currentBookmarks: BookmarkedDefinition[] = []

      if (stored) {
        currentBookmarks = JSON.parse(stored) as BookmarkedDefinition[]
      }

      // Remove duplicates (same word, pos, and definition)
      const filteredBookmarks = currentBookmarks.filter(item =>
        !(item.word === word.toLowerCase() && item.pos === pos && item.definition === definition)
      )

      // Add new item at the beginning
      const updatedBookmarks = [newItem, ...filteredBookmarks]

      // Keep only the last 100 bookmarks
      const trimmedBookmarks = updatedBookmarks.slice(0, 100)

      localStorage.setItem('definitionBookmarks', JSON.stringify(trimmedBookmarks))
      loadBookmarks() // Reload to update the display
    } catch (error) {
      console.error('Error saving to bookmarks:', error)
    }
  }

  const removeFromBookmarks = (word: string, pos: string, definition: string): void => {
    try {
      const stored = localStorage.getItem('definitionBookmarks')
      if (stored) {
        const currentBookmarks = JSON.parse(stored) as BookmarkedDefinition[]
        const filteredBookmarks = currentBookmarks.filter(item =>
          !(item.word === word.toLowerCase() && item.pos === pos && item.definition === definition)
        )

        localStorage.setItem('definitionBookmarks', JSON.stringify(filteredBookmarks))
        loadBookmarks() // Reload to update the display
      }
    } catch (error) {
      console.error('Error removing from bookmarks:', error)
    }
  }


  const formatDateTime = (timestamp: string): string => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  // Expose functions globally for App.tsx to use
  React.useEffect(() => {
    ;(window as any).addToBookmarks = addToBookmarks
    ;(window as any).removeFromBookmarks = removeFromBookmarks
    return () => {
      delete (window as any).addToBookmarks
      delete (window as any).removeFromBookmarks
    }
  }, [])

  if (bookmarks.length === 0) {
    return (
      <div className="bookmarks">
        <div className="bookmarks-empty">
          <i className="fas fa-bookmark"></i>
          <p>No bookmarked definitions yet</p>
          <p className="bookmarks-hint">Tap the bookmark icon on any definition to save it here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bookmarks">
      <div className="bookmarks-header">
        <h3>Bookmarked Definitions</h3>
      </div>
      <div className="bookmarks-list">
        {bookmarks.map((item, index) => (
          <div
            key={`${item.word}-${item.pos}-${item.timestamp}`}
            className="bookmark-item"
            onClick={() => onWordClick(item.word)}
          >
            <div className="bookmark-content">
              <div className="bookmark-word">
                <strong>{item.word}</strong>
              </div>
              <div className="bookmark-pos">{item.pos}</div>
              <div className="bookmark-definition">{item.definition}</div>
            </div>
            <div className="bookmark-actions">
              <span className="bookmark-timestamp">{formatDateTime(item.timestamp)}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeFromBookmarks(item.word, item.pos, item.definition)
                }}
                className="remove-bookmark-btn"
                title="Remove bookmark"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Bookmarks