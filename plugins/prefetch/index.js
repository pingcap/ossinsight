
module.exports = function (context, options) {
  return {
    name: 'plugin-prefetch',
    async contentLoaded({actions}) {
      const {default: fetch} = await import('node-fetch')
      const res = await fetch('https://api.ossinsight.io/collections')
      const data = await res.json()
      const {setGlobalData} = actions;
      setGlobalData({
        collections: data
      })
    },
  };
};
