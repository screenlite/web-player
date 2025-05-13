import type { MediaItem, MediaSequenceState } from '../types'

export const updateMediaItem = (
    item: MediaItem,
    index: number,
    state: MediaSequenceState
): MediaItem => {
    const isCurrent = index === state.currentIndex
    const isPreload = index === state.nextItemIndex && state.shouldPreloadNext

    return {
        ...item,
        hidden: !isCurrent,
        preload: isPreload,
    }
}