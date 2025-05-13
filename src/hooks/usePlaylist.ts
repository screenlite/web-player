import { useEffect, useState } from 'react'
import type { Playlist } from '../types'
import { getActivePlaylist } from '../utils/getActivePlaylist'

export const usePlaylist = (playlists: Playlist[]) => {
    const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null)
    const [startTimestamp, setStartTimestamp] = useState<number | null>(null)

    useEffect(() => {
        const interval = setInterval(() => {
            const {
                activePlaylist,
                startTimestamp: newStartTimestamp
            } = getActivePlaylist(playlists)

            if (activePlaylist?.id !== currentPlaylist?.id) {
                setCurrentPlaylist(activePlaylist)
            }

            if (startTimestamp !== newStartTimestamp) {
                setStartTimestamp(newStartTimestamp)
            }

            if (!activePlaylist && currentPlaylist !== null) {
                setCurrentPlaylist(null)
            }

            if (!newStartTimestamp && startTimestamp !== null) {
                setStartTimestamp(null)
            }
        }, 50)

        return () => clearInterval(interval)
    }, [playlists, currentPlaylist, startTimestamp])

    return { currentPlaylist, startTimestamp }
}
