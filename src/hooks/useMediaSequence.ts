import { useCallback, useEffect, useRef, type RefObject } from 'react'
import type { MediaItem, Section } from '../types'
import { useSectionMediaItems } from './useSectionMediaItems'

const PRELOAD_TIME = 5 // seconds
const UPDATE_INTERVAL_MS = 50

type MediaSequenceState = {
	currentIndex: number
	elapsedInCurrentItem: number
	shouldPreloadNext: boolean
	nextItemIndex: number
	playbackStartTime: number
	totalDuration: number
}

type OnPlaybackComplete = (itemId: string) => void

const useCalculateMediaState = (mediaItems: MediaItem[], playbackStartTime: number, totalDurationRef: RefObject<number>) => {
    return useCallback((): MediaSequenceState => {
        if (!playbackStartTime || mediaItems.length === 0) {
            return {
                currentIndex: 0,
                elapsedInCurrentItem: 0,
                shouldPreloadNext: false,
                nextItemIndex: 0,
                playbackStartTime: 0,
                totalDuration: 0
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
                    nextItemIndex,
                    playbackStartTime,
                    totalDuration: totalDurationRef.current
                }
            }
        }

        return {
            currentIndex: 0,
            elapsedInCurrentItem: 0,
            shouldPreloadNext: false,
            nextItemIndex: 0,
            playbackStartTime,
            totalDuration: totalDurationRef.current
        }
    }, [mediaItems, playbackStartTime, totalDurationRef])
}

const useUpdateMediaItem = () => {
    const completedInCycleRef = useRef<Set<string>>(new Set())
    const lastLoopRef = useRef<number | null>(null)

    return useCallback((
        item: MediaItem,
        index: number,
        state: MediaSequenceState,
        onPlaybackComplete?: OnPlaybackComplete
    ) => {
        const isCurrent = index === state.currentIndex
        const isPreload = index === state.nextItemIndex && state.shouldPreloadNext

        const now = Math.floor(Date.now() / 1000)
        const totalDuration = state.totalDuration
        const loop = Math.floor((now - state.playbackStartTime) / totalDuration)

        if (lastLoopRef.current !== loop) {
            completedInCycleRef.current.clear()
            lastLoopRef.current = loop
        }

        const alreadyCompleted = completedInCycleRef.current.has(item.id)

        if (!item.hidden && !isCurrent && onPlaybackComplete && !alreadyCompleted) {
            completedInCycleRef.current.add(item.id)
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
            const updatedItems = prevItems.map((item, index) => updateMediaItem(item, index, state, onPlaybackComplete))

            const hasChanges = updatedItems.some((updatedItem, index) => {
                const prevItem = prevItems[index]

                return prevItem.hidden !== updatedItem.hidden || prevItem.preload !== updatedItem.preload
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