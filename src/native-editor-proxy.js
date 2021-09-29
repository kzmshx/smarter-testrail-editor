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
        convertImageToMarkdown(element)
        removeDeleteButton(element)
        removeWhitespaceSpan(element)
        removeWhitespaceText(element)

        this.#content = element.textContent
        this.#element = element
        this.#eventDispatcher = eventDispatcher

        this.#observe()
    }

    #observe() {
        new MutationObserver(() => {
            const newContent = this.#element.textContent
            const childNodes = [...this.#element.childNodes]

            if (newContent == this.#content) {
                return
            }

            if (nodesContainsAttachments(childNodes)) {
                const markdownLinks = getAttachmentMarkdownUrlsFromNodes(childNodes)
                this.#eventDispatcher.dispatch(new FileAttachEvent({ markdownLinks }))
                return
            }

            this.#content = newContent
            this.#eventDispatcher.dispatch(new ContentChangeEvent({ newContent }))
        }).observe(this.#element, { attributes: false, characterData: true, childList: true, subtree: true })
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
}
