import playlistData from './assets/playlist_data.json'
import { usePlaylist } from './hooks/usePlaylist'
import { useTimeOffset } from './hooks/useTimeOffset'
import { PlaylistRenderer } from './PlaylistRenderer'
import { useEffect, useState } from 'react'
import { TimeDisplay } from './TimeDisplay'

export const App = () => {
    const { currentPlaylist, startTimestamp } = usePlaylist(playlistData)
    const [isPreloaded, setIsPreloaded] = useState(false)
    const offsetMs = useTimeOffset()

    useEffect(() => {
        const preloadMedia = async () => {
            if (!currentPlaylist) return

            const mediaPromises = currentPlaylist.sections.flatMap(section =>
                section.items.map(item => preloadMediaFile(item.content_path))
            )

            await Promise.all(mediaPromises)
            setIsPreloaded(true)
        }

        preloadMedia()
    }, [currentPlaylist])

    if (!currentPlaylist || !startTimestamp) {
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

    return (
        <>
            <TimeDisplay offsetMs={offsetMs} />
            <PlaylistRenderer playlist={currentPlaylist} startTimestamp={(startTimestamp - offsetMs) / 1000} />
        </>
    )
}

const preloadMediaFile = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const isVideo = src.endsWith('.mp4') || src.endsWith('.webm')
        const media = isVideo ? document.createElement('video') : new Image()

        media.src = src
        media.onload = () => resolve()
        media.onerror = () => reject(new Error(`Failed to preload ${src}`))

        if (isVideo) {
            resolve()
        }
    })
}