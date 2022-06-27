const fs = require('fs/promises')

module.exports = function (context, options) {
  return {
    name: 'plugin-prefetch',
    async contentLoaded({actions}) {
      const {setGlobalData} = actions;
      let res = {}
      for (const [key, value] of Object.entries(options)) {
        if (key === 'id') continue;
        try {
          const data = await fs.readFile(value, {encoding: 'utf-8'})
          res[key] = JSON.parse(data)
        } catch (e) {
        }
      }
      setGlobalData(res)
    },
  };
};
