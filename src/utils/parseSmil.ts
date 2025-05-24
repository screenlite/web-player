export type SmilMediaType = 'image' | 'video' | 'audio' | 'ref' | 'unknown'

export type SmilMediaItem = {
	region: string
	type: SmilMediaType
	src: string | null
	duration: string | null
	fit: string | null
}

export type SmilRegion = {
	regionName: string
	top: string
	left: string
	width: string
	height: string
	zIndex: string
	backgroundColor: string
}

export type SmilLayout = {
	backgroundColor: string
	width: string
	height: string
	regions: SmilRegion[]
}

export type SmilPlaylist = {
	title: string
	refresh: string | null
	layout: SmilLayout
	media: SmilMediaItem[]
}

export function parseSmil(smilXml: string): SmilPlaylist {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(smilXml, 'application/xml')

    const parserError = xmlDoc.querySelector('parsererror')

    if (parserError) {
        throw new Error('Failed to parse SMIL XML: ' + parserError.textContent)
    }

    const getMetaContent = (name: string) =>
        xmlDoc.querySelector(`meta[name="${name}"]`)?.getAttribute('content') || ''

    const getMetaHttpEquiv = (httpEquiv: string) =>
        xmlDoc.querySelector(`meta[http-equiv="${httpEquiv}"]`)?.getAttribute('content') || null

    const rootLayout = xmlDoc.querySelector('root-layout')

    const regionElements = xmlDoc.querySelectorAll('region')
    let regions: SmilRegion[] = Array.from(regionElements).map((el) => ({
        regionName: el.getAttribute('regionName') || '',
        top: el.getAttribute('top') || '0',
        left: el.getAttribute('left') || '0',
        width: el.getAttribute('width') || '0',
        height: el.getAttribute('height') || '0',
        zIndex: el.getAttribute('z-index') || '0',
        backgroundColor: el.getAttribute('background-color') || 'transparent',
    }))

    if (regions.length === 0) {
        regions = [{
            regionName: 'default',
            top: '0',
            left: '0',
            width: rootLayout?.getAttribute('width') || '1280',
            height: rootLayout?.getAttribute('height') || '720',
            zIndex: '0',
            backgroundColor: rootLayout?.getAttribute('backgroundColor') || '#000000',
        }]
    }

    const layout: SmilLayout = {
        backgroundColor: rootLayout?.getAttribute('backgroundColor') || '#000000',
        width: rootLayout?.getAttribute('width') || '1280',
        height: rootLayout?.getAttribute('height') || '720',
        regions,
    }

    const mediaTags: { tag: string; type: SmilMediaType }[] = [
        { tag: 'img', type: 'image' },
        { tag: 'video', type: 'video' },
        { tag: 'audio', type: 'audio' },
        { tag: 'ref', type: 'ref' },
    ]

    const media: SmilMediaItem[] = []

    mediaTags.forEach(({ tag, type }) => {
        const elements = xmlDoc.querySelectorAll(tag)

        elements.forEach((el) => {
            media.push({
                type,
                src: el.getAttribute('src'),
                duration: el.getAttribute('dur'),
                fit: el.getAttribute('fit'),
                region: el.getAttribute('region') || '',
            })
        })
    })

    const firstRegionName = regions[0]?.regionName || 'default'

    media.forEach(item => {
        if (!item.region) {
            item.region = firstRegionName
        }
    })

    const playlist: SmilPlaylist = {
        title: getMetaContent('title') || 'Untitled Playlist',
        refresh: getMetaHttpEquiv('Refresh'),
        layout,
        media,
    }

    return playlist
}
