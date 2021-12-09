# gatsby-yaml-full-import

Plugin for `gatsby-transformer-yaml-full` to enable import of other YAML files
or fields using `!import` tag.

## Install

```sh
$ npm install gatsby-yaml-full-import gatsby-transformer-yaml-full
```

Enable the plugin in `gatsby-config.js`:

```js
module.exports = {
  plugins: [
    {
      resolve: 'gatsby-transformer-yaml-full',
      options: {
        plugins: ['gatsby-yaml-full-import']
      }
    }
  ]
}
```

## Usage

### Import all fields from a file

— The following `./index.yaml` and `./post.yaml` files, respectively:

```yaml
---
importedPost: !import ./post.yaml
```

```yaml
title: Post title
```

 — Will return:

```js
{
  data: {
    indexYaml: {
      importedPost: {
        title: 'Post title'
      }
    }
  }
}
```

— With the following query:

```graphql
query {
  indexYaml {
    importedPost {
      title
    }
  }
}
```

### Import a specific field from a file

An exclamation mark (`!`) separates the file name from the field query. The
field query supports array indexes too.

— The following `./index.yaml` and `./post.yaml` files, respectively:

```yaml
---
importedAuthorName: !import ./post.yaml!authors.1.name
```

```yaml
authors:
- name: John Doe
- name: John Q.
```

 — Will return:

```js
{
  data: {
    indexYaml: {
      importedAuthorName: 'John Q.'
    }
  }
}
```

— With the following query:

```graphql
query {
  indexYaml {
    importedAuthorName
  }
}
```

## License

[The MIT License][license]

[license]: https://github.com/stldo/gatsby-transformer-yaml-full/blob/master/LICENSE
