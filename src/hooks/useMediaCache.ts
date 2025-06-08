import { useState, useCallback, useRef } from 'react'
import type { MediaItem } from '../types/cache'
import { BrowserMediaCacheAdapter } from '../adapters/BrowserMediaCacheAdapter'

export interface MediaCacheAdapter {
    cacheMedia: (items: MediaItem[], signal?: AbortSignal) => Promise<Map<string, boolean>>
    getMediaUrl: (url: string) => Promise<string | null>
    clearCache: () => Promise<void>
    removeUnusedMedia: (currentUrls: string[]) => Promise<void>
}

export function useMediaCache() {
    const [isLoading, setIsLoading] = useState(false)
    const adapter = useRef<MediaCacheAdapter>(new BrowserMediaCacheAdapter())

    const cacheMedia = useCallback(async (items: MediaItem[], signal?: AbortSignal) => {
        setIsLoading(true)
        try {
            return await adapter.current.cacheMedia(items, signal)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const getMediaUrl = useCallback(async (url: string) => {
        return adapter.current.getMediaUrl(url)
    }, [])

    const clearCache = useCallback(async () => {
        return adapter.current.clearCache()
    }, [])

    const removeUnusedMedia = useCallback(async (currentUrls: string[]) => {
        return adapter.current.removeUnusedMedia(currentUrls)
    }, [])

    return {
        cacheMedia,
        getMediaUrl,
        clearCache,
        removeUnusedMedia,
        isLoading
    }
} 