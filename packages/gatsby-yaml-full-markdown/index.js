const { readFile } = require('fs/promises')
const path = require('path')
const remarkHtml = require('remark-html')
const remarkParse = require('remark-parse')
const remarkStringify = require('remark-stringify')
const stripMarkdown = require('strip-markdown')
const unified = require('unified')

const NEWLINE_REGEXP = /\n|\r/

const remark = { html: null }

module.exports = ({ node, reporter }, _, options = {}) => {
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

        if (!remark.html) {
          remark.html = unified()
            .use(remarkParse)
            .use(remarkHtml, options.remarkHtml || {})

          if (!options.plain) {
            reporter.warn(
              'Using gatsby-yaml-full-markdown with the "plain" option set ' +
              'to "false" will be deprecated. Find more info in the plugin ' +
              'documentation.'
            )
          }
        }

        if (!options.plain) {
          return String(await remark.html.process(content))
        } else if (!remark.plain) {
          remark.plain = unified()
            .use(remarkParse)
            .use(remarkStringify)
            .use(stripMarkdown)
        }

        return {
          html: String(await remark.html.process(content)),
          plain: String(await remark.plain.process(content))
        }
      }
    }
  }
}
