import type { MediaItem, MediaSequenceState } from '../types'

const PRELOAD_TIME = 5000

export function calculateMediaSequenceState(
    mediaItems: MediaItem[],
    elapsedSinceStart: number,
    totalDuration: number
): MediaSequenceState {
    if (!elapsedSinceStart || mediaItems.length === 0 || !totalDuration) {
        return {
            currentIndex: 0,
            elapsedInCurrentItem: 0,
            shouldPreloadNext: false,
            nextItemIndex: 0,
            totalDuration: 0
        }
    }

    const cycleTime = elapsedSinceStart % totalDuration

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
                totalDuration
            }
        }
    }

    return {
        currentIndex: 0,
        elapsedInCurrentItem: 0,
        shouldPreloadNext: false,
        nextItemIndex: 0,
        totalDuration
    }
}
