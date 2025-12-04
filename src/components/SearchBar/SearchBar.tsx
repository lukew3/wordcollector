import { useState } from 'react'
import { Database, Definition } from '../../interfaces'
import { performSearch } from '../../searchUtils'

interface SearchBarProps {
  db: Database | null
  isLoading: boolean
  setError: (error: string) => void
  setInfo: (info: string) => void
  setActiveTab: (tab: string) => void
  setDefinitions: (definitions: Definition[]) => void
  setWordTitle: (title: string) => void
  setQuery: (query: string) => void
}

function SearchBar({ db, isLoading, setError, setInfo, setActiveTab, setDefinitions, setWordTitle, setQuery }: SearchBarProps) {
  const [localQuery, setLocalQuery] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!db || !localQuery.trim()) return

    // Update URL with query parameter
    const url = new URL(window.location.href)
    url.searchParams.set('word', localQuery)
    window.history.pushState({}, '', url.toString())

    setQuery(localQuery)
    await performSearch(localQuery, db, setError, setInfo, setActiveTab, setDefinitions, setWordTitle)
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