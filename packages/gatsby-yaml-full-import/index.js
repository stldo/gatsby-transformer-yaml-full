const path = require('path')

const watcher = require('./lib/watcher')

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

      if (!importField && data.split(' ').length) {
        reporter.error( // TODO Remove this message on > 0.5.0
          `[gatsby-yaml-full-import] Separate file name from field name with ` +
          `spaces is deprecated. Instead, use an exclamation mark in ` +
          `"${node.relativePath}", i.e. "${data.replace(/ +/, '!')}".`
        )
        return null
      }

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

      const content = getNode(importNode.children[0])

      if (!importField) {
        return content
      }

      let warningWasPrinted = false

      return importField.split('.').reduce((accumulator, field) => {
        if (accumulator && field in accumulator) {
          return accumulator[field]
        } else if (!warningWasPrinted) {
          reporter.error(
            `"${importField}" doesn't exist in "!import ${importPath}"`
          )
          warningWasPrinted = true
        }
        return null
      }, content)
    }
  }
})
