import './QueryResults.css'
import { Definition } from '../../interfaces'
import DefinitionComponent from '../../components/Definition/Definition'

interface QueryResultsProps {
  escapeHtml: (str: string | null | undefined) => string
  definitions: Definition[]
  wordTitle: string
}

const QueryResults = ({
  escapeHtml,
  definitions,
  wordTitle
}: QueryResultsProps) => {
  return (
    <>
      {wordTitle && <h2>{wordTitle}</h2>}
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