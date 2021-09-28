import NativeEditorProxy from './native-editor-proxy'
import { EventDispatcher } from './event-dispatcher'

const createElement = ({ textContent }) => {
    const element = document.createElement('div')
    element.textContent = textContent

    return element
}

const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout))

describe('NativeEditorProxy', () => {
    describe('getContent', () => {
        it('returns current contents of the native editor', () => {
            const element = createElement({ textContent: 'current content' })
            const nativeEditorApi = new NativeEditorProxy(element, new EventDispatcher())

            expect(nativeEditorApi.getContent()).toStrictEqual('current content')
        })
    })

    describe('updateContent', () => {
        it('updates the contents of the native editor', () => {
            const element = createElement({ textContent: 'initial content' })
            const nativeEditorApi = new NativeEditorProxy(element, new EventDispatcher())

            nativeEditorApi.updateContent('updated content')

            expect(nativeEditorApi.getContent()).toStrictEqual('updated content')
            expect(element.textContent).toStrictEqual('updated content')
        })
    })

    describe('add and remove event listener, and dispatch event', () => {
        it('should run listeners on event dispatched', () => {
            const element = createElement({ textContent: 'initial content' })
            const nativeEditorApi = new NativeEditorProxy(element, new EventDispatcher())

            const results = []
            const handleTestEvent = event => results.push(event.type)

            nativeEditorApi.addEventListener('foo', handleTestEvent)
            nativeEditorApi.dispatchEvent(new Event('foo'))

            expect(results).toStrictEqual(['foo'])

            nativeEditorApi.addEventListener('bar', handleTestEvent)
            nativeEditorApi.dispatchEvent(new Event('bar'))

            expect(results).toStrictEqual(['foo', 'bar'])

            nativeEditorApi.removeEventListener('foo', handleTestEvent)
            nativeEditorApi.dispatchEvent(new Event('foo'))

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
    })
})
