export interface MediaItem {
    url: string
    type: 'image' | 'video'
    contentType?: string
}

export interface CacheProgress {
    url: string
    progress: number // 0-100
    status: 'pending' | 'downloading' | 'completed' | 'error'
    error?: string
}

export interface MediaCacheAdapter {
    // Cache a single media item
    cacheItem(item: MediaItem): Promise<void>
    
    // Cache multiple media items with progress tracking
    cacheItems(items: MediaItem[], onProgress?: (progress: CacheProgress) => void): Promise<void>
    
    // Get a cached item - returns local URL/path
    getItem(url: string): Promise<string | null>
    
    // Check if an item is cached
    hasItem(url: string): Promise<boolean>
    
    // Remove an item from cache
    removeItem(url: string): Promise<void>
    
    // Clear all cached items
    clear(): Promise<void>
    
    // Get cache size in bytes
    getSize(): Promise<number>
} 