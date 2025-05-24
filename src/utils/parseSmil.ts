export type SmilImage = {
	src: string | null
	duration: string | null
	fit: string | null
}

export type SmilLayout = {
	backgroundColor: string
	width: string
	height: string
}

export type SmilPlaylist = {
	title: string
	refresh: string | null
	layout: SmilLayout
	images: SmilImage[]
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

    const layout: SmilLayout = {
        backgroundColor: rootLayout?.getAttribute('backgroundColor') || '#000000',
        width: rootLayout?.getAttribute('width') || '1280',
        height: rootLayout?.getAttribute('height') || '720',
    }

    const images: SmilImage[] = Array.from(xmlDoc.querySelectorAll('img')).map((img) => ({
        src: img.getAttribute('src'),
        duration: img.getAttribute('dur'),
        fit: img.getAttribute('fit'),
    }))

    const playlist: SmilPlaylist = {
        title: getMetaContent('title') || 'Untitled Playlist',
        refresh: getMetaHttpEquiv('Refresh'),
        layout,
        images,
    }

    return playlist
}
