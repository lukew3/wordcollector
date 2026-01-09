import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import './QueryResults.css'
import { Definition, Database } from '../../interfaces'
import DefinitionComponent from '../../components/Definition/Definition'
import { performSearch, formatWordForDisplay } from '../../utils'
import { useAtom } from 'jotai'
import { historyAtom } from '../../atoms'

interface QueryResultsProps {
  escapeHtml: (str: string | null | undefined) => string
  definitions: Definition[]
  wordTitle: string
  db: Database | null
  setError: (error: string) => void
  setInfo: (info: string) => void
  setDefinitions: (definitions: Definition[]) => void
  setWordTitle: (title: string) => void
}

const QueryResults = ({
  escapeHtml,
  definitions,
  wordTitle,
  db,
  setError,
  setInfo,
  setDefinitions,
  setWordTitle
}: QueryResultsProps) => {
  const { word } = useParams<{ word: string }>()
  const [history, setHistory] = useAtom(historyAtom)
  const searchedWord = useRef<string | null>(null)

  useEffect(() => {
    const decodedWord = word ? decodeURIComponent(word) : null
    
    // Only search if we have a word, database, and haven't searched for this word yet
    if (decodedWord && db && searchedWord.current !== decodedWord) {
      searchedWord.current = decodedWord
      performSearch(decodedWord, db, setError, setInfo, setDefinitions, setWordTitle, history, setHistory)
    }
  }, [word, db])

  const displayWord = word ? formatWordForDisplay(decodeURIComponent(word)) : formatWordForDisplay(wordTitle)

  return (
    <>
      {displayWord && <h2>{displayWord}</h2>}
      <div id="definitionList" aria-live="polite">
        {definitions.map((def, index) => 
          <DefinitionComponent
            key={index}
            definition={def}
            index={index}
            escapeHtml={escapeHtml}
          />
        )}
      </div>
    </>
  )
}

export default QueryResults