import { useState } from 'react'
import { Database } from '../../interfaces'

interface SearchBarProps {
  db: Database | null
  onSearch: (query: string) => void
  isLoading: boolean
}

function SearchBar({ db, onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!db || !query.trim()) return

    // Update URL with query parameter
    const url = new URL(window.location.href)
    url.searchParams.set('word', query)
    window.history.pushState({}, '', url.toString())

    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter exact word"
        required
      />
      <button type="submit" disabled={isLoading}>Search</button>
    </form>
  )
}

export default SearchBar