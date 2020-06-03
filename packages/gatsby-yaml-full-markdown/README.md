# gatsby-yaml-full-markdown

Plugin for `gatsby-transformer-yaml-full` to parse Markdown strings into HTML.

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
              unwrapSingleLine: true
            }
          }
        ],
      },
    },
    // ...
  ],
}
```

## Options

### unwrapSingleLine

Default: `true`. Type: `boolean`.

If the value has a single line and wasn't [loaded from a file](#yaml-file), then
remove the `<p>` element wrapping the string.

## Usage

Use the `!markdown` tag before a string to parse it into HTML. If the string is
a file path, this file will be loaded and the content will be parsed.

### Example

#### Markdown file

```markdown
_file.md_

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

#### Returning object

```javascript
{
  title: 'Blog post',
  file: '<p><em>file.md</em></p>\n<h1>Title</h1>\n<p>File content.</p>\n',
  content: '<h2>Heading</h2>\n<p>Article content.</p>\n'
}
```
