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
            preloadIndex: null,
            totalDuration: 0
        }
    }

    const cycleTime = elapsedSinceStart % totalDuration

    let accumulatedDuration = 0

    for (let i = 0; i < mediaItems.length; i++) {
        const itemDuration = mediaItems[i].duration

        accumulatedDuration += itemDuration

        if (accumulatedDuration > cycleTime) {
            const nextItemIndex = (i + 1) % mediaItems.length
            const timeUntilNextItem = accumulatedDuration - cycleTime
            const shouldPreloadNext = timeUntilNextItem <= PRELOAD_TIME

            return {
                currentIndex: i,
                preloadIndex: shouldPreloadNext ? nextItemIndex : null,
                totalDuration
            }
        }
    }

    // If we somehow reach this point (which should be rare), return a safe default state
    // This could happen in edge cases like rounding errors or timing issues
    return {
        currentIndex: 0,
        preloadIndex: mediaItems.length > 1 ? 1 : null,
        totalDuration
    }
}
