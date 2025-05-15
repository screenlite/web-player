import type { MediaItem } from '../types'

const PRELOAD_TIME = 5 // seconds

type MediaSequenceState = {
	currentIndex: number
	elapsedInCurrentItem: number
	shouldPreloadNext: boolean
	nextItemIndex: number
	playbackStartTime: number
	totalDuration: number
}

export function calculateMediaSequenceState(
    mediaItems: MediaItem[],
    playbackStartTime: number,
    totalDuration: number,
    currentTimestamp: number = Date.now()
): MediaSequenceState {
    if (!playbackStartTime || mediaItems.length === 0 || !totalDuration) {
        return {
            currentIndex: 0,
            elapsedInCurrentItem: 0,
            shouldPreloadNext: false,
            nextItemIndex: 0,
            playbackStartTime: 0,
            totalDuration: 0
        }
    }

    const elapsedSinceStart = currentTimestamp - playbackStartTime

    const cycleTime = (elapsedSinceStart / 1000) % totalDuration

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
                totalDuration
            }
        }
    }

    return {
        currentIndex: 0,
        elapsedInCurrentItem: 0,
        shouldPreloadNext: false,
        nextItemIndex: 0,
        playbackStartTime,
        totalDuration
    }
}
