import NativeEditorApi from './native-editor-api'
import { EventDispatcher } from './event-dispatcher'

const createElement = ({ textContent }) => {
    const element = document.createElement('div')
    element.textContent = textContent

    return element
}

describe('NativeEditorApi', () => {
    describe('getTextContent', () => {
        it('should return current content of native editor', () => {
            const element = createElement({ textContent: 'current content' })
            const nativeEditorApi = new NativeEditorApi(element, new EventDispatcher())

            expect(nativeEditorApi.getTextContent()).toStrictEqual('current content')
        })
    })

    describe('updateContent', () => {
        it('should update content of native editor', () => {
            const element = createElement({ textContent: 'initial content' })
            const nativeEditorApi = new NativeEditorApi(element, new EventDispatcher())

            nativeEditorApi.updateTextContent('updated content')

            expect(nativeEditorApi.getTextContent()).toStrictEqual('updated content')
            expect(element.textContent).toStrictEqual('updated content')
        })
    })

    describe('add and remove event listener, and dispatch event', () => {
        it('should run listeners on event dispatched', () => {
            const element = createElement({ textContent: 'initial content' })
            const nativeEditorApi = new NativeEditorApi(element, new EventDispatcher())

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
    })
})
