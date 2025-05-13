import { Fragment, type CSSProperties, type RefObject } from 'react'
import type { MediaItem } from './types'
import { useMediaItemPlaybackTracker } from './utils/useMediaItemPlaybackTracker'

type Props = {
	item: MediaItem
	videoRefs: RefObject<Record<string, HTMLVideoElement | null>>
	imageStyle: CSSProperties
	videoStyle: CSSProperties
}

export const MediaItemRenderer = ({ item, videoRefs, imageStyle, videoStyle }: Props) => {
    useMediaItemPlaybackTracker(item.id, item.hidden)

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
                    ref={(el) => {
                        videoRefs.current[item.id] = el
                    }}
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