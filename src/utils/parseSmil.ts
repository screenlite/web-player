export type SmilMediaType = 'image' | 'video' | 'audio' | 'ref' | 'unknown'

export type SmilMediaItem = {
  type: SmilMediaType
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

    const layout: SmilLayout = {
        backgroundColor: rootLayout?.getAttribute('backgroundColor') || '#000000',
        width: rootLayout?.getAttribute('width') || '1280',
        height: rootLayout?.getAttribute('height') || '720',
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
            })
        })
    })

    const playlist: SmilPlaylist = {
        title: getMetaContent('title') || 'Untitled Playlist',
        refresh: getMetaHttpEquiv('Refresh'),
        layout,
        media,
    }

    return playlist
}
