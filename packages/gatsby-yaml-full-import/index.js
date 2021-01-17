const { utimes, watch } = require('fs')

const PARAMS_REGEXP = /(.+?)(?:\s+(\S+)|\s*)$/

module.exports = ({ getNode, getNodes, loadNodeContent, node, reporter }) => ({
  tag: '!import',
  options: {
    kind: 'scalar',
    construct: async function (data) {
      const [_, filename, fields] = PARAMS_REGEXP.exec(data)
      const [importedNode] = getNodes().filter(({ relativePath }) => (
        relativePath === filename
      ))

      if (!importedNode) {
        reporter.error(
          `"!import ${filename}" not found in "${node.relativePath}"`
        )
        return null
      }

      watch(importedNode.absolutePath, () => {
        const time = new Date()
        node.internal.contentDigest = ''
        utimes(node.absolutePath, time, time, () => {})
      })

      await loadNodeContent(importedNode)
      const content = getNode(importedNode.children[0])

      if (!fields) {
        return content
      }

      let warningWasPrinted = false

      return fields.split('.').reduce((accumulator, field) => {
        if (accumulator && field in accumulator) {
          return accumulator[field]
        } else if (!warningWasPrinted) {
          reporter.error(
            `"${fields}" doesn't exist in "!import ${filename}"`
          )
          warningWasPrinted = true
        }
        return null
      }, content)
    }
  }
})
