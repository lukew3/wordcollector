export const clearDatabaseCache = async (): Promise<void> => {
  try {
    const cacheNames = await caches.keys()
    const dbCacheName = 'offline-dictionary-db-v1'
    
    for (const cacheName of cacheNames) {
      if (cacheName === dbCacheName) {
        await caches.delete(cacheName)
        console.log('Database cache cleared')
        break
      }
    }
  } catch (error) {
    console.error('Error clearing database cache:', error)
    throw error
  }
}

export const getDatabaseCacheInfo = async (): Promise<{ cached: boolean; size?: number }> => {
  try {
    const cacheResponse = await caches.match('wordnetFull.db')
    if (cacheResponse) {
      const contentLength = cacheResponse.headers.get('content-length')
      return {
        cached: true,
        size: contentLength ? parseInt(contentLength, 10) : undefined
      }
    }
    return { cached: false }
  } catch (error) {
    console.error('Error checking database cache info:', error)
    return { cached: false }
  }
}

export const forceRefreshDatabase = async (): Promise<void> => {
  try {
    await clearDatabaseCache()
    const cache = await caches.open('offline-dictionary-db-v1')
    const response = await fetch('wordnetFull.db')
    if (response.ok) {
      await cache.put('wordnetFull.db', response)
      console.log('Database cache refreshed')
    }
  } catch (error) {
    console.error('Error refreshing database cache:', error)
    throw error
  }
}