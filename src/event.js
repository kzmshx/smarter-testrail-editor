class Event {
    #type

    constructor(type) {
        this.#type = type
    }

    get type() {
        return this.#type
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

export { Event, ContentUpdateByHostEditorEvent, ImageAddByHostEditorEvent, ContentUpdateByExtensionEditorEvent }
