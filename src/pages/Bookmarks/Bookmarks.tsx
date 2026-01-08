import React from 'react'
import './Bookmarks.css'
import { BookmarksProps } from '../../interfaces'
import { useAtom } from 'jotai'
import { bookmarksAtom } from '../../atoms'


const Bookmarks: React.FC<BookmarksProps> = ({ onWordClick }) => {
  const [bookmarks, setBookmarks] = useAtom(bookmarksAtom)

  const formatDateTime = (timestamp: string): string => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }


  if (!bookmarks) {
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
        {bookmarks.map((item: BookmarkedDefinition) => (
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