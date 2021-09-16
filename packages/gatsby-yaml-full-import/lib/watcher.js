const { watch } = require('fs')
const { utimes } = require('fs/promises')

const CACHE_KEY = 'watchList'

let gatsbyPluginCache

async function watchImportPath (getNodes, importPath) {
  try {
    const watcher = watch(importPath, async () => {
      const watchList = await gatsbyPluginCache.get(CACHE_KEY)
      const pathList = watchList[importPath]

      if (!pathList) {
        watcher.close()
        return
      }

      const nodeList = getNodes().filter(({ absolutePath }) => (
        pathList.includes(absolutePath)
      ))

      if (!nodeList.length) {
        watchList[importPath] = null
        await gatsbyPluginCache.set(CACHE_KEY, watchList)
        watcher.close()
        return
      } else if (nodeList.length !== pathList.length) {
        watchList[importPath] = nodeList.map(({ absolutePath }) => absolutePath)
        await gatsbyPluginCache.set(CACHE_KEY, watchList)
      }

      const time = new Date()

      for (const node of nodeList) {
        // Reset contentDigest and touch file to trigger node update
        node.internal.contentDigest = ''
        await utimes(node.absolutePath, time, time)
      }
    })
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }

    const watchList = await gatsbyPluginCache.get(CACHE_KEY)
    watchList[importPath] = null
    await gatsbyPluginCache.set(CACHE_KEY, watchList)
  }
}

exports.add = async ({ getNodes }, importPath, nodePath) => {
  const watchList = await gatsbyPluginCache.get(CACHE_KEY)

  if (!watchList[importPath]) {
    watchList[importPath] = [nodePath]
    await gatsbyPluginCache.set(CACHE_KEY, watchList)
    await watchImportPath(getNodes, importPath)
  } else if (!watchList[importPath].includes(nodePath)) {
    watchList[importPath].push(nodePath)
    await gatsbyPluginCache.set(CACHE_KEY, watchList)
  }
}

exports.init = async ({ cache, getNodes }) => {
  const watchList = await cache.get(CACHE_KEY)

  gatsbyPluginCache = cache

  if (!watchList) {
    await cache.set(CACHE_KEY, {})
    return
  }

  for (const importPath in watchList) {
    await watchImportPath(getNodes, importPath)
  }
}
