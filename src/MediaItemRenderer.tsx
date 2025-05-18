import { Fragment, useMemo, useRef } from 'react'
import type { MediaItem } from './types'
import { useMediaItemPlaybackTracker } from './utils/useMediaItemPlaybackTracker'
import { useEffect } from 'react'

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
    }, [item])

    const imageStyle = useMemo(() => ({
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const,
    }), [])

    const videoStyle = useMemo(() => ({
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const,
    }), [])

    if (!item.preload && item.hidden) return null

    return (
        <Fragment>
            {item.type === 'image' ? (
                <img
                    src={ item.src }
                    style={{
                        ...imageStyle,
                        zIndex: item.hidden ? 0 : 1,
                    }}
                />
            ) : (
                <video
                    ref={videoRef}
                    style={{
                        ...videoStyle,
                        zIndex: item.hidden ? 0 : 1,
                    }}
                    loop
                    muted
                >
                    <source src={item.src} type="video/mp4" />
                </video>
            )}
        </Fragment>
    )
}