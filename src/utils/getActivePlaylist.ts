import type { Playlist } from '../types'

type PlaylistResult = {
	activePlaylist: Playlist | null;
	startTimestamp: number | null;
}

type TimeRange = {
	start: number;
	end: number;
	isOvernight: boolean;
}

function createEmptyResult(): PlaylistResult {
	return {
		activePlaylist: null,
		startTimestamp: null
	}
}

function getCurrentUTCDay(currentTimestampMs: number): Date {
	const currentDate = new Date(currentTimestampMs)
	return new Date(Date.UTC(
		currentDate.getUTCFullYear(),
		currentDate.getUTCMonth(),
		currentDate.getUTCDate()
	))
}

function parseDate(dateStr: string): Date {
	const [year, month, day] = dateStr.split('-').map(Number)
	return new Date(Date.UTC(year, month - 1, day))
}

function parseTimeToMinutes(timeStr: string): number {
	const [hours, minutes] = timeStr.split(':').map(Number)
	return hours * 60 + minutes
}

function getDailyTimeRange(startTime: string, endTime: string, day: Date): TimeRange {
	const startMinutes = parseTimeToMinutes(startTime)
	const endMinutes = parseTimeToMinutes(endTime)
	const isOvernight = endMinutes <= startMinutes

	const start = Date.UTC(
		day.getUTCFullYear(),
		day.getUTCMonth(),
		day.getUTCDate(),
		Math.floor(startMinutes / 60),
		startMinutes % 60
	)

	// For overnight schedules, end time is on the next day
	const endDate = new Date(day)
	if (isOvernight) {
		endDate.setUTCDate(endDate.getUTCDate() + 1)
	}

	const end = Date.UTC(
		endDate.getUTCFullYear(),
		endDate.getUTCMonth(),
		endDate.getUTCDate(),
		Math.floor(endMinutes / 60),
		endMinutes % 60
	)

	return { start, end, isOvernight }
}

function isAllDayPlaylist(playlist: Playlist): boolean {
	return playlist.start_time === '00:00:00' && playlist.end_time === '23:59:59'
}

function getAllDayStartTimestamp(startDate: Date): number {
	return Date.UTC(
		startDate.getUTCFullYear(),
		startDate.getUTCMonth(),
		startDate.getUTCDate(),
		0, 0, 0
	)
}

function getTimeRestrictedStartTimestamp(timeRange: TimeRange, currentTimestampMs: number, today: Date, playlist: Playlist): number {
	// For overnight schedules, check if we're in yesterday's schedule that runs into today
	if (timeRange.isOvernight) {
		const yesterdayDate = new Date(today)
		yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1)
		const yesterdayRange = getDailyTimeRange(playlist.start_time, playlist.end_time, yesterdayDate)
		
		if (currentTimestampMs <= timeRange.end) {
			// We're in the morning part of an overnight schedule
			return yesterdayRange.start
		}
	}
	
	// We're either in a regular schedule or the evening part of an overnight schedule
	return timeRange.start
}

function calculateStartTimestamp(playlist: Playlist, currentTimestampMs: number, today: Date): number {
	const startDate = parseDate(playlist.start_date)
	const timeRange = getDailyTimeRange(playlist.start_time, playlist.end_time, today)
	
	return isAllDayPlaylist(playlist)
		? getAllDayStartTimestamp(startDate)
		: getTimeRestrictedStartTimestamp(timeRange, currentTimestampMs, today, playlist)
}

function isPlaylistActive(playlist: Playlist, today: Date, currentTimestampMs: number): boolean {
	const startDate = parseDate(playlist.start_date)
	const endDate = parseDate(playlist.end_date)
	
	// Check if we're within the playlist's date range
	if (today < startDate || today > endDate) {
		return false
	}

	const timeRange = getDailyTimeRange(playlist.start_time, playlist.end_time, today)
	
	if (timeRange.isOvernight) {
		// For overnight schedules, also check yesterday's schedule
		const yesterdayDate = new Date(today)
		yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1)
		
		// Only check yesterday if we're still within the playlist's date range
		if (yesterdayDate >= startDate) {
			const yesterdayRange = getDailyTimeRange(playlist.start_time, playlist.end_time, yesterdayDate)
			if (currentTimestampMs <= yesterdayRange.end) {
				return true
			}
		}
	}
	
	return currentTimestampMs >= timeRange.start && currentTimestampMs <= timeRange.end
}

export const getActivePlaylist = (playlists: Playlist[], currentTimestampMs: number): PlaylistResult => {
	if (!playlists?.length) {
		return createEmptyResult()
	}

	const today = getCurrentUTCDay(currentTimestampMs)

	for (const playlist of playlists) {
		if (isPlaylistActive(playlist, today, currentTimestampMs)) {
			return {
				activePlaylist: playlist,
				startTimestamp: calculateStartTimestamp(playlist, currentTimestampMs, today)
			}
		}
	}

	return createEmptyResult()
}
