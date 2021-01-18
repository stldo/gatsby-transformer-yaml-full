const path = require('path')

const watcher = require('./lib/watcher')

const PARAMS_REGEXP = /(.+?)(?:\s+(\S+)|\s*)$/

module.exports = helpers => ({
  tag: '!import',
  options: {
    kind: 'scalar',
    construct: async data => {
      const { getNode, getNodes, loadNodeContent, node, reporter } = helpers
      const [_, importPath, importField] = PARAMS_REGEXP.exec(data)
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
