import { useEffect, useState } from 'react'
import { useConfigStore } from '../stores/configStore'
import type { ConfigData } from '../types/config'

export const ConfigOverlay = () => {
    const { config, isOverlayOpen, updateConfig, setOverlayOpen } = useConfigStore()
    const [formData, setFormData] = useState<ConfigData>(config)

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Ctrl/Cmd + S
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault()
                setOverlayOpen(!isOverlayOpen)
            }
            // Escape to close
            if (e.key === 'Escape' && isOverlayOpen) {
                setOverlayOpen(false)
            }
        }

        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [setOverlayOpen, isOverlayOpen])

    useEffect(() => {
        setFormData(config)
    }, [config])

    if (!isOverlayOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await updateConfig(formData)
        setOverlayOpen(false)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }))
    }

    const renderField = (
        name: keyof ConfigData,
        label: string,
        type: 'text' | 'select' | 'checkbox' = 'text',
        options?: { value: string; label: string }[]
    ) => {
        return (
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                    {type === 'checkbox' ? (
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name={name}
                                checked={formData[name] as boolean}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2">{label}</span>
                        </div>
                    ) : (
                        <>
                            <span className="block mb-1">{label}</span>
                            {type === 'select' ? (
                                <select
                                    name={name}
                                    value={formData[name] as string}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    {options?.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    name={name}
                                    value={formData[name] as string}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            )}
                        </>
                    )}
                </label>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm z-[1000]">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Configuration</h2>
                            <p className="text-sm text-gray-500 mt-1">Press Ctrl+S to toggle settings</p>
                        </div>
                        <button
                            onClick={() => setOverlayOpen(false)}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        {renderField('cmsAdapter', 'CMS Adapter', 'select', [
                            { value: 'NetworkFile', label: 'Network File' },
                            { value: 'Screenlite', label: 'Screenlite' },
                            { value: 'GarlicHub', label: 'Garlic-Hub' }
                        ])}
                        {renderField('cmsAdapterUrl', 'CMS Adapter URL')}
                        {renderField('timezone', 'Timezone')}
                        {renderField('playbackTrackerEnabled', 'Enable Playback Tracker', 'checkbox')}

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setOverlayOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
} 