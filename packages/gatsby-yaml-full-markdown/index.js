const remark = require('remark')
const remarkHtml = require('remark-html')

module.exports = () => ({
  tag: '!markdown',
  options: {
    kind: 'scalar',
    construct: async data => {
      return (await remark().use(remarkHtml).process(data)).contents
    },
  },
})
