import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Database } from '../../interfaces'
import { getRandomWords } from '../../utils'

interface SearchBarProps {
  db: Database | null
  isLoading: boolean
}

function SearchBar({ db, isLoading }: SearchBarProps) {
  const [localQuery, setLocalQuery] = useState<string>('')
  const navigate = useNavigate()
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!db || !localQuery.trim()) return

    // Navigate directly to word route - QueryResults component will handle the search
    navigate(`/word/${encodeURIComponent(localQuery)}`)
    setLocalQuery('')
  }

  const handleRandomSearch = async (): Promise<void> => {
    if (!db) return

    const randomWords = getRandomWords(db, 1)
    if (randomWords.length > 0) {
      const randomWord = randomWords[0].word
      navigate(`/word/${encodeURIComponent(randomWord)}?category=random`)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        placeholder="Enter exact word"
        required
      />
      <button type="submit" disabled={isLoading}>Search</button>
      <button 
        type="button" 
        onClick={handleRandomSearch}
        disabled={isLoading}
        title="Random word"
        aria-label="Search for a random word"
      >
        <i className="fas fa-dice-five"></i>
      </button>
    </form>
  )
}

export default SearchBar