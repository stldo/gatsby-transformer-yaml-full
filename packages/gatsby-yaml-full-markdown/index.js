const fs = require('fs')
const path = require('path')
const remark = require('remark')
const remarkHtml = require('remark-html')
const { promisify } = require('util')

const readFile = promisify(fs.readFile)

const NEWLINE_REGEXP = /\r|\n/

module.exports = ({ node }, { unwrapSingleLine = true }) => ({
  tag: '!markdown',
  options: {
    kind: 'scalar',
    construct: async data => {
      const isSingleLine = !NEWLINE_REGEXP.test(data)
      let wasLoadedFromFile = false

      if (isSingleLine) {
        const filePath = path.resolve(node.dir, data)

        data = await readFile(filePath, 'utf8')
          .then(data => {
            wasLoadedFromFile = true
            return data
          })
          .catch(error => {
            if (error.code === 'ENOENT' || error.code === 'ENAMETOOLONG') {
              return data
            }
            throw error
          })
      }

      const html = (await remark().use(remarkHtml).process(data)).contents

      return isSingleLine && !wasLoadedFromFile && unwrapSingleLine
        ? html.slice(3, -5)
        : html
    },
  },
})
