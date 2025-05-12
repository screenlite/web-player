import { useEffect, useRef, useState } from 'react'
import type { MediaItem, Section } from '../types'

const PRELOAD_TIME = 5 // seconds

export function useMediaSequence(section: Section, playbackStartTime: number) {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
    const totalDurationRef = useRef<number>(0)

    useEffect(() => {
        const items = section.items.map(item => ({
            id: item.id,
            src: item.content_path,
            type: item.content_type,
            duration: item.duration,
            hidden: true,
            preload: false,
        }))

        totalDurationRef.current = items.reduce((sum, item) => sum + item.duration, 0)

        setMediaItems(items)
    }, [section.items])

    useEffect(() => {
        if (mediaItems.length === 0 || !playbackStartTime) return

        const getCurrentIndexAndElapsed = (): [number, number] => {
            const now = Math.floor(Date.now() / 1000)
            const elapsedSinceStart = now - playbackStartTime
            const cycleTime = elapsedSinceStart % totalDurationRef.current

            let accumulated = 0

            for (let i = 0; i < mediaItems.length; i++) {
                accumulated += mediaItems[i].duration
                if (accumulated > cycleTime) {
                    const elapsedInItem = cycleTime - (accumulated - mediaItems[i].duration)

                    return [i, elapsedInItem]
                }
            }
            return [0, 0]
        }

        const intervalId = setInterval(() => {
            const [currentIndex, elapsed] = getCurrentIndexAndElapsed()
            const currentItem = mediaItems[currentIndex]
            const preloadIndex = (currentIndex + 1) % mediaItems.length
            const shouldPreload = currentItem.duration - elapsed <= PRELOAD_TIME

            setMediaItems(prev =>
                prev.map((item, index) => {
                    const isCurrent = index === currentIndex
                    const isPreload = index === preloadIndex && shouldPreload

                    return {
                        ...item,
                        hidden: !isCurrent,
                        preload: isPreload,
                    }
                })
            )
        }, 50)

        return () => clearInterval(intervalId)
    }, [mediaItems, playbackStartTime])

    return { mediaItems }
}