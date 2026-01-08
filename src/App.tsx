import { useState, useEffect } from 'react'
import initSqlJs from 'sql.js'
import './App.css'
import SearchHistory from './pages/SearchHistory/SearchHistory'
import Bookmarks from './pages/Bookmarks/Bookmarks'
import Study from './pages/Study/Study'
import BottomNavbar from './components/BottomNavbar/BottomNavbar'
import Settings from './pages/Settings/Settings'
import QueryResults from './pages/QueryResults/QueryResults'
import SearchBar from './components/SearchBar/SearchBar'
import { performSearch } from './utils'

import { Definition, Database } from './interfaces'

function App() {
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

  const loadDatabase = async (): Promise<void> => {
    try {
      setInfo('Initializing SQL.js...')
      setIsLoading(true)
      setProgress(0)

      const SQL = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`
      })

      setInfo('Loading database from cache...')
      setProgress(10)

      let buffer: Uint8Array
      let fromCache = false

      try {
        const cacheResponse = await caches.match('wordnetFull.db')
        if (cacheResponse) {
          setInfo('Loading database from service worker cache...')
          const cachedArrayBuffer = await cacheResponse.arrayBuffer()
          const tempBuffer = new Uint8Array(cachedArrayBuffer)
          buffer = new Uint8Array(tempBuffer.length)
          buffer.set(tempBuffer)
          fromCache = true
          setProgress(80)
        } else {
          throw new Error('Database not in cache')
        }
      } catch (cacheError) {
        setInfo('Database not cached, fetching from network...')
        setProgress(20)

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
          const percent = total > 0 ? Math.min((loaded / total) * 60 + 20, 80) : Math.min(loaded / 1000000 * 10 + 20, 80)
          setProgress(percent)
        }

        buffer = new Uint8Array(loaded)
        let offset = 0
        for (const chunk of chunks) {
          buffer.set(chunk, offset)
          offset += chunk.length
        }
      }

      setInfo('Initializing database...')
      setProgress(90)

      const database = new SQL.Database(buffer as any)
      setDb(database as unknown as Database)
      
      const cacheStatus = fromCache ? ' (from cache)' : ' (from network)'
      setInfo(`Database loaded${cacheStatus}.`)
      setProgress(100)
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

          performSearch(word, db, setError, setInfo, setActiveTab, setDefinitions, setWordTitle)
        }} />
      )}

      {/* Show settings when settings tab is active */}
      {activeTab === 'settings' && <Settings />}

      {/* Show study when study tab is active */}
      {activeTab === 'study' && <Study />}

      <BottomNavbar activeTab={activeTab} onNavItemClick={handleNavItemClick} />
    </div>
  )
}

export default App