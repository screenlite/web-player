import { useEffect, useRef, useState } from 'react'
import type { Item, MediaItem } from '../types'
import { calculateMediaSequenceState } from '../utils/calculateCurrentMediaState'
import { updateMediaItemsState } from '../utils/updateMediaItemsState'

export const useSectionMediaItems = (sectionItems: Item[], elapsedSinceStart: number) => {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
    const totalDurationRef = useRef<number>(0)

    useEffect(() => {
        let items = sectionItems.map(item => ({
            id: item.id,
            src: item.content_path,
            type: item.content_type,
            duration: item.duration * 1000,
            hidden: true,
            preload: false
        }))

        // If the section contains only one item, duplicate it to enable seamless looping of the media
        if (items.length === 1) {
            const duplicate = { ...items[0], id: `${items[0].id}-copy` }

            items = [...items, duplicate]
        }

        totalDurationRef.current = items.reduce((sum, item) => sum + item.duration, 0)

        const initialState = calculateMediaSequenceState(items, elapsedSinceStart, totalDurationRef.current)
        const updatedItems = updateMediaItemsState(items, initialState)

        setMediaItems(updatedItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sectionItems, totalDurationRef])

    return { mediaItems, setMediaItems, totalDurationRef }
}
