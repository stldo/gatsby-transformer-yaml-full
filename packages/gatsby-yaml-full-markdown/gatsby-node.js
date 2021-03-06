const { isPlainObject } = require('is-plain-object')

const GATSBY_RESERVED_FIELDS = ['children', 'id', 'internal', 'parent']

function linkMarkdownNodes (node, isNodeRoot = true) {
  for (const key in node) {
    if (
      (isNodeRoot && GATSBY_RESERVED_FIELDS.includes(key)) ||
      !isPlainObject(node[key])
    ) {
      continue
    }

    if ((node[key].internal || {}).type !== 'YamlMarkdown') {
      linkMarkdownNodes(node[key], false)
    } else {
      node[`${key}___NODE`] = node[key].id
      delete node[key]
    }
  }
}

exports.onCreateNode = ({ node }) => {
  const { owner, type } = node.internal
  if (owner === 'gatsby-transformer-yaml-full' && type !== 'YamlMarkdown') {
    linkMarkdownNodes(node)
  }
}
