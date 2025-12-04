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

export interface SearchHistoryItem {
  word: string
  timestamp: string
}

export interface BookmarkedDefinition {
  word: string
  pos: string
  definition: string
  timestamp: string
}

export interface BottomNavbarProps {
  activeTab?: string
  onNavItemClick: (item: string) => void
}

export interface SearchHistoryProps {
  onWordClick: (word: string) => void
}

export interface BookmarksProps {
  onWordClick: (word: string) => void
}

export interface QueryResultsProps {
  bookmarkedDefinitions: Set<string>
  toggleBookmark: (word: string, pos: string, definition: string) => void
  escapeHtml: (str: string | null | undefined) => string
  definitions: Definition[]
  wordTitle: string
}
