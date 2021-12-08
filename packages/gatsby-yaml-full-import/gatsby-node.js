const watcher = require('./lib/watcher')

exports.onPluginInit = async helpers => {
  if (process.env.NODE_ENV === 'development') {
    await watcher.init(helpers)
  }
}
