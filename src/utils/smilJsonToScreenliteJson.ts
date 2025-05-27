import type { Item, Playlist, Section } from '../types'
import { parseSmil } from './parseSmil'

export function smilToScreenliteJson(smilXml: string, cmsUrl: string): Playlist[] {
    const smil = parseSmil(smilXml)
    const width = parseInt(smil.layout.width, 10)
    const height = parseInt(smil.layout.height, 10)

    const regionMap = new Map<string, Section>()

    smil.layout.regions.forEach((region) => {
        const regionItems = smil.media
            .filter(media => media.src && media.region === region.regionName)
            .map((media): Item => {
                const url = new URL(media.src!, cmsUrl).toString()

                return {
                    id: `item_${media.src}`,
                    content_type: media.type,
                    content_path: url,
                    duration: media.duration ? parseFloat(media.duration) : 5,
                }
            })

        if (regionItems.length > 0) {
            regionMap.set(region.regionName, {
                id: `section_${region.regionName}`,
                position: {
                    x: parseInt(region.left, 10),
                    y: parseInt(region.top, 10),
                    width: parseInt(region.width, 10),
                    height: parseInt(region.height, 10),
                    z_index: parseInt(region.zIndex, 10),
                },
                items: regionItems,
            })
        }
    })

    const sections = Array.from(regionMap.values())

    const playlist: Playlist = {
        id: smil.title.replace(/\s+/g, '_').toLowerCase(),
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        start_time: '00:00:00',
        end_time: '23:59:59',
        width,
        height,
        sections,
    }

    return [playlist]
}
