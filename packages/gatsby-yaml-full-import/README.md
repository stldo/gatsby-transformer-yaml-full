# gatsby-yaml-full-import

Plugin for `gatsby-transformer-yaml-full` to enable YAML files importing using !import tag.

## Install and configure

```bash
$ npm install gatsby-yaml-full-import gatsby-transformer-yaml-full
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
          {
            resolve: `gatsby-yaml-full-import`,
            options: {
              path: './content', // If not set, the base path will be the
            },                   // current directory of the YAML file being
          },                     // accessed
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

#### Folder structure

```
content/
  index.yaml
  post.yaml
```

#### YAML files

```yaml
# content/post.yaml

title: Post title
```

```yaml
# content/index.yaml

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

#### Folder structure

```
content/
  index.yaml
  post.yaml
```

#### YAML files

```yaml
# content/post.yaml

authors:
- name: John Doe
- name: John Q.
```

```yaml
# content/index.yaml

importedAuthorName: !import ./post.yaml authors.0.name
```

#### Returning object

```javascript
{
  importedAuthorName: 'John Doe'
}
```

## Additional information

### Options

- __path _(string)_:__ sets a default base path for files, relative to `process.cwd()`
