import React from 'react'
import * as ReactDOM from 'react-dom'
import Editor from './Editor'

const extEditorId = id => `smarter-testrail-editor-${id}`

const attachmentImageNodeFilter = n => n.nodeName === 'DIV' && n.classList.contains('attachment-list-item')

const attachmentWhitespaceTextNodeFilter = n => n.nodeName === '#text' && n.textContent === String.fromCharCode(160)

const textNodeFilter = n => n.nodeName === '#text' && !attachmentWhitespaceTextNodeFilter(n)

const otherThanTextNodeFilter = n => !textNodeFilter(n)

const convertAttachmentNodesToTextNodes = target => {
    for (const node of [...target.childNodes.values()].filter(attachmentImageNodeFilter)) {
        console.log(node)
        node.parentNode.replaceChild(document.createTextNode(`![](${node.getAttribute('data-attachment-id')})`), node)
    }
    for (const node of [...target.childNodes.values()].filter(otherThanTextNodeFilter)) {
        console.log(node)
        node.parentNode.removeChild(node)
    }
}

const replaceEditor = target => {
    const root = document.createElement('div')
    target.parentNode.prepend(root)

    // set original editor styles
    target.style.setProperty('display', 'none')
    target.style.setProperty('white-space', 'pre', 'important')

    convertAttachmentNodesToTextNodes(target)

    // register event dispatcher of image adding
    new MutationObserver(entries => {
        const addedNodes = entries.map(e => [...e.addedNodes.values()]).reduce((a, v) => a.concat(v), [])
        const attachments = addedNodes.filter(attachmentImageNodeFilter)
        const texts = addedNodes.filter(textNodeFilter)

        if (attachments.length > 0 && texts.length > 0) {
            convertAttachmentNodesToTextNodes(target)
            const content = target.textContent

            target.dispatchEvent(
                new CustomEvent('content-init', {
                    bubbles: true,
                    cancelable: true,
                    detail: {
                        content,
                    },
                })
            )
        } else if (attachments.length > 0) {
            const markdownLinks = attachments
                .map(node => node.getAttribute('data-attachment-id'))
                .map(attachmentId => `![](index.php?/attachments/get/${attachmentId})`)
            if (markdownLinks.length > 0) {
                target.dispatchEvent(
                    new CustomEvent('image-add', {
                        bubbles: true,
                        cancelable: true,
                        detail: { markdownLinks },
                    })
                )
            }
        } else {
            target.dispatchEvent(
                new CustomEvent('content-change', {
                    bubbles: true,
                    cancelable: true,
                    detail: {
                        content: target.textContent,
                    },
                })
            )
        }
    }).observe(target, {
        attributes: false,
        childList: true,
        subtree: true,
    })

    // replace original editor with extension editor
    ReactDOM.render(<Editor target={target} id={extEditorId(target.id)} />, root)

    return target
}

let editors = new Map()

let updateEditors = editors =>
    new Map(
        Array.from(document.querySelectorAll('.field-editor'))
            .map(element => (editors.get(element.id) ? element : replaceEditor(element)))
            .map(element => [element.id, document.getElementById(extEditorId(element.id))])
    )

editors = updateEditors(editors)

new MutationObserver(() => {
    editors = updateEditors(editors)
}).observe(document.body, {
    attributes: false,
    childList: true,
    subtree: true,
})
