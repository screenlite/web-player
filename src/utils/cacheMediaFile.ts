export const cacheMediaFile = async (src: string): Promise<void> => {
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
        console.error('Caching error:', err)
        throw err
    }
}