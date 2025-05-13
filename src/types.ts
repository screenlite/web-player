export type Playlist = {
	id: string
	start_time: string
	end_time: string
	width: number
	height: number
	sections: Section[]
}

export type FlattenedItem = Item & {
	position: Position
}

export type Section = {
	id: string
	position: Position
	items: Item[]
}

type Position = {
	x: number
	y: number
	width: number
	height: number
	z_index: number
}

export type Item = {
	id: string
	content_type: 'image' | 'video' | string
	content_path: string
	duration: number
}

export type MediaItem = {
	id: string,
	src: string,
	type: string,
	duration: number,
	hidden: boolean,
	preload: boolean,
}

export type MediaSequenceState = {
	currentIndex: number
	elapsedInCurrentItem: number
	shouldPreloadNext: boolean
	nextItemIndex: number
	playbackStartTime: number
	totalDuration: number
}