const watcher = require('./lib/watcher')

const PARAMS_REGEXP = /(.+?)(?:\s+(\S+)|\s*)$/

module.exports = helpers => ({
  tag: '!import',
  options: {
    kind: 'scalar',
    construct: async function (data) {
      const { getNode, getNodes, loadNodeContent, node, reporter } = helpers
      const [_, importPath, importField] = PARAMS_REGEXP.exec(data)
      const [importNode] = getNodes().filter(({ relativePath }) => (
        relativePath === importPath
      ))

      if (!importNode) {
        reporter.error(
          `"!import ${importPath}" not found in "${node.relativePath}"`
        )
        return null
      }

      await loadNodeContent(importNode)

      if (process.env.NODE_ENV === 'development') {
        await watcher.add(helpers, importNode.absolutePath, node.absolutePath)
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
