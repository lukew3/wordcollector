import { useAtom } from 'jotai'
import { Definition, Database, SearchHistoryItem } from './interfaces'
import { bookmarksAtom } from './atoms'

export const performSearch = async (
  searchQuery: string,
  db: Database | null,
  setError: (error: string) => void,
  setInfo: (info: string) => void,
  setActiveTab: (tab: string) => void,
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
  setActiveTab('queryResults')

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