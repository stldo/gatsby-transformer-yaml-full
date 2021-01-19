const { readFile } = require('fs/promises')
const { isPlainObject } = require('is-plain-object')
const path = require('path')
const rehypeSanitize = require('rehype-sanitize')
const rehypeStringify = require('rehype-stringify')
const remarkParse = require('remark-parse')
const remarkRehype = require('remark-rehype')
const unified = require('unified')

const NEWLINE_REGEXP = /\n|\r/
const UNWRAP_REGEXP = /^<p>|<\/p>$/g

module.exports = (
  { node },
  { rehypePlugins = true, unwrapSingleLine = true }
) => {
  if (rehypePlugins === false) {
    rehypePlugins = []
    unwrapSingleLine = false
  } else if (isPlainObject(rehypePlugins)) {
    const { sanitize, stringify } = rehypePlugins
    rehypePlugins = [[rehypeSanitize, sanitize], [rehypeStringify, stringify]]
  } else if (!Array.isArray(rehypePlugins)) {
    rehypePlugins = [[rehypeSanitize], [rehypeStringify]]
  } else {
    unwrapSingleLine = false
  }

  return {
    tag: '!markdown',
    options: {
      kind: 'scalar',
      construct: async data => {
        let unwrapParagraph = unwrapSingleLine

        if (!NEWLINE_REGEXP.test(data)) { // If data is single line
          await readFile(path.resolve(node.dir, data), 'utf8').then(content => {
            unwrapParagraph = false
            data = content
          }).catch(error => {
            if (error.code !== 'ENOENT' && error.code !== 'ENAMETOOLONG') {
              throw error
            }
          })
        } else {
          unwrapParagraph = false
        }

        const processor = unified()

        processor.use(remarkParse)
        processor.use(remarkRehype)

        for (const [plugin, options = null] of rehypePlugins) {
          if (options === false) {
            continue
          } else if (options === null) {
            processor.use(plugin)
          } else {
            processor.use(plugin, options)
          }
        }

        const content = (await processor.process(data)).contents

        return unwrapParagraph ? content.replace(UNWRAP_REGEXP, '') : content
      }
    }
  }
}
