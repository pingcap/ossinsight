const fs = require('fs/promises')

module.exports = function (context, options) {
  return {
    name: 'plugin-prefetch',
    async contentLoaded({actions}) {
      for (const [key, value] of Object.entries(options)) {
        if (key === 'id') continue;
        const data = await fs.readFile(value, {encoding: 'utf-8'})
        const {setGlobalData} = actions;
        setGlobalData({
          [key]: JSON.parse(data)
        })
      }
    },
  };
};
