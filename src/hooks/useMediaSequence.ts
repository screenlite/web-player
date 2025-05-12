import { useCallback, useEffect } from 'react'
import type { Section } from '../types'
import { useSectionMediaItems } from './useSectionMediaItems'

const PRELOAD_TIME = 5 // seconds

export function useMediaSequence(section: Section, playbackStartTime: number) {
    const { mediaItems, setMediaItems, totalDurationRef } = useSectionMediaItems(section.items)

    const getCurrentIndexAndElapsed = useCallback((): [number, number] => {
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
    }, [mediaItems, playbackStartTime, totalDurationRef])

    useEffect(() => {
        if (mediaItems.length === 0 || !playbackStartTime) return

        const intervalId = setInterval(() => {
            const [currentIndex, elapsed] = getCurrentIndexAndElapsed()
            const currentItem = mediaItems[currentIndex]
            const preloadIndex = (currentIndex + 1) % mediaItems.length
            const shouldPreload = currentItem.duration - elapsed <= PRELOAD_TIME

            setMediaItems(prev => {
                let hasChanged = false
                const updatedItems = prev.map((item, index) => {
                    const isCurrent = index === currentIndex
                    const isPreload = index === preloadIndex && shouldPreload

                    if (!item.hidden && !isCurrent) {
                        console.log(`${item.id} playback ended`)
                    }

                    if (item.hidden !== !isCurrent || item.preload !== isPreload) {
                        hasChanged = true
                        return {
                            ...item,
                            hidden: !isCurrent,
                            preload: isPreload,
                        }
                    }
                    return item
                })

                return hasChanged ? updatedItems : prev
            })
        }, 50)

        return () => clearInterval(intervalId)
    }, [mediaItems, playbackStartTime, getCurrentIndexAndElapsed, setMediaItems])

    return { mediaItems }
}