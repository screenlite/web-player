import { Fragment, useRef, type CSSProperties } from 'react'
import type { MediaItem } from './types'
import { useMediaItemPlaybackTracker } from './utils/useMediaItemPlaybackTracker'
import { useEffect } from 'react'

type Props = {
	item: MediaItem
	imageStyle: CSSProperties
	videoStyle: CSSProperties
}

export const MediaItemRenderer = ({ item, imageStyle, videoStyle }: Props) => {
    const videoRef = useRef<HTMLVideoElement | null>(null)

    useMediaItemPlaybackTracker(item.id, item.hidden)

    useEffect(() => {
        const video = videoRef.current

        if (item.type !== 'video' || !video) return

        if (!item.hidden) {
            video.currentTime = 0
            video.play().catch(() => {})
        } else {
            video.pause()
            video.currentTime = 0
        }
    }, [item.hidden, item.type])

    if (!item.preload && item.hidden) return null

    return (
        <Fragment key={item.id}>
            {item.type === 'image' ? (
                <div
                    style={{
                        ...imageStyle,
                        backgroundImage: `url(${item.src})`,
                        opacity: item.hidden ? 0 : 1,
                    }}
                />
            ) : (
                <video
                    ref={videoRef}
                    style={{
                        ...videoStyle,
                        opacity: item.hidden ? 0 : 1,
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