import type { Playlist } from '../types'

interface ActivePlaylistResult {
    activePlaylist: Playlist | null
    startTimestamp: number | null
}

interface DayCache {
    date: number // Days since epoch
    playlists: Playlist[]
    activeCache: {
        timestamp: number
        result: ActivePlaylistResult
    } | null
}

let cachedDay: DayCache | null = null

const MILLISECONDS_PER_DAY = 86400000
const CACHE_VALIDITY_DURATION_MS = 1000

export function getActivePlaylist(playlists: Playlist[] | null, currentTimestamp: number): ActivePlaylistResult {
    if (!playlists || playlists.length === 0) {
        return { activePlaylist: null, startTimestamp: null }
    }

    const currentDate = Math.floor(currentTimestamp / MILLISECONDS_PER_DAY)
    const timeWithinDay = currentTimestamp % MILLISECONDS_PER_DAY

    if (!cachedDay || cachedDay.date !== currentDate) {
        const todaysPlaylists = playlists.filter(playlist => {
            const startDate = Math.floor(new Date(playlist.start_date).getTime() / MILLISECONDS_PER_DAY)
            const endDate = Math.floor(new Date(playlist.end_date).getTime() / MILLISECONDS_PER_DAY)

            return currentDate >= startDate && currentDate <= endDate
        })

        cachedDay = {
            date: currentDate,
            playlists: todaysPlaylists,
            activeCache: null
        }
    }

    if (cachedDay.activeCache && 
        currentTimestamp - cachedDay.activeCache.timestamp < CACHE_VALIDITY_DURATION_MS) {
        return cachedDay.activeCache.result
    }

    let activePlaylist: Playlist | null = null
    let playlistStartTimestamp: number | null = null

    for (const playlist of cachedDay.playlists) {
        const [startHours, startMinutes, startSeconds] = playlist.start_time.split(':').map(Number)
        const playlistStartTimeMs = (startHours * 3600 + startMinutes * 60 + startSeconds) * 1000
        
        const [endHours, endMinutes, endSeconds] = playlist.end_time.split(':').map(Number)
        const playlistEndTimeMs = (endHours * 3600 + endMinutes * 60 + endSeconds) * 1000

        if (timeWithinDay >= playlistStartTimeMs && timeWithinDay <= playlistEndTimeMs) {
            playlistStartTimestamp = new Date(playlist.start_date).setHours(
                startHours, startMinutes, startSeconds, 0
            )
            activePlaylist = playlist
            break
        }
    }

    const result: ActivePlaylistResult = {
        activePlaylist,
        startTimestamp: playlistStartTimestamp
    }

    cachedDay.activeCache = {
        timestamp: currentTimestamp,
        result
    }

    return result
}