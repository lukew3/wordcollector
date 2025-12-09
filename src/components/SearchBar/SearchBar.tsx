import { useState, useEffect } from 'react'
import { Database, Definition } from '../../interfaces'
import { performSearch } from '../../searchUtils'
import { useAtom } from 'jotai'
import { historyAtom } from '../../atoms'

interface SearchBarProps {
  db: Database | null
  isLoading: boolean
  setError: (error: string) => void
  setInfo: (info: string) => void
  setActiveTab: (tab: string) => void
  setDefinitions: (definitions: Definition[]) => void
  setWordTitle: (title: string) => void
}

function SearchBar({ db, isLoading, setError, setInfo, setActiveTab, setDefinitions, setWordTitle }: SearchBarProps) {
  const [localQuery, setLocalQuery] = useState<string>('')
  const [history, setHistory] = useAtom(historyAtom);
  
  useEffect(() => {
    // Check for query parameter on page load
    const urlParams = new URLSearchParams(window.location.search)
    const searchWord = urlParams.get('word')
    if (searchWord && db && !isLoading) {
      performSearch(searchWord, db, setError, setInfo, setActiveTab, setDefinitions, setWordTitle, history, setHistory)
    }
  }, [db, isLoading])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!db || !localQuery.trim()) return

    // Update URL with query parameter
    const url = new URL(window.location.href)
    url.searchParams.set('word', localQuery)
    window.history.pushState({}, '', url.toString())

    await performSearch(
      localQuery,
      db,
      setError,
      setInfo,
      setActiveTab,
      setDefinitions,
      setWordTitle,
      history,
      setHistory
    )
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