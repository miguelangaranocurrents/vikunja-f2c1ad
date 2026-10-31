import type {Node as ProseMirrorNode, Slice} from '@tiptap/pm/model'

// ProseMirror's default text/plain drops list structure, so a copied bullet list
// becomes "this\n\nis\n\na\n\nlist". Keep the markers so the copied text still reads as a list.
export function sliceToPlainText(slice: Slice): string {
	const blocks: string[] = []
	slice.content.forEach(node => blocks.push(nodeToPlainText(node)))
	return blocks.filter(Boolean).join('\n\n')
}

function nodeToPlainText(node: ProseMirrorNode): string {
	if (node.isText || node.isTextblock) {
		return node.textContent
	}

	if (node.type.name === 'bulletList' || node.type.name === 'orderedList' || node.type.name === 'taskList') {
		const ordered = node.type.name === 'orderedList'
		const items: string[] = []
		node.forEach((item, _offset, index) => {
			const marker = ordered ? `${index + 1}. ` : '- '
			const body: string[] = []
			item.forEach(child => body.push(nodeToPlainText(child)))
			const indent = ' '.repeat(marker.length)
			const lines = body.join('\n').split('\n')
			items.push(marker + lines.map((line, i) => i === 0 ? line : indent + line).join('\n'))
		})
		return items.join('\n')
	}

	const parts: string[] = []
	node.forEach(child => parts.push(nodeToPlainText(child)))
	return parts.filter(Boolean).join('\n\n')
}
