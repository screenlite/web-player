import type { ConfigData } from '../types/config'
import { configStore } from '../store/configStore'

function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    attrs: Partial<HTMLElementTagNameMap[K]> = {},
    children: (HTMLElement | string)[] = []
): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag)
    Object.assign(node, attrs)
    for (const child of children) {
        if (typeof child === 'string') {
            node.appendChild(document.createTextNode(child))
        } else {
            node.appendChild(child)
        }
    }
    return node
}

function applyClass(node: HTMLElement, classes: string): void {
    node.className = classes
}

export class ConfigOverlay {
    el: HTMLDivElement
    private formData: ConfigData
    private inputs: Record<string, HTMLInputElement | HTMLSelectElement> = {}
    private unsubscribe: (() => void) | null = null

    constructor() {
        this.el = document.createElement('div')
        this.formData = { ...configStore.state.config }
        this.buildDOM()
        this.el.style.display = 'none'

        this.unsubscribe = configStore.subscribe(state => {
            this.el.style.display = state.isOverlayOpen ? 'flex' : 'none'
            if (state.isOverlayOpen) {
                this.formData = { ...state.config }
                this.syncInputsFromFormData()
            }
        })

        window.addEventListener('keydown', this.handleKeydown)
    }

    private handleKeydown = (e: KeyboardEvent): void => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault()
            configStore.setOverlayOpen(!configStore.state.isOverlayOpen)
        }
        if (e.key === 'Escape' && configStore.state.isOverlayOpen) {
            configStore.setOverlayOpen(false)
        }
    }

    private buildDOM(): void {
        applyClass(this.el, 'fixed inset-0 flex items-center justify-center p-4 backdrop-blur-sm')
        Object.assign(this.el.style, {
            position: 'fixed',
            inset: '0',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backdropFilter: 'blur(4px)',
            background: 'rgba(0,0,0,0.5)',
            zIndex: '1000',
        })

        const card = document.createElement('div')
        Object.assign(card.style, {
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: '448px',
        })

        const inner = document.createElement('div')
        inner.style.padding = '24px'

        // Header
        const header = document.createElement('div')
        Object.assign(header.style, { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' })

        const titleWrap = document.createElement('div')
        const title = el('h2', {}, ['Configuration'])
        Object.assign(title.style, { fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: '0' })
        const subtitle = el('p', {}, ['Press Ctrl+S to toggle settings'])
        Object.assign(subtitle.style, { fontSize: '0.875rem', color: '#6B7280', marginTop: '4px' })
        titleWrap.appendChild(title)
        titleWrap.appendChild(subtitle)

        const closeBtn = document.createElement('button')
        closeBtn.type = 'button'
        Object.assign(closeBtn.style, { color: '#9CA3AF', cursor: 'pointer', background: 'none', border: 'none', padding: '4px' })
        closeBtn.innerHTML = `<svg style="width:24px;height:24px" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`
        closeBtn.addEventListener('click', () => configStore.setOverlayOpen(false))

        header.appendChild(titleWrap)
        header.appendChild(closeBtn)

        // Form
        const form = document.createElement('form')
        form.addEventListener('submit', this.handleSubmit)

        form.appendChild(this.buildSelectField('cmsAdapter', 'CMS Adapter', [
            { value: 'NetworkFile', label: 'Network File' },
            { value: 'Screenlite', label: 'Screenlite' },
            { value: 'GarlicHub', label: 'Garlic-Hub' },
        ]))
        form.appendChild(this.buildTextField('cmsAdapterUrl', 'CMS Adapter URL'))
        form.appendChild(this.buildTextField('timezone', 'Timezone'))
        form.appendChild(this.buildCheckboxField('playbackTrackerEnabled', 'Enable Playback Tracker'))

        const actions = document.createElement('div')
        Object.assign(actions.style, { marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' })

        const cancelBtn = el('button', { type: 'button' }, ['Cancel'])
        Object.assign(cancelBtn.style, {
            padding: '8px 16px', fontSize: '0.875rem', fontWeight: '500',
            color: '#374151', background: 'white', border: '1px solid #D1D5DB',
            borderRadius: '6px', cursor: 'pointer',
        })
        cancelBtn.addEventListener('click', () => configStore.setOverlayOpen(false))

        const saveBtn = el('button', { type: 'submit' }, ['Save Changes'])
        Object.assign(saveBtn.style, {
            padding: '8px 16px', fontSize: '0.875rem', fontWeight: '500',
            color: 'white', background: '#2563EB', border: 'none',
            borderRadius: '6px', cursor: 'pointer',
        })

        actions.appendChild(cancelBtn)
        actions.appendChild(saveBtn)
        form.appendChild(actions)

        inner.appendChild(header)
        inner.appendChild(form)
        card.appendChild(inner)
        this.el.appendChild(card)
    }

    private buildTextField(name: keyof ConfigData, label: string): HTMLDivElement {
        const wrap = document.createElement('div')
        wrap.style.marginBottom = '16px'

        const labelEl = document.createElement('label')
        const span = document.createElement('span')
        Object.assign(span.style, { display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: '500', color: '#374151' })
        span.textContent = label

        const input = document.createElement('input')
        input.type = 'text'
        input.name = name
        input.value = String(this.formData[name] ?? '')
        Object.assign(input.style, {
            marginTop: '4px', display: 'block', width: '100%', borderRadius: '6px',
            border: '1px solid #D1D5DB', padding: '6px 12px', fontSize: '0.875rem',
            boxSizing: 'border-box',
        })
        input.addEventListener('input', () => {
            (this.formData as unknown as Record<string, unknown>)[name] = input.value
        })

        this.inputs[name] = input
        labelEl.appendChild(span)
        labelEl.appendChild(input)
        wrap.appendChild(labelEl)
        return wrap
    }

    private buildSelectField(name: keyof ConfigData, label: string, options: { value: string; label: string }[]): HTMLDivElement {
        const wrap = document.createElement('div')
        wrap.style.marginBottom = '16px'

        const labelEl = document.createElement('label')
        const span = document.createElement('span')
        Object.assign(span.style, { display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: '500', color: '#374151' })
        span.textContent = label

        const select = document.createElement('select')
        select.name = name
        Object.assign(select.style, {
            marginTop: '4px', display: 'block', width: '100%', borderRadius: '6px',
            border: '1px solid #D1D5DB', padding: '6px 12px', fontSize: '0.875rem',
            boxSizing: 'border-box',
        })
        for (const opt of options) {
            const option = document.createElement('option')
            option.value = opt.value
            option.textContent = opt.label
            select.appendChild(option)
        }
        select.value = String(this.formData[name] ?? '')
        select.addEventListener('change', () => {
            (this.formData as unknown as Record<string, unknown>)[name] = select.value
        })

        this.inputs[name] = select
        labelEl.appendChild(span)
        labelEl.appendChild(select)
        wrap.appendChild(labelEl)
        return wrap
    }

    private buildCheckboxField(name: keyof ConfigData, label: string): HTMLDivElement {
        const wrap = document.createElement('div')
        wrap.style.marginBottom = '16px'

        const labelEl = document.createElement('label')
        Object.assign(labelEl.style, { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: '500', color: '#374151' })

        const input = document.createElement('input')
        input.type = 'checkbox'
        input.name = name
        input.checked = Boolean(this.formData[name])
        Object.assign(input.style, { width: '16px', height: '16px' })
        input.addEventListener('change', () => {
            (this.formData as unknown as Record<string, unknown>)[name] = input.checked
        })

        const span = document.createElement('span')
        span.textContent = label

        this.inputs[name] = input
        labelEl.appendChild(input)
        labelEl.appendChild(span)
        wrap.appendChild(labelEl)
        return wrap
    }

    private syncInputsFromFormData(): void {
        for (const [name, inputEl] of Object.entries(this.inputs)) {
            const key = name as keyof ConfigData
            if (inputEl instanceof HTMLInputElement && inputEl.type === 'checkbox') {
                inputEl.checked = Boolean(this.formData[key])
            } else {
                inputEl.value = String(this.formData[key] ?? '')
            }
        }
    }

    private handleSubmit = async (e: Event): Promise<void> => {
        e.preventDefault()
        await configStore.updateConfig(this.formData)
        configStore.setOverlayOpen(false)
    }

    mount(parent: HTMLElement): void {
        parent.appendChild(this.el)
    }

    destroy(): void {
        this.unsubscribe?.()
        window.removeEventListener('keydown', this.handleKeydown)
        this.el.remove()
    }
}
