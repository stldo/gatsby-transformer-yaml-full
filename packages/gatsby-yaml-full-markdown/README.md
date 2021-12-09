# gatsby-yaml-full-markdown

Plugin for `gatsby-transformer-yaml-full` to convert Markdown fields to HTML
using remark and remark-html.

## Install

```bash
$ npm install gatsby-yaml-full-markdown gatsby-transformer-yaml-full
```

## Configure

```javascript
// gatsby-config.js

module.exports = {
  plugins: [
    {
      resolve: 'gatsby-transformer-yaml-full',
      options: {
        plugins: [
          {
            resolve: 'gatsby-yaml-full-markdown',
            options: {
              remarkHtml: {
                // remark-html options
              }
            }
          }
        ],
      },
    }
    // ...
  ],
}
```

## Usage

### Markdown file

```markdown

[//]: # "file.md"

# Title

File content.
```

### YAML file

```yaml
# post.yaml

title: Blog post
content: !markdown |
  ## Heading

  Article content.
file: !markdown file.md
```

### Result

```javascript
data: {
  contentYaml: {
    title: 'Blog post',
    content: '<h2>Heading</h2>\n<p>Article content.</p>\n',
    file: '<h1>Title</h1>\n<p>File content.</p>\n'
  }
}
```

## License

[The MIT License][license]

[license]: https://github.com/stldo/gatsby-transformer-yaml-full/blob/master/LICENSE
