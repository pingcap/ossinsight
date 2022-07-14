/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useEffect, useState} from 'react';
import Layout from '@theme/Layout';
import Translate, {translate} from '@docusaurus/Translate';
import {useHistory} from "@docusaurus/router";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from '@mui/material/Link';

function NotFound() {
  const history = useHistory()
  const [display, setDisplay] = useState(false)

  useEffect(() => {
    let {pathname,search,hash} = window.location;
    search = search?.replace(/^\?/, '')
    hash = hash?.replace(/^#/, '')
    // Only support redirect analyze/repo/name for now
    // TODO: see https://www.npmjs.com/package/path-to-regexp
    //       use plugin data to auto generate regexp list.
    const [first, ...rest] = pathname.split('/')
    if (first === 'analyze') {
      if (rest.length >= 1 && rest.length <= 2) {
        history.replace({pathname, search, hash})
        return
      } else if (rest.length === 0) {
        history.replace({pathname: '/analyze/pingcap/tidb', search, hash})
        return
      }
    }
    setDisplay(true)
  }, [])

  return (
    <Layout
      title={display ? undefined : 'Loading...'}
      description='The comprehensive Open Source Software insight tool by analyzing massive events from GitHub, powered by TiDB, the best insight building database of data agility.'
      image='/img/screenshots/homepage.png'
    >
      {display ? renderNotFound() : renderRedirect()}
    </Layout>
  );
}

function renderRedirect () {
  return (
    <main className="container margin-vert--xl">
      <div className="row">
        <div className="col col--6 col--offset-3">
          <Typography variant='body1' fontSize={24}>
            Loading...
            &nbsp;
            <CircularProgress display='inline-block' size={24} />
          </Typography>
        </div>
      </div>
    </main>
  )
}

function renderNotFound () {
  return (
    <main className="container margin-vert--xl">
      <div className="row">
        <div className="col col--6 col--offset-3">
          <h1 className="hero__title">
            <Translate
              id="theme.NotFound.title"
              description="The title of the 404 page">
              Oooooops! You have found a magical place ⛰️.
            </Translate>
          </h1>
          <p>
            <Translate
              id="theme.NotFound.p1"
              description="The first paragraph of the 404 page">
              We can not lead you to this URL.
            </Translate>
          </p>
          <p>
            <Translate
              id="theme.NotFound.p2"
              description="The 2nd paragraph of the 404 page">
              How about going to analyze a developer / repository ? And I guess you will find something interesting in Collections as well !
            </Translate>
          </p>
          <Button sx={{fontSize: 16, fontWeight: 'bold', verticalAlign: 'baseline', textDecoration: 'underline', marginTop:6}} component={Link} href='/'>
            🧑‍💻 get insights with developers
          </Button>
          <Button sx={{fontSize: 16, fontWeight: 'bold', verticalAlign: 'baseline', textDecoration: 'underline', marginTop:2}} component={Link} href='/'>
            🔍  get insights with repositories
          </Button>
          <Button sx={{fontSize: 16, fontWeight: 'bold', verticalAlign: 'baseline', textDecoration: 'underline', marginTop:2}} component={Link} href='/collections/open-source-database'>
            🔥 get insights with collections
          </Button>
        </div>
      </div>
    </main>
  )
}

export default NotFound;
