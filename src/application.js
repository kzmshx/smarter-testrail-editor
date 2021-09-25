import EventDispatcher from './event-dispatcher'
import HostEditorManager from './host-editor-manager'
import ExtensionEditorManager from './extension-editor-manager'

export default class Application {
    /**
     * @type {Map<string, null>}
     */
    #editors

    constructor() {
        this.#editors = new Map()
    }

    /**
     * @param {String} editorElementId
     * @returns {String}
     */
    extensionEditorId(editorElementId) {
        return `smarter-testrail-editor-${editorElementId}`
    }

    /**
     * @param {HTMLElement} editorElement
     */
    replaceEditor(editorElement) {
        const dispatcher = new EventDispatcher()

        new HostEditorManager(editorElement, dispatcher).start()
        new ExtensionEditorManager(this.extensionEditorId(editorElement.id), editorElement, dispatcher).start()

        return editorElement
    }

    replaceEditors() {
        const newEditors = new Map()
        for (const element of document.querySelectorAll('.field-editor')) {
            if (!this.#editors.get(element.id)) {
                this.replaceEditor(element)
            }
            newEditors.set(element.id, document.getElementById(this.extensionEditorId(element.id)))
        }
        this.#editors = newEditors
    }

    start() {
        this.replaceEditors()

        new MutationObserver(() => {
            this.replaceEditors()
        }).observe(document.body, {
            attributes: false,
            childList: true,
            subtree: true,
        })
    }
}
