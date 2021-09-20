import React, { useEffect, useState } from 'react'
import { Editor as DraftEditor, EditorState, getDefaultKeyBinding, Modifier } from 'draft-js'
import { makeStyles } from '@material-ui/core'
import CodeUtils from 'draft-js-code'

const useEditorState = target => {
    const [editorState, setEditorState] = useState(EditorState.createWithText(target.innerText))
    return [
        editorState,
        editorState => {
            setEditorState(editorState)
            target.textContent = editorState.getCurrentContent().getPlainText()
            target.dispatchEvent(new Event('keyup')) // Preconditions に内容を反映するため
            target.dispatchEvent(new Event('input')) // StepContent/StepExpected に内容を反映するため
        },
    ]
}

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
    const [editorState, setEditorState] = useEditorState(target)
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

    useEffect(() => {
        target.addEventListener('image-add', e => {
            const imageAddedContentState = Modifier.replaceText(
                editorState.getCurrentContent(),
                editorState.getSelection(),
                `![](${e.detail.attachmentUrl})`
            )
            const imageAddedEditorState = EditorState.push(editorState, imageAddedContentState, 'image-add')
            const selectionMovedEditorState = EditorState.forceSelection(
                imageAddedEditorState,
                imageAddedContentState.getSelectionAfter()
            )
            setEditorState(selectionMovedEditorState)
        })
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
