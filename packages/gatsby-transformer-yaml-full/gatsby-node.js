const { isPlainObject } = require('is-plain-object')
const jsYaml = require('js-yaml')
const path = require('path')
const _ = require('lodash')

const CAMEL_CASE_REGEXP = /(?:^|[^a-z0-9]+)([a-z0-9])|[^a-z0-9]+$/g
const MULTI_DOCUMENT_YAML = /^-{3}[ \t]*?($|[#!]|[|>][ \t]*?$)/m

function camelCase (string) {
  return string.toLowerCase().replace(CAMEL_CASE_REGEXP, (_, char) => {
    return char !== undefined ? char.toUpperCase() : ''
  })
}

function loadYaml (content, schema) {
  content += '\n'
  return content.search(MULTI_DOCUMENT_YAML) !== -1
    ? jsYaml.loadAll(content, { schema })
    : jsYaml.load(content, { schema })
}

exports.onCreateNode = async (...args) => {
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

  function getSchema () {
    const types = []

    for (const { resolve, options } of plugins) {
      const plugin = require(resolve)
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
  async function linkNodes (
    content,
    {
      generalType = null,
      specificType = '',
      index = 0
    } = {}
  ) {
    if ('id' in content) {
      content.yamlId = content.id
    }

    if (generalType) {
      const generalChild = {
        ...content,
        id: createNodeId(`${node.id}:${index} >>> ${generalType}`),
        internal: {
          contentDigest: createContentDigest(content),
          type: camelCase(`${generalType} Yaml`)
        }
      }
      await createNode(generalChild)
      createParentChildLink({ parent: node, child: generalChild })
    }

    const specificChild = {
      ...content,
      id: createNodeId(`${node.id}:${index} >>> ${specificType}`),
      internal: {
        contentDigest: createContentDigest(content),
        type: camelCase(`${specificType} Yaml`)
      }
    }
    await createNode(specificChild)
    createParentChildLink({ parent: node, child: specificChild })
  }

  async function resolveContent (content) {
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

  function getTypes (node) {
    let instanceName = null
    let directory = null
    const fileName = node.name

    const sourceInstanceName = node.sourceInstanceName
    if (
      sourceInstanceName && _.isString(sourceInstanceName) &&
        sourceInstanceName !== '__PROGRAMMATIC__' &&
        !_.isEmpty(sourceInstanceName)
    ) {
      instanceName = node.sourceInstanceName
    }

    const relativeDirectory = node.relativeDirectory
    // eslint-disable-next-line max-len
    if (
      relativeDirectory &&
      _.isString(relativeDirectory) &&
      !_.isEmpty(relativeDirectory)
    ) {
      directory = relativeDirectory
    }

    if (_.isNull(directory)) {
      directory = path.basename(node.dir)
    }

    const specificType = `${instanceName || directory || ''} ${fileName}`
    const generalType = `${instanceName || directory || null}`
    return { specificType, generalType }
  }

  const nodeContent = await loadNodeContent(node)
  const yaml = loadYaml(nodeContent, getSchema())

  if (Array.isArray(yaml)) {
    for (const [index, content] of yaml.entries()) {
      if (isPlainObject(content)) {
        const resolvedContent = await resolveContent(content)
        const { generalType, specificType } = getTypes(node)
        await linkNodes(resolvedContent, { generalType, specificType, index })
      }
    }
  } else if (isPlainObject(yaml)) {
    const resolvedContent = await resolveContent(yaml)
    const { generalType, specificType } = getTypes(node)
    await linkNodes(resolvedContent, { generalType, specificType })
  }
}

exports.onPluginInit = async (...args) => {
  const { plugins } = args[1]

  for (const { resolve } of plugins) {
    try {
      const { onPluginInit } = require(`${resolve}/gatsby-node.js`)

      if (onPluginInit) {
        await onPluginInit(...args)
      }
    } catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') {
        throw error
      }
    }
  }
}
