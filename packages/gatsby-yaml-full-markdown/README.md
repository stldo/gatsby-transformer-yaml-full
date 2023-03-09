# gatsby-yaml-full-markdown [![npm][1]][2]

Plugin for `gatsby-transformer-yaml-full` to enable Markdown to HTML conversion
using `!markdown` tag. The conversion is handled by [remark][3].

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
      content: {
        html: '<h2>Heading</h2>\n<p>Article content.</p>\n',
        plain: 'Heading\n\nArticle content.\n'
      },
      file: {
        html: '<h1>Title</h1>\n<p>File content.</p>\n',
        plain: 'Title\n\nFile content.\n'
      }
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

### remarkHtml

Type: `object`. Default: `{}`.

`remark-html` can be configured through `remarkHtml` option —  i.e. if you want
to allow dangerous raw HTML in the output, set the `sanitize` option to `false`.
More info about `remark-html` options can be found [here][4].

## License

[The MIT License][license]

[1]: https://img.shields.io/npm/v/gatsby-yaml-full-markdown
[2]: https://www.npmjs.com/package/gatsby-yaml-full-markdown
[3]: https://github.com/remarkjs/remark
[4]: https://github.com/remarkjs/remark-html#options
[license]: https://github.com/stldo/gatsby-transformer-yaml-full/blob/master/LICENSE
