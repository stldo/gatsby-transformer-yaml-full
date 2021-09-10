const path = require('path')

const watcher = require('./lib/watcher')

const MULTI_DOCUMENT_YAML = /^-{3}[ \t]*?($|[#!]|[|>][ \t]*?$)/m

module.exports = helpers => ({
  tag: '!import',
  options: {
    kind: 'scalar',
    construct: async data => {
      const { getNode, getNodes, loadNodeContent, node, reporter } = helpers
      const [importPath, importField] = data.split('!')
      const importAbsolutePath = path.resolve(node.dir, importPath)
      const [importNode] = getNodes().filter(({ absolutePath }) => (
        absolutePath === importAbsolutePath
      ))

      if (!importNode) {
        reporter.error(
          `"!import ${importPath}" not found in "${node.relativePath}"`
        )
        return null
      }

      await loadNodeContent(importNode)

      if (process.env.NODE_ENV === 'development') {
        await watcher.add(helpers, importAbsolutePath, node.absolutePath)
      }

      const importNodeContent = importNode.internal.content
      const content = importNodeContent.search(MULTI_DOCUMENT_YAML) !== -1
        ? importNode.children.map(id => getNode(id))
        : getNode(importNode.children[0])

      if (!importField) {
        return content
      }

      let errorWasPrinted = false

      return importField.split('.').reduce((accumulator, field) => {
        if (accumulator && field in accumulator) {
          return accumulator[field]
        } else if (errorWasPrinted) {
          return null
        }

        reporter.error(
          `"${importField}" doesn't exist in "!import ${importPath}"`
        )

        errorWasPrinted = true
      }, content)
    }
  }
})
