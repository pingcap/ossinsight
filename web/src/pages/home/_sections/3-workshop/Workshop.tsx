import React from 'react';
import { StackProps } from '@mui/material/Stack';
import Link from '@docusaurus/Link';
import { styled, Stack, Typography, Button, Box } from '@mui/material';

const links: Array<{ title: string, href: string }> = [
  { title: 'Mini OSS Insight', href: '/docs/workshop/mini-ossinsight/introduction' },
  { title: 'NFT Insight', href: '/docs/workshop/nft-insight' },
  { title: 'Twitter Insight', href: '/docs/workshop/twitter-insight' },
  { title: 'Stack Overflow Insight', href: '/docs/workshop/stackoverflow-insight' },
];

export default function Workshop () {
  return (
    <Stack direction={['column', 'column', 'row']}>
      <Card>
        <List>
          {links.map(({ title, href }) => (
            <ListItem key={href} direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body1">
                {title}
              </Typography>
              <Link href={href} target='_blank' >
                &gt;&nbsp;Tutorial
              </Link>
            </ListItem>
          ))}
        </List>
      </Card>
      <Box minWidth={36} maxWidth={36} minHeight={36} maxHeight={36} />
      <Card>
        <Stack justifyContent="space-between" alignItems="start" minHeight={140}>
          <Typography variant="body1">
          We suggest running your insight tool on a <Link href='https://docs.pingcap.com/tidb/dev/explore-htap?utm_source=ossinsight&utm_medium=referral' target='_blank'>Hybrid Transactional and Analytical Processing (HTAP)</Link> database like <Link href='https://www.pingcap.com/tidb-cloud/?utm_source=ossinsight&utm_medium=referral' target='_blank'> TiDB Cloud</Link>.
          </Typography>
          <Button variant="contained" color="primary" component={Link} rel='noopener' href="/blog/why-we-choose-tidb-to-support-ossinsight" target='_link'>
          📖 Learn why we chose TiDB to support OSS Insight
          </Button>
          <Button variant="contained" color="primary" component={Link} rel='noopener' href="https://www.pingcap.com/developers/?utm_source=ossinsight&utm_medium=referral" target='_link'>
          🚀 Check out TiDB demos and tutorials
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}

const Card = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(4),
  borderRadius: theme.spacing(0.75),
  border: '1px solid rgba(124, 124, 124, 0.3)',
  minHeight: 204,
}));

const List = styled('ul')(({ theme }) => ({
  padding: 0,
  margin: 0,
  listStyle: 'none',
}));

const ListItem = styled((props: StackProps<'li'>) => <Stack {...props} component="li" />)(({ theme }) => ({
  margin: 0,
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
}));
