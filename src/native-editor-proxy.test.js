import NativeEditorProxy from './native-editor-proxy'
import { EventDispatcher } from './event-dispatcher'

const createElement = ({ textContent }) => {
    const element = document.createElement('div')
    element.textContent = textContent

    return element
}

const addAttachment = (element, attachmentIds) => {
    const smallImage = attachmentId => {
        const element = document.createElement('div')
        element.classList.add('attachment-list-item', 'attachment-block', 'attachment-bitmap', 'lazy')
        element.setAttribute('data-attachment-id', attachmentId)
        return element
    }
    const deleteButton = () => {
        const element = document.createElement('div')
        element.classList.add('inlineAttachmentListRemove', 'attachment-list-delete-inline')
        return element
    }
    const whitespaceSpan = () => {
        const element = document.createElement('span')
        element.classList.add('inline-attachment-list-whitespace')
        return element
    }
    const whitespaceText = () => document.createTextNode(String.fromCharCode(160))

    const fragment = document.createDocumentFragment()
    for (const attachmentId of attachmentIds) {
        fragment.appendChild(smallImage(attachmentId))
    }
    fragment.appendChild(deleteButton())
    fragment.appendChild(whitespaceSpan())
    fragment.appendChild(whitespaceText())

    element.appendChild(fragment)
}

const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout))

describe('NativeEditorProxy', () => {
    describe('getContent', () => {
        it('returns current contents of the native editor', () => {
            const element = createElement({ textContent: 'current content' })
            const nativeEditorProxy = new NativeEditorProxy(element, new EventDispatcher())

            expect(nativeEditorProxy.getContent()).toStrictEqual('current content')
        })
    })

    describe('updateContent', () => {
        it('updates the contents of the native editor', () => {
            const element = createElement({ textContent: 'initial content' })
            const nativeEditorProxy = new NativeEditorProxy(element, new EventDispatcher())

            nativeEditorProxy.updateContent('updated content')

            expect(nativeEditorProxy.getContent()).toStrictEqual('updated content')
            expect(element.textContent).toStrictEqual('updated content')
        })
    })

    describe('add and remove event listener, and dispatch event', () => {
        it('calls registered listeners when an event is dispatched', () => {
            const element = createElement({ textContent: 'initial content' })
            const nativeEditorProxy = new NativeEditorProxy(element, new EventDispatcher())

            const results = []
            const handleTestEvent = event => results.push(event.type)

            nativeEditorProxy.addEventListener('foo', handleTestEvent)
            nativeEditorProxy.dispatchEvent(new Event('foo'))

            expect(results).toStrictEqual(['foo'])

            nativeEditorProxy.addEventListener('bar', handleTestEvent)
            nativeEditorProxy.dispatchEvent(new Event('bar'))

            expect(results).toStrictEqual(['foo', 'bar'])

            nativeEditorProxy.removeEventListener('foo', handleTestEvent)
            nativeEditorProxy.dispatchEvent(new Event('foo'))

            expect(results).toStrictEqual(['foo', 'bar'])
        })

        it('dispatches ContentChangeEvent only when the textContent of the native editor is changed', async () => {
            const element = createElement({ textContent: 'initial content' })
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

        it('dispatches FileAttachEvent when images are attached to the native editor with markdown link text for the attachments', async () => {
            const element = createElement({ textContent: 'initial content' })
            const nativeEditorProxy = new NativeEditorProxy(element, new EventDispatcher())

            const results = []
            const handleFileAttach = event => results.push(event.detail.markdownLinks)
            nativeEditorProxy.addEventListener('file-attach', handleFileAttach)

            addAttachment(element, ['attachment-id-1', 'attachment-id-2', 'attachment-id-3'])
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
