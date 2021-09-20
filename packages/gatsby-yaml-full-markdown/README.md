# gatsby-yaml-full-markdown

Plugin for `gatsby-transformer-yaml-full` to convert strings to Markdown nodes.

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
            resolve: 'gatsby-yaml-full-markdown'
          }
        ],
      },
    }
    // ...
  ],
}
```

## Usage

Using the `!markdown` tag before a string converts the field to a Markdown media
type node. If the string is a file path, the file content will be used. Use a
Markdown plugin like `gatsby-transformer-remark` to transform the nodes.

### Example

#### Markdown file

```markdown

[//]: # "file.md"

# Title

File content.
```

#### YAML file

```yaml
# post.yaml

title: Blog post
content: !markdown |
  ## Heading

  Article content.
file: !markdown file.md
```

#### Result

```javascript
data: {
  contentYaml: {
    title: 'Blog post',
    content: {
      internal: {
        content: '## Heading\n\nArticle content.\n',
        mediaType: 'text/markdown',
        type: 'YamlMarkdown',
        // ...
      },
      // ...
    },
    file: {
      internal: {
        content: '\n[//]: # \"file.md\"\n\n# Title\n\nFile content.\n',
        mediaType: 'text/markdown',
        type: 'YamlMarkdown',
        // ...
      },
      // ...
    }
  }
}
```

## License

[The MIT License][license]

[license]: https://github.com/stldo/gatsby-transformer-yaml-full/blob/master/LICENSE
