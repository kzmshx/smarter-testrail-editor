export default class NativeEditorProxy {
    /**
     * @type {String}
     */
    #content

    /**
     * @type {HTMLElement}
     */
    #element

    /**
     * @type {EventDispatcher}
     */
    #eventDispatcher

    /**
     * @param {HTMLElement} element
     * @param {EventDispatcher} eventDispatcher
     */
    constructor(element, eventDispatcher) {
        this.#content = element.textContent
        this.#element = element
        this.#eventDispatcher = eventDispatcher
    }

    getContent() {
        return this.#content
    }

    updateContent(content) {
        this.#content = content
        this.#element.textContent = content
        this.#element.dispatchEvent(new Event('input'))
        this.#element.dispatchEvent(new Event('keyup'))
    }

    dispatchEvent(event) {
        this.#eventDispatcher.dispatch(event)
    }

    addEventListener(type, listener) {
        this.#eventDispatcher.addListener(type, listener)
    }

    removeEventListener(type, listener) {
        this.#eventDispatcher.removeListener(type, listener)
    }
}
