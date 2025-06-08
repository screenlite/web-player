import type { MediaItem, MediaCacheAdapter, CacheProgress } from '../types/cache'

const CACHE_NAME = 'screenlite-media-cache-v1'
const METADATA_KEY = 'screenlite-media-metadata'

interface CacheMetadata {
    [url: string]: {
        type: 'image' | 'video'
        contentType: string
        size: number
        cachedAt: number
    }
}

export class BrowserMediaCacheAdapter implements MediaCacheAdapter {
    private async getMetadata(): Promise<CacheMetadata> {
        const data = localStorage.getItem(METADATA_KEY)
        return data ? JSON.parse(data) : {}
    }

    private async setMetadata(metadata: CacheMetadata): Promise<void> {
        localStorage.setItem(METADATA_KEY, JSON.stringify(metadata))
    }

    private async updateMetadata(url: string, data: CacheMetadata[string]): Promise<void> {
        const metadata = await this.getMetadata()
        metadata[url] = data
        await this.setMetadata(metadata)
    }

    async cacheItem(item: MediaItem): Promise<void> {
        const cache = await caches.open(CACHE_NAME)
        
        // First check if we already have this item
        if (await this.hasItem(item.url)) {
            return
        }

        try {
            const response = await fetch(item.url)
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
            
            const contentType = response.headers.get('content-type') || item.contentType || 'application/octet-stream'
            const size = parseInt(response.headers.get('content-length') || '0', 10)

            // Store the response in the cache
            await cache.put(item.url, response.clone())

            // Store metadata
            await this.updateMetadata(item.url, {
                type: item.type,
                contentType,
                size,
                cachedAt: Date.now()
            })
        } catch (error) {
            console.error(`Failed to cache item: ${item.url}`, error)
            throw error
        }
    }

    async cacheItems(items: MediaItem[], onProgress?: (progress: CacheProgress) => void): Promise<void> {
        const total = items.length
        let completed = 0

        for (const item of items) {
            try {
                onProgress?.({
                    url: item.url,
                    progress: (completed / total) * 100,
                    status: 'downloading'
                })

                await this.cacheItem(item)
                completed++

                onProgress?.({
                    url: item.url,
                    progress: (completed / total) * 100,
                    status: 'completed'
                })
            } catch (error) {
                onProgress?.({
                    url: item.url,
                    progress: (completed / total) * 100,
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error'
                })
            }
        }
    }

    async getItem(url: string): Promise<string | null> {
        const cache = await caches.open(CACHE_NAME)
        const response = await cache.match(url)
        
        if (!response) return null

        // For browsers that support it, create a blob URL
        if (window.URL && response.blob) {
            const blob = await response.blob()
            return URL.createObjectURL(blob)
        }

        // Fallback to the original URL if we can't create a blob URL
        return url
    }

    async hasItem(url: string): Promise<boolean> {
        const cache = await caches.open(CACHE_NAME)
        const response = await cache.match(url)
        return !!response
    }

    async removeItem(url: string): Promise<void> {
        const cache = await caches.open(CACHE_NAME)
        await cache.delete(url)

        // Remove metadata
        const metadata = await this.getMetadata()
        delete metadata[url]
        await this.setMetadata(metadata)
    }

    async clear(): Promise<void> {
        await caches.delete(CACHE_NAME)
        localStorage.removeItem(METADATA_KEY)
    }

    async getSize(): Promise<number> {
        const metadata = await this.getMetadata()
        return Object.values(metadata).reduce((total, item) => total + item.size, 0)
    }
} 