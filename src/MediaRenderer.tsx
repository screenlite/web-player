import type { MediaItem } from './types'
import { MediaItemRenderer } from './MediaItemRenderer'

export const MediaRenderer = ({
    mediaItems
}: {
    mediaItems: MediaItem[]
}) => {
    return (
        <>
            {mediaItems.map(item => (
                <MediaItemRenderer
                    key={item.id}
                    item={item}
                />
            ))}
        </>
    )
}
