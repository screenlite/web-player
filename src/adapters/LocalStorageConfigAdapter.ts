import type { ConfigData, ConfigStorageAdapter } from '../types/config'
import { DEFAULT_CONFIG } from '../config/defaults'

const CONFIG_STORAGE_KEY = 'screenlite_config'

export class LocalStorageConfigAdapter implements ConfigStorageAdapter {
    async get(): Promise<ConfigData> {
        try {
            // Get environment variables
            const envConfig = {
                cmsAdapter: import.meta.env.VITE_CMS_ADAPTER || undefined,
                cmsAdapterUrl: import.meta.env.VITE_CMS_ADAPTER_URL || undefined,
                timezone: import.meta.env.VITE_TIMEZONE || undefined,
                playbackTrackerEnabled: import.meta.env.VITE_ENABLE_PLAYBACK_TRACKER === 'true' ? true : undefined
            }

            // Filter out undefined env values
            const filteredEnvConfig = Object.fromEntries(
                Object.entries(envConfig).filter(([_, value]) => value !== undefined)
            ) as Partial<ConfigData>

            // Get stored config
            const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY)
            const parsedStoredConfig: Partial<ConfigData> = storedConfig ? JSON.parse(storedConfig) : {}

            // Merge in order: defaults <- env <- stored (user settings)
            // This allows user settings to override environment variables
            return {
                ...DEFAULT_CONFIG,
                ...filteredEnvConfig,
                ...parsedStoredConfig
            } as ConfigData
        } catch (error) {
            console.error('Failed to get config from localStorage:', error)
            return DEFAULT_CONFIG
        }
    }

    async set(config: Partial<ConfigData>): Promise<void> {
        try {
            const existingConfig = await this.get()
            const newConfig = { ...existingConfig, ...config }
            localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(newConfig))
        } catch (error) {
            console.error('Failed to set config in localStorage:', error)
            throw error
        }
    }

    async clear(): Promise<void> {
        try {
            localStorage.removeItem(CONFIG_STORAGE_KEY)
        } catch (error) {
            console.error('Failed to clear config from localStorage:', error)
            throw error
        }
    }
} 