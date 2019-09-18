const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const yamlFull = require('gatsby-transformer-yaml-full')

const readFile = promisify(fs.readFile)

const SPLIT_REGEXP = / +/

module.exports = ({ node }, { path: basePath, types }) => ({
  tag: '!import',
  options: {
    kind: 'scalar',
    construct: async function (data) {
      const [filename, params] = data.split(SPLIT_REGEXP)

      const filePath = undefined === basePath
        ? path.resolve(node.dir, filename)
        : path.resolve(process.cwd(), basePath, filename)

      const content = (await readFile(filePath, 'utf8')) + '\n'
      const parsedContent = yamlFull.parse(content, types)

      return !params
        ? parsedContent
        : params.split('.').reduce((accumulator, param) => (
          accumulator != null && accumulator[param]
        ), parsedContent)
    },
  }
})
