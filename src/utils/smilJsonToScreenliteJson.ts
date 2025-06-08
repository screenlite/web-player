import type { Item, Playlist, Section } from '../types'
import { parseSmil } from './parseSmil'

function generateUniqueId(base: string, existingIds: Set<string>): string {
    let id = base
    let counter = 1

    while (existingIds.has(id)) {
        id = `${base}_${counter}`
        counter++
    }

    existingIds.add(id)
    return id
}

export function smilToScreenliteJson(smilXml: string, cmsUrl: string): Playlist[] {
    const smil = parseSmil(smilXml)
    const width = parseInt(smil.layout.width, 10)
    const height = parseInt(smil.layout.height, 10)

    const regionMap = new Map<string, Section>()
    const usedIds = new Set<string>()

    smil.layout.regions.forEach((region) => {
        const regionItems = smil.media
            .filter(media => media.src && media.region === region.regionName)
            .map((media): Item => {
                const url = new URL(media.src!, cmsUrl).toString()
                
                // Create a base ID from the media source and type
                const baseId = `item_${media.type}_${media.src!.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'unknown'}`
                    .toLowerCase()
                    .replace(/[^a-z0-9_]/g, '_')

                return {
                    id: generateUniqueId(baseId, usedIds),
                    content_type: media.type,
                    content_path: url,
                    duration: media.duration ? parseFloat(media.duration) : 5,
                }
            })

        if (regionItems.length > 0) {
            // Create a unique section ID
            const baseSectionId = `section_${region.regionName}`
                .toLowerCase()
                .replace(/[^a-z0-9_]/g, '_')

            regionMap.set(region.regionName, {
                id: generateUniqueId(baseSectionId, usedIds),
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

    // Create a unique playlist ID
    const basePlaylistId = smil.title
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')

    const playlist: Playlist = {
        id: generateUniqueId(basePlaylistId, usedIds),
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
