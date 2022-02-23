# gatsby-yaml-full-markdown [![npm][1]][2]

> ⚠️ __Warning__: the `plain` option will be deprecated in the future and this
> plugin will always return an object — the equivalent of setting `plain` to
> `true`. Find more info about this option [here][3].

> ⚠️ __Warning__: see [Migrating from < 4.0.0][4] if you are coming from older
> versions.

Plugin for `gatsby-transformer-yaml-full` to enable Markdown to HTML conversion
using `!markdown` tag. The conversion is handled by [remark][5].

## Installation

```sh
npm install gatsby-yaml-full-markdown gatsby-transformer-yaml-full
```

## Usage

```js
/* gatsby-config.js */

module.exports = {
  plugins: [
    {
      resolve: 'gatsby-transformer-yaml-full',
      options: {
        plugins: [
          {
            resolve: 'gatsby-yaml-full-markdown',
            options: {
              /* gatsby-yaml-full-markdown options here */
            }
          }
        ],
      },
    }
    // ...
  ],
}
```

### Example

> Note: this plugin accepts a string or a file path input; if a file is
> detected, the plugin will read it and return the processed data.

The following `./post.yaml` and `./file.md` files, respectively:

```yaml
---
title: Blog post
content: !markdown |
  ## Heading

  Article content.
file: !markdown file.md
```

```md
# Title

File content.
```

Will return:

```js
{
  data: {
    postYaml: {
      title: 'Blog post',
      content: '<h2>Heading</h2>\n<p>Article content.</p>\n',
      file: '<h1>Title</h1>\n<p>File content.</p>\n'
    }
  }
}
```

With the following query:

```graphql
query {
  postYaml {
    title
    content
    file
  }
}
```

## Options

### plain

Type: `boolean`. Default: `false`.

Returns plain text (without markups) along with HTML. When this option is
enabled, the markdown node will return an object — instead of a string with HTML
markup — containing two properties, `html` and `plain`.

The following `./post.yaml`:

```yaml
---
content: !markdown |
  ## Heading

  Article content.
```

Will return:

```js
{
  data: {
    postYaml: {
      content: {
        html: '<h2>Heading</h2>\n<p>Article content.</p>\n',
        plain: 'Heading\n\nArticle content.\n'
      },
    }
  }
}
```

With the following query:

```graphql
query {
  postYaml {
    content {
      html
      plain
    }
  }
}
```

### remarkHtml

Type: `object`. Default: `{}`.

`remark-html` can be configured through `remarkHtml` option —  i.e. if you want
to allow dangerous raw HTML in the output, set the `sanitize` option to `false`.
More info about `remark-html` options can be found [here][6].

## Migrating from `< 4.0.0`

Before version `4.0.0`, this plugin generated a `text/markdown` node from the
content, requiring a plugin like `gatsby-transformer-remark` to generate HTML
data. This is no longer the case. `gatsby-yaml-full-markdown` now outputs
processed data directly on the node, using `remark-html` to convert Markdown to
HTML.

## License

[The MIT License][license]

[1]: https://img.shields.io/npm/v/gatsby-yaml-full-markdown
[2]: https://www.npmjs.com/package/gatsby-yaml-full-markdown
[3]: #plain
[4]: #migrating-from--400
[5]: https://github.com/remarkjs/remark
[6]: https://github.com/remarkjs/remark-html#options
[license]: https://github.com/stldo/gatsby-transformer-yaml-full/blob/master/LICENSE
