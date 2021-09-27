import { ContentUpdateByHostEditorEvent, ImageAddByHostEditorEvent } from './event-dispatcher'

const compose =
    (...fns) =>
    args =>
        fns.reduce((arg, fn) => fn(arg), args)

const nodeIsElement = node => node instanceof Element
const elementHasAttachmentId = element => element.hasAttribute('data-attachment-id')
const elementToAttachmentId = element => element.getAttribute('data-attachment-id')
const attachmentIdToAttachmentUrl = attachmentId => `index.php?/attachments/get/${attachmentId}`
const imageUrlToMarkdownLink = imageUrl => `![](${imageUrl})`

class MutationRecords {
    /**
     * @type {MutationRecord[]}
     */
    #records

    /**
     * @param {MutationRecord[]} mutationRecordArray
     */
    constructor(mutationRecordArray) {
        this.#records = mutationRecordArray
    }

    /**
     * @returns {Element[]}
     */
    getImageElements() {
        return this.#records
            .filter(record => record.type === 'childList')
            .map(record => [...record.addedNodes.values()])
            .reduce((a, v) => a.concat(v), [])
            .filter(nodeIsElement)
            .filter(elementHasAttachmentId)
    }

    /**
     * @returns {Boolean}
     */
    hasImageElement() {
        return this.getImageElements().length > 0
    }

    /**
     * @returns {String[]}
     */
    getImageUrls() {
        return this.getImageElements().map(elementToAttachmentId).map(attachmentIdToAttachmentUrl)
    }
}

export default class HostEditorManager {
    /**
     * @type {HTMLElement}
     */
    #editorElement

    /**
     * @type {EventDispatcher}
     */
    #dispatcher

    /**
     * @type {Boolean}
     */
    #lock

    /**
     * @param {HTMLElement} editorElement
     * @param {EventDispatcher} dispatcher
     */
    constructor(editorElement, dispatcher) {
        this.#editorElement = editorElement
        this.#dispatcher = dispatcher
        this.#lock = false
    }

    /**
     * @param {MutationRecord[]} mutations
     */
    handleEditorElementMutations(mutations) {
        if (this.#lock) {
            this.#lock = false
            return
        }

        const mutationRecords = new MutationRecords(mutations)
        if (mutationRecords.hasImageElement()) {
            this.#dispatcher.dispatch(new ImageAddByHostEditorEvent({ imageUrls: mutationRecords.getImageUrls() }))
            return
        }

        this.#dispatcher.dispatch(new ContentUpdateByHostEditorEvent({ newContent: this.#editorElement.textContent }))
    }

    /**
     * @param {ContentUpdateByExtensionEditorEvent} event
     */
    handleContentUpdateByExtensionEditor(event) {
        if (this.#editorElement.textContent == event.detail.newContent) {
            return
        }

        // this.#editorElement.textContent = event.detail.newContent
        this.#editorElement.textContent = event.detail.newContent
        this.#editorElement.dispatchEvent(new Event('input'))
        this.#editorElement.dispatchEvent(new Event('keyup'))
        this.#lock = true
    }

    start() {
        // set original editor styles
        this.#editorElement.style.setProperty('display', 'none')
        this.#editorElement.style.setProperty('white-space', 'pre', 'important')

        for (const element of document.querySelectorAll('.icon-markdown-table')) {
            element.parentElement.style.setProperty('display', 'none')
        }

        for (const node of this.#editorElement.childNodes) {
            if (nodeIsElement(node) && elementHasAttachmentId(node)) {
                const markdownLinkTextNode = compose(
                    elementToAttachmentId,
                    attachmentIdToAttachmentUrl,
                    imageUrlToMarkdownLink,
                    markdownLink => document.createTextNode(markdownLink)
                )(node)
                node.parentNode.replaceChild(markdownLinkTextNode, node)
            } else if (node.nodeName !== '#text' || node.nodeValue === String.fromCharCode(160)) {
                node.parentNode.removeChild(node)
            }
        }

        new MutationObserver(this.handleEditorElementMutations.bind(this)).observe(this.#editorElement, {
            attributes: false,
            subtree: true,
            childList: true,
            characterData: true,
        })

        this.#dispatcher.addListener(
            'content-update-by-extension-editor',
            this.handleContentUpdateByExtensionEditor.bind(this)
        )
    }
}
