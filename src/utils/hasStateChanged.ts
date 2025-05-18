import type { MediaSequenceState } from '../types'

export const hasStateChanged = (prev: MediaSequenceState, next: MediaSequenceState) =>
    prev.currentIndex !== next.currentIndex ||
	prev.preloadIndex !== next.preloadIndex