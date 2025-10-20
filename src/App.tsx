import { useState, useEffect } from 'react'
import initSqlJs from 'sql.js'
import './App.css'
import SearchHistory from './SearchHistory'
import Bookmarks from './Bookmarks'
import BottomNavbar from './BottomNavbar'

interface Definition {
  word: string
  pos: string
  definition: string
}

interface Database {
  prepare: (sql: string) => Statement
}

interface Statement {
  bind: (params: Record<string, any>) => void
  step: () => boolean
  getAsObject: () => Definition
  reset: () => void
}

function App() {
  const [query, setQuery] = useState<string>('')
  const [info, setInfo] = useState<string>('Loading database...')
  const [error, setError] = useState<string>('')
  const [definitions, setDefinitions] = useState<Definition[]>([])
  const [wordTitle, setWordTitle] = useState<string>('')
  const [db, setDb] = useState<Database | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [progress, setProgress] = useState<number>(0)
  const [bookmarkedDefinitions, setBookmarkedDefinitions] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<string>('search')

  const toggleBookmark = (word: string, pos: string, definition: string): void => {
    const definitionKey = `${word}-${pos}-${definition}`

    setBookmarkedDefinitions(prev => {
      const newBookmarks = new Set(prev)
      if (newBookmarks.has(definitionKey)) {
        // Remove from bookmarks
        newBookmarks.delete(definitionKey)
        removeFromBookmarksStorage(word, pos, definition)
      } else {
        // Add to bookmarks
        newBookmarks.add(definitionKey)
        addToBookmarksStorage(word, pos, definition)
      }
      return newBookmarks
    })
  }

  const getBookmarkIcon = (isBookmarked: boolean): string => {
    return isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark'
  }

  useEffect(() => {
    loadDatabase()
    loadBookmarkedDefinitions()
  }, [])

  // Listen for storage changes to keep bookmarkedDefinitions in sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'definitionBookmarks' || e.key === null) {
        loadBookmarkedDefinitions()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  useEffect(() => {
    // Check for query parameter on page load
    const urlParams = new URLSearchParams(window.location.search)
    const searchWord = urlParams.get('word')
    if (searchWord && db && !isLoading) {
      setQuery(searchWord)
      performSearch(searchWord)
    }
  }, [db, isLoading])

  const loadDatabase = async (): Promise<void> => {
    try {
      setInfo('Fetching wordnet.db...')
      setIsLoading(true)
      setProgress(0)

      const SQL = await initSqlJs({
        // Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
        // You can omit locateFile completely when running in node
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`
      })

      const res = await fetch('wordnetFull.db')
      if (!res.ok) throw new Error('Failed to fetch wordnet.db: ' + res.status)

      const contentLength = res.headers.get('content-length')
      const total = contentLength ? parseInt(contentLength, 10) : 0
      let loaded = 0

      const reader = res.body!.getReader()
      const chunks: Uint8Array[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        chunks.push(value)
        loaded += value.length
        const percent = total > 0 ? Math.min((loaded / total) * 100, 100) : Math.min(loaded / 1000000 * 10, 90)
        setProgress(percent)
      }

      const buffer = new Uint8Array(loaded)
      let offset = 0
      for (const chunk of chunks) {
        buffer.set(chunk, offset)
        offset += chunk.length
      }

      const database = new SQL.Database(buffer)
      setDb(database as unknown as Database)
      setInfo('Database loaded.')
      setIsLoading(false)
    } catch (e) {
      setInfo('')
      setError('Error loading database: ' + (e as Error).message)
      setIsLoading(false)
      console.error(e)
    }
  }

  const loadBookmarkedDefinitions = (): void => {
    try {
      const stored = localStorage.getItem('definitionBookmarks')
      if (stored) {
        const bookmarks = JSON.parse(stored) as Array<{word: string, pos: string, definition: string}>
        const bookmarkedKeys = new Set(bookmarks.map(b => `${b.word}-${b.pos}-${b.definition}`))
        setBookmarkedDefinitions(bookmarkedKeys)
      }
    } catch (error) {
      console.error('Error loading bookmarked definitions:', error)
    }
  }

  const addToBookmarksStorage = (word: string, pos: string, definition: string): void => {
    try {
      const newItem = {
        word: word.toLowerCase(),
        pos,
        definition,
        timestamp: new Date().toISOString()
      }

      const stored = localStorage.getItem('definitionBookmarks')
      let currentBookmarks: Array<{word: string, pos: string, definition: string, timestamp: string}> = []

      if (stored) {
        currentBookmarks = JSON.parse(stored)
      }

      // Remove duplicates (same word, pos, and definition)
      const filteredBookmarks = currentBookmarks.filter(item =>
        !(item.word === word.toLowerCase() && item.pos === pos && item.definition === definition)
      )

      // Add new item at the beginning
      const updatedBookmarks = [newItem, ...filteredBookmarks]

      // Keep only the last 100 bookmarks
      const trimmedBookmarks = updatedBookmarks.slice(0, 100)

      localStorage.setItem('definitionBookmarks', JSON.stringify(trimmedBookmarks))
      loadBookmarkedDefinitions() // Reload to update the display
    } catch (error) {
      console.error('Error saving to bookmarks:', error)
    }
  }

  const removeFromBookmarksStorage = (word: string, pos: string, definition: string): void => {
    try {
      const stored = localStorage.getItem('definitionBookmarks')
      if (stored) {
        const currentBookmarks = JSON.parse(stored) as Array<{word: string, pos: string, definition: string, timestamp: string}>
        const filteredBookmarks = currentBookmarks.filter(item =>
          !(item.word === word.toLowerCase() && item.pos === pos && item.definition === definition)
        )

        localStorage.setItem('definitionBookmarks', JSON.stringify(filteredBookmarks))
        loadBookmarkedDefinitions() // Reload to update the display
      }
    } catch (error) {
      console.error('Error removing from bookmarks:', error)
    }
  }

  const clearAllBookmarksStorage = (): void => {
    try {
      localStorage.removeItem('definitionBookmarks')
      setBookmarkedDefinitions(new Set())
    } catch (error) {
      console.error('Error clearing bookmarks:', error)
    }
  }

  // Expose functions globally for Bookmarks component to use
  useEffect(() => {
    ;(window as any).clearAllBookmarks = clearAllBookmarksStorage
    return () => {
      delete (window as any).clearAllBookmarks
    }
  }, [])

  const performSearch = async (searchQuery: string): Promise<void> => {
    if (!db || !searchQuery.trim()) return

    setError('')
    setDefinitions([])
    setWordTitle('')
    setInfo('Searching...')

    try {
      const tableName = 'words'
      const stmtExact = db.prepare(`SELECT word, pos, definition FROM "${tableName}" WHERE lower(word) = $w;`)

      const rows: Definition[] = []
      stmtExact.bind({$w: searchQuery.toLowerCase()})
      while(stmtExact.step()){
        const row = stmtExact.getAsObject() as unknown as Definition
        rows.push(row)
      }
      stmtExact.reset()

      setDefinitions(rows)
      setWordTitle(searchQuery)
      setInfo('')
      if(rows.length === 0) setInfo('No definitions found')

      // Add search to history
      if ((window as any).addToSearchHistory) {
        (window as any).addToSearchHistory(searchQuery)
      }
    } catch(err){
      console.error(err)
      setError('Search error: ' + (err as Error).message)
      setInfo('')
    }
  }

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!db || !query.trim()) return

    // Update URL with query parameter
    const url = new URL(window.location.href)
    url.searchParams.set('word', query)
    window.history.pushState({}, '', url.toString())

    await performSearch(query)
  }

  const handleNavTitleClick = (): void => {
    // Clear all query parameters from URL
    const url = new URL(window.location.href)
    url.searchParams.delete('word')
    window.history.pushState({}, '', url.toString())

    // Clear search state
    setQuery('')
    setDefinitions([])
    setWordTitle('')
    setInfo('')
    setError('')
    setActiveTab('history')
  }

  const handleNavItemClick = (item: string): void => {
    // Clear all query parameters from URL
    const url = new URL(window.location.href)
    url.searchParams.delete('word')
    window.history.pushState({}, '', url.toString())

    // Clear search state when switching tabs
    setQuery('')
    setDefinitions([])
    setWordTitle('')
    setInfo('')
    setError('')
    setActiveTab(item)
  }

  const escapeHtml = (str: string | null | undefined): string => {
    if (str === null || str === undefined) return ''
    return String(str)
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#039;')
  }

  return (
    <div className="container">
      <nav>
        <div className="nav-content">
          <a
            href="https://github.com/lukew3/aard2-web-offline"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
            aria-label="View on GitHub"
          >
            <i className="fab fa-github"></i>
          </a>
          <h1 id="navTitle" onClick={handleNavTitleClick} style={{cursor: 'pointer'}}>Offline Dictionary</h1>
        </div>
      </nav>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter exact word"
          required
        />
        <button type="submit" disabled={isLoading}>Search</button>
      </form>

      {isLoading && (
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{width: `${progress}%`}}></div>
          </div>
          <div className="progress-text">{Math.round(progress)}%</div>
        </div>
      )}

      <div id="info">{info}</div>
      <div id="error" role="alert" aria-live="assertive">{error}</div>

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

      {/* Show search history when history tab is active */}
      {activeTab === 'history' && (
        <SearchHistory onWordClick={(word) => {
          // Update URL with query parameter
          const url = new URL(window.location.href)
          url.searchParams.set('word', word)
          window.history.pushState({}, '', url.toString())

          setQuery(word)
          performSearch(word)
          setActiveTab('search')
        }} />
      )}

      {/* Show bookmarks when bookmarks tab is active */}
      {activeTab === 'bookmarks' && (
        <Bookmarks onWordClick={(word) => {
          // Update URL with query parameter
          const url = new URL(window.location.href)
          url.searchParams.set('word', word)
          window.history.pushState({}, '', url.toString())

          setQuery(word)
          performSearch(word)
          setActiveTab('search')
        }} />
      )}

      <BottomNavbar activeTab={activeTab} onNavItemClick={handleNavItemClick} />
    </div>
  )
}

export default App