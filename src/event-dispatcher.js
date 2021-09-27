class Event {
    #type

    constructor(type) {
        this.#type = type
    }

    get type() {
        return this.#type
    }
}

class EventDispatcher {
    /**
     * @type {Map<string, Function[]>}
     */
    #listeners

    constructor() {
        this.#listeners = new Map()
    }

    /**
     * @param {String} type
     * @returns {Function[]}
     */
    getListeners(type) {
        return this.#listeners.get(type) ?? []
    }

    /**
     * @param {String} type
     * @param {Function} listener
     */
    addListener(type, listener) {
        this.#listeners.set(type, this.getListeners(type).concat(listener))
    }

    /**
     * @param {String} type
     * @param {Function} listener
     */
    removeListener(type, listener) {
        this.#listeners.set(
            type,
            this.getListeners(type).filter(l => l !== listener)
        )
    }

    /**
     * @param {Event} event
     */
    dispatch(event) {
        for (const listener of this.getListeners(event.type)) {
            listener(event)
        }
    }
}

class ContentUpdateByExtensionEditorEvent extends Event {
    #detail

    constructor({ newContent }) {
        super('content-update-by-extension-editor')
        this.#detail = {
            newContent,
        }
    }

    get detail() {
        return this.#detail
    }
}

class ContentUpdateByHostEditorEvent extends Event {
    #detail

    constructor({ newContent }) {
        super('content-update-by-host-editor')
        this.#detail = {
            newContent,
        }
    }

    get detail() {
        return this.#detail
    }
}

class ImageAddByHostEditorEvent extends Event {
    #detail

    constructor({ imageUrls }) {
        super('image-add-by-host-editor')
        this.#detail = {
            imageUrls,
        }
    }

    get detail() {
        return this.#detail
    }
}

export {
    Event,
    EventDispatcher,
    ContentUpdateByExtensionEditorEvent,
    ContentUpdateByHostEditorEvent,
    ImageAddByHostEditorEvent,
}
