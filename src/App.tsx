// import { useMemo } from 'react'
// import { GarlicHubAdapter } from './adapters/GarlicHubAdapter'
// import { useCMSAdapter } from './hooks/useCMSAdapter'
import playlistData from './assets/playlist_data.json'
import { useCurrentTimestamp } from './hooks/useCurrentTimestamp'
import { usePlaylist } from './hooks/usePlaylist'
import { usePlaylistCache } from './hooks/usePlaylistCache'
import { PlaylistRenderer } from './PlaylistRenderer'

export const App = () => {
    const currentTimestamp = useCurrentTimestamp()
    // const cmsAdapter = useMemo(
    //     () => new GarlicHubAdapter('https://garlic-hub.com/smil-index', 5000),
    //     []
    // )
    // const cmsData = useCMSAdapter({ adapter: cmsAdapter })
    const { currentPlaylist, elapsedSinceStart } = usePlaylist(playlistData, currentTimestamp)
    const { isPreloaded } = usePlaylistCache(currentPlaylist)

    if (!currentPlaylist || elapsedSinceStart === null) {
        return (
            <div className='bg-black w-screen h-screen overflow-hidden'>
                <h1 className='text-white text-3xl font-bold'>No active playlist</h1>
            </div>
        )
    }

    if (!isPreloaded) {
        return (
            <div className='bg-black w-screen h-screen overflow-hidden'>
                <h1 className='text-white text-3xl font-bold'>Loading playlist...</h1>
            </div>
        )
    }

    return <PlaylistRenderer playlist={ currentPlaylist } elapsedSinceStart={ elapsedSinceStart } />
}