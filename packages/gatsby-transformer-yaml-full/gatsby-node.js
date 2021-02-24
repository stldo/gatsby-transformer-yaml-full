const { isPlainObject } = require('is-plain-object')
const jsYaml = require('js-yaml')
const path = require('path')

const CAMEL_CASE_REGEXP = /(?:^|[^a-z0-9]+)([a-z0-9])|[^a-z0-9]+$/g
const MULTI_DOCUMENT_YAML = /^-{3}[ \t]*?($|[#!]|[|>][ \t]*?$)/m

function camelCase(string) {
  return string.toLowerCase().replace(CAMEL_CASE_REGEXP, (_, char) => {
    return char !== undefined ? char.toUpperCase() : ''
  })
}

function loadYaml(content, schema) {
  content += '\n'
  return content.search(MULTI_DOCUMENT_YAML) !== -1
    ? jsYaml.loadAll(content, { schema })
    : jsYaml.load(content, { schema })
}

exports.onCreateNode = async (helpers, { plugins }) => {
  const { node } = helpers

  if (node.internal.mediaType !== 'text/yaml') {
    return
  }

  const {
    actions: { createNode, createParentChildLink },
    createContentDigest,
    createNodeId,
    loadNodeContent
  } = helpers

  function getSchema() {
    const types = []

    for (let { resolve, pluginOptions } of plugins) {
      const plugin = require(resolve)
      const result = plugin(helpers, pluginOptions)

      // The plugin must return a single type or an array of types
      for (let { options, tag } of Array.isArray(result) ? result : [result]) {
        types.push(new jsYaml.Type(tag, options))
      }
    }

    return types.length
      ? jsYaml.DEFAULT_SCHEMA.extend(types)
      : jsYaml.DEFAULT_SCHEMA
  }

  async function linkNodes(content, { type = '', index = 0 }) {
    const id = 'id' in content
      ? content.id
      : createNodeId(`${node.id}:${index} >>> YAML`)

    const child = {
      ...content,
      id,
      children: [],
      parent: node.id,
      internal: {
        contentDigest: createContentDigest(content),
        type: camelCase(`${type} Yaml`)
      }
    }

    await createNode(child)
    createParentChildLink({ parent: node, child })
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

  const nodeContent = await loadNodeContent(node)
  const yaml = loadYaml(nodeContent, getSchema())

  if (Array.isArray(yaml)) {
    for (let [index, content] of yaml.entries()) {
      if (!isPlainObject(content)) continue
      const type = `${node.relativeDirectory} ${node.name}`
      const resolvedContent = await resolveContent(content)
      await linkNodes(resolvedContent, { type, index })
    }
  } else if (isPlainObject(yaml)) {
    const type = path.basename(node.dir)
    const resolvedContent = await resolveContent(yaml)
    await linkNodes(resolvedContent, { type })
  }
}
