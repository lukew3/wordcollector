import React, { useState, useEffect } from 'react'
import './QueryResults.css'
import { QueryResultsProps } from '../../interfaces'
import { addToBookmarks, removeFromBookmarks, loadBookmarkedDefinitions } from '../../bookmarkUtils'

const QueryResults: React.FC<QueryResultsProps> = ({
  escapeHtml,
  definitions,
  wordTitle
}) => {
  const [bookmarkedDefinitions, setBookmarkedDefinitions] = useState<Set<string>>(new Set())

  const loadBookmarks = (): void => {
    setBookmarkedDefinitions(loadBookmarkedDefinitions())
  }

  useEffect(() => {
    loadBookmarks()
  }, [])

  // Listen for storage changes to keep bookmarkedDefinitions in sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'definitionBookmarks' || e.key === null) {
        loadBookmarks()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const toggleBookmark = (word: string, pos: string, definition: string): void => {
    const definitionKey = `${word}-${pos}-${definition}`
    if (bookmarkedDefinitions.has(definitionKey)) {
      removeFromBookmarks(word, pos, definition)
      setBookmarkedDefinitions(prev => {
        const newSet = new Set(prev)
        newSet.delete(definitionKey)
        return newSet
      })
    } else {
      addToBookmarks(word, pos, definition)
      setBookmarkedDefinitions(prev => new Set(prev).add(definitionKey))
    }
  }


  const getBookmarkIcon = (isBookmarked: boolean): string => {
    return isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark'
  }

  return (
    <>
      {wordTitle && <h2>{wordTitle}</h2>}
      <div id="definitionList" aria-live="polite">
        {definitions.map((def, index) => {
          const definitionKey = `${def.word}-${def.pos}-${def.definition}`
          const isBookmarked = bookmarkedDefinitions.has(definitionKey)

          return (
            <div className="defItem" key={index}>
              <div className="defContent">
                <div className="defNumber">{index + 1})</div>
                <div className="defText"><strong>{def.pos}.</strong> {escapeHtml(def.definition)}</div>
              </div>
              <button
                className="bookmarkBtn"
                onClick={() => toggleBookmark(def.word, def.pos, def.definition)}
                aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
              >
                <i className={getBookmarkIcon(isBookmarked)}></i>
              </button>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default QueryResults