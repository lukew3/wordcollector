import { useState, useEffect } from 'react'
import initSqlJs from 'sql.js'
import './App.css'
import SearchHistory from './pages/SearchHistory/SearchHistory'
import Bookmarks from './pages/Bookmarks/Bookmarks'
import BottomNavbar from './components/BottomNavbar/BottomNavbar'
import Settings from './pages/Settings/Settings'
import QueryResults from './pages/QueryResults/QueryResults'
import SearchBar from './components/SearchBar/SearchBar'
import { performSearch } from './searchUtils'

import { Definition, Database } from './interfaces'

function App() {
  const [query, setQuery] = useState<string>('')
  const [info, setInfo] = useState<string>('Loading database...')
  const [error, setError] = useState<string>('')
  const [definitions, setDefinitions] = useState<Definition[]>([])
  const [wordTitle, setWordTitle] = useState<string>('')
  const [db, setDb] = useState<Database | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [progress, setProgress] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<string>('history')


  useEffect(() => {
    loadDatabase()
  }, [])


  useEffect(() => {
    // Check for query parameter on page load
    const urlParams = new URLSearchParams(window.location.search)
    const searchWord = urlParams.get('word')
    if (searchWord && db && !isLoading) {
      setQuery(searchWord)
      performSearch(searchWord, db, setError, setInfo, setActiveTab, setDefinitions, setWordTitle)
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
          <h1 id="navTitle" onClick={() => handleNavItemClick('history')} style={{cursor: 'pointer'}}>Word Collector</h1>
          <button
            className="settings-icon"
            onClick={() => setActiveTab('settings')}
            aria-label="Settings"
          >
            <i className="fas fa-cog"></i>
          </button>
        </div>
      </nav>

      <SearchBar
        db={db}
        isLoading={isLoading}
        setError={setError}
        setInfo={setInfo}
        setActiveTab={setActiveTab}
        setDefinitions={setDefinitions}
        setWordTitle={setWordTitle}
        setQuery={setQuery}
      />

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

      {activeTab === 'queryResults' && (
        <QueryResults
          escapeHtml={escapeHtml}
          definitions={definitions}
          wordTitle={wordTitle}
        />
      )}

      {/* Show search history when history tab is active */}
      {activeTab === 'history' && (
        <SearchHistory onWordClick={(word: string) => {
          // Update URL with query parameter
          const url = new URL(window.location.href)
          url.searchParams.set('word', word)
          window.history.pushState({}, '', url.toString())

          setQuery(word)
          performSearch(word, db, setError, setInfo, setActiveTab, setDefinitions, setWordTitle)
        }} />
      )}

      {/* Show bookmarks when bookmarks tab is active */}
      {activeTab === 'bookmarks' && (
        <Bookmarks onWordClick={(word: string) => {
          // Update URL with query parameter
          const url = new URL(window.location.href)
          url.searchParams.set('word', word)
          window.history.pushState({}, '', url.toString())

          setQuery(word)
          performSearch(word, db, setError, setInfo, setActiveTab, setDefinitions, setWordTitle)
        }} />
      )}

      {/* Show settings when settings tab is active */}
      {activeTab === 'settings' && <Settings />}

      {/* Show study placeholder when study tab is active */}
      {activeTab === 'study' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#666', fontSize: '1.2em' }}>
          Study mode coming soon...
        </div>
      )}

      <BottomNavbar activeTab={activeTab} onNavItemClick={handleNavItemClick} />
    </div>
  )
}

export default App