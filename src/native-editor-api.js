class State {
    #textContent

    constructor(textContent) {
        this.#textContent = textContent
    }

    get textContent() {
        return this.#textContent
    }

    updateTextContent(textContent) {
        this.#textContent = textContent
    }
}

export default class NativeEditorApi {
    /**
     * @type {State}
     */
    #state

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
        this.#state = new State(element.textContent)
        this.#element = element
        this.#eventDispatcher = eventDispatcher
    }

    getTextContent() {
        return this.#state.textContent
    }

    updateTextContent(newTextContent) {
        this.#state.updateTextContent(newTextContent)
        this.#element.textContent = newTextContent
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