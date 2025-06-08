import { useEffect, useState, useCallback } from 'react'
import type { MediaItem, MediaCacheAdapter, CacheProgress } from '../types/cache'
import { BrowserMediaCacheAdapter } from '../adapters/BrowserMediaCacheAdapter'

// Create adapter based on environment
const createAdapter = (): MediaCacheAdapter => {
    return new BrowserMediaCacheAdapter()
}

export const useMediaCache = () => {
    const [adapter] = useState<MediaCacheAdapter>(() => createAdapter())
    const [cacheSize, setCacheSize] = useState<number>(0)
    const [isLoading, setIsLoading] = useState(false)
    const [progress, setProgress] = useState<CacheProgress[]>([])

    // Update cache size periodically
    useEffect(() => {
        const updateSize = async () => {
            const size = await adapter.getSize()
            setCacheSize(size)
        }

        updateSize()
        const interval = setInterval(updateSize, 60000) // Update every minute
        return () => clearInterval(interval)
    }, [adapter])

    const cacheMedia = useCallback(async (items: MediaItem[]) => {
        setIsLoading(true)
        setProgress([])

        try {
            await adapter.cacheItems(items, (itemProgress) => {
                setProgress(prev => {
                    const existing = prev.findIndex(p => p.url === itemProgress.url)
                    if (existing >= 0) {
                        const newProgress = [...prev]
                        newProgress[existing] = itemProgress
                        return newProgress
                    }
                    return [...prev, itemProgress]
                })
            })
        } finally {
            setIsLoading(false)
        }
    }, [adapter])

    const getMediaUrl = useCallback(async (url: string) => {
        return adapter.getItem(url)
    }, [adapter])

    const clearCache = useCallback(async () => {
        setIsLoading(true)
        try {
            await adapter.clear()
            setCacheSize(0)
            setProgress([])
        } finally {
            setIsLoading(false)
        }
    }, [adapter])

    return {
        cacheMedia,
        getMediaUrl,
        clearCache,
        cacheSize,
        isLoading,
        progress
    }
} 