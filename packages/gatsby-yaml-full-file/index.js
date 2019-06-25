const { createFileNode } = require('gatsby-source-filesystem/create-file-node')
const path = require('path')

module.exports = ({ node, createNodeId }, { path: basePath }) => ({
  tag: '!file',
  options: {
    kind: 'scalar',
    construct: async function (data) {
      const filePath = undefined === basePath
        ? path.resolve(node.dir, data)
        : path.resolve(process.cwd(), basePath, data)
      return await createFileNode(filePath, createNodeId)
    },
  },
  transformerOptions: { createChildNodes: true },
})
