export type Playlist = {
	start_time: string
	end_time: string
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

type Item = {
	id: string
	content_type: 'image' | 'video' | string
	content_path: string
	duration: number
}
