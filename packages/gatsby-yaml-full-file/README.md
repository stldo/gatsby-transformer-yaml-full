# gatsby-yaml-full-file

Plugin for `gatsby-transformer-yaml-full` that converts a path string into a file node. It uses `gatsby-source-filesystem` to create the nodes.

## Install and configure

```bash
$ npm install --save gatsby-yaml-full-file gatsby-transformer-yaml-full
```

__Note:__ this plugin has a peer dependency on `gatsby-source-filesystem@2.x`.

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
            resolve: `gatsby-yaml-full-file`,
            options: {
              path: './content', // If not set, the base path will be the parent
            },                   // directory of the YAML file being accessed
          },
        ],
      },
    },
    // ...
  ],
}
```

## Usage

Use a `!file` tag before a path relative to the YAML file — or the `path` set in plugin options. It uses `gatsby-source-filesystem` to create nodes but, to avoid internal conflicts, `gatsby-transformer-yaml-full` changes the node type to `FileYaml`.

### Example

#### Folder structure

```
content/
  images/
    picture.jpg
  index.yaml
```

#### YAML file

```yaml
# content/index.yaml

image: !file ./images/picture.jpg
```

#### Returning object

```javascript
{
  contentYaml: {
    childFileYaml: {
      extension: 'jpg',
      internal: {
        mediaType: 'image/jpeg',
        type: 'FileYaml',
        // ...
      },
      // childImageSharp: {
        // ...
      // },
      // ...
    }
  }
}
```

## Additional information

### Options

- __path _(string)_:__ sets a default base path for files, relative to `process.cwd()`

### Accessing `FileYaml` node inside child nodes

This plugin was created because Gatsby can't detect paths in plain arrays and deep nested object trees — those without a parent node. Currently, the implementation of this plugin depends on createChildNodes option set in `gatsby-transformer-yaml-full` — it's automatically enabled. To access a `FileYaml` inside deeply nested nodes, you should access it through the created child nodes.

#### YAML file

```yaml
# content/index.yaml

title: Rooms
rooms:
  - name: Room name
    gallery:
    - image: !file ./images/room.jpg
      caption: Room picture
```

#### Returning object

```javascript
{
  contentYaml: {
    title: 'Rooms',
    childContentRoomsYaml: {
      name: 'Room name',
      childContentRoomsGalleryYaml: {
        childFileYaml: {
          extension: 'jpg',
          // childImageSharp: {
            // ...
          // },
          // ...
        },
        caption: 'Room picture',
      },
    },
  },
}
```
