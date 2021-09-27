import React, { useEffect, useState } from 'react'
import { ContentState, Editor as DraftEditor, EditorState, getDefaultKeyBinding, Modifier } from 'draft-js'
import CodeUtils from 'draft-js-code'
import { makeStyles } from '@material-ui/core'
import { ContentUpdateByExtensionEditorEvent } from '../event-dispatcher'

const useStyles = makeStyles({
    editor: props => ({
        width: props.width,
        minHeight: props.minHeight,
        margin: props.margin,
        padding: props.padding,
        border: props.border,
        background: props.background,
        overflow: props.overflow,
        fontFamily: 'monospace',
        fontSize: '12px',
        lineHeight: 1.3,
    }),
})

export default function Editor({ id, initialContent, wrapperStyles, dispatcher }) {
    const [editorState, setEditorState] = useState(EditorState.createWithText(initialContent))
    const classes = useStyles(wrapperStyles)

    const onKeyUpWrapper = e => e.stopPropagation()

    const onPasteWrapper = e => e.stopPropagation()

    const handleKeyCommand = keyCommand => {
        if (keyCommand === 'backspace') {
            const newEditorState = CodeUtils.handleKeyCommand(editorState, keyCommand)
            if (newEditorState) {
                setEditorState(newEditorState)
                return 'handled'
            }
        }
        return 'not-handled'
    }

    const keyBindingFn = event => {
        if (event.key === 'Enter') {
            setEditorState(CodeUtils.handleReturn(event, editorState))
            return 'handled'
        }
        if (event.key === 'Tab') {
            setEditorState(CodeUtils.onTab(event, editorState))
            return 'handled'
        }
        return getDefaultKeyBinding(event)
    }

    const handleContentUpdateByHostEditor = event => {
        const newEditorState = EditorState.push(
            editorState,
            ContentState.createFromText(event.detail.newContent),
            'content-update-by-host-editor'
        )
        setEditorState(newEditorState)
    }

    const handleImageAddByHostEditor = event => {
        const insertedText = event.detail.imageUrls.map(imageUrl => `![](${imageUrl})`).join(' ')
        const imageAddedContentState = Modifier.replaceText(
            editorState.getCurrentContent(),
            editorState.getSelection(),
            insertedText
        )
        const imageAddedEditorState = EditorState.push(editorState, imageAddedContentState, 'image-add-by-host-editor')
        const newEditorState = EditorState.forceSelection(
            imageAddedEditorState,
            imageAddedContentState.getSelectionAfter()
        )
        setEditorState(newEditorState)
    }

    useEffect(() => {
        dispatcher.addListener('content-update-by-host-editor', handleContentUpdateByHostEditor)

        return () => {
            dispatcher.removeListener('content-update-by-host-editor', handleContentUpdateByHostEditor)
        }
    })

    useEffect(() => {
        dispatcher.addListener('image-add-by-host-editor', handleImageAddByHostEditor)

        return () => {
            dispatcher.removeListener('image-add-by-host-editor', handleImageAddByHostEditor)
        }
    })

    useEffect(() => {
        dispatcher.dispatch(
            new ContentUpdateByExtensionEditorEvent({ newContent: editorState.getCurrentContent().getPlainText() })
        )
    }, [editorState])

    return (
        <div id={id} className={classes.editor} onKeyUp={onKeyUpWrapper} onPaste={onPasteWrapper}>
            <DraftEditor
                editorState={editorState}
                onChange={setEditorState}
                handleKeyCommand={handleKeyCommand}
                keyBindingFn={keyBindingFn}
            />
        </div>
    )
}
