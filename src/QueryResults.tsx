import React from 'react'
import './QueryResults.css'

interface Definition {
  word: string
  pos: string
  definition: string
}

interface QueryResultsProps {
  definitions: Definition[]
  wordTitle: string
  bookmarkedDefinitions: Set<string>
  toggleBookmark: (word: string, pos: string, definition: string) => void
  escapeHtml: (str: string | null | undefined) => string
}

const QueryResults: React.FC<QueryResultsProps> = ({
  definitions,
  wordTitle,
  bookmarkedDefinitions,
  toggleBookmark,
  escapeHtml
}) => {
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