import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useSearchParams } from 'react-router-dom'
import initSqlJs from 'sql.js'
import SearchHistory from '../../pages/SearchHistory/SearchHistory'
import Bookmarks from '../../pages/Bookmarks/Bookmarks'
import Study from '../../pages/Study/Study'
import BottomNavbar from '../../components/BottomNavbar/BottomNavbar'
import Settings from '../../pages/Settings/Settings'
import QueryResults from '../../pages/QueryResults/QueryResults'
import SearchBar from '../../components/SearchBar/SearchBar'

import { Definition, Database } from '../../interfaces'

const AppContent = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [error, setError] = useState<string>('')
  const [info, setInfo] = useState<string>('')
  const [definitions, setDefinitions] = useState<Definition[]>([])
  const [wordTitle, setWordTitle] = useState<string>('')
  const [db, setDb] = useState<Database | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [progress, setProgress] = useState<number>(0)

  const activeTab = window.location.pathname.slice(1) || 'history'

  useEffect(() => {
    loadDatabase()
  }, [])

  // Handle legacy query parameter - redirect to word route if needed
  useEffect(() => {
    const wordParam = searchParams.get('word')
    if (wordParam && !isLoading && !window.location.pathname.startsWith('/word/')) {
      navigate(`/word/${wordParam}`)
    }
  }, [searchParams, isLoading, navigate])

  const loadDatabase = async (): Promise<void> => {
    try {
      setIsLoading(true)
      setProgress(0)

      const SQL = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`
      })

      setProgress(10)

      let buffer: Uint8Array

      try {
        const cacheResponse = await caches.match('wordnetFull.db')
        if (cacheResponse) {
          const cachedArrayBuffer = await cacheResponse.arrayBuffer()
          const tempBuffer = new Uint8Array(cachedArrayBuffer)
          buffer = new Uint8Array(tempBuffer.length)
          buffer.set(tempBuffer)
          setProgress(80)
        } else {
          throw new Error('Database not in cache')
        }
      } catch (cacheError) {
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

      setProgress(90)

      const database = new SQL.Database(buffer as any)
      setDb(database as unknown as Database)
      
      setProgress(100)
      setIsLoading(false)
    } catch (e) {
      setError('Error loading database')
      setIsLoading(false)
      console.error(e)
    }
  }

  const handleNavItemClick = (item: string): void => {
    // Clear search state when switching tabs
    setDefinitions([])
    setWordTitle('')
    setInfo('')
    setError('')
    
    // Navigate to the new route and clear word search param
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('word')
    setSearchParams(newParams)
    
    navigate(`/${item}`)
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

  const handleWordClick = (word: string) => {
    // Navigate to word route - QueryResults component will handle search
    navigate(`/word/${encodeURIComponent(word)}`)
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
            onClick={() => navigate('/settings')}
            aria-label="Settings"
          >
            <i className="fas fa-cog"></i>
          </button>
        </div>
      </nav>

      <SearchBar
        db={db}
        isLoading={isLoading}
      />

      {isLoading && (
        <div className="progress-container">
          <div className="progress-text">Loading database ({Math.round(progress)}%)</div>
        </div>
      )}

      <div id="info">{info}</div>
      <div id="error" role="alert" aria-live="assertive">{error}</div>

      <Routes>
        <Route path="/" element={<SearchHistory onWordClick={handleWordClick} />} />
        <Route path="/history" element={<SearchHistory onWordClick={handleWordClick} />} />
        <Route path="/bookmarks" element={<Bookmarks onWordClick={handleWordClick} />} />
        <Route path="/study" element={<Study db={db} onWordClick={handleWordClick} />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/word/:word" element={
          <QueryResults
            escapeHtml={escapeHtml}
            definitions={definitions}
            wordTitle={wordTitle}
            db={db}
            setError={setError}
            setInfo={setInfo}
            setDefinitions={setDefinitions}
            setWordTitle={setWordTitle}
          />
        } />
      </Routes>

      <BottomNavbar activeTab={activeTab} onNavItemClick={handleNavItemClick} />
    </div>
  )
}

export default AppContent