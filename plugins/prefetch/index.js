const fs = require('fs/promises')

module.exports = function (context, options) {
  return {
    name: 'plugin-prefetch',
    async contentLoaded({actions}) {
      const data = await fs.readFile('.prefetch/collections.json', { encoding: 'utf-8' })
      const {setGlobalData} = actions;
      setGlobalData({
        collections: JSON.parse(data)
      })
    },
  };
};
