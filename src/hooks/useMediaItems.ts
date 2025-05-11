import { useEffect, useState } from 'react'
import type { Section } from '../types'

export type MediaItem = {
    id: string,
    src: string,
    type: string,
    duration: number,
    hidden: boolean,
    preload: boolean,
}

export function useMediaItems(section: Section) {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([])

    useEffect(() => {
        const items = section.items.map(item => ({
            id: item.id,
            src: item.content_path,
            type: item.content_type,
            duration: item.duration,
            hidden: true,
            preload: false,
        }))

        setMediaItems(items)
    }, [section.items])

    return [mediaItems, setMediaItems] as const
}
