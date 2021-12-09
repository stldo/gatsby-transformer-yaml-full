const { readFile } = require('fs/promises')
const path = require('path')
const remarkHtml = require('remark-html')
const remarkParse = require('remark-parse')
const unified = require('unified')

const NEWLINE_REGEXP = /\n|\r/

let remark

module.exports = ({ node }, _, options = {}) => {
  return {
    tag: '!markdown',
    options: {
      kind: 'scalar',
      construct: async content => {
        if (!NEWLINE_REGEXP.test(content)) { // If the content is single line
          await readFile(path.resolve(node.dir, content), 'utf8')
            .then(data => {
              content = data
            }).catch(error => {
              if (
                error.code !== 'ENOENT' &&
                error.code !== 'ENAMETOOLONG'
              ) {
                throw error
              }
            })
        }

        if (!remark) {
          remark = unified()
            .use(remarkParse)
            .use(remarkHtml, options.remarkHtml || {})
        }

        return String(await remark.process(content))
      }
    }
  }
}
