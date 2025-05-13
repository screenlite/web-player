import type { MediaItem, MediaSequenceState } from '../types'
import { updateMediaItem } from './updateMediaItem'

export const updateMediaItemsState = (
    items: MediaItem[],
    state: MediaSequenceState
): MediaItem[] => {
    const updatedItems = items.map((item, index) => updateMediaItem(item, index, state))

    const hasChanges = updatedItems.some((updatedItem, index) => {
        const prevItem = items[index]

        if (prevItem.hidden !== updatedItem.hidden) {
            if (updatedItem.hidden) {
                console.log('Hiding', updatedItem.id)
            }
        }

        return prevItem.hidden !== updatedItem.hidden || prevItem.preload !== updatedItem.preload
    })

    return hasChanges ? updatedItems : items
}