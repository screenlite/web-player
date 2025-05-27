import type { Playlist } from '../types'

export const getActivePlaylist = (playlists: Playlist[], currentTimestampMs: number): {
	activePlaylist: Playlist | null;
	startTimestamp: number | null;
} => {
    if(!playlists || playlists.length === 0) {
        return {
            activePlaylist: null,
            startTimestamp: null
        }
    }
	
    const currentDate = new Date(currentTimestampMs)
    const currentUTCYear = currentDate.getUTCFullYear()
    const currentUTCMonth = currentDate.getUTCMonth()
    const currentUTCDay = currentDate.getUTCDate()

    const today = new Date(Date.UTC(currentUTCYear, currentUTCMonth, currentUTCDay))

    function parseDate(dateStr: string): Date {
        const [year, month, day] = dateStr.split('-').map(Number)

        return new Date(Date.UTC(year, month - 1, day))
    }

    function getDailyTimeRange(startTime: string, endTime: string, day: Date): { start: number; end: number } {
        const [startH, startM] = startTime.split(':').map(Number)
        const [endH, endM] = endTime.split(':').map(Number)

        const start = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), startH, startM)
        let end = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), endH, endM)

        if (end <= start) {
            end += 24 * 60 * 60 * 1000
        }

        return { start, end }
    }

    for (const playlist of playlists) {
        const startDate = parseDate(playlist.start_date)
        const endDate = parseDate(playlist.end_date)

        if (today >= startDate && today <= endDate) {
            const { start, end } = getDailyTimeRange(playlist.start_time, playlist.end_time, today)

            if (currentTimestampMs >= start && currentTimestampMs <= end) {
                return {
                    activePlaylist: playlist,
                    startTimestamp: start
                }
            }
        }
    }

    return {
        activePlaylist: null,
        startTimestamp: null
    }
}
