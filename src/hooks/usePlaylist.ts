import { useEffect, useState } from 'react'
import type { Playlist } from '../types'
import { getActivePlaylist } from '../utils/getActivePlaylist'

export const usePlaylist = (playlists: Playlist[]) => {
    const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null)
    const [elapsedSinceStart, setElapsedSinceStart] = useState<number | null>(null)

    useEffect(() => {
        const interval = setInterval(() => {
            const {
                activePlaylist,
                startTimestamp: newStartTimestamp
            } = getActivePlaylist(playlists)

            if (activePlaylist?.id !== currentPlaylist?.id) {
                setCurrentPlaylist(activePlaylist)
                setElapsedSinceStart(
                    newStartTimestamp ? Date.now() - newStartTimestamp : null
                )
            } else if (activePlaylist) {
                setElapsedSinceStart(
                    newStartTimestamp ? Date.now() - newStartTimestamp : null
                )
            }

            if (!activePlaylist && currentPlaylist !== null) {
                setCurrentPlaylist(null)
                setElapsedSinceStart(null)
            }
        }, 50)

        return () => clearInterval(interval)
    }, [playlists, currentPlaylist])

    return { currentPlaylist, elapsedSinceStart }
}
