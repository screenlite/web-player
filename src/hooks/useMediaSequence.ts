import { useCallback, useEffect, type RefObject } from 'react'
import type { MediaItem, Section } from '../types'
import { useSectionMediaItems } from './useSectionMediaItems'

const PRELOAD_TIME = 5 // seconds
const UPDATE_INTERVAL_MS = 50

type MediaSequenceState = {
	currentIndex: number
	elapsedInCurrentItem: number
	shouldPreloadNext: boolean
	nextItemIndex: number
}

type OnPlaybackComplete = (itemId: string) => void

const useCalculateMediaState = (mediaItems: MediaItem[], playbackStartTime: number, totalDurationRef: RefObject<number>) => {
    return useCallback((): MediaSequenceState => {
        if (!playbackStartTime || mediaItems.length === 0) {
            return {
                currentIndex: 0,
                elapsedInCurrentItem: 0,
                shouldPreloadNext: false,
                nextItemIndex: 0
            }
        }

        const now = Math.floor(Date.now() / 1000)
        const elapsedSinceStart = now - playbackStartTime
        const cycleTime = elapsedSinceStart % totalDurationRef.current

        let accumulatedDuration = 0

        for (let i = 0; i < mediaItems.length; i++) {
            const itemDuration = mediaItems[i].duration

            accumulatedDuration += itemDuration

            if (accumulatedDuration > cycleTime) {
                const elapsedInItem = cycleTime - (accumulatedDuration - itemDuration)
                const nextItemIndex = (i + 1) % mediaItems.length
                const shouldPreloadNext = itemDuration - elapsedInItem <= PRELOAD_TIME

                return {
                    currentIndex: i,
                    elapsedInCurrentItem: elapsedInItem,
                    shouldPreloadNext,
                    nextItemIndex
                }
            }
        }

        return {
            currentIndex: 0,
            elapsedInCurrentItem: 0,
            shouldPreloadNext: false,
            nextItemIndex: 0
        }
    }, [mediaItems, playbackStartTime, totalDurationRef])
}

const useUpdateMediaItem = () => {
    return useCallback((item: MediaItem, index: number, state: MediaSequenceState, onPlaybackComplete?: OnPlaybackComplete) => {
        const isCurrent = index === state.currentIndex
        const isPreload = index === state.nextItemIndex && state.shouldPreloadNext

        if (!item.hidden && !isCurrent && onPlaybackComplete) {
            onPlaybackComplete(item.id)
        }

        return {
            ...item,
            hidden: !isCurrent,
            preload: isPreload,
        }
    }, [])
}

const useUpdateMediaItemsState = (setMediaItems: React.Dispatch<React.SetStateAction<MediaItem[]>>, onPlaybackComplete?: OnPlaybackComplete) => {
    const updateMediaItem = useUpdateMediaItem()

    return useCallback((state: MediaSequenceState) => {
        setMediaItems(prevItems => {
            let hasChanges = false

            const updatedItems = prevItems.map((item, index) => {
                const updatedItem = updateMediaItem(item, index, state, onPlaybackComplete)

                if (item.hidden !== updatedItem.hidden || item.preload !== updatedItem.preload) {
                    hasChanges = true
                }
                return updatedItem
            })

            return hasChanges ? updatedItems : prevItems
        })
    }, [setMediaItems, onPlaybackComplete, updateMediaItem])
}

export const useMediaSequence = (section: Section, playbackStartTime: number, onPlaybackComplete?: OnPlaybackComplete) => {
    const { mediaItems, setMediaItems, totalDurationRef } = useSectionMediaItems(section.items)
    const calculateCurrentMediaState = useCalculateMediaState(mediaItems, playbackStartTime, totalDurationRef)
    const updateMediaItemsState = useUpdateMediaItemsState(setMediaItems, onPlaybackComplete)

    useEffect(() => {
        if (mediaItems.length === 0 || !playbackStartTime) return

        const intervalId = setInterval(() => {
            const currentState = calculateCurrentMediaState()

            updateMediaItemsState(currentState)
        }, UPDATE_INTERVAL_MS)

        return () => clearInterval(intervalId)
    }, [mediaItems, playbackStartTime, calculateCurrentMediaState, updateMediaItemsState])

    return { mediaItems }
}