import ReactDOM from 'react-dom'
import Editor from './components/Editor'
import React from 'react'

export default class ExtensionEditorManager {
    /**
     * @type {String}
     */
    #extensionEditorId

    /**
     * @type {HTMLElement}
     */
    #editorElement

    /**
     * @type {EventDispatcher}
     */
    #dispatcher

    /**
     * @param {String} extensionEditorId
     * @param {HTMLElement} editorElement
     * @param {EventDispatcher} dispatcher
     */
    constructor(extensionEditorId, editorElement, dispatcher) {
        this.#extensionEditorId = extensionEditorId
        this.#editorElement = editorElement
        this.#dispatcher = dispatcher
    }

    start() {
        const mountTarget = document.createElement('div')
        this.#editorElement.parentNode.prepend(mountTarget)

        ReactDOM.render(
            <Editor
                id={this.#extensionEditorId}
                initialContent={this.#editorElement.textContent}
                wrapperStyles={window.getComputedStyle(this.#editorElement)}
                dispatcher={this.#dispatcher}
            />,
            mountTarget
        )
    }
}
