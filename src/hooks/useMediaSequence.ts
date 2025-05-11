import { useEffect, useRef } from 'react'
import type { MediaItem } from './useMediaItems'

const PRELOAD_TIME = 5 // seconds

export function useMediaSequence(mediaItems: MediaItem[], setMediaItems: React.Dispatch<React.SetStateAction<MediaItem[]>>) {
    const hasStarted = useRef(false)
    const timeoutsRef = useRef<NodeJS.Timeout[]>([])

    useEffect(() => {
        if (mediaItems.length === 0 || hasStarted.current) return

        hasStarted.current = true

        const runSequence = (startIndex: number) => {
            clearAllTimeouts()

            const updateItems = (updates: Partial<MediaItem>, index: number) => {
                setMediaItems(prev => {
                    const updated = [...prev]

                    updated[index] = { ...updated[index], ...updates }
                    return updated
                })
            }

            const currentIndex = startIndex
            const preloadIndex = (currentIndex + 1) % mediaItems.length

            updateItems({ hidden: false }, currentIndex)

            const preloadNextTimeout = setTimeout(() => {
                updateItems({ preload: true }, preloadIndex)
            }, (mediaItems[currentIndex].duration - PRELOAD_TIME) * 1000)

            const transitionTimeout = setTimeout(() => {
                setMediaItems(prev => {
                    const updated = [...prev]

                    updated[currentIndex] = { ...updated[currentIndex], preload: false, hidden: true }
                    updated[preloadIndex] = { ...updated[preloadIndex], hidden: false, preload: false }
                    return updated
                })

                runSequence(preloadIndex)
            }, mediaItems[currentIndex].duration * 1000)

            timeoutsRef.current.push(preloadNextTimeout, transitionTimeout)
        }

        runSequence(0)

        return () => {
            clearAllTimeouts()
        }
    }, [mediaItems, setMediaItems])

    const clearAllTimeouts = () => {
        timeoutsRef.current.forEach(clearTimeout)
        timeoutsRef.current = []
    }
}