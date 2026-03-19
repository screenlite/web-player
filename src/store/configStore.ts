import type { ConfigData, ConfigStorageAdapter } from '../types/config'
import { LocalStorageConfigAdapter } from '../adapters/LocalStorageConfigAdapter'
import { DEFAULT_CONFIG } from '../config/defaults'
import { Observable } from '../core/state'

interface ConfigState {
    config: ConfigData
    adapter: ConfigStorageAdapter
    isOverlayOpen: boolean
}

class ConfigStore extends Observable<ConfigState> {
    constructor() {
        super({
            config: DEFAULT_CONFIG,
            adapter: new LocalStorageConfigAdapter(),
            isOverlayOpen: false,
        })
    }

    async loadConfig(): Promise<void> {
        const config = await this.state.adapter.get()
        this.set({ config })
    }

    async updateConfig(newConfig: Partial<ConfigData>): Promise<void> {
        await this.state.adapter.set(newConfig)
        this.set(prev => ({ config: { ...prev.config, ...newConfig } }))
    }

    async clearConfig(): Promise<void> {
        await this.state.adapter.clear()
        this.set({ config: DEFAULT_CONFIG })
    }

    setOverlayOpen(isOpen: boolean): void {
        this.set({ isOverlayOpen: isOpen })
    }
}

export const configStore = new ConfigStore()
