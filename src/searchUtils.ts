import { Definition, Database, Statement } from './interfaces'

export const performSearch = async (
  searchQuery: string,
  db: Database | null,
  setError: (error: string) => void,
  setInfo: (info: string) => void,
  setActiveTab: (tab: string) => void,
  setDefinitions: (definitions: Definition[]) => void,
  setWordTitle: (title: string) => void
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
    } else {
      // Add to search history if results were found
      if ((window as any).addToSearchHistory) {
        ;(window as any).addToSearchHistory(searchQuery)
      }
    }
  } catch(err){
    console.error(err)
    setError('Search error: ' + (err as Error).message)
    setInfo('')
  }
}