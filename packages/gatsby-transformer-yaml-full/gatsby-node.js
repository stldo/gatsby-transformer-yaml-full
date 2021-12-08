const { isPlainObject } = require('is-plain-object')
const jsYaml = require('js-yaml')
const path = require('path')

const CAMEL_CASE_REGEXP = /(?:^|[^a-z0-9]+)([a-z0-9])|[^a-z0-9]+$/g
const MULTI_DOCUMENT_YAML = /^-{3}[ \t]*?($|[#!]|[|>][ \t]*?$)/m

const eventsCache = {}
const pluginsCache = {}

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

async function runCachedEvent(event, args) {
  if (eventsCache[event]) {
    for (const callback of eventsCache[event]) {
      await callback(...args)
    }
  }
}

exports.onCreateNode = async (...args) => {
  await runCachedEvent('onCreateNode', args)

  const { node } = args[0]

  if (node.internal.mediaType !== 'text/yaml') {
    return
  }

  const {
    actions: { createNode, createParentChildLink },
    createContentDigest,
    createNodeId,
    loadNodeContent
  } = args[0]

  const {
    plugins
  } = args[1]

  function getSchema() {
    const types = []

    for (let { resolve, options } of plugins) {
      const plugin = pluginsCache[resolve]
      const result = plugin(...args, options)
      const results = Array.isArray(result) ? result : [result]

      // The plugin must return a single type or an array of types
      for (const { options, tag } of results) {
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
    content = await content

    if (Array.isArray(content)) {
      for (let index = 0; index < content.length; index++) {
        content[index] = await resolveContent(content[index])
      }
    } else if (
      isPlainObject(content) &&
      !(content.internal && content.internal.type)
    ) {
      for (const [key, value] of Object.entries(content)) {
        content[key] = await resolveContent(value)
      }
    }

    return content
  }

  const nodeContent = await loadNodeContent(node)
  const yaml = loadYaml(nodeContent, getSchema())

  if (Array.isArray(yaml)) {
    for (let [index, content] of yaml.entries()) {
      if (isPlainObject(content)) {
        const type = `${node.relativeDirectory} ${node.name}`
        const resolvedContent = await resolveContent(content)

        await linkNodes(resolvedContent, { type, index })
      }
    }
  } else if (isPlainObject(yaml)) {
    const type = path.basename(node.dir)
    const resolvedContent = await resolveContent(yaml)

    await linkNodes(resolvedContent, { type })
  }
}

exports.onPluginInit = async (...args) => {
  const { plugins } = args[1]

  for (const { resolve } of plugins) {
    pluginsCache[resolve] = require(resolve)

    try {
      const events = require(`${resolve}/gatsby-node.js`)

      for (const event in events) {
        if (!eventsCache[event]) {
          eventsCache[event] = []
        }

        eventsCache[event].push(events[event])
      }
    } catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') {
        throw error
      }
    }
  }

  await runCachedEvent('onPluginInit', args)
}

exports.onPreBootstrap = async (...args) => {
  await runCachedEvent('onPreBootstrap', args)
}
