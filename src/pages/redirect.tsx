import React, {useEffect} from 'react';
import {useRouteMatch,useHistory,useLocation} from '@docusaurus/router';

export default function Page () {
  const location = useLocation()
  const history = useHistory()
  useEffect(() => {
    const usp = new URLSearchParams(location.search)
    const path = usp.get('path')
    const query = usp.get('query')
    const hash = usp.get('hash')

    let url = path
    if (query) {
      url += '?' + encodeURIComponent(query)
    }
    if (hash) {
      url += '#' + encodeURIComponent(hash)
    }
    history.replace(url)
  }, [location, history])
  return <></>
}
