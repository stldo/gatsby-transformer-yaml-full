# gatsby-transformer-yaml-full [![npm][1]][2]

YAML parser with support for custom tags and multiple document sources.

## Installation

```sh
npm install gatsby-transformer-yaml-full
```

## Usage

> Note: `gatsby-transformer-yaml-full` requires a source plugin.

```js
/* gatsby-config.js */

module.exports = {
  plugins: [
    'gatsby-transformer-yaml-full',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        /* gatsby-source-filesystem options here */
      }
    }
  ]
}
```

You can organize your data as multiple documents, with all documents inside a
single file, or as single documents, with a single document per file:

- __Multiple Documents:__ each file represents a collection and each document
represents a record;
- __Single Document:__ each folder represents a collection and each file
represents a record.

### Multiple documents

Convert each document inside a file into a node. The node type is based on the
file name.

The `./collection.yaml` file below:

```yaml
---
character: a
number: 1

---
character: b
number: 2
```

Will return:

```js
{
  data: {
    allCollectionYaml: {
      nodes: [
        {
          character: 'a',
          number: 1
        },
        {
          character: 'b',
          number: 2
        }
      ]
    }
  }
}
```

With the following query:

```graphql
query {
  allCollectionYaml {
    nodes
      character
      number
    }
  }
}
```

### Single document

Convert each file inside a directory into a node. The node type is based on the
directory name.

The following directory structure:

```
posts/
  blog-post.yaml
  hello-world.yaml
```

With `./posts/blog-post.yaml` and `./posts/hello-world.yaml` files,
respectively:

```yaml
title: Blog post
```

```yaml
title: Hello, world!
```

Will return:

```js
{
  data: {
    allCollectionYaml: {
      nodes: [
        {
          title: 'Blog post'
        },
        {
          title: 'Hello, world!'
        }
      ]
    }
  }
}
```

With the following query:

```graphql
query {
  allPostsYaml {
    nodes
      title
    }
  }
}
```

### Enable custom tags with plugins

With plugins, specific YAML tags can be enabled and processed.

#### Example

With `gatsby-yaml-full-markdown` plugin activated:

```js
/* gatsby-config.js */

module.exports = {
  plugins: [
    {
      resolve: 'gatsby-transformer-yaml-full',
      options: {
        plugins: ['gatsby-yaml-full-markdown']
      }
    }
    // ...
  ]
}
```

Using a `!markdown` tag:

```yaml
title: Blog post
content: !markdown |
  ## Heading

  Article content.
```

Will return:

```js
{
  title: 'Blog post',
  content: '<h2>Heading</h2>\n<p>Article content.</p>\n'
}
```

## Options

### plugins

Type: `Array`. Default: `[]`.

Enable custom YAML tags (e.g. `gatsby-yaml-full-import`,
`gatsby-yaml-full-markdown`, etc.).

## `id` and `yamlId`

To keep consistency with the official `gatsby-transformer-yaml` plugin, if a
YAML file contains an `id` field, it'll be renamed to `yamlId` — `id` is a
reserved key in Gatsby.

## Writing plugins

The plugin should return a function, which should return an object with the
following properties:

- __tag _(string)_:__ the tag of the new type (e.g. `!import`, `!markdown`)
- __options:__ passed to JS-YAML [Type][3] constructor

The first argument of the function will be the `helpers` object received from
Gatsby on `exports.onCreateNode`. The second will be the plugin options object
set in `gatsby-config.js`.

```javascript
// index.js

module.exports = function ({ node }, pluginOptions) {
  return {
    tag: '!example',
    options: {
      kind: 'scalar',
      construct: () => `Parent directory is ${node.dir}`,
    },
  }
}
```

More information about creating local plugins, specific to your project, can be
found on [Gatsby documentation][4].

## License

[The MIT License][license]

[1]: https://img.shields.io/npm/v/gatsby-transformer-yaml-full
[2]: https://www.npmjs.com/package/gatsby-transformer-yaml-full
[3]: https://github.com/nodeca/js-yaml/blob/master/lib/type.js
[4]: https://www.gatsbyjs.com/docs/creating-a-local-plugin
[license]: https://github.com/stldo/gatsby-transformer-yaml-full/blob/master/LICENSE
