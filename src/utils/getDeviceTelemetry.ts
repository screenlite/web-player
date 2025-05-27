import type { DeviceTelemetry } from '../types'

const getLocalIpAddress = async (): Promise<string> => {
    return '0.0.0.0'
}

const getMacAddress = (): string => {
    return '00:00:00:00:00:00'
}

const getSoftwareVersion = (): string => {
    return '0.0.1'
}

const getScreenResolution = () => {
    return {
        width: window.screen.width,
        height: window.screen.height,
    }
}

export const getDeviceTelemetry = async (): Promise<DeviceTelemetry> => {
    const localIpAddress = await getLocalIpAddress()
    const macAddress = getMacAddress()
    const softwareVersion = getSoftwareVersion()
    const { width: screenResolutionWidth, height: screenResolutionHeight } = getScreenResolution()

    const memory = await (async () => {
        if (navigator.storage && navigator.storage.estimate) {
            const estimate = await navigator.storage.estimate()

            return {
                totalMemory: estimate.quota || 0,
                freeMemory: estimate.quota && estimate.usage ? estimate.quota - estimate.usage : estimate.quota || 0
            }
        }
        return {
            totalMemory: 0,
            freeMemory: 0
        }
    })()

    return {
        localIpAddress,
        macAddress,
        softwareVersion,
        screenResolutionWidth,
        screenResolutionHeight,
        hostname: window.location.hostname,
        platform: 'browser',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        osRelease: navigator.userAgent,
        ...memory,
    }
}
