import { useEffect, useState, useRef, useCallback } from 'react'
import type { Playlist } from '../types'
import { useMediaCache } from './useMediaCache'

const LOCAL_STORAGE_KEY = 'cached_playlists'
const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY_MS = 2000

function arePlaylistsEqual(a: Playlist[], b: Playlist[]): boolean {
    const normalize = (playlists: Playlist[]) => {
        return playlists.map(playlist => ({
            ...playlist,
            sections: playlist.sections?.map(section => ({
                ...section,
                items: section.items?.map(item => ({
                    ...item,
                    content_path: undefined
                }))
            }))
        }))
    }
    return JSON.stringify(normalize(a)) === JSON.stringify(normalize(b))
}

function extractMediaItems(playlists: Playlist[]): { url: string; type: 'image' | 'video' }[] {
    const mediaItems: { url: string; type: 'image' | 'video' }[] = []

    playlists.forEach(playlist => {
        playlist.sections?.forEach(section => {
            section.items?.forEach(item => {
                if (item.content_path && item.content_type) {
                    mediaItems.push({
                        url: item.content_path,
                        type: item.content_type === 'video' ? 'video' : 'image'
                    })
                }
            })
        })
    })

    return mediaItems
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export function useCachedData(playlists: Playlist[] | null) {
    const [cachedPlaylists, setCachedPlaylists] = useState<Playlist[]>(() => {
        const cachedRaw = localStorage.getItem(LOCAL_STORAGE_KEY)
        return cachedRaw ? JSON.parse(cachedRaw) : []
    })

    const [loadingPlaylist, setLoadingPlaylist] = useState<boolean>(false)
    const { cacheMedia, getMediaUrl, removeUnusedMedia } = useMediaCache()
    const originalPlaylistsRef = useRef<Playlist[] | null>(null)
    const abortControllerRef = useRef<AbortController | null>(null)

    const [failedItems, setFailedItems] = useState<Set<string>>(new Set())
    const retryAttemptsRef = useRef<Map<string, number>>(new Map())

    useEffect(() => {
        return () => {  
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [])

    const updateData = useCallback(async () => {
        if (playlists === null) {
            console.log('Initializing...')
            return
        }

        if (!playlists || !Array.isArray(playlists)) {
            console.warn('Invalid playlists data, skipping caching.')
            return
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
        abortControllerRef.current = new AbortController()

        if (!arePlaylistsEqual(playlists, originalPlaylistsRef.current || [])) {
            setLoadingPlaylist(true)
            console.log('Playlists changed, updating cached data...')

            try {
                originalPlaylistsRef.current = JSON.parse(JSON.stringify(playlists))
                const currentMediaItems = extractMediaItems(playlists)
                
                const currentUrls = new Set(currentMediaItems.map(item => item.url))
                
                await removeUnusedMedia(Array.from(currentUrls))

                setFailedItems(new Set())
                retryAttemptsRef.current.clear()

                const cacheResults = await cacheMedia(currentMediaItems, abortControllerRef.current.signal)
                
                const newFailedItems = new Set<string>()
                cacheResults.forEach((success, url) => {
                    if (!success) {
                        newFailedItems.add(url)
                        retryAttemptsRef.current.set(url, 1)
                    }
                })
                setFailedItems(newFailedItems)

                if (newFailedItems.size === 0) {
                    const updatedPlaylists = JSON.parse(JSON.stringify(playlists)) as Playlist[]
                    
                    for (const playlist of updatedPlaylists) {
                        for (const section of playlist.sections || []) {
                            for (const item of section.items || []) {
                                if (item.content_path) {
                                    const cachedUrl = await getMediaUrl(item.content_path)
                                    if (cachedUrl) {
                                        item.content_path = cachedUrl
                                    }
                                }
                            }
                        }
                    }

                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPlaylists))
                    setCachedPlaylists(updatedPlaylists)
                    console.log('Playlists and media cached successfully')
                } else {
                    console.warn(`Some items failed to cache (${newFailedItems.size} items), will retry...`)
                }
            } catch (error: unknown) {
                if (error instanceof Error && error.name === 'AbortError') {
                    console.log('Caching operation cancelled due to playlist update')
                } else {
                    console.error('Failed to cache playlists and media:', error)
                }
            } finally {
                setLoadingPlaylist(false)
            }
        }
    }, [playlists, cacheMedia, getMediaUrl, removeUnusedMedia])

    useEffect(() => {
        updateData()
    }, [updateData])

    useEffect(() => {
        const retryFailedItems = async () => {
            if (failedItems.size === 0 || !playlists) return

            const itemsToRetry = Array.from(failedItems).filter(url => {
                const attempts = retryAttemptsRef.current.get(url) || 0
                return attempts < MAX_RETRY_ATTEMPTS
            })

            if (itemsToRetry.length === 0) {
                console.error('Max retry attempts reached for some items')
                return
            }

            await delay(RETRY_DELAY_MS)

            try {
                const mediaItems = itemsToRetry.map(url => {
                    const item = extractMediaItems(playlists).find(item => item.url === url)
                    return item!
                })

                const cacheResults = await cacheMedia(mediaItems)
                
                const newFailedItems = new Set(failedItems)
                cacheResults.forEach((success, url) => {
                    if (success) {
                        newFailedItems.delete(url)
                    } else {
                        const attempts = (retryAttemptsRef.current.get(url) || 0) + 1
                        retryAttemptsRef.current.set(url, attempts)
                    }
                })
                setFailedItems(newFailedItems)

                if (newFailedItems.size === 0) {
                    updateData()
                }
            } catch (error) {
                console.error('Failed to retry caching:', error)
            }
        }

        retryFailedItems()
    }, [failedItems, playlists, cacheMedia])

    return { 
        cachedData: cachedPlaylists, 
        isCaching: loadingPlaylist,
        failedItems: Array.from(failedItems)
    }
}
