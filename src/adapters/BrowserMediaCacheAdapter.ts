import type { MediaItem } from '../types/cache'
import type { MediaCacheAdapter } from '../hooks/useMediaCache'

export class BrowserMediaCacheAdapter implements MediaCacheAdapter {
    private cache: Cache | null = null
    private CACHE_NAME = 'media-cache-v1'

    constructor() {
        this.initCache()
    }

    private async initCache() {
        if ('caches' in window) {
            this.cache = await caches.open(this.CACHE_NAME)
        }
    }

    async cacheMedia(items: MediaItem[], signal?: AbortSignal): Promise<Map<string, boolean>> {
        if (!this.cache) {
            throw new Error('Cache not available')
        }

        const results = new Map<string, boolean>()

        for (const item of items) {
            if (signal?.aborted) {
                break
            }

            try {
                const response = await fetch(item.url, { signal })
                if (response.ok) {
                    await this.cache.put(item.url, response.clone())
                    results.set(item.url, true)
                } else {
                    results.set(item.url, false)
                }
            } catch (error) {
                results.set(item.url, false)
                console.error(`Failed to cache ${item.url}:`, error)
            }
        }

        return results
    }

    async getMediaUrl(url: string): Promise<string | null> {
        if (!this.cache) {
            return null
        }

        const response = await this.cache.match(url)
        if (response) {
            return url
        }
        return null
    }

    async clearCache(): Promise<void> {
        if ('caches' in window) {
            await caches.delete(this.CACHE_NAME)
            this.cache = await caches.open(this.CACHE_NAME)
        }
    }

    async removeUnusedMedia(currentUrls: string[]): Promise<void> {
        if (!this.cache) {
            return
        }

        const urlSet = new Set(currentUrls)
        const keys = await this.cache.keys()
        
        for (const request of keys) {
            if (!urlSet.has(request.url)) {
                await this.cache.delete(request)
            }
        }
    }
} 