# gatsby-transformer-yaml-full

YAML parser with support for custom types and multiple documents.

## Install

```bash
$ npm install gatsby-transformer-yaml-full
```

## Configure

### Using with gatsby-source-filesystem

```javascript
// gatsby-config.js

module.exports = {
  plugins: [
    'gatsby-transformer-yaml-full',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: './content', // Path to your .yaml (or .yml) files
      },
    },
  ],
}
```

__Note:__ `gatsby-transformer-yaml-full` requires a source plugin, like
`gatsby-source-filesystem`.

### Enable custom types with plugins

You can extend the parser functionality with plugins (e.g.,
[gatsby-yaml-full-markdown](https://github.com/stldo/gatsby-yaml-full-markdown)
).

```javascript
// gatsby-config.js

module.exports = {
  plugins: [
    {
      resolve: 'gatsby-transformer-yaml-full',
      options: {
        plugins: [
          'gatsby-yaml-full-markdown', // Enable !markdown tags
        ],
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: './content',
      },
    },
  ],
}
```

## Options

### plugins

Default: `[]`. Type: `Array`.

Enable specific YAML types (e.g. `gatsby-yaml-full-import` or
`gatsby-yaml-full-markdown`)

## Usage

You can organize your data as multiple documents in individual files or as
single documents spread across multiple files:

- __Multiple Documents:__ each file represents a collection and each document
represents a record
- __Single Document:__ each folder represents a collection and each file
represents a record

### Multiple documents

Convert each document inside a file into a node. The node type is based on the
file name.

#### YAML file

```yaml
# collection.yaml

character: a
number: 1

---

character: b
number: 2

---

character: c
number: 3
```

#### GraphQL query

```graphql
{
  allCollectionYaml {
    edges {
      node {
        character
        number
      }
    }
  }
}
```

#### Returning object

```javascript
{
  allCollectionYaml: {
    edges: [
      {
        node: {
          character: 'a',
          number: 1,
        },
      },
      {
        node: {
          character: 'b',
          number: 2,
        },
      },
      {
        node: {
          character: 'c',
          number: 3,
        },
      },
    ]
  }
}
```

### Single Document

Convert each file inside a directory into a node. The node type is based on the
directory name.

#### Directory structure

```
posts/
  blog-post.yaml
  hello-world.yaml
  new-post.yaml
```

#### YAML files

```yaml
# posts/blog-post.yaml

title: Blog post
```

```yaml
# posts/hello-world.yaml

title: Hello, world!
```

```yaml
# posts/new-post.yaml

title: New post
```

#### GraphQL query

```graphql
{
  allPostsYaml {
    edges {
      node {
        title
      }
    }
  }
}
```

#### Returning object

```javascript
{
  allPostsYaml: {
    edges: [
      {
        node: {
          title: 'Blog post',
        },
      },
      {
        node: {
          title: 'Hello, world!',
        },
      },
      {
        node: {
          title: 'New post',
        },
      },
    ]
  }
}
```

### Type plugins

You can extend the parser funcionality with plugins. Enabling
`gatsby-yaml-full-markdown` plugin, the following document:

```yaml
title: Blog post
content: !markdown |
  ## Heading

  Article content.
```

Would return:

```javascript
{
  title: 'Blog post',
  content: '<h2>Heading</h2>\n<p>Article content.</p>\n',
}
```

### Writing plugins

The plugin should return a function, which should return an object with the
following properties:

- __tag _(string)_:__ the tag of the new type (e.g., `!markdown`, `!file`)
- __options:__ passed to [JS-YAML](https://github.com/nodeca/js-yaml) `Type`
constructor (i.e. https://github.com/nodeca/js-yaml/wiki/Custom-types)

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
found on
[Gatsby documentation](https://www.gatsbyjs.com/docs/creating-a-local-plugin).
