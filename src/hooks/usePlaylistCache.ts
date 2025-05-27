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

            await Promise.all(mediaPromises).catch(err => {
                console.error('Preload failed:', err)
            })

            setIsPreloaded(true)
        }

        preloadMedia()
    }, [playlist])

    return { isPreloaded }
}

const preloadMediaFile = async (src: string): Promise<void> => {
    try {
        const cache = await caches.open('screenlite-cache')

        const cachedResponse = await cache.match(src)

        if (cachedResponse) return

        const response = await fetch(src, { mode: 'no-cors' })

        if (!response.ok && response.type !== 'opaque') {
            throw new Error(`Failed to fetch ${src}: ${response.statusText}`)
        }

        await cache.put(src, response.clone())
    } catch (err) {
        console.error('Cache preload error:', err)
        throw err
    }
}