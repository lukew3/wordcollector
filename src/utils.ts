import { Definition, Database, SearchHistoryItem } from './interfaces'

export const performSearch = async (
  searchQuery: string,
  db: Database | null,
  setError: (error: string) => void,
  setInfo: (info: string) => void,
  setDefinitions: (definitions: Definition[]) => void,
  setWordTitle: (title: string) => void,
  history?: SearchHistoryItem[],
  setHistory?: any
): Promise<void> => {
  if (!db || !searchQuery.trim()) return

  setError('')
  setDefinitions([])
  setWordTitle('')
  setInfo('Searching...')
  // No longer need setActiveTab since we use React Router navigation

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
    if (rows.length === 0) {
      setInfo('No definitions found')
    } else if (history && setHistory) {
      // Add to search history if results were found and history is available (search bar, not history tab)
      const newHistoryItem: SearchHistoryItem = {
        word: searchQuery,
        timestamp: new Date().toISOString()
      }
      const newHistory = [newHistoryItem, ...history];
      setHistory(newHistory);
    }
  } catch(err){
    console.error(err)
    setError('Search error: ' + (err as Error).message)
    setInfo('')
  }
}

export const removeBookmark = (bookmarks: Record<string, string[]>, word: string, definition: string) => {
  // if word is found and definition is found in the word's bookmarks, update bookmarks with that entry removed
  // if that was the words only entry, remove the word from bookmarks entirely
  if (bookmarks[word] && bookmarks[word].includes(definition)) {
    const newBookmarks = bookmarks[word].filter(def => def !== definition)
    if (newBookmarks.length === 0) {
      const { [word]: _, ...rest } = bookmarks
      return rest;
    } else {
      return {
        ...bookmarks,
        [word]: newBookmarks
      }
    }
  } else {
    console.error('Bookmark not found')
  }
  return bookmarks
}

export const addBookmark = (bookmarks: Record<string, string[]>, word: string, definition: string) => {
  return {
    ...bookmarks,
    [word]: [...(bookmarks[word] || []), definition]
  }
}

export const checkBookmarked = (bookmarks: Record<string, string[]>, word: string, definition: string) => {
  return bookmarks[word] && bookmarks[word].includes(definition)
}

export const getDefinitionsForWord = (db: Database | null, word: string): Definition[] => {
  if (!db) return []
  
  try {
    const stmt = db.prepare(`SELECT word, pos, definition FROM "words" WHERE lower(word) = $w;`)
    const rows: Definition[] = []
    stmt.bind({$w: word.toLowerCase()})
    while(stmt.step()){
      const row = stmt.getAsObject() as unknown as Definition
      rows.push(row)
    }
    stmt.reset()
    return rows
  } catch(err) {
    console.error('Error fetching definitions for word:', word, err)
    return []
  }
}

export const getDefinitionsForWords = (db: Database | null, words: string[]): Record<string, Definition[]> => {
  if (!db || words.length === 0) return {}
  
  try {
    // Create a batch query using IN clause
    const placeholders = words.map((_, index) => `$w${index}`).join(',')
    const stmt = db.prepare(`SELECT word, pos, definition FROM "words" WHERE lower(word) IN (${placeholders});`)
    
    // Bind all words to the statement
    const bindParams: Record<string, string> = {}
    words.forEach((word, index) => {
      bindParams[`$w${index}`] = word.toLowerCase()
    })
    stmt.bind(bindParams)
    
    // Group results by word
    const results: Record<string, Definition[]> = {}
    while(stmt.step()){
      const row = stmt.getAsObject() as unknown as Definition
      const word = row.word.toLowerCase()
      if (!results[word]) {
        results[word] = []
      }
      results[word].push(row)
    }
    stmt.reset()
    return results
  } catch(err) {
    console.error('Error fetching definitions for words:', err)
    return {}
  }
}

export const getRandomWords = (db: Database | null, count: number = 50): Definition[] => {
  if (!db) return []
  
  try {
    const stmt = db.prepare(`SELECT word, pos, definition FROM "words" ORDER BY RANDOM() LIMIT ?;`)
    const rows: Definition[] = []
    stmt.bind([count])
    while(stmt.step()){
      const row = stmt.getAsObject() as unknown as Definition
      rows.push(row)
    }
    stmt.reset()
    return rows
  } catch(err) {
    console.error('Error fetching random words:', err)
    return []
  }
}

export const formatWordForDisplay = (word: string): string => {
  return word.replace(/_/g, ' ')
}