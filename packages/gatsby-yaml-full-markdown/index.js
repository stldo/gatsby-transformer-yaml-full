const { readFile } = require('fs/promises')
const path = require('path')

const NEWLINE_REGEXP = /\n|\r/

module.exports = (
  { actions: { createNode }, createContentDigest, createNodeId, node }
) => {
  return {
    tag: '!markdown',
    options: {
      kind: 'scalar',
      construct: async content => {
        if (!NEWLINE_REGEXP.test(content)) { // If the content is single line
          await readFile(path.resolve(node.dir, content), 'utf8').then(data => {
            content = data
          }).catch(error => {
            if (error.code !== 'ENOENT' && error.code !== 'ENAMETOOLONG') {
              throw error
            }
          })
        }

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
