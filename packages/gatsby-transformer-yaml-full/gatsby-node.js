const jsYaml = require(`js-yaml`)
const isPlainObject = require(`lodash/isPlainObject`)
const path = require(`path`)

const helpers = require('./')

exports.onCreateNode = async function (api, { plugins, ...pluginOptions }) {
  const { node } = api

  if (node.internal.mediaType !== `text/yaml`) {
    return
  }

  const { actions, loadNodeContent, createNodeId, createContentDigest } = api
  const types = []

  for (let { resolve, childOptions = {} } of plugins) {
    const plugin = require(resolve)
    const { tag, options, transformerOptions } = plugin(
      api,
      { ...childOptions, types }
    )

    if (transformerOptions) {
      Object.assign(pluginOptions, transformerOptions)
    }

    types.push(new jsYaml.Type(tag, options))
  }

  const nodeContent = (await loadNodeContent(node)) + '\n'
  const parsedContent = helpers.parse(nodeContent, types)

  const linkNodes = helpers.generateLinkNodes(
    actions,
    createNodeId,
    createContentDigest,
    pluginOptions
  )

  if (Array.isArray(parsedContent)) {
    for (let [index, content] of parsedContent.entries()) {
      if (!isPlainObject(content)) continue
      const baseType = `${node.relativeDirectory} ${node.name}`
      const resolvedContent = await helpers.resolveContent(content)
      linkNodes(resolvedContent, node, { isRoot: true, baseType, index })
    }
  } else if (isPlainObject(parsedContent)) {
    const baseType = path.basename(node.dir)
    const resolvedContent = await helpers.resolveContent(parsedContent)
    linkNodes(resolvedContent, node, { isRoot: true, baseType })
  }
}
