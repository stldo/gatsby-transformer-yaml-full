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
              rehypePlugins: true,
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

### rehypePlugins

Default: `true`. Type: `boolean`, `Object` or `Array`.

[rehype plugins](https://github.com/rehypejs/rehype/blob/main/doc/plugins.md)
used by [unified](https://github.com/unifiedjs/unified), after the string was
parsed with
[remark-parse](https://github.com/remarkjs/remark/tree/main/packages/remark-parse)
and transformed using
[remark-rehype](https://github.com/remarkjs/remark-rehype).
By default, this plugins uses
[rehype-sanitize](https://github.com/rehypejs/rehype-sanitize), followed by
[rehype-stringify](https://github.com/rehypejs/rehype/tree/main/packages/rehype-stringify).
To configure the default plugins, use an object, e.g.
`{ sanitize: { /* rehype-sanitize options */ }, stringify: { /* rehype-stringify options */ } }`.
For custom plugins use an array, e.g. `[[plugin], [plugin, options], /* ... */]`
— the default plugins will be ignored. Set to `false` to disable rehype plugins
and return just the syntax tree ([mdast](https://github.com/syntax-tree/mdast)).

### unwrapSingleLine

Default: `true`. Type: `boolean`.

Remove the `<p>` element wrapping the result if the value has a single line and
wasn't [loaded from a file](#yaml-file). This option is ignored if custom
rehype plugins are used.

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
