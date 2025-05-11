import { useEffect, useRef, useState } from 'react'
import type { Section } from '../types'

const PRELOAD_TIME = 5 // seconds

type MediaItem = {
	id: string,
	src: string,
	type: string,
	duration: number,
	hidden: boolean,
	preload: boolean,
}

export function useMediaSequence(section: Section) {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([])

    const hasStarted = useRef(false)
    const timeoutsRef = useRef<NodeJS.Timeout[]>([])

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
        hasStarted.current = false
        clearAllTimeouts()
    }, [section.items])
		
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
    }, [mediaItems])
		
    const clearAllTimeouts = () => {
        timeoutsRef.current.forEach(clearTimeout)
        timeoutsRef.current = []
    }

    return {
        mediaItems,
    }
}