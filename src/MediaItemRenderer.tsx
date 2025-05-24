import { useEffect, useMemo, useRef } from 'react'
import type { MediaItem } from './types'
import { useMediaItemPlaybackTracker } from './utils/useMediaItemPlaybackTracker'

type Props = {
    item: MediaItem
}

export const MediaItemRenderer = ({ item }: Props) => {
    const videoRef = useRef<HTMLVideoElement | null>(null)

    useMediaItemPlaybackTracker(item.id, item.hidden)

    useEffect(() => {
        const video = videoRef.current

        if (item.type !== 'video' || !video) return

        if (item.hidden) {
            video.pause()
            video.currentTime = 0
        } else {
            video.play().catch(() => {})
        }
    }, [item.type, item.hidden])

    const mediaStyle = useMemo(() => ({
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const,
        zIndex: item.hidden ? 0 : 1,
    }), [item.hidden])

    if (!item.preload && item.hidden) return null

    return item.type === 'image' ? (
        <img key={item.id} src={item.src} style={mediaStyle} />
    ) : (
        <video
            key={item.id}
            ref={videoRef}
            style={mediaStyle}
            loop
            muted
        >
            <source src={item.src} type="video/mp4" />
        </video>
    )
}
