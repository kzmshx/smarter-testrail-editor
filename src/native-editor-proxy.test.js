import NativeEditorProxy from './native-editor-proxy'
import { EventDispatcher } from './event-dispatcher'

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

describe('NativeEditorProxy', () => {
    describe('On initialization', () => {
        it('converts attachment image nodes to markdown link text node', () => {
            const element = createDiv(
                document.createTextNode('before;'),
                createAttachmentImageDiv('attachment-id-1'),
                createAttachmentImageDiv('attachment-id-2'),
                document.createTextNode('after')
            )
            const nativeEditorProxy = new NativeEditorProxy(element, new EventDispatcher())

            const expectedContent =
                'before;![](index.php?/attachments/get/attachment-id-1)![](index.php?/attachments/get/attachment-id-2)after'
            expect(nativeEditorProxy.getContent()).toStrictEqual(expectedContent)
            expect(element.innerHTML).toStrictEqual(expectedContent)
        })

        it('removes attachment delete button nodes', () => {
            const element = createDiv(
                document.createTextNode('before;'),
                createAttachmentDeleteButtonDiv(),
                document.createTextNode('after')
            )
            const nativeEditorProxy = new NativeEditorProxy(element, new EventDispatcher())

            const expectedContent = 'before;after'
            expect(nativeEditorProxy.getContent()).toStrictEqual(expectedContent)
            expect(element.innerHTML).toStrictEqual(expectedContent)
        })

        it('removes whitespace span nodes', () => {
            const element = createDiv(
                document.createTextNode('before;'),
                createAttachmentWhitespaceSpan(),
                document.createTextNode('after')
            )
            const nativeEditorProxy = new NativeEditorProxy(element, new EventDispatcher())

            const expectedContent = 'before;after'
            expect(nativeEditorProxy.getContent()).toStrictEqual(expectedContent)
            expect(element.innerHTML).toStrictEqual(expectedContent)
        })

        it('removes whitespace text nodes', () => {
            const element = createDiv(
                document.createTextNode('before;'),
                createWhitespaceText(),
                createWhitespaceText(),
                document.createTextNode('after')
            )
            const nativeEditorProxy = new NativeEditorProxy(element, new EventDispatcher())

            const expectedContent = 'before;after'
            expect(nativeEditorProxy.getContent()).toStrictEqual(expectedContent)
            expect(element.innerHTML).toStrictEqual(expectedContent)
        })
    })

    describe('getContent', () => {
        it('returns current contents of the native editor', () => {
            const element = createDiv(document.createTextNode('current content'))
            const nativeEditorProxy = new NativeEditorProxy(element, new EventDispatcher())

            expect(nativeEditorProxy.getContent()).toStrictEqual('current content')
        })
    })

    describe('updateContent', () => {
        it('updates the contents of the native editor', () => {
            const element = createDiv(document.createTextNode('initial content'))
            const nativeEditorProxy = new NativeEditorProxy(element, new EventDispatcher())

            nativeEditorProxy.updateContent('updated content')

            expect(nativeEditorProxy.getContent()).toStrictEqual('updated content')
            expect(element.textContent).toStrictEqual('updated content')
        })
    })

    describe('add and remove event listener, and dispatch event', () => {
        it('dispatches ContentChangeEvent only when the textContent of the native editor is changed', async () => {
            const element = createDiv(document.createTextNode('initial content'))
            const nativeEditorProxy = new NativeEditorProxy(element, new EventDispatcher())

            const results = []
            const handleContentChange = event => results.push(event.detail.newContent)
            nativeEditorProxy.addEventListener('content-change', handleContentChange)

            element.textContent = 'an updated content'
            await sleep(100)
            expect(results).toStrictEqual(['an updated content'])

            element.textContent = 'an updated content'
            await sleep(100)
            expect(results).toStrictEqual(['an updated content'])

            element.textContent = 'another updated content'
            await sleep(100)
            expect(results).toStrictEqual(['an updated content', 'another updated content'])
        })

        it('can remove listener', async () => {
            const element = createDiv(document.createTextNode('initial content'))
            const nativeEditorProxy = new NativeEditorProxy(element, new EventDispatcher())

            const results = []
            const handleContentChange = event => results.push(event.detail.newContent)

            nativeEditorProxy.addEventListener('content-change', handleContentChange)
            element.textContent = 'an updated content'
            await sleep(100)
            expect(results).toStrictEqual(['an updated content'])

            nativeEditorProxy.removeEventListener('content-change', handleContentChange)
            element.textContent = 'another updated content'
            await sleep(100)
            expect(results).toStrictEqual(['an updated content'])
        })

        it('dispatches FileAttachEvent when images are attached to the native editor with markdown link text for the attachments', async () => {
            const element = createDiv(document.createTextNode('initial content'))
            const nativeEditorProxy = new NativeEditorProxy(element, new EventDispatcher())

            const results = []
            const handleFileAttach = event => results.push(event.detail.markdownLinks)
            nativeEditorProxy.addEventListener('file-attach', handleFileAttach)

            element.appendChild(createAttachmentFragment(['attachment-id-1', 'attachment-id-2', 'attachment-id-3']))
            await sleep(100)
            expect(results).toStrictEqual([
                [
                    '![](index.php?/attachments/get/attachment-id-1)',
                    '![](index.php?/attachments/get/attachment-id-2)',
                    '![](index.php?/attachments/get/attachment-id-3)',
                ],
            ])
        })
    })
})
