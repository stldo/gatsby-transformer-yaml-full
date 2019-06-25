const jsYaml = require(`js-yaml`)
const { camelCase, isPlainObject, upperFirst } = require(`lodash`)
const path = require(`path`)

const CREATE_NODE_PROPERTIES = ['id', 'parent', 'children', 'internal']
const MULTI_DOCUMENT_YAML = /^-{3}[ \t]*?($|[#!]|[|>][ \t]*?$)/m

const getLinkNodes = (
  { createNode, createParentChildLink },
  createNodeId,
  createContentDigest,
  pluginOptions
) => function linkNodes(
  content,
  parent,
  { isRoot = false, baseType = '', index = 0 }
) {
  const node = {
    ...content,
    id: content.id || createNodeId(`${parent.id}:${baseType}${index} >>> YAML`),
    parent: parent.id,
    children: content.children || [],
  }

  if (!node.internal) {
    const parentType = isRoot ? '' : parent.internal.type.slice(0, -4)
    node.internal = {
      contentDigest: createContentDigest(node),
      type: upperFirst(camelCase(`${parentType} ${baseType} Yaml`)),
    }
  } else if (!node.internal.type.endsWith('Yaml')) {
    node.internal.type += 'Yaml'
    createNode(node)
    createParentChildLink({ parent, child: node })
    return
  }

  createNode(node)
  createParentChildLink({ parent, child: node })

  if (!pluginOptions.createChildNodes) return

  Object.entries(node).forEach(([baseType, content]) => {
    if (CREATE_NODE_PROPERTIES.includes(baseType)) {
      return
    }

    if (Array.isArray(content)) {
      content.forEach((content, index) => {
        linkNodes(content, node, { baseType, index })
      })
    } else if (isPlainObject(content)) {
      linkNodes(content, node, { baseType })
    }
  })
}

async function resolveContent(content) {
  if (content === Promise.resolve(content)) {
    content = await Promise.resolve(content)
  }

  let entries

  if (Array.isArray(content)) {
    entries = content.entries()
  } else if (
    isPlainObject(content) &&
    !(content.internal && content.internal.type)
  ) {
    entries = Object.entries(content)
  } else {
    return content
  }

  for (let [key, value] of entries) {
    content[key] = await resolveContent(value)
  }

  return content
}

exports.onCreateNode = async function (api, { plugins, ...pluginOptions }) {
  const { node } = api

  if (node.internal.mediaType !== `text/yaml`) {
    return
  }

  const { actions, loadNodeContent, createNodeId, createContentDigest } = api

  const schema = !plugins.length
    ? jsYaml.DEFAULT_FULL_SCHEMA
    : new jsYaml.Schema.create(
      jsYaml.DEFAULT_FULL_SCHEMA,
      plugins.map(({ resolve, childOptions = {} }) => {
        const plugin = require(resolve)
        const { tag, options, transformerOptions } = plugin(api, childOptions)
        if (transformerOptions) Object.assign(pluginOptions, transformerOptions)
        return new jsYaml.Type(tag, options)
      })
    )

  const linkNodes = getLinkNodes(
    actions,
    createNodeId,
    createContentDigest,
    pluginOptions
  )

  const nodeContent = (await loadNodeContent(node)) + '\n'
  const parsedContent = -1 !== nodeContent.search(MULTI_DOCUMENT_YAML)
    ? jsYaml.loadAll(nodeContent, null, { schema })
    : jsYaml.load(nodeContent, { schema })

  if (Array.isArray(parsedContent)) {
    for (let [index, content] of parsedContent.entries()) {
      if (!isPlainObject(content)) continue
      const baseType = `${node.relativeDirectory} ${node.name}`
      const resolvedContent = await resolveContent(content)
      linkNodes(resolvedContent, node, { isRoot: true, baseType, index })
    }
  } else if (isPlainObject(parsedContent)) {
    const baseType = path.basename(node.dir)
    const resolvedContent = await resolveContent(parsedContent)
    linkNodes(resolvedContent, node, { isRoot: true, baseType })
  }
}
