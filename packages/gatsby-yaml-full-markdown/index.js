const fs = require('fs')
const path = require('path')
const remark = require('remark')
const remarkHtml = require('remark-html')
const { promisify } = require('util')

const readFile = promisify(fs.readFile)

const NEWLINE_REGEXP = /\r|\n/

module.exports = ({ node }) => ({
  tag: '!markdown',
  options: {
    kind: 'scalar',
    construct: async data => {
      if (!NEWLINE_REGEXP.test(data)) {
        const filePath = path.resolve(node.dir, data)
        data = await readFile(filePath, 'utf8').catch(error => {
          if (error.code === 'ENOENT') return data
          throw error
        })
      }

      return (await remark().use(remarkHtml).process(data)).contents
    },
  },
})
