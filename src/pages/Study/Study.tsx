import React, { useState, useEffect } from 'react'
import './Study.css'
import { useAtom } from 'jotai'
import { historyAtom } from '../../atoms'
import { Definition, Database } from '../../interfaces'
import { getDefinitionsForWord, getRandomWords } from '../../utils'

interface StudyProps {
  db: Database | null
}

const Study: React.FC<StudyProps> = ({ db }) => {
  const [history] = useAtom(historyAtom)
  const [showWordFirst, setShowWordFirst] = useState(true)
  const [useHistory, setUseHistory] = useState(true)
  const [currentCard, setCurrentCard] = useState<Definition | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [allWords, setAllWords] = useState<Definition[]>([])
  const [touchStart, setTouchStart] = useState<number | null>(null)

  useEffect(() => {
    // Load random words from database for random mode
    const randomWords = getRandomWords(db, 100)
    setAllWords(randomWords)
    loadNextCard()
  }, [useHistory, history, db])

  const loadNextCard = () => {
    let wordsToUse: Definition[] = []
    
    if (useHistory && history.length > 0) {
      // Get actual definitions for history words
      const historyWords: Definition[] = []
      history.forEach(item => {
        const definitions = getDefinitionsForWord(db, item.word)
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



  if (!currentCard) {
    return (
      <div className="study-container">
        <div className="study-controls">
          <div className="toggle-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={showWordFirst}
                onChange={(e) => setShowWordFirst(e.target.checked)}
              />
              Show Word First
            </label>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={useHistory}
                onChange={(e) => setUseHistory(e.target.checked)}
              />
              Use History
            </label>
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
                onChange={(e) => setShowWordFirst(e.target.checked)}
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
                onChange={(e) => setUseHistory(e.target.checked)}
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