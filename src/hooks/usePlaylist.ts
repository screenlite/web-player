import { useEffect, useState, useRef } from 'react'
import type { Playlist } from '../types'
import { getActivePlaylist } from '../utils/getActivePlaylist'
// import { useTimeServer } from './useTimeServer'

export const usePlaylist = (playlists: Playlist[]) => {
    const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null)
    const [elapsedSinceStart, setElapsedSinceStart] = useState<number | null>(null)
    const [currentTimestamp, setCurrentTimestamp] = useState<number>(Date.now())
    const serverTime = null // useTimeServer()
    const lastSecondRef = useRef<number>(new Date(currentTimestamp).getSeconds())

    useEffect(() => {
        const interval = setInterval(() => {
            const now = serverTime || Date.now()
            const date = new Date(now)
            const currentSecond = date.getSeconds()

            if (currentSecond !== lastSecondRef.current) {
                setCurrentTimestamp(now)
                lastSecondRef.current = currentSecond
            }
        }, 10)

        return () => clearInterval(interval)
    }, [serverTime])

    useEffect(() => {
        const { activePlaylist, startTimestamp: newStartTimestamp } = getActivePlaylist(playlists)

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
            newStartTimestamp ? currentTimestamp - newStartTimestamp : null
        )
    }, [playlists, currentTimestamp, currentPlaylist])

    return { currentPlaylist, elapsedSinceStart }
}
