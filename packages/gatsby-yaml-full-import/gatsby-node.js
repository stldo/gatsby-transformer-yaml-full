const watcher = require('./lib/watcher')

exports.onPreBootstrap = async helpers => {
  if (process.env.NODE_ENV === 'development') {
    await watcher.init(helpers)
  }
}
