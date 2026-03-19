import type { Playlist } from '../types'
import { BrowserMediaCacheAdapter } from '../adapters/BrowserMediaCacheAdapter'

const LOCAL_STORAGE_KEY = 'cached_playlists'
const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY_MS = 2000

function arePlaylistsEqual(a: Playlist[], b: Playlist[]): boolean {
    const normalize = (playlists: Playlist[]) =>
        playlists.map(playlist => ({
            ...playlist,
            sections: playlist.sections?.map(section => ({
                ...section,
                items: section.items?.map(item => ({ ...item, content_path: undefined }))
            }))
        }))
    return JSON.stringify(normalize(a)) === JSON.stringify(normalize(b))
}

function extractMediaItems(playlists: Playlist[]): { url: string; type: 'image' | 'video' }[] {
    const items: { url: string; type: 'image' | 'video' }[] = []
    playlists.forEach(playlist => {
        playlist.sections?.forEach(section => {
            section.items?.forEach(item => {
                if (item.content_path && item.content_type) {
                    items.push({
                        url: item.content_path,
                        type: item.content_type === 'video' ? 'video' : 'image'
                    })
                }
            })
        })
    })
    return items
}

export interface CacheState {
    cachedPlaylists: Playlist[]
    isCaching: boolean
}

export class CacheService {
    private mediaAdapter = new BrowserMediaCacheAdapter()
    private abortController: AbortController | null = null
    private originalPlaylists: Playlist[] | null = null
    private failedItems = new Set<string>()
    private retryAttempts = new Map<string, number>()
    private _cachedPlaylists: Playlist[]
    private _isCaching = false

    onStateChange: ((state: CacheState) => void) | null = null

    constructor() {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY)
        this._cachedPlaylists = cached ? (JSON.parse(cached) as Playlist[]) : []
    }

    get cachedPlaylists(): Playlist[] {
        return this._cachedPlaylists
    }

    get isCaching(): boolean {
        return this._isCaching
    }

    private emit(): void {
        this.onStateChange?.({ cachedPlaylists: this._cachedPlaylists, isCaching: this._isCaching })
    }

    async processPlaylists(playlists: Playlist[] | null): Promise<void> {
        if (playlists === null) return
        if (!Array.isArray(playlists)) {
            console.warn('Invalid playlists data, skipping caching.')
            return
        }
        if (arePlaylistsEqual(playlists, this.originalPlaylists ?? [])) return

        this.abortController?.abort()
        this.abortController = new AbortController()
        this._isCaching = true
        this.emit()

        try {
            this.originalPlaylists = JSON.parse(JSON.stringify(playlists)) as Playlist[]
            const mediaItems = extractMediaItems(playlists)
            const currentUrls = new Set(mediaItems.map(i => i.url))

            await this.mediaAdapter.removeUnusedMedia(Array.from(currentUrls))

            this.failedItems.clear()
            this.retryAttempts.clear()

            const results = await this.mediaAdapter.cacheMedia(mediaItems, this.abortController.signal)
            results.forEach((success, url) => {
                if (!success) {
                    this.failedItems.add(url)
                    this.retryAttempts.set(url, 1)
                }
            })

            if (this.failedItems.size === 0) {
                await this.buildCachedPlaylists(playlists)
            } else {
                console.warn(`${this.failedItems.size} items failed to cache, will retry...`)
                this.scheduleRetry(playlists)
            }
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                console.log('Caching operation cancelled due to playlist update')
            } else {
                console.error('Failed to cache playlists and media:', err)
            }
        } finally {
            this._isCaching = false
            this.emit()
        }
    }

    private async buildCachedPlaylists(playlists: Playlist[]): Promise<void> {
        const updated = JSON.parse(JSON.stringify(playlists)) as Playlist[]
        for (const playlist of updated) {
            for (const section of playlist.sections ?? []) {
                for (const item of section.items ?? []) {
                    if (item.content_path) {
                        const cached = await this.mediaAdapter.getMediaUrl(item.content_path)
                        if (cached) item.content_path = cached
                    }
                }
            }
        }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
        this._cachedPlaylists = updated
        console.log('Playlists and media cached successfully')
        this.emit()
    }

    private scheduleRetry(playlists: Playlist[]): void {
        setTimeout(async () => {
            const toRetry = Array.from(this.failedItems).filter(
                url => (this.retryAttempts.get(url) ?? 0) < MAX_RETRY_ATTEMPTS
            )

            if (toRetry.length === 0) {
                console.error('Max retry attempts reached for some items')
                return
            }

            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS))

            const allItems = extractMediaItems(playlists)
            const items = toRetry.map(url => allItems.find(i => i.url === url)!).filter(Boolean)
            const results = await this.mediaAdapter.cacheMedia(items)

            results.forEach((success, url) => {
                if (success) {
                    this.failedItems.delete(url)
                } else {
                    this.retryAttempts.set(url, (this.retryAttempts.get(url) ?? 0) + 1)
                }
            })

            if (this.failedItems.size === 0) {
                await this.buildCachedPlaylists(playlists)
            }
        }, 0)
    }
}

export const cacheService = new CacheService()
