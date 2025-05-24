import { useMemo } from 'react'
import type { Playlist } from '../types'
import { getActivePlaylist } from '../utils/getActivePlaylist'

export const usePlaylist = (playlists: Playlist[], currentTimestamp: number) => {
    return useMemo(() => {
        const { activePlaylist, startTimestamp } = getActivePlaylist(playlists, currentTimestamp)

        const elapsedSinceStart =
            activePlaylist && startTimestamp != null
                ? currentTimestamp - startTimestamp
                : null

        return {
            currentPlaylist: activePlaylist ?? null,
            elapsedSinceStart,
        }
    }, [playlists, currentTimestamp])
}