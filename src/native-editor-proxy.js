import { ContentChangeEvent, FileAttachEvent } from './event-dispatcher'

const attachmentImageFilter = node =>
    node.nodeName === 'DIV' &&
    node.classList.contains('attachment-list-item') &&
    node.hasAttribute('data-attachment-id')

const attachmentDeleteButtonFilter = node =>
    node.nodeName === 'DIV' && node.classList.contains('attachment-list-delete-inline')

const attachmentWhitespaceSpanFilter = node =>
    node.nodeName === 'SPAN' && node.classList.contains('inline-attachment-list-whitespace')

const attachmentWhitespaceTextFilter = node => node.nodeName === '#text' && node.textContent == String.fromCharCode(160)

const createAttachmentUrl = attachmentId => `index.php?/attachments/get/${attachmentId}`

const createAttachmentMarkdown = attachmentUrl => `![](${attachmentUrl})`

/**
 * @param {Node[]} nodes
 * @return {Boolean}
 */
const nodesContainsAttachments = nodes => nodes.filter(attachmentImageFilter).length > 0

/**
 * @param {Node[]} nodes
 * @return {String[]}
 */
const getAttachmentMarkdownUrlsFromNodes = nodes =>
    nodes
        .filter(attachmentImageFilter)
        .map(element => element.getAttribute('data-attachment-id'))
        .map(createAttachmentUrl)
        .map(createAttachmentMarkdown)

const convertImageToMarkdown = element => {
    const imageNodes = [...element.childNodes].filter(attachmentImageFilter)
    for (const node of imageNodes) {
        const markdownLinkText = createAttachmentMarkdown(createAttachmentUrl(node.getAttribute('data-attachment-id')))
        const markdownLinkTextNode = document.createTextNode(markdownLinkText)
        element.replaceChild(markdownLinkTextNode, node)
    }
}

const removeDeleteButton = element => {
    const deleteButtonNodes = [...element.childNodes].filter(attachmentDeleteButtonFilter)
    for (const node of deleteButtonNodes) {
        element.removeChild(node)
    }
}

const removeWhitespaceSpan = element => {
    const whitespaceSpanNodes = [...element.childNodes].filter(attachmentWhitespaceSpanFilter)
    for (const node of whitespaceSpanNodes) {
        element.removeChild(node)
    }
}

const removeWhitespaceText = element => {
    const whitespaceTextNodes = [...element.childNodes].filter(attachmentWhitespaceTextFilter)
    for (const node of whitespaceTextNodes) {
        element.removeChild(node)
    }
}

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

    getContent() {
        return this.#content
    }

    updateContent(content) {
        this.#content = content
        this.#element.textContent = content
        this.#element.dispatchEvent(new Event('input'))
        this.#element.dispatchEvent(new Event('keyup'))
    }

    addEventListener(type, listener) {
        this.#eventDispatcher.addListener(type, listener)
    }

    removeEventListener(type, listener) {
        this.#eventDispatcher.removeListener(type, listener)
    }

    #initElement() {
        convertImageToMarkdown(this.#element)
        removeDeleteButton(this.#element)
        removeWhitespaceSpan(this.#element)
        removeWhitespaceText(this.#element)
        this.#content = this.#element.textContent
    }

    #dispatchEvent(event) {
        this.#eventDispatcher.dispatch(event)
    }

    #observe() {
        const handler = () => {
            const newContent = this.#element.textContent
            const childNodes = [...this.#element.childNodes]

            if (newContent == this.#content) {
                return
            }

            if (nodesContainsAttachments(childNodes)) {
                this.#dispatchEvent(
                    new FileAttachEvent({ markdownLinks: getAttachmentMarkdownUrlsFromNodes(childNodes) })
                )
                return
            }

            this.#content = newContent
            this.#dispatchEvent(new ContentChangeEvent({ newContent }))
        }
        const options = { attributes: false, characterData: true, childList: true, subtree: true }

        new MutationObserver(handler).observe(this.#element, options)
    }
}
