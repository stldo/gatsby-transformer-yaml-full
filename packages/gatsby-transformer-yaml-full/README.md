# gatsby-transformer-yaml-full

YAML parser with support for custom types and multiple documents.

## Install and configure

```bash
$ npm install --save gatsby-transformer-yaml-full
```

### Basic configuration

```javascript
// gatsby-config.js

module.exports = {
  plugins: [
    `gatsby-transformer-yaml-full`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `./content`, // Path to your .yaml (or .yml) files
      },
    },
  ],
}
```

__Note:__ `gatsby-transformer-yaml-full` requires a source plugin like `gatsby-source-filesystem`.

### Enable custom types with plugins

You can extend the parser functionality with plugins (e.g., [gatsby-yaml-full-markdown](https://github.com/stldo/gatsby-yaml-full-markdown)).

```javascript
// gatsby-config.js

module.exports = {
  plugins: [
    {
      resolve: `gatsby-transformer-yaml-full`,
      options: {
        plugins: [
          `gatsby-yaml-full-markdown`, // Enable !markdown tags
        ],
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `./content`,
      },
    },
  ],
}
```

## Usage

You can organize your data as multiple documents in individual files or as single documents spread across multiple files:

- __Multiple Documents:__ each file represents a collection and each document represents a record
- __Single Document:__ each folder represents a collection and each file represents a record

### Multiple documents

Convert each document inside a file into a node. The node type is based on the file name.

#### YAML file

```yaml
# content/collection.yaml

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

Convert each file inside a directory into a node. The node type is based on the directory name.

#### Folder structure

```
content/
  posts/
    blog-post.yaml
    hello-world.yaml
    new-post.yaml
```

#### YAML files

```yaml
# content/posts/blog-post.yaml

title: Blog post
```

```yaml
# content/posts/hello-world.yaml

title: Hello, world!
```

```yaml
# content/posts/new-post.yaml

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

You can extend the parser funcionality with plugins. Enabling `gatsby-yaml-full-markdown` plugin, the following document:

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

## Additional information

### Options

- __plugins _(array)_:__ sets the plugins that should be enabled by `gatsby-transformer-yaml-full`
- __createChildNodes _(boolean)_:__ create nodes for each parent in the object tree alongside its own child elements (it's required — and automatically set — by `gatsby-yaml-full-file` and possibly other plugins)

#### createChildNodes example

If `createChildNodes` is set to true, the document below:

```yaml
# people.yaml

--- # Indicates a multi document file

gallery:
  items:
  - title: Gallery item
    description: 1st entry
  - title: Another gallery item
    description: Last entry
```

Would create the following nodes:

```graphql
{
  allPeopleYaml {
    edges {
      node {
        # createChildNodes enabled tree
        childPeopleGalleryYaml {
          childPeopleGalleryItemsYaml {
            title
            description
          }
        }
        # Regular tree
        gallery {
          items {
            title
            description
          }
        }
      }
    }
  }
}
```

### Writing plugins

The plugin should return a function, which should return an object with the following properties:

- __tag _(string)_:__ the tag representing the created type (e.g., `!markdown`, `!file`)
- __options:__ the options passed to [JS-YAML](https://github.com/nodeca/js-yaml) `Type` constructor (i.e. https://github.com/nodeca/js-yaml/wiki/Custom-types)
- __transformerOptions:__ use it to pass options directly to `gatsby-transformer-yaml-full`

The first argument of the function will be the same object received from Gatsby on `exports.onCreateNode`. The second will be the plugin options object set in `gatsby-config.js`.

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
