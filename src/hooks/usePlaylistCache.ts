import { useEffect, useState } from 'react'
import type { Playlist } from '../types'

export const usePlaylistCache = (playlist: Playlist | null) => {
    const [isPreloaded, setIsPreloaded] = useState(false)

    useEffect(() => {
        const preloadMedia = async () => {
            if (!playlist) return

            const mediaPromises = playlist.sections.flatMap(section =>
                section.items.map(item => preloadMediaFile(item.content_path))
            )

            await Promise.all(mediaPromises)
            setIsPreloaded(true)
        }

        preloadMedia()
    }, [playlist])

    return { isPreloaded }
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