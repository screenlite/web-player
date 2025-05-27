import { useCurrentTimestamp } from './hooks/useCurrentTimestamp'
import { usePlaylist } from './hooks/usePlaylist'
import { PlaylistRenderer } from './PlaylistRenderer'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Player = ({ data, timezone }: { data: any, timezone: string }) => {
    const currentTimestamp = useCurrentTimestamp(timezone)
		
    const { currentPlaylist, elapsedSinceStart } = usePlaylist(data, currentTimestamp)
		
	 if (!currentPlaylist || elapsedSinceStart === null) {
        return (
            <div className='bg-black w-screen h-screen overflow-hidden'>
                <h1 className='text-white text-3xl font-bold'>No active playlist</h1>
            </div>
        )
    }

    return <PlaylistRenderer playlist={ currentPlaylist } elapsedSinceStart={ elapsedSinceStart } />
}
