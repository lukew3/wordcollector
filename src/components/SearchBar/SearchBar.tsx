import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Database } from '../../interfaces'

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
    </form>
  )
}

export default SearchBar