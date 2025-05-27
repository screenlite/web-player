import type { Playlist } from '../types'

export const isDataCached = async (playlist: Playlist | null): Promise<boolean> => {
    if (!playlist) return false

    try {
        const cache = await caches.open('screenlite-cache')

        const allPaths = playlist.sections.flatMap(section =>
            section.items.map(item => item.content_path)
        )

        const results = await Promise.all(
            allPaths.map(path => cache.match(path))
        )

        return results.every(res => !!res)
    } catch (err) {
        console.error('Cache check error:', err)
        return false
    }
}