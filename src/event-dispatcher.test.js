import {
    ContentUpdateByExtensionEditorEvent,
    ContentUpdateByHostEditorEvent,
    Event,
    EventDispatcher,
    ImageAddByHostEditorEvent,
} from './event-dispatcher'

describe('Event', () => {
    test('can get event type', () => {
        expect(new Event('some-event').type).toStrictEqual('some-event')
    })

    test('cannot set event type', () => {
        expect(() => {
            const event = new Event('some-event')
            event.type = 'another-event'
        }).toThrow(TypeError)
    })
})

describe('EventDispatcher', () => {
    test('can get, add and remove listener', () => {
        const dispatcher = new EventDispatcher()

        expect(dispatcher.getListeners('some-event')).toStrictEqual([])

        const handler = () => {}
        dispatcher.addListener('some-event', handler)

        expect(dispatcher.getListeners('some-event')).toHaveLength(1)
        expect(dispatcher.getListeners('some-event')[0]).toStrictEqual(handler)

        dispatcher.removeListener('some-event', handler)

        expect(dispatcher.getListeners('some-event')).toStrictEqual([])
    })

    test('no error when dispatching not listened event', () => {
        const dispatcher = new EventDispatcher()

        dispatcher.dispatch(new Event('not-listened-event'))
    })

    test('can dispatch event and call listeners', () => {
        const results = []
        const handler1 = event => results.push(`${event.type} handled by handler1`)
        const handler2 = event => results.push(`${event.type} handled by handler2`)

        const dispatcher = new EventDispatcher()
        dispatcher.addListener('some-event', handler1)
        dispatcher.addListener('some-event', handler2)

        dispatcher.dispatch(new Event('some-event'))

        expect(results).toStrictEqual(['some-event handled by handler1', 'some-event handled by handler2'])
    })
})

describe('ContentUpdateByExtensionEditorEvent', () => {
    test('can create with expected properties', () => {
        const event = new ContentUpdateByExtensionEditorEvent({ newContent: 'Some new content' })

        expect(event.type).toStrictEqual('content-update-by-extension-editor')
        expect(event.detail.newContent).toStrictEqual('Some new content')
    })
})

describe('ContentUpdateByHostEditorEvent', () => {
    test('can create with expected properties', () => {
        const event = new ContentUpdateByHostEditorEvent({ newContent: 'Some new content' })

        expect(event.type).toStrictEqual('content-update-by-host-editor')
        expect(event.detail.newContent).toStrictEqual('Some new content')
    })
})

describe('ImageAddByHostEditorEvent', () => {
    test('can create with expected properties', () => {
        const event = new ImageAddByHostEditorEvent({ imageUrls: ['url-1', 'url-2'] })

        expect(event.type).toStrictEqual('image-add-by-host-editor')
        expect(event.detail.imageUrls).toStrictEqual(['url-1', 'url-2'])
    })
})
