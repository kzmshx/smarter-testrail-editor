const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout))

const createDiv = (...nodes) => {
    const element = document.createElement('div')
    const fragment = document.createDocumentFragment()
    for (const node of nodes) {
        fragment.appendChild(node)
    }
    element.appendChild(fragment)
    return element
}

const createAttachmentImageDiv = attachmentId => {
    const element = document.createElement('div')
    element.classList.add('attachment-list-item', 'attachment-block', 'attachment-bitmap', 'lazy')
    element.setAttribute('data-attachment-id', attachmentId)
    return element
}

const createAttachmentDeleteButtonDiv = () => {
    const element = document.createElement('div')
    element.classList.add('inlineAttachmentListRemove', 'attachment-list-delete-inline')
    return element
}

const createAttachmentWhitespaceSpan = () => {
    const element = document.createElement('span')
    element.classList.add('inline-attachment-list-whitespace')
    return element
}

const createWhitespaceText = () => document.createTextNode(String.fromCharCode(160))

const createAttachmentFragment = attachmentIds => {
    const fragment = document.createDocumentFragment()
    for (const attachmentId of attachmentIds) {
        fragment.appendChild(createAttachmentImageDiv(attachmentId))
    }
    fragment.appendChild(createAttachmentDeleteButtonDiv())
    fragment.appendChild(createAttachmentWhitespaceSpan())
    fragment.appendChild(createWhitespaceText())
    return fragment
}

export {
    sleep,
    createDiv,
    createAttachmentImageDiv,
    createAttachmentDeleteButtonDiv,
    createAttachmentWhitespaceSpan,
    createWhitespaceText,
    createAttachmentFragment,
}
