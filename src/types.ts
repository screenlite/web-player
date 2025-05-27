export type Playlist = {
	id: string
	start_date: string
	end_date: string
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
	preloadIndex: null | number
	totalDuration: number
}

export type CMSAdapter = {
  connect(): void;
  disconnect(): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdate(callback: (state: any) => void): void;
}

export type DeviceTelemetry = {
	localIpAddress: string;
	macAddress: string;
	softwareVersion: string;
	screenResolutionWidth: number;
	screenResolutionHeight: number;
	platform: string
	hostname: string
	timezone: string
	totalMemory: number
	freeMemory: number
	osRelease: string
}

export type InitDeviceInfo = DeviceTelemetry & {
	token: string
}