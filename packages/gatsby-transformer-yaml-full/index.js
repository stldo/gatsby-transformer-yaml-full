const jsYaml = require(`js-yaml`)
const { camelCase, isPlainObject, upperFirst } = require(`lodash`)

const CREATE_NODE_PROPERTIES = ['id', 'parent', 'children', 'internal']
const MULTI_DOCUMENT_YAML = /^-{3}[ \t]*?($|[#!]|[|>][ \t]*?$)/m

exports.generateLinkNodes = (
  { createNode, createParentChildLink },
  createNodeId,
  createContentDigest,
  pluginOptions
) => function linkNodes (
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

exports.parse = function (content, types) {
  const schema = !types.length
    ? jsYaml.DEFAULT_FULL_SCHEMA
    : jsYaml.Schema.create(jsYaml.DEFAULT_FULL_SCHEMA, types)

  return -1 !== content.search(MULTI_DOCUMENT_YAML)
    ? jsYaml.loadAll(content, null, { schema })
    : jsYaml.load(content, { schema })
}

exports.resolveContent = async function resolveContent (content) {
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
