const fs = require('fs')
const yamlFull = require('../gatsby-transformer-yaml-full')
const path = require('path')
const { promisify } = require('util')

const readFile = promisify(fs.readFile)

const SPLIT_REGEXP = / +/

module.exports = ({ node }) => ({
  tag: '!import',
  options: {
    kind: 'scalar',
    construct: async function (data) {
      const [filename, params] = data.split(SPLIT_REGEXP)
      const filePath = path.resolve(node.dir, filename)
      const content = yamlFull.parse((await readFile(filePath, 'utf8')) + '\n')

      return !params
        ? content
        : params.split('.').reduce((accumulator, param) => (
          accumulator != null && accumulator[param]
        ), content)
    },
  }
})
