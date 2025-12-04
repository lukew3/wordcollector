import React from 'react'
import './QueryResults.css'
import { QueryResultsProps } from '../../interfaces'

const QueryResults: React.FC<QueryResultsProps> = ({
  bookmarkedDefinitions,
  toggleBookmark,
  escapeHtml,
  definitions,
  wordTitle
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