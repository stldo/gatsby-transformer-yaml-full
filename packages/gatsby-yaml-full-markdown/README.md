# gatsby-yaml-full-markdown

Plugin for `gatsby-transformer-yaml-full` to enable Markdown to HTML conversion
using `!markdown` tag. The conversion is handled by [remark][1].

> ⚠️ __Warning__: See [Migrating from < 4.0.0][2] if you are coming from older
> versions.

## Install

```sh
$ npm install gatsby-yaml-full-markdown gatsby-transformer-yaml-full
```

Enable the plugin in `gatsby-config.js`:

```js
module.exports = {
  plugins: [
    {
      resolve: 'gatsby-transformer-yaml-full',
      options: {
        plugins: ['gatsby-yaml-full-markdown']
      }
    }
  ]
}
```

## Usage

This plugin accepts a string or a file path input. If a file is detected, the
plugin will read it and return the processed data.

### Example

— The following `./post.yaml` and `./file.md` files, respectively:

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

 — Will return:

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

— With the following query:

```graphql
query {
  postYaml {
    title
    content
    file
  }
}
```

## Configure

```js
module.exports = {
  plugins: [
    {
      resolve: 'gatsby-transformer-yaml-full',
      options: {
        plugins: [
          {
            resolve: 'gatsby-yaml-full-markdown',
            // options: {
            //   remarkHtml: {
            //     // ...remark-html options
            //   }
            // }
          }
        ],
      },
    }
    // ...
  ],
}
```

### remarkHtml

Type: `object`. Default: `{}`.

`remark-html` can be configured through `remarkHtml` option —  i.e. if you want
to allow dangerous raw HTML in the output, set the `sanitize` option to `false`.
More info about `remark-html` options can be found [here][3].

## Migrating from `< 4.0.0`

Before version `4.0.0`, this plugin generated a `text/markdown` node from the
content, requiring a plugin like `gatsby-transformer-remark` to generate HTML
data. This is no longer the case. `gatsby-yaml-full-markdown` now outputs
processed data directly on the node, using `remark-html` to convert Markdown to
HTML.

## License

[The MIT License][license]

[1]: https://github.com/remarkjs/remark
[2]: #migrating-from--400
[3]: https://github.com/remarkjs/remark-html#options
[license]: https://github.com/stldo/gatsby-transformer-yaml-full/blob/master/LICENSE
