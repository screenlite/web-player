import { useEffect, useState, useRef } from 'react'
import type { Playlist } from '../types'
import { useMediaCache } from './useMediaCache'

const LOCAL_STORAGE_KEY = 'cached_playlists'

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

export function useCachedData(playlists: Playlist[] | null) {
    const [cachedPlaylists, setCachedPlaylists] = useState<Playlist[]>(() => {
        const cachedRaw = localStorage.getItem(LOCAL_STORAGE_KEY)
        return cachedRaw ? JSON.parse(cachedRaw) : []
    })

    const [loadingPlaylist, setLoadingPlaylist] = useState<boolean>(false)
    const { cacheMedia, getMediaUrl, progress } = useMediaCache()
    
    const originalPlaylistsRef = useRef<Playlist[] | null>(null)

    useEffect(() => {
        const updateData = async () => {
            if (playlists === null) {
                console.log('Initializing...')
                return
            }

            if (!playlists || !Array.isArray(playlists)) {
                console.warn('Invalid playlists data, skipping caching.')
                return
            }

            if (!arePlaylistsEqual(playlists, originalPlaylistsRef.current || [])) {
                setLoadingPlaylist(true)
                console.log('Playlists changed, updating cached data...')

                try {
                    originalPlaylistsRef.current = JSON.parse(JSON.stringify(playlists))

                    const mediaItems = extractMediaItems(playlists)
                    
                    await cacheMedia(mediaItems)

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
                } catch (error) {
                    console.error('Failed to cache playlists and media:', error)
                } finally {
                    setLoadingPlaylist(false)
                }
            }
        }

        updateData()
    }, [playlists, cacheMedia, getMediaUrl])

    return { 
        cachedData: cachedPlaylists, 
        isCaching: loadingPlaylist,
        cacheProgress: progress 
    }
}
