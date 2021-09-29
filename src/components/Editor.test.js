import * as React from 'react'
import NativeEditorProxy from '../native-editor-proxy'
import { render, screen } from '@testing-library/react'
import Editor from './Editor'
import { EventDispatcher } from '../event-dispatcher'
import { createDiv } from '../testing-util'

describe('Editor', () => {
    it('renders content of native editor on initial rendering', () => {
        const nativeEditorProxy = new NativeEditorProxy(
            createDiv(document.createTextNode('initial content')),
            new EventDispatcher()
        )

        render(<Editor id="extension-editor-id" nativeEditorProxy={nativeEditorProxy} />)

        expect(screen.getByText('initial content')).toBeInTheDocument()
    })
})
