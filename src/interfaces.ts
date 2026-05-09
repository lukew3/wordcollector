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

export interface DatabaseInfo {
  id: string
  name: string
  url: string
  filename: string
  size: string
  description: string
  downloaded: boolean
  enabled: boolean
  lastUpdated?: string
}

export interface DownloadProgress {
  loaded: number
  total: number
  percentage: number
}
