export const DEFAULT_CONFIG = {
    cmsAdapter: 'NetworkFile',
    cmsAdapterUrl: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    playbackTrackerEnabled: false
} as const

export const getDefaultValue = <K extends keyof typeof DEFAULT_CONFIG>(key: K) => DEFAULT_CONFIG[key] 