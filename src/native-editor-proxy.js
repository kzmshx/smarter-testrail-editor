import { ContentChangeEvent, FileAttachEvent } from './event-dispatcher'

/**
 * @param {Node[]} nodes
 * @return {Element[]}
 */
const filterNodesToThoseContainingAttachments = nodes =>
    nodes.filter(node => node.nodeName === 'DIV').filter(element => element.hasAttribute('data-attachment-id'))

/**
 * @param {Node[]} nodes
 * @return {Boolean}
 */
const nodesContainsAttachments = nodes => filterNodesToThoseContainingAttachments(nodes).length > 0

/**
 * @param {Node[]} nodes
 * @return {String[]}
 */
const getAttachmentMarkdownUrlsFromNodes = nodes =>
    filterNodesToThoseContainingAttachments(nodes)
        .map(element => element.getAttribute('data-attachment-id'))
        .map(attachmentId => `![](index.php?/attachments/get/${attachmentId})`)

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

        this.#initElement()
        this.#observe()
    }

    #initElement() {}

    #observe() {
        const handler = () => {
            const newContent = this.#element.textContent
            const childNodes = [...this.#element.childNodes]

            if (newContent == this.#content) {
                return
            }

            if (nodesContainsAttachments(childNodes)) {
                this.dispatchEvent(
                    new FileAttachEvent({ markdownLinks: getAttachmentMarkdownUrlsFromNodes(childNodes) })
                )
                return
            }

            this.#content = newContent
            this.dispatchEvent(new ContentChangeEvent({ newContent }))
        }
        const options = { attributes: false, characterData: true, childList: true, subtree: true }

        new MutationObserver(handler).observe(this.#element, options)
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
