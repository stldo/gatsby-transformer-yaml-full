const path = require('path')
const jsYaml = require('js-yaml')

const watcher = require('./lib/watcher')

const MULTI_DOCUMENT_YAML = /^-{3}[ \t]*?($|[#!]|[|>][ \t]*?$)/m
const YAML_TAGS = /(?:^[ \t]*|:[ \t]+)(![^ \t]+)/gm

module.exports = helpers => ({
  tag: '!import',
  options: {
    kind: 'scalar',
    construct: async data => {
      const { getNodes, loadNodeContent, node, reporter } = helpers
      const [importRelativePath, importField] = data.split('!')
      const importPath = path.resolve(node.dir, importRelativePath)
      const [fileNode] = getNodes().filter(({ absolutePath }) => (
        absolutePath === importPath
      ))

      if (!fileNode) {
        reporter.error(
          `!import "${importRelativePath}" not found in ` +
          `"${node.relativePath}"`
        )

        return null
      }

      if (process.env.NODE_ENV === 'development') {
        await watcher.add(helpers, importPath, node.absolutePath)
      }

      const yaml = await loadNodeContent(fileNode)
      const types = []

      let yamltagMatch

      /* Match YAML tags and return their fields as strings */
      // eslint-disable-next-line no-cond-assign
      while (yamltagMatch = YAML_TAGS.exec(yaml)) {
        types.push(new jsYaml.Type(yamltagMatch[1], { kind: 'scalar' }))
      }

      const jsYamlOptions = types.length
        ? { schema: jsYaml.DEFAULT_SCHEMA.extend(types) }
        : {}

      let content = MULTI_DOCUMENT_YAML.test(yaml)
        ? jsYaml.loadAll(yaml, jsYamlOptions)
        : jsYaml.load(yaml, jsYamlOptions)

      if (!importField) {
        return content
      }

      for (const field of importField.split('.')) {
        if (field in content) {
          content = content[field]
          continue
        }

        reporter.error(
          `"${importField}" doesn't exist in ` +
          `!import "${importRelativePath}"`
        )

        return null
      }

      return content
    }
  }
})
