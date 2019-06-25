# gatsby-yaml-full-markdown

Plugin for `gatsby-transformer-yaml-full` to parse Markdown strings into HTML.

## Install and configure

```bash
$ npm install --save gatsby-yaml-full-markdown gatsby-transformer-yaml-full
```

### Basic configuration

```javascript
// gatsby-config.js

module.exports = {
  plugins: [
    {
      resolve: `gatsby-transformer-yaml-full`,
      options: {
        plugins: [
          `gatsby-yaml-full-markdown`,
        ],
      },
    },
    // ...
  ],
}
```

## Usage

Use a `!markdown` tag before a string to parse it into HTML.

### Example

#### YAML file

```yaml
title: Blog post
content: !markdown |
  ## Heading

  Article content.
```

#### Returning object

```javascript
{
  title: 'Blog post',
  content: '<h2>Heading</h2>\n<p>Article content.</p>\n',
}
```
