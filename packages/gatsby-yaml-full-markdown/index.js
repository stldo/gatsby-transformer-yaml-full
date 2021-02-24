module.exports = (
  { actions: { createNode }, createContentDigest, createNodeId, node }
) => {
  return {
    tag: '!markdown',
    options: {
      kind: 'scalar',
      construct: async content => {
        const contentDigest = createContentDigest(content)
        const id = createNodeId(`${node.id}.${contentDigest} >>> YAML/MARKDOWN`)

        const child = {
          id,
          children: [],
          parent: null,
          internal: {
            content,
            contentDigest,
            mediaType: 'text/markdown',
            type: 'YamlMarkdown'
          }
        }

        await createNode(child)
        return child
      }
    }
  }
}
