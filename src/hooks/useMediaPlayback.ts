import { useEffect, type RefObject } from 'react'
import type { MediaItem } from './useMediaItems'

export function useMediaPlayback(
    mediaItems: MediaItem[],
    videoRefs: RefObject<Record<string, HTMLVideoElement | null>>
) {
    useEffect(() => {
        mediaItems.forEach(item => {
            const video = videoRefs.current?.[item.id]

            if (item.type === 'video' && video) {
                if (!item.hidden) {
                    video.play().catch(() => {})
                } else {
                    video.pause()
                    video.currentTime = 0
                }
            }
        })
    }, [mediaItems, videoRefs])
}
