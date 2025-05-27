import { useEffect, useState } from 'react'
import type { Playlist } from '../types'

const LOCAL_STORAGE_KEY = 'cached_playlists'

// Mock function for caching, can be replaced with real implementation or for testing
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function mockCachePlaylists(playlists: Playlist[]) {
    // For now, just log to console
    console.log('Mock caching playlists')
    return true
}

function arePlaylistsEqual(a: Playlist[], b: Playlist[]): boolean {
    return JSON.stringify(a) === JSON.stringify(b)
}

export function useCachedData(playlists: Playlist[] | null) {
    const [cachedPlaylists, setCachedPlaylists] = useState<Playlist[]>(() => {
        const cachedRaw = localStorage.getItem(LOCAL_STORAGE_KEY)

        return cachedRaw ? JSON.parse(cachedRaw) : []
    })

    const [loadingPlaylist, setLoadingPlaylist] = useState<boolean>(false)

    useEffect(() => {
        const updateData = async () => {
            if(!playlists || !Array.isArray(playlists)) {
                console.warn('Invalid playlists data, skipping caching.')
                return
            }
			
            if (!arePlaylistsEqual(playlists, cachedPlaylists)) {
                setLoadingPlaylist(true)

                console.log('Playlists changed, updating cached data...')
                
                const result = mockCachePlaylists(playlists)

                if (result !== false) {
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(playlists))
                    setCachedPlaylists(playlists)
                } else {
                    console.warn('Caching function returned false, not updating local storage.')
                }

                console.log('Playlists cached:', playlists)
                
                setLoadingPlaylist(false)
            }
        }

        updateData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playlists])

    return { cachedData: cachedPlaylists, isCaching: loadingPlaylist }
}
