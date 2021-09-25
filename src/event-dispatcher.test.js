import EventDispatcher from './event-dispatcher'

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
