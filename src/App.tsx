import playlistData from './assets/playlist_data.json'
import { usePlaylist } from './hooks/usePlaylist'
import { PlaylistRenderer } from './PlaylistRenderer'

export const App = () => {
    const { currentPlaylist, startTimestamp } = usePlaylist(playlistData)

    if(!currentPlaylist || !startTimestamp) {
        return (
            <div className='bg-black w-screen h-screen overflow-hidden'>
                <h1 className='text-white text-3xl font-bold'>No active playlist</h1>
            </div>
        )
    }

    return <PlaylistRenderer playlist={currentPlaylist} startTimestamp={startTimestamp / 1000} />
}