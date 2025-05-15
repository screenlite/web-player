import { useEffect, useState } from 'react'
import type { Playlist } from '../types'
import { getActivePlaylist } from '../utils/getActivePlaylist'
import { useTimeServer } from './useTimeServer'

export const usePlaylist = (playlists: Playlist[]) => {
    const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null)
    const [elapsedSinceStart, setElapsedSinceStart] = useState<number | null>(null)
    const serverTime = useTimeServer()
	
    useEffect(() => {
        const interval = setInterval(() => {
            const {
                activePlaylist,
                startTimestamp: newStartTimestamp
            } = getActivePlaylist(playlists)

            const currentTime = serverTime || Date.now()

            if (!activePlaylist) {
                if (currentPlaylist !== null) {
                    setCurrentPlaylist(null)
                    setElapsedSinceStart(null)
                }
                return
            }

            if (activePlaylist.id !== currentPlaylist?.id) {
                setCurrentPlaylist(activePlaylist)
            }

            setElapsedSinceStart(
                newStartTimestamp ? currentTime - newStartTimestamp : null
            )
        }, 50)

        return () => clearInterval(interval)
    }, [playlists, currentPlaylist, serverTime])

    return { currentPlaylist, elapsedSinceStart }
}
