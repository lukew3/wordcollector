import React from 'react'
import './Bookmarks.css'
import { useAtom } from 'jotai'
import { bookmarksAtom } from '../../atoms'

interface BookmarksProps {
  onWordClick: (word: string) => void
}


const Bookmarks: React.FC<BookmarksProps> = ({ onWordClick }) => {
  const [bookmarks, setBookmarks] = useAtom(bookmarksAtom)

  const removeFromBookmarks = (word: string, definition: string) => {
    setBookmarks(prev => {
      const newBookmarks = { ...prev }
      if (newBookmarks[word]) {
        newBookmarks[word] = newBookmarks[word].filter(d => d !== definition)
        if (newBookmarks[word].length === 0) {
          delete newBookmarks[word]
        }
      }
      return newBookmarks
    })
  }

  // Transform the bookmarks Record<string, string[]> into an array of mappable items
  const bookmarkItems = Object.entries(bookmarks).flatMap(([word, definitions]) =>
    definitions.map(definition => ({
      word,
      definition
    }))
  )

  if (bookmarkItems.length === 0) {
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
        {bookmarkItems.map((item) => (
          <div
            key={`${item.word}-${item.definition}`}
            className="bookmark-item"
            onClick={() => onWordClick(item.word)}
          >
            <div className="bookmark-content">
              <div className="bookmark-word">
                <strong>{item.word}</strong>
              </div>
              <div className="bookmark-definition">{item.definition}</div>
            </div>
            <div className="bookmark-actions">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeFromBookmarks(item.word, item.definition)
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