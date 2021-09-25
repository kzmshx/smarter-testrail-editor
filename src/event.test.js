import {
    ContentUpdateByExtensionEditorEvent,
    ContentUpdateByHostEditorEvent,
    Event,
    ImageAddByHostEditorEvent,
} from './event'

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

describe('ContentUpdateByExtensionEditorEvent', () => {
    test('can create with expected properties', () => {
        const event = new ContentUpdateByExtensionEditorEvent({ newContent: 'Some new content' })

        expect(event.type).toStrictEqual('content-update-by-extension-editor')
        expect(event.detail.newContent).toStrictEqual('Some new content')
    })
})
