import React, { useEffect, useState } from 'react';
import Translate, { translate } from '@docusaurus/Translate';
import { PageMetadata } from '@docusaurus/theme-common';
import Layout from '@theme/Layout';
import { useHistory } from '@docusaurus/router';
import { Typography, CircularProgress } from '@mui/material';

export default function NotFound (): JSX.Element {
  const history = useHistory();
  const [display, setDisplay] = useState(false);

  useEffect(() => {
    let { pathname, search, hash } = window.location;
    search = search?.replace(/^\?/, '');
    hash = hash?.replace(/^#/, '');
    // Only support redirect analyze/repo/name for now
    // TODO: see https://www.npmjs.com/package/path-to-regexp
    //       use plugin data to auto generate regexp list.
    const [first, ...rest] = pathname.split('/');
    if (first === 'analyze') {
      if (rest.length >= 1 && rest.length <= 2) {
        history.replace({ pathname, search, hash });
        return;
      } else if (rest.length === 0) {
        history.replace({ pathname: '/analyze/pingcap/tidb', search, hash });
        return;
      }
    }
    setDisplay(true);
  }, []);

  return (
    <>
      <PageMetadata
        title={translate({
          id: 'theme.NotFound.title',
          message: 'Page Not Found',
        })
          ? undefined
          : 'Loading...'}
        description="The comprehensive Open Source Software insight tool by analyzing massive events from GitHub, powered by TiDB, the best insight building database of data agility."
        image="/img/screenshots/homepage.png"
      />
      <Layout disableAuth>
        {display ? renderNotFound() : renderRedirect()}
      </Layout>
    </>
  );
}

function renderRedirect () {
  return (
    <main className="container margin-vert--xl">
      <div className="row">
        <div className="col col--6 col--offset-3">
          <Typography variant="body1" fontSize={24}>
            Loading...
            &nbsp;
            <CircularProgress sx={{ display: 'inline-block' }} size={24} />
          </Typography>
        </div>
      </div>
    </main>
  );
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
              Page Not Found
            </Translate>
          </h1>
          <p>
            <Translate
              id="theme.NotFound.p1"
              description="The first paragraph of the 404 page">
              We could not find what you were looking for.
            </Translate>
          </p>
          <p>
            <Translate
              id="theme.NotFound.p2"
              description="The 2nd paragraph of the 404 page">
              Please contact the owner of the site that linked you to the
              original URL and let them know their link is broken.
            </Translate>
          </p>
        </div>
      </div>
    </main>
  );
}
