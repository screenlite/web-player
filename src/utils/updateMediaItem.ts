import type { MediaItem, MediaSequenceState } from '../types'

export const updateMediaItem = (
    item: MediaItem,
    index: number,
    state: MediaSequenceState
): MediaItem => {
    const isHidden = index !== state.currentIndex
    const isPreload = index === state.preloadIndex

    if (item.hidden === isHidden && item.preload === isPreload) {
        return item
    }

    return {
        ...item,
        hidden: isHidden,
        preload: isPreload,
    }
}