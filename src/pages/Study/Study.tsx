import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import './Study.css'
import { useAtom } from 'jotai'
import { historyAtom } from '../../atoms'
import { Definition, Database } from '../../interfaces'
import { getDefinitionsForWords, getRandomWords } from '../../utils'

interface StudyProps {
  db: Database | null
  onWordClick?: (word: string) => void
}

const Study: React.FC<StudyProps> = ({ db, onWordClick }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [history] = useAtom(historyAtom)
  const [showWordFirst, setShowWordFirst] = useState(() => 
    searchParams.get('showWordFirst') === 'true' ? true : searchParams.get('showWordFirst') === 'false' ? false : true
  )
  const [useHistory, setUseHistory] = useState(() => 
    searchParams.get('useHistory') === 'true' ? true : searchParams.get('useHistory') === 'false' ? false : true
  )
  const [currentCard, setCurrentCard] = useState<Definition | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [allWords, setAllWords] = useState<Definition[]>([])
  const [cachedWords, setCachedWords] = useState<Definition[]>([])
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    if (!db) return
    
    setIsInitializing(true)
    
    // Use cached words if available, otherwise generate new ones
    if (cachedWords.length === 0) {
      // Load fewer random words initially for faster startup
      const randomWords = getRandomWords(db, 20)
      setAllWords(randomWords)
      
      // Load additional words in background and cache them
      setTimeout(() => {
        const additionalWords = getRandomWords(db, 80)
        const fullWordList = [...randomWords, ...additionalWords]
        setAllWords(fullWordList)
        setCachedWords(fullWordList)
      }, 100)
    } else {
      // Use cached words for instant response
      setAllWords(cachedWords)
    }
    
    loadNextCard()
    setIsInitializing(false)
  }, [useHistory, history, db, cachedWords.length])

  const loadNextCard = () => {
    let wordsToUse: Definition[] = []
    
    if (useHistory && history.length > 0) {
      // Get actual definitions for history words using batched query
      const historyWords: Definition[] = []
      const historyWordNames = history.map(item => item.word)
      const wordDefinitionsMap = getDefinitionsForWords(db, historyWordNames)
      
      historyWordNames.forEach(word => {
        const definitions = wordDefinitionsMap[word.toLowerCase()] || []
        if (definitions.length > 0) {
          // Select a random definition for this word
          const randomDefinition = definitions[Math.floor(Math.random() * definitions.length)]
          historyWords.push(randomDefinition)
        }
      })
      wordsToUse = historyWords
    } else {
      wordsToUse = allWords
    }

    if (wordsToUse.length === 0) {
      setCurrentCard(null)
      return
    }

    const randomIndex = Math.floor(Math.random() * wordsToUse.length)
    setCurrentCard(wordsToUse[randomIndex])
    setIsFlipped(false)
  }

  const handleCardClick = () => {
    setIsFlipped(!isFlipped)
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleNext = () => {
    loadNextCard()
  }

  const handleExpand = () => {
    if (currentCard && onWordClick) {
      onWordClick(currentCard.word)
    }
  }

  const handleShowWordFirstChange = (value: boolean) => {
    setShowWordFirst(value)
    const newParams = new URLSearchParams(searchParams)
    newParams.set('showWordFirst', value.toString())
    setSearchParams(newParams)
  }

  const handleUseHistoryChange = (value: boolean) => {
    setUseHistory(value)
    const newParams = new URLSearchParams(searchParams)
    newParams.set('useHistory', value.toString())
    setSearchParams(newParams)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return

    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd

    // Minimum swipe distance
    if (Math.abs(diff) > 50) {
      loadNextCard()
    }

    setTouchStart(null)
  }



  if (isInitializing) {
    return (
      <div className="study-container">
        <div className="study-controls">
          <div className="toggle-group">
            <div className="toggle-container">
              <span className="toggle-option align-right">Definition</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={showWordFirst}
                  onChange={(e) => handleShowWordFirstChange(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
              <span className="toggle-option align-left">Word</span>
            </div>
            <div className="toggle-container">
              <span className="toggle-option align-right">Random</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={useHistory}
                  onChange={(e) => handleUseHistoryChange(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
                <span className="toggle-option align-left">History</span>
            </div>
          </div>
        </div>
        <div className="loading-state">
          <p>Loading study content...</p>
        </div>
      </div>
    )
  }

  if (!currentCard) {
    return (
      <div className="study-container">
        <div className="study-controls">
          <div className="toggle-group">
            <div className="toggle-container">
              <span className="toggle-option align-right">Definition</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={showWordFirst}
                  onChange={(e) => handleShowWordFirstChange(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
              <span className="toggle-option align-left">Word</span>
            </div>
            <div className="toggle-container">
              <span className="toggle-option align-right">Random</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={useHistory}
                  onChange={(e) => handleUseHistoryChange(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
                <span className="toggle-option align-left">History</span>
            </div>
          </div>
        </div>
        <div className="no-cards">
          <p>No words available for study</p>
        </div>
      </div>
    )
  }

  return (
    <div className="study-container">
      <div className="study-controls">
        <div className="toggle-group">
          <div className="toggle-container">
            <span className="toggle-option align-right">Definition</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={showWordFirst}
                onChange={(e) => handleShowWordFirstChange(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
            <span className="toggle-option align-left">Word</span>
          </div>
          <div className="toggle-container">
            <span className="toggle-option align-right">Random</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={useHistory}
                onChange={(e) => handleUseHistoryChange(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
              <span className="toggle-option align-left">History</span>
          </div>
        </div>
      </div>

      <div className="flashcard-container">
        <div 
          className={`flashcard ${isFlipped ? 'flipped' : ''}`}
          onClick={handleCardClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flashcard-face flashcard-front">
            {showWordFirst ? (
              <div className="card-content">
                <h2 className="word">{currentCard.word}</h2>
                <span className="pos">{currentCard.pos}</span>
              </div>
            ) : (
              <div className="card-content">
                <p className="definition">{currentCard.definition}</p>
              </div>
            )}
          </div>
          <div className="flashcard-face flashcard-back">
            {showWordFirst ? (
              <div className="card-content">
                <p className="definition">{currentCard.definition}</p>
              </div>
            ) : (
              <div className="card-content">
                <h2 className="word">{currentCard.word}</h2>
                <span className="pos">{currentCard.pos}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flashcard-controls">
        <button className="control-button" onClick={handleExpand}>
          Expand
        </button>
        <button className="control-button" onClick={handleFlip}>
          Flip
        </button>
        <button className="control-button" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  )
}

export default Study