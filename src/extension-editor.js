import ReactDOM from 'react-dom'
import React from 'react'
import Editor from './components/Editor'

export default class ExtensionEditor {
    /**
     * @type {NativeEditorProxy}
     */
    #nativeEditorProxy

    /**
     * @type {String}
     */
    #extensionEditorId

    /**
     * @param {NativeEditorProxy} nativeEditorProxy
     */
    constructor(nativeEditorProxy) {
        this.#nativeEditorProxy = nativeEditorProxy
    }

    /**
     * @param {HTMLElement} target
     */
    mount(target) {
        const fragment = document.createDocumentFragment()
        target.parentNode.prepend(fragment)

        this.#extensionEditorId = `smarter-testrail-editor-${target.id}`

        ReactDOM.render(<Editor id={this.#extensionEditorId} nativeEditorProxy={this.#nativeEditorProxy} />, fragment)
    }

    isAlive() {
        return document.getElementById(this.#extensionEditorId)
    }
}
