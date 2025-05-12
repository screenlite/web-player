import { useEffect, useState } from 'react'
import type { Playlist } from '../types'

export const usePlaylist = (playlists: Playlist[]) => {
    const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null)
    const [startTimestamp, setStartTimestamp] = useState<number | null>(null)

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date()
            const currentTime = now.toTimeString().split(' ')[0]

            const activePlaylist = playlists.find(
                (playlist) =>
                    currentTime >= playlist.start_time && currentTime <= playlist.end_time
            )

            if (activePlaylist) {
                const today = new Date()
                const [hours, minutes, seconds] = activePlaylist.start_time.split(':').map(Number)
                const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, seconds)

                const newStartTimestamp = startTime.getTime()

                if (currentPlaylist?.id !== activePlaylist.id) {
                    setCurrentPlaylist(activePlaylist)
                }

                if (startTimestamp !== newStartTimestamp) {
                    setStartTimestamp(newStartTimestamp)
                }
            } else {
                if (currentPlaylist !== null) {
                    setCurrentPlaylist(null)
                }

                if (startTimestamp !== null) {
                    setStartTimestamp(null)
                }
            }
        }, 50)

        return () => clearInterval(interval)
    }, [playlists, currentPlaylist, startTimestamp])

    return { currentPlaylist, startTimestamp }
}
