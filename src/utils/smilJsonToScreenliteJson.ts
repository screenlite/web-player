import type { Item, Playlist, Section } from '../types'
import { parseSmil } from './parseSmil'

export function smilToScreenliteJson(smilXml: string, cmsUrl: string): Playlist[] {
    const smil = parseSmil(smilXml)
    const width = parseInt(smil.layout.width, 10)
    const height = parseInt(smil.layout.height, 10)

    const items = smil.media.filter(item => item.src).map((media, index): Item => {
        const url = new URL(media.src!, cmsUrl).toString()
        
        return {
            id: `item_${index}`,
            content_type: media.type,
            content_path: url,
            duration: media.duration ? parseFloat(media.duration) : 5,
        }
    })

    const section: Section = {
        id: 'default_section',
        position: {
            x: 0,
            y: 0,
            width: width,
            height: height,
            z_index: 1,
        },
        items,
    }

    const playlist: Playlist = {
        id: smil.title.replace(/\s+/g, '_').toLowerCase(),
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        start_time: '00:00:00',
        end_time: '23:59:59',
        width,
        height,
        sections: [section],
    }

    return [playlist]
}
