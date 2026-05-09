import React from 'react'
import './SearchHistory.css'
import { SearchHistoryItem, HistoryCategory } from '../../interfaces'
import { useAtom } from 'jotai'
import { historyAtom } from '../../atoms'
import { formatWordForDisplay } from '../../utils'

interface SearchHistoryProps {
  onWordClick: (word: string, source?: string) => void
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ onWordClick }) => {
  const [history, _] = useAtom(historyAtom);

  const formatDateTime = (timestamp: string): string => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const getCategoryIcon = (category: HistoryCategory): string => {
    switch (category) {
      case 'search':
        return 'fas fa-search'
      case 'link':
        return 'fas fa-link'
      case 'history-click':
        return 'fas fa-clock-rotate-left'
      case 'book':
        return 'fas fa-book'
      case 'random':
        return 'fas fa-dice-five'
      default:
        return 'fas fa-search'
    }
  }

  if (history.length === 0) {
    return null
  }

  return (
    <div className="search-history">
      <div className="search-history-header">
        <h3>Recent Searches</h3>
      </div>
      <div className="search-history-list">
        {history.map((item: SearchHistoryItem) => (
          <div
            key={`${item.word}-${item.timestamp}`}
            className="search-history-item"
            onClick={() => onWordClick(item.word, 'history')}
          >
            <i className={`${getCategoryIcon(item.category)} history-icon`}></i>
            <span className="history-word">{formatWordForDisplay(item.word)}</span>
            <span className="history-timestamp">{formatDateTime(item.timestamp)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SearchHistory