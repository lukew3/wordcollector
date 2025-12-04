export const addToBookmarks = (word: string, pos: string, definition: string): void => {
  try {
    const newItem = {
      word: word.toLowerCase(),
      pos,
      definition,
      timestamp: new Date().toISOString()
    }

    const stored = localStorage.getItem('definitionBookmarks')
    let currentBookmarks: Array<{word: string, pos: string, definition: string, timestamp: string}> = []

    if (stored) {
      currentBookmarks = JSON.parse(stored)
    }

    // Remove duplicates (same word, pos, and definition)
    const filteredBookmarks = currentBookmarks.filter(item =>
      !(item.word === word.toLowerCase() && item.pos === pos && item.definition === definition)
    )

    // Add new item at the beginning
    const updatedBookmarks = [newItem, ...filteredBookmarks]

    // Keep only the last 100 bookmarks
    const trimmedBookmarks = updatedBookmarks.slice(0, 100)

    localStorage.setItem('definitionBookmarks', JSON.stringify(trimmedBookmarks))
  } catch (error) {
    console.error('Error saving to bookmarks:', error)
  }
}

export const removeFromBookmarks = (word: string, pos: string, definition: string): void => {
  try {
    const stored = localStorage.getItem('definitionBookmarks')
    if (stored) {
      const currentBookmarks = JSON.parse(stored) as Array<{word: string, pos: string, definition: string, timestamp: string}>
      const filteredBookmarks = currentBookmarks.filter(item =>
        !(item.word === word.toLowerCase() && item.pos === pos && item.definition === definition)
      )

      localStorage.setItem('definitionBookmarks', JSON.stringify(filteredBookmarks))
    }
  } catch (error) {
    console.error('Error removing from bookmarks:', error)
  }
}

export const loadBookmarkedDefinitions = (): Set<string> => {
  try {
    const stored = localStorage.getItem('definitionBookmarks')
    if (stored) {
      const bookmarks = JSON.parse(stored) as Array<{word: string, pos: string, definition: string}>
      return new Set(bookmarks.map(b => `${b.word}-${b.pos}-${b.definition}`))
    }
  } catch (error) {
    console.error('Error loading bookmarked definitions:', error)
  }
  return new Set()
}

export const clearAllBookmarks = (): void => {
  try {
    localStorage.removeItem('definitionBookmarks')
  } catch (error) {
    console.error('Error clearing bookmarks:', error)
  }
}