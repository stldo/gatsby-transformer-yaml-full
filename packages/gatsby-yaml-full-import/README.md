# gatsby-yaml-full-import

Plugin for `gatsby-transformer-yaml-full` to enable YAML files importing using
`!import` tag.

## Install

```bash
$ npm install gatsby-yaml-full-import gatsby-transformer-yaml-full
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
          'gatsby-yaml-full-import'
        ],
      },
    },
    // ...
  ],
}
```

## Usage

Use the `!import` tag to import the content of a YAML file inside a property.

### Importing YAML data from another file

#### YAML files

```yaml
# post.yaml

title: Post title
```

```yaml
# index.yaml

importedPost: !import ./post.yaml
```

#### Returning object

```javascript
{
  importedPost: {
    title: 'Post title'
  }
}
```

### Importing a specific field

Use an exclamation mark (`!`) to separate file name from field names.

#### YAML files

```yaml
# post.yaml

authors:
- name: John Doe
- name: John Q.
```

```yaml
# index.yaml

importedAuthorName: !import ./post.yaml!authors.0.name
```

#### Returning object

```javascript
{
  importedAuthorName: 'John Doe'
}
```

## License

[The MIT License][license]

[license]: https://github.com/stldo/gatsby-transformer-yaml-full/blob/master/LICENSE
