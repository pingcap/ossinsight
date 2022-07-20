module.exports.getContentGroup = function getContentGroup ({ pathname, search }) {
  // collections
  if (/\/collections\//.test(pathname)) {
    if (/\/trends/.test(pathname)) {
      return 'collections trends'
    } else {
      return 'collections monthly'
    }
  } else if (/\/analyze\//.test(pathname)) {
    if (/\/analyze\/[^/]+\/[^/]+/.test(pathname)) {
      if (/vs=/.test(search)) {
        return 'compare'
      } else {
        return 'analyze'
      }
    } else if (/\/analyze\/[^/]+/.test(pathname)) {
      return 'analyze-user'
    }
  } else if (/\/blog\//.test(pathname)) {
    return 'blog'
  } else if (/\/workshop\//.test(pathname)) {
    return 'workshop'
  }
}
