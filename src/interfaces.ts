export interface Definition {
  word: string
  pos: string
  definition: string
}

export interface Database {
  prepare: (sql: string) => Statement
}

export interface Statement {
  bind: (params: Record<string, any>) => void
  step: () => boolean
  getAsObject: () => Definition
  reset: () => void
}

export type HistoryCategory = 'search' | 'link' | 'book' | 'random' | 'history-click'

export interface SearchHistoryItem {
  word: string
  timestamp: string
  category: HistoryCategory
}
