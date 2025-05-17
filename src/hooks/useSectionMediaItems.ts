import { useEffect, useRef, useState } from 'react'
import type { Item, MediaItem } from '../types'

export const useSectionMediaItems = (sectionItems: Item[]) => {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
    const totalDurationRef = useRef<number>(0)

    useEffect(() => {
        const items = sectionItems.map(item => ({
            id: item.id,
            src: item.content_path,
            type: item.content_type,
            duration: item.duration * 1000,
            hidden: true,
            preload: false,
        }))

        totalDurationRef.current = items.reduce((sum, item) => sum + item.duration, 0)

        setMediaItems(items)
    }, [sectionItems, totalDurationRef])

    return { mediaItems, setMediaItems, totalDurationRef }
}
