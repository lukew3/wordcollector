import { atomWithStorage } from 'jotai/utils'
import { SearchHistoryItem } from './interfaces'

export const historyAtom = atomWithStorage<SearchHistoryItem[]>('history', [])

export const bookmarksAtom = atomWithStorage<Record<string, string[]>>('bookmarks', {})
