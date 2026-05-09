import { atomWithStorage } from 'jotai/utils'
import { SearchHistoryItem, DatabaseInfo } from './interfaces'
import { AVAILABLE_DATABASES } from './constants/databases'

export const historyAtom = atomWithStorage<SearchHistoryItem[]>('history', [])

export const bookmarksAtom = atomWithStorage<Record<string, string[]>>('bookmarks', {})

export const databasesAtom = atomWithStorage<DatabaseInfo[]>('databases', AVAILABLE_DATABASES)

export const activeDatabaseAtom = atomWithStorage<string>('activeDatabase', 'wordnet-full')

export const downloadProgressAtom = atomWithStorage<Record<string, { loaded: number; total: number }>>('downloadProgress', {})
