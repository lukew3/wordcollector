import { Definition, Database, SearchHistoryItem } from './interfaces'

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