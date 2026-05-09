const DB_CACHE_NAME = 'offline-dictionary-db-v1'

export const downloadDatabase = async (
  filename: string,
  onProgress?: (loaded: number, total: number, percentage: number) => void
): Promise<void> => {
  try {
    const response = await fetch(filename)

    if (!response.ok) {
      throw new Error(`Failed to download database: ${response.statusText}`)
    }

    const contentLength = response.headers.get('content-length')
    const total = contentLength ? parseInt(contentLength, 10) : 0
    let loaded = 0

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Response body is not readable')
    }

    const chunks: Uint8Array[] = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      chunks.push(value)
      loaded += value.length

      if (onProgress && total > 0) {
        onProgress(loaded, total, Math.round((loaded / total) * 100))
      }
    }

    // Reconstruct buffer and store in Cache API
    const buffer = new Uint8Array(loaded)
    let offset = 0
    for (const chunk of chunks) {
      buffer.set(chunk, offset)
      offset += chunk.length
    }

    const cache = await caches.open(DB_CACHE_NAME)
    const cachedResponse = new Response(buffer, {
      headers: { 'Content-Type': 'application/x-sqlite3' }
    })
    await cache.put(new Request('/' + filename), cachedResponse)

    console.log(`Database download completed: ${filename}`)
  } catch (error) {
    console.error('Error downloading database:', error)
    throw error
  }
}

export const deleteDatabaseFromCache = async (filename: string): Promise<boolean> => {
  const cache = await caches.open(DB_CACHE_NAME)
  return cache.delete(new Request('/' + filename))
}

export const isDatabaseCached = async (filename: string): Promise<boolean> => {
  const cache = await caches.open(DB_CACHE_NAME)
  const response = await cache.match(new Request('/' + filename))
  return !!response
}
