import React, { useEffect, useState } from 'react'
import { ContentState, Editor as DraftEditor, EditorState, getDefaultKeyBinding, Modifier } from 'draft-js'
import { makeStyles } from '@material-ui/core'
import CodeUtils from 'draft-js-code'

const useStyles = makeStyles({
    editor: props => ({
        width: props.width,
        minHeight: props.minHeight,
        margin: props.margin,
        padding: props.padding,
        border: props.border,
        background: props.background,
        fontFamily: 'monospace',
        fontSize: '12px',
        lineHeight: 1.3,
    }),
})

export default function Editor({ target, id }) {
    const [editorState, setEditorState] = useState(EditorState.createWithText(target.textContent))
    const classes = useStyles(window.getComputedStyle(target))

    const handleKeyCommand = keyCommand => {
        if (keyCommand === 'backspace') {
            // TODO 自分で書き直したい
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
            // TODO 自分で書き直したい
            setEditorState(CodeUtils.handleReturn(event, editorState))
            return 'handled'
        }
        if (event.key === 'Tab') {
            // TODO 自分で書き直したい
            setEditorState(CodeUtils.onTab(event, editorState))
            return 'handled'
        }
        return getDefaultKeyBinding(event)
    }

    const handleContentInit = event => {
        const newEditorState = EditorState.push(
            newEditorState,
            ContentState.createFromText(event.detail.content),
            'change-block-data'
        )
        setEditorState(newEditorState)
    }

    const handleImageAdd = event => {
        const newContentState = Modifier.replaceText(
            editorState.getCurrentContent(),
            editorState.getSelection(),
            event.detail.markdownLinks.join(' ')
        )
        const newEditorState = EditorState.push(editorState, newContentState, 'change-block-data')
        setEditorState(EditorState.forceSelection(newEditorState, newContentState.getSelectionAfter()))
    }

    const handleContentChange = event => {
        if (event.detail.content == editorState.getCurrentContent().getPlainText()) {
            return
        }
        const newContentState = EditorState.createWithText(event.detail.content).getCurrentContent()
        const newEditorState = EditorState.push(editorState, newContentState, 'change-block-data')
        setEditorState(newEditorState)
    }

    useEffect(() => {
        target.addEventListener('content-init', handleContentInit)
        return () => {
            target.removeEventListener('content-init', handleContentInit)
        }
    }, [editorState])

    useEffect(() => {
        target.addEventListener('image-add', handleImageAdd)
        return () => {
            target.removeEventListener('image-add', handleImageAdd)
        }
    }, [editorState])

    useEffect(() => {
        target.addEventListener('content-change', handleContentChange)
        return () => {
            target.removeEventListener('content-change', handleContentChange)
        }
    }, [editorState])

    useEffect(() => {
        target.textContent = editorState.getCurrentContent().getPlainText()
        target.dispatchEvent(new Event('keyup')) // Preconditions に内容を反映するため
        target.dispatchEvent(new Event('input')) // StepContent/StepExpected に内容を反映するため
    }, [editorState])

    return (
        <div id={id} className={classes.editor} onKeyUp={e => e.stopPropagation()} onPaste={e => e.stopPropagation()}>
            <DraftEditor
                editorState={editorState}
                onChange={setEditorState}
                handleKeyCommand={handleKeyCommand}
                keyBindingFn={keyBindingFn}
            />
        </div>
    )
}
