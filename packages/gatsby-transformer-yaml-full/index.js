const jsYaml = require('js-yaml')

const MULTI_DOCUMENT_YAML = /^-{3}[ \t]*?($|[#!]|[|>][ \t]*?$)/m

let schema

exports.configureSchema = types => {
  schema = types.length
    ? jsYaml.DEFAULT_SCHEMA.extend(types)
    : jsYaml.DEFAULT_SCHEMA
}

exports.parse = content => (
  content.search(MULTI_DOCUMENT_YAML) !== -1
    ? jsYaml.loadAll(content, null, { schema })
    : jsYaml.load(content, { schema })
)
