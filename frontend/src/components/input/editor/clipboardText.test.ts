import {describe, it, expect} from 'vitest'
import {getSchema} from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

import {sliceToPlainText} from './clipboardText'

const schema = getSchema([StarterKit])

function copy(...blocks: object[]) {
	const doc = schema.nodeFromJSON({type: 'doc', content: blocks})
	return sliceToPlainText(doc.slice(0, doc.content.size))
}

const paragraph = (text: string) => ({type: 'paragraph', content: [{type: 'text', text}]})
const listItem = (text: string) => ({type: 'listItem', content: [paragraph(text)]})

describe('sliceToPlainText', () => {
	it('keeps bullet markers for list items', () => {
		const text = copy({
			type: 'bulletList',
			content: ['this', 'is', 'a', 'list'].map(listItem),
		})
		expect(text).toBe('- this\n- is\n- a\n- list')
	})

	it('numbers ordered list items', () => {
		const text = copy({
			type: 'orderedList',
			content: ['first', 'second'].map(listItem),
		})
		expect(text).toBe('1. first\n2. second')
	})

	it('indents nested lists under their parent item', () => {
		const text = copy({
			type: 'bulletList',
			content: [{
				type: 'listItem',
				content: [
					paragraph('parent'),
					{type: 'bulletList', content: [listItem('child')]},
				],
			}],
		})
		expect(text).toBe('- parent\n  - child')
	})

	it('separates blocks with blank lines', () => {
		const text = copy(
			paragraph('start'),
			{type: 'bulletList', content: [listItem('a'), listItem('b')]},
			paragraph('end'),
		)
		expect(text).toBe('start\n\n- a\n- b\n\nend')
	})
})
