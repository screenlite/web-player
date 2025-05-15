import type { Playlist } from '../types'

export function getActivePlaylist(playlists: Playlist[]): {
  activePlaylist: Playlist | null
  startTimestamp: number | null
} {
    const now = new Date()
    const currentTime = now.toTimeString().split(' ')[0]

    const activePlaylist = playlists.find(
        (playlist) =>
            currentTime >= playlist.start_time && currentTime <= playlist.end_time
    )

    if (activePlaylist) {
        const [hours, minutes, seconds] = activePlaylist.start_time
            .split(':')
            .map(Number)

        const [year, month, day] = activePlaylist.start_date.split('-').map(Number)

        const startTime = new Date(
            year,
            month - 1,
            day,
            hours,
            minutes,
            seconds
        )

        return {
            activePlaylist,
            startTimestamp: startTime.getTime(),
        }
    }

    return {
        activePlaylist: null,
        startTimestamp: null,
    }
}
