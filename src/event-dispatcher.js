export default class EventDispatcher {
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
