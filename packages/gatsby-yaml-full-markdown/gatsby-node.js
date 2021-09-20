const { isPlainObject } = require('is-plain-object')

const GATSBY_FIELDS = ['children', 'id', 'internal', 'parent']

function linkMarkdownNodes (node) {
  for (const key in node) {
    if (GATSBY_FIELDS.includes(key) || !isPlainObject(node[key])) {
      continue
    } else if (
      !node[key].internal ||
      node[key].internal.type !== 'YamlMarkdown'
    ) {
      linkMarkdownNodes(node[key])
      continue
    }

    node[`${key}___NODE`] = node[key].id
    delete node[key]
  }
}

exports.onCreateNode = ({ node }) => {
  const { owner, type } = node.internal

  if (owner === 'gatsby-transformer-yaml-full' && type !== 'YamlMarkdown') {
    linkMarkdownNodes(node)
  }
}

exports.onPreBootstrap = ({
  actions: { setPageData, touchNode },
  getNodesByType
}) => {
  for (const node of getNodesByType('YamlMarkdown')) {
    // If setPageData exist, then it's Gatsby v2
    touchNode(!setPageData ? node : { nodeId: node.id })
  }
}
